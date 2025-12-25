import { createTheme } from '@mui/material/styles';
import '@fontsource/biz-udpgothic';
import '@fontsource/barlow-semi-condensed';

const fontFamilySet = [
  '"Barlow Semi Condensed"',
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
});
