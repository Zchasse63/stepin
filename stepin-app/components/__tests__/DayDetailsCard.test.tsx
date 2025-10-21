import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DayDetailsCard from '../DayDetailsCard';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

describe('DayDetailsCard', () => {
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

  const mockDailyStats = {
    date: '2024-01-01',
    total_steps: 12500,
    goal_met: true,
  };

  const mockWalks = [
    { id: '1', steps: 5000, duration_minutes: 30, distance_meters: 2500, feeling: 'great' },
    { id: '2', steps: 7500, duration_minutes: 45, distance_meters: 3750, feeling: 'good' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
  });

  it('should render day details card', () => {
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={mockWalks}
        stepGoal={10000}
      />
    );
    expect(getByTestId('day-details-card')).toBeTruthy();
  });

  it('should display day name and date', () => {
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={mockWalks}
        stepGoal={10000}
      />
    );
    expect(getByTestId('day-name')).toBeTruthy();
    expect(getByTestId('date')).toBeTruthy();
  });

  it('should display total steps', () => {
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={mockWalks}
        stepGoal={10000}
      />
    );
    expect(getByTestId('steps-value').props.children).toBe('12,500');
  });

  it('should show goal met icon when goal is met', () => {
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={mockWalks}
        stepGoal={10000}
      />
    );
    expect(getByTestId('goal-met-icon')).toBeTruthy();
  });

  it('should not show goal met icon when goal not met', () => {
    const { queryByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={{ ...mockDailyStats, goal_met: false }}
        walks={mockWalks}
        stepGoal={10000}
      />
    );
    expect(queryByTestId('goal-met-icon')).toBeNull();
  });

  it('should display walks count', () => {
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={mockWalks}
        stepGoal={10000}
      />
    );
    expect(getByTestId('walks-count').props.children).toBe(2);
  });

  it('should render close button when onClose provided', () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={mockWalks}
        stepGoal={10000}
        onClose={mockOnClose}
      />
    );
    expect(getByTestId('close-button')).toBeTruthy();
  });

  it('should call onClose when close button pressed', () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={mockWalks}
        stepGoal={10000}
        onClose={mockOnClose}
      />
    );
    fireEvent.press(getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle null daily stats', () => {
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={null}
        walks={[]}
        stepGoal={10000}
      />
    );
    expect(getByTestId('steps-value').props.children).toBe('0');
  });

  it('should handle empty walks array', () => {
    const { getByTestId } = render(
      <DayDetailsCard
        date="2024-01-01"
        dailyStats={mockDailyStats}
        walks={[]}
        stepGoal={10000}
      />
    );
    expect(getByTestId('walks-count').props.children).toBe(0);
  });
});

