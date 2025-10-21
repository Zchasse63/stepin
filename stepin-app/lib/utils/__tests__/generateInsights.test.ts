/**
 * Unit tests for generateInsights utility functions
 * Tests insight generation logic and prioritization
 */

// Mock Sentry before any imports that use it
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock Supabase client before any imports that use it
jest.mock('../../supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import {
  generateInsights,
  getInsightIconName,
} from '../generateInsights';
import { Walk, DailyStats, Streak } from '../../../types/database';

describe('generateInsights', () => {
  describe('generateInsights', () => {
    it('should return empty array for no data', async () => {
      const insights = await generateInsights([], [], null, 'week');
      expect(insights).toEqual([]);
    });

    it('should return top 3 insights sorted by priority', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-02', total_steps: 8000, goal_met: true } as DailyStats,
        { date: '2025-10-03', total_steps: 12000, goal_met: true } as DailyStats,
      ];
      const streak: Streak = {
        current_streak: 3,
        longest_streak: 5,
      } as Streak;

      const insights = await generateInsights([], dailyStats, streak, 'week');

      expect(insights.length).toBeLessThanOrEqual(3);
      // Verify sorted by priority (descending)
      for (let i = 0; i < insights.length - 1; i++) {
        expect(insights[i].priority).toBeGreaterThanOrEqual(insights[i + 1].priority);
      }
    });

    it('should generate positive insights for active days', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 5000, goal_met: false } as DailyStats,
        { date: '2025-10-02', total_steps: 7000, goal_met: true } as DailyStats,
      ];

      const insights = await generateInsights([], dailyStats, null, 'week');

      expect(insights.length).toBeGreaterThan(0);
      const daysActiveInsight = insights.find(i => i.id === 'days-walked');
      expect(daysActiveInsight).toBeDefined();
    });

    it('should generate streak insights', async () => {
      const streak: Streak = {
        current_streak: 7,
        longest_streak: 10,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const streakInsight = insights.find(i => i.id === 'current-streak');
      expect(streakInsight).toBeDefined();
      expect(streakInsight?.title).toContain('7 Day Streak');
    });

    it('should generate milestone insights for walk count', async () => {
      const walks: Walk[] = Array(50).fill({} as Walk);

      const insights = await generateInsights(walks, [], null, 'week');

      const milestoneInsight = insights.find(i => i.id === 'walk-milestone');
      expect(milestoneInsight).toBeDefined();
      expect(milestoneInsight?.title).toContain('50 Walks');
    });

    it('should generate nudge insights for close to milestone', async () => {
      const streak: Streak = {
        current_streak: 5,
        longest_streak: 10,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const nudgeInsight = insights.find(i => i.id === 'streak-milestone');
      expect(nudgeInsight).toBeDefined();
      expect(nudgeInsight?.type).toBe('nudge');
    });

    it('should handle different time periods', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 5000, goal_met: true } as DailyStats,
      ];

      const weekInsights = await generateInsights([], dailyStats, null, 'week');
      const monthInsights = await generateInsights([], dailyStats, null, 'month');
      const yearInsights = await generateInsights([], dailyStats, null, 'year');

      expect(weekInsights.length).toBeGreaterThan(0);
      expect(monthInsights.length).toBeGreaterThan(0);
      expect(yearInsights.length).toBeGreaterThan(0);
    });
  });

  describe('Positive Insights', () => {
    it('should generate days walked insight', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 5000, goal_met: false } as DailyStats,
        { date: '2025-10-02', total_steps: 7000, goal_met: true } as DailyStats,
        { date: '2025-10-03', total_steps: 3000, goal_met: false } as DailyStats,
      ];

      const insights = await generateInsights([], dailyStats, null, 'week');

      const daysInsight = insights.find(i => i.id === 'days-walked');
      expect(daysInsight).toBeDefined();
      expect(daysInsight?.title).toContain('3 Days Active');
    });

    it('should generate current streak insight', async () => {
      const streak: Streak = {
        current_streak: 14,
        longest_streak: 20,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const streakInsight = insights.find(i => i.id === 'current-streak');
      expect(streakInsight).toBeDefined();
      expect(streakInsight?.priority).toBe(90);
      expect(streakInsight?.icon).toBe('flame');
    });

    it('should generate longest streak insight for streaks > 3', async () => {
      const streak: Streak = {
        current_streak: 2,
        longest_streak: 10,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const longestInsight = insights.find(i => i.id === 'longest-streak');
      expect(longestInsight).toBeDefined();
      expect(longestInsight?.title).toContain('10 Day Record');
    });

    it('should not generate longest streak insight for streaks <= 3', async () => {
      const streak: Streak = {
        current_streak: 1,
        longest_streak: 3,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const longestInsight = insights.find(i => i.id === 'longest-streak');
      expect(longestInsight).toBeUndefined();
    });

    it('should generate total steps insight for > 10k steps', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 5000, goal_met: true } as DailyStats,
        { date: '2025-10-02', total_steps: 6000, goal_met: true } as DailyStats,
      ];

      const insights = await generateInsights([], dailyStats, null, 'week');

      const stepsInsight = insights.find(i => i.id === 'total-steps');
      expect(stepsInsight).toBeDefined();
      expect(stepsInsight?.title).toContain('11.0K Steps');
    });

    it('should generate consistency insight for 70%+ goal met rate', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-02', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-03', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-04', total_steps: 5000, goal_met: false } as DailyStats,
      ];

      const insights = await generateInsights([], dailyStats, null, 'week');

      const consistencyInsight = insights.find(i => i.id === 'consistency');
      expect(consistencyInsight).toBeDefined();
      expect(consistencyInsight?.title).toContain('75% Success Rate');
    });
  });

  describe('Nudge Insights', () => {
    it('should generate streak milestone nudge when close to milestone', async () => {
      const streak: Streak = {
        current_streak: 5,
        longest_streak: 10,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const nudgeInsight = insights.find(i => i.id === 'streak-milestone');
      expect(nudgeInsight).toBeDefined();
      expect(nudgeInsight?.title).toContain('2 Days to 7');
      expect(nudgeInsight?.type).toBe('nudge');
    });

    it('should not generate streak milestone nudge when > 3 days away', async () => {
      const streak: Streak = {
        current_streak: 3,
        longest_streak: 10,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const nudgeInsight = insights.find(i => i.id === 'streak-milestone');
      expect(nudgeInsight).toBeUndefined();
    });

    it('should generate beat record nudge when close to personal best', async () => {
      const streak: Streak = {
        current_streak: 8,
        longest_streak: 10,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const beatRecordInsight = insights.find(i => i.id === 'beat-record');
      expect(beatRecordInsight).toBeDefined();
      expect(beatRecordInsight?.title).toContain('2 Days to Your Record');
    });

    it('should not generate beat record nudge when > 5 days away', async () => {
      const streak: Streak = {
        current_streak: 4,
        longest_streak: 10,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const beatRecordInsight = insights.find(i => i.id === 'beat-record');
      expect(beatRecordInsight).toBeUndefined();
    });
  });

  describe('Milestone Insights', () => {
    it('should generate walk count milestone for exact milestones', async () => {
      const walks: Walk[] = Array(100).fill({} as Walk);

      const insights = await generateInsights(walks, [], null, 'week');

      const milestoneInsight = insights.find(i => i.id === 'walk-milestone');
      expect(milestoneInsight).toBeDefined();
      expect(milestoneInsight?.title).toContain('100 Walks');
      expect(milestoneInsight?.priority).toBe(100);
    });

    it('should generate streak milestone for exact milestones', async () => {
      const streak: Streak = {
        current_streak: 30,
        longest_streak: 30,
      } as Streak;

      const insights = await generateInsights([], [], streak, 'week');

      const milestoneInsight = insights.find(i => i.id === 'streak-milestone-achieved');
      expect(milestoneInsight).toBeDefined();
      expect(milestoneInsight?.title).toContain('30 Day Streak');
    });

    it('should generate perfect week milestone', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-02', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-03', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-04', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-05', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-06', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-07', total_steps: 10000, goal_met: true } as DailyStats,
      ];

      const insights = await generateInsights([], dailyStats, null, 'week');

      const perfectWeekInsight = insights.find(i => i.id === 'perfect-week');
      expect(perfectWeekInsight).toBeDefined();
      expect(perfectWeekInsight?.title).toContain('Perfect Week');
    });

    it('should not generate perfect week if any day missed', async () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-02', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-03', total_steps: 5000, goal_met: false } as DailyStats,
        { date: '2025-10-04', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-05', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-06', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-07', total_steps: 10000, goal_met: true } as DailyStats,
      ];

      const insights = await generateInsights([], dailyStats, null, 'week');

      const perfectWeekInsight = insights.find(i => i.id === 'perfect-week');
      expect(perfectWeekInsight).toBeUndefined();
    });
  });

  describe('getInsightIconName', () => {
    it('should return correct icon names', () => {
      expect(getInsightIconName('calendar')).toBe('calendar');
      expect(getInsightIconName('flame')).toBe('flame');
      expect(getInsightIconName('trophy')).toBe('trophy');
      expect(getInsightIconName('footsteps')).toBe('footsteps');
      expect(getInsightIconName('trending-up')).toBe('trending-up');
      expect(getInsightIconName('star')).toBe('star');
      expect(getInsightIconName('ribbon')).toBe('ribbon');
      expect(getInsightIconName('checkmark-circle')).toBe('checkmark-circle');
    });

    it('should return default icon for unknown icon', () => {
      expect(getInsightIconName('unknown-icon')).toBe('information-circle');
    });
  });
});

