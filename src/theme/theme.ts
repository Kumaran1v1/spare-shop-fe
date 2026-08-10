import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode } from '../store/uiSlice';

export const getAppTheme = (mode: ThemeMode) => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#3b82f6' : '#1e40af', // Sleek modern blue
        light: '#60a5fa',
        dark: '#1e3a8a',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#10b981' : '#047857', // Emerald green accent
        light: '#34d399',
        dark: '#065f46',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0f172a' : '#f8fafc',
        paper: isDark ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      info: {
        main: '#06b6d4',
      },
      success: {
        main: '#10b981',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'].join(','),
      h1: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
      h2: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
      h3: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
      h4: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
      h5: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
      h6: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
