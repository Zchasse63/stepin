/**
 * Health Store
 * Zustand store for managing health data and permissions
 */

import { create } from 'zustand';
import { getHealthService, StepData, HealthServiceError } from '../health';
import { syncDailyStats } from '../utils/syncDailyStats';
import { updateStreak } from '../utils/updateStreak';
import { logger } from '../utils/logger';

interface HealthState {
  // State
  todaySteps: number;
  permissionsGranted: boolean;
  permissionsChecked: boolean;
  loading: boolean;
  syncing: boolean;
  lastSynced: Date | null;
  error: string | null;

  // Actions
  requestPermissions: () => Promise<boolean>;
  checkPermissions: () => Promise<void>;
  syncTodaySteps: (userId?: string, stepGoal?: number) => Promise<void>;
  syncHistoricalData: (startDate: Date, endDate: Date) => Promise<StepData[]>;
  getStepsForDate: (date: Date) => Promise<number>;
  setTodaySteps: (steps: number) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  todaySteps: 0,
  permissionsGranted: false,
  permissionsChecked: false,
  loading: false,
  syncing: false,
  lastSynced: null,
  error: null,
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
        const syncResult = await syncDailyStats({
          userId,
          date: today,
          steps,
          stepGoal,
        });

        // Update streak if goal met
        if (syncResult.success && steps >= stepGoal) {
          await updateStreak(userId, today);
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
}));

