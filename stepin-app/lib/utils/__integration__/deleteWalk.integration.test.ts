/**
 * Integration tests for deleteWalk utility
 * Tests full deletion + recalculation flow with real Supabase database
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
import { deleteWalk, deleteWalks } from '../deleteWalk';
import { getDateString, daysAgo } from './helpers/testSetup';

describe('deleteWalk integration tests', () => {
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

  describe('Delete single walk', () => {
    it('should delete walk and recalculate daily stats', async () => {
      // Arrange: Create walk with 5000 steps
      const today = new Date();
      const walk = await createTestWalk(testUserId, {
        steps: 5000,
        date: getDateString(today),
      });

      // Create daily stats
      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 5000,
        goal_met: false,
      });

      // Act: Delete walk
      await deleteWalk(walk.id!, testUserId, supabaseAdmin!);

      // Assert: Walk should be deleted
      const { data: deletedWalk } = await supabaseAdmin
        .from('walks')
        .select('*')
        .eq('id', walk.id!)
        .maybeSingle();

      expect(deletedWalk).toBeNull();

      // Assert: Daily stats should be deleted (no walks left)
      const { data: stats } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(today))
        .maybeSingle();

      expect(stats).toBeNull();
    });

    it('should delete walk and update daily stats when multiple walks exist', async () => {
      // Arrange: Create 2 walks on same day
      const today = new Date();
      const walk1 = await createTestWalk(testUserId, {
        steps: 3000,
        date: getDateString(today),
      });

      const walk2 = await createTestWalk(testUserId, {
        steps: 5000,
        date: getDateString(today),
      });

      // Create daily stats
      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 8000,
        goal_met: true,
      });

      // Act: Delete first walk
      await deleteWalk(walk1.id!, testUserId, supabaseAdmin!);

      // Assert: Walk1 should be deleted
      const { data: deletedWalk } = await supabaseAdmin
        .from('walks')
        .select('*')
        .eq('id', walk1.id!)
        .maybeSingle();

      expect(deletedWalk).toBeNull();

      // Assert: Walk2 should still exist
      const { data: remainingWalk } = await supabaseAdmin
        .from('walks')
        .select('*')
        .eq('id', walk2.id!)
        .single();

      expect(remainingWalk).toBeTruthy();

      // Assert: Daily stats should be updated to 5000 steps
      const { data: stats } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(today))
        .single();

      expect(stats.total_steps).toBe(5000);
      expect(stats.goal_met).toBe(false); // 5000 < 7000 default goal
    });

    it('should update streak when deleting walk causes goal to be missed', async () => {
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
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: getDateString(today),
      });

      // Act: Delete walk
      await deleteWalk(walk.id!, testUserId, supabaseAdmin!);

      // Assert: Streak should be reset
      const { data: streak } = await supabaseAdmin
        .from('streaks')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(streak.current_streak).toBe(0);
      expect(streak.last_activity_date).toBeNull();
    });

    it('should return error when walk not found', async () => {
      // Use a valid UUID that doesn't exist
      const fakeId = '00000000-0000-0000-0000-000000000001';

      // Act & Assert
      await expect(
        deleteWalk(fakeId, testUserId, supabaseAdmin!)
      ).rejects.toThrow('Walk not found');
    });

    it('should return error when deleting another user\'s walk', async () => {
      // Arrange: Create another user and their walk
      const otherUserId = await createTestUser();
      await createTestProfile(otherUserId);

      const otherWalk = await createTestWalk(otherUserId, {
        steps: 5000,
      });

      // Act & Assert: Try to delete other user's walk
      await expect(
        deleteWalk(otherWalk.id!, testUserId, supabaseAdmin!)
      ).rejects.toThrow('Walk not found');

      // Cleanup other user
      await deleteTestUser(otherUserId);
    });
  });

  describe('Delete multiple walks', () => {
    it('should delete multiple walks and recalculate stats', async () => {
      // Arrange: Create 3 walks on same day
      const today = new Date();
      const walk1 = await createTestWalk(testUserId, {
        steps: 2000,
        date: getDateString(today),
      });

      const walk2 = await createTestWalk(testUserId, {
        steps: 3000,
        date: getDateString(today),
      });

      const walk3 = await createTestWalk(testUserId, {
        steps: 4000,
        date: getDateString(today),
      });

      await createTestDailyStats(testUserId, {
        date: getDateString(today),
        total_steps: 9000,
        goal_met: true,
      });

      // Act: Delete 2 walks
      await deleteWalks([walk1.id!, walk2.id!], testUserId, supabaseAdmin!);

      // Assert: Walks should be deleted
      const { data: deletedWalks } = await supabaseAdmin
        .from('walks')
        .select('*')
        .in('id', [walk1.id!, walk2.id!]);

      expect(deletedWalks).toHaveLength(0);

      // Assert: Walk3 should still exist
      const { data: remainingWalk } = await supabaseAdmin
        .from('walks')
        .select('*')
        .eq('id', walk3.id!)
        .single();

      expect(remainingWalk).toBeTruthy();

      // Assert: Daily stats should be updated to 4000 steps
      const { data: stats } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', getDateString(today))
        .single();

      expect(stats.total_steps).toBe(4000);
      expect(stats.goal_met).toBe(false);
    });

    it('should delete walks across multiple dates', async () => {
      // Arrange: Create walks on different days
      const day1 = daysAgo(2);
      const day2 = daysAgo(1);

      const walk1 = await createTestWalk(testUserId, {
        steps: 5000,
        date: getDateString(day1),
      });

      const walk2 = await createTestWalk(testUserId, {
        steps: 6000,
        date: getDateString(day2),
      });

      await createTestDailyStats(testUserId, {
        date: getDateString(day1),
        total_steps: 5000,
        goal_met: false,
      });

      await createTestDailyStats(testUserId, {
        date: getDateString(day2),
        total_steps: 6000,
        goal_met: false,
      });

      // Act: Delete both walks
      await deleteWalks([walk1.id!, walk2.id!], testUserId, supabaseAdmin!);

      // Assert: Both walks should be deleted
      const { data: deletedWalks } = await supabaseAdmin
        .from('walks')
        .select('*')
        .in('id', [walk1.id!, walk2.id!]);

      expect(deletedWalks).toHaveLength(0);

      // Assert: Both daily stats should be deleted
      const { data: stats } = await supabaseAdmin
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .in('date', [getDateString(day1), getDateString(day2)]);

      expect(stats).toHaveLength(0);
    });

    it('should return error when no walks found', async () => {
      // Use valid UUIDs that don't exist
      const fakeId1 = '00000000-0000-0000-0000-000000000001';
      const fakeId2 = '00000000-0000-0000-0000-000000000002';

      // Act & Assert
      await expect(
        deleteWalks([fakeId1, fakeId2], testUserId, supabaseAdmin!)
      ).rejects.toThrow('No walks found');
    });
  });
});

