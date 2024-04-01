import { createTheme } from '@mui/material/styles';
import '@fontsource/biz-udpgothic';

const fontFamilySet = [
  '"BIZ UDPGothic"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

const typographyStyles = {
  fontFamily: fontFamilySet,
  h3: {
    fontSize: '35px',
  },
  caption: {
    fontSize: '11px',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5a3fb5',
    },
    secondary: {
      main: '#ef0a0a',
    },
  },
  typography: {
    ...typographyStyles,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html, body, #root {
          height: 100%;
          margin: 0;
        },
        ::-webkit-scrollbar {
          width: 11px;
          height: 11px;
          background-color: #eeeeee;
        },
        ::-webkit-scrollbar:hover {
          background-color: #cccccc;
        },
        ::-webkit-scrollbar-thumb {
          background: #7c7d87;
          opacity: 0.5;
          border-radius: 6px;
        },`,
    },
  },
});
