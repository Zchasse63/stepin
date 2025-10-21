/**
 * Unit tests for OfflineBanner component
 * Tests offline state detection and banner visibility
 * MEDIUM PRIORITY - Offline state component
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';
import { useTheme } from '../../lib/theme/themeManager';
import { mockTheme } from '../../tests/testUtils';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock NetInfo
const mockNetInfoState = {
  isConnected: true,
  isInternetReachable: true,
};

let netInfoListener: ((state: any) => void) | null = null;

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((listener) => {
    netInfoListener = listener;
    listener(mockNetInfoState);
    return jest.fn();
  }),
}));

// Mock offline queue
jest.mock('../../lib/offline/offlineQueue', () => ({
  getQueueStats: jest.fn().mockResolvedValue({ totalPending: 0, failedCount: 0 }),
}));

// Mock sync manager
jest.mock('../../lib/offline/syncManager', () => ({
  syncOfflineQueue: jest.fn().mockResolvedValue(undefined),
  subscribeSyncProgress: jest.fn(() => jest.fn()),
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

describe('OfflineBanner', () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const { getQueueStats } = require('../../lib/offline/offlineQueue');

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
    getQueueStats.mockResolvedValue({ totalPending: 0, failedCount: 0 });
    
    mockNetInfoState.isConnected = true;
    mockNetInfoState.isInternetReachable = true;
  });

  describe('Rendering', () => {
    it('should not render banner when online with no pending items', () => {
      const { queryByText } = render(<OfflineBanner />);
      expect(queryByText(/offline/i)).toBeNull();
    });

    it('should render banner when offline', async () => {
      const { getByText } = render(<OfflineBanner />);

      act(() => {
        mockNetInfoState.isConnected = false;
        netInfoListener?.(mockNetInfoState);
      });

      await waitFor(() => {
        expect(getByText(/offline/i)).toBeTruthy();
      });
    });

    it('should show pending items count when online with pending items', async () => {
      getQueueStats.mockResolvedValue({ totalPending: 5, failedCount: 0 });
      
      const { getByText } = render(<OfflineBanner />);

      await waitFor(() => {
        expect(getByText(/5 pending items/i)).toBeTruthy();
      });
    });
  });

  describe('Network State Changes', () => {
    it('should show banner when going offline', async () => {
      const { getByText, queryByText } = render(<OfflineBanner />);

      expect(queryByText(/offline/i)).toBeNull();

      act(() => {
        mockNetInfoState.isConnected = false;
        netInfoListener?.(mockNetInfoState);
      });

      await waitFor(() => {
        expect(getByText(/offline/i)).toBeTruthy();
      });
    });

    it('should hide banner when coming back online', async () => {
      const { queryByText } = render(<OfflineBanner />);

      act(() => {
        mockNetInfoState.isConnected = false;
        netInfoListener?.(mockNetInfoState);
      });

      await waitFor(() => {
        expect(queryByText(/offline/i)).toBeTruthy();
      });

      act(() => {
        mockNetInfoState.isConnected = true;
        netInfoListener?.(mockNetInfoState);
      });

      await waitFor(() => {
        expect(queryByText(/offline/i)).toBeNull();
      }, { timeout: 3000 });
    });
  });

  describe('AsyncStorage Integration', () => {
    it('should load last sync time from AsyncStorage', async () => {
      const mockTime = new Date().toISOString();
      AsyncStorage.getItem.mockResolvedValue(mockTime);

      render(<OfflineBanner />);

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('last_sync_time');
      });
    });

    it('should save sync time when coming back online', async () => {
      const { queryByText } = render(<OfflineBanner />);

      act(() => {
        mockNetInfoState.isConnected = false;
        netInfoListener?.(mockNetInfoState);
      });

      await waitFor(() => {
        expect(queryByText(/offline/i)).toBeTruthy();
      });

      act(() => {
        mockNetInfoState.isConnected = true;
        netInfoListener?.(mockNetInfoState);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('last_sync_time', expect.any(String));
      });
    });
  });
});
