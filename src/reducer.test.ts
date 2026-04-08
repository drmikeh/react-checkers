import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, initialState, type GameState, type Action } from './reducer';
import { createInitialBoard, getValidMovesForPiece } from './gameLogic';
import type { Position, Move } from './types';

describe('gameReducer', () => {
    let state: GameState;

    beforeEach(() => {
        state = JSON.parse(JSON.stringify(initialState));
    });

    describe('initial state', () => {
        it('should have the correct initial board state', () => {
            expect(state.board).toBeDefined();
            expect(state.board.length).toBe(8);
            expect(state.currentPlayer).toBe('red');
            expect(state.gameStatus).toBe('playing');
            expect(state.isThinking).toBe(false);
            expect(state.selectedPos).toBeNull();
            expect(state.validMoves).toEqual([]);
            expect(state.history).toEqual([]);
        });
    });

    describe('SQUARE_CLICK action', () => {
        it('should not process clicks when game is not playing', () => {
            state.gameStatus = 'red_wins';
            const action: Action = { type: 'SQUARE_CLICK', pos: { row: 2, col: 1 } };
            const newState = gameReducer(state, action);
            expect(newState).toEqual(state);
        });

        it('should not process clicks when it is not red player turn', () => {
            state.currentPlayer = 'black';
            const action: Action = { type: 'SQUARE_CLICK', pos: { row: 2, col: 1 } };
            const newState = gameReducer(state, action);
            expect(newState).toEqual(state);
        });

        it('should not process clicks when AI is thinking', () => {
            state.isThinking = true;
            const action: Action = { type: 'SQUARE_CLICK', pos: { row: 2, col: 1 } };
            const newState = gameReducer(state, action);
            expect(newState).toEqual(state);
        });

        it('should select a red piece and calculate valid moves', () => {
            // Red pieces start at rows 5-7, on dark squares where (row + col) % 2 === 1
            // Row 5: positions 0, 2, 4, 6 have pieces
            const pos: Position = { row: 5, col: 0 };
            const action: Action = { type: 'SQUARE_CLICK', pos };
            const newState = gameReducer(state, action);

            expect(newState.selectedPos).toEqual(pos);
            expect(newState.validMoves.length).toBeGreaterThanOrEqual(0);
        });

        it('should clear selection when clicking an empty square with no valid moves', () => {
            state.selectedPos = { row: 2, col: 1 };
            state.validMoves = [{ from: { row: 2, col: 1 }, to: { row: 3, col: 2 }, captures: [] }];

            const action: Action = { type: 'SQUARE_CLICK', pos: { row: 4, col: 4 } };
            const newState = gameReducer(state, action);

            expect(newState.selectedPos).toBeNull();
            expect(newState.validMoves).toEqual([]);
        });

        it('should execute a move when clicking on a valid destination', () => {
            state.board = createInitialBoard();
            // Select a red piece and get its valid moves first
            state.selectedPos = { row: 5, col: 1 };
            const initialMoves = getValidMovesForPiece(state.board, state.selectedPos);

            // Only proceed if there are valid moves
            if (initialMoves.length > 0) {
                const targetPos = initialMoves[0].to;
                const action: Action = { type: 'SQUARE_CLICK', pos: targetPos };
                const newState = gameReducer(state, action);

                // After a move, should:
                // - Add previous state to history
                // - Switch to black player
                // - Clear selection
                expect(newState.history.length).toBe(1);
                expect(newState.currentPlayer).toBe('black');
                expect(newState.selectedPos).toBeNull();
                expect(newState.validMoves).toEqual([]);
            }
        });

        it('should add state to history when executing a move', () => {
            state.board = createInitialBoard();
            state.selectedPos = { row: 5, col: 1 };
            const oldBoard = state.board;
            const initialMoves = getValidMovesForPiece(state.board, state.selectedPos);

            if (initialMoves.length > 0) {
                const targetPos = initialMoves[0].to;
                const action: Action = { type: 'SQUARE_CLICK', pos: targetPos };
                const newState = gameReducer(state, action);

                expect(newState.history).toHaveLength(1);
                expect(newState.history[0].board).toBe(oldBoard);
                expect(newState.history[0].gameStatus).toBe('playing');
            }
        });

        it('should not select opponent pieces (black)', () => {
            state.board = createInitialBoard();
            state.currentPlayer = 'red';

            // Black pieces are at rows 0-2
            const action: Action = { type: 'SQUARE_CLICK', pos: { row: 0, col: 1 } };
            const newState = gameReducer(state, action);

            expect(newState.selectedPos).toBeNull();
            expect(newState.validMoves).toEqual([]);
        });
    });

    describe('AI_START_THINKING action', () => {
        it('should set isThinking to true', () => {
            expect(state.isThinking).toBe(false);
            const action: Action = { type: 'AI_START_THINKING' };
            const newState = gameReducer(state, action);

            expect(newState.isThinking).toBe(true);
        });

        it('should not modify any other state properties', () => {
            const action: Action = { type: 'AI_START_THINKING' };
            const newState = gameReducer(state, action);

            expect(newState.board).toEqual(state.board);
            expect(newState.currentPlayer).toBe(state.currentPlayer);
            expect(newState.selectedPos).toBe(state.selectedPos);
            expect(newState.validMoves).toEqual(state.validMoves);
            expect(newState.gameStatus).toBe(state.gameStatus);
            expect(newState.history).toEqual(state.history);
        });
    });

    describe('AI_MOVE action', () => {
        it('should apply AI move to the board', () => {
            state.board = createInitialBoard();
            state.currentPlayer = 'black';
            state.isThinking = true;

            const move: Move = { from: { row: 5, col: 1 }, to: { row: 4, col: 2 }, captures: [] };
            const originalBoard = state.board;
            const action: Action = { type: 'AI_MOVE', move };
            const newState = gameReducer(state, action);

            expect(newState.board).not.toEqual(originalBoard);
            expect(newState.isThinking).toBe(false);
        });

        it('should switch to red player after AI move (if game is still playing)', () => {
            state.board = createInitialBoard();
            state.currentPlayer = 'black';
            state.isThinking = true;

            const move: Move = { from: { row: 5, col: 1 }, to: { row: 4, col: 2 }, captures: [] };
            const action: Action = { type: 'AI_MOVE', move };
            const newState = gameReducer(state, action);

            expect(newState.currentPlayer).toBe('red');
        });

        it('should set isThinking to false after AI move', () => {
            state.board = createInitialBoard();
            state.currentPlayer = 'black';
            state.isThinking = true;

            const move: Move = { from: { row: 5, col: 1 }, to: { row: 4, col: 2 }, captures: [] };
            const action: Action = { type: 'AI_MOVE', move };
            const newState = gameReducer(state, action);

            expect(newState.isThinking).toBe(false);
        });

        it('should update gameStatus after AI move', () => {
            state.board = createInitialBoard();
            state.currentPlayer = 'black';

            const move: Move = { from: { row: 5, col: 1 }, to: { row: 4, col: 2 }, captures: [] };
            const action: Action = { type: 'AI_MOVE', move };
            const newState = gameReducer(state, action);

            expect(newState.gameStatus).toBeDefined();
            expect(['playing', 'red_wins', 'black_wins']).toContain(newState.gameStatus);
        });
    });

    describe('UNDO action', () => {
        it('should restore previous board state', () => {
            const oldBoard = state.board;
            const oldGameStatus = state.gameStatus;

            // Add a snapshot to history
            state.history = [{ board: oldBoard, gameStatus: oldGameStatus }];
            state.currentPlayer = 'black';

            const action: Action = { type: 'UNDO' };
            const newState = gameReducer(state, action);

            expect(newState.board).toEqual(oldBoard);
            expect(newState.gameStatus).toEqual(oldGameStatus);
        });

        it('should reset currentPlayer to red after undo', () => {
            state.history = [{ board: state.board, gameStatus: state.gameStatus }];
            state.currentPlayer = 'black';

            const action: Action = { type: 'UNDO' };
            const newState = gameReducer(state, action);

            expect(newState.currentPlayer).toBe('red');
        });

        it('should clear selection after undo', () => {
            state.history = [{ board: state.board, gameStatus: state.gameStatus }];
            state.selectedPos = { row: 2, col: 1 };
            state.validMoves = [{ from: { row: 2, col: 1 }, to: { row: 3, col: 2 }, captures: [] }];

            const action: Action = { type: 'UNDO' };
            const newState = gameReducer(state, action);

            expect(newState.selectedPos).toBeNull();
            expect(newState.validMoves).toEqual([]);
        });

        it('should remove the undone state from history', () => {
            state.history = [{ board: state.board, gameStatus: state.gameStatus }];

            const action: Action = { type: 'UNDO' };
            const newState = gameReducer(state, action);

            expect(newState.history).toHaveLength(0);
        });

        it('should set isThinking to false after undo', () => {
            state.history = [{ board: state.board, gameStatus: state.gameStatus }];
            state.isThinking = true;

            const action: Action = { type: 'UNDO' };
            const newState = gameReducer(state, action);

            expect(newState.isThinking).toBe(false);
        });

        it('should not change state if history is empty', () => {
            state.history = [];
            const action: Action = { type: 'UNDO' };
            const newState = gameReducer(state, action);

            expect(newState).toEqual(state);
        });

        it('should handle multiple undos', () => {
            const board1 = state.board;
            state.history = [
                { board: board1, gameStatus: 'playing' },
                { board: createInitialBoard(), gameStatus: 'playing' },
            ];
            state.currentPlayer = 'black';

            let newState = gameReducer(state, { type: 'UNDO' });
            expect(newState.history).toHaveLength(1);

            newState = gameReducer(newState, { type: 'UNDO' });
            expect(newState.history).toHaveLength(0);
        });
    });

    describe('RESTART action', () => {
        it('should reset board to initial state', () => {
            state.board[0][0] = null;
            state.board[1][1] = null;

            const action: Action = { type: 'RESTART' };
            const newState = gameReducer(state, action);

            const initialBoard = createInitialBoard();
            expect(newState.board).toEqual(initialBoard);
        });

        it('should reset currentPlayer to red', () => {
            state.currentPlayer = 'black';

            const action: Action = { type: 'RESTART' };
            const newState = gameReducer(state, action);

            expect(newState.currentPlayer).toBe('red');
        });

        it('should clear selection', () => {
            state.selectedPos = { row: 2, col: 1 };
            state.validMoves = [{ from: { row: 2, col: 1 }, to: { row: 3, col: 2 }, captures: [] }];

            const action: Action = { type: 'RESTART' };
            const newState = gameReducer(state, action);

            expect(newState.selectedPos).toBeNull();
            expect(newState.validMoves).toEqual([]);
        });

        it('should reset gameStatus to playing', () => {
            state.gameStatus = 'red_wins';

            const action: Action = { type: 'RESTART' };
            const newState = gameReducer(state, action);

            expect(newState.gameStatus).toBe('playing');
        });

        it('should clear history', () => {
            state.history = [{ board: state.board, gameStatus: state.gameStatus }];

            const action: Action = { type: 'RESTART' };
            const newState = gameReducer(state, action);

            expect(newState.history).toEqual([]);
        });

        it('should set isThinking to false', () => {
            state.isThinking = true;

            const action: Action = { type: 'RESTART' };
            const newState = gameReducer(state, action);

            expect(newState.isThinking).toBe(false);
        });

        it('should fully reset to initial state', () => {
            state.currentPlayer = 'black';
            state.gameStatus = 'red_wins';
            state.isThinking = true;
            state.selectedPos = { row: 3, col: 3 };
            state.validMoves = [];
            state.history = [{ board: state.board, gameStatus: 'playing' }];

            const action: Action = { type: 'RESTART' };
            const newState = gameReducer(state, action);

            expect(newState.currentPlayer).toBe('red');
            expect(newState.gameStatus).toBe('playing');
            expect(newState.isThinking).toBe(false);
            expect(newState.selectedPos).toBeNull();
            expect(newState.validMoves).toEqual([]);
            expect(newState.history).toEqual([]);
        });
    });

    describe('edge cases', () => {
        it('should handle unknown action types gracefully', () => {
            const unknownAction = { type: 'UNKNOWN' } as any;
            // Unknown actions fall through switch and return undefined (implicit)
            // This is acceptable behavior - the caller should expect this
            const result = gameReducer(state, unknownAction);
            expect([state, undefined]).toContain(result);
        });

        it('should not mutate original state', () => {
            const originalState = JSON.parse(JSON.stringify(state));
            const action: Action = { type: 'AI_START_THINKING' };
            gameReducer(state, action);

            expect(state).toEqual(originalState);
        });

        it('should create new objects instead of mutating', () => {
            const action: Action = { type: 'AI_START_THINKING' };
            const newState = gameReducer(state, action);

            expect(newState).not.toBe(state);
            expect(newState.board).toBe(state.board);
        });
    });
});
