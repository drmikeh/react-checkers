import { useReducer, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { countPieces } from './gameLogic';
import { getBestMove } from './ai';
import { gameReducer, initialState } from './reducer';
import { Board } from './components/Board';
import { ScoreBoard } from './components/ScoreBoard';
import { StatusBar } from './components/StatusBar';
import { DepthControl } from './components/DepthControl';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px', mb: 2 }}>
        ♟ Checkers
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={5}
        sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
      >
        {/* Board column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Board
            board={board}
            selectedPos={selectedPos}
            validMoves={validMoves}
            onSquareClick={pos => dispatch({ type: 'SQUARE_CLICK', pos })}
            disabled={gameStatus !== 'playing' || currentPlayer !== 'red' || isThinking}
          />
          <Box sx={{ display: 'flex', width: { xs: 'calc(44px * 8)', sm: 'calc(68px * 8)' }, justifyContent: 'space-around', mt: 0.5 }}>
            {['a','b','c','d','e','f','g','h'].map(l => (
              <Typography key={l} variant="caption" color="text.disabled" sx={{ width: { xs: '44px', sm: '68px' }, textAlign: 'center' }}>
                {l}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Side panel */}
        <Stack spacing={2} sx={{ width: 280, pt: 1 }}>
          <ScoreBoard
            red={pieces.red}
            redKings={pieces.redKings}
            black={pieces.black}
            blackKings={pieces.blackKings}
          />

          <StatusBar
            gameStatus={gameStatus}
            currentPlayer={currentPlayer}
            isThinking={isThinking}
          />

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={history.length === 0 || isThinking}
            >
              ↩ Undo
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => dispatch({ type: 'RESTART' })}
            >
              🔄 New Game
            </Button>
          </Stack>

          <DepthControl
            depth={depth}
            onChange={setDepth}
            disabled={isThinking}
          />

          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
            Red moves up · Black moves down · Click a piece, then click its destination · Jumps are mandatory
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
