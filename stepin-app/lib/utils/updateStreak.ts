/**
 * Streak Update Utility
 * Updates user streaks when goals are met
 */

import { supabase } from '../supabase/client';
import { logger } from './logger';

/**
 * Update user streak when daily goal is met
 * Calls the Supabase update_streak function
 */
export async function updateStreak(
  userId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('update_streak', {
      user_uuid: userId,
      activity_date: date,
    });

    if (error) {
      logger.error('Error updating streak:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logger.error('Error updating streak:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get current streak for a user
 */
export async function getStreak(userId: string) {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Error fetching streak:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error fetching streak:', error);
    return null;
  }
}

