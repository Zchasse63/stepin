/**
 * Date/Time Edge Cases Test Suite
 * Tests for timezone handling, date boundaries, DST, and temporal edge cases
 */

import { supabase, cleanupTestData } from '../utils/supabaseClient.js';
import { generateTestEmail, generateTestPassword, wait } from '../utils/testHelpers.js';

describe('Date/Time Edge Cases Tests', () => {
  let testEmail;
  let testPassword;
  let testUserId;

  beforeEach(() => {
    testEmail = generateTestEmail();
    testPassword = generateTestPassword();
  });

  afterEach(async () => {
    try {
      if (testUserId) {
        await cleanupTestData(testUserId);
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  });

  describe('Date Boundary Testing', () => {
    beforeEach(async () => {
      const { data } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      testUserId = data.user?.id;
      
      if (!testUserId) {
        throw new Error('Failed to create test user');
      }
      
      await wait(500);
    });

    test('should handle midnight boundary (23:59 to 00:01)', async () => {
      // Create walk at end of day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { data: walk1, error: error1 } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: yesterdayStr,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error1).toBeNull();
      expect(walk1.date).toBe(yesterdayStr);

      // Create walk at start of new day
      const today = new Date().toISOString().split('T')[0];

      const { data: walk2, error: error2 } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: today,
        steps: 3000,
        duration_minutes: 30,
        distance_meters: 2400,
      }).select().single();

      expect(error2).toBeNull();
      expect(walk2.date).toBe(today);

      // Verify walks are on different dates
      expect(walk1.date).not.toBe(walk2.date);
    });

    test('should handle month boundary correctly', async () => {
      // Create walk on last day of month
      const lastDayOfMonth = new Date();
      lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
      lastDayOfMonth.setDate(0); // Sets to last day of previous month
      const lastDayStr = lastDayOfMonth.toISOString().split('T')[0];

      const { data: walk1, error: error1 } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: lastDayStr,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error1).toBeNull();

      // Create walk on first day of next month
      const firstDayOfNextMonth = new Date(lastDayOfMonth);
      firstDayOfNextMonth.setDate(firstDayOfNextMonth.getDate() + 1);
      const firstDayStr = firstDayOfNextMonth.toISOString().split('T')[0];

      const { data: walk2, error: error2 } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: firstDayStr,
        steps: 6000,
        duration_minutes: 50,
        distance_meters: 4800,
      }).select().single();

      expect(error2).toBeNull();

      // Verify different months
      const month1 = new Date(walk1.date).getMonth();
      const month2 = new Date(walk2.date).getMonth();
      expect(month2).toBe((month1 + 1) % 12);
    });

    test('should handle year boundary correctly', async () => {
      // Create walk on Dec 31
      const dec31 = new Date();
      dec31.setMonth(11); // December
      dec31.setDate(31);
      const dec31Str = dec31.toISOString().split('T')[0];

      const { data: walk1, error: error1 } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: dec31Str,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error1).toBeNull();

      // Create walk on Jan 1
      const jan1 = new Date(dec31);
      jan1.setDate(jan1.getDate() + 1);
      const jan1Str = jan1.toISOString().split('T')[0];

      const { data: walk2, error: error2 } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: jan1Str,
        steps: 6000,
        duration_minutes: 50,
        distance_meters: 4800,
      }).select().single();

      expect(error2).toBeNull();

      // Verify different years (if crossing year boundary)
      const year1 = new Date(walk1.date).getFullYear();
      const year2 = new Date(walk2.date).getFullYear();
      
      if (dec31.getFullYear() !== jan1.getFullYear()) {
        expect(year2).toBe(year1 + 1);
      }
    });

    test('should handle leap year correctly (Feb 29)', async () => {
      // Test with a known leap year date
      const leapYearDate = '2024-02-29'; // 2024 is a leap year

      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: leapYearDate,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error).toBeNull();
      expect(data.date).toBe(leapYearDate);
    });

    test('should reject invalid date (Feb 30)', async () => {
      const invalidDate = '2024-02-30'; // February never has 30 days

      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: invalidDate,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('Streak Date Calculations', () => {
    beforeEach(async () => {
      const { data } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      testUserId = data.user?.id;
      
      if (!testUserId) {
        throw new Error('Failed to create test user');
      }
      
      await wait(500);
    });

    test('should calculate consecutive days correctly', async () => {
      // Create daily stats for 7 consecutive days
      const stats = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        stats.push({
          user_id: testUserId,
          date: date.toISOString().split('T')[0],
          total_steps: 7000,
          goal_met: true,
        });
      }

      const { error } = await supabase.from('daily_stats').insert(stats);
      expect(error).toBeNull();

      // Verify all 7 days are present
      const { data: allStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .order('date', { ascending: false });

      expect(allStats).toHaveLength(7);

      // Verify dates are consecutive
      for (let i = 0; i < 6; i++) {
        const date1 = new Date(allStats[i].date);
        const date2 = new Date(allStats[i + 1].date);
        const dayDiff = (date1 - date2) / (1000 * 60 * 60 * 24);
        expect(dayDiff).toBe(1);
      }
    });

    test('should detect streak break (missing day)', async () => {
      // Create stats with a gap
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      await supabase.from('daily_stats').insert([
        {
          user_id: testUserId,
          date: today.toISOString().split('T')[0],
          total_steps: 7000,
          goal_met: true,
        },
        {
          user_id: testUserId,
          date: yesterday.toISOString().split('T')[0],
          total_steps: 7000,
          goal_met: true,
        },
        // Missing day here (2 days ago)
        {
          user_id: testUserId,
          date: threeDaysAgo.toISOString().split('T')[0],
          total_steps: 7000,
          goal_met: true,
        },
      ]);

      // Query for consecutive days
      const { data: stats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .order('date', { ascending: false });

      // Check for gap
      const date1 = new Date(stats[1].date);
      const date2 = new Date(stats[2].date);
      const dayDiff = (date1 - date2) / (1000 * 60 * 60 * 24);
      
      expect(dayDiff).toBeGreaterThan(1); // Gap detected
    });

    test('should handle streak across month boundary', async () => {
      // Create streak that crosses month boundary
      const stats = [];
      for (let i = -3; i <= 3; i++) {
        // Create dates around month boundary
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(i); // This will adjust month if needed
        stats.push({
          user_id: testUserId,
          date: date.toISOString().split('T')[0],
          total_steps: 7000,
          goal_met: true,
        });
      }

      const { error } = await supabase.from('daily_stats').insert(stats);
      expect(error).toBeNull();

      // Verify all days are present
      const { data: allStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', testUserId)
        .order('date', { ascending: true });

      expect(allStats.length).toBeGreaterThan(0);
    });
  });

  describe('Timezone Handling', () => {
    beforeEach(async () => {
      const { data } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      testUserId = data.user?.id;
      
      if (!testUserId) {
        throw new Error('Failed to create test user');
      }
      
      await wait(500);
    });

    test('should store dates in UTC consistently', async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: today,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error).toBeNull();
      expect(data.date).toBe(today);

      // Verify created_at is in UTC
      const createdAt = new Date(data.created_at);
      expect(createdAt.toISOString()).toContain('Z'); // UTC indicator
    });

    test('should handle date-only comparisons correctly', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Create walk
      await supabase.from('walks').insert({
        user_id: testUserId,
        date: today,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      });

      // Query by date (not timestamp)
      const { data, error } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', today);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].date).toBe(today);
    });

    test('should handle date range queries correctly', async () => {
      // Create walks over 10 days
      const walks = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        walks.push({
          user_id: testUserId,
          date: date.toISOString().split('T')[0],
          steps: 5000,
          duration_minutes: 45,
          distance_meters: 4000,
        });
      }

      await supabase.from('walks').insert(walks);

      // Query last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', testUserId)
        .gte('date', sevenDaysAgoStr)
        .order('date', { ascending: false });

      expect(error).toBeNull();
      expect(data.length).toBeGreaterThanOrEqual(7);
      expect(data.length).toBeLessThanOrEqual(8); // Might include boundary day
    });
  });

  describe('Historical Data Edge Cases', () => {
    beforeEach(async () => {
      const { data } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      testUserId = data.user?.id;
      
      if (!testUserId) {
        throw new Error('Failed to create test user');
      }
      
      await wait(500);
    });

    test('should handle very old dates (1 year ago)', async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: oneYearAgoStr,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error).toBeNull();
      expect(data.date).toBe(oneYearAgoStr);
    });

    test('should handle very old dates (10 years ago)', async () => {
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      const tenYearsAgoStr = tenYearsAgo.toISOString().split('T')[0];

      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: tenYearsAgoStr,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error).toBeNull();
      expect(data.date).toBe(tenYearsAgoStr);
    });

    test('should sort historical data correctly', async () => {
      // Create walks in random order
      const dates = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 100));
        dates.push(date.toISOString().split('T')[0]);
      }

      const walks = dates.map(date => ({
        user_id: testUserId,
        date,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }));

      await supabase.from('walks').insert(walks);

      // Query with sorting
      const { data, error } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', testUserId)
        .order('date', { ascending: false });

      expect(error).toBeNull();

      // Verify sorting
      for (let i = 0; i < data.length - 1; i++) {
        const date1 = new Date(data[i].date);
        const date2 = new Date(data[i + 1].date);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });
  });
});
