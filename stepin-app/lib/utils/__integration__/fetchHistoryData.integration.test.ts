/**
 * Integration tests for fetchHistoryData utility
 * Tests data fetching with real Supabase database
 */

import { supabaseTest, supabaseAdmin } from './helpers/testSetup';
import {
  createTestUser,
  createTestProfile,
  createTestWalk,
  createTestDailyStats,
  createTestStreak,
  deleteTestUser,
} from './helpers/testData';
import {
  fetchWalks,
  fetchDailyStats,
  fetchStreak,
  fetchWalksPaginated,
  fetchHistoryData,
  fetchWalksForDate,
  fetchDailyStatsForDate,
} from '../fetchHistoryData';
import { getDateString, daysAgo } from './helpers/testSetup';
import { parseISO } from 'date-fns';

describe('fetchHistoryData integration tests', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create test user and profile
    testUserId = await createTestUser();
    await createTestProfile(testUserId, {
      daily_step_goal: 7000,
    });
  });

  afterEach(async () => {
    // Clean up test user and all data
    await deleteTestUser(testUserId);
  });

  describe('fetchWalks', () => {
    it('should fetch walks for a date range', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));
      const twoDaysAgo = getDateString(daysAgo(2));

      await createTestWalk(testUserId, { date: twoDaysAgo, steps: 5000 });
      await createTestWalk(testUserId, { date: yesterday, steps: 6000 });
      await createTestWalk(testUserId, { date: today, steps: 7000 });

      // Act
      const walks = await fetchWalks(
        testUserId,
        { startDate: parseISO(twoDaysAgo), endDate: parseISO(today) },
        supabaseAdmin!
      );

      // Assert
      expect(walks).toHaveLength(3);
      // Should be ordered by date descending
      expect(walks[0].date).toBe(today);
      expect(walks[1].date).toBe(yesterday);
      expect(walks[2].date).toBe(twoDaysAgo);
    });

    it('should return empty array when no walks in range', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));

      // Act
      const walks = await fetchWalks(
        testUserId,
        { startDate: parseISO(yesterday), endDate: parseISO(today) },
        supabaseAdmin!
      );

      // Assert
      expect(walks).toEqual([]);
    });
  });

  describe('fetchDailyStats', () => {
    it('should fetch daily stats for a date range', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));
      const twoDaysAgo = getDateString(daysAgo(2));

      await createTestDailyStats(testUserId, { date: twoDaysAgo, total_steps: 5000 });
      await createTestDailyStats(testUserId, { date: yesterday, total_steps: 6000 });
      await createTestDailyStats(testUserId, { date: today, total_steps: 7000 });

      // Act
      const stats = await fetchDailyStats(
        testUserId,
        { startDate: parseISO(twoDaysAgo), endDate: parseISO(today) },
        supabaseAdmin!
      );

      // Assert
      expect(stats).toHaveLength(3);
      // Should be ordered by date ascending
      expect(stats[0].date).toBe(twoDaysAgo);
      expect(stats[1].date).toBe(yesterday);
      expect(stats[2].date).toBe(today);
    });

    it('should return empty array when no stats in range', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));

      // Act
      const stats = await fetchDailyStats(
        testUserId,
        { startDate: parseISO(yesterday), endDate: parseISO(today) },
        supabaseAdmin!
      );

      // Assert
      expect(stats).toEqual([]);
    });
  });

  describe('fetchStreak', () => {
    it('should fetch user streak', async () => {
      // Arrange
      await createTestStreak(testUserId, {
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: getDateString(daysAgo(1)),
      });

      // Act
      const streak = await fetchStreak(testUserId, supabaseAdmin!);

      // Assert
      expect(streak).toBeDefined();
      expect(streak?.current_streak).toBe(5);
      expect(streak?.longest_streak).toBe(10);
    });

    it('should return null when no streak exists', async () => {
      // Arrange: Delete auto-created streak
      await supabaseAdmin!.from('streaks').delete().eq('user_id', testUserId);

      // Act
      const streak = await fetchStreak(testUserId, supabaseAdmin!);

      // Assert
      expect(streak).toBeNull();
    });
  });

  describe('fetchWalksPaginated', () => {
    it('should fetch first page of walks', async () => {
      // Arrange: Create 25 walks
      const today = new Date();
      for (let i = 0; i < 25; i++) {
        const date = getDateString(daysAgo(i));
        await createTestWalk(testUserId, { date, steps: 1000 + i });
      }

      // Act: Fetch first page (20 items)
      const result = await fetchWalksPaginated(
        testUserId,
        { startDate: daysAgo(30), endDate: today },
        0,
        20,
        supabaseAdmin!
      );

      // Assert
      expect(result.walks).toHaveLength(20);
      expect(result.hasMore).toBe(true);
    });

    it('should fetch second page of walks', async () => {
      // Arrange: Create 25 walks
      const today = new Date();
      for (let i = 0; i < 25; i++) {
        const date = getDateString(daysAgo(i));
        await createTestWalk(testUserId, { date, steps: 1000 + i });
      }

      // Act: Fetch second page (5 remaining items)
      const result = await fetchWalksPaginated(
        testUserId,
        { startDate: daysAgo(30), endDate: today },
        1,
        20,
        supabaseAdmin!
      );

      // Assert
      expect(result.walks).toHaveLength(5);
      expect(result.hasMore).toBe(false);
    });

    it('should return empty array when no walks', async () => {
      // Act
      const result = await fetchWalksPaginated(
        testUserId,
        { startDate: daysAgo(7), endDate: new Date() },
        0,
        20,
        supabaseAdmin!
      );

      // Assert
      expect(result.walks).toEqual([]);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('fetchHistoryData', () => {
    it('should fetch complete history data with summary stats', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));
      const twoDaysAgo = getDateString(daysAgo(2));

      await createTestWalk(testUserId, { date: twoDaysAgo, steps: 5000 });
      await createTestWalk(testUserId, { date: yesterday, steps: 8000 });
      await createTestWalk(testUserId, { date: today, steps: 7000 });

      await createTestDailyStats(testUserId, { date: twoDaysAgo, total_steps: 5000, goal_met: false });
      await createTestDailyStats(testUserId, { date: yesterday, total_steps: 8000, goal_met: true });
      await createTestDailyStats(testUserId, { date: today, total_steps: 7000, goal_met: true });

      // Act
      const history = await fetchHistoryData(
        testUserId,
        { startDate: parseISO(twoDaysAgo), endDate: parseISO(today) },
        7000,
        supabaseAdmin!
      );

      // Assert
      expect(history.walks).toHaveLength(3);
      expect(history.dailyStats).toHaveLength(3);
      expect(history.totalSteps).toBe(20000);
      expect(history.totalWalks).toBe(3);
      expect(history.averageSteps).toBe(Math.round(20000 / 3));
      expect(history.daysGoalMet).toBe(2);
      expect(history.goalMetPercentage).toBe(Math.round((2 / 3) * 100));
    });

    it('should handle empty data correctly', async () => {
      // Act
      const history = await fetchHistoryData(
        testUserId,
        { startDate: daysAgo(7), endDate: new Date() },
        7000,
        supabaseAdmin!
      );

      // Assert
      expect(history.walks).toEqual([]);
      expect(history.dailyStats).toEqual([]);
      expect(history.totalSteps).toBe(0);
      expect(history.totalWalks).toBe(0);
      expect(history.averageSteps).toBe(0);
      expect(history.daysGoalMet).toBe(0);
      expect(history.goalMetPercentage).toBe(0);
    });
  });

  describe('fetchWalksForDate', () => {
    it('should fetch walks for a specific date', async () => {
      // Arrange
      const today = getDateString(new Date());
      await createTestWalk(testUserId, { date: today, steps: 5000 });
      await createTestWalk(testUserId, { date: today, steps: 3000 });

      // Act
      const walks = await fetchWalksForDate(testUserId, today, supabaseAdmin!);

      // Assert
      expect(walks).toHaveLength(2);
      expect(walks[0].date).toBe(today);
      expect(walks[1].date).toBe(today);
    });

    it('should return empty array when no walks on date', async () => {
      // Arrange
      const today = getDateString(new Date());

      // Act
      const walks = await fetchWalksForDate(testUserId, today, supabaseAdmin!);

      // Assert
      expect(walks).toEqual([]);
    });
  });

  describe('fetchDailyStatsForDate', () => {
    it('should fetch daily stats for a specific date', async () => {
      // Arrange
      const today = getDateString(new Date());
      await createTestDailyStats(testUserId, { date: today, total_steps: 7000, goal_met: true });

      // Act
      const stats = await fetchDailyStatsForDate(testUserId, today, supabaseAdmin!);

      // Assert
      expect(stats).toBeDefined();
      expect(stats?.date).toBe(today);
      expect(stats?.total_steps).toBe(7000);
      expect(stats?.goal_met).toBe(true);
    });

    it('should return null when no stats on date', async () => {
      // Arrange
      const today = getDateString(new Date());

      // Act
      const stats = await fetchDailyStatsForDate(testUserId, today, supabaseAdmin!);

      // Assert
      expect(stats).toBeNull();
    });
  });
});

