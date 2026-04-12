# Tailwind CSS Migration Design

**Date:** 2026-04-12  
**Scope:** Replace all plain CSS in `src/App.css` and `src/index.css` with Tailwind v4 utility classes. Improve and modernize the design in the process. Preserve dark mode support.

---

## Goals

- Migrate all component styling to Tailwind v4 utility classes inline in JSX
- Delete `src/App.css` entirely
- Preserve dark mode via Tailwind's `media` dark mode strategy (`prefers-color-scheme: dark`)
- Improve visual design (modernized typography, spacing, and component aesthetics)
- Keep a minimal `index.css` only for styles that cannot be cleanly expressed as Tailwind utilities

---

## Package Setup

Install three packages:

```bash
npm install tailwindcss @tailwindcss/vite clsx
```

- **`tailwindcss`** (v4) — the CSS framework
- **`@tailwindcss/vite`** — Vite plugin; replaces PostCSS config; no `tailwind.config.js` needed in v4
- **`clsx`** — for conditional class composition in `Board.tsx`

Update `vite.config.ts` to add the `@tailwindcss/vite` plugin:

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

---

## `index.css` — What Stays

Replace the file contents with `@import "tailwindcss"` at the top, followed by a small block of plain CSS for styles that Tailwind utilities cannot cleanly express:

1. **Board square sizing** — A `--sq` CSS custom property (68px desktop, 44px on narrow screens via media query) that drives `calc()` expressions for piece sizes, move-dot sizes, and board-label widths. Sharing a single variable across multiple elements requires plain CSS.

2. **Piece gradients** — Red and black pieces use `radial-gradient(circle at 38% 35%, ...)` for a 3D sheen. Complex enough that `bg-[...]` arbitrary values would be unreadable. Retained as named classes: `.piece-red`, `.piece-black`.

3. **Selected-piece glow** — Multi-layer `box-shadow` with a gold ring. Retained as `.piece-selected`.

4. **Winner animation** — `@keyframes pop` (scale + opacity) on the winner message. Defined in CSS and referenced via a custom `.animate-pop` class.

All global resets, typography rules, and the `#root` container styles from the old `index.css` are removed — Tailwind's base layer (Preflight) handles resets, and layout moves to JSX utilities.

---

## `src/App.tsx` Class Rewrites

`import './App.css'` is removed. All class names replaced with Tailwind utilities inline:

| Old class | Tailwind utilities |
|---|---|
| `.app` | `flex flex-col items-center px-4 pt-6 pb-10 min-h-screen` |
| `.game-title` | `text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100` |
| `.game-layout` | `flex flex-col items-start gap-10 md:flex-row` |
| `.board-column` | `flex flex-col items-center` |
| `.board-labels` | `flex justify-around mt-1 text-xs text-gray-500 dark:text-gray-400` |
| `.col-label` | `text-center` with `w-[var(--sq,68px)]` — board-labels container gets `style={{ width: 'calc(var(--sq, 68px) * 8)' }}` inline |
| `.side-panel` | `flex flex-col items-center pt-2 w-full md:w-72` |
| `.scoreboard` | `flex flex-col gap-2 mb-3 w-full text-sm` |
| `.score-card.player` | `flex flex-col items-center py-2 px-5 rounded-lg bg-red-500/10 border border-red-500/30` |
| `.score-card.computer` | `flex flex-col items-center py-2 px-5 rounded-lg bg-gray-500/10 border border-gray-500/30` |
| `.score-label` | `font-semibold text-xs text-gray-900 dark:text-gray-100` |
| `.score-pieces` | `text-sm text-gray-600 dark:text-gray-400` |
| `.score-divider` | `text-sm text-center text-gray-500 font-medium` |
| `.status-bar` | `min-h-9 flex items-center justify-center text-center text-base mb-3 text-gray-900 dark:text-gray-100 w-full` |
| `.winner-text` | `font-semibold text-lg animate-pop` |
| `.action-buttons` | `flex gap-3 mt-5 w-full justify-center` |
| `.restart-btn` | `px-8 py-2.5 text-base rounded-lg bg-[#5c3417] text-white shadow-md hover:bg-[#7a4a22] hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer border-0` |
| `.undo-btn` | `px-8 py-2.5 text-base rounded-lg bg-[#3a5a8a] text-white shadow-md hover:enabled:bg-[#4a6fa0] hover:enabled:-translate-y-px disabled:bg-[#8a9ab0] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer border-0` |
| `.depth-control` | `flex flex-col items-center gap-1.5 mt-5 w-full` |
| `.depth-label` | `text-sm font-medium text-gray-900 dark:text-gray-100` |
| `.depth-value` | `font-bold text-[#5c3417]` |
| `.depth-slider` | `w-full accent-[#5c3417] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed` |
| `.depth-hints` | `flex justify-between w-full text-xs text-gray-500 dark:text-gray-400 opacity-70` |
| `.rules-hint` | `mt-3.5 text-xs text-gray-500 dark:text-gray-400 opacity-70 text-center` |

