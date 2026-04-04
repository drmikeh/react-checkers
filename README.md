# React Checkers

A single-player Checkers game built with React, TypeScript, and Vite. Play against a computer opponent powered by a minimax AI with alpha-beta pruning.

![Checkers board](https://img.shields.io/badge/game-checkers-b58863?style=flat-square) ![React](https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/typescript-5-3178c6?style=flat-square&logo=typescript)

## Screenshot

![Checkers](checkers-game.png)

## How to Play

- **You are Red** — your pieces start at the bottom and move up
- **Computer is Black** — moves down from the top
- Click a piece to select it; green dots mark valid destinations
- Click a highlighted square to move
- **Jumps are mandatory** — if a capture is available, you must take it
- Chain multiple jumps in a single turn when possible
- Reach the opponent's back row to become a **King** (♛), which can move in all four diagonal directions

## Rules

Standard American Checkers:

- Pieces move diagonally forward one square at a time
- Capture an opponent's piece by jumping over it to the empty square beyond
- If a capture is available for any of your pieces, you must capture (mandatory jump rule)
- When multiple jumps are available in sequence, you must continue jumping until no further captures are possible
- A man reaching the back row is crowned King and may move and capture in any diagonal direction
- A man that reaches the king row during a jump ends its turn immediately (even if a further jump would be possible as a king)
- Win by capturing all opponent pieces or leaving the opponent with no legal moves

## AI

The computer uses **minimax search with alpha-beta pruning** at depth 5. The evaluation function scores positions based on:

- Piece count (men = 1.0 pt, kings = 2.5 pts)
- Advancement toward the king row
- Center board control
- Back row protection

## Project Structure

```
src/
├── types.ts            # Shared TypeScript types (Board, Piece, Move, etc.)
├── gameLogic.ts        # Move generation, validation, jump chains, game status
├── ai.ts               # Minimax AI with alpha-beta pruning
├── components/
│   └── Board.tsx       # Interactive 8×8 board component
├── App.tsx             # Game state management and UI
└── App.css             # Checkers-themed styles
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play.

### Other Commands

```bash
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## Tech Stack

- [React 19](https://react.dev) — UI framework
- [TypeScript](https://www.typescriptlang.org) — type safety
- [Vite](https://vite.dev) — build tool and dev server
