# /work-goal

Run the bounded Work Until Goal playbook.

Expected behavior:
1. Read `.harness/goal.yaml`.
2. Read `.harness/quality-gates.yaml`.
3. Read global `core/modes.yaml`, `core/router.yaml`, and `core/safety.yaml`.
4. Search OKF for relevant playbooks and concepts.
5. Work one cycle.
6. Run verification.
7. Update `.harness/state.json`.
8. Stop or continue according to the completion contract.
