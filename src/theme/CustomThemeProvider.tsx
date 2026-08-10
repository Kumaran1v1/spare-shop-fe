import React, { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAppSelector } from '../store/store';
import { getAppTheme } from './theme';

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeMode = useAppSelector((state) => state.ui.themeMode);
  const theme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
