# Work Until Goal Eval

Purpose: prove the harness can pursue a bounded goal, run checks, update state, and refuse to close the goal until completion gates pass.

## Fixture

`fixture-js-add/` is a tiny JavaScript project with one failing test and a missing implementation.

The goal requires:

1. Implement the missing `add(a, b)` function.
2. Pass a syntax/type-style check with `node --check`.
3. Pass the Node test suite.

## Run

From this directory:

```bash
cd fixture-js-add
npm test
```

The test should fail before implementation.

Run the harness quality gates from inside the fixture:

```bash
../../../scripts/run-quality-gates.mjs
```

Expected initial result: fail.

After implementing `src/add.js`, run again. Expected result: pass.

## Acceptance Rule

The harness must not claim the goal is complete until `scripts/run-quality-gates.mjs` reports all configured gates passing.
