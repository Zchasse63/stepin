/**
 * Unit tests for GoalSlider
 * Tests goal slider with value changes and bounds
 * CRITICAL PRIORITY - Goal setting UI with gesture interactions
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { GoalSlider } from '../GoalSlider';
import { useTheme } from '../../lib/theme/themeManager';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return function Slider(props: any) {
    return (
      <View
        testID={props.testID}
        onValueChange={props.onValueChange}
        onSlidingComplete={props.onSlidingComplete}
        {...props}
      />
    );
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

describe('GoalSlider', () => {
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

  const mockOnValueChange = jest.fn();
  const mockOnSlidingComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    Platform.OS = 'ios';
  });

  describe('Rendering', () => {
    it('should render slider container', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      expect(getByTestId('goal-slider-container')).toBeTruthy();
    });

    it('should render slider component', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      expect(getByTestId('goal-slider')).toBeTruthy();
    });

    it('should display initial value formatted with commas', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={10000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const valueDisplay = getByTestId('value-display');
      expect(valueDisplay.props.children).toBe('10,000');
    });

    it('should render min label (2,000)', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const minLabel = getByTestId('min-label');
      expect(minLabel.props.children).toBe('2,000');
    });

    it('should render max label (20,000)', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const maxLabel = getByTestId('max-label');
      expect(maxLabel.props.children).toBe('20,000');
    });

    it('should render recommendation text', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      expect(getByTestId('recommendation-text')).toBeTruthy();
    });
  });

  describe('Value Changes', () => {
    it('should call onValueChange when slider value changes', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      fireEvent(slider, 'onValueChange', 7500);
      
      expect(mockOnValueChange).toHaveBeenCalledWith(7500);
    });

    it('should round value to nearest 500', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      fireEvent(slider, 'onValueChange', 7623);
      
      expect(mockOnValueChange).toHaveBeenCalledWith(7500);
    });

    it('should update value display immediately', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      fireEvent(slider, 'onValueChange', 8000);
      
      const valueDisplay = getByTestId('value-display');
      expect(valueDisplay.props.children).toBe('8,000');
    });

    it('should format large numbers with commas', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={15000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const valueDisplay = getByTestId('value-display');
      expect(valueDisplay.props.children).toBe('15,000');
    });
  });

  describe('Slider Interactions', () => {
    it('should call onSlidingComplete when sliding stops', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
          onSlidingComplete={mockOnSlidingComplete}
        />
      );
      
      const slider = getByTestId('goal-slider');
      fireEvent(slider, 'onSlidingComplete', 7500);
      
      expect(mockOnSlidingComplete).toHaveBeenCalledWith(7500);
    });

    it('should trigger haptic feedback on iOS when sliding completes', () => {
      Platform.OS = 'ios';
      
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
          onSlidingComplete={mockOnSlidingComplete}
        />
      );
      
      const slider = getByTestId('goal-slider');
      fireEvent(slider, 'onSlidingComplete', 7500);
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should not trigger haptic feedback on Android', () => {
      Platform.OS = 'android';
      
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
          onSlidingComplete={mockOnSlidingComplete}
        />
      );
      
      const slider = getByTestId('goal-slider');
      fireEvent(slider, 'onSlidingComplete', 7500);
      
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should trigger light haptic on iOS when value changes by 1000+', () => {
      Platform.OS = 'ios';
      
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      fireEvent(slider, 'onValueChange', 6000);
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });
  });

  describe('Bounds', () => {
    it('should enforce minimum value of 2000', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={2000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      expect(slider.props.minimumValue).toBe(2000);
    });

    it('should enforce maximum value of 20000', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={10000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      expect(slider.props.maximumValue).toBe(20000);
    });

    it('should use step increment of 500', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      expect(slider.props.step).toBe(500);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum value (2000)', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={2000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const valueDisplay = getByTestId('value-display');
      expect(valueDisplay.props.children).toBe('2,000');
    });

    it('should handle maximum value (20000)', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={20000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const valueDisplay = getByTestId('value-display');
      expect(valueDisplay.props.children).toBe('20,000');
    });

    it('should handle onSlidingComplete being optional', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      expect(() => {
        fireEvent(slider, 'onSlidingComplete', 7500);
      }).not.toThrow();
    });

    it('should round values between steps correctly', () => {
      const { getByTestId } = render(
        <GoalSlider
          initialValue={5000}
          onValueChange={mockOnValueChange}
        />
      );
      
      const slider = getByTestId('goal-slider');
      
      // Test rounding down
      fireEvent(slider, 'onValueChange', 5249);
      expect(mockOnValueChange).toHaveBeenCalledWith(5000);
      
      // Test rounding up
      fireEvent(slider, 'onValueChange', 5250);
      expect(mockOnValueChange).toHaveBeenCalledWith(5500);
    });
  });
});

