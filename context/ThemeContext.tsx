import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { lightColors, type ThemeColors } from '../theme/colors';

type ThemeState = {
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ colors: lightColors }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
