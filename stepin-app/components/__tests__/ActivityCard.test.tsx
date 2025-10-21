import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityCard } from '../ActivityCard';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

jest.mock('../KudosButton', () => ({
  KudosButton: ({ onToggle, disabled }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity testID="kudos-button" onPress={onToggle} disabled={disabled}>
        <Text>Kudos</Text>
      </TouchableOpacity>
    );
  },
}));

describe('ActivityCard', () => {
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

  const mockWalkActivity = {
    id: 'activity-1',
    user_id: 'user-1',
    user_profile: {
      display_name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    activity_type: 'walk_completed',
    activity_data: {
      duration_minutes: 30,
      distance_meters: 2414,
      feeling: '😊',
      note: 'Great walk in the park!',
    },
    kudos_count: 5,
    user_gave_kudos: false,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    visibility: 'buddies',
  };

  const mockStreakActivity = {
    ...mockWalkActivity,
    id: 'activity-2',
    activity_type: 'streak_milestone',
    activity_data: {
      streak_days: 7,
    },
  };

  const mockGoalActivity = {
    ...mockWalkActivity,
    id: 'activity-3',
    activity_type: 'goal_achieved',
    activity_data: {
      goal_type: 'daily',
    },
  };

  const mockOnKudosToggle = jest.fn();
  const mockOnDelete = jest.fn();

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
    it('should render activity card', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('activity-card')).toBeTruthy();
    });

    it('should render user name', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      const userName = getByTestId('user-name');
      expect(userName.props.children).toBe('John Doe');
    });

    it('should render timestamp', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('timestamp')).toBeTruthy();
    });

    it('should render avatar image when avatar_url provided', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should render avatar placeholder when no avatar_url', () => {
      const activityWithoutAvatar = {
        ...mockWalkActivity,
        user_profile: { ...mockWalkActivity.user_profile, avatar_url: undefined },
      };
      const { getByTestId } = render(
        <ActivityCard
          activity={activityWithoutAvatar}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('avatar-placeholder')).toBeTruthy();
    });

    it('should render activity description', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('activity-description')).toBeTruthy();
    });

    it('should render kudos button', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('kudos-button')).toBeTruthy();
    });
  });

  describe('Activity Types', () => {
    it('should display walk activity correctly', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('activity-description')).toBeTruthy();
    });

    it('should display streak milestone activity correctly', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockStreakActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('activity-description')).toBeTruthy();
    });

    it('should display goal achieved activity correctly', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockGoalActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('activity-description')).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('should show delete button for own activity', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-1"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('delete-button')).toBeTruthy();
    });

    it('should not show delete button for others activity', () => {
      const { queryByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      expect(queryByTestId('delete-button')).toBeNull();
    });

    it('should show Anonymous Walker when no display_name', () => {
      const activityWithoutName = {
        ...mockWalkActivity,
        user_profile: null,
      };
      const { getByTestId } = render(
        <ActivityCard
          activity={activityWithoutName}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      const userName = getByTestId('user-name');
      expect(userName.props.children).toBe('Anonymous Walker');
    });
  });

  describe('User Interactions', () => {
    it('should call onKudosToggle when kudos button pressed', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-2"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      fireEvent.press(getByTestId('kudos-button'));
      expect(mockOnKudosToggle).toHaveBeenCalled();
    });

    it('should call onDelete when delete button pressed', () => {
      const { getByTestId } = render(
        <ActivityCard
          activity={mockWalkActivity}
          currentUserId="user-1"
          onKudosToggle={mockOnKudosToggle}
          onDelete={mockOnDelete}
        />
      );
      fireEvent.press(getByTestId('delete-button'));
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });
});

