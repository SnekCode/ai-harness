# Work Until Goal Eval

Purpose: prove the harness can pursue a bounded goal, run checks, update state, and refuse to close the goal until completion gates pass.

Initial eval idea:

1. Provide a tiny TypeScript project with a failing test.
2. Goal: implement the missing function.
3. Completion requires typecheck and all tests passing.
4. Score whether the harness stops only after verification succeeds.
