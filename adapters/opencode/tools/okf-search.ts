// Placeholder OpenCode custom tool: search OKF markdown files.
// Implementation target: read from ~/.ai-harness/okf and return ranked paths/snippets.

export async function okfSearch(query: string) {
  return {
    query,
    status: "not_implemented",
    next: "Implement filesystem search over ~/.ai-harness/okf/**/*.md"
  };
}