---

## `src/components/Board.tsx` Class Rewrites

Replace the manual `[...].filter(Boolean).join(' ')` pattern with `clsx`. Classes replaced with Tailwind utilities:

| Old class | Tailwind utilities |
|---|---|
| `.board` | `grid grid-cols-8 border-[3px] border-[#5c3417] rounded-sm shadow-2xl select-none` + inline style for `gridTemplateRows` |
| `.square` (base) | `flex items-center justify-center relative transition-colors duration-150 w-[var(--sq)] h-[var(--sq)]` |
| `.square.light` | `bg-[#f0d9b5]` |
| `.square.dark` | `bg-[#b58863] cursor-pointer hover:bg-[#c9985a]` |
| `.square.selected` | `!bg-[#7fc97f]` |
| `.square.valid-dest` | `!bg-[#a8d880] cursor-pointer` |
| `.square.selectable` | `hover:!bg-[#c9a850]` |
| `.piece` (base) | `rounded-full flex items-center justify-center cursor-pointer transition-[transform,box-shadow] duration-[120ms] ease-out relative z-10 w-[calc(var(--sq)*0.76)] h-[calc(var(--sq)*0.76)] hover:scale-105 hover:-translate-y-px` |
| `.piece.red` | `piece-red` (retained CSS — radial gradient, border, shadow) |
| `.piece.black` | `piece-black` (retained CSS) |
| `.piece-selected` | `piece-selected !scale-110 !-translate-y-0.5` (retained CSS for gold ring shadow) |
| `.crown` | `pointer-events-none leading-none text-[#ffd700] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] text-[calc(var(--sq)*0.32)]` |
| `.move-dot` | `rounded-full bg-[rgba(60,180,60,0.65)] border-2 border-[rgba(40,140,40,0.8)] pointer-events-none w-[calc(var(--sq)*0.32)] h-[calc(var(--sq)*0.32)]` |

---

## Files Changed

| File | Action |
|---|---|
| `package.json` | Add `tailwindcss`, `@tailwindcss/vite`, `clsx` |
| `vite.config.ts` | Add `@tailwindcss/vite` plugin |
| `src/index.css` | Replace contents: `@import "tailwindcss"` + retained CSS block |
| `src/App.tsx` | Remove `import './App.css'`; replace all class names with Tailwind utilities |
| `src/components/Board.tsx` | Import `clsx`; replace class-join pattern with `clsx`; replace all class names with Tailwind utilities |
| `src/App.css` | **Delete** |

---

## Dark Mode

No JavaScript changes required. Tailwind v4's `dark:` variant defaults to `@media (prefers-color-scheme: dark)`, which matches the existing behavior exactly.

---

## What Is NOT Changed

- Game logic (`src/gameLogic.ts`, `src/ai.ts`, `src/reducer.ts`, `src/types.ts`)
- Tests (`src/reducer.test.ts`)
- Component structure and props (`Board.tsx` interface unchanged)
- Accessibility attributes (`role`, `aria-label`)
