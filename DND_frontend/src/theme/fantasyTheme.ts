import type { SxProps } from '@mui/material';
import { alpha, createTheme, type Theme } from '@mui/material/styles';

export const fantasyColors = {
  void: '#0b090c',
  backdrop: '#110e12',
  panel: '#181316',
  panelRaised: '#21191b',
  field: '#120d0a',
  burgundy: '#57252d',
  burgundyDeep: '#32151b',
  brass: '#a97b3f',
  gold: '#d2ad67',
  goldLight: '#ead39e',
  text: '#e8ddc6',
  textMuted: '#a99d88',
  textDisabled: '#6d5e4d',
  border: 'rgba(199, 157, 91, 0.35)',
  borderStrong: 'rgba(210, 173, 103, 0.62)',
  hp: '#8f3035',
  positive: '#647d59',
} as const;

/**
 * Совместимость с компонентами из main, которые используют старые имена токенов.
 * Новые компоненты могут использовать fantasyColors напрямую.
 */
export const fantasyTokens = {
  bgDeepest: fantasyColors.void,
  bgPage: fantasyColors.backdrop,
  bgPanel: fantasyColors.panel,
  bgPanelRaised: fantasyColors.panelRaised,
  bgField: fantasyColors.field,
  border: fantasyColors.border,
  borderStrong: fantasyColors.borderStrong,
  gold: fantasyColors.gold,
  goldLight: fantasyColors.goldLight,
  goldDark: fantasyColors.brass,
  goldSoft: alpha(fantasyColors.gold, 0.12),
  goldSofter: alpha(fantasyColors.gold, 0.08),
  textPrimary: fantasyColors.text,
  textSecondary: fantasyColors.textMuted,
  textDisabled: fantasyColors.textDisabled,
  bloodBright: fantasyColors.hp,
} as const;

export const fantasyGradients = {
  backdrop: `radial-gradient(circle at 18% -10%, ${alpha(
    fantasyColors.burgundy,
    0.3,
  )}, transparent 34%), radial-gradient(circle at 92% 108%, ${alpha(
    fantasyColors.brass,
    0.12,
  )}, transparent 32%), linear-gradient(135deg, ${fantasyColors.void} 0%, ${
    fantasyColors.backdrop
  } 46%, #090709 100%)`,
  panel: `linear-gradient(145deg, ${alpha(
    '#ffffff',
    0.025,
  )}, transparent 38%), linear-gradient(180deg, ${alpha(
    fantasyColors.burgundy,
    0.08,
  )}, transparent 60%)`,
  panelRaised: `linear-gradient(128deg, ${alpha(
    fantasyColors.burgundyDeep,
    0.58,
  )}, transparent 42%), linear-gradient(145deg, ${
    fantasyColors.panelRaised
  }, ${fantasyColors.panel} 72%)`,
  primaryAction: `linear-gradient(180deg, #d8b977 0%, ${fantasyColors.brass} 100%)`,
  ornament: `linear-gradient(90deg, transparent, ${fantasyColors.borderStrong}, transparent)`,
} as const;

export const fantasyShadows = {
  panel: `0 18px 50px ${alpha(
    '#000000',
    0.38,
  )}, inset 0 1px 0 ${alpha(fantasyColors.gold, 0.08)}`,
  raised: `0 24px 70px ${alpha(
    '#000000',
    0.52,
  )}, 0 0 42px ${alpha(
    fantasyColors.burgundy,
    0.16,
  )}, inset 0 1px 0 ${alpha(fantasyColors.gold, 0.1)}`,
  goldGlow: `0 0 22px ${alpha(fantasyColors.gold, 0.13)}`,
} as const;

export const fantasyBackdropSx = {
  position: 'relative',
  minHeight: '100dvh',
  color: fantasyColors.text,
  background: fantasyGradients.backdrop,
  isolation: 'isolate',
  '&::before': {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    content: "''",
    opacity: 0.32,
    backgroundImage: `repeating-linear-gradient(118deg, transparent 0 18px, ${alpha(
      fantasyColors.gold,
      0.012,
    )} 19px 20px), repeating-linear-gradient(28deg, transparent 0 25px, ${alpha(
      '#ffffff',
      0.009,
    )} 26px 27px)`,
  },
  '&::after': {
    position: 'fixed',
    inset: 0,
    zIndex: 2,
    pointerEvents: 'none',
    content: "''",
    boxShadow: `inset 0 0 120px 34px ${alpha('#000000', 0.64)}`,
  },
} satisfies SxProps<Theme>;

