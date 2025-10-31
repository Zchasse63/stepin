/**
 * Streaks and Daily Stats Test Suite
 * Tests for streak tracking and daily statistics
 */

import { supabase, getCurrentUser, signOut, cleanupTestData } from '../utils/supabaseClient.js';
import {
  generateTestEmail,
  generateTestPassword,
  wait,
  getTodayDate,
  getDateDaysAgo,
} from '../utils/testHelpers.js';

describe('Streaks and Daily Stats Tests', () => {
  let testUserId;
  let testEmail;

  beforeEach(async () => {
    // Create and sign in a test user
    testEmail = generateTestEmail();
    const testPassword = generateTestPassword();

    const { data } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    testUserId = data.user?.id;
    
    if (!testUserId) {
      throw new Error('Failed to create test user - no user ID returned');
    }
    
    await wait(500);

    // Ensure profile exists
    await supabase.from('profiles').upsert({
      id: testUserId,
      email: testEmail,
      daily_step_goal: 7000,
    });
  });

  afterEach(async () => {
    // Clean up test data
    try {
      if (testUserId) {
        await cleanupTestData(testUserId);
      }
      await signOut();
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  describe('Daily Stats Operations', () => {
    test('should create daily stats', async () => {
      const today = getTodayDate();

      const { data, error } = await supabase
        .from('daily_stats')
        .insert({
          user_id: testUserId,
          date: today,
          total_steps: 8000,
          goal_met: true,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(testUserId);
      expect(data.total_steps).toBe(8000);
      expect(data.goal_met).toBe(true);
    });

    test('should retrieve daily stats for specific date', async () => {
      const today = getTodayDate();

      // Create stats
      await supabase.from('daily_stats').insert({
        user_id: testUserId,
        date: today,
        total_steps: 10000,
        goal_met: true,
      });

      // Retrieve stats
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', today)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.total_steps).toBe(10000);
      expect(data.goal_met).toBe(true);
    });

    test('should update existing daily stats', async () => {
      const today = getTodayDate();

      // Create initial stats
      await supabase.from('daily_stats').insert({
        user_id: testUserId,
        date: today,
        total_steps: 5000,
        goal_met: false,
      });

      // Update stats
      const { data, error } = await supabase
        .from('daily_stats')
        .update({
          total_steps: 8000,
          goal_met: true,
        })
        .eq('user_id', testUserId)
        .eq('date', today)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.total_steps).toBe(8000);
      expect(data.goal_met).toBe(true);
    });

    test('should retrieve weekly stats', async () => {
      const today = getTodayDate();

      // Create stats for the past week
      for (let i = 0; i < 7; i++) {
        const date = getDateDaysAgo(i);
        await supabase.from('daily_stats').insert({
          user_id: testUserId,
          date: date,
          total_steps: 7000 + (i * 1000),
          goal_met: true,
        });
      }

      // Retrieve weekly stats
      const weekAgo = getDateDaysAgo(6);
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .gte('date', weekAgo)
        .lte('date', today)
        .order('date', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(7);
    });

    test('should calculate weekly total steps', async () => {
      // Create stats for the past week
      for (let i = 0; i < 7; i++) {
        const date = getDateDaysAgo(i);
        await supabase.from('daily_stats').insert({
          user_id: testUserId,
          date: date,
          total_steps: 5000,
          goal_met: false,
        });
      }

      // Retrieve and calculate total
      const weekAgo = getDateDaysAgo(6);
      const today = getTodayDate();
      const { data, error } = await supabase
        .from('daily_stats')
        .select('total_steps')
        .eq('user_id', testUserId)
        .gte('date', weekAgo)
        .lte('date', today);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const totalSteps = data.reduce((sum, stat) => sum + stat.total_steps, 0);
      expect(totalSteps).toBe(35000);
    });
  });

  describe('Streak Operations', () => {
    test('should create streak record', async () => {
      const { data, error} = await supabase
        .from('streaks')
        .insert({
          user_id: testUserId,
          current_streak: 5,
          longest_streak: 10,
          last_activity_date: getTodayDate(),
          streak_freezes_available: 2,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(testUserId);
      expect(data.current_streak).toBe(5);
      expect(data.longest_streak).toBe(10);
    });

    test('should retrieve streak for user', async () => {
      // Create streak
      await supabase.from('streaks').insert({
        user_id: testUserId,
        current_streak: 7,
        longest_streak: 15,
        last_activity_date: getTodayDate(),
        streak_freezes_available: 1,
      });

      // Retrieve streak
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.current_streak).toBe(7);
      expect(data.longest_streak).toBe(15);
      expect(data.streak_freezes_available).toBe(1);
    });

    test('should update streak', async () => {
      // Create initial streak
      await supabase.from('streaks').insert({
        user_id: testUserId,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: getDateDaysAgo(1),
        streak_freezes_available: 2,
      });

      // Update streak
      const { data, error } = await supabase
        .from('streaks')
        .update({
          current_streak: 6,
          longest_streak: 10,
          last_activity_date: getTodayDate(),
        })
        .eq('user_id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.current_streak).toBe(6);
      expect(data.last_activity_date).toBe(getTodayDate());
    });

    test('should update longest streak when current exceeds it', async () => {
      // Create streak
      await supabase.from('streaks').insert({
        user_id: testUserId,
        current_streak: 10,
        longest_streak: 10,
        last_activity_date: getDateDaysAgo(1),
        streak_freezes_available: 2,
      });

      // Update to exceed longest
      const { data, error } = await supabase
        .from('streaks')
        .update({
          current_streak: 11,
          longest_streak: 11,
          last_activity_date: getTodayDate(),
        })
        .eq('user_id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.current_streak).toBe(11);
      expect(data.longest_streak).toBe(11);
    });

    test('should use streak freeze', async () => {
      // Create streak with freezes
      await supabase.from('streaks').insert({
        user_id: testUserId,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: getDateDaysAgo(1),
        streak_freezes_available: 2,
      });

      // Use a freeze
      const { data, error } = await supabase
        .from('streaks')
        .update({
          streak_freezes_available: 1,
          last_activity_date: getTodayDate(),
        })
        .eq('user_id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.streak_freezes_available).toBe(1);
      expect(data.current_streak).toBe(5); // Streak maintained
    });

    test('should earn streak freeze', async () => {
      // Create streak
      await supabase.from('streaks').insert({
        user_id: testUserId,
        current_streak: 7,
        longest_streak: 10,
        last_activity_date: getTodayDate(),
        streak_freezes_available: 1,
      });

      // Earn a freeze (e.g., after 7-day streak)
      const { data, error } = await supabase
        .from('streaks')
        .update({
          streak_freezes_available: 2,
        })
        .eq('user_id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.streak_freezes_available).toBe(2);
    });
  });

  describe('Integration: Walks, Stats, and Streaks', () => {
    test('should update stats when walk is logged', async () => {
      const today = getTodayDate();

      // Log a walk
      await supabase.from('walks').insert({
        user_id: testUserId,
        date: today,
        steps: 8000,
        distance_meters: 6096,
      });

      // Create/update daily stats
      const { data: existingStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', today)
        .single();

      const newTotalSteps = (existingStats?.total_steps || 0) + 8000;
      const goalMet = newTotalSteps >= 7000;

      if (existingStats) {
        await supabase
          .from('daily_stats')
          .update({
            total_steps: newTotalSteps,
            goal_met: goalMet,
          })
          .eq('id', existingStats.id);
      } else {
        await supabase.from('daily_stats').insert({
          user_id: testUserId,
          date: today,
          total_steps: newTotalSteps,
          goal_met: goalMet,
        });
      }

      // Verify stats
      const { data: stats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', today)
        .single();

      expect(stats).toBeDefined();
      expect(stats.total_steps).toBe(8000);
      expect(stats.goal_met).toBe(true);
    });

    test('should maintain streak when goal is met', async () => {
      const today = getTodayDate();
      const yesterday = getDateDaysAgo(1);

      // Create initial streak
      await supabase.from('streaks').insert({
        user_id: testUserId,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: yesterday,
        streak_freezes_available: 2,
      });

      // Log walk that meets goal
      await supabase.from('walks').insert({
        user_id: testUserId,
        date: today,
        steps: 8000,
      });

      // Update stats
      await supabase.from('daily_stats').insert({
        user_id: testUserId,
        date: today,
        total_steps: 8000,
        goal_met: true,
      });

      // Update streak
      await supabase
        .from('streaks')
        .update({
          current_streak: 6,
          last_activity_date: today,
        })
        .eq('user_id', testUserId);

      // Verify streak
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(streak).toBeDefined();
      expect(streak.current_streak).toBe(6);
      expect(streak.last_activity_date).toBe(today);
    });
  });

  describe('RLS Policies for Stats and Streaks', () => {
    test('should not access other users daily stats', async () => {
      // Create another user
      const otherEmail = generateTestEmail();
      const { data: otherUser } = await supabase.auth.signUp({
        email: otherEmail,
        password: generateTestPassword(),
      });
      const otherUserId = otherUser.user?.id;

      // Create stats for other user
      await supabase.from('daily_stats').insert({
        user_id: otherUserId,
        date: getTodayDate(),
        total_steps: 10000,
        goal_met: true,
      });

      // Sign back in as original user
      await signOut();
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: generateTestPassword(),
      });

      // Try to access all stats (should only get own)
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.every(stat => stat.user_id === testUserId)).toBe(true);

      // Clean up other user
      await cleanupTestData(otherUserId);
    });

    test('should not access other users streaks', async () => {
      // Create another user
      const otherEmail = generateTestEmail();
      const { data: otherUser } = await supabase.auth.signUp({
        email: otherEmail,
        password: generateTestPassword(),
      });
      const otherUserId = otherUser.user?.id;

      // Create streak for other user
      await supabase.from('streaks').insert({
        user_id: otherUserId,
        current_streak: 10,
        longest_streak: 20,
        last_activity_date: getTodayDate(),
        streak_freezes_available: 3,
      });

      // Sign back in as original user
      await signOut();
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: generateTestPassword(),
      });

      // Try to access all streaks (should only get own)
      const { data, error } = await supabase
        .from('streaks')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.every(streak => streak.user_id === testUserId)).toBe(true);

      // Clean up other user
      await cleanupTestData(otherUserId);
    });
  });
});
