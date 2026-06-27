// Minimal OpenCode goal-loop adapter placeholder.
//
// This repo does not yet pin an OpenCode plugin API contract, so the first
// operational implementation is tool/script driven rather than event-hook driven.
//
// Operational flow used by /work-goal:
// 1. Read project goal with adapters/opencode/tools/goal-state.ts.
// 2. Read relevant OKF context with adapters/opencode/tools/okf-search.ts.
// 3. Perform one bounded work cycle.
// 4. Run scripts/run-quality-gates.mjs.
// 5. Update .harness/state.json with evidence.
// 6. Stop when verified complete, blocked, or max cycles are reached.
//
// Future work: replace or augment this documented flow with concrete OpenCode
// plugin hooks after the plugin API is pinned and tested in this repo.

export default function goalLoopPlugin() {
  return {
    name: "ai-harness-goal-loop",
    status: "documented_flow",
    verifier: "scripts/run-quality-gates.mjs"
  };
}
