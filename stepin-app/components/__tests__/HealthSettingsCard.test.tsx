/**
 * Unit tests for HealthSettingsCard component
 * Tests health permission states, historical import, and user interactions
 * HIGH PRIORITY - Health permissions component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HealthSettingsCard } from '../HealthSettingsCard';
import { useTheme } from '../../lib/theme/themeManager';
import { mockTheme, mockAsyncStorage } from '../../tests/testUtils';

// Mock AsyncStorage FIRST
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock HealthKit
jest.mock('@kingstinct/react-native-healthkit', () => ({
  __esModule: true,
  default: {},
  queryQuantitySamples: jest.fn(),
  requestAuthorization: jest.fn(),
  authorizationStatusFor: jest.fn(),
  HKQuantityTypeIdentifier: {
    stepCount: 'stepCount',
    distanceWalkingRunning: 'distanceWalkingRunning',
  },
  HKAuthorizationStatus: {
    notDetermined: 0,
    sharingDenied: 1,
    sharingAuthorized: 2,
  },
}));

// Mock health service
const mockCheckPermissions = jest.fn();
const mockRequestPermissions = jest.fn();

jest.mock('../../lib/health', () => ({
  getHealthService: jest.fn(() => ({
    checkPermissions: mockCheckPermissions,
    requestPermissions: mockRequestPermissions,
  })),
}));

// Mock historical import
jest.mock('../../lib/health/historicalImport', () => ({
  hasCompletedHistoricalImport: jest.fn(),
}));

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

// Mock logger
jest.mock('../../lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  openSettings: jest.fn(),
}));

describe('HealthSettingsCard', () => {
  const mockOnPermissionGranted = jest.fn();
  const mockOnShowHistoricalImport = jest.fn();

  // Get references to mocked functions
  const { hasCompletedHistoricalImport } = require('../../lib/health/historicalImport');

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    mockCheckPermissions.mockResolvedValue(false);
    mockRequestPermissions.mockResolvedValue({ granted: false });
    (hasCompletedHistoricalImport as jest.Mock).mockResolvedValue(false);
  });

  describe('Rendering', () => {
    it('should show loading indicator while checking permissions', () => {
      const { UNSAFE_getByType } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      // Component shows ActivityIndicator while checking
      expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
    });

    it('should render card after permissions check completes', async () => {
      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(mockCheckPermissions).toHaveBeenCalled();
      });

      // Should show health tracking content
      expect(getByText(/Health Tracking/i)).toBeTruthy();
    });
  });

  describe('Permission States', () => {
    it('should show enable button when permissions not granted', async () => {
      mockCheckPermissions.mockResolvedValue(false);

      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(getByText(/Enable Tracking/i)).toBeTruthy();
      });
    });

    it('should show active status when permissions granted', async () => {
      mockCheckPermissions.mockResolvedValue(true);

      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(getByText(/Active/i)).toBeTruthy();
      });
    });
  });

  describe('User Interactions', () => {
    it('should request permissions when enable button is pressed', async () => {
      mockCheckPermissions.mockResolvedValue(false);
      mockRequestPermissions.mockResolvedValue({ granted: true });

      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(getByText(/Enable Tracking/i)).toBeTruthy();
      });

      fireEvent.press(getByText(/Enable Tracking/i));

      await waitFor(() => {
        expect(mockRequestPermissions).toHaveBeenCalled();
      });
    });

    it('should call onPermissionGranted when permissions granted', async () => {
      mockCheckPermissions.mockResolvedValue(false);
      mockRequestPermissions.mockResolvedValue({ granted: true });
      (hasCompletedHistoricalImport as jest.Mock).mockResolvedValue(true);

      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(getByText(/Enable Tracking/i)).toBeTruthy();
      });

      fireEvent.press(getByText(/Enable Tracking/i));

      await waitFor(() => {
        expect(mockOnPermissionGranted).toHaveBeenCalled();
      });
    });

    it('should call onShowHistoricalImport when permissions granted and not imported', async () => {
      mockCheckPermissions.mockResolvedValue(false);
      mockRequestPermissions.mockResolvedValue({ granted: true });
      (hasCompletedHistoricalImport as jest.Mock).mockResolvedValue(false);

      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(getByText(/Enable Tracking/i)).toBeTruthy();
      });

      fireEvent.press(getByText(/Enable Tracking/i));

      await waitFor(() => {
        expect(mockOnShowHistoricalImport).toHaveBeenCalled();
      });
    });
  });

  describe('Historical Import Status', () => {
    it('should check import status on mount', async () => {
      render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(hasCompletedHistoricalImport).toHaveBeenCalled();
      });
    });

    it('should show import button when permissions granted but not imported', async () => {
      mockCheckPermissions.mockResolvedValue(true);
      (hasCompletedHistoricalImport as jest.Mock).mockResolvedValue(false);

      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(getByText(/Import Historical Data/i)).toBeTruthy();
      });
    });

    it('should call onShowHistoricalImport when import button pressed', async () => {
      mockCheckPermissions.mockResolvedValue(true);
      (hasCompletedHistoricalImport as jest.Mock).mockResolvedValue(false);

      const { getByText } = render(
        <HealthSettingsCard
          onPermissionGranted={mockOnPermissionGranted}
          onShowHistoricalImport={mockOnShowHistoricalImport}
        />
      );

      await waitFor(() => {
        expect(getByText(/Import Historical Data/i)).toBeTruthy();
      });

      fireEvent.press(getByText(/Import Historical Data/i));

      expect(mockOnShowHistoricalImport).toHaveBeenCalled();
    });
  });
});
