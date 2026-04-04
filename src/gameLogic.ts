import type { Board, Player, Position, Move, Piece, GameStatus } from './types';

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) board[row][col] = { player: 'black', king: false };
        else if (row > 4) board[row][col] = { player: 'red', king: false };
      }
    }
  }
  return board;
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getDirections(piece: Piece): [number, number][] {
  if (piece.king) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  if (piece.player === 'red') return [[-1, -1], [-1, 1]];
  return [[1, -1], [1, 1]];
}

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

function simulateJump(board: Board, from: Position, to: Position, captured: Position): Board {
  const b = cloneBoard(board);
  b[to.row][to.col] = b[from.row][from.col];
  b[from.row][from.col] = null;
  b[captured.row][captured.col] = null;
  return b;
}

function getJumpsFromPos(
  board: Board,
  currentPos: Position,
  originalFrom: Position,
  capturedSoFar: Position[],
  piece: Piece
): Move[] {
  const completedJumps: Move[] = [];
  const directions = getDirections(piece);

  for (const [dr, dc] of directions) {
    const midRow = currentPos.row + dr;
    const midCol = currentPos.col + dc;
    const landRow = currentPos.row + 2 * dr;
    const landCol = currentPos.col + 2 * dc;

    if (!isInBounds(landRow, landCol)) continue;

    const midPiece = board[midRow][midCol];
    if (!midPiece || midPiece.player === piece.player) continue;
    if (capturedSoFar.some(c => c.row === midRow && c.col === midCol)) continue;
    if (board[landRow][landCol] !== null) continue;

    const newCaptured = [...capturedSoFar, { row: midRow, col: midCol }];
    const landPos = { row: landRow, col: landCol };

    const becomesKing =
      !piece.king &&
      ((piece.player === 'red' && landRow === 0) || (piece.player === 'black' && landRow === 7));

    if (!becomesKing) {
      const simBoard = simulateJump(board, currentPos, landPos, { row: midRow, col: midCol });
      const continueJumps = getJumpsFromPos(simBoard, landPos, originalFrom, newCaptured, piece);
      if (continueJumps.length > 0) {
        completedJumps.push(...continueJumps);
      } else {
        completedJumps.push({ from: originalFrom, to: landPos, captures: newCaptured });
      }
    } else {
      completedJumps.push({ from: originalFrom, to: landPos, captures: newCaptured });
    }
  }

  return completedJumps;
}

export function getMovesForPiece(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const moves: Move[] = [];
  const directions = getDirections(piece);

  for (const [dr, dc] of directions) {
    const r = pos.row + dr;
    const c = pos.col + dc;
    if (isInBounds(r, c) && board[r][c] === null) {
      moves.push({ from: pos, to: { row: r, col: c }, captures: [] });
    }
  }

  const jumps = getJumpsFromPos(board, pos, pos, [], piece);
  moves.push(...jumps);
  return moves;
}

export function getValidMovesForPlayer(board: Board, player: Player): Move[] {
  const simpleMoves: Move[] = [];
  const jumpMoves: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.player !== player) continue;
      const pieceMoves = getMovesForPiece(board, { row, col });
      for (const m of pieceMoves) {
        if (m.captures.length > 0) jumpMoves.push(m);
        else simpleMoves.push(m);
      }
    }
  }

  return jumpMoves.length > 0 ? jumpMoves : simpleMoves;
}

export function getValidMovesForPiece(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const allMoves = getValidMovesForPlayer(board, piece.player);
  return allMoves.filter(m => m.from.row === pos.row && m.from.col === pos.col);
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const piece = { ...newBoard[move.from.row][move.from.col]! };

  newBoard[move.to.row][move.to.col] = piece;
  newBoard[move.from.row][move.from.col] = null;

  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null;
  }

  if (!piece.king) {
    if (piece.player === 'red' && move.to.row === 0) {
      newBoard[move.to.row][move.to.col]!.king = true;
    } else if (piece.player === 'black' && move.to.row === 7) {
      newBoard[move.to.row][move.to.col]!.king = true;
    }
  }

  return newBoard;
}

export function getGameStatus(board: Board): GameStatus {
  const redMoves = getValidMovesForPlayer(board, 'red');
  const blackMoves = getValidMovesForPlayer(board, 'black');
  if (redMoves.length === 0) return 'black_wins';
  if (blackMoves.length === 0) return 'red_wins';
  return 'playing';
}

export function countPieces(board: Board): { red: number; black: number; redKings: number; blackKings: number } {
  let red = 0, black = 0, redKings = 0, blackKings = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue;
      if (cell.player === 'red') { red++; if (cell.king) redKings++; }
      else { black++; if (cell.king) blackKings++; }
    }
  }
  return { red, black, redKings, blackKings };
}
