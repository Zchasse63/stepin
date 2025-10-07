/**
 * Daily Stats Sync Utility
 * Syncs step data to Supabase daily_stats table
 */

import { supabase } from '../supabase/client';
import { logger } from './logger';

interface SyncDailyStatsParams {
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  steps: number;
  stepGoal: number;
}

/**
 * Sync daily stats to Supabase
 * Uses upsert logic to insert or update based on user_id and date
 */
export async function syncDailyStats({
  userId,
  date,
  steps,
  stepGoal,
}: SyncDailyStatsParams): Promise<{ success: boolean; error?: string }> {
  try {
    const goalMet = steps >= stepGoal;

    // Check if stats already exist for this date
    const { data: existingStats, error: fetchError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no stats exist
      logger.error('Error fetching existing stats:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existingStats) {
      // Update existing stats
      const { error: updateError } = await supabase
        .from('daily_stats')
        .update({
          total_steps: steps,
          goal_met: goalMet,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStats.id);

      if (updateError) {
        logger.error('Error updating daily stats:', updateError);
        return { success: false, error: updateError.message };
      }
    } else {
      // Insert new stats
      const { error: insertError } = await supabase.from('daily_stats').insert({
        user_id: userId,
        date,
        total_steps: steps,
        goal_met: goalMet,
      });

      if (insertError) {
        logger.error('Error inserting daily stats:', insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Error syncing daily stats:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get daily stats for a specific date
 */
export async function getDailyStats(userId: string, date: string) {
  try {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching daily stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error fetching daily stats:', error);
    return null;
  }
}

/**
 * Get daily stats for a date range
 */
export async function getDailyStatsRange(userId: string, startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      logger.error('Error fetching daily stats range:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error fetching daily stats range:', error);
    return [];
  }
}

