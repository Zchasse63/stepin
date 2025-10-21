import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BuddyListItem } from '../BuddyListItem';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('BuddyListItem', () => {
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

  const mockBuddy = {
    id: 'buddy-1',
    buddy_profile: {
      display_name: 'John Doe',
      email: 'john@example.com',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };

  const mockOnRemove = jest.fn();
  const mockOnBlock = jest.fn();

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
    it('should render buddy list item', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} />
      );
      expect(getByTestId('buddy-list-item')).toBeTruthy();
    });

    it('should render avatar image when avatar_url provided', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} />
      );
      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should render avatar placeholder when no avatar_url', () => {
      const buddyWithoutAvatar = {
        ...mockBuddy,
        buddy_profile: { ...mockBuddy.buddy_profile, avatar_url: undefined },
      };
      const { getByTestId } = render(
        <BuddyListItem buddy={buddyWithoutAvatar} onRemove={mockOnRemove} />
      );
      expect(getByTestId('avatar-placeholder')).toBeTruthy();
    });

    it('should render display name', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} />
      );
      const name = getByTestId('display-name');
      expect(name.props.children).toBe('John Doe');
    });

    it('should render status text', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} />
      );
      expect(getByTestId('status-text')).toBeTruthy();
    });

    it('should render remove button', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} />
      );
      expect(getByTestId('remove-button')).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render block button when onBlock provided', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} onBlock={mockOnBlock} />
      );
      expect(getByTestId('block-button')).toBeTruthy();
    });

    it('should not render block button when onBlock not provided', () => {
      const { queryByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} />
      );
      expect(queryByTestId('block-button')).toBeNull();
    });

    it('should show Anonymous Walker when no display_name', () => {
      const buddyWithoutName = {
        ...mockBuddy,
        buddy_profile: null,
      };
      const { getByTestId } = render(
        <BuddyListItem buddy={buddyWithoutName} onRemove={mockOnRemove} />
      );
      const name = getByTestId('display-name');
      expect(name.props.children).toBe('Anonymous Walker');
    });
  });

  describe('User Interactions', () => {
    it('should call onRemove when remove button pressed', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} />
      );
      fireEvent.press(getByTestId('remove-button'));
      expect(mockOnRemove).toHaveBeenCalled();
    });

    it('should call onBlock when block button pressed', () => {
      const { getByTestId } = render(
        <BuddyListItem buddy={mockBuddy} onRemove={mockOnRemove} onBlock={mockOnBlock} />
      );
      fireEvent.press(getByTestId('block-button'));
      expect(mockOnBlock).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing buddy_profile gracefully', () => {
      const buddyWithoutProfile = { id: 'buddy-2', buddy_profile: null };
      const { getByTestId } = render(
        <BuddyListItem buddy={buddyWithoutProfile} onRemove={mockOnRemove} />
      );
      expect(getByTestId('buddy-list-item')).toBeTruthy();
    });
  });
});

