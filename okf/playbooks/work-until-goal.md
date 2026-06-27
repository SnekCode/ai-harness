---
type: playbook
title: Work Until Goal
description: Bounded autonomous workflow for pursuing a goal until completion gates pass or the task blocks.
tags: [goal, autonomous, workflow]
updated: 2026-06-27
---

# Work Until Goal

Use this playbook when a goal has objective completion criteria and project-level quality gates.

## Loop

1. Read the active goal file.
2. Load relevant global rules and project policy.
3. Search OKF for relevant concepts and playbooks.
4. Plan the next bounded work cycle.
5. Execute only permitted actions.
6. Run configured completion checks.
7. Update project state.
8. If completion gates pass, stop.
9. If blocked, stop and report the blocker.
10. If not complete and cycle limit remains, continue.

## Rule

The agent proposes completion. The verifier closes the goal.
