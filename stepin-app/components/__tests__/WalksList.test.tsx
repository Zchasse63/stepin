/**
 * Unit tests for WalksList
 * Tests walks list display with pagination and empty states
 * CRITICAL PRIORITY - List component with walk data display
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WalksList from '../WalksList';
import { useTheme } from '../../lib/theme/themeManager';
import type { Walk, DailyStats } from '../../types/database';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../WalkListItem', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function WalkListItem({ walk, onPress, onDelete }: any) {
    return (
      <View testID={`walk-item-${walk.id}`}>
        <TouchableOpacity testID={`walk-press-${walk.id}`} onPress={() => onPress?.(walk)}>
          <Text>{walk.steps} steps</Text>
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity testID={`walk-delete-${walk.id}`} onPress={() => onDelete(walk)}>
            <Text>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
});

describe('WalksList', () => {
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

  const mockWalks: Walk[] = [
    {
      id: 'walk-1',
      user_id: 'user-123',
      steps: 5000,
      distance_meters: 3500,
      duration_minutes: 45,
      date: '2024-01-15',
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T10:45:00Z',
      created_at: '2024-01-15T10:45:00Z',
      updated_at: '2024-01-15T10:45:00Z',
    },
    {
      id: 'walk-2',
      user_id: 'user-123',
      steps: 8000,
      distance_meters: 5600,
      duration_minutes: 60,
      date: '2024-01-14',
      start_time: '2024-01-14T09:00:00Z',
      end_time: '2024-01-14T10:00:00Z',
      created_at: '2024-01-14T10:00:00Z',
      updated_at: '2024-01-14T10:00:00Z',
    },
  ];

  const mockDailyStats: DailyStats[] = [
    {
      id: 'stat-1',
      user_id: 'user-123',
      date: '2024-01-15',
      total_steps: 5000,
      goal_met: false,
      created_at: '2024-01-15T10:45:00Z',
      updated_at: '2024-01-15T10:45:00Z',
    },
    {
      id: 'stat-2',
      user_id: 'user-123',
      date: '2024-01-14',
      total_steps: 8000,
      goal_met: true,
      created_at: '2024-01-14T10:00:00Z',
      updated_at: '2024-01-14T10:00:00Z',
    },
  ];

  const mockOnWalkPress = jest.fn();
  const mockOnWalkDelete = jest.fn();
  const mockOnLoadMore = jest.fn();

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
    it('should render walks list with data', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
        />
      );
      
      expect(getByTestId('walks-list')).toBeTruthy();
    });

    it('should render all walk items', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
        />
      );
      
      expect(getByTestId('walk-item-walk-1')).toBeTruthy();
      expect(getByTestId('walk-item-walk-2')).toBeTruthy();
    });

    it('should render empty state when no walks', () => {
      const { getByTestId } = render(
        <WalksList
          walks={[]}
          dailyStats={[]}
          stepGoal={10000}
        />
      );
      
      expect(getByTestId('empty-state')).toBeTruthy();
    });

    it('should render loading indicator when loading more', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          isLoadingMore={true}
        />
      );
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should not render loading indicator when not loading', () => {
      const { queryByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          isLoadingMore={false}
        />
      );
      
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onWalkPress when walk item is pressed', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          onWalkPress={mockOnWalkPress}
        />
      );
      
      fireEvent.press(getByTestId('walk-press-walk-1'));
      expect(mockOnWalkPress).toHaveBeenCalledWith(mockWalks[0]);
    });

    it('should call onWalkDelete when delete is pressed', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          onWalkDelete={mockOnWalkDelete}
        />
      );
      
      fireEvent.press(getByTestId('walk-delete-walk-1'));
      expect(mockOnWalkDelete).toHaveBeenCalledWith(mockWalks[0]);
    });

    it('should call onLoadMore when end is reached', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          onLoadMore={mockOnLoadMore}
          hasMore={true}
        />
      );
      
      const flatList = getByTestId('walks-list');
      fireEvent(flatList, 'onEndReached');
      
      expect(mockOnLoadMore).toHaveBeenCalled();
    });

    it('should not call onLoadMore when already loading', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          onLoadMore={mockOnLoadMore}
          hasMore={true}
          isLoadingMore={true}
        />
      );
      
      const flatList = getByTestId('walks-list');
      fireEvent(flatList, 'onEndReached');
      
      expect(mockOnLoadMore).not.toHaveBeenCalled();
    });

    it('should not call onLoadMore when no more data', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          onLoadMore={mockOnLoadMore}
          hasMore={false}
        />
      );
      
      const flatList = getByTestId('walks-list');
      fireEvent(flatList, 'onEndReached');
      
      expect(mockOnLoadMore).not.toHaveBeenCalled();
    });
  });

  describe('Data Display', () => {
    it('should pass correct walk data to WalkListItem', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
        />
      );
      
      const walkItem = getByTestId('walk-item-walk-1');
      expect(walkItem).toBeTruthy();
    });

    it('should pass units preference to WalkListItem', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
          units="kilometers"
        />
      );
      
      expect(getByTestId('walk-item-walk-1')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should show empty state message', () => {
      const { getByText } = render(
        <WalksList
          walks={[]}
          dailyStats={[]}
          stepGoal={10000}
        />
      );
      
      expect(getByText('No walks logged yet')).toBeTruthy();
      expect(getByText('Start walking and log your first walk!')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single walk', () => {
      const { getByTestId } = render(
        <WalksList
          walks={[mockWalks[0]]}
          dailyStats={[mockDailyStats[0]]}
          stepGoal={10000}
        />
      );
      
      expect(getByTestId('walk-item-walk-1')).toBeTruthy();
    });

    it('should handle walks without daily stats', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={[]}
          stepGoal={10000}
        />
      );
      
      expect(getByTestId('walk-item-walk-1')).toBeTruthy();
      expect(getByTestId('walk-item-walk-2')).toBeTruthy();
    });

    it('should handle missing optional callbacks', () => {
      const { getByTestId } = render(
        <WalksList
          walks={mockWalks}
          dailyStats={mockDailyStats}
          stepGoal={10000}
        />
      );
      
      expect(getByTestId('walks-list')).toBeTruthy();
    });
  });
});

