/**
 * Weekly Summary Calculation
 * Calculates and stores weekly statistics for analytics
 */

import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';

export interface WeeklySummary {
  userId: string;
  weekStartDate: string; // ISO date string (Monday)
  weekEndDate: string; // ISO date string (Sunday)
  totalSteps: number;
  totalDistance: number; // meters
  totalWalks: number;
  averageDailySteps: number;
  daysActive: number; // days with at least one walk
  daysGoalMet: number;
  longestWalk: number; // steps
  bestDay: {
    date: string;
    steps: number;
  } | null;
  comparisonToPreviousWeek: {
    stepsDelta: number;
    stepsPercentChange: number;
    distanceDelta: number;
    walksDelta: number;
  } | null;
}

/**
 * Get the Monday of the week for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the Sunday of the week for a given date
 */
function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

/**
 * Calculate weekly summary for a user
 */
export async function calculateWeeklySummary(
  userId: string,
  weekStartDate?: Date
): Promise<WeeklySummary | null> {
  try {
    const startDate = weekStartDate || getWeekStart(new Date());
    const endDate = getWeekEnd(startDate);

    const weekStart = startDate.toISOString().split('T')[0];
    const weekEnd = endDate.toISOString().split('T')[0];

    logger.info('Calculating weekly summary', { userId, weekStart, weekEnd });

    // Get daily stats for the week
    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date', { ascending: true });

    if (statsError) {
      logger.error('Error fetching daily stats:', statsError);
      return null;
    }

    if (!dailyStats || dailyStats.length === 0) {
      logger.info('No data for week', { userId, weekStart, weekEnd });
      return null;
    }

    // Get walks for the week
    const { data: walks, error: walksError } = await supabase
      .from('walks')
      .select('steps, distance_meters, date')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', weekEnd);

    if (walksError) {
      logger.error('Error fetching walks:', walksError);
    }

    // Calculate metrics
    const totalSteps = dailyStats.reduce((sum, day) => sum + day.total_steps, 0);
    const totalDistance = dailyStats.reduce((sum, day) => sum + (day.total_distance_meters || 0), 0);
    const daysActive = dailyStats.filter(day => day.total_steps > 0).length;
    const daysGoalMet = dailyStats.filter(day => day.goal_met).length;
    const averageDailySteps = daysActive > 0 ? Math.round(totalSteps / 7) : 0;

    // Find best day
    let bestDay: { date: string; steps: number } | null = null;
    if (dailyStats.length > 0) {
      const best = dailyStats.reduce((max, day) =>
        day.total_steps > max.total_steps ? day : max
      );
      bestDay = {
        date: best.date,
        steps: best.total_steps,
      };
    }

    // Find longest walk
    const longestWalk = walks && walks.length > 0
      ? Math.max(...walks.map(w => w.steps))
      : 0;

    const totalWalks = walks?.length || 0;

    // Calculate comparison to previous week
    const prevWeekStart = new Date(startDate);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(endDate);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

    const { data: prevWeekStats } = await supabase
      .from('daily_stats')
      .select('total_steps, total_distance_meters')
      .eq('user_id', userId)
      .gte('date', prevWeekStart.toISOString().split('T')[0])
      .lte('date', prevWeekEnd.toISOString().split('T')[0]);

    const { data: prevWeekWalks } = await supabase
      .from('walks')
      .select('id')
      .eq('user_id', userId)
      .gte('date', prevWeekStart.toISOString().split('T')[0])
      .lte('date', prevWeekEnd.toISOString().split('T')[0]);

    let comparisonToPreviousWeek = null;
    if (prevWeekStats && prevWeekStats.length > 0) {
      const prevTotalSteps = prevWeekStats.reduce((sum, day) => sum + day.total_steps, 0);
      const prevTotalDistance = prevWeekStats.reduce(
        (sum, day) => sum + (day.total_distance_meters || 0),
        0
      );
      const prevTotalWalks = prevWeekWalks?.length || 0;

      const stepsDelta = totalSteps - prevTotalSteps;
      const stepsPercentChange = prevTotalSteps > 0
        ? Math.round((stepsDelta / prevTotalSteps) * 100)
        : 0;
      const distanceDelta = totalDistance - prevTotalDistance;
      const walksDelta = totalWalks - prevTotalWalks;

      comparisonToPreviousWeek = {
        stepsDelta,
        stepsPercentChange,
        distanceDelta,
        walksDelta,
      };
    }

    const summary: WeeklySummary = {
      userId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalSteps,
      totalDistance,
      totalWalks,
      averageDailySteps,
      daysActive,
      daysGoalMet,
      longestWalk,
      bestDay,
      comparisonToPreviousWeek,
    };

    logger.info('Weekly summary calculated', {
      userId,
      weekStart,
      totalSteps,
      averageDailySteps,
    });

    return summary;
  } catch (error) {
    logger.error('Error calculating weekly summary:', error);
    Sentry.captureException(error);
    return null;
  }
}

