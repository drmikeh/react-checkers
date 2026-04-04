import type { Board, Move } from './types';
import { getValidMovesForPlayer, applyMove, getGameStatus } from './gameLogic';

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      const isBlack = piece.player === 'black';
      const sign = isBlack ? -1 : 1;
      let value = piece.king ? 2.5 : 1.0;
      if (!piece.king) {
        value += isBlack ? row * 0.04 : (7 - row) * 0.04;
        if (col >= 2 && col <= 5) value += 0.1;
      } else {
        const centerDist = Math.abs(col - 3.5) + Math.abs(row - 3.5);
        value += (7 - centerDist) * 0.04;
      }
      if (!piece.king && isBlack && row === 0) value += 0.15;
      if (!piece.king && !isBlack && row === 7) value += 0.15;
      score += sign * value;
    }
  }
  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  const status = getGameStatus(board);
  if (status === 'red_wins') return 1000;
  if (status === 'black_wins') return -1000;
  if (depth === 0) return evaluateBoard(board);

  const player = isMaximizing ? 'red' : 'black';
  const moves = getValidMovesForPlayer(board, player);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const ev = minimax(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const ev = minimax(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(board: Board, depth = 5): Move | null {
  const moves = getValidMovesForPlayer(board, 'black');
  if (moves.length === 0) return null;

  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  let bestMove = shuffled[0];
  let bestEval = Infinity;

  for (const move of shuffled) {
    const newBoard = applyMove(board, move);
    const ev = minimax(newBoard, depth - 1, -Infinity, Infinity, true);
    if (ev < bestEval) {
      bestEval = ev;
      bestMove = move;
    }
  }

  return bestMove;
}
