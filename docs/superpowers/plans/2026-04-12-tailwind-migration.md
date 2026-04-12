# Tailwind CSS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all plain CSS in `src/App.css` and `src/index.css` with Tailwind v4 utility classes, delete `App.css`, and modernize the app's design while preserving dark mode.

**Architecture:** Install Tailwind v4 via its Vite plugin (no config file needed). Migrate all layout, color, and spacing classes to Tailwind utilities inline in JSX. Keep a minimal `index.css` only for styles that can't be expressed as Tailwind utilities: the board's `--sq` CSS custom property, piece radial gradients, the selected-piece glow, and the winner pop animation.

**Tech Stack:** Tailwind CSS v4, `@tailwindcss/vite`, `clsx` (for conditional class composition in Board.tsx)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `tailwindcss`, `@tailwindcss/vite`, `clsx` as deps |
| `vite.config.ts` | Modify | Add `@tailwindcss/vite` plugin |
| `src/index.css` | Rewrite | `@import "tailwindcss"` + retained CSS block (`.board-wrapper` sets `--sq`) |
| `src/App.tsx` | Modify | Remove CSS import; replace all class names with Tailwind utilities |
| `src/components/Board.tsx` | Modify | Import `clsx`; replace class-join pattern; replace class names |
| `src/App.css` | Delete | Fully replaced by Tailwind utilities |

---

### Task 1: Install packages and wire up Tailwind v4

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Install Tailwind v4 packages**

```bash
npm install tailwindcss @tailwindcss/vite clsx
```

Expected: packages appear in `node_modules`, `package.json` updated.

- [ ] **Step 2: Add Tailwind plugin to vite.config.ts**

Replace the full contents of `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 3: Start dev server to confirm Vite still compiles**

```bash
npm run dev
```

Expected: server starts at `http://localhost:5173` with no errors. App is styled with existing CSS (we haven't changed any CSS yet).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "chore: install tailwindcss v4, @tailwindcss/vite, clsx"
```

---

### Task 2: Replace `src/index.css`

**Files:**
- Rewrite: `src/index.css`

`index.css` will be the only CSS file after migration. It activates Tailwind and retains the small set of styles that Tailwind utilities can't express cleanly.

- [ ] **Step 1: Replace the full contents of `src/index.css`**

```css
@import "tailwindcss";

/* ─── Board square size ───────────────────────────────────────────────────────
   --sq is referenced by Tailwind arbitrary-value calc() expressions on both
   the board grid AND the board-labels row (siblings). Setting it on their
   common parent wrapper makes it available to all descendants.               */
.board-wrapper {
  --sq: 68px;
}

@media (max-width: 600px) {
  .board-wrapper {
    --sq: 44px;
  }
}

/* ─── Piece appearance ────────────────────────────────────────────────────────
   Radial gradients and multi-layer box-shadows are too verbose as Tailwind
   arbitrary values. Kept as named classes applied alongside Tailwind classes. */
