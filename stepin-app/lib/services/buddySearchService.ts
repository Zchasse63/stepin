/**
 * Buddy Search Service
 * Handles searching for users by username or email
 */

import { supabase } from '@/lib/supabase/client';

export interface BuddySearchResult {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  email?: string;
}

/**
 * Searches for buddies by username or email
 * Minimum 3 characters required for search
 * Returns up to 10 results
 * 
 * @param searchTerm - The search term (username or email)
 * @returns Array of matching users
 */
export async function searchBuddies(searchTerm: string): Promise<BuddySearchResult[]> {
  // Require minimum 3 characters
  if (searchTerm.length < 3) {
    return [];
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  try {
    // Search by username_lowercase or email (case-insensitive)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .or(`username_lowercase.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(10);
    
    if (error) {
      console.error('[BuddySearch] Search error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[BuddySearch] Unexpected error:', error);
    return [];
  }
}

/**
 * Checks if a username is available (not taken by another user)
 * 
 * @param username - The username to check
 * @param currentUserId - Optional current user ID to exclude from check
 * @returns true if available, false if taken
 */
export async function isUsernameAvailable(
  username: string,
  currentUserId?: string
): Promise<boolean> {
  if (!username || username.length < 3) {
    return false;
  }
  
  try {
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username_lowercase', username.toLowerCase())
      .limit(1);
    
    // Exclude current user if provided
    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[BuddySearch] Username check error:', error);
      return false;
    }
    
    // Available if no results found
    return !data || data.length === 0;
  } catch (error) {
    console.error('[BuddySearch] Unexpected error checking username:', error);
    return false;
  }
}

/**
 * Gets a user's profile by username
 * 
 * @param username - The username to look up
 * @returns User profile or null if not found
 */
export async function getUserByUsername(username: string): Promise<BuddySearchResult | null> {
  if (!username) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .eq('username_lowercase', username.toLowerCase())
      .single();
    
    if (error) {
      console.error('[BuddySearch] Get user error:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[BuddySearch] Unexpected error getting user:', error);
    return null;
  }
}

