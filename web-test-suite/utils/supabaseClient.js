/**
 * Supabase Client for Testing
 * Provides a configured Supabase client for test suites
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Don't persist sessions in tests
    detectSessionInUrl: false
  }
});

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Clean up test data
 */
export async function cleanupTestData(userId) {
  // Delete in order of foreign key dependencies
  await supabase.from('daily_stats').delete().eq('user_id', userId);
  await supabase.from('walks').delete().eq('user_id', userId);
  await supabase.from('streaks').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);
}
