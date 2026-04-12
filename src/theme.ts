import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff',
    },
    background: {
      default: '#1a1a2e',
      paper: '#16213e',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
  },
});

export default theme;
