import React from 'react';
import { render } from '@testing-library/react-native';
import StepsBarChart from '../StepsBarChart';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager');
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => React.createElement('Svg', props, children),
    Svg: ({ children, ...props }: any) => React.createElement('Svg', props, children),
    Rect: (props: any) => React.createElement('Rect', props),
    Line: (props: any) => React.createElement('Line', props),
    Text: ({ children, ...props }: any) => React.createElement('SvgText', props, children),
    G: ({ children, ...props }: any) => React.createElement('G', props, children),
  };
});

describe('StepsBarChart', () => {
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

  it('should render bar chart', () => {
    const { getByTestId } = render(
      <StepsBarChart
        dailyStats={mockDailyStats}
        stepGoal={10000}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
      />
    );
    expect(getByTestId('steps-bar-chart')).toBeTruthy();
  });

  it('should render chart title', () => {
    const { getByTestId } = render(
      <StepsBarChart
        dailyStats={mockDailyStats}
        stepGoal={10000}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
      />
    );
    expect(getByTestId('chart-title').props.children).toBe('Daily Steps');
  });

  it('should handle empty data', () => {
    const { getByTestId } = render(
      <StepsBarChart
        dailyStats={[]}
        stepGoal={10000}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-07')}
      />
    );
    expect(getByTestId('steps-bar-chart')).toBeTruthy();
  });
});

