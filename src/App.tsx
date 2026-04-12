import { useReducer, useEffect, useState } from 'react';
import { countPieces } from './gameLogic';
import { getBestMove } from './ai';
import { gameReducer, initialState } from './reducer';
import { Board } from './components/Board';

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
    <div className="flex flex-col items-center px-4 pt-6 pb-10 min-h-screen">
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
        ♟ Checkers
      </h1>

      <div className="flex flex-col items-start gap-10 md:flex-row">

        {/* Board column — board-wrapper sets --sq for both the grid and labels */}
        <div className="board-wrapper flex flex-col items-center">
          <Board
            board={board}
            selectedPos={selectedPos}
            validMoves={validMoves}
            onSquareClick={pos => dispatch({ type: 'SQUARE_CLICK', pos })}
            disabled={gameStatus !== 'playing' || currentPlayer !== 'red' || isThinking}
          />
          <div className="flex justify-around mt-1 text-xs text-gray-500 dark:text-gray-400 w-[calc(var(--sq)*8)]">
            {['a','b','c','d','e','f','g','h'].map(l => (
              <span key={l} className="text-center w-[var(--sq)]">{l}</span>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col items-center pt-2 w-full md:w-72">

          {/* Scoreboard */}
          <div className="flex flex-col gap-2 mb-3 w-full text-sm">
            <div className="flex flex-col items-center py-2 px-5 rounded-lg bg-red-500/10 border border-red-500/30">
              <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">You (Red)</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pieces.red} pieces {pieces.redKings > 0 ? `· ${pieces.redKings} 👑` : ''}
              </span>
            </div>
            <div className="text-sm text-center text-gray-500 font-medium">vs</div>
            <div className="flex flex-col items-center py-2 px-5 rounded-lg bg-gray-500/10 border border-gray-500/30">
              <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">Computer (Black)</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pieces.black} pieces {pieces.blackKings > 0 ? `· ${pieces.blackKings} 👑` : ''}
              </span>
            </div>
          </div>

          {/* Status bar */}
          <div className="min-h-9 flex items-center justify-center text-center text-base mb-3 text-gray-900 dark:text-gray-100 w-full">
            {gameStatus === 'playing' ? (
              currentPlayer === 'red'
                ? <span>🔴 Your turn — click a piece to move</span>
                : <span>{isThinking ? '⚫ Computer is thinking…' : "⚫ Computer's turn"}</span>
            ) : (
              <span className="font-semibold text-lg animate-pop">
                {gameStatus === 'red_wins' ? '🎉 You win! Congratulations!' : '😔 Computer wins! Better luck next time.'}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5 w-full justify-center">
            <button
              className="px-8 py-2.5 text-base rounded-lg bg-[#3a5a8a] text-white shadow-md
                         hover:enabled:bg-[#4a6fa0] hover:enabled:-translate-y-px
                         disabled:bg-[#8a9ab0] disabled:opacity-60 disabled:cursor-not-allowed
                         active:translate-y-0 transition-all cursor-pointer border-0"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isThinking}
            >
              ↩ Undo
            </button>
            <button
              className="px-8 py-2.5 text-base rounded-lg bg-[#5c3417] text-white shadow-md
                         hover:bg-[#7a4a22] hover:-translate-y-px
                         active:translate-y-0 transition-all cursor-pointer border-0"
              onClick={() => dispatch({ type: 'RESTART' })}
            >
              🔄 New Game
            </button>
          </div>

          {/* Depth control */}
          <div className="flex flex-col items-center gap-1.5 mt-5 w-full">
            <label htmlFor="depth-slider" className="text-sm font-medium text-gray-900 dark:text-gray-100">
              AI Difficulty — Depth: <span className="font-bold text-[#5c3417]">{depth}</span>
            </label>
            <input
              id="depth-slider"
              type="range"
              min={1}
              max={7}
              value={depth}
              onChange={e => setDepth(Number(e.target.value))}
              disabled={isThinking}
              className="w-full accent-[#5c3417] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between w-full text-xs text-gray-500 dark:text-gray-400 opacity-70">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>

          <p className="mt-3.5 text-xs text-gray-500 dark:text-gray-400 opacity-70 text-center">
            Red moves up · Black moves down · Click a piece, then click its destination · Jumps are mandatory
          </p>
        </div>
      </div>
    </div>
  );
}
