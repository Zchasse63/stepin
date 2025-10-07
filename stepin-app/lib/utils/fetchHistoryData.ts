/**
 * Data fetching utilities for history screen
 * Fetches walks, daily_stats, and streaks from Supabase
 */

import { supabase } from '../supabase/client';
import { Walk, DailyStats, Streak } from '../../types/database';
import { logger } from './logger';
import { DateRange, HistoryData } from '../../types/history';
import { formatDateForAPI } from './dateUtils';

/**
 * Fetch walks for a date range
 */
export async function fetchWalks(
  userId: string,
  dateRange: DateRange
): Promise<Walk[]> {
  const startDate = formatDateForAPI(dateRange.startDate);
  const endDate = formatDateForAPI(dateRange.endDate);
  
  const { data, error } = await supabase
    .from('walks')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  
  if (error) {
    logger.error('Error fetching walks:', error);
    throw new Error('Failed to fetch walks');
  }
  
  return data || [];
}

/**
 * Fetch daily stats for a date range
 */
export async function fetchDailyStats(
  userId: string,
  dateRange: DateRange
): Promise<DailyStats[]> {
  const startDate = formatDateForAPI(dateRange.startDate);
  const endDate = formatDateForAPI(dateRange.endDate);
  
  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  
  if (error) {
    logger.error('Error fetching daily stats:', error);
    throw new Error('Failed to fetch daily stats');
  }
  
  return data || [];
}

/**
 * Fetch user's current streak
 */
export async function fetchStreak(userId: string): Promise<Streak | null> {
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
}

/**
 * Fetch paginated walks
 */
export async function fetchWalksPaginated(
  userId: string,
  dateRange: DateRange,
  page: number = 0,
  pageSize: number = 20
): Promise<{ walks: Walk[]; hasMore: boolean }> {
  const startDate = formatDateForAPI(dateRange.startDate);
  const endDate = formatDateForAPI(dateRange.endDate);
  
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('walks')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .range(from, to);
  
  if (error) {
    logger.error('Error fetching paginated walks:', error);
    throw new Error('Failed to fetch walks');
  }
  
  const hasMore = count ? (from + (data?.length || 0)) < count : false;
  
  return {
    walks: data || [],
    hasMore
  };
}

/**
 * Fetch complete history data for a date range
 */
export async function fetchHistoryData(
  userId: string,
  dateRange: DateRange,
  stepGoal: number
): Promise<HistoryData> {
  // Fetch walks and daily stats in parallel
  const [walks, dailyStats] = await Promise.all([
    fetchWalks(userId, dateRange),
    fetchDailyStats(userId, dateRange)
  ]);
  
  // Calculate summary statistics
  const totalSteps = dailyStats.reduce((sum, stat) => sum + stat.total_steps, 0);
  const totalWalks = walks.length;
  const daysWithData = dailyStats.filter(stat => stat.total_steps > 0).length;
  const averageSteps = daysWithData > 0 ? Math.round(totalSteps / daysWithData) : 0;
  const daysGoalMet = dailyStats.filter(stat => stat.goal_met).length;
  const goalMetPercentage = daysWithData > 0 
    ? Math.round((daysGoalMet / daysWithData) * 100) 
    : 0;
  
  return {
    walks,
    dailyStats,
    totalSteps,
    totalWalks,
    averageSteps,
    daysGoalMet,
    goalMetPercentage
  };
}

/**
 * Fetch walks for a specific date
 */
export async function fetchWalksForDate(
  userId: string,
  date: string
): Promise<Walk[]> {
  const { data, error } = await supabase
    .from('walks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });
  
  if (error) {
    logger.error('Error fetching walks for date:', error);
    throw new Error('Failed to fetch walks');
  }
  
  return data || [];
}

/**
 * Fetch daily stats for a specific date
 */
export async function fetchDailyStatsForDate(
  userId: string,
  date: string
): Promise<DailyStats | null> {
  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No data found
      return null;
    }
    logger.error('Error fetching daily stats for date:', error);
    throw new Error('Failed to fetch daily stats');
  }
  
  return data;
}

