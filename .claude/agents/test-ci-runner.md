---
name: "test-ci-runner"
description: "Use this agent when you need to run the project's unit tests using the 'test:ci' script. This agent should be invoked after writing or modifying code to verify correctness.\\n\\n<example>\\nContext: The user has just written a new reducer action or modified game logic in the checkers project.\\nuser: \"I've updated the UNDO action in the reducer to also reset the selected piece\"\\nassistant: \"Great, I've made those changes to the reducer. Let me now use the test-ci-runner agent to verify everything passes.\"\\n<commentary>\\nSince code was modified, use the Agent tool to launch the test-ci-runner agent to run the test suite and confirm nothing is broken.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: The user wants to verify the current state of the codebase before making changes.\\nuser: \"Before we refactor gameLogic.ts, let's make sure all tests are passing\"\\nassistant: \"Good idea. I'll use the test-ci-runner agent to run the full test suite first.\"\\n<commentary>\\nThe user wants a baseline test run before refactoring, so use the Agent tool to launch the test-ci-runner agent.\\n</commentary>\\n</example>"
tools: Glob, Grep, Read, WebFetch, WebSearch, Bash
model: sonnet
color: yellow
---

Use the `test-ci-runner` skill to run the project's unit tests and report results.
