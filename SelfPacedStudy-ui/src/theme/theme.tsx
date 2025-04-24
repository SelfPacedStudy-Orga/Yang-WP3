import { ThemeOptions } from '@mui/material/styles';
import '@fontsource/roboto';

export const themeOptions: ThemeOptions = {
  palette: {
    secondary: {
      main: '#0065bd',
      dark: '#005293',
      light: '#64a0c8'
    },
  },
  typography: {
    fontFamily: 'Roboto',
    fontWeightLight: 200,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 800,
  },
  components: {
    MuiTypography: {
      defaultProps: {
        color: 'rgba(0, 0, 0, 0.8)',
        letterSpacing: '0.418px',
      }
    },
    MuiButton: {
      styleOverrides: {
          root: ({ theme }) => ({
              '&.MuiButton-containedPrimary': {
                  backgroundColor: theme.palette.secondary.main,
              },
              '&.MuiButton-containedPrimary:hover': {
                  backgroundColor: theme.palette.secondary.dark,
              }
          }),
      },
    }
  }
};