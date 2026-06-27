# OpenCode Adapter

OpenCode is the first runtime adapter for this harness.

## Entry Point

Global model entry point:

```text
~/.ai-harness/AGENTS.md
```

OpenCode adapter entry after install:

```text
~/.config/opencode/AGENTS.md
```

## Implemented Pieces

- `tools/okf-search.ts` searches bounded OKF Markdown snippets.
- `tools/goal-state.ts` reads and updates project `.harness/state.json` safely.
- `commands/work-goal.md` documents the minimal operational work-until-goal loop.
- `commands/improve-harness.md` points agents at the harness improvement skill.

## Verification

Quality gates are currently enforced through:

```bash
~/.ai-harness/scripts/run-quality-gates.mjs
```

This avoids depending on undocumented plugin behavior until the OpenCode plugin API is pinned and tested in this repo.

## Still Placeholder

- `plugins/goal-loop.ts` is a documented-flow placeholder, not a full runtime hook implementation yet.
- `plugins/okf-context.ts` is still early and should eventually call or expose OKF search behavior.
