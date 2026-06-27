import fs from "node:fs";
import path from "node:path";

type GoalStatePatch = {
  cycle?: number;
  lastAction?: string;
  verificationStatus?: "not_run" | "pass" | "fail" | "blocked";
  blockedReason?: string | null;
  status?: "not_started" | "in_progress" | "complete" | "blocked" | "failed";
  lastResult?: unknown;
};

const REQUIRED_GOAL_FIELDS = ["id", "intent", "mode", "completion", "quality_gates"];

function findProjectRoot(startDir = process.cwd()): string | null {
  let current = path.resolve(startDir);

  while (true) {
    if (fs.existsSync(path.join(current, ".harness", "goal.yaml"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function readJsonFile(filePath: string): Record<string, unknown> | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return {
      parse_error: error instanceof Error ? error.message : String(error)
    };
  }
}

function parseTopLevelYamlValue(content: string, key: string): string | undefined {
  const match = content.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return match?.[1]?.trim().replace(/^['\"]|['\"]$/g, "");
}

function hasTopLevelYamlKey(content: string, key: string): boolean {
  return new RegExp(`^${key}:`, "m").test(content);
}

function validateGoal(content: string) {
  const missing = REQUIRED_GOAL_FIELDS.filter((field) => !hasTopLevelYamlKey(content, field));
  return {
    valid: missing.length === 0,
    missing
  };
}

function defaultState(goalId: string | undefined) {
  return {
    goal_id: goalId ?? null,
    status: "not_started",
    cycle: 0,
    verification_status: "not_run",
    last_action: null,
    last_result: null,
    blocked_reason: null,
    updated_at: null
  };
}

function assertProjectHarnessPath(projectRoot: string, targetPath: string) {
  const harnessDir = path.resolve(projectRoot, ".harness");
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(`${harnessDir}${path.sep}`) && resolved !== harnessDir) {
    throw new Error(`Refusing to write outside project .harness directory: ${resolved}`);
  }
}

export async function readGoalState(startDir = process.cwd()) {
  const projectRoot = findProjectRoot(startDir);
  if (!projectRoot) {
    return {
      status: "error",
      error: "No .harness/goal.yaml found in current directory or parents"
    };
  }

  const harnessDir = path.join(projectRoot, ".harness");
  const goalPath = path.join(harnessDir, "goal.yaml");
  const statePath = path.join(harnessDir, "state.json");
  const goalText = fs.readFileSync(goalPath, "utf8");
  const validation = validateGoal(goalText);
  const goalId = parseTopLevelYamlValue(goalText, "id");
  const intent = parseTopLevelYamlValue(goalText, "intent");
  const mode = parseTopLevelYamlValue(goalText, "mode");
  const existingState = readJsonFile(statePath);

  return {
    status: validation.valid ? "ok" : "invalid_goal",
    projectRoot,
    harnessDir,
    goalPath,
    statePath,
    goal: {
      id: goalId,
      intent,
      mode,
      valid: validation.valid,
      missing: validation.missing,
      raw: goalText
    },
    state: existingState ?? defaultState(goalId)
  };
}

export async function updateGoalState(patch: GoalStatePatch, startDir = process.cwd()) {
  const current = await readGoalState(startDir);
  if (current.status === "error") return current;

  const statePath = current.statePath;
  assertProjectHarnessPath(current.projectRoot, statePath);

  const previous = typeof current.state === "object" && current.state !== null ? current.state : {};
  const next = {
    ...previous,
    goal_id: current.goal.id ?? (previous as Record<string, unknown>).goal_id ?? null,
    status: patch.status ?? (previous as Record<string, unknown>).status ?? "in_progress",
    cycle: patch.cycle ?? (previous as Record<string, unknown>).cycle ?? 0,
    verification_status:
      patch.verificationStatus ?? (previous as Record<string, unknown>).verification_status ?? "not_run",
    last_action: patch.lastAction ?? (previous as Record<string, unknown>).last_action ?? null,
    last_result: patch.lastResult ?? (previous as Record<string, unknown>).last_result ?? null,
    blocked_reason:
      patch.blockedReason === undefined
        ? (previous as Record<string, unknown>).blocked_reason ?? null
        : patch.blockedReason,
    updated_at: new Date().toISOString()
  };

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");

  return {
    status: "ok",
    projectRoot: current.projectRoot,
    statePath,
    state: next
  };
}

export async function goalState(action: "read" | "update" = "read", patch: GoalStatePatch = {}) {
  if (action === "update") return updateGoalState(patch);
  return readGoalState();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [action = "read", patchJson = "{}"] = process.argv.slice(2);
  const patch = JSON.parse(patchJson);
  goalState(action as "read" | "update", patch)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
