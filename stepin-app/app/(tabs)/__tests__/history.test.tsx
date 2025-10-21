/**
 * Unit tests for HistoryScreen
 * Tests walk history, calendar view, and period filtering
 * HIGH PRIORITY - Historical data screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import HistoryScreen from '../history';
import { useTheme } from '../../../lib/theme/themeManager';
import { useHistoryStore } from '../../../lib/store/historyStore';

// Mock dependencies
jest.mock('../../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../lib/store/historyStore');

jest.spyOn(Alert, 'alert');

// Mock child components
jest.mock('../../../components/CalendarHeatmap', () => ({
  CalendarHeatmap: 'CalendarHeatmap',
}));

jest.mock('../../../components/WalkListItem', () => ({
  WalkListItem: 'WalkListItem',
}));

describe('HistoryScreen', () => {
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

  const mockWalks = [
    { id: '1', steps: 5000, distance: 3.5, duration: 45, date: '2024-01-15' },
    { id: '2', steps: 7500, distance: 5.2, duration: 60, date: '2024-01-14' },
  ];

  const mockStats = {
    totalSteps: 12500,
    totalDistance: 8.7,
    totalDuration: 105,
    averageSteps: 6250,
  };

  const mockDeleteWalk = jest.fn();
  const mockFetchWalks = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useHistoryStore as jest.Mock).mockReturnValue({
      walks: mockWalks,
      stats: mockStats,
      deleteWalk: mockDeleteWalk,
      fetchWalks: mockFetchWalks,
    });
  });

  describe('Rendering - Core Components', () => {
    it('should render history screen', () => {
      const { getByTestId } = render(<HistoryScreen />);
      expect(getByTestId('history-screen')).toBeTruthy();
    });

    it('should render time period selector', () => {
      const { getByTestId } = render(<HistoryScreen />);
      expect(getByTestId('time-period-selector')).toBeTruthy();
    });

    it('should render calendar heatmap', () => {
      const { getByTestId } = render(<HistoryScreen />);
      expect(getByTestId('calendar-heatmap')).toBeTruthy();
    });

    it('should render stats summary', () => {
      const { getByTestId } = render(<HistoryScreen />);
      expect(getByTestId('stats-summary')).toBeTruthy();
    });

    it('should render walks list', () => {
      const { getByTestId } = render(<HistoryScreen />);
      expect(getByTestId('walks-list')).toBeTruthy();
    });
  });

  describe('Period Selection', () => {
    it('should show week period by default', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText('Week')).toBeTruthy();
    });

    it('should switch to month period', async () => {
      const { getByText } = render(<HistoryScreen />);
      
      fireEvent.press(getByText('Month'));
      
      await waitFor(() => {
        expect(mockFetchWalks).toHaveBeenCalledWith('month');
      });
    });

    it('should switch to year period', async () => {
      const { getByText } = render(<HistoryScreen />);
      
      fireEvent.press(getByText('Year'));
      
      await waitFor(() => {
        expect(mockFetchWalks).toHaveBeenCalledWith('year');
      });
    });

    it('should update calendar when period changes', async () => {
      const { getByText, getByTestId } = render(<HistoryScreen />);
      
      fireEvent.press(getByText('Month'));
      
      await waitFor(() => {
        expect(getByTestId('calendar-heatmap')).toBeTruthy();
      });
    });
  });

  describe('Calendar Interactions', () => {
    it('should select day when calendar day is pressed', () => {
      const { getByTestId } = render(<HistoryScreen />);
      
      fireEvent.press(getByTestId('calendar-day-2024-01-15'));
      
      expect(getByTestId('selected-day-walks')).toBeTruthy();
    });

    it('should display walks for selected day', () => {
      const { getByTestId, getByText } = render(<HistoryScreen />);
      
      fireEvent.press(getByTestId('calendar-day-2024-01-15'));
      
      expect(getByText(/5,?000.*steps/i)).toBeTruthy();
    });

    it('should highlight selected day', () => {
      const { getByTestId } = render(<HistoryScreen />);
      
      fireEvent.press(getByTestId('calendar-day-2024-01-15'));
      
      const selectedDay = getByTestId('calendar-day-2024-01-15');
      expect(selectedDay.props.style).toContainEqual(expect.objectContaining({ backgroundColor: mockColors.primary }));
    });
  });

  describe('Stats Summary Display', () => {
    it('should display total steps', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText(/12,?500.*steps/i)).toBeTruthy();
    });

    it('should display total distance', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText(/8\.7.*km/i)).toBeTruthy();
    });

    it('should display total duration', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText(/105.*min/i)).toBeTruthy();
    });

    it('should display average steps', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText(/6,?250.*avg/i)).toBeTruthy();
    });
  });

  describe('Walks List Display', () => {
    it('should display all walks', () => {
      const { getAllByTestId } = render(<HistoryScreen />);
      const walkItems = getAllByTestId(/walk-item-/);
      expect(walkItems).toHaveLength(2);
    });

    it('should display walk details', () => {
      const { getByText } = render(<HistoryScreen />);
      expect(getByText(/5,?000.*steps/i)).toBeTruthy();
      expect(getByText(/3\.5.*km/i)).toBeTruthy();
      expect(getByText(/45.*min/i)).toBeTruthy();
    });
  });

  describe('Edit Walk Action', () => {
    it('should navigate to edit walk screen', () => {
      const { getByTestId } = render(<HistoryScreen />);
      
      fireEvent.press(getByTestId('edit-walk-1'));
      
      // Should navigate to edit screen
      expect(getByTestId('edit-walk-modal')).toBeTruthy();
    });
  });

  describe('Delete Walk Action', () => {
    it('should show confirmation before deleting', () => {
      const { getByTestId } = render(<HistoryScreen />);
      
      fireEvent.press(getByTestId('delete-walk-1'));
      
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should delete walk after confirmation', async () => {
      const { getByTestId } = render(<HistoryScreen />);
      
      fireEvent.press(getByTestId('delete-walk-1'));
      
      // Simulate confirmation
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2][1]; // Second button (Delete)
      confirmButton.onPress();
      
      await waitFor(() => {
        expect(mockDeleteWalk).toHaveBeenCalledWith('1');
      });
    });

    it('should refresh list after deleting walk', async () => {
      const { getByTestId } = render(<HistoryScreen />);
      
      fireEvent.press(getByTestId('delete-walk-1'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2][1];
      confirmButton.onPress();
      
      await waitFor(() => {
        expect(mockFetchWalks).toHaveBeenCalled();
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh walks data', async () => {
      const { getByTestId } = render(<HistoryScreen />);
      
      fireEvent(getByTestId('history-screen'), 'refresh');
      
      await waitFor(() => {
        expect(mockFetchWalks).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator while fetching', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        walks: [],
        stats: null,
        loading: true,
        fetchWalks: mockFetchWalks,
      });

      const { getByTestId } = render(<HistoryScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should show skeleton loaders for walks', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        walks: [],
        stats: null,
        loading: true,
        fetchWalks: mockFetchWalks,
      });

      const { getAllByTestId } = render(<HistoryScreen />);
      const skeletons = getAllByTestId(/skeleton-/);
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no walks', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        walks: [],
        stats: { totalSteps: 0, totalDistance: 0, totalDuration: 0, averageSteps: 0 },
        fetchWalks: mockFetchWalks,
      });

      const { getByText } = render(<HistoryScreen />);
      expect(getByText(/no walks/i)).toBeTruthy();
    });

    it('should show empty state for selected period', () => {
      (useHistoryStore as jest.Mock).mockReturnValue({
        walks: [],
        stats: { totalSteps: 0, totalDistance: 0, totalDuration: 0, averageSteps: 0 },
        fetchWalks: mockFetchWalks,
      });

      const { getByText } = render(<HistoryScreen />);
      
      fireEvent.press(getByText('Month'));
      
      expect(getByText(/no walks.*month/i)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long walks list', () => {
      const manyWalks = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        steps: 5000,
        distance: 3.5,
        duration: 45,
        date: `2024-01-${i + 1}`,
      }));

      (useHistoryStore as jest.Mock).mockReturnValue({
        walks: manyWalks,
        stats: mockStats,
        fetchWalks: mockFetchWalks,
      });

      const { getByTestId } = render(<HistoryScreen />);
      expect(getByTestId('walks-list')).toBeTruthy();
    });
  });
});

