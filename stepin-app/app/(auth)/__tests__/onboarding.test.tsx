/**
 * Unit tests for OnboardingScreen
 * Tests onboarding flow, step progression, and completion
 * MEDIUM PRIORITY - First-time user experience
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingScreen from '../onboarding';
import { useTheme } from '../../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

// Mock child components
jest.mock('../../../components/onboarding/OnboardingStep', () => ({
  OnboardingStep: 'OnboardingStep',
}));

jest.mock('../../../components/onboarding/ProgressDots', () => ({
  ProgressDots: 'ProgressDots',
}));

describe('OnboardingScreen', () => {
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
    it('should render onboarding screen', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      expect(getByTestId('onboarding-screen')).toBeTruthy();
    });

    it('should render onboarding step', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      expect(getByTestId('onboarding-step')).toBeTruthy();
    });

    it('should render progress dots', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      expect(getByTestId('progress-dots')).toBeTruthy();
    });

    it('should render next button', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      expect(getByTestId('next-button')).toBeTruthy();
    });

    it('should render skip button', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      expect(getByTestId('skip-button')).toBeTruthy();
    });
  });

  describe('Step Progression', () => {
    it('should show first step initially', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/welcome/i)).toBeTruthy();
    });

    it('should advance to next step when next button is pressed', () => {
      const { getByTestId, getByText } = render(<OnboardingScreen />);
      
      fireEvent.press(getByTestId('next-button'));
      
      expect(getByText(/track.*walks/i)).toBeTruthy();
    });

    it('should update progress dots when advancing', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      
      const progressDots = getByTestId('progress-dots');
      expect(progressDots.props.current).toBe(0);
      
      fireEvent.press(getByTestId('next-button'));
      
      expect(progressDots.props.current).toBe(1);
    });

    it('should show "Get Started" on last step', () => {
      const { getByTestId, getByText } = render(<OnboardingScreen />);
      
      // Advance to last step
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      
      expect(getByText(/get started/i)).toBeTruthy();
    });
  });

  describe('Skip Functionality', () => {
    it('should skip to completion when skip button is pressed', async () => {
      const mockRouter = { replace: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<OnboardingScreen />);
      
      fireEvent.press(getByTestId('skip-button'));
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should hide skip button on last step', () => {
      const { getByTestId, queryByTestId } = render(<OnboardingScreen />);
      
      // Advance to last step
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      
      expect(queryByTestId('skip-button')).toBeNull();
    });
  });

  describe('Completion', () => {
    it('should navigate to home on completion', async () => {
      const mockRouter = { replace: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<OnboardingScreen />);
      
      // Advance to last step
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      fireEvent.press(getByTestId('next-button'));
      
      // Press "Get Started"
      fireEvent.press(getByTestId('get-started-button'));
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });
  });

  describe('Progress Indicator', () => {
    it('should show correct step count', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      
      const progressDots = getByTestId('progress-dots');
      expect(progressDots.props.total).toBeGreaterThan(0);
    });

    it('should update current step indicator', () => {
      const { getByTestId } = render(<OnboardingScreen />);
      
      const progressDots = getByTestId('progress-dots');
      expect(progressDots.props.current).toBe(0);
      
      fireEvent.press(getByTestId('next-button'));
      expect(progressDots.props.current).toBe(1);
      
      fireEvent.press(getByTestId('next-button'));
      expect(progressDots.props.current).toBe(2);
    });
  });
});

