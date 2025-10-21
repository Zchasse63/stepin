/**
 * Sync Manager
 * Handles syncing of offline queue when connection is restored
 */

import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';
import {
  getRetryableWalks,
  removeFromOfflineQueue,
  incrementRetryCount,
  type PendingSyncWalk,
} from './offlineQueue';

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentWalk?: PendingSyncWalk;
  status: 'syncing' | 'complete' | 'error';
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

let isSyncing = false;
let syncCallbacks: SyncProgressCallback[] = [];

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch (error) {
    logger.error('Error checking network status:', error);
    return false;
  }
}

/**
 * Subscribe to sync progress updates
 */
export function subscribeSyncProgress(callback: SyncProgressCallback): () => void {
  syncCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    syncCallbacks = syncCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Notify all subscribers of sync progress
 */
function notifyProgress(progress: SyncProgress): void {
  syncCallbacks.forEach(callback => {
    try {
      callback(progress);
    } catch (error) {
      logger.error('Error in sync progress callback:', error);
    }
  });
}

/**
 * Sync all pending walks from the offline queue
 */
export async function syncOfflineQueue(): Promise<SyncProgress> {
  if (isSyncing) {
    logger.info('Sync already in progress, skipping');
    return {
      total: 0,
      completed: 0,
      failed: 0,
      status: 'syncing',
    };
  }

  try {
    isSyncing = true;

    // Check if online
    const online = await isOnline();
    if (!online) {
      logger.info('Device is offline, skipping sync');
      return {
        total: 0,
        completed: 0,
        failed: 0,
        status: 'error',
      };
    }

    // Get pending walks
    const pendingWalks = await getRetryableWalks();
    
    if (pendingWalks.length === 0) {
      logger.info('No pending walks to sync');
      return {
        total: 0,
        completed: 0,
        failed: 0,
        status: 'complete',
      };
    }

    logger.info('Starting offline queue sync', { count: pendingWalks.length });

    let completed = 0;
    let failed = 0;

    // Sync each walk
    for (const pendingWalk of pendingWalks) {
      notifyProgress({
        total: pendingWalks.length,
        completed,
        failed,
        currentWalk: pendingWalk,
        status: 'syncing',
      });

      try {
        await syncWalk(pendingWalk);
        await removeFromOfflineQueue(pendingWalk.id);
        completed++;
        
        logger.info('Successfully synced walk', { id: pendingWalk.id });
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await incrementRetryCount(pendingWalk.id, errorMessage);
        
        logger.error('Failed to sync walk', {
          id: pendingWalk.id,
          error: errorMessage,
          retryCount: pendingWalk.retryCount + 1,
        });
      }

      // Small delay between syncs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const finalProgress: SyncProgress = {
      total: pendingWalks.length,
      completed,
      failed,
      status: 'complete',
    };

    notifyProgress(finalProgress);

    logger.info('Offline queue sync complete', { completed, failed });

    return finalProgress;
  } catch (error) {
    logger.error('Error during offline queue sync:', error);
    
    const errorProgress: SyncProgress = {
      total: 0,
      completed: 0,
      failed: 0,
      status: 'error',
    };
    
    notifyProgress(errorProgress);
    
    return errorProgress;
  } finally {
    isSyncing = false;
  }
}

/**
 * Sync a single walk to the database
 */
async function syncWalk(pendingWalk: PendingSyncWalk): Promise<void> {
  const { userId, data } = pendingWalk;

  // Insert walk into database
  const { data: insertedWalk, error: insertError } = await supabase
    .from('walks')
    .insert({
      user_id: userId,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to insert walk: ${insertError.message}`);
  }

  // Get user's step goal
  const { data: profile } = await supabase
    .from('profiles')
    .select('daily_step_goal')
    .eq('id', userId)
    .single();

  const stepGoal = profile?.daily_step_goal || 7000;

  // Update daily stats
  const walkDate = data.start_time
    ? new Date(data.start_time).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Get existing daily stats
  const { data: existingStats } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', walkDate)
    .single();

  const newTotalSteps = (existingStats?.total_steps || 0) + (data.steps || 0);
  const newTotalDistance = (existingStats?.total_distance_meters || 0) + (data.distance_meters || 0);
  const newTotalDuration = (existingStats?.total_active_minutes || 0) + (data.duration_minutes || 0);
  const newWalkCount = (existingStats?.walk_count || 0) + 1;
  const goalMet = newTotalSteps >= stepGoal;

  // Upsert daily stats
  const { error: statsError } = await supabase
    .from('daily_stats')
    .upsert({
      user_id: userId,
      date: walkDate,
      total_steps: newTotalSteps,
      total_distance_meters: newTotalDistance,
      total_active_minutes: newTotalDuration,
      walk_count: newWalkCount,
      goal_met: goalMet,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,date',
    });

  if (statsError) {
    throw new Error(`Failed to update daily stats: ${statsError.message}`);
  }

  // Update streak if goal met
  if (goalMet) {
    await updateStreak(userId, walkDate);
  }
}

/**
 * Update user's streak
 */
async function updateStreak(userId: string, date: string): Promise<void> {
  try {
    // Get current streak
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!streak) {
      // Create new streak
      await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: date,
        });
      return;
    }

    // Check if this extends the streak
    const lastDate = new Date(streak.last_activity_date);
    const currentDate = new Date(date);
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    let newCurrentStreak = streak.current_streak;
    
    if (daysDiff === 1) {
      // Consecutive day - extend streak
      newCurrentStreak = streak.current_streak + 1;
    } else if (daysDiff === 0) {
      // Same day - no change
      newCurrentStreak = streak.current_streak;
    } else {
      // Streak broken - reset to 1
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);

    await supabase
      .from('streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: date,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (error) {
    logger.error('Error updating streak:', error);
    // Don't throw - streak update is not critical
  }
}

/**
 * Start automatic sync when connection is restored
 */
export function startAutoSync(): () => void {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      logger.info('Connection restored, starting auto-sync');
      syncOfflineQueue();
    }
  });

  return unsubscribe;
}

