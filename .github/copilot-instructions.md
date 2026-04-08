# Copilot Instructions — React Checkers

A single-player Checkers game (human vs. AI) built with React 19, TypeScript, and Vite.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview the production build
```

There is no test suite.

## Architecture

All game logic is pure functions (no side effects) living outside React:

| File | Responsibility |
|------|---------------|
| `src/types.ts` | Shared types: `Board`, `Piece`, `Player`, `Move`, `Position`, `GameStatus` |
| `src/gameLogic.ts` | Move generation, jump chaining, board mutation, game status |
| `src/ai.ts` | Minimax with alpha-beta pruning (`getBestMove`) |
| `src/components/Board.tsx` | Pure presentational 8×8 grid component |
| `src/App.tsx` | All React state; orchestrates player input and AI turns |

**Data flow:**
1. `App.tsx` holds all mutable state (`board`, `currentPlayer`, `selectedPos`, `validMoves`, `gameStatus`, `isThinking`).
2. On the human's turn, clicks route through `handleSquareClick` → `getValidMovesForPiece` → `applyMove`.
3. On the AI's turn, a `useEffect` fires `getBestMove` inside a `setTimeout(400ms)` to give the UI time to update, then calls `applyMove`.
4. `Board.tsx` receives board state and callbacks as props; it renders nothing about game rules itself.

## Key Conventions

- **Board is `(Piece | null)[][]`** — 8 rows × 8 cols, row 0 is the top (black's back row), row 7 is the bottom (red's back row).
- **Red moves up (decreasing row), black moves down (increasing row).** Kings move both directions.
- **Mandatory jump rule is enforced in `getValidMovesForPlayer`**: if any jump exists for the active player, only jump moves are returned (simple moves are excluded entirely).
- **Multi-jump chains** are built recursively in `getJumpsFromPos`; a piece that would become a king mid-jump ends its turn immediately.
- **`applyMove` is the only place kingship is granted** — after placing the piece on its destination row.
- **AI evaluates from red's perspective** (positive = red advantage). `minimax` maximizes for red and minimizes for black. `getBestMove` shuffles moves before evaluating to break ties randomly.
- Board cloning uses shallow row copies (`board.map(row => [...row])`); pieces are plain objects and are spread when mutated.
- CSS class composition in components uses an array `.filter(Boolean).join(' ')` pattern.
- The `Board` component uses `role="grid"` / `role="gridcell"` for accessibility.
