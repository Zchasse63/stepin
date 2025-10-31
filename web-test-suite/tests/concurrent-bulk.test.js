/**
 * Concurrent User & Bulk Operations Test Suite
 * Tests for multi-user scenarios, data isolation, and bulk data handling
 * Optimized to avoid rate limiting
 */

import { supabase, cleanupTestData } from '../utils/supabaseClient.js';
import { generateTestEmail, generateTestPassword, wait } from '../utils/testHelpers.js';

describe('Concurrent User & Bulk Operations Tests', () => {
  let testUsers = [];

  afterEach(async () => {
    // Clean up all test users
    for (const user of testUsers) {
      try {
        if (user.id) {
          await cleanupTestData(user.id);
        }
      } catch (error) {
        console.warn('Cleanup warning:', error.message);
      }
    }
    testUsers = [];
    await supabase.auth.signOut();
  });

  describe('Multi-User Data Isolation', () => {
    test('should isolate walk data between users', async () => {
      // Create and sign in user 1
      const user1Email = generateTestEmail();
      const user1Password = generateTestPassword();
      const { data: user1Data } = await supabase.auth.signUp({
        email: user1Email,
        password: user1Password,
      });
      const user1Id = user1Data.user?.id;
      testUsers.push({ id: user1Id, email: user1Email });
      await wait(2000); // Longer wait to avoid rate limiting

      const today = new Date().toISOString().split('T')[0];

      // User 1 creates a walk (already signed in from signup)
      await supabase.from('walks').insert({
        user_id: user1Id,
        date: today,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      });

      // Sign out user 1
      await supabase.auth.signOut();
      await wait(1000);

      // Create and sign in user 2
      const user2Email = generateTestEmail();
      const user2Password = generateTestPassword();
      const { data: user2Data } = await supabase.auth.signUp({
        email: user2Email,
        password: user2Password,
      });
      const user2Id = user2Data.user?.id;
      testUsers.push({ id: user2Id, email: user2Email });
      await wait(2000);

      // User 2 creates a walk
      await supabase.from('walks').insert({
        user_id: user2Id,
        date: today,
        steps: 8000,
        duration_minutes: 60,
        distance_meters: 6400,
      });

      // User 2 should only see their own walk
      const { data: user2Walks } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', user2Id);

      expect(user2Walks).toHaveLength(1);
      expect(user2Walks[0].steps).toBe(8000);
    });

    test('should prevent cross-user data access via RLS', async () => {
      // Create user 1
      const user1Email = generateTestEmail();
      const user1Password = generateTestPassword();
      const { data: user1Data } = await supabase.auth.signUp({
        email: user1Email,
        password: user1Password,
      });
      const user1Id = user1Data.user?.id;
      testUsers.push({ id: user1Id, email: user1Email });
      await wait(2000);

      const today = new Date().toISOString().split('T')[0];

      // User 1 creates a walk
      await supabase.from('walks').insert({
        user_id: user1Id,
        date: today,
        steps: 5000,
        duration_minutes: 45,
        distance_meters: 4000,
      });

      // Sign out user 1
      await supabase.auth.signOut();
      await wait(1000);

      // Create and sign in user 2
      const user2Email = generateTestEmail();
      const user2Password = generateTestPassword();
      const { data: user2Data } = await supabase.auth.signUp({
        email: user2Email,
        password: user2Password,
      });
      const user2Id = user2Data.user?.id;
      testUsers.push({ id: user2Id, email: user2Email });
      await wait(2000);

      // User 2 tries to access User 1's walks
      const { data: user1Walks } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', user1Id);

      // RLS should prevent access
      expect(user1Walks).toHaveLength(0);
    });
  });

  describe('Bulk Data Operations', () => {
    test('should handle bulk walk insertion', async () => {
      const userEmail = generateTestEmail();
      const userPassword = generateTestPassword();
      const { data: userData } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
      });
      const userId = userData.user?.id;
      testUsers.push({ id: userId, email: userEmail });
      await wait(2000);

      // Create 30 days of walk data
      const walks = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        walks.push({
          user_id: userId,
          date: date.toISOString().split('T')[0],
          steps: 5000 + (i * 100),
          duration_minutes: 45,
          distance_meters: 4000,
        });
      }

      const { data, error } = await supabase
        .from('walks')
        .insert(walks)
        .select();

      expect(error).toBeNull();
      expect(data).toHaveLength(30);
    });

    test('should handle bulk walk retrieval with pagination', async () => {
      const userEmail = generateTestEmail();
      const userPassword = generateTestPassword();
      const { data: userData } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
      });
      const userId = userData.user?.id;
      testUsers.push({ id: userId, email: userEmail });
      await wait(2000);

      // Create 50 walks
      const walks = [];
      for (let i = 0; i < 50; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        walks.push({
          user_id: userId,
          date: date.toISOString().split('T')[0],
          steps: 5000 + i,
          duration_minutes: 45,
          distance_meters: 4000,
        });
      }

      await supabase.from('walks').insert(walks);
      await wait(500);

      // Retrieve first page (20 items)
      const { data: page1, error: error1 } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(0, 19);

      expect(error1).toBeNull();
      expect(page1).toHaveLength(20);

      // Retrieve second page (20 items)
      const { data: page2, error: error2 } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(20, 39);

      expect(error2).toBeNull();
      expect(page2).toHaveLength(20);

      // Retrieve third page (10 items)
      const { data: page3, error: error3 } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(40, 59);

      expect(error3).toBeNull();
      expect(page3).toHaveLength(10);
    });

    test('should handle large result sets efficiently', async () => {
      const userEmail = generateTestEmail();
      const userPassword = generateTestPassword();
      const { data: userData } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
      });
      const userId = userData.user?.id;
      testUsers.push({ id: userId, email: userEmail });
      await wait(2000);

      // Create 100 walks
      const walks = [];
      for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        walks.push({
          user_id: userId,
          date: date.toISOString().split('T')[0],
          steps: 5000 + (i * 10),
          duration_minutes: 45,
          distance_meters: 4000,
        });
      }

      await supabase.from('walks').insert(walks);
      await wait(500);

      // Perform aggregation query
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('walks')
        .select('steps')
        .eq('user_id', userId);
      
      const queryTime = Date.now() - startTime;

      expect(error).toBeNull();
      expect(data).toHaveLength(100);
      
      const totalSteps = data.reduce((sum, walk) => sum + walk.steps, 0);
      expect(totalSteps).toBeGreaterThan(0);
      expect(queryTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
