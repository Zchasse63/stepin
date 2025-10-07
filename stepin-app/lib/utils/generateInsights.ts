/**
 * Insights generation utilities
 * Generates encouraging insights based on user data
 */

import { Walk, DailyStats, Streak } from '../../types/database';
import { Insight } from '../../types/history';
import { calculateCurrentStreak, calculateLongestStreak } from './calculateStats';

/**
 * Generate all insights from user data
 */
export function generateInsights(
  walks: Walk[],
  dailyStats: DailyStats[],
  streak: Streak | null,
  period: 'week' | 'month' | 'year'
): Insight[] {
  const insights: Insight[] = [];

  // Add positive reinforcement insights
  insights.push(...generatePositiveInsights(walks, dailyStats, streak, period));

  // Add gentle nudge insights
  insights.push(...generateNudgeInsights(walks, dailyStats, streak));

  // Add milestone insights
  insights.push(...generateMilestoneInsights(walks, dailyStats, streak));

  // Sort by priority (highest first) and return top 3
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

/**
 * Generate positive reinforcement insights
 */
function generatePositiveInsights(
  walks: Walk[],
  dailyStats: DailyStats[],
  streak: Streak | null,
  period: 'week' | 'month' | 'year'
): Insight[] {
  const insights: Insight[] = [];

  // Days walked this period
  const daysWithActivity = dailyStats.filter(s => s.total_steps > 0).length;
  if (daysWithActivity > 0) {
    const periodLabel = period === 'week' ? 'week' : period === 'month' ? 'month' : 'year';
    insights.push({
      id: 'days-walked',
      type: 'positive',
      icon: 'calendar',
      title: `${daysWithActivity} ${daysWithActivity === 1 ? 'Day' : 'Days'} Active`,
      description: `You've walked ${daysWithActivity} ${daysWithActivity === 1 ? 'day' : 'days'} this ${periodLabel}. Keep up the great work!`,
      priority: 70,
    });
  }

  // Current streak
  if (streak && streak.current_streak > 0) {
    insights.push({
      id: 'current-streak',
      type: 'positive',
      icon: 'flame',
      title: `${streak.current_streak} Day Streak!`,
      description: `You're on fire! You've met your goal ${streak.current_streak} ${streak.current_streak === 1 ? 'day' : 'days'} in a row.`,
      priority: 90,
    });
  }

  // Longest streak
  if (streak && streak.longest_streak > 3) {
    insights.push({
      id: 'longest-streak',
      type: 'positive',
      icon: 'trophy',
      title: `${streak.longest_streak} Day Record`,
      description: `Your longest streak is ${streak.longest_streak} days. That's amazing dedication!`,
      priority: 60,
    });
  }

  // Total steps this period
  const totalSteps = dailyStats.reduce((sum, s) => sum + s.total_steps, 0);
  if (totalSteps > 10000) {
    const stepsK = (totalSteps / 1000).toFixed(1);
    insights.push({
      id: 'total-steps',
      type: 'positive',
      icon: 'footsteps',
      title: `${stepsK}K Steps!`,
      description: `You've taken ${totalSteps.toLocaleString()} steps this ${period}. Every step counts!`,
      priority: 65,
    });
  }

  // Activity increase (compare to previous period if available)
  // For now, just show if they're consistently active
  const goalMetDays = dailyStats.filter(s => s.goal_met).length;
  if (goalMetDays >= daysWithActivity * 0.7 && daysWithActivity >= 3) {
    const percentage = Math.round((goalMetDays / daysWithActivity) * 100);
    insights.push({
      id: 'consistency',
      type: 'positive',
      icon: 'trending-up',
      title: `${percentage}% Success Rate`,
      description: `You're meeting your goal ${percentage}% of the time. Consistency is key!`,
      priority: 75,
    });
  }

  return insights;
}

/**
 * Generate gentle nudge insights
 */
function generateNudgeInsights(
  walks: Walk[],
  dailyStats: DailyStats[],
  streak: Streak | null
): Insight[] {
  const insights: Insight[] = [];

  // Close to streak milestone
  if (streak && streak.current_streak > 0) {
    const nextMilestone = [7, 14, 21, 30, 60, 90, 100].find(m => m > streak.current_streak);
    if (nextMilestone) {
      const daysToGo = nextMilestone - streak.current_streak;
      if (daysToGo <= 3) {
        insights.push({
          id: 'streak-milestone',
          type: 'nudge',
          icon: 'star',
          title: `${daysToGo} ${daysToGo === 1 ? 'Day' : 'Days'} to ${nextMilestone}!`,
          description: `You're so close to a ${nextMilestone}-day streak. Keep going!`,
          priority: 85,
        });
      }
    }
  }

  // Close to beating record
  if (streak && streak.current_streak > 0 && streak.longest_streak > streak.current_streak) {
    const daysToRecord = streak.longest_streak - streak.current_streak;
    if (daysToRecord <= 5) {
      insights.push({
        id: 'beat-record',
        type: 'nudge',
        icon: 'trophy',
        title: `${daysToRecord} ${daysToRecord === 1 ? 'Day' : 'Days'} to Your Record`,
        description: `Just ${daysToRecord} more ${daysToRecord === 1 ? 'day' : 'days'} to beat your personal best!`,
        priority: 80,
      });
    }
  }

  return insights;
}

/**
 * Generate milestone celebration insights
 */
function generateMilestoneInsights(
  walks: Walk[],
  dailyStats: DailyStats[],
  streak: Streak | null
): Insight[] {
  const insights: Insight[] = [];

  // Walk count milestones
  const walkCount = walks.length;
  const walkMilestones = [10, 25, 50, 100, 250, 500, 1000];
  if (walkMilestones.includes(walkCount)) {
    insights.push({
      id: 'walk-milestone',
      type: 'milestone',
      icon: 'ribbon',
      title: `🎉 ${walkCount} Walks Logged!`,
      description: `Congratulations! You've logged ${walkCount} walks. That's a huge achievement!`,
      priority: 100,
    });
  }

  // Streak milestones
  if (streak) {
    const streakMilestones = [7, 14, 21, 30, 60, 90, 100, 365];
    if (streakMilestones.includes(streak.current_streak)) {
      insights.push({
        id: 'streak-milestone-achieved',
        type: 'milestone',
        icon: 'flame',
        title: `🏆 ${streak.current_streak} Day Streak!`,
        description: `Amazing! You've reached a ${streak.current_streak}-day streak. You're unstoppable!`,
        priority: 100,
      });
    }
  }

  // Total steps milestones
  const totalSteps = dailyStats.reduce((sum, s) => sum + s.total_steps, 0);
  const stepMilestones = [100000, 250000, 500000, 1000000];
  const achievedMilestone = stepMilestones.find(m => 
    totalSteps >= m && totalSteps < m + 10000 // Within 10k of milestone
  );
  if (achievedMilestone) {
    const milestonesK = achievedMilestone / 1000;
    insights.push({
      id: 'steps-milestone',
      type: 'milestone',
      icon: 'footsteps',
      title: `⭐ ${milestonesK}K Steps!`,
      description: `Incredible! You've walked ${achievedMilestone.toLocaleString()} steps. What a journey!`,
      priority: 100,
    });
  }

  // Perfect week (all 7 days goal met)
  const recentStats = dailyStats.slice(0, 7);
  if (recentStats.length === 7 && recentStats.every(s => s.goal_met)) {
    insights.push({
      id: 'perfect-week',
      type: 'milestone',
      icon: 'checkmark-circle',
      title: '🎯 Perfect Week!',
      description: 'You met your goal every single day this week. Outstanding!',
      priority: 95,
    });
  }

  return insights;
}

/**
 * Get insight icon name for Ionicons
 */
export function getInsightIconName(icon: string): any {
  const iconMap: Record<string, any> = {
    'calendar': 'calendar',
    'flame': 'flame',
    'trophy': 'trophy',
    'footsteps': 'footsteps',
    'trending-up': 'trending-up',
    'star': 'star',
    'ribbon': 'ribbon',
    'checkmark-circle': 'checkmark-circle',
  };
  return iconMap[icon] || 'information-circle';
}

