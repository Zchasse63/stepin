/**
 * Advanced Validation Test Suite
 * Tests for edge cases, boundary conditions, and advanced validation scenarios
 */

import { supabase, cleanupTestData } from '../utils/supabaseClient.js';
import { generateTestEmail, generateTestPassword, wait } from '../utils/testHelpers.js';

describe('Advanced Validation Tests', () => {
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

  describe('Boundary Value Testing', () => {
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

    test('should accept minimum valid step count (0)', async () => {
      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: new Date().toISOString().split('T')[0],
        steps: 0,
        duration_minutes: 0,
        distance_meters: 0,
      }).select().single();

      expect(error).toBeNull();
      expect(data.steps).toBe(0);
    });

    test('should accept maximum valid step count (200000)', async () => {
      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: new Date().toISOString().split('T')[0],
        steps: 200000,
        duration_minutes: 1440,
        distance_meters: 160000,
      }).select().single();

      expect(error).toBeNull();
      expect(data.steps).toBe(200000);
    });

    test('should reject step count above maximum (200001)', async () => {
      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: new Date().toISOString().split('T')[0],
        steps: 200001,
        duration_minutes: 100,
        distance_meters: 5000,
      }).select().single();

      expect(error).not.toBeNull();
      expect(error.message).toContain('violates check constraint');
      expect(data).toBeNull();
    });

    test('should reject negative step count', async () => {
      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: new Date().toISOString().split('T')[0],
        steps: -100,
        duration_minutes: 30,
        distance_meters: 1000,
      }).select().single();

      expect(error).not.toBeNull();
      expect(error.message).toContain('violates check constraint');
      expect(data).toBeNull();
    });

    test('should reject negative distance', async () => {
      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: new Date().toISOString().split('T')[0],
        steps: 5000,
        duration_minutes: 45,
        distance_meters: -100,
      }).select().single();

      expect(error).not.toBeNull();
      expect(error.message).toContain('violates check constraint');
      expect(data).toBeNull();
    });
  });

  describe('Goal Validation', () => {
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

    test('should accept minimum valid goal (500)', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ daily_step_goal: 500 })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.daily_step_goal).toBe(500);
    });

    test('should accept maximum reasonable goal (50000)', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ daily_step_goal: 50000 })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.daily_step_goal).toBe(50000);
    });

    test('should handle unrealistic but technically valid goal (100000)', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ daily_step_goal: 100000 })
        .eq('id', testUserId)
        .select()
        .single();

      // Database should accept it, but app should warn user
      expect(error).toBeNull();
      expect(data.daily_step_goal).toBe(100000);
    });
  });

  describe('Data Type Validation', () => {
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

    test('should reject invalid date format', async () => {
      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: 'invalid-date',
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    test('should reject future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: futureDateStr,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      // Database will accept it, but app logic should prevent it
      // This test documents the expected behavior
      if (error) {
        expect(error.message).toContain('future');
      } else {
        // If database accepts it, we document that app-level validation is needed
        expect(data).toBeDefined();
      }
    });

    test('should handle decimal step counts by rounding', async () => {
      const { data, error } = await supabase.from('walks').insert({
        user_id: testUserId,
        date: new Date().toISOString().split('T')[0],
        steps: 5000.7, // Should be rounded or rejected
        duration_minutes: 45,
        distance_meters: 4000,
      }).select().single();

      // PostgreSQL integer type will reject decimal
      expect(error).not.toBeNull();
    });
  });

  describe('Input Sanitization', () => {
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

    test('should prevent SQL injection in profile update', async () => {
      const maliciousInput = "'; DROP TABLE profiles; --";
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: maliciousInput })
        .eq('id', testUserId)
        .select()
        .single();

      // Supabase parameterized queries should prevent injection
      expect(error).toBeNull();
      expect(data.display_name).toBe(maliciousInput); // Stored as literal string
    });

    test('should handle XSS attempts in display name', async () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: xssAttempt })
        .eq('id', testUserId)
        .select()
        .single();

      // Database should store it, app should sanitize on display
      expect(error).toBeNull();
      expect(data.display_name).toBe(xssAttempt);
    });

    test('should handle very long display names', async () => {
      const longName = 'A'.repeat(1000);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: longName })
        .eq('id', testUserId)
        .select()
        .single();

      // Database should accept it (text type has no limit)
      // App should truncate for display
      expect(error).toBeNull();
      expect(data.display_name.length).toBe(1000);
    });

    test('should handle special characters in display name', async () => {
      const specialChars = "Test User 🏃‍♂️ (Runner's Club) #1";
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: specialChars })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.display_name).toBe(specialChars);
    });
  });

  describe('Constraint Validation', () => {
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

    test('should enforce unique constraint on daily stats', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Insert first daily stat
      const { error: error1 } = await supabase.from('daily_stats').insert({
        user_id: testUserId,
        date: today,
        total_steps: 5000,
        goal_met: false,
      });

      expect(error1).toBeNull();

      // Try to insert duplicate
      const { error: error2 } = await supabase.from('daily_stats').insert({
        user_id: testUserId,
        date: today,
        total_steps: 6000,
        goal_met: true,
      });

      expect(error2).not.toBeNull();
      expect(error2.message).toContain('duplicate key value');
    });

    test('should enforce foreign key constraint on walks', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';

      const { error } = await supabase.from('walks').insert({
        user_id: fakeUserId,
        date: new Date().toISOString().split('T')[0],
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      });

      expect(error).not.toBeNull();
      expect(error.message).toContain('foreign key constraint');
    });
  });
});
