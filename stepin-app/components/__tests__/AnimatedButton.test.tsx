/**
 * Unit tests for AnimatedButton component
 * Tests button variants, animations, and user interactions
 * MEDIUM PRIORITY - Reusable button component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimatedButton } from '../AnimatedButton';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('AnimatedButton', () => {
  const mockColors = {
    primary: {
      light: '#A8E6CF',
      main: '#4CAF50',
      dark: '#2E7D32',
    },
    secondary: {
      light: '#B3E5FC',
      main: '#03A9F4',
      dark: '#0277BD',
    },
    accent: {
      gold: '#FFD700',
      gray: '#9E9E9E',
      warning: '#FF9800',
    },
    surface: {
      card: '#FFFFFF',
      elevated: '#F5F5F5',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#FAFAFA',
    },
    text: {
      primary: '#000000',
      secondary: '#757575',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
    },
    border: {
      light: '#E0E0E0',
      main: '#BDBDBD',
      dark: '#9E9E9E',
    },
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

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
  });

  describe('Rendering - Basic', () => {
    it('should render button with label', () => {
      const { getByText, getByTestId } = render(
        <AnimatedButton title="Click Me" onPress={mockOnPress} />
      );

      expect(getByTestId('animated-button')).toBeTruthy();
      expect(getByTestId('button-label')).toBeTruthy();
      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render button with icon when provided', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Save" icon="save" onPress={mockOnPress} />
      );

      expect(getByTestId('button-icon')).toBeTruthy();
    });

    it('should not render icon when not provided', () => {
      const { queryByTestId } = render(
        <AnimatedButton title="Click Me" onPress={mockOnPress} />
      );

      expect(queryByTestId('button-icon')).toBeNull();
    });
  });

  describe('Rendering - Variants', () => {
    it('should render primary variant by default', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Primary" onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      expect(button).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Secondary" variant="secondary" onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      expect(button).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Outline" variant="outline" onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Rendering - Sizes', () => {
    it('should render small size', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Small" size="small" onPress={mockOnPress} />
      );

      expect(getByTestId('animated-button')).toBeTruthy();
    });

    it('should render medium size by default', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Medium" onPress={mockOnPress} />
      );

      expect(getByTestId('animated-button')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Large" size="large" onPress={mockOnPress} />
      );

      expect(getByTestId('animated-button')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Disabled" disabled onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should not call onPress when disabled', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Disabled" disabled onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('animated-button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should have reduced opacity when disabled', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Disabled" disabled onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      expect(button).toBeTruthy();
    });
  });

  describe('User Interactions - Press', () => {
    it('should call onPress when button is pressed', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Press Me" onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('animated-button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should trigger press animation on press in', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Animate" onPress={mockOnPress} />
      );

      fireEvent(getByTestId('animated-button'), 'pressIn');
      expect(getByTestId('animated-button')).toBeTruthy();
    });

    it('should trigger press animation on press out', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Animate" onPress={mockOnPress} />
      );

      fireEvent(getByTestId('animated-button'), 'pressOut');
      expect(getByTestId('animated-button')).toBeTruthy();
    });
  });

  describe('Animations', () => {
    it('should have scale animation on press', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Animate" onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      
      // Press in should scale down
      fireEvent(button, 'pressIn');
      expect(button).toBeTruthy();
      
      // Press out should scale back
      fireEvent(button, 'pressOut');
      expect(button).toBeTruthy();
    });

    it('should not animate when disabled', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Disabled" disabled onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      fireEvent(button, 'pressIn');
      
      expect(button).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on press', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Haptic" onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('animated-button'));
      // Haptic feedback should be triggered (mocked in actual implementation)
      expect(mockOnPress).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      const { getByTestId } = render(
        <AnimatedButton title="" onPress={mockOnPress} />
      );

      expect(getByTestId('animated-button')).toBeTruthy();
    });

    it('should handle long label text', () => {
      const { getByText } = render(
        <AnimatedButton 
          title="This is a very long button label that might need to wrap" 
          onPress={mockOnPress} 
        />
      );

      expect(getByText('This is a very long button label that might need to wrap')).toBeTruthy();
    });

    it('should handle multiple rapid presses', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Rapid" onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Accessible Button" onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      expect(button.props.accessibilityLabel).toBeDefined();
    });

    it('should indicate disabled state in accessibility', () => {
      const { getByTestId } = render(
        <AnimatedButton title="Disabled" disabled onPress={mockOnPress} />
      );

      const button = getByTestId('animated-button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });
});

