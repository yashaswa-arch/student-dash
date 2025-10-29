import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  systemTheme: 'light' | 'dark'
  resolvedTheme: 'light' | 'dark'
}

const initialState: ThemeState = {
  theme: 'system',
  systemTheme: 'light',
  resolvedTheme: 'light',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      
      // Update resolved theme
      if (action.payload === 'system') {
        state.resolvedTheme = state.systemTheme
      } else {
        state.resolvedTheme = action.payload
      }
    },
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload
      
      // Update resolved theme if using system theme
      if (state.theme === 'system') {
        state.resolvedTheme = action.payload
      }
    },
    toggleTheme: (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark'
        state.resolvedTheme = 'dark'
      } else if (state.theme === 'dark') {
        state.theme = 'light'
        state.resolvedTheme = 'light'
      } else {
        // If system, toggle to opposite of current system theme
        state.theme = state.systemTheme === 'light' ? 'dark' : 'light'
        state.resolvedTheme = state.theme
      }
    },
  },
})

export const { setTheme, setSystemTheme, toggleTheme } = themeSlice.actions

export default themeSlice.reducer

// Selectors
export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme
export const selectResolvedTheme = (state: { theme: ThemeState }) => state.theme.resolvedTheme
export const selectSystemTheme = (state: { theme: ThemeState }) => state.theme.systemTheme