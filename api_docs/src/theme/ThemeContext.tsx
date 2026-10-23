import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  themeMode: ThemePreference;
  setThemeMode: (mode: ThemePreference) => void;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'system',
  setThemeMode: () => {},
  resolvedMode: 'dark',
});

export const useDocTheme = () => useContext(ThemeContext);

export const DocThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('threedot_doc_theme') as ThemePreference;
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setThemeMode = (mode: ThemePreference) => {
    setThemeModeState(mode);
    localStorage.setItem('threedot_doc_theme', mode);
  };

  const resolvedMode: 'light' | 'dark' =
    themeMode === 'system' ? (systemDark ? 'dark' : 'light') : themeMode;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedMode);
    }
  }, [resolvedMode]);

  const theme = useMemo(() => {
    const isDark = resolvedMode === 'dark';
    return createTheme({
      palette: {
        mode: resolvedMode,
        background: {
          default: isDark ? '#080808' : '#ffffff',
          paper: isDark ? '#111111' : '#f8f8f8',
        },
        text: {
          primary: isDark ? '#ffffff' : '#0a0a0a',
          secondary: isDark ? '#888888' : '#666666',
        },
        divider: isDark ? '#222222' : '#e5e5e5',
        primary: {
          main: isDark ? '#ffffff' : '#000000',
          contrastText: isDark ? '#000000' : '#ffffff',
        },
        secondary: {
          main: isDark ? '#aaaaaa' : '#555555',
        },
      },
      typography: {
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        h1: { fontWeight: 800, letterSpacing: '-0.03em' },
        h2: { fontWeight: 800, letterSpacing: '-0.02em' },
        h3: { fontWeight: 700, letterSpacing: '-0.01em' },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
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
      },
    });
  }, [resolvedMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, resolvedMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
