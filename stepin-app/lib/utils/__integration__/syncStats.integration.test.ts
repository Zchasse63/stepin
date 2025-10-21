/**
 * Integration tests for syncDailyStats and updateStreak utilities
 * Tests full sync + streak update flow with real Supabase database
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
import { syncDailyStats, getDailyStats, getDailyStatsRange } from '../syncDailyStats';
import { updateStreak, getStreak } from '../updateStreak';
import { getDateString, daysAgo } from './helpers/testSetup';

describe('syncDailyStats + updateStreak integration tests', () => {
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

  describe('syncDailyStats', () => {
    it('should create new daily stats when none exist', async () => {
      // Arrange
      const today = getDateString(new Date());

      // Act
      const result = await syncDailyStats({
        userId: testUserId,
        date: today,
        steps: 5000,
        stepGoal: 7000,
        supabase: supabaseAdmin!,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify stats were created
      const stats = await getDailyStats(testUserId, today, supabaseAdmin!);
      expect(stats).toBeDefined();
      expect(stats?.total_steps).toBe(5000);
      expect(stats?.goal_met).toBe(false);
    });

    it('should update existing daily stats', async () => {
      // Arrange
      const today = getDateString(new Date());
      await createTestDailyStats(testUserId, {
        date: today,
        total_steps: 3000,
        goal_met: false,
      });

      // Act
      const result = await syncDailyStats({
        userId: testUserId,
        date: today,
        steps: 8000,
        stepGoal: 7000,
        supabase: supabaseAdmin!,
      });

      // Assert
      expect(result.success).toBe(true);

      // Verify stats were updated
      const stats = await getDailyStats(testUserId, today, supabaseAdmin!);
      expect(stats?.total_steps).toBe(8000);
      expect(stats?.goal_met).toBe(true);
    });

    it('should set goal_met to true when steps >= goal', async () => {
      // Arrange
      const today = getDateString(new Date());

      // Act
      const result = await syncDailyStats({
        userId: testUserId,
        date: today,
        steps: 7000,
        stepGoal: 7000,
        supabase: supabaseAdmin!,
      });

      // Assert
      expect(result.success).toBe(true);

      const stats = await getDailyStats(testUserId, today, supabaseAdmin!);
      expect(stats?.goal_met).toBe(true);
    });

    it('should set goal_met to false when steps < goal', async () => {
      // Arrange
      const today = getDateString(new Date());

      // Act
      const result = await syncDailyStats({
        userId: testUserId,
        date: today,
        steps: 6999,
        stepGoal: 7000,
        supabase: supabaseAdmin!,
      });

      // Assert
      expect(result.success).toBe(true);

      const stats = await getDailyStats(testUserId, today, supabaseAdmin!);
      expect(stats?.goal_met).toBe(false);
    });
  });

  describe('getDailyStatsRange', () => {
    it('should fetch stats for a date range', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));
      const twoDaysAgo = getDateString(daysAgo(2));

      await createTestDailyStats(testUserId, { date: twoDaysAgo, total_steps: 5000 });
      await createTestDailyStats(testUserId, { date: yesterday, total_steps: 6000 });
      await createTestDailyStats(testUserId, { date: today, total_steps: 7000 });

      // Act
      const stats = await getDailyStatsRange(testUserId, twoDaysAgo, today, supabaseAdmin!);

      // Assert
      expect(stats).toHaveLength(3);
      expect(stats[0].date).toBe(twoDaysAgo);
      expect(stats[0].total_steps).toBe(5000);
      expect(stats[1].date).toBe(yesterday);
      expect(stats[1].total_steps).toBe(6000);
      expect(stats[2].date).toBe(today);
      expect(stats[2].total_steps).toBe(7000);
    });

    it('should return empty array when no stats in range', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));

      // Act
      const stats = await getDailyStatsRange(testUserId, yesterday, today, supabaseAdmin!);

      // Assert
      expect(stats).toEqual([]);
    });
  });

  describe('updateStreak', () => {
    it('should update streak when goal is met', async () => {
      // Arrange
      const today = getDateString(new Date());
      await createTestStreak(testUserId, {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      });

      // Act
      const result = await updateStreak(testUserId, today, supabaseAdmin!);

      // Assert
      expect(result.success).toBe(true);

      // Verify streak was updated
      const streak = await getStreak(testUserId, supabaseAdmin!);
      expect(streak).toBeDefined();
      expect(streak?.current_streak).toBe(1);
      expect(streak?.longest_streak).toBe(1);
      expect(streak?.last_activity_date).toBe(today);
    });

    it('should increment streak for consecutive days', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));

      await createTestStreak(testUserId, {
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: yesterday,
      });

      // Act
      const result = await updateStreak(testUserId, today, supabaseAdmin!);

      // Assert
      expect(result.success).toBe(true);

      const streak = await getStreak(testUserId, supabaseAdmin!);
      expect(streak?.current_streak).toBe(2);
      expect(streak?.longest_streak).toBe(2);
      expect(streak?.last_activity_date).toBe(today);
    });

    it('should reset streak when there is a gap', async () => {
      // Arrange
      const today = getDateString(new Date());
      const threeDaysAgo = getDateString(daysAgo(3));

      await createTestStreak(testUserId, {
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: threeDaysAgo,
      });

      // Act
      const result = await updateStreak(testUserId, today, supabaseAdmin!);

      // Assert
      expect(result.success).toBe(true);

      const streak = await getStreak(testUserId, supabaseAdmin!);
      expect(streak?.current_streak).toBe(1);
      expect(streak?.longest_streak).toBe(10); // Longest streak should remain
      expect(streak?.last_activity_date).toBe(today);
    });

    it('should update longest_streak when current exceeds it', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));

      await createTestStreak(testUserId, {
        current_streak: 9,
        longest_streak: 9,
        last_activity_date: yesterday,
      });

      // Act
      const result = await updateStreak(testUserId, today, supabaseAdmin!);

      // Assert
      expect(result.success).toBe(true);

      const streak = await getStreak(testUserId, supabaseAdmin!);
      expect(streak?.current_streak).toBe(10);
      expect(streak?.longest_streak).toBe(10);
    });
  });

  describe('End-to-end sync flow', () => {
    it('should sync stats and update streak when goal is met', async () => {
      // Arrange
      const today = getDateString(new Date());
      await createTestStreak(testUserId, {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      });

      // Act: Sync stats with goal met
      const syncResult = await syncDailyStats({
        userId: testUserId,
        date: today,
        steps: 8000,
        stepGoal: 7000,
        supabase: supabaseAdmin!,
      });

      // Update streak
      const streakResult = await updateStreak(testUserId, today, supabaseAdmin!);

      // Assert
      expect(syncResult.success).toBe(true);
      expect(streakResult.success).toBe(true);

      const stats = await getDailyStats(testUserId, today, supabaseAdmin!);
      expect(stats?.goal_met).toBe(true);

      const streak = await getStreak(testUserId, supabaseAdmin!);
      expect(streak?.current_streak).toBe(1);
    });

    it('should sync stats but not update streak when goal is missed', async () => {
      // Arrange
      const today = getDateString(new Date());
      const yesterday = getDateString(daysAgo(1));

      await createTestStreak(testUserId, {
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: yesterday,
      });

      // Act: Sync stats with goal NOT met
      const syncResult = await syncDailyStats({
        userId: testUserId,
        date: today,
        steps: 5000,
        stepGoal: 7000,
        supabase: supabaseAdmin!,
      });

      // Assert
      expect(syncResult.success).toBe(true);

      const stats = await getDailyStats(testUserId, today, supabaseAdmin!);
      expect(stats?.goal_met).toBe(false);

      // Streak should remain unchanged (no updateStreak call)
      const streak = await getStreak(testUserId, supabaseAdmin!);
      expect(streak?.current_streak).toBe(5);
      expect(streak?.last_activity_date).toBe(yesterday);
    });
  });
});

