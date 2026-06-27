# AI Harness

Private, portable AI harness baseline for local and frontier model workflows.

## Intent

This repo is the durable source of truth for global AI harness rules, OKF knowledge, adapter configuration, skills, tools, plugins, playbooks, and evaluation scaffolding.

OpenCode is the first baseline runtime. Other harness tools can be added through adapters without changing the core harness model.

## Design Principles

- Own the harness; swap the model.
- Keep global config global and project truth project-local.
- Use skills for reusable model-readable procedures.
- Use tools/plugins for deterministic execution and enforcement.
- Use OKF Markdown as durable knowledge, playbooks, decisions, and lessons.
- Use explicit goal files and completion contracts instead of chat-history memory.
- Let agents propose completion; let the harness verify completion.
- Keep secrets out of Git.
- Keep scratch state out of Git.

## First Install

```bash
git clone git@github.com:SnekCode/ai-harness.git ~/.ai-harness
cd ~/.ai-harness
chmod +x scripts/*.sh scripts/*.mjs
./scripts/install.sh
```

## Project Attach

From inside a project repo:

```bash
~/.ai-harness/scripts/init-project.sh
```

This creates local, project-owned harness files. It does not overwrite existing project instructions.

## Minimal Work-Until-Goal Flow

From a project with `.harness/goal.yaml` and `.harness/quality-gates.yaml`:

```bash
~/.ai-harness/scripts/run-quality-gates.mjs
```

The OpenCode `/work-goal` command documents the current operational loop:

1. Read project goal state.
2. Search only relevant OKF files.
3. Do one bounded work cycle.
4. Run quality gates.
5. Update `.harness/state.json`.
6. Stop only when verified complete, blocked, or cycle-limited.

## OKF Search

The OpenCode OKF search tool is implemented at:

```text
adapters/opencode/tools/okf-search.ts
```

It searches local Markdown files under `~/.ai-harness/okf/**/*.md` and returns bounded ranked snippets instead of loading the whole OKF bundle.

## Current Implementation Status

Implemented:

- Global `AGENTS.md` entry point.
- Project goal-state reader/updater.
- Local OKF search.
- Quality-gate runner.
- Runnable work-until-goal eval fixture.

Still placeholder or early:

- Advanced OpenCode plugin hooks.
- Full adapter support for Claude Code, Codex, and Gemini.
- Model/provider routing values.

## Structure

```text
core/                    Global schemas, modes, router, safety policy
skills/                  Reusable model-readable procedures
okf/                     Durable OKF knowledge bundle
adapters/opencode/       OpenCode-specific config, tools, plugins, commands, agents
adapters/claude-code/    Claude Code adapter placeholders
adapters/codex/          Codex adapter placeholders
adapters/gemini/         Gemini adapter placeholders
scripts/                 Install, symlink, bootstrap, and validation scripts
templates/               Project bootstrap templates
patterns/                Reference notes from SAFe and other harness patterns
evals/                   Harness evaluation scenarios
```
