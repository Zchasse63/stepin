/**
 * Typography constants for Stepin
 * Using SF Pro (iOS system font) and Roboto (Android system font)
 */

import { Platform } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  // Font families
  fontFamily: {
    regular: systemFont,
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    semibold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Font sizes (following iOS type scale)
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    '2xl': 24, // Alias for xxl (bracket notation support)
    xxxl: 28,
    huge: 34,
    massive: 48,
    giant: 80, // For large step count display
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text styles (iOS HIG compliant)
  styles: {
    // Large titles
    largeTitle: {
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 41,
    },

    // Titles
    title1: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    title2: {
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 28,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 25,
    },

    // Headlines
    headline: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
    },

    // Body text
    body: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodyEmphasized: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
    },

    // Callout
    callout: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 21,
    },

    // Subheadline
    subheadline: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 20,
    },

    // Footnote
    footnote: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },

    // Caption
    caption1: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    caption2: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 13,
    },

    // Custom styles for Stepin
    stepCount: {
      fontSize: 80,
      fontWeight: '700' as const,
      lineHeight: 96,
    },
    encouragingMessage: {
      fontSize: 20,
      fontWeight: '500' as const,
      lineHeight: 26,
    },
  },

  // Flat exports for easier access
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};

export default Typography;

