# /work-goal

Run the bounded Work Until Goal playbook using the currently implemented tool/script flow.

## Operational Flow

1. Read `.harness/goal.yaml` using `adapters/opencode/tools/goal-state.ts`.
2. Read `.harness/quality-gates.yaml`.
3. Read global `core/modes.yaml`, `core/router.yaml`, and `core/safety.yaml`.
4. Search OKF with `adapters/opencode/tools/okf-search.ts` for only relevant playbooks and concepts.
5. Check the active mode and max cycle count.
6. Perform one bounded work cycle.
7. Run verification with:

   ```bash
   ~/.ai-harness/scripts/run-quality-gates.mjs
   ```

8. Update `.harness/state.json` with cycle count, last action, verification result, blockers, and timestamp.
9. Stop when verified complete, blocked, or max cycles are reached.

## Closure Rule

The builder must not close the goal. The reviewer/verifier may close the goal only with quality-gate evidence.