.piece-red {
  background: radial-gradient(circle at 38% 35%, #ff8080, #cc1111 55%, #8b0000);
  border: 2px solid #7a0000;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 150, 150, 0.4);
}

.piece-black {
  background: radial-gradient(circle at 38% 35%, #777, #222 55%, #000);
  border: 2px solid #000;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(150, 150, 150, 0.3);
}

.piece-selected {
  transform: scale(1.12) translateY(-2px);
  box-shadow:
    0 0 0 3px #ffd700,
    0 6px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 3px rgba(255, 150, 150, 0.4);
}

/* ─── Winner announcement animation ──────────────────────────────────────────*/
@keyframes pop {
  0%   { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}

.animate-pop {
  animation: pop 0.3s ease;
}
```

- [ ] **Step 2: Verify Tailwind activates in the browser**

Open `http://localhost:5173`. The app will look unstyled because `App.css` classes are still used in JSX but the CSS no longer exists. This is expected — verify there are no Vite/Tailwind build errors in the terminal, only missing-style visual issues.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(styles): add Tailwind v4 import and retained CSS to index.css"
```

---

### Task 3: Migrate `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

Replace all `className` strings referencing the old CSS classes with Tailwind utility classes. Remove the `import './App.css'` line.

- [ ] **Step 1: Replace the full contents of `src/App.tsx`**

```tsx
import { useReducer, useEffect, useState } from 'react';
import { countPieces } from './gameLogic';
import { getBestMove } from './ai';
import { gameReducer, initialState } from './reducer';
import { Board } from './components/Board';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { board, selectedPos, validMoves, currentPlayer, gameStatus, isThinking, history } = state;
  const [depth, setDepth] = useState(5);

  useEffect(() => {
    if (gameStatus !== 'playing' || currentPlayer !== 'black') return;

    dispatch({ type: 'AI_START_THINKING' });

    const timer = setTimeout(() => {
      const bestMove = getBestMove(board, depth);
      if (bestMove) dispatch({ type: 'AI_MOVE', move: bestMove });
    }, 400);

    return () => clearTimeout(timer);
  }, [currentPlayer, gameStatus, board, depth]);

  const pieces = countPieces(board);

  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-10 min-h-screen">
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
        ♟ Checkers
      </h1>

      <div className="flex flex-col items-start gap-10 md:flex-row">

        {/* Board column — board-wrapper sets --sq for both the grid and labels */}
        <div className="board-wrapper flex flex-col items-center">
          <Board
            board={board}
            selectedPos={selectedPos}
            validMoves={validMoves}
            onSquareClick={pos => dispatch({ type: 'SQUARE_CLICK', pos })}
            disabled={gameStatus !== 'playing' || currentPlayer !== 'red' || isThinking}
          />
          <div className="flex justify-around mt-1 text-xs text-gray-500 dark:text-gray-400 w-[calc(var(--sq)*8)]">
            {['a','b','c','d','e','f','g','h'].map(l => (
              <span key={l} className="text-center w-[var(--sq)]">{l}</span>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col items-center pt-2 w-full md:w-72">

          {/* Scoreboard */}
          <div className="flex flex-col gap-2 mb-3 w-full text-sm">
            <div className="flex flex-col items-center py-2 px-5 rounded-lg bg-red-500/10 border border-red-500/30">
              <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">You (Red)</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pieces.red} pieces {pieces.redKings > 0 ? `· ${pieces.redKings} 👑` : ''}
              </span>
            </div>
            <div className="text-sm text-center text-gray-500 font-medium">vs</div>
            <div className="flex flex-col items-center py-2 px-5 rounded-lg bg-gray-500/10 border border-gray-500/30">
              <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">Computer (Black)</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pieces.black} pieces {pieces.blackKings > 0 ? `· ${pieces.blackKings} 👑` : ''}
              </span>
            </div>
          </div>

          {/* Status bar */}
          <div className="min-h-9 flex items-center justify-center text-center text-base mb-3 text-gray-900 dark:text-gray-100 w-full">
            {gameStatus === 'playing' ? (
              currentPlayer === 'red'
                ? <span>🔴 Your turn — click a piece to move</span>
                : <span>{isThinking ? '⚫ Computer is thinking…' : "⚫ Computer's turn"}</span>
            ) : (
              <span className="font-semibold text-lg animate-pop">
                {gameStatus === 'red_wins' ? '🎉 You win! Congratulations!' : '😔 Computer wins! Better luck next time.'}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5 w-full justify-center">
            <button
              className="px-8 py-2.5 text-base rounded-lg bg-[#3a5a8a] text-white shadow-md
                         hover:enabled:bg-[#4a6fa0] hover:enabled:-translate-y-px
                         disabled:bg-[#8a9ab0] disabled:opacity-60 disabled:cursor-not-allowed
                         active:translate-y-0 transition-all cursor-pointer border-0"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isThinking}
            >
              ↩ Undo
            </button>
            <button
              className="px-8 py-2.5 text-base rounded-lg bg-[#5c3417] text-white shadow-md
                         hover:bg-[#7a4a22] hover:-translate-y-px
                         active:translate-y-0 transition-all cursor-pointer border-0"
              onClick={() => dispatch({ type: 'RESTART' })}
            >
              🔄 New Game
            </button>
          </div>

          {/* Depth control */}
          <div className="flex flex-col items-center gap-1.5 mt-5 w-full">
            <label htmlFor="depth-slider" className="text-sm font-medium text-gray-900 dark:text-gray-100">
              AI Difficulty — Depth: <span className="font-bold text-[#5c3417]">{depth}</span>
            </label>
            <input
              id="depth-slider"
              type="range"
              min={1}
              max={7}
              value={depth}
              onChange={e => setDepth(Number(e.target.value))}
              disabled={isThinking}
              className="w-full accent-[#5c3417] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between w-full text-xs text-gray-500 dark:text-gray-400 opacity-70">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>

          <p className="mt-3.5 text-xs text-gray-500 dark:text-gray-400 opacity-70 text-center">
            Red moves up · Black moves down · Click a piece, then click its destination · Jumps are mandatory
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Check the app in the browser**

Open `http://localhost:5173`. The layout, scoreboard, buttons, slider, and status bar should all look styled. The board area will still look unstyled — Board.tsx is migrated in the next task.

- [ ] **Step 3: Run the test suite**

```bash
npm run test:ci
```

Expected: all tests pass (tests cover game logic, not CSS).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(styles): migrate App.tsx to Tailwind v4 utility classes"
```

---

### Task 4: Migrate `src/components/Board.tsx`

**Files:**
- Modify: `src/components/Board.tsx`

Replace the manual array-join class pattern with `clsx`. Replace all class names with Tailwind utilities plus the retained CSS classes from `index.css`.

- [ ] **Step 1: Replace the full contents of `src/components/Board.tsx`**

```tsx
import { clsx } from 'clsx';
import type { Board as BoardType, Move, Position } from '../types';

interface BoardProps {
  board: BoardType;
  selectedPos: Position | null;
  validMoves: Move[];
  onSquareClick: (pos: Position) => void;
  disabled: boolean;
}

export function Board({ board, selectedPos, validMoves, onSquareClick, disabled }: BoardProps) {
  const validDestSet = new Set(validMoves.map(m => `${m.to.row},${m.to.col}`));
  const selectableSet = new Set(validMoves.map(m => `${m.from.row},${m.from.col}`));

  return (
    <div
      className="grid grid-cols-8 grid-rows-[repeat(8,var(--sq))] border-[3px] border-[#5c3417] rounded-sm shadow-2xl select-none"
      role="grid"
      aria-label="Checkers board"
    >
      {board.map((row, rowIdx) =>
        row.map((piece, colIdx) => {
          const isDark = (rowIdx + colIdx) % 2 === 1;
          const isSelected = selectedPos?.row === rowIdx && selectedPos?.col === colIdx;
          const isValidDest = validDestSet.has(`${rowIdx},${colIdx}`);
          const isSelectable = !disabled && isDark && selectableSet.has(`${rowIdx},${colIdx}`);

          return (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={clsx(
                'flex items-center justify-center relative transition-colors duration-150',
                'w-[var(--sq)] h-[var(--sq)]',
                isDark ? [
                  'cursor-pointer',
                  isSelected  ? '!bg-[#7fc97f]'
                  : isValidDest ? '!bg-[#a8d880]'
                  : isSelectable ? 'bg-[#b58863] hover:!bg-[#c9a850]'
                  : 'bg-[#b58863] hover:bg-[#c9985a]',
                ] : 'bg-[#f0d9b5]',
              )}
              onClick={() => isDark && !disabled && onSquareClick({ row: rowIdx, col: colIdx })}
              role={isDark ? 'gridcell' : undefined}
              aria-label={isDark ? `Row ${rowIdx + 1}, Col ${colIdx + 1}` : undefined}
            >
              {piece && (
                <div
                  className={clsx(
                    'rounded-full flex items-center justify-center cursor-pointer',
                    'transition-[transform,box-shadow] duration-[120ms] ease-out',
                    'relative z-10',
                    'w-[calc(var(--sq)*0.76)] h-[calc(var(--sq)*0.76)]',
                    piece.player === 'red' ? 'piece-red' : 'piece-black',
                    isSelected ? 'piece-selected' : 'hover:scale-105 hover:-translate-y-px',
                  )}
                >
                  {piece.king && (
                    <span
                      className="pointer-events-none leading-none text-[#ffd700] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] text-[calc(var(--sq)*0.32)]"
                      aria-label="King"
                    >
                      ♛
                    </span>
                  )}
                </div>
              )}
              {isValidDest && !piece && (
                <div className="rounded-full bg-[rgba(60,180,60,0.65)] border-2 border-[rgba(40,140,40,0.8)] pointer-events-none w-[calc(var(--sq)*0.32)] h-[calc(var(--sq)*0.32)]" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
```

- [ ] **Step 2: Check the full app in the browser**

Open `http://localhost:5173`. The board should now be fully styled: light and dark squares, pieces with gradient sheen, move dots, selected/highlight states, responsive sizing. Play a few moves to verify interactive states (selection highlight, valid-move dots, piece hover lift).

- [ ] **Step 3: Run the test suite**

```bash
npm run test:ci
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/Board.tsx
git commit -m "feat(styles): migrate Board.tsx to Tailwind v4 utility classes with clsx"
```

---

### Task 5: Delete `src/App.css` and final verification

**Files:**
- Delete: `src/App.css`

- [ ] **Step 1: Delete App.css**

```bash
git rm src/App.css
```

- [ ] **Step 2: Confirm the app still works**

Open `http://localhost:5173`. No visual regressions — `App.css` should already be unused (removed from App.tsx in Task 3). Verify:
- Layout stacks vertically on narrow viewport (< 768px)
- Board squares are smaller on very narrow viewport (< 600px)
- Dark mode looks correct (toggle OS dark mode preference to check)
- Winning the game shows the pop animation
- Undo button is correctly disabled when history is empty

- [ ] **Step 3: Run the full test suite and build**

```bash
npm run test:ci && npm run build
```

Expected: all tests pass, production build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete App.css — fully replaced by Tailwind v4 utilities"
```
