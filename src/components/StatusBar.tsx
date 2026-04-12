import Alert from '@mui/material/Alert';
import type { GameStatus, Player } from '../types';

interface StatusBarProps {
  gameStatus: GameStatus;
  currentPlayer: Player;
  isThinking: boolean;
}

export function StatusBar({ gameStatus, currentPlayer, isThinking }: StatusBarProps) {
  if (gameStatus === 'red_wins') {
    return (
      <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
        🎉 You win! Congratulations!
      </Alert>
    );
  }

  if (gameStatus === 'black_wins') {
    return (
      <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
        😔 Computer wins! Better luck next time.
      </Alert>
    );
  }

  if (currentPlayer === 'black') {
    return (
      <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
        {isThinking ? '⚫ Computer is thinking…' : "⚫ Computer's turn"}
      </Alert>
    );
  }

  if (currentPlayer === 'red') {
    return (
      <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
        🔴 Your turn — click a piece to move
      </Alert>
    );
  }

  // Exhaustive fallback — GameStatus is currently a 3-value union but this guards
  // against future additions (e.g. 'draw') reaching this component unhandled.
  return null;
}
