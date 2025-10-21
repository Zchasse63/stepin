/**
 * Health Store
 * Zustand store for managing health data and permissions
 */

import { create } from 'zustand';
import { getHealthService, StepData, HealthServiceError } from '../health';
import { syncDailyStats } from '../utils/syncDailyStats';
import { updateStreak } from '../utils/updateStreak';
import { logger } from '../utils/logger';
import { checkAndSendStreakReminder } from '../notifications/streakReminderService';
import { checkAndSendGoalCelebration } from '../notifications/goalCelebrationService';
import {
  saveFailedSync,
  removeFailedSync,
  updateFailedSyncRetry,
  getSyncsReadyForRetry,
  cleanupExpiredSyncs,
  type FailedSync,
} from '../sync/syncRetryManager';
import { checkAndAwardBadges } from '../gamification/badgeService';

interface HealthState {
  // State
  todaySteps: number;
  permissionsGranted: boolean;
  permissionsChecked: boolean;
  loading: boolean;
  syncing: boolean;
  lastSynced: Date | null;
  error: string | null;
  failedSyncCount: number;

  // Actions
  requestPermissions: () => Promise<boolean>;
  checkPermissions: () => Promise<void>;
  syncTodaySteps: (userId?: string, stepGoal?: number) => Promise<void>;
  syncHistoricalData: (startDate: Date, endDate: Date) => Promise<StepData[]>;
  getStepsForDate: (date: Date) => Promise<number>;
  setTodaySteps: (steps: number) => void;
  clearError: () => void;
  reset: () => void;
  retryFailedSyncs: () => Promise<void>;
  updateFailedSyncCount: () => Promise<void>;
}

const initialState = {
  todaySteps: 0,
  permissionsGranted: false,
  permissionsChecked: false,
  loading: false,
  syncing: false,
  lastSynced: null,
  error: null,
  failedSyncCount: 0,
};

