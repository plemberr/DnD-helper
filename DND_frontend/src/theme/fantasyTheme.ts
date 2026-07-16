import { createTheme, type SxProps, type Theme } from '@mui/material';

export const fantasyTokens = {
  bgDeepest: '#0c0908',
  bgPage: '#100b09',
  bgPanel: '#17110d',
  bgPanelRaised: '#1f1712',
  bgField: '#120d0a',
  border: 'rgba(201, 162, 74, 0.18)',
  borderStrong: 'rgba(201, 162, 74, 0.4)',
  gold: '#c9a24a',
  goldLight: '#e6c877',
  goldDark: '#a97f34',
  goldSoft: 'rgba(201, 162, 74, 0.12)',
  goldSofter: 'rgba(201, 162, 74, 0.08)',
  textPrimary: '#ece2d0',
  textSecondary: '#9c8b76',
  textDisabled: '#6d5e4d',
  bloodBright: '#a12d2c',
} as const;

export const fantasyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: fantasyTokens.gold,
      light: fantasyTokens.goldLight,
      dark: fantasyTokens.goldDark,
      contrastText: '#1a120a',
    },
    warning: {
      main: fantasyTokens.gold,
      light: fantasyTokens.goldLight,
      dark: fantasyTokens.goldDark,
      contrastText: '#1a120a',
      50: fantasyTokens.goldSofter,
      100: fantasyTokens.goldSoft,
    } as never,
    error: { main: fantasyTokens.bloodBright },
    background: {
      default: fantasyTokens.bgPage,
      paper: fantasyTokens.bgPanel,
    },
    text: {
      primary: fantasyTokens.textPrimary,
      secondary: fantasyTokens.textSecondary,
      disabled: fantasyTokens.textDisabled,
    },
    divider: fantasyTokens.border,
    grey: {
      50: fantasyTokens.bgPanel,
      100: fantasyTokens.bgDeepest,
      200: fantasyTokens.bgPanelRaised,
    } as never,
    action: {
      hover: fantasyTokens.goldSofter,
      selected: fantasyTokens.goldSoft,
    },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, letterSpacing: 0.5 },
    h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, letterSpacing: 0.5 },
    h3: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, letterSpacing: 0.5 },
    h4: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, letterSpacing: 0.5 },
    h5: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700 },
    h6: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: {
      letterSpacing: '0.18em',
      fontWeight: 700,
      color: fantasyTokens.textSecondary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: fantasyTokens.bgPage },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: fantasyTokens.bgPanel,
          border: `1px solid ${fantasyTokens.border}`,
        },
        outlined: {
          backgroundColor: fantasyTokens.bgPanelRaised,
          borderColor: fantasyTokens.border,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6 },
        containedPrimary: {
          background: `linear-gradient(180deg, ${fantasyTokens.goldLight} 0%, ${fantasyTokens.gold} 45%, ${fantasyTokens.goldDark} 100%)`,
          color: '#1a120a',
          border: `1px solid ${fantasyTokens.goldLight}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
          '&:hover': {
            background: `linear-gradient(180deg, ${fantasyTokens.goldLight} 0%, ${fantasyTokens.goldLight} 45%, ${fantasyTokens.gold} 100%)`,
          },
        },
        containedWarning: {
          background: `linear-gradient(180deg, ${fantasyTokens.goldLight} 0%, ${fantasyTokens.gold} 45%, ${fantasyTokens.goldDark} 100%)`,
          color: '#1a120a',
          border: `1px solid ${fantasyTokens.goldLight}`,
        },
        outlinedWarning: {
          borderColor: fantasyTokens.borderStrong,
          color: fantasyTokens.goldLight,
          '&:hover': { borderColor: fantasyTokens.gold, backgroundColor: fantasyTokens.goldSofter },
        },
        outlinedInherit: {
          borderColor: fantasyTokens.border,
          color: fantasyTokens.textSecondary,
          '&:hover': { borderColor: fantasyTokens.textSecondary, backgroundColor: fantasyTokens.goldSofter },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: fantasyTokens.border,
          color: fantasyTokens.textPrimary,
          '&:hover': { borderColor: fantasyTokens.borderStrong },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: fantasyTokens.border },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: fantasyTokens.textSecondary,
          '&:hover': { color: fantasyTokens.goldLight, backgroundColor: fantasyTokens.goldSofter },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: fantasyTokens.bgField,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: fantasyTokens.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: fantasyTokens.borderStrong },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: fantasyTokens.gold },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: fantasyTokens.textSecondary,
          borderColor: fantasyTokens.border,
          '&.Mui-selected': {
            color: fantasyTokens.goldLight,
            backgroundColor: fantasyTokens.goldSoft,
            '&:hover': { backgroundColor: fantasyTokens.goldSoft },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: fantasyTokens.gold },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: fantasyTokens.textSecondary,
          '&.Mui-selected': { color: fantasyTokens.goldLight },
        },
      },
    },
  },
});


export const ornateCornersSx: SxProps<Theme> = {
  position: 'relative',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: 14,
    height: 14,
    pointerEvents: 'none',
    borderColor: fantasyTokens.borderStrong,
  },
  '&::before': {
    top: 6,
    left: 6,
    borderTop: `1px solid ${fantasyTokens.borderStrong}`,
    borderLeft: `1px solid ${fantasyTokens.borderStrong}`,
  },
  '&::after': {
    bottom: 6,
    right: 6,
    borderBottom: `1px solid ${fantasyTokens.borderStrong}`,
    borderRight: `1px solid ${fantasyTokens.borderStrong}`,
  },
};

export const fantasyPageBackground = `radial-gradient(1200px 600px at 50% -10%, ${fantasyTokens.bgPanel} 0%, ${fantasyTokens.bgPage} 45%, ${fantasyTokens.bgDeepest} 100%)`;
