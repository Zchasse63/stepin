/**
 * Unit tests for TodayScreen (Main Dashboard)
 * Tests step tracking, stats display, walk logging, and celebrations
 * CRITICAL PRIORITY - Primary user interface
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TodayScreen from '../index';
import { useTheme } from '../../../lib/theme/themeManager';
import { useHealthStore } from '../../../lib/store/healthStore';
import { useAuthStore } from '../../../lib/store/authStore';
import { useProfileStore } from '../../../lib/store/profileStore';
import { useActiveWalkStore } from '../../../lib/store/activeWalkStore';

// Mock dependencies
jest.mock('../../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../lib/store/healthStore');
jest.mock('../../../lib/store/authStore');
jest.mock('../../../lib/store/profileStore');
jest.mock('../../../lib/store/activeWalkStore');

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

// Mock child components
jest.mock('../../../components/StepCircle', () => ({
  StepCircle: 'StepCircle',
}));

jest.mock('../../../components/StatsCard', () => ({
  StatsCard: 'StatsCard',
}));

jest.mock('../../../components/StreakDisplay', () => ({
  StreakDisplay: 'StreakDisplay',
}));

jest.mock('../../../components/LogWalkModal', () => ({
  LogWalkModal: 'LogWalkModal',
}));

jest.mock('../../../components/ProfileButton', () => ({
  ProfileButton: 'ProfileButton',
}));

describe('TodayScreen', () => {
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

  const mockHealthData = {
    steps: 5000,
    distance: 3.5,
    duration: 45,
    calories: 250,
  };

  const mockProfile = {
    dailyGoal: 10000,
    streak: 7,
    displayName: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useHealthStore as jest.Mock).mockReturnValue({
      steps: mockHealthData.steps,
      distance: mockHealthData.distance,
      duration: mockHealthData.duration,
      calories: mockHealthData.calories,
      fetchTodaySteps: jest.fn(),
    });
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-123', email: 'john@example.com' },
    });
    (useProfileStore as jest.Mock).mockReturnValue({
      dailyGoal: mockProfile.dailyGoal,
      streak: mockProfile.streak,
      displayName: mockProfile.displayName,
      fetchProfile: jest.fn(),
    });
    (useActiveWalkStore as jest.Mock).mockReturnValue({
      isWalking: false,
    });
  });

  describe('Rendering - Core Components', () => {
    it('should render today screen', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('today-screen')).toBeTruthy();
    });

    it('should render step circle', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('step-circle')).toBeTruthy();
    });

    it('should render daily goal display', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('daily-goal')).toBeTruthy();
    });

    it('should render log walk button', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('log-walk-button')).toBeTruthy();
    });

    it('should render stats summary', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('stats-summary')).toBeTruthy();
    });

    it('should render profile button', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('profile-button')).toBeTruthy();
    });
  });

  describe('Step Progress Display', () => {
    it('should display current steps', () => {
      const { getByText } = render(<TodayScreen />);
      expect(getByText(/5,?000/)).toBeTruthy();
    });

    it('should display daily goal', () => {
      const { getByText } = render(<TodayScreen />);
      expect(getByText(/10,?000/)).toBeTruthy();
    });

    it('should calculate progress percentage', () => {
      const { getByTestId } = render(<TodayScreen />);
      const stepCircle = getByTestId('step-circle');
      expect(stepCircle.props.progress).toBe(50); // 5000/10000 = 50%
    });

    it('should show 100% when goal is met', () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: 10000,
        fetchTodaySteps: jest.fn(),
      });

      const { getByTestId } = render(<TodayScreen />);
      const stepCircle = getByTestId('step-circle');
      expect(stepCircle.props.progress).toBe(100);
    });
  });

  describe('Stats Cards Display', () => {
    it('should display distance stat', () => {
      const { getByText } = render(<TodayScreen />);
      expect(getByText(/3\.5.*km/i)).toBeTruthy();
    });

    it('should display duration stat', () => {
      const { getByText } = render(<TodayScreen />);
      expect(getByText(/45.*min/i)).toBeTruthy();
    });

    it('should display calories stat', () => {
      const { getByText } = render(<TodayScreen />);
      expect(getByText(/250.*cal/i)).toBeTruthy();
    });
  });

  describe('Streak Display', () => {
    it('should display current streak', () => {
      const { getByText } = render(<TodayScreen />);
      expect(getByText(/7.*day/i)).toBeTruthy();
    });

    it('should show streak icon', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('streak-icon')).toBeTruthy();
    });
  });

  describe('Log Walk Modal', () => {
    it('should open log walk modal when button is pressed', () => {
      const { getByTestId } = render(<TodayScreen />);
      
      fireEvent.press(getByTestId('log-walk-button'));
      
      expect(getByTestId('log-walk-modal')).toBeTruthy();
    });

    it('should close modal when cancel is pressed', () => {
      const { getByTestId, queryByTestId } = render(<TodayScreen />);
      
      fireEvent.press(getByTestId('log-walk-button'));
      expect(getByTestId('log-walk-modal')).toBeTruthy();
      
      fireEvent.press(getByTestId('modal-cancel-button'));
      expect(queryByTestId('log-walk-modal')).toBeNull();
    });

    it('should refresh data after logging walk', async () => {
      const mockFetchSteps = jest.fn();
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: mockHealthData.steps,
        fetchTodaySteps: mockFetchSteps,
      });

      const { getByTestId } = render(<TodayScreen />);
      
      fireEvent.press(getByTestId('log-walk-button'));
      fireEvent.press(getByTestId('modal-save-button'));
      
      await waitFor(() => {
        expect(mockFetchSteps).toHaveBeenCalled();
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh data on pull down', async () => {
      const mockFetchSteps = jest.fn();
      const mockFetchProfile = jest.fn();
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: mockHealthData.steps,
        fetchTodaySteps: mockFetchSteps,
      });
      (useProfileStore as jest.Mock).mockReturnValue({
        dailyGoal: mockProfile.dailyGoal,
        fetchProfile: mockFetchProfile,
      });

      const { getByTestId } = render(<TodayScreen />);
      
      fireEvent(getByTestId('today-screen'), 'refresh');
      
      await waitFor(() => {
        expect(mockFetchSteps).toHaveBeenCalled();
        expect(mockFetchProfile).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator on initial load', () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: null,
        fetchTodaySteps: jest.fn(),
        loading: true,
      });

      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should show skeleton loaders while loading', () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: null,
        loading: true,
        fetchTodaySteps: jest.fn(),
      });

      const { getAllByTestId } = render(<TodayScreen />);
      const skeletons = getAllByTestId(/skeleton-/);
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty States', () => {
    it('should show empty state for first-time user', () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: 0,
        distance: 0,
        duration: 0,
        calories: 0,
        fetchTodaySteps: jest.fn(),
      });

      const { getByText } = render(<TodayScreen />);
      expect(getByText(/start.*walk/i)).toBeTruthy();
    });

    it('should show walks list when no walks logged', () => {
      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('walks-list')).toBeTruthy();
    });
  });

  describe('Goal Achievement Celebration', () => {
    it('should show celebration modal when goal is met', async () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: 10000,
        fetchTodaySteps: jest.fn(),
      });

      const { getByTestId } = render(<TodayScreen />);
      
      await waitFor(() => {
        expect(getByTestId('goal-celebration-modal')).toBeTruthy();
      });
    });

    it('should trigger confetti when goal is achieved', async () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: 10000,
        fetchTodaySteps: jest.fn(),
      });

      const { getByTestId } = render(<TodayScreen />);
      
      await waitFor(() => {
        expect(getByTestId('confetti-animation')).toBeTruthy();
      });
    });
  });

  describe('Streak Milestone', () => {
    it('should show streak milestone modal for 7-day streak', async () => {
      (useProfileStore as jest.Mock).mockReturnValue({
        dailyGoal: mockProfile.dailyGoal,
        streak: 7,
        fetchProfile: jest.fn(),
      });

      const { getByTestId } = render(<TodayScreen />);
      
      await waitFor(() => {
        expect(getByTestId('streak-milestone-modal')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to profile when profile button is pressed', () => {
      const mockRouter = { push: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);

      const { getByTestId } = render(<TodayScreen />);
      
      fireEvent.press(getByTestId('profile-button'));
      expect(mockRouter.push).toHaveBeenCalledWith('/profile');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing health data', () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: null,
        distance: null,
        duration: null,
        calories: null,
        fetchTodaySteps: jest.fn(),
      });

      const { getByTestId } = render(<TodayScreen />);
      expect(getByTestId('today-screen')).toBeTruthy();
    });

    it('should handle very high step count', () => {
      (useHealthStore as jest.Mock).mockReturnValue({
        steps: 50000,
        fetchTodaySteps: jest.fn(),
      });

      const { getByText } = render(<TodayScreen />);
      expect(getByText(/50,?000/)).toBeTruthy();
    });
  });
});

