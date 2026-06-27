#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const REQUIRED_GOAL_FIELDS = ["id", "intent", "mode", "completion", "quality_gates"];
const FALLBACK_DANGEROUS_PATTERNS = [
  "rm -rf",
  "sudo",
  "chmod -R",
  "chown -R",
  "curl * | sh",
  "wget * | sh",
  "deploy",
  "terraform apply",
  "kubectl apply"
];

function harnessRoot() {
  return process.env.AI_HARNESS_HOME || path.join(os.homedir(), ".ai-harness");
}

function findProjectRoot(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(current, ".harness", "goal.yaml"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function hasTopLevelYamlKey(content, key) {
  return new RegExp(`^${key}:`, "m").test(content);
}

function validateGoal(content) {
  const missing = REQUIRED_GOAL_FIELDS.filter((field) => !hasTopLevelYamlKey(content, field));
  return { valid: missing.length === 0, missing };
}

function extractProjectGateNames(goalText) {
  const lines = goalText.split("\n");
  const names = [];
  let inProject = false;

  for (const line of lines) {
    if (/^\s{2}project:\s*$/.test(line)) {
      inProject = true;
      continue;
    }

    if (inProject) {
      if (/^\s{0,2}\S/.test(line) && !/^\s{4}-\s+/.test(line)) break;
      const item = line.match(/^\s{4}-\s+(.+)\s*$/);
      if (item) names.push(item[1].trim());
    }
  }

  return names;
}

function parseQualityGates(qualityText) {
  const gates = new Map();
  const lines = qualityText.split("\n");
  let current = null;

  for (const line of lines) {
    const gateMatch = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (gateMatch) {
      current = { name: gateMatch[1], description: "", command: "" };
      gates.set(current.name, current);
      continue;
    }

    if (!current) continue;

    const description = line.match(/^\s+description:\s*(.*)$/);
    if (description) {
      current.description = stripQuotes(description[1].trim());
      continue;
    }

    const command = line.match(/^\s+command:\s*(.*)$/);
    if (command) {
      current.command = stripQuotes(command[1].trim());
    }
  }

  return gates;
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function extractYamlList(content, key) {
  const lines = content.split("\n");
  const values = [];
  let inList = false;
  const keyIndent = (() => {
    const line = lines.find((candidate) => candidate.trim() === `${key}:`);
    return line ? line.search(/\S/) : -1;
  })();

  if (keyIndent === -1) return values;

  for (const line of lines) {
    if (line.trim() === `${key}:`) {
      inList = true;
      continue;
    }

    if (!inList) continue;

    const indent = line.search(/\S/);
    if (indent !== -1 && indent <= keyIndent && !line.trim().startsWith("-")) break;

    const item = line.match(/^\s*-\s+(.+)\s*$/);
    if (item) values.push(stripQuotes(item[1].trim()));
  }

  return values;
}

function globishToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\s+/g, "\\s+");
  return new RegExp(escaped);
}

function loadDangerousPatterns() {
  const safetyPath = path.join(harnessRoot(), "core", "safety.yaml");
  if (!fs.existsSync(safetyPath)) return FALLBACK_DANGEROUS_PATTERNS.map(globishToRegex);

  const safetyText = readText(safetyPath);
  const configured = extractYamlList(safetyText, "require_approval_patterns");
  const patterns = configured.length > 0 ? configured : FALLBACK_DANGEROUS_PATTERNS;
  return patterns.map(globishToRegex);
}

function isDangerousCommand(command) {
  return loadDangerousPatterns().some((pattern) => pattern.test(command));
}

function summarize(text, maxLength = 1600) {
  const cleaned = String(text || "").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength)}\n… truncated …`;
}

function safeStatePath(projectRoot) {
  const harnessDir = path.resolve(projectRoot, ".harness");
  const statePath = path.resolve(harnessDir, "state.json");
  if (!statePath.startsWith(`${harnessDir}${path.sep}`)) {
    throw new Error(`Refusing to write outside .harness: ${statePath}`);
  }
  return statePath;
}

function updateState(projectRoot, result) {
  const statePath = safeStatePath(projectRoot);
  let previous = {};
  if (fs.existsSync(statePath)) {
    try {
      previous = JSON.parse(readText(statePath));
    } catch {
      previous = {};
    }
  }

  const next = {
    ...previous,
    verification_status: result.pass ? "pass" : "fail",
    last_result: result,
    status: result.pass ? previous.status ?? "in_progress" : "failed",
    updated_at: new Date().toISOString()
  };

  fs.writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

function main() {
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error("No .harness/goal.yaml found in current directory or parents.");
    process.exit(2);
  }

  const goalPath = path.join(projectRoot, ".harness", "goal.yaml");
  const qualityPath = path.join(projectRoot, ".harness", "quality-gates.yaml");

  if (!fs.existsSync(qualityPath)) {
    console.error(`Missing quality gates file: ${qualityPath}`);
    process.exit(2);
  }

  const goalText = readText(goalPath);
  const validation = validateGoal(goalText);
  if (!validation.valid) {
    console.error(`Invalid goal file. Missing: ${validation.missing.join(", ")}`);
    process.exit(2);
  }

  const requiredGateNames = extractProjectGateNames(goalText);
  const gates = parseQualityGates(readText(qualityPath));
  const selected = requiredGateNames.length > 0 ? requiredGateNames : [...gates.keys()];
  const results = [];

  for (const gateName of selected) {
    const gate = gates.get(gateName);
    if (!gate) {
      results.push({ gate: gateName, pass: false, error: "Gate not found in .harness/quality-gates.yaml" });
      continue;
    }

    if (!gate.command) {
      results.push({ gate: gateName, pass: false, error: "Gate has no command" });
      continue;
    }

    if (isDangerousCommand(gate.command)) {
      results.push({ gate: gateName, command: gate.command, pass: false, refused: true, error: "Command refused by safety policy" });
      continue;
    }

    const completed = spawnSync(gate.command, {
      cwd: projectRoot,
      shell: true,
      encoding: "utf8",
      timeout: 120000
    });

    results.push({
      gate: gateName,
      description: gate.description,
      command: gate.command,
      exitCode: completed.status,
      pass: completed.status === 0,
      stdout: summarize(completed.stdout),
      stderr: summarize(completed.stderr)
    });
  }

  const summary = {
    projectRoot,
    pass: results.length > 0 && results.every((result) => result.pass),
    requiredGates: selected,
    results,
    checkedAt: new Date().toISOString()
  };

  updateState(projectRoot, summary);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.pass ? 0 : 1);
}

main();
