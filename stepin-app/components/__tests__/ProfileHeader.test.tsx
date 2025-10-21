import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileHeader } from '../ProfileHeader';
import { useTheme } from '../../lib/theme/themeManager';
import { useRouter } from 'expo-router';

jest.mock('../../lib/theme/themeManager');
jest.mock('expo-router');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

describe('ProfileHeader', () => {
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
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe('Rendering', () => {
    it('should render profile header', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John Doe" email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('profile-header')).toBeTruthy();
    });

    it('should render avatar image when avatarUrl provided', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl="https://example.com/avatar.jpg" />
      );
      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should render avatar placeholder when no avatarUrl', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('avatar-placeholder')).toBeTruthy();
    });

    it('should render display name', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John Doe" email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('display-name').props.children).toBe('John Doe');
    });

    it('should render email', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('email').props.children).toBe('john@example.com');
    });

    it('should render edit button', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('edit-button')).toBeTruthy();
    });
  });

  describe('Initials Logic', () => {
    it('should show initials from two-word name', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John Doe" email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('initials').props.children).toBe('JD');
    });

    it('should show initials from single-word name', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('initials').props.children).toBe('JO');
    });

    it('should show initials from email when no display name', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName={null} email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('initials').props.children).toBe('JO');
    });
  });

  describe('User Interactions', () => {
    it('should navigate to edit profile when edit button pressed', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl={null} />
      );
      fireEvent.press(getByTestId('edit-button'));
      expect(mockPush).toHaveBeenCalledWith('/modals/edit-profile');
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when loading', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl={null} loading={true} />
      );
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should disable edit button when loading', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName="John" email="john@example.com" avatarUrl={null} loading={true} />
      );
      expect(getByTestId('edit-button').props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should show fallback text when no display name', () => {
      const { getByTestId } = render(
        <ProfileHeader displayName={null} email="john@example.com" avatarUrl={null} />
      );
      expect(getByTestId('display-name').props.children).toBe('Set your name');
    });
  });
});

