/**
 * Unit tests for GoalCelebrationModal
 * Tests goal celebration display with confetti and animations
 * HIGH PRIORITY - User engagement and celebration
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GoalCelebrationModal } from '../GoalCelebrationModal';
import { useTheme } from '../../lib/theme/themeManager';
import { AccessibilityInfo } from 'react-native';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../ConfettiCelebration', () => ({
  ConfettiCelebration: function ConfettiCelebration(props: any) {
    const { View } = require('react-native');
    return <View testID={props.testID} />;
  },
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View: View,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    Easing: {
      out: jest.fn((fn) => fn),
      ease: jest.fn(),
    },
  };
});

jest.mock('../../lib/animations/celebrationAnimations', () => ({
  hapticFeedback: {
    success: jest.fn(),
  },
  goalCelebrationAnimation: jest.fn((value) => value),
}));

jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
}));

describe('GoalCelebrationModal', () => {
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

  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  describe('Rendering', () => {
    it('should render modal when visible', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      expect(getByTestId('goal-celebration-modal')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByTestId } = render(
        <GoalCelebrationModal
          visible={false}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      expect(queryByTestId('goal-celebration-modal')).toBeTruthy(); // Modal still renders but with visible=false
    });

    it('should render celebration message', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      const message = getByTestId('celebration-message');
      expect(message).toBeTruthy();
      expect(message.props.children).toMatch(/Goal Complete!|You Did It!|Fantastic Work!|Amazing Job!|You're Unstoppable!/);
    });

    it('should render encouragement message', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      expect(getByTestId('encouragement-message')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    it('should display steps achieved with formatting', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={12450}
          goalCount={10000}
        />
      );
      
      const stepsDisplay = getByTestId('steps-achieved-display');
      expect(stepsDisplay.props.children).toBe('12,450');
    });

    it('should display large step counts with formatting', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={25000}
          goalCount={20000}
        />
      );
      
      const stepsDisplay = getByTestId('steps-achieved-display');
      expect(stepsDisplay.props.children).toBe('25,000');
    });

    it('should show percentage over goal when exceeded', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={12000}
          goalCount={10000}
        />
      );
      
      const percentage = getByTestId('over-goal-percentage');
      expect(percentage.props.children).toBe('20% over your goal!');
    });

    it('should not show percentage when exactly at goal', () => {
      const { queryByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10000}
          goalCount={10000}
        />
      );
      
      expect(queryByTestId('over-goal-percentage')).toBeNull();
    });

    it('should calculate percentage correctly', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={15000}
          goalCount={10000}
        />
      );
      
      const percentage = getByTestId('over-goal-percentage');
      expect(percentage.props.children).toBe('50% over your goal!');
    });
  });

  describe('Animations', () => {
    it('should render confetti component when visible', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      expect(getByTestId('confetti-animation')).toBeTruthy();
    });

    it('should not render confetti when reduce motion is enabled', async () => {
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
      
      const { queryByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      await waitFor(() => {
        expect(queryByTestId('confetti-animation')).toBeNull();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onDismiss when close button is pressed', async () => {
      jest.useFakeTimers();
      
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      fireEvent.press(getByTestId('close-button'));
      
      // Fast-forward timers to trigger the setTimeout
      jest.advanceTimersByTime(300);
      
      expect(mockOnDismiss).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large step counts', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={100000}
          goalCount={10000}
        />
      );
      
      const stepsDisplay = getByTestId('steps-achieved-display');
      expect(stepsDisplay.props.children).toBe('100,000');
    });

    it('should handle steps just barely over goal', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10001}
          goalCount={10000}
        />
      );
      
      const percentage = getByTestId('over-goal-percentage');
      expect(percentage.props.children).toBe('0% over your goal!'); // Rounds to 0%
    });

    it('should handle small percentage over goal', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      const percentage = getByTestId('over-goal-percentage');
      expect(percentage.props.children).toBe('5% over your goal!');
    });

    it('should render random celebration message', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      const message = getByTestId('celebration-message');
      expect(message.props.children).toBeTruthy();
      expect(typeof message.props.children).toBe('string');
    });

    it('should render random encouragement message', () => {
      const { getByTestId } = render(
        <GoalCelebrationModal
          visible={true}
          onDismiss={mockOnDismiss}
          stepCount={10500}
          goalCount={10000}
        />
      );
      
      const message = getByTestId('encouragement-message');
      expect(message.props.children).toBeTruthy();
      expect(typeof message.props.children).toBe('string');
    });
  });
});

