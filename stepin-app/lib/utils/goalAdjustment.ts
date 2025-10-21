/**
 * Adaptive Goal Adjustment
 * Analyzes user performance and suggests goal adjustments
 */

import { supabase } from '../supabase/client';
import { logger } from './logger';
import * as Sentry from '@sentry/react-native';

const ANALYSIS_PERIOD_DAYS = 14; // Analyze last 2 weeks
const MIN_DAYS_FOR_SUGGESTION = 7; // Need at least 1 week of data
const OVERACHIEVING_THRESHOLD = 1.2; // 20% above goal consistently
const UNDERACHIEVING_THRESHOLD = 0.8; // Below 80% of goal consistently
const CONSISTENCY_THRESHOLD = 0.7; // 70% of days meeting criteria

export interface GoalSuggestion {
  currentGoal: number;
  suggestedGoal: number;
  reason: 'overachieving' | 'underachieving' | 'optimal';
  confidence: 'high' | 'medium' | 'low';
  analysis: {
    daysAnalyzed: number;
    averageSteps: number;
    goalMetPercentage: number;
    averageOverage: number; // Average steps over/under goal
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  message: string;
}

/**
 * Analyze user's performance and suggest goal adjustment
 */
export async function analyzeAndSuggestGoal(userId: string): Promise<GoalSuggestion | null> {
  try {
    // Get user's current goal
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('daily_step_goal')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error('Error fetching profile for goal analysis:', profileError);
      return null;
    }

    const currentGoal = profile.daily_step_goal;

    // Get recent daily stats
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - ANALYSIS_PERIOD_DAYS);

    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('date, total_steps, goal_met')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (statsError || !dailyStats || dailyStats.length < MIN_DAYS_FOR_SUGGESTION) {
      logger.info('Insufficient data for goal suggestion', {
        userId,
        daysAvailable: dailyStats?.length || 0,
      });
      return null;
    }

    // Calculate metrics
    const daysAnalyzed = dailyStats.length;
    const totalSteps = dailyStats.reduce((sum, day) => sum + day.total_steps, 0);
    const averageSteps = Math.round(totalSteps / daysAnalyzed);
    const daysMetGoal = dailyStats.filter(day => day.goal_met).length;
    const goalMetPercentage = daysMetGoal / daysAnalyzed;

    // Calculate average overage/underage
    const overages = dailyStats.map(day => day.total_steps - currentGoal);
    const averageOverage = Math.round(overages.reduce((sum, o) => sum + o, 0) / daysAnalyzed);

    // Determine trend (simple linear regression)
    const trend = calculateTrend(dailyStats.map(d => d.total_steps));

    // Count days significantly over/under goal
    const daysOverachieving = dailyStats.filter(
      day => day.total_steps >= currentGoal * OVERACHIEVING_THRESHOLD
    ).length;
    const daysUnderachieving = dailyStats.filter(
      day => day.total_steps < currentGoal * UNDERACHIEVING_THRESHOLD
    ).length;

    const overachievingConsistency = daysOverachieving / daysAnalyzed;
    const underachievingConsistency = daysUnderachieving / daysAnalyzed;

    // Determine suggestion
    let reason: 'overachieving' | 'underachieving' | 'optimal' = 'optimal';
    let suggestedGoal = currentGoal;
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    let message = '';

    if (overachievingConsistency >= CONSISTENCY_THRESHOLD) {
      // User is consistently exceeding goal
      reason = 'overachieving';
      // Suggest goal between current average and max
      const increase = Math.round(averageOverage * 0.7); // 70% of average overage
      suggestedGoal = Math.round((currentGoal + increase) / 500) * 500; // Round to nearest 500
      
      confidence = overachievingConsistency >= 0.85 ? 'high' : 'medium';
      message = `You're crushing it! You've exceeded your goal on ${Math.round(overachievingConsistency * 100)}% of days. Consider increasing your goal to keep challenging yourself.`;
    } else if (underachievingConsistency >= CONSISTENCY_THRESHOLD && goalMetPercentage < 0.5) {
      // User is consistently under goal
      reason = 'underachieving';
      // Suggest goal closer to actual average
      const decrease = Math.abs(Math.round(averageOverage * 0.5)); // 50% of average underage
      suggestedGoal = Math.max(
        2000, // Minimum goal
        Math.round((currentGoal - decrease) / 500) * 500 // Round to nearest 500
      );
      
      confidence = underachievingConsistency >= 0.85 ? 'high' : 'medium';
      message = `Your current goal might be too ambitious. You've met it on only ${Math.round(goalMetPercentage * 100)}% of days. A more achievable goal can help build consistency.`;
    } else {
      // Goal is appropriate
      reason = 'optimal';
      suggestedGoal = currentGoal;
      confidence = 'high';
      message = `Your current goal looks great! You're meeting it ${Math.round(goalMetPercentage * 100)}% of the time, which shows good balance between challenge and achievability.`;
    }

    // Don't suggest if change is too small
    if (Math.abs(suggestedGoal - currentGoal) < 500) {
      suggestedGoal = currentGoal;
      reason = 'optimal';
    }

    const suggestion: GoalSuggestion = {
      currentGoal,
      suggestedGoal,
      reason,
      confidence,
      analysis: {
        daysAnalyzed,
        averageSteps,
        goalMetPercentage,
        averageOverage,
        trend,
      },
      message,
    };

    logger.info('Goal suggestion generated', {
      userId,
      currentGoal,
      suggestedGoal,
      reason,
      confidence,
    });

    return suggestion;
  } catch (error) {
    logger.error('Error in analyzeAndSuggestGoal:', error);
    Sentry.captureException(error);
    return null;
  }
}

/**
 * Calculate trend from array of values
 */
function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 3) return 'stable';

  // Simple linear regression
  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Threshold for considering trend significant (steps per day)
  const threshold = 100;
  
  if (slope > threshold) return 'increasing';
  if (slope < -threshold) return 'decreasing';
  return 'stable';
}

/**
 * Check if user should be shown goal adjustment suggestion
 * Returns true if enough time has passed since last suggestion
 */
export async function shouldShowGoalSuggestion(userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_goal_suggestion_date')
      .eq('id', userId)
      .single();

    if (!profile?.last_goal_suggestion_date) {
      return true; // Never shown before
    }

    const lastSuggestion = new Date(profile.last_goal_suggestion_date);
    const daysSince = Math.floor(
      (Date.now() - lastSuggestion.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Show suggestion every 14 days
    return daysSince >= 14;
  } catch (error) {
    logger.error('Error checking goal suggestion eligibility:', error);
    return false;
  }
}

/**
 * Mark that goal suggestion was shown to user
 */
export async function markGoalSuggestionShown(userId: string): Promise<void> {
  try {
    await supabase
      .from('profiles')
      .update({
        last_goal_suggestion_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (error) {
    logger.error('Error marking goal suggestion shown:', error);
  }
}

