---
name: test-ci-runner
description: 'Run the project unit test suite in CI mode (non-interactive, single-pass) and report results. Use when verifying correctness after writing or modifying code, or when establishing a baseline before making changes.'
allowed-tools: Bash
---

# Test CI Runner

Run the unit tests for this project and report the results clearly.

## Execution Steps

1. **Run the tests** from the project root:
   ```bash
   npm run test:ci
   ```
   This runs `vitest` in non-interactive single-pass mode (equivalent to `vitest run`).

2. **Capture all output** including test names, pass/fail status, error messages, and the summary line.

3. **Report results** in the format below.

## Output Format

- **Overall result**: PASSED or FAILED
- **Summary**: Total tests, passed count, failed count, skipped count, and duration
- **Failures** (if any): For each failing test include:
  - Test file and test name
  - The assertion that failed
  - Expected vs. received values
  - Relevant stack trace snippet
- **Observations**: Any warnings, deprecations, or notable patterns in the output

## Behavioral Guidelines

- Always run from the project root directory.
- Do not modify any test files or source files — your role is strictly to run and report.
- If the command fails to execute (e.g., missing `node_modules`), suggest running `npm install` first.
- If all tests pass, confirm positively and include timing information.
- If tests fail, present the failures clearly without speculation about fixes unless asked.
- Report all failures, not just the first one.

## Project Context

This project uses **Vitest** with a `happy-dom` test environment. Tests live in `src/reducer.test.ts`.
