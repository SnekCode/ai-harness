import fs from "node:fs";
import os from "node:os";
import path from "node:path";

type OkfSearchOptions = {
  root?: string;
  limit?: number;
};

type OkfSearchResult = {
  path: string;
  relativePath: string;
  score: number;
  title?: string;
  type?: string;
  tags?: string[];
  snippet: string;
};

const DEFAULT_LIMIT = 8;

function defaultHarnessRoot(): string {
  return process.env.AI_HARNESS_HOME || path.join(os.homedir(), ".ai-harness");
}

function walkMarkdownFiles(dir: string, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

function parseFrontMatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (key) data[key] = value;
  }
  return data;
}

function parseTags(raw?: string): string[] | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/^\[/, "").replace(/\]$/, "");
  return cleaned
    .split(",")
    .map((tag) => tag.trim().replace(/^['\"]|['\"]$/g, ""))
    .filter(Boolean);
}

function firstHeading(content: string): string | undefined {
  const heading = content.match(/^#\s+(.+)$/m);
  return heading?.[1]?.trim();
}

function makeSnippet(content: string, terms: string[], length = 220): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();
  const firstHit = terms
    .map((term) => lower.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  const start = Math.max(0, (firstHit ?? 0) - 60);
  const snippet = normalized.slice(start, start + length);
  return `${start > 0 ? "…" : ""}${snippet}${start + length < normalized.length ? "…" : ""}`;
}

function scoreFile(filePath: string, content: string, terms: string[]): number {
  const frontMatter = parseFrontMatter(content);
  const headingText = [...content.matchAll(/^#+\s+(.+)$/gm)].map((m) => m[1]).join(" ").toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();
  const frontMatterText = Object.values(frontMatter).join(" ").toLowerCase();
  const bodyText = content.replace(/^---\n[\s\S]*?\n---/, "").toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (fileName.includes(term)) score += 8;
    if (frontMatterText.includes(term)) score += 6;
    if (headingText.includes(term)) score += 5;
    const bodyHits = bodyText.split(term).length - 1;
    score += Math.min(bodyHits, 5);
  }

  return score;
}

export async function okfSearch(query: string, options: OkfSearchOptions = {}) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      query,
      status: "error",
      error: "query is required",
      results: [] as OkfSearchResult[]
    };
  }

  const harnessRoot = options.root || defaultHarnessRoot();
  const okfRoot = path.join(harnessRoot, "okf");
  const limit = Math.max(1, Math.min(options.limit ?? DEFAULT_LIMIT, 25));
  const terms = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);

  if (!fs.existsSync(okfRoot)) {
    return {
      query: trimmedQuery,
      status: "error",
      error: `OKF root not found: ${okfRoot}`,
      results: [] as OkfSearchResult[]
    };
  }

  const results = walkMarkdownFiles(okfRoot)
    .map((filePath) => {
      const content = fs.readFileSync(filePath, "utf8");
      const frontMatter = parseFrontMatter(content);
      const score = scoreFile(filePath, content, terms);
      if (score <= 0) return null;

      return {
        path: filePath,
        relativePath: path.relative(okfRoot, filePath),
        score,
        title: frontMatter.title || firstHeading(content),
        type: frontMatter.type,
        tags: parseTags(frontMatter.tags),
        snippet: makeSnippet(content, terms)
      } satisfies OkfSearchResult;
    })
    .filter((result): result is OkfSearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.relativePath.localeCompare(b.relativePath))
    .slice(0, limit);

  return {
    query: trimmedQuery,
    status: "ok",
    okfRoot,
    count: results.length,
    results
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv.slice(2).join(" ");
  okfSearch(query)
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
