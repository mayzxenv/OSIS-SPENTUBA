import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export const ThemeContext = createContext({
  theme: 'light' as Theme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
