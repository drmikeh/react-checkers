import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ScoreBoardProps {
  red: number;
  redKings: number;
  black: number;
  blackKings: number;
}

export function ScoreBoard({ red, redKings, black, blackKings }: ScoreBoardProps) {
  const kingLabel = (kings: number) => kings > 0 ? ` · ${kings} 👑` : '';

  return (
    <Stack spacing={1} width="100%">
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          textAlign: 'center',
          bgcolor: 'rgba(220, 50, 50, 0.12)',
          border: '1px solid rgba(220, 50, 50, 0.3)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="error.light">
          You (Red)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {red} pieces{kingLabel(redKings)}
        </Typography>
      </Paper>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        vs
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          textAlign: 'center',
          bgcolor: 'rgba(50, 50, 50, 0.25)',
          border: '1px solid rgba(150, 150, 150, 0.2)',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          Computer (Black)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {black} pieces{kingLabel(blackKings)}
        </Typography>
      </Paper>
    </Stack>
  );
}
