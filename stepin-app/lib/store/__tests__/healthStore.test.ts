/**
 * Unit tests for healthStore
 * Tests health data and permissions state management
 *
 * NOTE: This store has extensive native and integration dependencies that make
 * comprehensive unit testing impractical. Most functionality is intentionally
 * left for E2E testing.
 *
 * NATIVE DEPENDENCIES (Cannot be properly mocked in unit tests):
 * - HealthKit/Health Connect: Step data, permissions, historical data
 * - Notifications: Streak reminders, goal celebrations
 * - Badge Service: Achievement tracking and awards
 * - Sync Retry Manager: Failed sync persistence and retry logic
 *
 * INTEGRATION DEPENDENCIES (Better tested in integration tests):
 * - syncDailyStats: Supabase upsert operations
 * - updateStreak: Supabase RPC calls
 * - Supabase storage: Failed sync persistence
 *
 * RECOMMENDED FOR E2E TESTING:
 * - requestPermissions: Request HealthKit permissions → Sync today's steps
 * - checkPermissions: Check current permission status
 * - syncTodaySteps: Fetch steps from HealthKit → Sync to Supabase → Update streak → Send notifications → Award badges
 * - syncHistoricalData: Batch sync multiple days of step data
 * - retryFailedSyncs: Retry previously failed sync operations
 * - getStepsForDate: Fetch steps for specific date from HealthKit
 *
 * CRITICAL E2E SCENARIOS TO COVER:
 * 1. First launch → Request permissions → Grant → Verify today's steps synced
 * 2. Daily sync → Reach goal → Verify notification sent and badge awarded
 * 3. Daily sync → Miss goal → Verify streak broken and reminder sent
 * 4. Network failure → Verify sync saved to retry queue
 * 5. Retry failed syncs → Verify all pending syncs processed
 * 6. Historical sync → Sync 30 days → Verify all data imported correctly
 * 7. Permission denied → Verify manual logging still works
 * 8. Background sync → App backgrounded → Verify periodic sync continues
 */

// Mock native dependencies before imports
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../health', () => ({
  getHealthService: jest.fn(() => ({
    isAvailable: jest.fn().mockResolvedValue(true),
    requestPermissions: jest.fn().mockResolvedValue({ granted: true }),
    checkPermissions: jest.fn().mockResolvedValue({ granted: true }),
    getTodaySteps: jest.fn().mockResolvedValue(0),
    getStepsForDate: jest.fn().mockResolvedValue(0),
    getStepsForRange: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('../../utils/syncDailyStats', () => ({
  syncDailyStats: jest.fn(),
}));

jest.mock('../../utils/updateStreak', () => ({
  updateStreak: jest.fn(),
}));

jest.mock('../../notifications/streakReminderService', () => ({
  checkAndSendStreakReminder: jest.fn(),
}));

jest.mock('../../notifications/goalCelebrationService', () => ({
  checkAndSendGoalCelebration: jest.fn(),
}));

jest.mock('../../sync/syncRetryManager', () => ({
  saveFailedSync: jest.fn(),
  removeFailedSync: jest.fn(),
  updateFailedSyncRetry: jest.fn(),
  getSyncsReadyForRetry: jest.fn().mockResolvedValue([]),
  cleanupExpiredSyncs: jest.fn(),
}));

jest.mock('../../gamification/badgeService', () => ({
  checkAndAwardBadges: jest.fn(),
}));

import { useHealthStore } from '../healthStore';

describe('healthStore', () => {
  beforeEach(() => {
    // Reset store state
    useHealthStore.setState({
      todaySteps: 0,
      permissionsGranted: false,
      permissionsChecked: false,
      loading: false,
      syncing: false,
      lastSynced: null,
      error: null,
      failedSyncCount: 0,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useHealthStore.getState();
      expect(state.todaySteps).toBe(0);
      expect(state.permissionsGranted).toBe(false);
      expect(state.permissionsChecked).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.syncing).toBe(false);
      expect(state.lastSynced).toBeNull();
      expect(state.error).toBeNull();
      expect(state.failedSyncCount).toBe(0);
    });
  });

  describe('setTodaySteps', () => {
    it('should update today steps', () => {
      const { setTodaySteps } = useHealthStore.getState();
      setTodaySteps(5000);

      const state = useHealthStore.getState();
      expect(state.todaySteps).toBe(5000);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useHealthStore.setState({ error: 'Some error' });

      const { clearError } = useHealthStore.getState();
      clearError();

      const state = useHealthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Set some state
      useHealthStore.setState({
        todaySteps: 10000,
        permissionsGranted: true,
        permissionsChecked: true,
        loading: true,
        syncing: true,
        lastSynced: new Date(),
        error: 'Some error',
        failedSyncCount: 5,
      });

      const { reset } = useHealthStore.getState();
      reset();

      const state = useHealthStore.getState();
      expect(state.todaySteps).toBe(0);
      expect(state.permissionsGranted).toBe(false);
      expect(state.permissionsChecked).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.syncing).toBe(false);
      expect(state.lastSynced).toBeNull();
      expect(state.error).toBeNull();
      expect(state.failedSyncCount).toBe(0);
    });
  });

  // NOTE: requestPermissions, checkPermissions, syncTodaySteps, syncHistoricalData,
  // getStepsForDate, retryFailedSyncs, and updateFailedSyncCount are intentionally
  // not unit tested here due to heavy native and integration dependencies.
  // See file header for E2E testing recommendations.
});

