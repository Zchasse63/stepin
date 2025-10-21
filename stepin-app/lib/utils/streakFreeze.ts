/**
 * Streak Freeze Utility
 * Handles streak freeze earning, usage, and validation
 */

import { supabase } from '../supabase/client';
import { logger } from './logger';
import * as Sentry from '@sentry/react-native';

const MAX_STREAK_FREEZES = 3;
const FREEZE_EARN_INTERVAL_DAYS = 7; // Earn a freeze every 7-day streak milestone

export interface StreakFreezeStatus {
  available: number;
  maxAllowed: number;
  canEarn: boolean;
  nextEarnAt?: number; // Streak count needed for next freeze
  lastEarnedDate?: string;
  lastUsedDate?: string;
}

/**
 * Get streak freeze status for a user
 */
export async function getStreakFreezeStatus(userId: string): Promise<StreakFreezeStatus> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('streak_freezes_available, last_freeze_earned_date, last_freeze_used_date')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching streak freeze status:', error);
      return {
        available: 0,
        maxAllowed: MAX_STREAK_FREEZES,
        canEarn: false,
      };
    }

    // Get current streak
    const { data: streak } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    const currentStreak = streak?.current_streak || 0;
    const available = profile?.streak_freezes_available || 0;

    // Calculate next earn milestone
    const nextMilestone = Math.ceil(currentStreak / FREEZE_EARN_INTERVAL_DAYS) * FREEZE_EARN_INTERVAL_DAYS;
    const nextEarnAt = nextMilestone > currentStreak ? nextMilestone : currentStreak + FREEZE_EARN_INTERVAL_DAYS;

    // Can earn if at a milestone and below max
    const canEarn = currentStreak > 0 && 
                    currentStreak % FREEZE_EARN_INTERVAL_DAYS === 0 && 
                    available < MAX_STREAK_FREEZES;

    return {
      available,
      maxAllowed: MAX_STREAK_FREEZES,
      canEarn,
      nextEarnAt,
      lastEarnedDate: profile?.last_freeze_earned_date,
      lastUsedDate: profile?.last_freeze_used_date,
    };
  } catch (error) {
    logger.error('Error in getStreakFreezeStatus:', error);
    Sentry.captureException(error);
    return {
      available: 0,
      maxAllowed: MAX_STREAK_FREEZES,
      canEarn: false,
    };
  }
}

/**
 * Earn a streak freeze (called when reaching 7-day milestones)
 */
export async function earnStreakFreeze(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const status = await getStreakFreezeStatus(userId);

    if (status.available >= MAX_STREAK_FREEZES) {
      return { success: false, error: 'Already at maximum streak freezes' };
    }

    if (!status.canEarn) {
      return { success: false, error: 'Not eligible to earn a freeze yet' };
    }

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('profiles')
      .update({
        streak_freezes_available: status.available + 1,
        last_freeze_earned_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      logger.error('Error earning streak freeze:', error);
      return { success: false, error: error.message };
    }

    logger.info('Streak freeze earned', { userId, newTotal: status.available + 1 });
    return { success: true };
  } catch (error) {
    logger.error('Error in earnStreakFreeze:', error);
    Sentry.captureException(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Use a streak freeze to protect a missed day
 */
export async function useStreakFreeze(
  userId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const status = await getStreakFreezeStatus(userId);

    if (status.available <= 0) {
      return { success: false, error: 'No streak freezes available' };
    }

    // Check if already used a freeze on this date
    const { data: dailyStats } = await supabase
      .from('daily_stats')
      .select('streak_freeze_used')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (dailyStats?.streak_freeze_used) {
      return { success: false, error: 'Freeze already used on this date' };
    }

    // Update profile to decrement freezes
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        streak_freezes_available: status.available - 1,
        last_freeze_used_date: date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) {
      logger.error('Error updating profile for freeze:', profileError);
      return { success: false, error: profileError.message };
    }

    // Mark the daily stats as having used a freeze
    const { error: statsError } = await supabase
      .from('daily_stats')
      .upsert({
        user_id: userId,
        date,
        total_steps: 0,
        goal_met: true, // Freeze counts as goal met
        streak_freeze_used: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date',
      });

    if (statsError) {
      logger.error('Error updating daily stats for freeze:', statsError);
      // Try to rollback profile update
      await supabase
        .from('profiles')
        .update({
          streak_freezes_available: status.available,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      return { success: false, error: statsError.message };
    }

    logger.info('Streak freeze used', { userId, date, remaining: status.available - 1 });
    return { success: true };
  } catch (error) {
    logger.error('Error in useStreakFreeze:', error);
    Sentry.captureException(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if user can use a freeze for a specific date
 */
export async function canUseFreezeForDate(
  userId: string,
  date: string
): Promise<{ canUse: boolean; reason?: string }> {
  try {
    const status = await getStreakFreezeStatus(userId);

    if (status.available <= 0) {
      return { canUse: false, reason: 'No freezes available' };
    }

    // Check if date is in the past
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate > today) {
      return { canUse: false, reason: 'Cannot use freeze for future dates' };
    }

    // Check if already used on this date
    const { data: dailyStats } = await supabase
      .from('daily_stats')
      .select('streak_freeze_used, goal_met')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (dailyStats?.streak_freeze_used) {
      return { canUse: false, reason: 'Freeze already used on this date' };
    }

    if (dailyStats?.goal_met) {
      return { canUse: false, reason: 'Goal already met on this date' };
    }

    return { canUse: true };
  } catch (error) {
    logger.error('Error in canUseFreezeForDate:', error);
    return { canUse: false, reason: 'Error checking freeze eligibility' };
  }
}

/**
 * Get dates where freeze can be applied (recent missed days)
 */
export async function getFreezableDate(userId: string): Promise<string | null> {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if yesterday's goal was missed
    const { data: dailyStats } = await supabase
      .from('daily_stats')
      .select('goal_met, streak_freeze_used')
      .eq('user_id', userId)
      .eq('date', yesterdayStr)
      .single();

    // If no stats exist or goal not met and no freeze used, can freeze yesterday
    if (!dailyStats || (!dailyStats.goal_met && !dailyStats.streak_freeze_used)) {
      return yesterdayStr;
    }

    return null;
  } catch (error) {
    logger.error('Error in getFreezableDate:', error);
    return null;
  }
}

