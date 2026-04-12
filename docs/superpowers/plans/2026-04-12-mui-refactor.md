# MUI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the React Checkers UI shell to use MUI v5 with a fixed dark theme, extracting three new presentational components (ScoreBoard, StatusBar, DepthControl) and replacing App.css with MUI `sx` props.

**Architecture:** Hybrid approach — MUI owns everything outside the board (layout, typography, buttons, slider, scoreboard, status). Board and piece rendering stay as custom CSS in `index.css`. Three new components are extracted from App.tsx; Board.tsx and all game logic files are untouched.

**Tech Stack:** React 19, MUI v5 (`@mui/material`), Emotion (`@emotion/react`, `@emotion/styled`), TypeScript, Vite

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add MUI + Emotion dependencies |
| `src/theme.ts` | Create | MUI dark theme definition |
| `src/main.tsx` | Modify | Wrap App with ThemeProvider + CssBaseline |
| `src/components/ScoreBoard.tsx` | Create | Piece count display using MUI Paper/Stack |
| `src/components/StatusBar.tsx` | Create | Turn/win status using MUI Alert |
| `src/components/DepthControl.tsx` | Create | AI depth slider using MUI Slider/Typography |
| `src/App.tsx` | Modify | Replace divs with MUI Box/Stack/Button/Typography |
| `src/index.css` | Modify | Remove non-board rules (kept: .board and below) |
| `src/App.css` | Delete | Fully replaced by MUI sx props |

---

## Task 1: Install MUI Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install @mui/material @emotion/react @emotion/styled
```

Expected output: packages added, no peer-dep warnings.

- [ ] **Step 2: Verify types are available**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install MUI and Emotion dependencies"
```

---

## Task 2: Create the MUI Dark Theme

**Files:**
- Create: `src/theme.ts`

- [ ] **Step 1: Create theme file**

```ts
// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff',
    },
    background: {
      default: '#1a1a2e',
      paper: '#16213e',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
  },
});

export default theme;
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/theme.ts
git commit -m "feat: add MUI dark theme with purple primary"
```

---

## Task 3: Wrap App with ThemeProvider and CssBaseline

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Update main.tsx**

Replace the entire file content with:

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import theme from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 2: Run dev server and verify app still loads**

```bash
npm run dev
```

Open http://localhost:5173 — game should display (may look unstyled until App.css is replaced, but it must not crash).

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx
git commit -m "feat: wrap app with MUI ThemeProvider and CssBaseline"
```

---

## Task 4: Create ScoreBoard Component

**Files:**
- Create: `src/components/ScoreBoard.tsx`

This component receives piece counts and renders two styled cards — one for the human player (red-tinted) and one for the computer (dark-tinted).

- [ ] **Step 1: Create the component**

```tsx
// src/components/ScoreBoard.tsx
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ScoreBoardProps {
  red: number;
  redKings: number;
  black: number;
  blackKings: number;
}