export const fantasyFrameSx = {
  position: 'relative',
  '&::before, &::after': {
    position: 'absolute',
    zIndex: 2,
    width: 18,
    height: 18,
    pointerEvents: 'none',
    content: "''",
  },
  '&::before': {
    top: 5,
    left: 5,
    borderTop: `1px solid ${alpha(fantasyColors.gold, 0.72)}`,
    borderLeft: `1px solid ${alpha(fantasyColors.gold, 0.72)}`,
  },
  '&::after': {
    right: 5,
    bottom: 5,
    borderRight: `1px solid ${alpha(fantasyColors.gold, 0.72)}`,
    borderBottom: `1px solid ${alpha(fantasyColors.gold, 0.72)}`,
  },
} satisfies SxProps<Theme>;

export const fantasyInsetSx = {
  border: `1px solid ${alpha(fantasyColors.gold, 0.2)}`,
  backgroundColor: alpha(fantasyColors.void, 0.38),
  boxShadow: `inset 0 1px 12px ${alpha('#000000', 0.3)}`,
} satisfies SxProps<Theme>;

/** Совместимость с компонентами из main. */
export const ornateCornersSx: SxProps<Theme> = fantasyFrameSx;
export const fantasyPageBackground = fantasyGradients.backdrop;

export const fantasyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: fantasyColors.gold,
      light: fantasyColors.goldLight,
      dark: fantasyColors.brass,
      contrastText: fantasyColors.void,
    },
    secondary: {
      main: '#8c4650',
      dark: fantasyColors.burgundy,
      contrastText: fantasyColors.text,
    },
    error: {
      main: '#c45b5f',
    },
    warning: {
      main: fantasyColors.gold,
      light: fantasyColors.goldLight,
      dark: fantasyColors.brass,
      contrastText: fantasyColors.void,
    },
    info: {
      main: '#7d8da2',
    },
    success: {
      main: fantasyColors.positive,
    },
    background: {
      default: fantasyColors.void,
      paper: fantasyColors.panel,
    },
    text: {
      primary: fantasyColors.text,
      secondary: fantasyColors.textMuted,
      disabled: fantasyColors.textDisabled,
    },
    divider: fantasyColors.border,
    action: {
      hover: alpha(fantasyColors.gold, 0.08),
      selected: alpha(fantasyColors.gold, 0.12),
    },
  },
  shape: {
    borderRadius: 5,
  },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: {
      fontFamily: 'Georgia, Palatino, serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: 'Georgia, Palatino, serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Georgia, Palatino, serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Georgia, Palatino, serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Georgia, Palatino, serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Georgia, Palatino, serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.035em',
    },
    overline: {
      fontWeight: 700,
      letterSpacing: '0.14em',
      color: fantasyColors.textMuted,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: fantasyColors.void,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          color: fantasyColors.text,
          backgroundColor: fantasyColors.panel,
          backgroundImage: fantasyGradients.panel,
          border: `1px solid ${fantasyColors.border}`,
          boxShadow: fantasyShadows.panel,
        },
        outlined: {
          backgroundColor: fantasyColors.panelRaised,
          borderColor: fantasyColors.border,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          color: fantasyColors.text,
          backgroundColor: fantasyColors.panel,
          backgroundImage: `linear-gradient(145deg, ${alpha(
            '#ffffff',
            0.025,
          )}, transparent 45%)`,
          borderColor: fantasyColors.border,
          boxShadow: `inset 0 1px 0 ${alpha(fantasyColors.gold, 0.06)}`,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 38,
          borderRadius: 3,
          paddingInline: 18,
          '&.Mui-focusVisible': {
            outline: `2px solid ${fantasyColors.gold}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          color: fantasyColors.void,
          background: fantasyGradients.primaryAction,
          border: `1px solid ${alpha('#fff3ce', 0.35)}`,
          '&:hover': {
            background:
              'linear-gradient(180deg, #ead092 0%, #b98b4c 100%)',
          },
          '&.Mui-disabled': {
            color: alpha(fantasyColors.void, 0.6),
            background: alpha(fantasyColors.brass, 0.48),
            borderColor: alpha(fantasyColors.gold, 0.12),
          },
        },
        containedWarning: {
          color: fantasyColors.void,
          background: fantasyGradients.primaryAction,
          border: `1px solid ${alpha('#fff3ce', 0.35)}`,
        },
        outlined: {
          borderColor: fantasyColors.border,
          backgroundColor: alpha(fantasyColors.void, 0.32),
          '&:hover': {
            borderColor: fantasyColors.gold,
            backgroundColor: alpha(fantasyColors.gold, 0.07),
          },
        },
        outlinedWarning: {
          borderColor: fantasyColors.borderStrong,
          color: fantasyColors.goldLight,
          '&:hover': {
            borderColor: fantasyColors.gold,
            backgroundColor: alpha(fantasyColors.gold, 0.08),
          },
        },
        outlinedInherit: {
          borderColor: fantasyColors.border,
          color: fantasyColors.textMuted,
          '&:hover': {
            borderColor: fantasyColors.textMuted,
            backgroundColor: alpha(fantasyColors.gold, 0.08),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: fantasyColors.textMuted,
          '&:hover': {
            color: fantasyColors.goldLight,
            backgroundColor: alpha(fantasyColors.gold, 0.08),
          },
          '&.Mui-focusVisible': {
            outline: `2px solid ${fantasyColors.gold}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 50,
        },
        indicator: {
          height: 2,
          background: `linear-gradient(90deg, transparent, ${fantasyColors.gold}, transparent)`,
          boxShadow: `0 0 14px ${alpha(fantasyColors.gold, 0.7)}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 50,
          color: fantasyColors.textMuted,
          fontFamily: 'Georgia, Palatino, serif',
          fontSize: '0.78rem',
          letterSpacing: '0.11em',
          textTransform: 'uppercase',
          transition: 'color 160ms ease, background-color 160ms ease',
          '&:hover': {
            color: fantasyColors.text,
            backgroundColor: alpha(fantasyColors.gold, 0.04),
          },
          '&.Mui-selected': {
            color: fantasyColors.gold,
          },
          '&.Mui-focusVisible': {
            outline: `2px solid ${fantasyColors.gold}`,
            outlineOffset: -3,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          backgroundColor: alpha(fantasyColors.void, 0.48),
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: fantasyColors.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(fantasyColors.gold, 0.65),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: fantasyColors.gold,
            borderWidth: 1,
            boxShadow: `0 0 0 2px ${alpha(fantasyColors.gold, 0.1)}`,
          },
        },
        input: {
          '&::placeholder': {
            color: alpha(fantasyColors.textMuted, 0.82),
            opacity: 1,
          },
          '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
            WebkitTextFillColor: fantasyColors.text,
            WebkitBoxShadow: `0 0 0 100px ${alpha(fantasyColors.void, 0.48)} inset`,
            caretColor: fantasyColors.text,
            borderRadius: 'inherit',
            transition: 'background-color 9999s ease-out 0s',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: fantasyColors.textMuted,
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: fantasyColors.textMuted,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: alpha(fantasyColors.textMuted, 0.86),
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: fantasyColors.gold,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#171215',
          border: `1px solid ${fantasyColors.border}`,
          boxShadow: fantasyShadows.raised,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(fantasyColors.gold, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(fantasyColors.burgundy, 0.7),
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha(fantasyColors.burgundy, 0.85),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: fantasyColors.panel,
          backgroundImage: fantasyGradients.panelRaised,
          borderColor: fantasyColors.borderStrong,
          boxShadow: fantasyShadows.raised,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: 'Georgia, Palatino, serif',
          borderBottom: `1px solid ${alpha(fantasyColors.gold, 0.14)}`,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${alpha(fantasyColors.gold, 0.12)}`,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: fantasyColors.goldLight,
          textUnderlineOffset: 3,
          textDecorationColor: alpha(fantasyColors.gold, 0.42),
          '&:hover': {
            color: '#f4dfaf',
            textDecorationColor: fantasyColors.gold,
          },
          '&.Mui-focusVisible': {
            outline: `2px solid ${fantasyColors.gold}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          color: fantasyColors.textMuted,
          borderColor: fantasyColors.border,
          '&.Mui-selected': {
            color: fantasyColors.goldLight,
            backgroundColor: alpha(fantasyColors.gold, 0.12),
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha(fantasyColors.gold, 0.12),
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 9,
          borderRadius: 1,
          backgroundColor: alpha('#000000', 0.62),
          border: `1px solid ${alpha(fantasyColors.gold, 0.2)}`,
        },
        bar: {
          borderRadius: 1,
          background: `linear-gradient(90deg, #682127, ${fantasyColors.hp}, #b64a4f)`,
          boxShadow: `0 0 12px ${alpha(fantasyColors.hp, 0.5)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          borderColor: fantasyColors.border,
          backgroundColor: alpha(fantasyColors.void, 0.3),
          fontWeight: 700,
          letterSpacing: '0.025em',
        },
        outlined: {
          borderColor: fantasyColors.border,
          color: fantasyColors.text,
          '&:hover': {
            borderColor: fantasyColors.borderStrong,
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorPrimary: {
          color: fantasyColors.void,
          backgroundColor: fantasyColors.gold,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: fantasyColors.textMuted,
          '&.Mui-checked': {
            color: fantasyColors.gold,
            '& + .MuiSwitch-track': {
              backgroundColor: fantasyColors.brass,
              opacity: 0.62,
            },
          },
        },
        track: {
          backgroundColor: alpha(fantasyColors.textMuted, 0.36),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: fantasyColors.border,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha(fantasyColors.gold, 0.16)}`,
          boxShadow: `inset 0 1px 0 ${alpha('#ffffff', 0.035)}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: fantasyColors.text,
          backgroundColor: '#241a1d',
          border: `1px solid ${fantasyColors.border}`,
          fontSize: '0.78rem',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&::before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
  },
});