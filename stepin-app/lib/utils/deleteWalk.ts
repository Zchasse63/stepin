/**
 * Walk deletion utilities
 * Handles deleting walks and updating related data
 */

import { supabase } from '../supabase/client';
import { Walk } from '../../types/database';
import { logger } from './logger';
import { formatDateForAPI } from './dateUtils';

/**
 * Delete a walk and update daily stats
 */
export async function deleteWalk(walkId: string, userId: string): Promise<void> {
  try {
    // First, get the walk to know which date to update
    const { data: walk, error: fetchError } = await supabase
      .from('walks')
      .select('*')
      .eq('id', walkId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      logger.error('Error fetching walk:', fetchError);
      throw new Error('Failed to fetch walk');
    }

    if (!walk) {
      throw new Error('Walk not found');
    }

    // Delete the walk
    const { error: deleteError } = await supabase
      .from('walks')
      .delete()
      .eq('id', walkId)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('Error deleting walk:', deleteError);
      throw new Error('Failed to delete walk');
    }

    // Recalculate daily stats for that date
    await recalculateDailyStats(userId, walk.date);
  } catch (error) {
    logger.error('Error in deleteWalk:', error);
    throw error;
  }
}

/**
 * Recalculate daily stats for a specific date
 */
async function recalculateDailyStats(userId: string, date: string): Promise<void> {
  try {
    // Get all walks for this date
    const { data: walks, error: walksError } = await supabase
      .from('walks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (walksError) {
      logger.error('Error fetching walks for date:', walksError);
      throw new Error('Failed to fetch walks');
    }

    // Calculate total steps
    const totalSteps = walks?.reduce((sum, walk) => sum + walk.steps, 0) || 0;

    // Get user's step goal
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('daily_step_goal')
      .eq('id', userId)
      .single();

    if (profileError) {
      logger.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch profile');
    }

    const stepGoal = profile?.daily_step_goal || 7000;
    const goalMet = totalSteps >= stepGoal;

    // Update or delete daily stats
    if (totalSteps > 0) {
      // Update daily stats
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
        logger.error('Error updating daily stats:', upsertError);
        throw new Error('Failed to update daily stats');
      }
    } else {
      // Delete daily stats if no steps
      const { error: deleteError } = await supabase
        .from('daily_stats')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (deleteError) {
        logger.error('Error deleting daily stats:', deleteError);
        // Don't throw here, as the stats might not exist
      }
    }

    // Recalculate streak
    await recalculateStreak(userId);
  } catch (error) {
    logger.error('Error in recalculateDailyStats:', error);
    throw error;
  }
}

/**
 * Recalculate user's streak
 */
async function recalculateStreak(userId: string): Promise<void> {
  try {
    // Get all daily stats ordered by date descending
    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (statsError) {
      logger.error('Error fetching daily stats:', statsError);
      throw new Error('Failed to fetch daily stats');
    }

    if (!dailyStats || dailyStats.length === 0) {
      // No stats, reset streak
      await supabase
        .from('streaks')
        .update({
          current_streak: 0,
          last_activity_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      return;
    }

    // Calculate current streak
    let currentStreak = 0;
    for (const stat of dailyStats) {
      if (stat.goal_met) {
        currentStreak++;
      } else {
        break;
      }
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
    const lastActivityDate = dailyStats[0]?.date || null;

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
      logger.error('Error updating streak:', updateError);
      throw new Error('Failed to update streak');
    }
  } catch (error) {
    logger.error('Error in recalculateStreak:', error);
    throw error;
  }
}

/**
 * Delete multiple walks
 */
export async function deleteWalks(walkIds: string[], userId: string): Promise<void> {
  try {
    // Get all walks to know which dates to update
    const { data: walks, error: fetchError } = await supabase
      .from('walks')
      .select('*')
      .in('id', walkIds)
      .eq('user_id', userId);

    if (fetchError) {
      logger.error('Error fetching walks:', fetchError);
      throw new Error('Failed to fetch walks');
    }

    if (!walks || walks.length === 0) {
      throw new Error('No walks found');
    }

    // Delete all walks
    const { error: deleteError } = await supabase
      .from('walks')
      .delete()
      .in('id', walkIds)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('Error deleting walks:', deleteError);
      throw new Error('Failed to delete walks');
    }

    // Get unique dates
    const uniqueDates = [...new Set(walks.map(w => w.date))];

    // Recalculate daily stats for each date
    for (const date of uniqueDates) {
      await recalculateDailyStats(userId, date);
    }
  } catch (error) {
    logger.error('Error in deleteWalks:', error);
    throw error;
  }
}

