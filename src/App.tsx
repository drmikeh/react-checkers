import { useReducer, useEffect, useState } from 'react';
import { countPieces } from './gameLogic';
import { getBestMove } from './ai';
import { gameReducer, initialState } from './reducer';
import { Board } from './components/Board';
import './App.css';

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
    <div className="app">
      <h1 className="game-title">♟ Checkers</h1>
      <div className="game-layout">
        <div className="board-column">
          <Board
            board={board}
            selectedPos={selectedPos}
            validMoves={validMoves}
            onSquareClick={pos => dispatch({ type: 'SQUARE_CLICK', pos })}
            disabled={gameStatus !== 'playing' || currentPlayer !== 'red' || isThinking}
          />
          <div className="board-labels">
            {['a','b','c','d','e','f','g','h'].map(l => (
              <span key={l} className="col-label">{l}</span>
            ))}
          </div>
        </div>

        <div className="side-panel">
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

          <div className="action-buttons">
            <button
              className="undo-btn"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isThinking}
            >
              ↩ Undo
            </button>
            <button className="restart-btn" onClick={() => dispatch({ type: 'RESTART' })}>
              🔄 New Game
            </button>
          </div>

          <div className="depth-control">
            <label htmlFor="depth-slider" className="depth-label">
              AI Difficulty — Depth: <span className="depth-value">{depth}</span>
            </label>
            <input
              id="depth-slider"
              type="range"
              min={1}
              max={7}
              value={depth}
              onChange={e => setDepth(Number(e.target.value))}
              disabled={isThinking}
              className="depth-slider"
            />
            <div className="depth-hints">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>

          <p className="rules-hint">
            Red moves up · Black moves down · Click a piece, then click its destination · Jumps are mandatory
          </p>
        </div>
      </div>
    </div>
  );
}
