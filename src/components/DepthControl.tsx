import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

interface DepthControlProps {
  depth: number;
  onChange: (depth: number) => void;
  disabled: boolean;
}

export function DepthControl({ depth, onChange, disabled }: DepthControlProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        AI Difficulty — Depth:{' '}
        <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {depth}
        </Box>
      </Typography>
      <Slider
        value={depth}
        min={1}
        max={7}
        step={1}
        disabled={disabled}
        onChange={(_, value) => onChange(value as number)}
        sx={{ color: 'primary.main' }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.disabled">Easy</Typography>
        <Typography variant="caption" color="text.disabled">Hard</Typography>
      </Box>
    </Box>
  );
}
