import { createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define custom color palette
const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63',
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800',
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Dark theme specific colors - Much darker and more contrasted
const darkColors = {
  background: {
    default: '#0a0a0a',
    paper: '#1a1a1a',
    elevated: '#2a2a2a',
  },
  surface: {
    primary: '#1a1a1a',
    secondary: '#2a2a2a',
    tertiary: '#3a3a3a',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    disabled: 'rgba(255, 255, 255, 0.4)',
  },
};

// Light theme specific colors - Much brighter and cleaner
const lightColors = {
  background: {
    default: '#ffffff',
    paper: '#f8f9fa',
    elevated: '#e9ecef',
  },
  surface: {
    primary: '#f8f9fa',
    secondary: '#e9ecef',
    tertiary: '#dee2e6',
  },
  text: {
    primary: '#212529',
    secondary: '#495057',
    disabled: '#adb5bd',
  },
};

export function createFreelanceForgeTheme(mode: PaletteMode): Theme {
  const isDark = mode === 'dark';
  const themeColors = isDark ? darkColors : lightColors;

  return createTheme({
    transitions: {
      duration: {
        shortest: 0,
        shorter: 0,
        short: 0,
        standard: 0,
        complex: 0,
        enteringScreen: 0,
        leavingScreen: 0,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    palette: {
      mode,
      primary: {
        main: colors.primary[500],
        light: colors.primary[300],
        dark: colors.primary[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary[500],
        light: colors.secondary[300],
        dark: colors.secondary[700],
        contrastText: '#ffffff',
      },
      success: {
        main: colors.success[500],
        light: colors.success[300],
        dark: colors.success[700],
        contrastText: '#ffffff',
      },
      warning: {
        main: colors.warning[500],
        light: colors.warning[300],
        dark: colors.warning[700],
        contrastText: 'rgba(0, 0, 0, 0.87)',
      },
      error: {
        main: colors.error[500],
        light: colors.error[300],
        dark: colors.error[700],
        contrastText: '#ffffff',
      },
      background: {
        default: themeColors.background.default,
        paper: themeColors.background.paper,
      },
      text: {
        primary: themeColors.text.primary,
        secondary: themeColors.text.secondary,
        disabled: themeColors.text.disabled,
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
      action: {
        active: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        hover: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        selected: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0em',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0em',
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.0075em',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.6,
        letterSpacing: '0.01071em',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.66,
        letterSpacing: '0.03333em',
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 2.66,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {

          body: {
            scrollbarColor: isDark ? '#6b6b6b #2b2b2b' : '#959595 #f5f5f5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: isDark ? '#2b2b2b' : '#f5f5f5',
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: isDark ? '#6b6b6b' : '#959595',
              minHeight: 24,
              border: `2px solid ${isDark ? '#2b2b2b' : '#f5f5f5'}`,
            },
            '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
              backgroundColor: isDark ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
              backgroundColor: isDark ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: isDark ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
              backgroundColor: isDark ? '#2b2b2b' : '#f5f5f5',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 12px rgba(33, 150, 243, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            background: isDark
              ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
              : 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)'
                : 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.8)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            background: isDark
              ? '#1a1a1a'
              : '#ffffff',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? '0 12px 48px rgba(0, 0, 0, 0.9)'
                : '0 8px 32px rgba(0, 0, 0, 0.15)',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: themeColors.background.paper,
          },
          elevation1: {
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.4)'
              : '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
          elevation4: {
            boxShadow: isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.4)'
              : '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isDark
                ? '#2a2a2a'
                : '#f8f9fa',
              '&:hover': {
                backgroundColor: isDark
                  ? '#3a3a3a'
                  : '#e9ecef',
              },
              '&.Mui-focused': {
                backgroundColor: isDark
                  ? '#3a3a3a'
                  : '#ffffff',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isDark
              ? '#2a2a2a'
              : '#f8f9fa',
            '&:hover': {
              backgroundColor: isDark
                ? '#3a3a3a'
                : '#e9ecef',
            },
            '&.Mui-focused': {
              backgroundColor: isDark
                ? '#3a3a3a'
                : '#ffffff',
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isDark
              ? '0 8px 24px rgba(0, 0, 0, 0.4)'
              : '0 8px 24px rgba(0, 0, 0, 0.12)',
            backgroundColor: isDark
              ? themeColors.background.paper
              : themeColors.background.paper,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            background: isDark
              ? '#1a1a1a'
              : '#ffffff',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: isDark
              ? '0 24px 64px rgba(0, 0, 0, 0.9)'
              : '0 24px 64px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? '#1a1a1a'
              : '#ffffff',
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: isDark
              ? '0 2px 8px rgba(0, 0, 0, 0.8)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
          filled: {
            backgroundColor: isDark
              ? '#3a3a3a'
              : '#e9ecef',
            color: themeColors.text.primary,
            '&:hover': {
              backgroundColor: isDark
                ? '#4a4a4a'
                : '#dee2e6',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? '0 4px 12px rgba(0, 0, 0, 0.4)'
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
          },
          filledSuccess: {
            backgroundColor: isDark ? colors.success[700] : colors.success[600],
            borderColor: isDark ? colors.success[600] : colors.success[500],
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
            '& .MuiAlertTitle-root': {
              color: '#ffffff',
              fontWeight: 600,
            },
            '& .MuiIconButton-root': {
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
          filledError: {
            backgroundColor: isDark ? colors.error[700] : colors.error[600],
            borderColor: isDark ? colors.error[600] : colors.error[500],
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
            '& .MuiAlertTitle-root': {
              color: '#ffffff',
              fontWeight: 600,
            },
            '& .MuiIconButton-root': {
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
          filledWarning: {
            backgroundColor: isDark ? colors.warning[700] : colors.warning[600],
            borderColor: isDark ? colors.warning[600] : colors.warning[500],
            color: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
            '& .MuiAlert-icon': {
              color: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
            },
            '& .MuiAlertTitle-root': {
              color: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
              fontWeight: 600,
            },
            '& .MuiIconButton-root': {
              color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
          filledInfo: {
            backgroundColor: isDark ? colors.primary[700] : colors.primary[600],
            borderColor: isDark ? colors.primary[600] : colors.primary[500],
            color: '#ffffff',
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
            '& .MuiAlertTitle-root': {
              color: '#ffffff',
              fontWeight: 600,
            },
            '& .MuiIconButton-root': {
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
        },
      },
    },
  });
}