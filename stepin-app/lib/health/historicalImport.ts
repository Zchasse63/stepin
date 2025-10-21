/**
 * Historical Health Data Import
 * Imports historical step data from HealthKit/Health Connect
 */

import { getHealthService } from './index';
import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORICAL_IMPORT_COMPLETED_KEY = 'historical_import_completed';
const HISTORICAL_IMPORT_DATE_KEY = 'historical_import_date';

export interface HistoricalImportProgress {
  totalDays: number;
  completedDays: number;
  currentDate: string;
  status: 'importing' | 'complete' | 'error' | 'cancelled';
  error?: string;
}

export interface HistoricalImportResult {
  success: boolean;
  daysImported: number;
  walksCreated: number;
  error?: string;
}

/**
 * Check if historical import has been completed
 */
export async function hasCompletedHistoricalImport(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(HISTORICAL_IMPORT_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    logger.error('Error checking historical import status:', error);
    return false;
  }
}

/**
 * Mark historical import as completed
 */
export async function markHistoricalImportComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORICAL_IMPORT_COMPLETED_KEY, 'true');
    await AsyncStorage.setItem(HISTORICAL_IMPORT_DATE_KEY, new Date().toISOString());
  } catch (error) {
    logger.error('Error marking historical import complete:', error);
  }
}

/**
 * Reset historical import status (for testing)
 */
export async function resetHistoricalImportStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORICAL_IMPORT_COMPLETED_KEY);
    await AsyncStorage.removeItem(HISTORICAL_IMPORT_DATE_KEY);
  } catch (error) {
    logger.error('Error resetting historical import status:', error);
  }
}

/**
 * Import historical step data from health service
 * @param userId - User ID
 * @param daysToImport - Number of days to import (default: 90)
 * @param onProgress - Progress callback
 * @param cancelSignal - Cancellation signal
 */
export async function importHistoricalData(
  userId: string,
  daysToImport: number = 90,
  onProgress?: (progress: HistoricalImportProgress) => void,
  cancelSignal?: { cancelled: boolean }
): Promise<HistoricalImportResult> {
  try {
    logger.info('Starting historical data import', { userId, daysToImport });

    const healthService = getHealthService();
    
    // Check if health service is available
    const isAvailable = await healthService.isAvailable();
    if (!isAvailable) {
      return {
        success: false,
        daysImported: 0,
        walksCreated: 0,
        error: 'Health service not available on this device',
      };
    }

    // Check permissions
    const hasPermissions = await healthService.checkPermissions();
    if (!hasPermissions) {
      return {
        success: false,
        daysImported: 0,
        walksCreated: 0,
        error: 'Health permissions not granted',
      };
    }

    // Get user's step goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_step_goal')
      .eq('id', userId)
      .single();

    const stepGoal = profile?.daily_step_goal || 7000;

    let daysImported = 0;
    let walksCreated = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Import data day by day, starting from oldest
    for (let i = daysToImport - 1; i >= 0; i--) {
      // Check for cancellation
      if (cancelSignal?.cancelled) {
        logger.info('Historical import cancelled by user');
        onProgress?.({
          totalDays: daysToImport,
          completedDays: daysImported,
          currentDate: '',
          status: 'cancelled',
        });
        return {
          success: false,
          daysImported,
          walksCreated,
          error: 'Import cancelled by user',
        };
      }

      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Report progress
      onProgress?.({
        totalDays: daysToImport,
        completedDays: daysImported,
        currentDate: dateStr,
        status: 'importing',
      });

      try {
        // Get steps for this date
        const steps = await healthService.getStepsForDate(date);

        if (steps > 0) {
          // Check if we already have data for this date
          const { data: existingStats } = await supabase
            .from('daily_stats')
            .select('id')
            .eq('user_id', userId)
            .eq('date', dateStr)
            .single();

          if (!existingStats) {
            // Create daily stats entry
            const goalMet = steps >= stepGoal;

            const { error: statsError } = await supabase
              .from('daily_stats')
              .insert({
                user_id: userId,
                date: dateStr,
                total_steps: steps,
                total_distance_meters: 0, // We don't have historical distance data
                total_active_minutes: 0,
                walk_count: 0,
                goal_met: goalMet,
              });

            if (statsError) {
              logger.error('Error creating daily stats:', statsError);
            } else {
              daysImported++;
            }
          }
        }
      } catch (error) {
        logger.error(`Error importing data for ${dateStr}:`, error);
        // Continue with next day even if one fails
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Recalculate streak after import
    await recalculateStreak(userId);

    // Mark import as complete
    await markHistoricalImportComplete();

    logger.info('Historical import complete', { daysImported, walksCreated });

    onProgress?.({
      totalDays: daysToImport,
      completedDays: daysImported,
      currentDate: '',
      status: 'complete',
    });

    return {
      success: true,
      daysImported,
      walksCreated,
    };
  } catch (error) {
    logger.error('Error during historical import:', error);
    
    onProgress?.({
      totalDays: daysToImport,
      completedDays: 0,
      currentDate: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      daysImported: 0,
      walksCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Recalculate user's streak based on daily stats
 */
async function recalculateStreak(userId: string): Promise<void> {
  try {
    // Get all daily stats ordered by date descending
    const { data: dailyStats, error } = await supabase
      .from('daily_stats')
      .select('date, goal_met')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(365);

    if (error || !dailyStats) {
      logger.error('Error fetching daily stats for streak calculation:', error);
      return;
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < dailyStats.length; i++) {
      const stat = dailyStats[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (stat.date !== expectedDateStr || !stat.goal_met) {
        break;
      }

      currentStreak++;
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (const stat of dailyStats.reverse()) {
      if (stat.goal_met) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Update or create streak record
    const { error: upsertError } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: Math.max(longestStreak, currentStreak),
        last_activity_date: dailyStats.length > 0 ? dailyStats[0].date : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      logger.error('Error updating streak:', upsertError);
    }
  } catch (error) {
    logger.error('Error recalculating streak:', error);
  }
}