/**
 * Get weekly summary for current week
 */
export async function getCurrentWeeklySummary(userId: string): Promise<WeeklySummary | null> {
  return calculateWeeklySummary(userId);
}

/**
 * Get weekly summary for a specific week
 */
export async function getWeeklySummaryForDate(
  userId: string,
  date: Date
): Promise<WeeklySummary | null> {
  const weekStart = getWeekStart(date);
  return calculateWeeklySummary(userId, weekStart);
}

/**
 * Get last N weeks of summaries
 */
export async function getRecentWeeklySummaries(
  userId: string,
  weeks: number = 4
): Promise<WeeklySummary[]> {
  try {
    const summaries: WeeklySummary[] = [];
    const today = new Date();

    for (let i = 0; i < weeks; i++) {
      const weekDate = new Date(today);
      weekDate.setDate(today.getDate() - (i * 7));
      
      const summary = await calculateWeeklySummary(userId, getWeekStart(weekDate));
      if (summary) {
        summaries.push(summary);
      }
    }

    return summaries;
  } catch (error) {
    logger.error('Error getting recent weekly summaries:', error);
    return [];
  }
}

/**
 * Generate weekly insights from summary
 */
export function generateWeeklyInsights(summary: WeeklySummary): string[] {
  const insights: string[] = [];

  // Activity level insight
  if (summary.daysActive === 7) {
    insights.push('🌟 Perfect week! You were active every single day.');
  } else if (summary.daysActive >= 5) {
    insights.push(`💪 Great consistency! Active ${summary.daysActive} out of 7 days.`);
  } else if (summary.daysActive >= 3) {
    insights.push(`👍 Good effort! Active ${summary.daysActive} days this week.`);
  }

  // Goal achievement insight
  if (summary.daysGoalMet === 7) {
    insights.push('🎯 Incredible! You hit your goal every day this week!');
  } else if (summary.daysGoalMet >= 5) {
    insights.push(`🎯 Excellent! Goal met on ${summary.daysGoalMet} days.`);
  }

  // Comparison to previous week
  if (summary.comparisonToPreviousWeek) {
    const { stepsPercentChange } = summary.comparisonToPreviousWeek;
    if (stepsPercentChange > 20) {
      insights.push(`📈 Amazing progress! ${stepsPercentChange}% more steps than last week!`);
    } else if (stepsPercentChange > 0) {
      insights.push(`📈 Nice improvement! ${stepsPercentChange}% increase from last week.`);
    } else if (stepsPercentChange < -20) {
      insights.push(`📉 Activity dropped ${Math.abs(stepsPercentChange)}% from last week. Let's bounce back!`);
    }
  }

  // Best day insight
  if (summary.bestDay && summary.bestDay.steps > 10000) {
    const dayName = new Date(summary.bestDay.date).toLocaleDateString('en-US', { weekday: 'long' });
    insights.push(`⭐ ${dayName} was your best day with ${summary.bestDay.steps.toLocaleString()} steps!`);
  }

  // Average steps insight
  if (summary.averageDailySteps >= 10000) {
    insights.push(`🏆 Outstanding! Averaging ${summary.averageDailySteps.toLocaleString()} steps per day.`);
  } else if (summary.averageDailySteps >= 7000) {
    insights.push(`✨ Solid week! Averaging ${summary.averageDailySteps.toLocaleString()} steps per day.`);
  }

  return insights;
}

