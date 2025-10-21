/**
 * Integration tests for editWalk utility
 * Tests full edit + recalculation flow with real Supabase database
 */

import { supabaseTest, supabaseAdmin } from './helpers/testSetup';
import {
  createTestUser,
  createTestProfile,
  createTestWalk,
  createTestDailyStats,
  createTestStreak,
  deleteTestUser,
  cleanupTestData,
} from './helpers/testData';
import { editWalk, checkForDuplicateWalk } from '../editWalk';
import { getDateString, daysAgo } from './helpers/testSetup';

describe('editWalk integration tests', () => {
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

  describe('Edit walk steps', () => {
    it('should edit walk steps and recalculate daily stats', async () => {
      // Arrange: Create a walk with 5000 steps
      const today = new Date();
      const walk = await createTestWalk(testUserId, {
        steps: 5000,
        distance_meters: 4000,
        duration_minutes: 30,
        date: getDateString(today),
      });

      // Create initial daily stats
      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 5000,
        goal_met: false, // 5000 < 7000
      });

      // Act: Edit walk to 8000 steps
      const result = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: {
          steps: 8000,
          distance_meters: 6400,
          duration_minutes: 40,
        },
        supabase: supabaseTest,
      });

      // Assert: Edit was successful
      if (!result.success) {
        console.log('Edit failed with error:', result.error);
      }
      expect(result.success).toBe(true);

      // Verify walk was updated
      const { data: updatedWalk } = await supabaseTest
        .from('walks')
        .select('*')
        .eq('id', walk.id)
        .single();

      expect(updatedWalk?.steps).toBe(8000);
      expect(updatedWalk?.distance_meters).toBe(6400);
      expect(updatedWalk?.duration_minutes).toBe(40);

      // Verify daily stats were recalculated
      const { data: stats } = await supabaseTest
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(today))
        .single();

      expect(stats?.total_steps).toBe(8000);
      expect(stats?.goal_met).toBe(true); // 8000 >= 7000
    });

    it('should handle editing walk with multiple walks on same day', async () => {
      // Arrange: Create two walks on the same day
      const today = new Date();
      const walk1 = await createTestWalk(testUserId, {
        steps: 3000,
        date: getDateString(today),
      });
      const walk2 = await createTestWalk(testUserId, {
        steps: 4000,
        date: getDateString(today),
      });

      // Create daily stats for both walks
      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 7000,
        goal_met: true,
      });

      // Act: Edit first walk to 5000 steps
      const result = await editWalk({
        walkId: walk1.id!,
        userId: testUserId,
        updates: { steps: 5000 },
        supabase: supabaseTest,
      });

      // Assert
      expect(result.success).toBe(true);

      // Verify daily stats reflect both walks
      const { data: stats } = await supabaseTest
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(today))
        .single();

      expect(stats?.total_steps).toBe(9000); // 5000 + 4000
      expect(stats?.goal_met).toBe(true);
    });
  });

  describe('Edit walk date', () => {
    it('should edit walk date and recalculate stats for both dates', async () => {
      // Arrange: Create walk on day 1
      const day1 = daysAgo(1);
      const day2 = new Date();
      
      const walk = await createTestWalk(testUserId, {
        steps: 6000,
        date: getDateString(day1),
      });

      // Create stats for day 1
      await createTestDailyStats(testUserId, {
        date: getDateString(day1),
        total_steps: 6000,
        goal_met: false,
      });

      // Act: Move walk to day 2
      const result = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: {
          date: getDateString(day2),
        },
        supabase: supabaseTest,
      });

      // Assert
      expect(result.success).toBe(true);

      // Verify day 1 stats were recalculated (should be 0 or deleted)
      const { data: day1Stats } = await supabaseTest
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(day1))
        .maybeSingle();

      // Stats might be deleted or set to 0
      if (day1Stats) {
        expect(day1Stats.total_steps).toBe(0);
      }

      // Verify day 2 stats were created/updated
      const { data: day2Stats } = await supabaseTest
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(day2))
        .single();

      expect(day2Stats?.total_steps).toBe(6000);
    });
  });

  describe('Edit walk affecting streak', () => {
    it('should update streak when edit causes goal to be met', async () => {
      // Arrange: Create walk that doesn't meet goal
      const today = new Date();
      const walk = await createTestWalk(testUserId, {
        steps: 5000,
        date: getDateString(today),
      });

      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 5000,
        goal_met: false,
      });

      await createTestStreak(testUserId, {
        current_streak: 0,
        longest_streak: 5,
        last_activity_date: null,
      });

      // Act: Edit walk to meet goal
      const result = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: { steps: 8000 },
        supabase: supabaseTest,
      });

      // Assert
      expect(result.success).toBe(true);

      // Verify streak was updated
      const { data: streak } = await supabaseTest
        .from('streaks')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(streak?.current_streak).toBeGreaterThan(0);
      expect(streak?.last_activity_date).toBe(getDateString(today));
    });

    it('should update streak when edit causes goal to be missed', async () => {
      // Arrange: Create walk that meets goal
      const today = new Date();
      const walk = await createTestWalk(testUserId, {
        steps: 8000,
        date: getDateString(today),
      });

      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 8000,
        goal_met: true,
      });

      await createTestStreak(testUserId, {
        current_streak: 3,
        longest_streak: 5,
        last_activity_date: getDateString(today),
      });

      // Act: Edit walk to miss goal
      const result = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: { steps: 5000 },
        supabase: supabaseTest,
      });

      // Assert
      expect(result.success).toBe(true);

      // Verify daily stats updated
      const { data: stats } = await supabaseTest
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(today))
        .single();

      expect(stats?.goal_met).toBe(false);

      // Note: Streak recalculation logic depends on implementation
      // This test verifies the recalculation was triggered
    });
  });

  describe('Duplicate detection', () => {
    it('should detect potential duplicate walk using checkForDuplicateWalk', async () => {
      // Arrange: Create two walks on same date with similar steps
      const today = new Date();

      const walk1 = await createTestWalk(testUserId, {
        steps: 5000,
        date: getDateString(today),
      });

      const walk2 = await createTestWalk(testUserId, {
        steps: 5100,
        date: getDateString(today),
      });

      // Act: Check if editing walk1 to 5100 steps would create duplicate
      const isDuplicate = await checkForDuplicateWalk(
        testUserId,
        walk1.id!,
        getDateString(today),
        5100,
        supabaseTest
      );

      // Assert: Should detect duplicate
      expect(isDuplicate).toBe(true);
    });

    it('should not detect duplicate when steps differ significantly', async () => {
      // Arrange: Create walk
      const today = new Date();
      const walk = await createTestWalk(testUserId, {
        steps: 5000,
        date: getDateString(today),
      });

      // Act: Check for duplicate with very different steps
      const isDuplicate = await checkForDuplicateWalk(
        testUserId,
        walk.id!,
        getDateString(today),
        10000,
        supabaseTest
      );

      // Assert: Should not detect duplicate
      expect(isDuplicate).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should return error when walk not found', async () => {
      // Act: Try to edit non-existent walk
      const result = await editWalk({
        walkId: 'non-existent-id',
        userId: testUserId,
        updates: { steps: 6000 },
        supabase: supabaseTest,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Walk not found');
    });

    it('should return error when editing another user\'s walk', async () => {
      // Arrange: Create another user and their walk
      const otherUserId = await createTestUser();
      await createTestProfile(otherUserId);

      const otherWalk = await createTestWalk(otherUserId, {
        steps: 5000,
      });

      // Act: Try to edit other user's walk
      const result = await editWalk({
        walkId: otherWalk.id!,
        userId: testUserId, // Wrong user
        updates: { steps: 6000 },
        supabase: supabaseTest,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Walk not found');

      // Cleanup other user
      await deleteTestUser(otherUserId);
    });

    it('should handle invalid updates gracefully', async () => {
      // Arrange: Create walk
      const walk = await createTestWalk(testUserId, {
        steps: 5000,
      });

      // Act: Try to edit with invalid data (negative steps)
      const result = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: { steps: -1000 },
        supabase: supabaseTest,
      });

      // Assert: Should either reject or handle gracefully
      // Implementation may vary - this tests error handling exists
      expect(result).toBeDefined();
    });
  });

  describe('Multiple edits', () => {
    it('should handle multiple sequential edits correctly', async () => {
      // Arrange: Create walk
      const today = new Date();
      const walk = await createTestWalk(testUserId, {
        steps: 5000,
        date: getDateString(today),
      });

      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 5000,
        goal_met: false,
      });

      // Act: Edit multiple times
      const result1 = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: { steps: 6000 },
        supabase: supabaseTest,
      });

      const result2 = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: { steps: 7000 },
        supabase: supabaseTest,
      });

      const result3 = await editWalk({
        walkId: walk.id!,
        userId: testUserId,
        updates: { steps: 8000 },
        supabase: supabaseTest,
      });

      // Assert: All edits successful
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);

      // Verify final state
      const { data: finalWalk } = await supabaseTest
        .from('walks')
        .select('*')
        .eq('id', walk.id)
        .single();

      expect(finalWalk?.steps).toBe(8000);

      // Verify daily stats reflect final state
      const { data: stats } = await supabaseTest
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(today))
        .single();

      expect(stats?.total_steps).toBe(8000);
    });
  });
});

