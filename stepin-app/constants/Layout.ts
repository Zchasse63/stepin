/**
 * Layout constants for Stepin
 * Following iOS Human Interface Guidelines
 */

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  // Screen dimensions
  window: {
    width,
    height,
  },

  // Minimum tap target size (iOS HIG requirement)
  minTapTarget: 44,

  // Spacing scale (8pt grid system)
  spacing: {
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
    // Aliases for compatibility
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 9999,
    // Aliases for compatibility
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  // Safe area insets (approximate, will be overridden by actual device values)
  safeArea: {
    top: Platform.OS === 'ios' ? 44 : 0,
    bottom: Platform.OS === 'ios' ? 34 : 0,
  },

  // Common component sizes
  button: {
    height: 50,
    minWidth: 44,
    borderRadius: 12,
  },

  input: {
    height: 50,
    borderRadius: 12,
  },

  card: {
    borderRadius: 16,
    padding: 16,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Tab bar
  tabBar: {
    height: 49, // iOS standard tab bar height
    iconSize: 28,
  },

  // Header
  header: {
    height: 44, // iOS standard navigation bar height
  },

  // Touch targets
  touchTarget: {
    minimum: 44, // iOS HIG minimum tap target
  },

  // Shadow styles
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export default Layout;

