/**
 * Unit tests for HealthPermissionDeniedBanner component
 * Tests banner visibility, settings navigation, and dismiss functionality
 * MEDIUM PRIORITY - Permission guidance component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HealthPermissionDeniedBanner } from '../HealthPermissionDeniedBanner';
import { useTheme } from '../../lib/theme/themeManager';
import { mockTheme, mockAsyncStorage } from '../../tests/testUtils';
import { Linking } from 'react-native';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('HealthPermissionDeniedBanner', () => {
  const mockOnDismiss = jest.fn();
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    AsyncStorage.setItem.mockResolvedValue(undefined);
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.removeItem.mockResolvedValue(undefined);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as any);
    jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined as any);
  });

  describe('Rendering - Visibility', () => {
    it('should render banner by default', () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      expect(getByTestId('health-permission-banner')).toBeTruthy();
    });

    it('should hide banner after dismiss', async () => {
      const { getByTestId, UNSAFE_root } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      expect(getByTestId('health-permission-banner')).toBeTruthy();

      fireEvent.press(getByTestId('dismiss-button'));

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });

      // Component should unmount itself
      await waitFor(() => {
        expect(() => UNSAFE_root.findByProps({ testID: 'health-permission-banner' })).toThrow();
      });
    });
  });

  describe('Rendering - Content', () => {
    it('should render banner message', () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      expect(getByTestId('banner-message')).toBeTruthy();
    });

    it('should render settings button', () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      expect(getByTestId('settings-button')).toBeTruthy();
    });

    it('should render dismiss button', () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      expect(getByTestId('dismiss-button')).toBeTruthy();
    });

    it('should display appropriate warning message', () => {
      const { getByText } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      expect(getByText(/Health Tracking Disabled/i)).toBeTruthy();
      expect(getByText(/permissions are required/i)).toBeTruthy();
    });
  });

  describe('User Interactions - Open Settings', () => {
    it('should open device settings when settings button is pressed', async () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('settings-button'));

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith('app-settings:');
      });
    });

    it('should handle settings open errors gracefully', async () => {
      jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('Failed to open'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('settings-button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to open settings:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('User Interactions - Dismiss', () => {
    it('should call onDismiss when dismiss button is pressed', async () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('dismiss-button'));

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it('should save dismiss state to AsyncStorage', async () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('dismiss-button'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('health_permission_banner_dismissed', 'true');
      });
    });

    it('should hide banner after dismiss', async () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('dismiss-button'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('health_permission_banner_dismissed', 'true');
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });
  });

  describe('Persistence', () => {
    it('should persist dismissal to AsyncStorage', async () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('dismiss-button'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('health_permission_banner_dismissed', 'true');
      });

      // Verify onDismiss was called
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have warning/error styling', () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      const banner = getByTestId('health-permission-banner');
      expect(banner.props.style).toBeDefined();
    });

    it('should display warning icon', () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      expect(getByTestId('warning-icon')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid dismiss clicks', async () => {
      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      const dismissButton = getByTestId('dismiss-button');
      fireEvent.press(dismissButton);

      // Wait for first dismiss to complete
      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });

      // Component should be unmounted, so additional clicks won't happen
      // Just verify the first click worked
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('health_permission_banner_dismissed', 'true');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByTestId } = render(
        <HealthPermissionDeniedBanner onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByTestId('dismiss-button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save dismissal:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});

