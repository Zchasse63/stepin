/**
 * Unit tests for ProfileButton component
 * Tests avatar display, navigation, and user interactions
 * MEDIUM PRIORITY - Navigation component
 */

// Mock expo-router BEFORE any imports
jest.mock('expo-router', () => {
  const mockPush = jest.fn();
  return {
    router: {
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    },
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    }),
  };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileButton } from '../ProfileButton';
import { useTheme } from '../../lib/theme/themeManager';
import { useProfileStore } from '../../lib/store/profileStore';
import { router } from 'expo-router';
import { mockTheme } from '../../tests/testUtils';
import type { UserProfile } from '../../types/profile';

// Mock Supabase client
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}));

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/store/profileStore', () => ({
  useProfileStore: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('ProfileButton', () => {
  const mockProfile: UserProfile = {
    id: 'user-123',
    email: 'test@example.com',
    display_name: 'Test User',
    avatar_url: null,
    daily_step_goal: 10000,
    units_preference: 'miles',
    theme_preference: 'light',
    notification_settings: {
      dailyReminder: true,
      streakReminder: true,
      goalCelebration: true,
      reminderTime: '09:00',
    },
    privacy_settings: {
      profile_visibility: 'public',
      activity_visibility: 'buddies',
      show_location: false,
    },
    weather_alerts_enabled: false,
    preferred_walk_time: 'morning',
    location_coordinates: null,
    audio_coaching_enabled: false,
    audio_coaching_interval: 300,
    auto_detect_enabled: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    (useProfileStore as jest.Mock).mockReturnValue({ profile: null });
  });

  describe('Rendering - With Avatar', () => {
    it('should render button with avatar image when profile has avatar_url', () => {
      const profileWithAvatar = { ...mockProfile, avatar_url: 'https://example.com/avatar.jpg' };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileWithAvatar });

      const { getByTestId } = render(<ProfileButton />);

      expect(getByTestId('profile-button')).toBeTruthy();
      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should display avatar image with correct source', () => {
      const avatarUrl = 'https://example.com/avatar.jpg';
      const profileWithAvatar = { ...mockProfile, avatar_url: avatarUrl };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileWithAvatar });

      const { getByTestId } = render(<ProfileButton />);

      const avatar = getByTestId('avatar-image');
      expect(avatar.props.source.uri).toBe(avatarUrl);
    });
  });

  describe('Rendering - With Initials', () => {
    it('should render initials when profile exists but no avatar_url', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: mockProfile });

      const { getByTestId } = render(<ProfileButton />);

      expect(getByTestId('profile-button')).toBeTruthy();
      expect(getByTestId('avatar-placeholder')).toBeTruthy();
      expect(getByTestId('avatar-initials')).toBeTruthy();
    });

    it('should display correct initials from display_name', () => {
      const profileWithName = { ...mockProfile, display_name: 'John Doe' };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileWithName });

      const { getByTestId } = render(<ProfileButton />);

      const initials = getByTestId('avatar-initials');
      expect(initials.props.children).toBe('JD');
    });

    it('should display initials from email when no display_name', () => {
      const profileNoName = { ...mockProfile, display_name: null };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileNoName });

      const { getByTestId } = render(<ProfileButton />);

      const initials = getByTestId('avatar-initials');
      expect(initials.props.children).toBe('TE'); // from test@example.com
    });

    it('should handle single name display_name', () => {
      const profileSingleName = { ...mockProfile, display_name: 'John' };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileSingleName });

      const { getByTestId } = render(<ProfileButton />);

      const initials = getByTestId('avatar-initials');
      expect(initials.props.children).toBe('JO');
    });
  });

  describe('Rendering - No Profile', () => {
    it('should render placeholder icon when no profile loaded', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: null });

      const { getByTestId } = render(<ProfileButton />);

      expect(getByTestId('profile-button')).toBeTruthy();
      expect(getByTestId('avatar-placeholder')).toBeTruthy();
      expect(getByTestId('avatar-icon')).toBeTruthy();
    });

    it('should not render avatar image when profile is null', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: null });

      const { queryByTestId } = render(<ProfileButton />);

      expect(queryByTestId('avatar-image')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should navigate to profile screen when pressed', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: mockProfile });

      const { getByTestId } = render(<ProfileButton />);

      fireEvent.press(getByTestId('profile-button'));
      expect(router.push).toHaveBeenCalledWith('/profile');
    });

    it('should navigate when button with avatar is pressed', () => {
      const profileWithAvatar = { ...mockProfile, avatar_url: 'https://example.com/avatar.jpg' };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileWithAvatar });

      const { getByTestId } = render(<ProfileButton />);

      fireEvent.press(getByTestId('profile-button'));
      expect(router.push).toHaveBeenCalledWith('/profile');
    });

    it('should navigate even when no profile loaded', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: null });

      const { getByTestId } = render(<ProfileButton />);

      fireEvent.press(getByTestId('profile-button'));
      expect(router.push).toHaveBeenCalledWith('/profile');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid avatar URL gracefully', () => {
      const profileInvalidUrl = { ...mockProfile, avatar_url: 'invalid-url' };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileInvalidUrl });

      const { getByTestId } = render(<ProfileButton />);

      expect(getByTestId('profile-button')).toBeTruthy();
      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should handle very long avatar URL', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';
      const profileLongUrl = { ...mockProfile, avatar_url: longUrl };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileLongUrl });

      const { getByTestId } = render(<ProfileButton />);

      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should handle empty display_name and email', () => {
      const profileEmpty = { ...mockProfile, display_name: '', email: '' };
      (useProfileStore as jest.Mock).mockReturnValue({ profile: profileEmpty });

      const { getByTestId } = render(<ProfileButton />);

      const initials = getByTestId('avatar-initials');
      expect(initials.props.children).toBe('U'); // Default fallback
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: mockProfile });

      const { getByTestId } = render(<ProfileButton />);

      const button = getByTestId('profile-button');
      expect(button.props.accessibilityLabel).toBe('Open profile');
    });

    it('should have accessibility hint', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: mockProfile });

      const { getByTestId } = render(<ProfileButton />);

      const button = getByTestId('profile-button');
      expect(button.props.accessibilityHint).toBe('Opens your profile and settings');
    });

    it('should have button role', () => {
      (useProfileStore as jest.Mock).mockReturnValue({ profile: mockProfile });

      const { getByTestId } = render(<ProfileButton />);

      const button = getByTestId('profile-button');
      expect(button.props.accessibilityRole).toBe('button');
    });
  });
});

