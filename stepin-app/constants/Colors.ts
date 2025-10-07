/**
 * Color palette for Stepin
 * Following iOS Human Interface Guidelines with soft greens and blues
 * Supports both light and dark modes
 */

export type ColorScheme = 'light' | 'dark';

export interface ColorPalette {
  primary: {
    light: string;
    main: string;
    dark: string;
  };
  secondary: {
    light: string;
    main: string;
    dark: string;
  };
  accent: {
    gold: string;
    gray: string;
    warning: string;
  };
  surface: {
    card: string;
    elevated: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
  system: {
    blue: string;
    green: string;
    indigo: string;
    orange: string;
    pink: string;
    purple: string;
    red: string;
    teal: string;
    yellow: string;
    gray: string;
    gray2: string;
    gray3: string;
    gray4: string;
    gray5: string;
    gray6: string;
  };
}

const LightColors: ColorPalette = {
  // Primary colors - Soft greens for health/wellness
  primary: {
    light: '#A8E6CF', // Light green (25-50% progress)
    main: '#4CAF50',  // Medium green (50-75% progress)
    dark: '#2E7D32',  // Vibrant green (75-100% progress)
  },

  // Secondary colors - Blues for calm
  secondary: {
    light: '#B3E5FC', // Light blue
    main: '#03A9F4',  // Medium blue
    dark: '#0277BD',  // Dark blue
  },

  // Accent colors
  accent: {
    gold: '#FFD700',  // Celebration gold (100%+ goal)
    gray: '#9E9E9E',  // Soft gray (0-25% progress)
    warning: '#FF9800', // Warning/alert color
  },

  // Surface colors
  surface: {
    card: '#FFFFFF',
    elevated: '#F5F5F5',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#FAFAFA',
  },

  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },

  // Status colors
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E',
  },

  // iOS system colors (for consistency)
  system: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
    gray: '#8E8E93',
    gray2: '#AEAEB2',
    gray3: '#C7C7CC',
    gray4: '#D1D1D6',
    gray5: '#E5E5EA',
    gray6: '#F2F2F7',
  },
};

const DarkColors: ColorPalette = {
  // Primary colors - Adjusted for dark mode
  primary: {
    light: '#81C784', // Softer green for dark backgrounds
    main: '#66BB6A',  // Medium green
    dark: '#4CAF50',  // Brighter green for dark mode
  },

  // Secondary colors - Blues for calm
  secondary: {
    light: '#4FC3F7', // Lighter blue for dark mode
    main: '#29B6F6',  // Medium blue
    dark: '#03A9F4',  // Brighter blue
  },

  // Accent colors
  accent: {
    gold: '#FFD700',  // Celebration gold (same in both modes)
    gray: '#757575',  // Darker gray for dark mode
    warning: '#FFA726', // Warning/alert color (brighter for dark mode)
  },

  // Surface colors
  surface: {
    card: '#1C1C1E',
    elevated: '#2C2C2E',
  },

  // Background colors - Dark mode backgrounds
  background: {
    primary: '#000000',   // True black for OLED
    secondary: '#1C1C1E', // iOS dark gray
    tertiary: '#2C2C2E',  // Slightly lighter
  },

  // Text colors - Inverted for dark mode
  text: {
    primary: '#FFFFFF',
    secondary: '#EBEBF5',
    disabled: '#636366',
    inverse: '#000000',
  },

  // Status colors - Adjusted for dark mode
  status: {
    success: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
  },

  // Border colors - Adjusted for dark mode
  border: {
    light: '#38383A',
    main: '#48484A',
    dark: '#636366',
  },

  // iOS system colors (dark mode variants)
  system: {
    blue: '#0A84FF',
    green: '#30D158',
    indigo: '#5E5CE6',
    orange: '#FF9F0A',
    pink: '#FF375F',
    purple: '#BF5AF2',
    red: '#FF453A',
    teal: '#64D2FF',
    yellow: '#FFD60A',
    gray: '#8E8E93',
    gray2: '#636366',
    gray3: '#48484A',
    gray4: '#3A3A3C',
    gray5: '#2C2C2E',
    gray6: '#1C1C1E',
  },
};

export function getColors(scheme: ColorScheme): ColorPalette {
  return scheme === 'dark' ? DarkColors : LightColors;
}

// Export default light colors for backward compatibility
export const Colors = LightColors;

export default Colors;