export function ScoreBoard({ red, redKings, black, blackKings }: ScoreBoardProps) {
  const kingLabel = (kings: number) => kings > 0 ? ` · ${kings} 👑` : '';

  return (
    <Stack spacing={1} width="100%">
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          textAlign: 'center',
          bgcolor: 'rgba(220, 50, 50, 0.12)',
          border: '1px solid rgba(220, 50, 50, 0.3)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="error.light">
          You (Red)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {red} pieces{kingLabel(redKings)}
        </Typography>
      </Paper>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        vs
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          textAlign: 'center',
          bgcolor: 'rgba(50, 50, 50, 0.25)',
          border: '1px solid rgba(150, 150, 150, 0.2)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          Computer (Black)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {black} pieces{kingLabel(blackKings)}
        </Typography>
      </Paper>
    </Stack>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ScoreBoard.tsx
git commit -m "feat: add ScoreBoard MUI component"
```

---

## Task 5: Create StatusBar Component

**Files:**
- Create: `src/components/StatusBar.tsx`

This component maps game state to a MUI Alert — info for active turns, success for a win, error for a loss.

- [ ] **Step 1: Create the component**

```tsx
// src/components/StatusBar.tsx
import Alert from '@mui/material/Alert';
import type { GameStatus, Player } from '../types';

interface StatusBarProps {
  gameStatus: GameStatus;
  currentPlayer: Player;
  isThinking: boolean;
}

export function StatusBar({ gameStatus, currentPlayer, isThinking }: StatusBarProps) {
  if (gameStatus === 'red_wins') {
    return (
      <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
        🎉 You win! Congratulations!
      </Alert>
    );
  }

  if (gameStatus === 'black_wins') {
    return (
      <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
        😔 Computer wins! Better luck next time.
      </Alert>
    );
  }

  if (currentPlayer === 'black') {
    return (
      <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
        {isThinking ? '⚫ Computer is thinking…' : "⚫ Computer's turn"}
      </Alert>
    );
  }

  return (
    <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
      🔴 Your turn — click a piece to move
    </Alert>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/StatusBar.tsx
git commit -m "feat: add StatusBar MUI component"
```

---

## Task 6: Create DepthControl Component

**Files:**
- Create: `src/components/DepthControl.tsx`

This component wraps a MUI Slider for the AI depth setting, with Easy/Hard end labels.

- [ ] **Step 1: Create the component**

```tsx
// src/components/DepthControl.tsx
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

interface DepthControlProps {
  depth: number;
  onChange: (depth: number) => void;
  disabled: boolean;
}

export function DepthControl({ depth, onChange, disabled }: DepthControlProps) {
  return (
    <Box width="100%">
      <Typography variant="body2" color="text.secondary" gutterBottom>
        AI Difficulty — Depth:{' '}
        <Box component="span" fontWeight={700} color="primary.main">
          {depth}
        </Box>
      </Typography>
      <Slider
        value={depth}
        min={1}
        max={7}
        step={1}
        disabled={disabled}
        onChange={(_, value) => onChange(value as number)}
        sx={{ color: 'primary.main' }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.disabled">Easy</Typography>
        <Typography variant="caption" color="text.disabled">Hard</Typography>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/DepthControl.tsx
git commit -m "feat: add DepthControl MUI component"
```

---

## Task 7: Refactor App.tsx to Use MUI Layout and New Components

**Files:**
- Modify: `src/App.tsx`

This is the main wiring task. Replace all `<div className="...">` with MUI layout components, swap buttons for MUI `Button`, and use the three new components.

- [ ] **Step 1: Replace App.tsx**

```tsx
// src/App.tsx
import { useReducer, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { countPieces } from './gameLogic';
import { getBestMove } from './ai';
import { gameReducer, initialState } from './reducer';
import { Board } from './components/Board';
import { ScoreBoard } from './components/ScoreBoard';
import { StatusBar } from './components/StatusBar';
import { DepthControl } from './components/DepthControl';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} letterSpacing="-0.5px" sx={{ mb: 2 }}>
        ♟ Checkers
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={5}
        alignItems={{ xs: 'center', md: 'flex-start' }}
      >
        {/* Board column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Board
            board={board}
            selectedPos={selectedPos}
            validMoves={validMoves}
            onSquareClick={pos => dispatch({ type: 'SQUARE_CLICK', pos })}
            disabled={gameStatus !== 'playing' || currentPlayer !== 'red' || isThinking}
          />
          <Box sx={{ display: 'flex', width: { xs: 'calc(44px * 8)', sm: 'calc(68px * 8)' }, justifyContent: 'space-around', mt: 0.5 }}>
            {['a','b','c','d','e','f','g','h'].map(l => (
              <Typography key={l} variant="caption" color="text.disabled" sx={{ width: { xs: '44px', sm: '68px' }, textAlign: 'center' }}>
                {l}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Side panel */}
        <Stack spacing={2} sx={{ width: 280, pt: 1 }}>
          <ScoreBoard
            red={pieces.red}
            redKings={pieces.redKings}
            black={pieces.black}
            blackKings={pieces.blackKings}
          />

          <StatusBar
            gameStatus={gameStatus}
            currentPlayer={currentPlayer}
            isThinking={isThinking}
          />

          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isThinking}
            >
              ↩ Undo
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch({ type: 'RESTART' })}
            >
              🔄 New Game
            </Button>
          </Stack>

          <DepthControl
            depth={depth}
            onChange={setDepth}
            disabled={isThinking}
          />

          <Typography variant="caption" color="text.disabled" textAlign="center">
            Red moves up · Black moves down · Click a piece, then click its destination · Jumps are mandatory
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
```

- [ ] **Step 2: Run dev server and verify the game works end-to-end**

```bash
npm run dev
```

Open http://localhost:5173. Check:
- Board renders correctly
- Clicking a red piece shows valid moves
- Making a move switches turn to black
- Computer makes a move
- Undo and New Game buttons work
- Depth slider adjusts value
- Win condition shows correct Alert color (success/error)

- [ ] **Step 3: Run CI tests to confirm no regressions**

```bash
npm run test:ci
```

Expected: all existing reducer tests pass (board rendering is untouched).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: refactor App.tsx to use MUI layout and extracted components"
```

---

## Task 8: Trim index.css and Delete App.css

**Files:**
- Modify: `src/index.css`
- Delete: `src/App.css`

- [ ] **Step 1: Replace index.css — keep only board/piece CSS**

Replace the entire file with:

```css
/* Board */
.board {
  --sq: 68px;
  display: grid;
  grid-template-columns: repeat(8, var(--sq));
  grid-template-rows: repeat(8, var(--sq));
  border: 3px solid #5c3417;
  border-radius: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2);
  user-select: none;
}

@media (max-width: 600px) {
  .board {
    --sq: 44px;
  }
}

.square {
  width: var(--sq);
  height: var(--sq);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background-color 0.15s;
}

.square.light {
  background-color: #f0d9b5;
}

.square.dark {
  background-color: #b58863;
  cursor: pointer;
}

.square.dark:hover {
  background-color: #c9985a;
}

.square.selected {
  background-color: #7fc97f !important;
}

.square.valid-dest {
  background-color: #a8d880 !important;
  cursor: pointer;
}

.square.selectable:hover {
  background-color: #c9a850 !important;
}

/* Pieces */
.piece {
  --piece-size: calc(var(--sq) * 0.76);
  width: var(--piece-size);
  height: var(--piece-size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  position: relative;
  z-index: 1;
}

.piece.red {
  background: radial-gradient(circle at 38% 35%, #ff8080, #cc1111 55%, #8b0000);
  border: 2px solid #7a0000;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 150, 150, 0.4);
}

.piece.black {
  background: radial-gradient(circle at 38% 35%, #777, #222 55%, #000);
  border: 2px solid #000;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(150, 150, 150, 0.3);
}

.piece.piece-selected {
  transform: scale(1.12) translateY(-2px);
  box-shadow:
    0 0 0 3px #ffd700,
    0 6px 16px rgba(0, 0, 0, 0.5),
    inset 0 1px 3px rgba(255, 150, 150, 0.4);
}

.piece:not(.piece-selected):hover {
  transform: scale(1.05) translateY(-1px);
}

.crown {
  font-size: calc(var(--sq) * 0.32);
  line-height: 1;
  color: #ffd700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

/* Move hint dot */
.move-dot {
  width: calc(var(--sq) * 0.32);
  height: calc(var(--sq) * 0.32);
  border-radius: 50%;
  background: rgba(60, 180, 60, 0.65);
  border: 2px solid rgba(40, 140, 40, 0.8);
  pointer-events: none;
}
```

- [ ] **Step 2: Delete App.css**

```bash
git rm src/App.css
```

- [ ] **Step 3: Run dev server — verify final visual result**

```bash
npm run dev
```

Open http://localhost:5173. Confirm:
- Dark background applied by CssBaseline
- Purple buttons
- Board labels (a–h) still visible below board
- Piece counts and status render in the side panel
- No console errors

- [ ] **Step 4: Run full build and tests**

```bash
npm run build && npm run test:ci
```

Expected: build exits 0, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "refactor: trim index.css to board/piece rules only, delete App.css"
```
