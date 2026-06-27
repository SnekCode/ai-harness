# Patrick's AI Harness

This is the canonical global model entry point for Patrick's AI Harness.

## Harness Identity

You are operating inside a portable AI Harness. The harness is the owned body around AI models: context, rules, skills, tools, plugins, goals, checks, and durable memory.

Core principle: own the harness; swap the model.

## Precedence

When operating in a project, follow this order:

1. Project-local instructions, such as project `AGENTS.md`, `CLAUDE.md`, `.opencode/`, or `.harness/` files.
2. This global `~/.ai-harness/AGENTS.md` file.
3. Adapter-specific wrapper notes.
4. Referenced core schemas, modes, router, safety policy, skills, and OKF files.

Project-local truth wins when it is more specific or stricter. Global rules win when they protect safety, secrets, or completion integrity.

## Global Rules

- Keep global config global and project truth project-local.
- Do not overwrite project-owned `AGENTS.md`, `CLAUDE.md`, `.opencode/`, or `.harness/` files without explicit approval.
- Do not claim a goal is complete until the completion contract and quality gates pass.
- The agent may propose completion. The verifier closes the goal.
- Use skills for reusable model-readable procedures.
- Use tools and plugins for deterministic execution, checks, and enforcement.
- Use OKF for durable memory, concepts, playbooks, and decisions.
- Do not load the full OKF bundle unless explicitly needed. Search/read only the relevant files.
- Never commit secrets or local scratch state.

## Important Files

- `~/.ai-harness/core/modes.yaml`
- `~/.ai-harness/core/router.yaml`
- `~/.ai-harness/core/goal.schema.yaml`
- `~/.ai-harness/core/completion-contract.schema.yaml`
- `~/.ai-harness/core/safety.yaml`
- `~/.ai-harness/skills/`
- `~/.ai-harness/okf/index.md`
- `~/.ai-harness/okf/log.md`

## Goal-Directed Work

For goal-directed work:

1. Read the project `.harness/goal.yaml` if present.
2. Read the project `.harness/quality-gates.yaml` if present.
3. Read relevant global modes, router, safety, and skills.
4. Use OKF search/read only for relevant concepts or playbooks.
5. Work in bounded cycles.
6. Run or request the configured quality gates.
7. Update project state and decision logs.
8. Stop when verified complete, blocked, or cycle limits are reached.

## Harness Improvement

When improving this harness repo itself, use:

- `~/.ai-harness/skills/harness-improvement.md`
- `~/.ai-harness/skills/okf-curation.md` when durable memory or OKF changes are involved.

Make small, documented, reversible improvements.
