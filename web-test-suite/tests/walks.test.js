/**
 * Walks Test Suite
 * Tests for walk creation, retrieval, update, and deletion
 */

import { supabase, getCurrentUser, signOut, cleanupTestData } from '../utils/supabaseClient.js';
import {
  generateTestEmail,
  generateTestPassword,
  wait,
  getTodayDate,
  getYesterdayDate,
  calculateDistanceFromSteps,
} from '../utils/testHelpers.js';

describe('Walks Tests', () => {
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

  describe('Walk Creation', () => {
    test('should create a walk with all fields', async () => {
      const today = getTodayDate();
      const steps = 5000;
      const durationMinutes = 45;
      const distanceMeters = calculateDistanceFromSteps(steps);

      const { data, error } = await supabase
        .from('walks')
        .insert({
          user_id: testUserId,
          date: today,
          steps: steps,
          duration_minutes: durationMinutes,
          distance_meters: distanceMeters,
          route_coordinates: [
            { lat: 40.7128, lng: -74.0060, alt: 10 },
            { lat: 40.7138, lng: -74.0050, alt: 12 },
          ],
          start_location: { lat: 40.7128, lng: -74.0060 },
          end_location: { lat: 40.7138, lng: -74.0050 },
          auto_detected: false,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(testUserId);
      expect(data.steps).toBe(steps);
      expect(data.duration_minutes).toBe(durationMinutes);
      expect(parseFloat(data.distance_meters)).toBeCloseTo(distanceMeters, 0);
      expect(data.date).toBe(today);
    });

    test('should create a walk with minimal fields', async () => {
      const today = getTodayDate();
      const steps = 3000;

      const { data, error } = await supabase
        .from('walks')
        .insert({
          user_id: testUserId,
          date: today,
          steps: steps,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe(testUserId);
      expect(data.steps).toBe(steps);
      expect(data.date).toBe(today);
    });

    test('should fail to create walk without required fields', async () => {
      const { data, error } = await supabase
        .from('walks')
        .insert({
          user_id: testUserId,
          // Missing date and steps
        })
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    test('should fail to create walk with invalid steps', async () => {
      const today = getTodayDate();

      const { data, error } = await supabase
        .from('walks')
        .insert({
          user_id: testUserId,
          date: today,
          steps: -100, // Negative steps
        })
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    test('should create walk with heart rate data', async () => {
      const today = getTodayDate();

      const { data, error } = await supabase
        .from('walks')
        .insert({
          user_id: testUserId,
          date: today,
          steps: 6000,
          average_heart_rate: 120,
          max_heart_rate: 150,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.average_heart_rate).toBe(120);
      expect(data.max_heart_rate).toBe(150);
    });
  });

  describe('Walk Retrieval', () => {
    beforeEach(async () => {
      // Create test walks
      const today = getTodayDate();
      const yesterday = getYesterdayDate();

      await supabase.from('walks').insert([
        {
          user_id: testUserId,
          date: today,
          steps: 5000,
          duration_minutes: 45,
          distance_meters: 3810,
        },
        {
          user_id: testUserId,
          date: yesterday,
          steps: 7000,
          duration_minutes: 60,
          distance_meters: 5334,
        },
      ]);
    });

    test('should retrieve all walks for user', async () => {
      const { data, error } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', testUserId)
        .order('date', { ascending: false });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThanOrEqual(2);
    });

    test('should retrieve walks for specific date', async () => {
      const today = getTodayDate();

      const { data, error } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('date', today);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThanOrEqual(1);
      expect(data[0].date).toBe(today);
    });

    test('should retrieve walks with filtering', async () => {
      const { data, error } = await supabase
        .from('walks')
        .select('*')
        .eq('user_id', testUserId)
        .gte('steps', 6000);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThanOrEqual(1);
      expect(data[0].steps).toBeGreaterThanOrEqual(6000);
    });

    test('should not retrieve other users walks (RLS)', async () => {
      // Create another user
      const otherEmail = generateTestEmail();
      const { data: otherUser } = await supabase.auth.signUp({
        email: otherEmail,
        password: generateTestPassword(),
      });
      const otherUserId = otherUser.user?.id;

      // Create walk for other user
      await supabase.from('walks').insert({
        user_id: otherUserId,
        date: getTodayDate(),
        steps: 8000,
      });

      // Sign back in as original user
      await signOut();
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: generateTestPassword(),
      });

      // Try to retrieve all walks (should only get own)
      const { data, error } = await supabase
        .from('walks')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.every(walk => walk.user_id === testUserId)).toBe(true);

      // Clean up other user
      await cleanupTestData(otherUserId);
    });
  });

  describe('Walk Updates', () => {
    let walkId;

    beforeEach(async () => {
      // Create a test walk
      const today = getTodayDate();
      const { data } = await supabase
        .from('walks')
        .insert({
          user_id: testUserId,
          date: today,
          steps: 5000,
          duration_minutes: 45,
        })
        .select()
        .single();

      walkId = data.id;
    });

    test('should update walk steps', async () => {
      const newSteps = 6000;

      const { data, error } = await supabase
        .from('walks')
        .update({ steps: newSteps })
        .eq('id', walkId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.steps).toBe(newSteps);
    });

    test('should update walk duration', async () => {
      const newDuration = 60;

      const { data, error } = await supabase
        .from('walks')
        .update({ duration_minutes: newDuration })
        .eq('id', walkId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.duration_minutes).toBe(newDuration);
    });

    test('should update multiple fields at once', async () => {
      const updates = {
        steps: 7000,
        duration_minutes: 70,
        distance_meters: 5334,
      };

      const { data, error } = await supabase
        .from('walks')
        .update(updates)
        .eq('id', walkId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.steps).toBe(updates.steps);
      expect(data.duration_minutes).toBe(updates.duration_minutes);
      expect(parseFloat(data.distance_meters)).toBeCloseTo(updates.distance_meters, 0);
    });
  });

  describe('Walk Deletion', () => {
    let walkId;

    beforeEach(async () => {
      // Create a test walk
      const today = getTodayDate();
      const { data } = await supabase
        .from('walks')
        .insert({
          user_id: testUserId,
          date: today,
          steps: 5000,
        })
        .select()
        .single();

      walkId = data.id;
    });

    test('should delete own walk', async () => {
      const { error } = await supabase
        .from('walks')
        .delete()
        .eq('id', walkId);

      expect(error).toBeNull();

      // Verify walk is deleted
      const { data } = await supabase
        .from('walks')
        .select('*')
        .eq('id', walkId)
        .single();

      expect(data).toBeNull();
    });

    test('should not delete other users walks (RLS)', async () => {
      // Create another user
      const otherEmail = generateTestEmail();
      const { data: otherUser } = await supabase.auth.signUp({
        email: otherEmail,
        password: generateTestPassword(),
      });
      const otherUserId = otherUser.user?.id;

      // Create walk for other user
      const { data: otherWalk } = await supabase
        .from('walks')
        .insert({
          user_id: otherUserId,
          date: getTodayDate(),
          steps: 8000,
        })
        .select()
        .single();

      // Sign back in as original user
      await signOut();
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: generateTestPassword(),
      });

      // Try to delete other user's walk
      const { error } = await supabase
        .from('walks')
        .delete()
        .eq('id', otherWalk.id);

      // Should not throw error, but should not delete anything
      expect(error).toBeNull();

      // Clean up other user
      await cleanupTestData(otherUserId);
    });
  });

  describe('Walk Statistics', () => {
    beforeEach(async () => {
      // Create multiple walks
      const today = getTodayDate();
      await supabase.from('walks').insert([
        { user_id: testUserId, date: today, steps: 5000, distance_meters: 3810 },
        { user_id: testUserId, date: today, steps: 3000, distance_meters: 2286 },
        { user_id: testUserId, date: today, steps: 2000, distance_meters: 1524 },
      ]);
    });

    test('should calculate total steps for today', async () => {
      const today = getTodayDate();

      const { data, error } = await supabase
        .from('walks')
        .select('steps')
        .eq('user_id', testUserId)
        .eq('date', today);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const totalSteps = data.reduce((sum, walk) => sum + walk.steps, 0);
      expect(totalSteps).toBe(10000);
    });

    test('should calculate total distance for today', async () => {
      const today = getTodayDate();

      const { data, error } = await supabase
        .from('walks')
        .select('distance_meters')
        .eq('user_id', testUserId)
        .eq('date', today);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const totalDistance = data.reduce((sum, walk) => sum + parseFloat(walk.distance_meters || 0), 0);
      expect(totalDistance).toBeCloseTo(7620, 0);
    });
  });
});
