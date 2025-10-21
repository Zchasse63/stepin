/**
 * Unit tests for InsightsScreen
 * Tests insights display, trends, and achievements
 * MEDIUM PRIORITY - Analytics and insights screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import InsightsScreen from '../insights';
import { useTheme } from '../../../lib/theme/themeManager';
import { useInsightsStore } from '../../../lib/store/insightsStore';

// Mock dependencies
jest.mock('../../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../lib/store/insightsStore');

// Mock child components
jest.mock('../../../components/InsightCard', () => ({
  InsightCard: 'InsightCard',
}));

describe('InsightsScreen', () => {
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

  const mockInsights = [
    {
      id: '1',
      type: 'trend',
      title: 'Steps Increasing',
      description: 'Your average steps increased by 15% this week',
      icon: 'trending-up',
      date: '2024-01-15',
    },
    {
      id: '2',
      type: 'achievement',
      title: '7-Day Streak',
      description: 'You reached your goal for 7 days in a row!',
      icon: 'trophy',
      date: '2024-01-14',
    },
    {
      id: '3',
      type: 'suggestion',
      title: 'Morning Walks',
      description: 'Try walking in the morning for better consistency',
      icon: 'lightbulb',
      date: '2024-01-13',
    },
  ];

  const mockFetchInsights = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useInsightsStore as jest.Mock).mockReturnValue({
      insights: mockInsights,
      fetchInsights: mockFetchInsights,
    });
  });

  describe('Rendering - Core Components', () => {
    it('should render insights screen', () => {
      const { getByTestId } = render(<InsightsScreen />);
      expect(getByTestId('insights-screen')).toBeTruthy();
    });

    it('should render time period selector', () => {
      const { getByTestId } = render(<InsightsScreen />);
      expect(getByTestId('time-period-selector')).toBeTruthy();
    });

    it('should render insights list', () => {
      const { getByTestId } = render(<InsightsScreen />);
      expect(getByTestId('insights-list')).toBeTruthy();
    });
  });

  describe('Insights List Display', () => {
    it('should display all insights', () => {
      const { getAllByTestId } = render(<InsightsScreen />);
      const insightCards = getAllByTestId(/insight-card-/);
      expect(insightCards).toHaveLength(3);
    });

    it('should display insight titles', () => {
      const { getByText } = render(<InsightsScreen />);
      expect(getByText('Steps Increasing')).toBeTruthy();
      expect(getByText('7-Day Streak')).toBeTruthy();
      expect(getByText('Morning Walks')).toBeTruthy();
    });

    it('should display insight descriptions', () => {
      const { getByText } = render(<InsightsScreen />);
      expect(getByText(/average steps increased by 15%/i)).toBeTruthy();
    });
  });

  describe('Insight Card Display', () => {
    it('should render insight card with icon', () => {
      const { getByTestId } = render(<InsightsScreen />);
      expect(getByTestId('insight-icon-1')).toBeTruthy();
    });

    it('should render insight card with date', () => {
      const { getByText } = render(<InsightsScreen />);
      expect(getByText(/jan.*15/i)).toBeTruthy();
    });
  });

  describe('Period Selection', () => {
    it('should show week period by default', () => {
      const { getByText } = render(<InsightsScreen />);
      expect(getByText('Week')).toBeTruthy();
    });

    it('should switch to month period', async () => {
      const { getByText } = render(<InsightsScreen />);
      
      fireEvent.press(getByText('Month'));
      
      await waitFor(() => {
        expect(mockFetchInsights).toHaveBeenCalledWith('month');
      });
    });

    it('should switch to year period', async () => {
      const { getByText } = render(<InsightsScreen />);
      
      fireEvent.press(getByText('Year'));
      
      await waitFor(() => {
        expect(mockFetchInsights).toHaveBeenCalledWith('year');
      });
    });
  });

  describe('Insight Types', () => {
    it('should display trend insights', () => {
      const { getByText } = render(<InsightsScreen />);
      expect(getByText('Steps Increasing')).toBeTruthy();
    });

    it('should display achievement insights', () => {
      const { getByText } = render(<InsightsScreen />);
      expect(getByText('7-Day Streak')).toBeTruthy();
    });

    it('should display suggestion insights', () => {
      const { getByText } = render(<InsightsScreen />);
      expect(getByText('Morning Walks')).toBeTruthy();
    });

    it('should use different icons for different types', () => {
      const { getByTestId } = render(<InsightsScreen />);
      expect(getByTestId('insight-icon-1')).toBeTruthy(); // trend
      expect(getByTestId('insight-icon-2')).toBeTruthy(); // achievement
      expect(getByTestId('insight-icon-3')).toBeTruthy(); // suggestion
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh insights data', async () => {
      const { getByTestId } = render(<InsightsScreen />);
      
      fireEvent(getByTestId('insights-screen'), 'refresh');
      
      await waitFor(() => {
        expect(mockFetchInsights).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while fetching', () => {
      (useInsightsStore as jest.Mock).mockReturnValue({
        insights: [],
        loading: true,
        fetchInsights: mockFetchInsights,
      });

      const { getByTestId } = render(<InsightsScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should show skeleton loaders for insights', () => {
      (useInsightsStore as jest.Mock).mockReturnValue({
        insights: [],
        loading: true,
        fetchInsights: mockFetchInsights,
      });

      const { getAllByTestId } = render(<InsightsScreen />);
      const skeletons = getAllByTestId(/skeleton-/);
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no insights', () => {
      (useInsightsStore as jest.Mock).mockReturnValue({
        insights: [],
        fetchInsights: mockFetchInsights,
      });

      const { getByText } = render(<InsightsScreen />);
      expect(getByText(/no insights/i)).toBeTruthy();
    });

    it('should show empty state message', () => {
      (useInsightsStore as jest.Mock).mockReturnValue({
        insights: [],
        fetchInsights: mockFetchInsights,
      });

      const { getByText } = render(<InsightsScreen />);
      expect(getByText(/keep walking.*generate insights/i)).toBeTruthy();
    });

    it('should not render insights list when empty', () => {
      (useInsightsStore as jest.Mock).mockReturnValue({
        insights: [],
        fetchInsights: mockFetchInsights,
      });

      const { queryByTestId } = render(<InsightsScreen />);
      expect(queryByTestId(/insight-card-/)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle many insights', () => {
      const manyInsights = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        type: 'trend',
        title: `Insight ${i}`,
        description: `Description ${i}`,
        icon: 'trending-up',
        date: '2024-01-15',
      }));

      (useInsightsStore as jest.Mock).mockReturnValue({
        insights: manyInsights,
        fetchInsights: mockFetchInsights,
      });

      const { getByTestId } = render(<InsightsScreen />);
      expect(getByTestId('insights-list')).toBeTruthy();
    });

    it('should handle insights with very long descriptions', () => {
      const longInsight = {
        id: '1',
        type: 'trend',
        title: 'Long Insight',
        description: 'A'.repeat(500),
        icon: 'trending-up',
        date: '2024-01-15',
      };

      (useInsightsStore as jest.Mock).mockReturnValue({
        insights: [longInsight],
        fetchInsights: mockFetchInsights,
      });

      const { getByText } = render(<InsightsScreen />);
      expect(getByText('Long Insight')).toBeTruthy();
    });
  });
});

