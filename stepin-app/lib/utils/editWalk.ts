/**
 * Edit Walk Utility
 * Handles updating walk data and recalculating daily stats and streaks
 */

import { supabase as defaultSupabase } from '../supabase/client';
import { logger } from './logger';
import type { Walk } from '../../types/walk';
import type { SupabaseClient } from '@supabase/supabase-js';

interface EditWalkParams {
  walkId: string;
  userId: string;
  updates: Partial<Walk>;
  supabase?: SupabaseClient;
}

interface EditWalkResult {
  success: boolean;
  error?: string;
}

/**
 * Edit a walk and recalculate affected daily stats and streaks
 */
export async function editWalk({
  walkId,
  userId,
  updates,
  supabase = defaultSupabase,
}: EditWalkParams): Promise<EditWalkResult> {
  try {
    logger.info('Editing walk', { walkId, updates });

    // Get the original walk to know which dates are affected
    const { data: originalWalk, error: fetchError } = await supabase
      .from('walks')
      .select('*')
      .eq('id', walkId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !originalWalk) {
      logger.error('Failed to fetch original walk', fetchError);
      return { success: false, error: 'Walk not found' };
    }

    // Update the walk
    const { error: updateError } = await supabase
      .from('walks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', walkId)
      .eq('user_id', userId);

    if (updateError) {
      logger.error('Failed to update walk', updateError);
      return { success: false, error: 'Failed to update walk' };
    }

    // Determine which dates need recalculation
    const datesToRecalculate = new Set<string>();

    // Original date
    datesToRecalculate.add(originalWalk.date);

    // New date if changed
    if (updates.date && updates.date !== originalWalk.date) {
      datesToRecalculate.add(updates.date);
    }

    // Recalculate daily stats for affected dates
    for (const date of datesToRecalculate) {
      await recalculateDailyStats(userId, date, supabase);
    }

    // Recalculate streak
    await recalculateStreak(userId, supabase);

    logger.info('Walk edited successfully', { walkId });
    return { success: true };
  } catch (error) {
    logger.error('Error editing walk', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Recalculate daily stats for a specific date
 */
async function recalculateDailyStats(userId: string, date: string, supabase: SupabaseClient): Promise<void> {
  try {
    // Get user's step goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_step_goal')
      .eq('id', userId)
      .single();

    const stepGoal = profile?.daily_step_goal || 7000;

    // Get all walks for this date
    const { data: walks, error: walksError } = await supabase
      .from('walks')
      .select('steps, distance_meters, duration_minutes')
      .eq('user_id', userId)
      .eq('date', date);

    if (walksError) {
      logger.error('Failed to fetch walks for date', walksError);
      return;
    }

    // Calculate totals
    const totalSteps = walks?.reduce((sum, walk) => sum + (walk.steps || 0), 0) || 0;
    const goalMet = totalSteps >= stepGoal;

    // Upsert daily stats (only total_steps and goal_met exist in schema)
    const { error: upsertError } = await supabase
      .from('daily_stats')
      .upsert({
        user_id: userId,
        date,
        total_steps: totalSteps,
        goal_met: goalMet,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date',
      });

    if (upsertError) {
      logger.error('Failed to upsert daily stats', upsertError);
    }
  } catch (error) {
    logger.error('Error recalculating daily stats', error);
  }
}

/**
 * Recalculate streak based on current daily stats
 */
async function recalculateStreak(userId: string, supabase: SupabaseClient): Promise<void> {
  try {
    // Get all daily stats ordered by date descending
    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('date, goal_met')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(365); // Look back up to 1 year

    if (statsError || !dailyStats) {
      logger.error('Failed to fetch daily stats for streak calculation', statsError);
      return;
    }

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < dailyStats.length; i++) {
      const stat = dailyStats[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      // If there's a gap in dates or goal not met, break
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

    // Get last activity date
    const lastActivityDate = dailyStats.length > 0 ? dailyStats[0].date : null;

    // Update streak
    const { error: updateError } = await supabase
      .from('streaks')
      .update({
        current_streak: currentStreak,
        longest_streak: Math.max(longestStreak, currentStreak),
        last_activity_date: lastActivityDate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      logger.error('Failed to update streak', updateError);
    }
  } catch (error) {
    logger.error('Error recalculating streak', error);
  }
}

/**
 * Check if a walk edit would create a duplicate
 * (same user, same date, similar steps)
 */
export async function checkForDuplicateWalk(
  userId: string,
  walkId: string,
  date: string,
  steps: number,
  supabase: SupabaseClient = defaultSupabase
): Promise<boolean> {
  try {
    // Check for walks on same date within 10% steps
    const stepsLower = steps * 0.9;
    const stepsUpper = steps * 1.1;

    const { data: duplicates, error } = await supabase
      .from('walks')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .neq('id', walkId) // Exclude the walk being edited
      .gte('steps', stepsLower)
      .lte('steps', stepsUpper);

    if (error) {
      logger.error('Error checking for duplicate walks', error);
      return false;
    }

    return (duplicates?.length || 0) > 0;
  } catch (error) {
    logger.error('Error in duplicate check', error);
    return false;
  }
}

