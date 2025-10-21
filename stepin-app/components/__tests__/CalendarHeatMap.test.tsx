import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CalendarHeatMap from '../CalendarHeatMap';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager');
jest.mock('../CalendarDay', () => 'CalendarDay');

describe('CalendarHeatMap', () => {
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

  const mockDailyStats = [
    { date: '2024-01-01', total_steps: 5000, goal_met: false },
    { date: '2024-01-02', total_steps: 12000, goal_met: true },
    { date: '2024-01-03', total_steps: 8000, goal_met: false },
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

  it('should render calendar heatmap', () => {
    const { getByTestId } = render(
      <CalendarHeatMap
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
        dailyStats={mockDailyStats}
        stepGoal={10000}
      />
    );
    expect(getByTestId('calendar-heatmap')).toBeTruthy();
  });

  it('should render calendar title', () => {
    const { getByTestId } = render(
      <CalendarHeatMap
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
        dailyStats={mockDailyStats}
        stepGoal={10000}
      />
    );
    expect(getByTestId('calendar-title').props.children).toBe('This Week');
  });

  it('should render scrollable calendar', () => {
    const { getByTestId } = render(
      <CalendarHeatMap
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
        dailyStats={mockDailyStats}
        stepGoal={10000}
      />
    );
    expect(getByTestId('calendar-scroll')).toBeTruthy();
  });

  it('should render legend container', () => {
    const { getByTestId } = render(
      <CalendarHeatMap
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
        dailyStats={mockDailyStats}
        stepGoal={10000}
      />
    );
    expect(getByTestId('legend-container')).toBeTruthy();
  });

  it('should render legend items', () => {
    const { getByTestId } = render(
      <CalendarHeatMap
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
        dailyStats={mockDailyStats}
        stepGoal={10000}
      />
    );
    expect(getByTestId('legend-item-0')).toBeTruthy();
    expect(getByTestId('legend-item-1')).toBeTruthy();
    expect(getByTestId('legend-item-2')).toBeTruthy();
  });

  it('should call onDayPress when day is pressed', () => {
    const mockOnDayPress = jest.fn();
    const { getByTestId } = render(
      <CalendarHeatMap
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
        dailyStats={mockDailyStats}
        stepGoal={10000}
        onDayPress={mockOnDayPress}
      />
    );
    expect(getByTestId('calendar-heatmap')).toBeTruthy();
  });

  it('should handle empty daily stats', () => {
    const { getByTestId } = render(
      <CalendarHeatMap
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
        dailyStats={[]}
        stepGoal={10000}
      />
    );
    expect(getByTestId('calendar-heatmap')).toBeTruthy();
  });
});

