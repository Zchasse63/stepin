/**
 * Theme Manager
 * Provides theme context and utilities for light/dark mode switching
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { getColors, ColorPalette, ColorScheme } from '../../constants/Colors';
import type { ThemePreference } from '../../types/profile';

interface ThemeContextValue {
  theme: ColorScheme;
  colors: ColorPalette;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialPreference?: ThemePreference;
  onPreferenceChange?: (preference: ThemePreference) => void;
}

export function ThemeProvider({ 
  children, 
  initialPreference = 'system',
  onPreferenceChange,
}: ThemeProviderProps) {
  const systemColorScheme = useRNColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(initialPreference);

  // Determine actual theme based on preference
  const theme: ColorScheme = 
    themePreference === 'system' 
      ? (systemColorScheme || 'light')
      : themePreference;

  const colors = getColors(theme);

  const setThemePreference = (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    onPreferenceChange?.(preference);
  };

  // Update theme preference when initialPreference changes (e.g., from profile store)
  useEffect(() => {
    setThemePreferenceState(initialPreference);
  }, [initialPreference]);

  const value: ThemeContextValue = {
    theme,
    colors,
    themePreference,
    setThemePreference,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export ThemeColors type for use in component styles
export type ThemeColors = ColorPalette;
