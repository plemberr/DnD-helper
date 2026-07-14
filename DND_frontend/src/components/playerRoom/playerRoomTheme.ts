import { alpha, createTheme } from '@mui/material/styles';

export const playerRoomColors = {
  void: '#0b090c',
  backdrop: '#110e12',
  panel: '#181316',
  panelRaised: '#21191b',
  burgundy: '#57252d',
  burgundyDeep: '#32151b',
  brass: '#a97b3f',
  gold: '#d2ad67',
  text: '#e8ddc6',
  textMuted: '#a99d88',
  border: 'rgba(199, 157, 91, 0.35)',
  hp: '#8f3035',
  positive: '#647d59',
} as const;

export const playerRoomTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: playerRoomColors.gold,
      light: '#ead39e',
      dark: playerRoomColors.brass,
      contrastText: playerRoomColors.void,
    },
    secondary: {
      main: '#8c4650',
      dark: playerRoomColors.burgundy,
      contrastText: playerRoomColors.text,
    },
    error: { main: '#c45b5f' },
    success: { main: playerRoomColors.positive },
    background: {
      default: playerRoomColors.void,
      paper: playerRoomColors.panel,
    },
    text: {
      primary: playerRoomColors.text,
      secondary: playerRoomColors.textMuted,
    },
    divider: playerRoomColors.border,
  },
  shape: { borderRadius: 5 },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontFamily: 'Georgia, Palatino, serif', fontWeight: 600 },
    h2: { fontFamily: 'Georgia, Palatino, serif', fontWeight: 600 },
    h3: { fontFamily: 'Georgia, Palatino, serif', fontWeight: 600 },
    h4: { fontFamily: 'Georgia, Palatino, serif', fontWeight: 600 },
    h5: { fontFamily: 'Georgia, Palatino, serif', fontWeight: 600 },
    h6: { fontFamily: 'Georgia, Palatino, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.035em' },
    overline: { fontWeight: 700, letterSpacing: '0.14em' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          color: playerRoomColors.text,
          backgroundColor: playerRoomColors.panel,
          backgroundImage: `linear-gradient(145deg, ${alpha('#ffffff', 0.025)}, transparent 38%), linear-gradient(180deg, ${alpha(playerRoomColors.burgundy, 0.08)}, transparent 60%)`,
          border: `1px solid ${playerRoomColors.border}`,
          boxShadow: `0 18px 50px ${alpha('#000000', 0.38)}, inset 0 1px 0 ${alpha(playerRoomColors.gold, 0.08)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          color: playerRoomColors.text,
          backgroundColor: playerRoomColors.panel,
          backgroundImage: `linear-gradient(145deg, ${alpha('#ffffff', 0.025)}, transparent 45%)`,
          borderColor: playerRoomColors.border,
          boxShadow: `inset 0 1px 0 ${alpha(playerRoomColors.gold, 0.06)}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 38,
          borderRadius: 3,
          paddingInline: 18,
          '&.Mui-focusVisible': {
            outline: `2px solid ${playerRoomColors.gold}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          color: playerRoomColors.void,
          background: `linear-gradient(180deg, #d8b977 0%, ${playerRoomColors.brass} 100%)`,
          border: `1px solid ${alpha('#fff3ce', 0.35)}`,
          '&:hover': {
            background: 'linear-gradient(180deg, #ead092 0%, #b98b4c 100%)',
          },
        },
        outlined: {
          borderColor: playerRoomColors.border,
          backgroundColor: alpha(playerRoomColors.void, 0.32),
          '&:hover': {
            borderColor: playerRoomColors.gold,
            backgroundColor: alpha(playerRoomColors.gold, 0.07),
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 50 },
        indicator: {
          height: 2,
          background: `linear-gradient(90deg, transparent, ${playerRoomColors.gold}, transparent)`,
          boxShadow: `0 0 14px ${alpha(playerRoomColors.gold, 0.7)}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 50,
          color: playerRoomColors.textMuted,
          fontFamily: 'Georgia, Palatino, serif',
          fontSize: '0.78rem',
          letterSpacing: '0.11em',
          textTransform: 'uppercase',
          transition: 'color 160ms ease, background-color 160ms ease',
          '&:hover': {
            color: playerRoomColors.text,
            backgroundColor: alpha(playerRoomColors.gold, 0.04),
          },
          '&.Mui-selected': { color: playerRoomColors.gold },
          '&.Mui-focusVisible': {
            outline: `2px solid ${playerRoomColors.gold}`,
            outlineOffset: -3,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          backgroundColor: alpha(playerRoomColors.void, 0.48),
          '& .MuiOutlinedInput-notchedOutline': { borderColor: playerRoomColors.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(playerRoomColors.gold, 0.65) },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: playerRoomColors.gold,
            borderWidth: 1,
            boxShadow: `0 0 0 2px ${alpha(playerRoomColors.gold, 0.1)}`,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: playerRoomColors.textMuted } },
    },
    MuiSelect: {
      styleOverrides: { icon: { color: playerRoomColors.gold } },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#171215',
          border: `1px solid ${playerRoomColors.border}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': { backgroundColor: alpha(playerRoomColors.burgundy, 0.7) },
          '&.Mui-selected:hover': { backgroundColor: alpha(playerRoomColors.burgundy, 0.85) },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 9,
          borderRadius: 1,
          backgroundColor: alpha('#000000', 0.62),
          border: `1px solid ${alpha(playerRoomColors.gold, 0.2)}`,
        },
        bar: {
          borderRadius: 1,
          background: `linear-gradient(90deg, #682127, ${playerRoomColors.hp}, #b64a4f)`,
          boxShadow: `0 0 12px ${alpha(playerRoomColors.hp, 0.5)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          borderColor: playerRoomColors.border,
          backgroundColor: alpha(playerRoomColors.void, 0.3),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: playerRoomColors.text,
          backgroundColor: '#241a1d',
          border: `1px solid ${playerRoomColors.border}`,
          fontSize: '0.78rem',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&::before': { display: 'none' },
          '&.Mui-expanded': { margin: 0 },
        },
      },
    },
  },
});
