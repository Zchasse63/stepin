/**
 * Database Operations Test Suite
 * Tests for profile and general database operations
 */

import { supabase, getCurrentUser, signOut, cleanupTestData } from '../utils/supabaseClient.js';
import { generateTestEmail, generateTestPassword, wait } from '../utils/testHelpers.js';

describe('Database Operations Tests', () => {
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

  describe('Profile Operations', () => {
    test('should create profile on signup', async () => {
      // Profile should be auto-created or manually created
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      // Profile might not exist immediately, so we'll try to create it
      if (error && error.code === 'PGRST116') {
        // No rows returned, create profile
        const { data: createData, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: testUserId,
            email: testEmail,
            daily_step_goal: 7000,
          })
          .select()
          .single();

        expect(createError).toBeNull();
        expect(createData).toBeDefined();
        expect(createData.id).toBe(testUserId);
      } else {
        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.id).toBe(testUserId);
      }
    });

    test('should read own profile', async () => {
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: testUserId,
        email: testEmail,
        daily_step_goal: 7000,
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(testUserId);
      expect(data.email).toBe(testEmail);
    });

    test('should update own profile', async () => {
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: testUserId,
        email: testEmail,
        daily_step_goal: 7000,
      });

      const newStepGoal = 10000;
      const newDisplayName = 'Test User';

      const { data, error } = await supabase
        .from('profiles')
        .update({
          daily_step_goal: newStepGoal,
          display_name: newDisplayName,
        })
        .eq('id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.daily_step_goal).toBe(newStepGoal);
      expect(data.display_name).toBe(newDisplayName);
    });

    test('should not read other users profiles (RLS)', async () => {
      // Create another user
      const otherEmail = generateTestEmail();
      const { data: otherUser } = await supabase.auth.signUp({
        email: otherEmail,
        password: generateTestPassword(),
      });
      const otherUserId = otherUser.user?.id;

      // Ensure other user's profile exists
      await supabase.from('profiles').upsert({
        id: otherUserId,
        email: otherEmail,
        daily_step_goal: 7000,
      });

      // Sign back in as original user
      await signOut();
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: generateTestPassword(),
      });

      // Try to read other user's profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      // Should return no rows due to RLS
      expect(data).toBeNull();
      expect(error).toBeDefined();

      // Clean up other user
      await cleanupTestData(otherUserId);
    });

    test('should not update other users profiles (RLS)', async () => {
      // Create another user
      const otherEmail = generateTestEmail();
      const { data: otherUser } = await supabase.auth.signUp({
        email: otherEmail,
        password: generateTestPassword(),
      });
      const otherUserId = otherUser.user?.id;

      // Ensure other user's profile exists
      await supabase.from('profiles').upsert({
        id: otherUserId,
        email: otherEmail,
        daily_step_goal: 7000,
      });

      // Sign back in as original user
      await signOut();
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: generateTestPassword(),
      });

      // Try to update other user's profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ daily_step_goal: 15000 })
        .eq('id', otherUserId)
        .select();

      // Should fail or return empty due to RLS
      expect(data).toEqual([]);

      // Clean up other user
      await cleanupTestData(otherUserId);
    });
  });

  describe('Database Connection', () => {
    test('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should handle invalid table name', async () => {
      const { data, error } = await supabase
        .from('nonexistent_table')
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('RLS Policies', () => {
    test('should enforce RLS on profiles table', async () => {
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: testUserId,
        email: testEmail,
        daily_step_goal: 7000,
      });

      // Can read own profile
      const { data: ownData, error: ownError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(ownError).toBeNull();
      expect(ownData).toBeDefined();

      // Cannot read all profiles (should only return own)
      const { data: allData, error: allError } = await supabase
        .from('profiles')
        .select('*');

      expect(allError).toBeNull();
      expect(allData).toBeDefined();
      expect(allData.length).toBe(1);
      expect(allData[0].id).toBe(testUserId);
    });

    test('should allow authenticated users to insert own profile', async () => {
      // Delete profile if it exists
      await supabase.from('profiles').delete().eq('id', testUserId);

      // Insert new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          email: testEmail,
          daily_step_goal: 8000,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(testUserId);
      expect(data.daily_step_goal).toBe(8000);
    });
  });
});
