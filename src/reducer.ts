import type { Board as BoardType, Move, Position, GameStatus } from './types';
import { createInitialBoard, getValidMovesForPiece, applyMove, getGameStatus } from './gameLogic';

export interface Snapshot {
  board: BoardType;
  gameStatus: GameStatus;
}

export interface GameState {
  board: BoardType;
  selectedPos: Position | null;
  validMoves: Move[];
  currentPlayer: 'red' | 'black';
  gameStatus: GameStatus;
  isThinking: boolean;
  history: Snapshot[];
}

export type Action =
  | { type: 'SQUARE_CLICK'; pos: Position }
  | { type: 'AI_START_THINKING' }
  | { type: 'AI_MOVE'; move: Move }
  | { type: 'UNDO' }
  | { type: 'RESTART' };

export const initialState: GameState = {
  board: createInitialBoard(),
  selectedPos: null,
  validMoves: [],
  currentPlayer: 'red',
  gameStatus: 'playing',
  isThinking: false,
  history: [],
};

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SQUARE_CLICK': {
      if (state.gameStatus !== 'playing' || state.currentPlayer !== 'red' || state.isThinking) {
        return state;
      }
      const { pos } = action;
      const piece = state.board[pos.row][pos.col];

      const move = state.validMoves.find(m => m.to.row === pos.row && m.to.col === pos.col);
      if (move) {
        const newBoard = applyMove(state.board, move);
        const newStatus = getGameStatus(newBoard);
        return {
          ...state,
          history: [...state.history, { board: state.board, gameStatus: state.gameStatus }],
          board: newBoard,
          gameStatus: newStatus,
          currentPlayer: newStatus === 'playing' ? 'black' : state.currentPlayer,
          selectedPos: null,
          validMoves: [],
        };
      }

      if (piece?.player === 'red') {
        const moves = getValidMovesForPiece(state.board, pos);
        if (moves.length > 0) {
          return { ...state, selectedPos: pos, validMoves: moves };
        }
      }

      return { ...state, selectedPos: null, validMoves: [] };
    }

    case 'AI_START_THINKING':
      return { ...state, isThinking: true };

    case 'AI_MOVE': {
      const newBoard = applyMove(state.board, action.move);
      const newStatus = getGameStatus(newBoard);
      return {
        ...state,
        board: newBoard,
        gameStatus: newStatus,
        currentPlayer: newStatus === 'playing' ? 'red' : state.currentPlayer,
        isThinking: false,
      };
    }

    case 'UNDO': {
      const prev = state.history[state.history.length - 1];
      if (!prev) return state;
      return {
        ...state,
        board: prev.board,
        gameStatus: prev.gameStatus,
        currentPlayer: 'red',
        selectedPos: null,
        validMoves: [],
        isThinking: false,
        history: state.history.slice(0, -1),
      };
    }

    case 'RESTART':
      return { ...initialState, board: createInitialBoard() };
  }
}
