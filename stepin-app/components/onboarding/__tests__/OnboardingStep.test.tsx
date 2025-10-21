/**
 * Unit tests for OnboardingStep component
 * Tests step content display, navigation, and animations
 * LOW PRIORITY - Onboarding component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingStep } from '../OnboardingStep';
import { useTheme } from '../../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

describe('OnboardingStep', () => {
  const mockColors = {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    secondaryBackground: '#F2F2F7',
    secondaryText: '#8E8E93',
  };

  const mockStep = {
    title: 'Welcome to Steppin',
    description: 'Track your walks and stay active',
    image: require('../../../assets/onboarding-1.png'),
  };

  const mockOnNext = jest.fn();
  const mockOnSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ colors: mockColors });
  });

  describe('Rendering', () => {
    it('should render onboarding step component', () => {
      const { getByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('onboarding-step')).toBeTruthy();
    });

    it('should render step title', () => {
      const { getByTestId, getByText } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('step-title')).toBeTruthy();
      expect(getByText('Welcome to Steppin')).toBeTruthy();
    });

    it('should render step description', () => {
      const { getByTestId, getByText } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('step-description')).toBeTruthy();
      expect(getByText('Track your walks and stay active')).toBeTruthy();
    });

    it('should render step image', () => {
      const { getByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('step-image')).toBeTruthy();
    });

    it('should render next button', () => {
      const { getByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('next-button')).toBeTruthy();
    });

    it('should render skip button', () => {
      const { getByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('skip-button')).toBeTruthy();
    });
  });

  describe('Navigation - Next', () => {
    it('should call onNext when next button is pressed', () => {
      const { getByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      fireEvent.press(getByTestId('next-button'));
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should show "Get Started" on last step', () => {
      const { getByText } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} isLastStep />
      );

      expect(getByText(/get started/i)).toBeTruthy();
    });

    it('should show "Next" on non-last steps', () => {
      const { getByText } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} isLastStep={false} />
      );

      expect(getByText(/next/i)).toBeTruthy();
    });
  });

  describe('Navigation - Skip', () => {
    it('should call onSkip when skip button is pressed', () => {
      const { getByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      fireEvent.press(getByTestId('skip-button'));
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('should hide skip button on last step', () => {
      const { queryByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} isLastStep />
      );

      expect(queryByTestId('skip-button')).toBeNull();
    });
  });

  describe('Step Index Display', () => {
    it('should display current step number', () => {
      const { getByText } = render(
        <OnboardingStep 
          step={mockStep} 
          onNext={mockOnNext} 
          onSkip={mockOnSkip}
          currentStep={1}
          totalSteps={3}
        />
      );

      expect(getByText(/1.*3/)).toBeTruthy();
    });

    it('should display total steps', () => {
      const { getByTestId } = render(
        <OnboardingStep 
          step={mockStep} 
          onNext={mockOnNext} 
          onSkip={mockOnSkip}
          currentStep={2}
          totalSteps={4}
        />
      );

      expect(getByTestId('step-indicator')).toBeTruthy();
    });
  });

  describe('Animation', () => {
    it('should animate step entrance', () => {
      const { getByTestId } = render(
        <OnboardingStep step={mockStep} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('onboarding-step')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing image', () => {
      const stepWithoutImage = { ...mockStep, image: undefined };
      const { getByTestId } = render(
        <OnboardingStep step={stepWithoutImage} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByTestId('onboarding-step')).toBeTruthy();
    });

    it('should handle very long title', () => {
      const stepWithLongTitle = { ...mockStep, title: 'A'.repeat(100) };
      const { getByText } = render(
        <OnboardingStep step={stepWithLongTitle} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByText('A'.repeat(100))).toBeTruthy();
    });

    it('should handle very long description', () => {
      const stepWithLongDesc = { ...mockStep, description: 'B'.repeat(200) };
      const { getByText } = render(
        <OnboardingStep step={stepWithLongDesc} onNext={mockOnNext} onSkip={mockOnSkip} />
      );

      expect(getByText('B'.repeat(200))).toBeTruthy();
    });
  });
});

