import { useState, useEffect, useCallback } from 'react';
import type { Board as BoardType, Move, Position, GameStatus } from './types';
import {
  createInitialBoard,
  getValidMovesForPiece,
  applyMove,
  getGameStatus,
  countPieces,
} from './gameLogic';
import { getBestMove } from './ai';
import { Board } from './components/Board';
import './App.css';

interface Snapshot {
  board: BoardType;
  gameStatus: GameStatus;
}

export default function App() {
  const [board, setBoard] = useState<BoardType>(createInitialBoard);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'black'>('red');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<Snapshot[]>([]);

  const handleSquareClick = useCallback(
    (pos: Position) => {
      if (gameStatus !== 'playing' || currentPlayer !== 'red' || isThinking) return;

      const piece = board[pos.row][pos.col];

      const move = validMoves.find(m => m.to.row === pos.row && m.to.col === pos.col);
      if (move) {
        setHistory(h => [...h, { board, gameStatus }]);
        const newBoard = applyMove(board, move);
        const newStatus = getGameStatus(newBoard);
        setBoard(newBoard);
        setSelectedPos(null);
        setValidMoves([]);
        setGameStatus(newStatus);
        if (newStatus === 'playing') setCurrentPlayer('black');
        return;
      }

      if (piece?.player === 'red') {
        const moves = getValidMovesForPiece(board, pos);
        if (moves.length > 0) {
          setSelectedPos(pos);
          setValidMoves(moves);
        } else {
          setSelectedPos(null);
          setValidMoves([]);
        }
        return;
      }

      setSelectedPos(null);
      setValidMoves([]);
    },
    [board, validMoves, gameStatus, currentPlayer, isThinking]
  );

  useEffect(() => {
    if (gameStatus !== 'playing' || currentPlayer !== 'black') return;

    setIsThinking(true);

    const timer = setTimeout(() => {
      const bestMove = getBestMove(board, 5);
      if (bestMove) {
        const newBoard = applyMove(board, bestMove);
        const newStatus = getGameStatus(newBoard);
        setBoard(newBoard);
        setGameStatus(newStatus);
        if (newStatus === 'playing') setCurrentPlayer('red');
      }
      setIsThinking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentPlayer, gameStatus, board]);

  const handleUndo = () => {
    setHistory(h => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setBoard(prev.board);
      setGameStatus(prev.gameStatus);
      setCurrentPlayer('red');
      setSelectedPos(null);
      setValidMoves([]);
      setIsThinking(false);
      return h.slice(0, -1);
    });
  };

  const handleRestart = () => {
    setBoard(createInitialBoard());
    setSelectedPos(null);
    setValidMoves([]);
    setCurrentPlayer('red');
    setGameStatus('playing');
    setIsThinking(false);
    setHistory([]);
  };

  const pieces = countPieces(board);

  return (
    <div className="app">
      <h1 className="game-title">♟ Checkers</h1>

      <div className="scoreboard">
        <div className="score-card player">
          <span className="score-label">You (Red)</span>
          <span className="score-pieces">{pieces.red} pieces {pieces.redKings > 0 ? `· ${pieces.redKings} 👑` : ''}</span>
        </div>
        <div className="score-divider">vs</div>
        <div className="score-card computer">
          <span className="score-label">Computer (Black)</span>
          <span className="score-pieces">{pieces.black} pieces {pieces.blackKings > 0 ? `· ${pieces.blackKings} 👑` : ''}</span>
        </div>
      </div>

      <div className="status-bar">
        {gameStatus === 'playing' ? (
          currentPlayer === 'red'
            ? <span>🔴 Your turn — click a piece to move</span>
            : <span>{isThinking ? '⚫ Computer is thinking…' : '⚫ Computer\'s turn'}</span>
        ) : (
          <span className="winner-text">
            {gameStatus === 'red_wins' ? '🎉 You win! Congratulations!' : '😔 Computer wins! Better luck next time.'}
          </span>
        )}
      </div>

      <Board
        board={board}
        selectedPos={selectedPos}
        validMoves={validMoves}
        onSquareClick={handleSquareClick}
        disabled={gameStatus !== 'playing' || currentPlayer !== 'red' || isThinking}
      />

      <div className="board-labels">
        {['a','b','c','d','e','f','g','h'].map(l => (
          <span key={l} className="col-label">{l}</span>
        ))}
      </div>

      <div className="action-buttons">
        <button
          className="undo-btn"
          onClick={handleUndo}
          disabled={history.length === 0 || isThinking}
        >
          ↩ Undo
        </button>
        <button className="restart-btn" onClick={handleRestart}>
          🔄 New Game
        </button>
      </div>

      <p className="rules-hint">
        Red moves up · Black moves down · Click a piece, then click its destination · Jumps are mandatory
      </p>
    </div>
  );
}
