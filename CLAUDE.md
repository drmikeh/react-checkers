# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Type-check + production build (tsc -b && vite build)
npm run lint         # Run ESLint
npm run test         # Run Vitest in watch mode
npm run test:ci      # Run Vitest once (non-interactive)
npm run preview      # Preview the production build
```

To run a single test file:
```bash
npx vitest run src/reducer.test.ts
```

## Architecture

This is a single-player React checkers game (human as Red vs. computer as Black). The code is split into four distinct layers:

### Pure logic (no React)
- **`src/types.ts`** — Shared TypeScript types: `Board`, `Piece`, `Player`, `Position`, `Move`, `GameStatus`.
- **`src/gameLogic.ts`** — All move generation and validation. Key exports: `createInitialBoard`, `getValidMovesForPlayer`, `getValidMovesForPiece`, `applyMove`, `getGameStatus`, `countPieces`. Enforces mandatory-jump rule: if any jump is available, only jump moves are returned.
- **`src/ai.ts`** — Minimax AI with alpha-beta pruning at depth 5. `getBestMove(board, depth)` returns the best move for Black. Positive scores favor Red; negative scores favor Black.

### State management
- **`src/reducer.ts`** — `gameReducer` + `GameState` + `Action` union type. Handles five actions: `SQUARE_CLICK`, `AI_START_THINKING`, `AI_MOVE`, `UNDO`, `RESTART`. The `history` array of `Snapshot` objects enables unlimited undo. Undo always restores `currentPlayer` to `'red'`.

### React UI
- **`src/App.tsx`** — Wires state via `useReducer(gameReducer, initialState)`. A `useEffect` triggers the AI move (with 400ms delay) whenever `currentPlayer === 'black'` and the game is still playing.
- **`src/components/Board.tsx`** — Pure presentational component. Receives board state and dispatches `onSquareClick` events up to App.

### Data flow
User click → `App` dispatches `SQUARE_CLICK` → `gameReducer` updates selection or applies move → if move applied, turn switches to Black → `useEffect` fires → `AI_START_THINKING` dispatched → `getBestMove` called → `AI_MOVE` dispatched → turn returns to Red.

## Key invariants
- Only dark squares `(row + col) % 2 === 1` are playable. Black pieces start rows 0–2; Red pieces start rows 5–7.
- `getValidMovesForPlayer` returns only jump moves when any jump exists (mandatory jump rule).
- `applyMove` is immutable — it clones the board before modifying.
- Kings are promoted in `applyMove` (reaching row 0 for Red, row 7 for Black). A piece that reaches the king row during a jump ends its turn immediately.
- Tests live in `src/reducer.test.ts` using Vitest; test environment is `happy-dom`.
