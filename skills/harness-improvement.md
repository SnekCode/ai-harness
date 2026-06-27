---
type: skill
title: Harness Improvement
description: Procedure for safely improving the AI harness itself without corrupting global rules, OKF memory, or adapter behavior.
tags: [ai-harness, skill, maintenance, self-improvement]
updated: 2026-06-27
---

# Harness Improvement Skill

Use this skill when changing the AI Harness repo itself.

## Purpose

Improve the harness deliberately, with evidence, small changes, and rollback safety.

## Required Inputs

- The requested improvement or observed problem.
- Current repo state.
- Relevant files from `core/`, `skills/`, `okf/`, `adapters/`, `scripts/`, `templates/`, and `evals/`.
- Any applicable OKF concepts or playbooks.

## Process

1. **Classify the change.**
   - Core schema or policy
   - Skill/playbook
   - Adapter implementation
   - Tool/plugin
   - Script/install behavior
   - Project template
   - Eval/test fixture
   - OKF durable memory

2. **State the intent.**
   - What problem is being solved?
   - Who or what benefits?
   - What should remain unchanged?

3. **Check boundaries.**
   - Do not weaken global safety silently.
   - Do not mix scratch runtime state into durable OKF concepts.
   - Do not add provider/model-specific assumptions to core files unless routed through `core/router.yaml` or an adapter.
   - Do not overwrite project-owned conventions from global config.

4. **Make the smallest coherent change.**
   - Prefer one concept, one skill, one tool, or one schema update at a time.
   - Keep OpenCode-specific code under `adapters/opencode/`.
   - Keep vendor-neutral procedures under `skills/` or `okf/playbooks/`.

5. **Update documentation.**
   - If behavior changes, update `README.md` or the nearest local README.
   - If the change teaches the harness something durable, add an OKF inbox note or concept update.

6. **Evaluate.**
   - Run any available eval or describe the missing eval.
   - If no eval exists, consider adding one under `evals/`.

7. **Record the decision.**
   - Summarize what changed and why.
   - Note known risks or follow-up work.

## Completion Criteria

A harness improvement is complete only when:

- The change is scoped and understandable.
- Safety boundaries are preserved.
- Relevant docs or OKF files are updated.
- Any available checks/evals pass, or missing evals are explicitly noted.
- Follow-up work is captured.

## Anti-Patterns

- Adding a new agent before a repeated need is proven.
- Baking model names into global concepts.
- Letting adapter-specific details leak into core policy.
- Treating raw logs as durable knowledge.
- Declaring the harness improved without a before/after reason.
