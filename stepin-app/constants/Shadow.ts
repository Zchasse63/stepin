/**
 * Shadow Styles Utility
 * Consistent shadow definitions for cards and elevated elements
 * Phase 4: Visual Polish
 */

import { Platform, ViewStyle } from 'react-native';

/**
 * Elevation levels following Material Design and iOS HIG principles
 */
export const Shadow = {
  /**
   * Level 1: Subtle elevation for cards and containers
   * Use for: Cards, tiles, list items
   */
  small: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  } as ViewStyle,

  /**
   * Level 2: Medium elevation for interactive elements
   * Use for: Buttons, floating action buttons, modals
   */
  medium: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  } as ViewStyle,

  /**
   * Level 3: Prominent elevation for important UI
   * Use for: App bars, navigation bars, tooltips
   */
  large: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  } as ViewStyle,

  /**
   * Level 4: Maximum elevation for overlays
   * Use for: Dialogs, pickers, dropdowns
   */
  xlarge: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  } as ViewStyle,

  /**
   * Custom shadow with specific color
   * @param color - Shadow color
   * @param opacity - Shadow opacity (0-1)
   * @param radius - Shadow blur radius
   * @param offset - Shadow offset {width, height}
   * @param elevation - Android elevation (1-24)
   */
  custom: (
    color: string = '#000',
    opacity: number = 0.15,
    radius: number = 4,
    offset: { width: number; height: number } = { width: 0, height: 2 },
    elevation: number = 4
  ): ViewStyle => ({
    ...Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: offset,
        shadowOpacity: opacity,
        shadowRadius: radius,
      },
      android: {
        elevation,
      },
    }),
  }),

  /**
   * Inner shadow effect (requires additional View wrapper)
   * Use for: Pressed states, inset containers
   */
  inner: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        // Android doesn't support inner shadows natively
        // Use border or background gradient instead
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
      },
    }),
  } as ViewStyle,

  /**
   * No shadow - useful for conditional shadow application
   */
  none: {
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  } as ViewStyle,
};

/**
 * Helper function to combine shadow with other styles
 * @param shadow - Shadow style from Shadow object
 * @param additionalStyles - Additional styles to merge
 */
export function withShadow(shadow: ViewStyle, additionalStyles?: ViewStyle): ViewStyle {
  return {
    ...shadow,
    ...additionalStyles,
  };
}

/**
 * Animated shadow that changes on press
 * Returns two styles: default and pressed
 */
export function pressableShadow() {
  return {
    default: Shadow.medium,
    pressed: Shadow.small,
  };
}

/**
 * Card shadow with background
 * Commonly used combination for card components
 */
export function cardShadow(backgroundColor: string = '#FFFFFF'): ViewStyle {
  return {
    backgroundColor,
    ...Shadow.small,
    borderRadius: 12,
  };
}