export const useHealthStore = create<HealthState>((set, get) => ({
  ...initialState,

  /**
   * Request health permissions from the user
   */
  requestPermissions: async () => {
    try {
      set({ loading: true, error: null });

      const healthService = getHealthService();
      const isAvailable = await healthService.isAvailable();

      if (!isAvailable) {
        set({
          loading: false,
          permissionsGranted: false,
          permissionsChecked: true,
          error: 'Health tracking is not available on this device. You can still log walks manually.',
        });
        return false;
      }

      const result = await healthService.requestPermissions();

      set({
        loading: false,
        permissionsGranted: result.granted,
        permissionsChecked: true,
        error: result.message || null,
      });

      // If permissions granted, sync today's steps
      if (result.granted) {
        await get().syncTodaySteps();
      }

      return result.granted;
    } catch (error) {
      logger.error('Error requesting permissions:', error);
      set({
        loading: false,
        permissionsGranted: false,
        permissionsChecked: true,
        error: 'Failed to request permissions. Please try again.',
      });
      return false;
    }
  },

  /**
   * Check if permissions are already granted
   */
  checkPermissions: async () => {
    try {
      const healthService = getHealthService();
      const isAvailable = await healthService.isAvailable();

      if (!isAvailable) {
        set({
          permissionsGranted: false,
          permissionsChecked: true,
        });
        return;
      }

      const granted = await healthService.checkPermissions();

      set({
        permissionsGranted: granted,
        permissionsChecked: true,
      });

      // If permissions granted, sync today's steps
      if (granted) {
        await get().syncTodaySteps();
      }
    } catch (error) {
      logger.error('Error checking permissions:', error);
      set({
        permissionsGranted: false,
        permissionsChecked: true,
      });
    }
  },

  /**
   * Sync today's step count from health service
   */
  syncTodaySteps: async (userId?: string, stepGoal: number = 7000) => {
    try {
      set({ syncing: true, error: null });

      const healthService = getHealthService();
      const steps = await healthService.getTodaySteps();

      set({
        todaySteps: steps,
        syncing: false,
        lastSynced: new Date(),
      });

      // Sync to Supabase if userId provided
      if (userId) {
        const today = new Date().toISOString().split('T')[0];

        try {
          const syncResult = await syncDailyStats({
            userId,
            date: today,
            steps,
            stepGoal,
          });

          // If sync failed, save for retry
          if (!syncResult.success) {
            await saveFailedSync({
              type: 'daily_stats',
              data: { userId, date: today, steps, stepGoal },
              error: syncResult.error,
            });
            await get().updateFailedSyncCount();
          }

          // Update streak if goal met
          if (syncResult.success && steps >= stepGoal) {
            try {
              await updateStreak(userId, today);
            } catch (streakError) {
              logger.error('Error updating streak:', streakError);
              // Save failed streak update for retry
              await saveFailedSync({
                type: 'streak',
                data: { userId, date: today },
                error: streakError instanceof Error ? streakError.message : 'Unknown error',
              });
              await get().updateFailedSyncCount();
            }

            // Send goal celebration notification if enabled
            await checkAndSendGoalCelebration(userId, steps, stepGoal);

            // Check and award badges after goal completion
            try {
              await checkAndAwardBadges(userId);
            } catch (badgeError) {
              logger.error('Error checking badges:', badgeError);
              // Don't fail the sync if badge check fails
            }
          }

          // Check if streak reminder should be sent (after 8 PM if goal not met)
          await checkAndSendStreakReminder(userId);
        } catch (syncError) {
          logger.error('Error in sync process:', syncError);
          // Save for retry
          await saveFailedSync({
            type: 'daily_stats',
            data: { userId, date: today, steps, stepGoal },
            error: syncError instanceof Error ? syncError.message : 'Unknown error',
          });
          await get().updateFailedSyncCount();
        }
      }
    } catch (error) {
      logger.error('Error syncing today steps:', error);

      let errorMessage = 'Failed to sync step data. Please try again.';
      if (error instanceof HealthServiceError) {
        errorMessage = error.userMessage;
      }

      set({
        syncing: false,
        error: errorMessage,
      });
    }
  },

  /**
   * Sync historical step data for a date range
   */
  syncHistoricalData: async (startDate: Date, endDate: Date) => {
    try {
      set({ loading: true, error: null });

      const healthService = getHealthService();
      const stepData = await healthService.getStepsForDateRange(startDate, endDate);

      set({
        loading: false,
        lastSynced: new Date(),
      });

      return stepData;
    } catch (error) {
      logger.error('Error syncing historical data:', error);

      let errorMessage = 'Failed to sync historical data. Please try again.';
      if (error instanceof HealthServiceError) {
        errorMessage = error.userMessage;
      }

      set({
        loading: false,
        error: errorMessage,
      });

      return [];
    }
  },

  /**
   * Get step count for a specific date
   */
  getStepsForDate: async (date: Date) => {
    try {
      const healthService = getHealthService();
      const steps = await healthService.getStepsForDate(date);
      return steps;
    } catch (error) {
      logger.error('Error getting steps for date:', error);

      let errorMessage = 'Failed to get step data for this date.';
      if (error instanceof HealthServiceError) {
        errorMessage = error.userMessage;
      }

      set({ error: errorMessage });
      return 0;
    }
  },

  /**
   * Manually set today's step count (for testing or manual entry)
   */
  setTodaySteps: (steps: number) => {
    set({ todaySteps: steps });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },

  /**
   * Retry failed syncs with exponential backoff
   */
  retryFailedSyncs: async () => {
    try {
      logger.info('Starting retry of failed syncs');

      // Clean up expired syncs first
      await cleanupExpiredSyncs();

      // Get syncs ready for retry
      const syncsToRetry = await getSyncsReadyForRetry();

      if (syncsToRetry.length === 0) {
        logger.info('No syncs ready for retry');
        return;
      }

      logger.info(`Retrying ${syncsToRetry.length} failed syncs`);

      for (const sync of syncsToRetry) {
        try {
          let success = false;

          if (sync.type === 'daily_stats') {
            const { userId, date, steps, stepGoal } = sync.data;
            const result = await syncDailyStats({ userId, date, steps, stepGoal });
            success = result.success;

            if (!success) {
              await updateFailedSyncRetry(sync.id, result.error);
            }
          } else if (sync.type === 'streak') {
            const { userId, date } = sync.data;
            await updateStreak(userId, date);
            success = true;
          }

          if (success) {
            await removeFailedSync(sync.id);
            logger.info('Successfully retried sync', { id: sync.id, type: sync.type });
          }
        } catch (error) {
          logger.error('Error retrying sync:', error);
          await updateFailedSyncRetry(
            sync.id,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      // Update failed sync count
      await get().updateFailedSyncCount();
    } catch (error) {
      logger.error('Error in retryFailedSyncs:', error);
    }
  },

  /**
   * Update the count of failed syncs
   */
  updateFailedSyncCount: async () => {
    try {
      const syncs = await getSyncsReadyForRetry();
      set({ failedSyncCount: syncs.length });
    } catch (error) {
      logger.error('Error updating failed sync count:', error);
    }
  },
}));

