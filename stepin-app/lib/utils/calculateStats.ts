/**
 * Statistics calculation utilities
 * Aggregates and calculates statistics from walks and daily_stats data
 */

import { Walk, DailyStats } from '../../types/database';
import { SummaryStats } from '../../types/history';

/**
 * Calculate summary statistics from daily stats
 */
export function calculateSummaryStats(
  dailyStats: DailyStats[],
  walks: Walk[]
): SummaryStats {
  // Filter out days with no activity
  const daysWithData = dailyStats.filter(stat => stat.total_steps > 0);
  
  // Calculate total steps
  const totalSteps = dailyStats.reduce((sum, stat) => sum + stat.total_steps, 0);
  
  // Total walks
  const totalWalks = walks.length;
  
  // Average steps per day (only counting days with activity)
  const averageSteps = daysWithData.length > 0 
    ? Math.round(totalSteps / daysWithData.length) 
    : 0;
  
  // Days goal was met
  const daysGoalMet = dailyStats.filter(stat => stat.goal_met).length;
  
  // Goal met percentage (of days with activity)
  const goalMetPercentage = daysWithData.length > 0
    ? Math.round((daysGoalMet / daysWithData.length) * 100)
    : 0;
  
  return {
    totalSteps,
    totalWalks,
    averageSteps,
    daysGoalMet,
    goalMetPercentage,
  };
}

/**
 * Calculate total duration from walks (in minutes)
 */
export function calculateTotalDuration(walks: Walk[]): number {
  return walks.reduce((sum, walk) => sum + (walk.duration_minutes || 0), 0);
}

/**
 * Calculate total distance from walks (in meters)
 */
export function calculateTotalDistance(walks: Walk[]): number {
  return walks.reduce((sum, walk) => sum + (walk.distance_meters || 0), 0);
}

/**
 * Calculate average steps per walk
 */
export function calculateAverageStepsPerWalk(walks: Walk[]): number {
  if (walks.length === 0) return 0;
  const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);
  return Math.round(totalSteps / walks.length);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format distance in meters to human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km}km`;
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date | string, format?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  // If format is specified, return formatted date
  if (format) {
    if (format === 'MMM') {
      return d.toLocaleDateString('en-US', { month: 'short' });
    }
    if (format === 'MMM d, yyyy') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    // Default format
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today
  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if it's yesterday
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Otherwise return formatted date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Calculate percentage of goal achieved
 */
export function calculateGoalPercentage(steps: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.round((steps / goal) * 100);
}

/**
 * Get color for progress percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#FFD700'; // Gold
  if (percentage >= 75) return '#2E7D32'; // Dark green
  if (percentage >= 50) return '#4CAF50'; // Medium green
  if (percentage >= 25) return '#A8E6CF'; // Light green
  return '#9E9E9E'; // Gray
}

/**
 * Group walks by date
 */
export function groupWalksByDate(walks: Walk[]): Map<string, Walk[]> {
  const grouped = new Map<string, Walk[]>();
  
  walks.forEach(walk => {
    const existing = grouped.get(walk.date) || [];
    grouped.set(walk.date, [...existing, walk]);
  });
  
  return grouped;
}

/**
 * Calculate streak from daily stats
 */
export function calculateCurrentStreak(dailyStats: DailyStats[]): number {
  if (dailyStats.length === 0) return 0;
  
  // Sort by date descending (most recent first)
  const sorted = [...dailyStats].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  for (const stat of sorted) {
    if (stat.goal_met) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate longest streak from daily stats
 */
export function calculateLongestStreak(dailyStats: DailyStats[]): number {
  if (dailyStats.length === 0) return 0;
  
  // Sort by date ascending
  const sorted = [...dailyStats].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let currentStreak = 0;
  let longestStreak = 0;
  
  for (const stat of sorted) {
    if (stat.goal_met) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return longestStreak;
}

