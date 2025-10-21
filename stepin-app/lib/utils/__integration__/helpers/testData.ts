/**
 * Test Data Generators
 * Utilities for creating test data for integration tests
 */

import { supabaseTest, supabaseAdmin, generateTestEmail, formatDateForSupabase, getDateString } from './testSetup';
import type { Walk, DailyStats, Streak, UserProfile } from '../../../../types/database';

// Track last user creation time to avoid rate limits
let lastUserCreationTime = 0;
const MIN_USER_CREATION_INTERVAL_MS = 10000; // 10 seconds between user creations

/**
 * Create a test user and return the user ID
 * Implements rate limiting to avoid Supabase rate limits
 */
export async function createTestUser(email?: string, password: string = 'TestPassword123!'): Promise<string> {
  // Wait if we're creating users too quickly
  const now = Date.now();
  const timeSinceLastCreation = now - lastUserCreationTime;
  if (timeSinceLastCreation < MIN_USER_CREATION_INTERVAL_MS) {
    const waitTime = MIN_USER_CREATION_INTERVAL_MS - timeSinceLastCreation;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  const testEmail = email || generateTestEmail();

  const { data, error } = await supabaseTest.auth.signUp({
    email: testEmail,
    password,
  });

  lastUserCreationTime = Date.now();

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('No user returned from signup');
  }

  return data.user.id;
}

/**
 * Sign in as a test user
 */
export async function signInTestUser(email: string, password: string = 'TestPassword123!'): Promise<string> {
  const { data, error } = await supabaseTest.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in test user: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('No user returned from sign in');
  }

  return data.user.id;
}

/**
 * Create a test profile for a user
 * Uses admin client to bypass RLS
 * If profile already exists (created by trigger), update it instead
 */
export async function createTestProfile(
  userId: string,
  overrides?: Partial<UserProfile>
): Promise<UserProfile> {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available. Cannot create test profile.');
  }

  // Check if profile already exists (may be created by database trigger)
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) {
    // Profile exists, update it with overrides
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        daily_step_goal: 7000,
        ...overrides,
        updated_at: formatDateForSupabase(new Date()),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update test profile: ${error.message}`);
    }

    return data as UserProfile;
  }

  // Profile doesn't exist, create it
  const profile = {
    id: userId,
    email: `test-${userId}@stepin.test`,
    daily_step_goal: 7000,
    created_at: formatDateForSupabase(new Date()),
    updated_at: formatDateForSupabase(new Date()),
    ...overrides,
  };

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test profile: ${error.message}`);
  }

  return data as UserProfile;
}

/**
 * Create a test walk
 * Uses admin client to bypass RLS
 */
export async function createTestWalk(
  userId: string,
  overrides?: Partial<Walk>
): Promise<Walk> {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available. Cannot create test walk.');
  }

  const now = new Date();
  const walk = {
    user_id: userId,
    steps: 5000,
    distance_meters: 4000, // meters
    duration_minutes: 30, // minutes
    date: getDateString(now),
    created_at: formatDateForSupabase(now),
    updated_at: formatDateForSupabase(now),
    ...overrides,
  };

  const { data, error } = await supabaseAdmin
    .from('walks')
    .insert(walk)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test walk: ${error.message}`);
  }

  return data as Walk;
}

/**
 * Create multiple test walks
 */
export async function createTestWalks(
  userId: string,
  count: number,
  baseOverrides?: Partial<Walk>
): Promise<Walk[]> {
  const walks: Walk[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i); // Each walk on a different day
    
    const walk = await createTestWalk(userId, {
      ...baseOverrides,
      date: getDateString(date),
      start_time: formatDateForSupabase(date),
      end_time: formatDateForSupabase(new Date(date.getTime() + 30 * 60 * 1000)),
    });
    
    walks.push(walk);
  }

  return walks;
}

/**
 * Create test daily stats
 * Uses admin client to bypass RLS
 */
export async function createTestDailyStats(
  userId: string,
  overrides?: Partial<DailyStats>
): Promise<DailyStats> {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available. Cannot create test daily stats.');
  }

  const stats = {
    user_id: userId,
    date: getDateString(new Date()),
    total_steps: 5000,
    goal_met: false,
    created_at: formatDateForSupabase(new Date()),
    ...overrides,
  };

  const { data, error } = await supabaseAdmin
    .from('daily_stats')
    .insert(stats)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test daily stats: ${error.message}`);
  }

  return data as DailyStats;
}

/**
 * Create test streak
 * Uses admin client to bypass RLS
 * If streak already exists (created by trigger), update it instead
 */
export async function createTestStreak(
  userId: string,
  overrides?: Partial<Streak>
): Promise<Streak> {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available. Cannot create test streak.');
  }

  // Check if streak already exists (may be created by database trigger)
  const { data: existing } = await supabaseAdmin
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // Streak exists, update it with overrides
    const { data, error } = await supabaseAdmin
      .from('streaks')
      .update({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        ...overrides,
        updated_at: formatDateForSupabase(new Date()),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update test streak: ${error.message}`);
    }

    return data as Streak;
  }

  // Streak doesn't exist, create it
  const streak = {
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    created_at: formatDateForSupabase(new Date()),
    updated_at: formatDateForSupabase(new Date()),
    ...overrides,
  };

  const { data, error} = await supabaseAdmin
    .from('streaks')
    .insert(streak)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test streak: ${error.message}`);
  }

  return data as Streak;
}

/**
 * Delete a test user and all associated data
 * Uses admin client to bypass RLS
 */
export async function deleteTestUser(userId: string): Promise<void> {
  if (!userId) {
    // No user to delete
    return;
  }

  if (!supabaseAdmin) {
    throw new Error('Admin client not available. Cannot delete test user.');
  }

  // Delete in order to respect foreign key constraints (use admin client to bypass RLS)
  await supabaseAdmin.from('walks').delete().eq('user_id', userId);
  await supabaseAdmin.from('daily_stats').delete().eq('user_id', userId);
  await supabaseAdmin.from('streaks').delete().eq('user_id', userId);
  await supabaseAdmin.from('profiles').delete().eq('id', userId);

  // Delete auth user (requires admin client)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.warn(`Warning: Failed to delete auth user ${userId}: ${error.message}`);
  }
}

/**
 * Delete all test data for a user (but keep the user)
 * Uses admin client to bypass RLS
 */
export async function cleanupTestData(userId: string): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available. Cannot cleanup test data.');
  }

  await supabaseAdmin.from('walks').delete().eq('user_id', userId);
  await supabaseAdmin.from('daily_stats').delete().eq('user_id', userId);
  await supabaseAdmin.from('streaks').delete().eq('user_id', userId);
}

/**
 * Sign out the current test user
 */
export async function signOutTestUser(): Promise<void> {
  await supabaseTest.auth.signOut();
}

