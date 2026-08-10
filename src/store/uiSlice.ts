import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface UiState {
  themeMode: ThemeMode;
  snackbar: SnackbarState;
}

const savedTheme = (localStorage.getItem('themeMode') as ThemeMode) || 'light';

const initialState: UiState = {
  themeMode: savedTheme,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', state.themeMode);
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; severity?: 'success' | 'error' | 'info' | 'warning' }>
    ) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const { toggleTheme, setThemeMode, showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
