/**
 * Badge Service
 * Handles badge checking, awarding, and notifications
 */

import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'distance' | 'steps' | 'time' | 'special';
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

/**
 * Check and award badges for a user
 * Calls the database function that checks all badge criteria
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  try {
    logger.info('Checking badges for user', { userId });

    const { data, error } = await supabase.rpc('check_and_award_badges', {
      user_uuid: userId,
    });

    if (error) {
      logger.error('Error checking badges:', error);
      Sentry.captureException(error, {
        tags: { feature: 'badges' },
        extra: { userId },
      });
      return [];
    }

    const newBadgeIds = data?.map((row: any) => row.newly_awarded_badge_id) || [];

    if (newBadgeIds.length > 0) {
      logger.info('New badges awarded', { userId, count: newBadgeIds.length, badgeIds: newBadgeIds });
    }

    return newBadgeIds;
  } catch (error) {
    logger.error('Error in checkAndAwardBadges:', error);
    Sentry.captureException(error);
    return [];
  }
}

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getUserBadges:', error);
    return [];
  }
}

/**
 * Get all available badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('category', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (error) {
      logger.error('Error fetching badges:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getAllBadges:', error);
    return [];
  }
}

/**
 * Get badge details by ID
 */
export async function getBadgeById(badgeId: string): Promise<Badge | null> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (error) {
      logger.error('Error fetching badge:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error in getBadgeById:', error);
    return null;
  }
}

/**
 * Check if user has a specific badge
 */
export async function hasUserEarnedBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      logger.error('Error checking badge:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    logger.error('Error in hasUserEarnedBadge:', error);
    return false;
  }
}

/**
 * Get badge progress for a user
 * Returns percentage completion for badges not yet earned
 */
export async function getBadgeProgress(userId: string): Promise<Map<string, number>> {
  try {
    const progressMap = new Map<string, number>();

    // Get user stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: dailyStats } = await supabase
      .from('daily_stats')
      .select('total_steps, total_distance_meters')
      .eq('user_id', userId);

    const { data: walks } = await supabase
      .from('walks')
      .select('steps, distance_meters')
      .eq('user_id', userId);

    if (!profile || !dailyStats || !walks) {
      return progressMap;
    }

    // Calculate totals
    const totalSteps = dailyStats.reduce((sum, day) => sum + day.total_steps, 0);
    const totalDistance = dailyStats.reduce((sum, day) => sum + (day.total_distance_meters || 0), 0);
    const maxDailySteps = Math.max(...dailyStats.map(day => day.total_steps), 0);
    const currentStreak = streak?.current_streak || 0;

    // Get all badges
    const allBadges = await getAllBadges();

    // Get earned badges
    const earnedBadges = await getUserBadges(userId);
    const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badge_id));

    // Calculate progress for each unearned badge
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) {
        progressMap.set(badge.id, 100);
        continue;
      }

      let progress = 0;

      switch (badge.requirement_type) {
        case 'streak_days':
          progress = Math.min((currentStreak / badge.requirement_value) * 100, 100);
          break;
        case 'total_steps':
          progress = Math.min((totalSteps / badge.requirement_value) * 100, 100);
          break;
        case 'total_distance_meters':
          progress = Math.min((totalDistance / badge.requirement_value) * 100, 100);
          break;
        case 'single_day_steps':
          progress = Math.min((maxDailySteps / badge.requirement_value) * 100, 100);
          break;
        default:
          progress = 0;
      }

      progressMap.set(badge.id, Math.floor(progress));
    }

    return progressMap;
  } catch (error) {
    logger.error('Error calculating badge progress:', error);
    return new Map();
  }
}

