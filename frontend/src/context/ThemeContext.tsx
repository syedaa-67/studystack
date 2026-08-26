// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ThemeMode } from '../types/theme';
interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'studystack-theme';
const MODES: ThemeMode[] = ['dark', 'light', 'midnight', 'sunset'];
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && MODES.includes(saved as ThemeMode)) {
      return saved as ThemeMode;
    }
    return 'dark';
  });
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    const html = document.documentElement;
    MODES.forEach(m => html.classList.remove(m));
    html.classList.remove('sepia');
    html.classList.add(mode);
  }, [mode]);
  const toggleMode = () => {
    const currentIndex = MODES.indexOf(mode);
    const nextIndex = (currentIndex + 1) % MODES.length;
    setMode(MODES[nextIndex]);
  };
  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
