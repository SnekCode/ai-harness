# AI Harness

Private, portable AI harness baseline for local and frontier model workflows.

## Intent

This repo is the durable source of truth for global AI harness rules, OKF knowledge, adapter configuration, tools, plugins, playbooks, and evaluation scaffolding.

OpenCode is the first baseline runtime. Other harness tools can be added through adapters without changing the core harness model.

## Design Principles

- Own the harness; swap the model.
- Keep global config global and project truth project-local.
- Use OKF Markdown as durable knowledge, playbooks, decisions, and lessons.
- Use explicit goal files and completion contracts instead of chat-history memory.
- Let agents propose completion; let the harness verify completion.
- Keep secrets out of Git.
- Keep scratch state out of Git.

## First Install

```bash
git clone git@github.com:SnekCode/ai-harness.git ~/.ai-harness
cd ~/.ai-harness
./scripts/install.sh
```

## Project Attach

From inside a project repo:

```bash
~/.ai-harness/scripts/init-project.sh
```

This creates local, project-owned harness files. It does not overwrite existing project instructions.

## Structure

```text
core/                    Global schemas, modes, router, safety policy
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
