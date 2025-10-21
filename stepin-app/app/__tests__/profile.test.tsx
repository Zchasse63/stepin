/**
 * Unit tests for ProfileScreen
 * Tests profile display, settings management, and data export
 * CRITICAL PRIORITY - Settings and profile management screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../profile';
import { useTheme } from '../../lib/theme/themeManager';
import { useAuthStore } from '../../lib/store/authStore';
import { useProfileStore } from '../../lib/store/profileStore';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/store/authStore');
jest.mock('../../lib/store/profileStore');

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

jest.spyOn(Alert, 'alert');

// Mock child components
jest.mock('../../components/ProfileHeader', () => ({
  ProfileHeader: 'ProfileHeader',
}));

jest.mock('../../components/StatsGrid', () => ({
  StatsGrid: 'StatsGrid',
}));

jest.mock('../../components/SettingsSection', () => ({
  SettingsSection: 'SettingsSection',
}));

jest.mock('../../components/SettingRow', () => ({
  SettingRow: 'SettingRow',
}));

describe('ProfileScreen', () => {
  const mockColors = {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    secondaryBackground: '#F2F2F7',
    secondaryText: '#8E8E93',
  };

  const mockProfile = {
    displayName: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    dailyGoal: 10000,
    totalWalks: 150,
    totalSteps: 1500000,
    streak: 7,
    notificationsEnabled: true,
    notificationTime: '09:00',
    units: 'metric',
    theme: 'auto',
    walkTimeEnabled: true,
    weatherInterval: 30,
  };

  const mockSignOut = jest.fn();
  const mockUpdateProfile = jest.fn();
  const mockExportData = jest.fn();
  const mockDeleteAccount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ colors: mockColors });
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-123', email: mockProfile.email },
      signOut: mockSignOut,
    });
    (useProfileStore as jest.Mock).mockReturnValue({
      ...mockProfile,
      updateProfile: mockUpdateProfile,
      exportData: mockExportData,
      deleteAccount: mockDeleteAccount,
      fetchProfile: jest.fn(),
    });
  });

  describe('Rendering - Core Components', () => {
    it('should render profile screen', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('profile-screen')).toBeTruthy();
    });

    it('should render profile header', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('profile-header')).toBeTruthy();
    });

    it('should render stats grid', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('stats-grid')).toBeTruthy();
    });

    it('should render settings sections', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText(/notifications/i)).toBeTruthy();
      expect(getByText(/units/i)).toBeTruthy();
      expect(getByText(/appearance/i)).toBeTruthy();
    });

    it('should render sign out button', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('sign-out-button')).toBeTruthy();
    });
  });

  describe('Profile Data Display', () => {
    it('should display user name', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display user email', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText('john@example.com')).toBeTruthy();
    });

    it('should display avatar', () => {
      const { getByTestId } = render(<ProfileScreen />);
      const avatar = getByTestId('profile-avatar');
      expect(avatar.props.source.uri).toBe(mockProfile.avatarUrl);
    });
  });

  describe('Stats Display', () => {
    it('should display total walks', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText(/150.*walks/i)).toBeTruthy();
    });

    it('should display total steps', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText(/1,?500,?000.*steps/i)).toBeTruthy();
    });

    it('should display current streak', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('streak-display')).toBeTruthy();
    });
  });

  describe('Edit Profile', () => {
    it('should navigate to edit profile when button is pressed', () => {
      const mockRouter = { push: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);

      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('edit-profile-button'));
      expect(mockRouter.push).toHaveBeenCalledWith('/edit-profile');
    });
  });

  describe('Goal Settings', () => {
    it('should display daily goal slider', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('goal-slider')).toBeTruthy();
    });

    it('should update goal when slider changes', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent(getByTestId('goal-slider'), 'valueChange', 12000);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ dailyGoal: 12000 });
      });
    });
  });

  describe('Notification Settings', () => {
    it('should toggle notifications', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent(getByTestId('notifications-toggle'), 'valueChange', false);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ notificationsEnabled: false });
      });
    });

    it('should open time picker modal', () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('notification-time-button'));
      
      expect(getByTestId('time-picker-modal')).toBeTruthy();
    });

    it('should update notification time', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('notification-time-button'));
      fireEvent(getByTestId('time-picker'), 'timeChange', '10:30');
      fireEvent.press(getByTestId('time-picker-save'));
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ notificationTime: '10:30' });
      });
    });
  });

  describe('Units Settings', () => {
    it('should display current units', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText(/metric/i)).toBeTruthy();
    });

    it('should change units to imperial', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('units-button'));
      fireEvent.press(getByTestId('imperial-option'));
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ units: 'imperial' });
      });
    });
  });

  describe('Theme Settings', () => {
    it('should display current theme', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText(/auto/i)).toBeTruthy();
    });

    it('should change theme to dark', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('theme-button'));
      fireEvent.press(getByTestId('dark-theme-option'));
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ theme: 'dark' });
      });
    });
  });

  describe('Walk Time Settings', () => {
    it('should toggle walk time tracking', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent(getByTestId('walk-time-toggle'), 'valueChange', false);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ walkTimeEnabled: false });
      });
    });
  });

  describe('Weather Settings', () => {
    it('should display weather interval', () => {
      const { getByText } = render(<ProfileScreen />);
      expect(getByText(/30.*min/i)).toBeTruthy();
    });

    it('should change weather interval', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('weather-interval-button'));
      fireEvent.press(getByTestId('interval-60'));
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({ weatherInterval: 60 });
      });
    });
  });

  describe('Data Management', () => {
    it('should export data when button is pressed', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('export-data-button'));
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalled();
      });
    });

    it('should show confirmation before deleting account', () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('delete-account-button'));
      
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should delete account after confirmation', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('delete-account-button'));
      
      // Simulate confirmation
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2][1]; // Second button (Confirm)
      confirmButton.onPress();
      
      await waitFor(() => {
        expect(mockDeleteAccount).toHaveBeenCalled();
      });
    });
  });

  describe('Sign Out', () => {
    it('should show confirmation before signing out', () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('sign-out-button'));
      
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should sign out after confirmation', async () => {
      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent.press(getByTestId('sign-out-button'));
      
      // Simulate confirmation
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2][1]; // Second button (Sign Out)
      confirmButton.onPress();
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh profile data', async () => {
      const mockFetchProfile = jest.fn();
      (useProfileStore as jest.Mock).mockReturnValue({
        ...mockProfile,
        fetchProfile: mockFetchProfile,
      });

      const { getByTestId } = render(<ProfileScreen />);
      
      fireEvent(getByTestId('profile-screen'), 'refresh');
      
      await waitFor(() => {
        expect(mockFetchProfile).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator while fetching', () => {
      (useProfileStore as jest.Mock).mockReturnValue({
        ...mockProfile,
        loading: true,
        fetchProfile: jest.fn(),
      });

      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
  });
});

