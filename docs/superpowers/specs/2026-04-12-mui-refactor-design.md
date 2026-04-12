# MUI Refactor Design

**Date:** 2026-04-12  
**Status:** Approved

## Overview

Refactor the React Checkers UI shell to use Material UI (MUI v5) for layout, typography, and reusable components. The board and piece rendering stay as hand-crafted CSS — MUI owns everything outside the board.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scope | Hybrid (shell only) | Board CSS is game-specific and already well-written; clear boundary between game visuals and UI chrome |
| Theme | Fixed dark mode | Purple primary (`#7c4dff`), dark background (`#1a1a2e`); no light/dark toggle |
| Approach | Extract sub-components | App.tsx is getting long; extraction keeps each file focused |

## Dependencies

Add to `dependencies` in `package.json`:
- `@mui/material`
- `@emotion/react`
- `@emotion/styled`

## File Changes

### New files

**`src/theme.ts`**  
Creates a MUI dark theme:
```ts
createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c4dff' },
    background: { default: '#1a1a2e', paper: '#16213e' },
  }
})
```

**`src/components/ScoreBoard.tsx`**  
Props: `{ red: number, redKings: number, black: number, blackKings: number }`  
Renders two MUI `Paper` cards in a `Stack` — one red-tinted (player), one dark-tinted (computer). No game logic.

**`src/components/StatusBar.tsx`**  
Props: `{ gameStatus: GameStatus, currentPlayer: Player, isThinking: boolean }`  
Renders a MUI `Alert` with appropriate severity and message:
- Playing + red turn → `info` — "Your turn — click a piece to move"
- Playing + black turn → `info` — "Computer is thinking…" or "Computer's turn"
- Red wins → `success` — "You win! Congratulations!"
- Black wins → `error` — "Computer wins! Better luck next time."

**`src/components/DepthControl.tsx`**  
Props: `{ depth: number, onChange: (depth: number) => void, disabled: boolean }`  
Renders a MUI `Slider` (min 1, max 7) with `Typography` for the label, current depth value, and Easy/Hard end labels.

### Modified files

**`src/main.tsx`**  
Wrap `<App>` with `<ThemeProvider theme={theme}>` and `<CssBaseline />`.

**`src/App.tsx`**  
- Remove `import './App.css'`
- Replace `<div>` layout wrappers with MUI `Box` and `Stack`
- Replace `<h1>` with `<Typography variant="h4" fontWeight={700}>`
- Replace `<div className="action-buttons">` with `<Stack direction="row">`
- Replace `<button className="undo-btn">` and `<button className="restart-btn">` with MUI `<Button variant="contained" color="primary">`
- Replace column labels with `<Box>` + `<Typography variant="caption">`
- Replace rules hint `<p>` with `<Typography variant="caption">`
- Swap in `<ScoreBoard>`, `<StatusBar>`, `<DepthControl>` components
- `<Board>` import and usage unchanged

Responsive breakpoint for layout stacking: `{ xs: 'column', md: 'row' }` on the game layout `Stack`.

**`src/index.css`**  
Remove: `:root` vars, `body`, `h1`, `h2`, `p`, `code`, `#root` rules — MUI `CssBaseline` + `ThemeProvider` own these.  
Keep: Everything from `.board` downward (`.square`, `.piece`, `.move-dot`, `.crown`, `.board-labels`, `.col-label`), including responsive `--sq` overrides.

### Deleted files

**`src/App.css`** — fully replaced by MUI `sx` props and component defaults.

## Architecture Diagram

```
main.tsx
  └── ThemeProvider (src/theme.ts)
        └── CssBaseline
              └── App.tsx
                    ├── Typography (title)
                    ├── Stack (game-layout, row on md+, column on xs)
                    │     ├── Box (board-column)
                    │     │     ├── Board.tsx  ← unchanged, custom CSS
                    │     │     └── Box (column labels)
                    │     └── Stack (side-panel, width 280)
                    │           ├── ScoreBoard.tsx  ← new MUI component
                    │           ├── StatusBar.tsx   ← new MUI component
                    │           ├── Stack (action-buttons)
                    │           │     ├── Button (Undo)
                    │           │     └── Button (New Game)
                    │           ├── DepthControl.tsx ← new MUI component
                    │           └── Typography (rules hint)
```

## Boundaries

- `Board.tsx` and all files in the pure logic layer (`types.ts`, `gameLogic.ts`, `ai.ts`, `reducer.ts`) are **not touched**.
- `reducer.test.ts` is **not touched** — no game logic changes.
- No new test files are needed — the extracted components are pure presentational and the game logic is unchanged.
