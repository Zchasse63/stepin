/**
 * Unit tests for GoalAdjustmentModal
 * Tests adaptive goal suggestions with different types
 * CRITICAL PRIORITY - Goal management with E2E gaps
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GoalAdjustmentModal } from '../GoalAdjustmentModal';
import { useTheme } from '../../lib/theme/themeManager';
import type { GoalSuggestion } from '../../lib/utils/goalAdjustment';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('GoalAdjustmentModal', () => {
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

  const mockIncreaseSuggestion: GoalSuggestion = {
    currentGoal: 5000,
    suggestedGoal: 7500,
    reason: 'performance',
    message: 'You\'ve been consistently exceeding your goal!',
    confidence: 'high',
    analysis: {
      daysAnalyzed: 14,
      averageSteps: 7200,
      goalMetPercentage: 0.85,
      trend: 'increasing',
    },
  };

  const mockDecreaseSuggestion: GoalSuggestion = {
    currentGoal: 10000,
    suggestedGoal: 7500,
    reason: 'adjustment',
    message: 'Let\'s adjust to a more achievable goal.',
    confidence: 'medium',
    analysis: {
      daysAnalyzed: 14,
      averageSteps: 6500,
      goalMetPercentage: 0.45,
      trend: 'decreasing',
    },
  };

  const mockOptimalSuggestion: GoalSuggestion = {
    currentGoal: 8000,
    suggestedGoal: 8000,
    reason: 'optimal',
    message: 'Your current goal is perfect for you!',
    confidence: 'high',
    analysis: {
      daysAnalyzed: 14,
      averageSteps: 8100,
      goalMetPercentage: 0.75,
      trend: 'stable',
    },
  };

  const mockOnClose = jest.fn();
  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render modal when visible with suggestion', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      expect(getByTestId('goal-adjustment-modal')).toBeTruthy();
    });

    it('should not render when suggestion is null', () => {
      const { queryByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={null}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      expect(queryByTestId('goal-adjustment-modal')).toBeNull();
    });

    it('should render close button', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      expect(getByTestId('close-button')).toBeTruthy();
    });

    it('should render suggestion message', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const message = getByTestId('suggestion-message');
      expect(message.props.children).toBe(mockIncreaseSuggestion.message);
    });

    it('should render confidence display', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const confidence = getByTestId('confidence-display');
      const children = confidence.props.children;
      expect(Array.isArray(children) ? children.join('') : children).toBe('HIGH CONFIDENCE');
    });
  });

  describe('Suggestion Types - Increase', () => {
    it('should render "Ready for a Challenge?" title for increase', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const title = getByTestId('modal-title');
      expect(title.props.children).toBe('Ready for a Challenge?');
    });

    it('should display current and suggested goals for increase', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const currentGoal = getByTestId('current-goal-display');
      const suggestedGoal = getByTestId('suggested-goal-display');
      
      expect(currentGoal.props.children).toBe('5,000');
      expect(suggestedGoal.props.children).toBe('7,500');
    });

    it('should render accept and decline buttons for increase', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      expect(getByTestId('accept-button')).toBeTruthy();
      expect(getByTestId('decline-button')).toBeTruthy();
    });
  });

  describe('Suggestion Types - Decrease', () => {
    it('should render "Let\'s Adjust Your Goal" title for decrease', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockDecreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const title = getByTestId('modal-title');
      expect(title.props.children).toBe('Let\'s Adjust Your Goal');
    });

    it('should display current and suggested goals for decrease', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockDecreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const currentGoal = getByTestId('current-goal-display');
      const suggestedGoal = getByTestId('suggested-goal-display');
      
      expect(currentGoal.props.children).toBe('10,000');
      expect(suggestedGoal.props.children).toBe('7,500');
    });
  });

  describe('Suggestion Types - Optimal', () => {
    it('should render "Your Goal is Perfect!" title for optimal', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockOptimalSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const title = getByTestId('modal-title');
      expect(title.props.children).toBe('Your Goal is Perfect!');
    });

    it('should not render goal comparison for optimal', () => {
      const { queryByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockOptimalSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      expect(queryByTestId('current-goal-display')).toBeNull();
      expect(queryByTestId('suggested-goal-display')).toBeNull();
    });

    it('should render only accept button for optimal', () => {
      const { getByTestId, queryByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockOptimalSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      expect(getByTestId('accept-button')).toBeTruthy();
      expect(queryByTestId('decline-button')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is pressed', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      fireEvent.press(getByTestId('close-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onAccept with suggested goal when accept is pressed', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      fireEvent.press(getByTestId('accept-button'));
      expect(mockOnAccept).toHaveBeenCalledWith(7500);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onDecline when decline is pressed', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockIncreaseSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      fireEvent.press(getByTestId('decline-button'));
      expect(mockOnDecline).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when accept is pressed on optimal suggestion', () => {
      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={mockOptimalSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      fireEvent.press(getByTestId('accept-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large goal numbers', () => {
      const largeSuggestion: GoalSuggestion = {
        ...mockIncreaseSuggestion,
        currentGoal: 50000,
        suggestedGoal: 75000,
      };

      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={largeSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const currentGoal = getByTestId('current-goal-display');
      const suggestedGoal = getByTestId('suggested-goal-display');
      
      expect(currentGoal.props.children).toBe('50,000');
      expect(suggestedGoal.props.children).toBe('75,000');
    });

    it('should handle low confidence suggestions', () => {
      const lowConfidenceSuggestion: GoalSuggestion = {
        ...mockIncreaseSuggestion,
        confidence: 'low',
      };

      const { getByTestId } = render(
        <GoalAdjustmentModal
          visible={true}
          suggestion={lowConfidenceSuggestion}
          onClose={mockOnClose}
          onAccept={mockOnAccept}
          onDecline={mockOnDecline}
        />
      );
      
      const confidence = getByTestId('confidence-display');
      const children = confidence.props.children;
      expect(Array.isArray(children) ? children.join('') : children).toBe('LOW CONFIDENCE');
    });
  });
});

