import { createTheme } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14, // Base font size
    h1: {
      fontSize: '2.2rem',
      fontWeight: 500, // Roboto looks better with slightly lighter weights
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9rem', // Slightly smaller body text
    },
    body2: {
      fontSize: '0.85rem', // Even smaller secondary text
    },
    button: {
      fontSize: '0.9rem',
      textTransform: 'none', // Prevents ALL CAPS buttons
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: '#0a8a0d',
      light: '#4791db',
      dark: '#115293',
      grey: '#c0bebe',
    },
    secondary: {
      main: '#26a69a',
      light: '#51b7ae',
      dark: '#00766c',
    },
    background: {
      default: '#f7f7f7',
      paper: '#ffffff',
      lighter: '#f5f5f5',
      yellow: '#f5f5f5',
      lightgrey: '#fbfbfb'
    },
    text: {
      primary: '#212a22',
      secondary: '#5A6872',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '6px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;