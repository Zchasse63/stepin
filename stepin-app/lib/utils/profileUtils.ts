/**
 * Profile utility functions
 * Handles profile data operations, export, and account deletion
 */

import { supabase } from '../supabase/client';
import type { UserProfile, ProfileUpdateData } from '../../types/profile';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import { logger } from './logger';

/**
 * Fetch user profile from Supabase
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  // Parse notification_settings if it's a string
  const profile: UserProfile = {
    ...data,
    notification_settings: typeof data.notification_settings === 'string'
      ? JSON.parse(data.notification_settings)
      : data.notification_settings || {
          dailyReminder: false,
          streakReminder: false,
          goalCelebration: false,
          reminderTime: '09:00',
        },
  };

  return profile;
}

/**
 * Update user profile in Supabase
 */
export async function updateUserProfile(updates: ProfileUpdateData): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;
}

/**
 * Export all user data as JSON
 * Includes profile, walks, daily stats, streaks, badges, buddies, and activity feed
 */
export async function exportUserData(
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    onProgress?.(10, 'Fetching profile data...');

    // Fetch all user data with progress updates
    const [profileRes, walksRes, statsRes, streakRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('walks').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('daily_stats').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (walksRes.error) throw walksRes.error;
    if (statsRes.error) throw statsRes.error;
    if (streakRes.error) throw streakRes.error;

    onProgress?.(40, 'Fetching badges and social data...');

    // Fetch additional data
    const [badgesRes, buddiesRes, activityFeedRes, kudosRes] = await Promise.all([
      supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id),
      supabase.from('buddies').select('*').or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`),
      supabase.from('activity_feed').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('kudos').select('*').or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`),
    ]);

    onProgress?.(70, 'Preparing export file...');

    // Create comprehensive export object
    const exportData = {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profileRes.data,
      walks: walksRes.data,
      dailyStats: statsRes.data,
      streak: streakRes.data,
      badges: badgesRes.data || [],
      buddies: buddiesRes.data || [],
      activityFeed: activityFeedRes.data || [],
      kudos: kudosRes.data || [],
      summary: {
        totalWalks: walksRes.data?.length || 0,
        totalSteps: walksRes.data?.reduce((sum, walk) => sum + walk.steps, 0) || 0,
        totalDistance: walksRes.data?.reduce((sum, walk) => sum + (walk.distance_meters || 0), 0) || 0,
        currentStreak: streakRes.data?.current_streak || 0,
        longestStreak: streakRes.data?.longest_streak || 0,
        badgesEarned: badgesRes.data?.length || 0,
        buddyCount: buddiesRes.data?.length || 0,
        streakFreezesAvailable: profileRes.data?.streak_freezes_available || 0,
      },
    };

    onProgress?.(90, 'Creating export file...');

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Save to file
    const fileName = `stepin-data-export-${new Date().toISOString().split('T')[0]}.json`;
    const file = new File(Paths.document, fileName);

    file.write(jsonString, { encoding: 'utf8' });

    onProgress?.(100, 'Export complete!');

    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Stepin Data',
        UTI: 'public.json',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }

    logger.info('Data export successful', {
      totalWalks: exportData.summary.totalWalks,
      totalSteps: exportData.summary.totalSteps,
      badgesEarned: exportData.summary.badgesEarned,
    });
  } catch (error) {
    logger.error('Export failed:', error);
    throw error;
  }
}

/**
 * Verify user password before sensitive operations
 */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Password verification failed:', error);
      return false;
    }

    return !!data.user;
  } catch (error) {
    logger.error('Password verification error:', error);
    return false;
  }
}

/**
 * Schedule account deletion with grace period
 * Marks account for deletion in 30 days
 */
export async function scheduleAccountDeletion(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    const { error } = await supabase
      .from('profiles')
      .update({
        deletion_scheduled_at: deletionDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    logger.info('Account deletion scheduled', {
      userId: user.id,
      deletionDate: deletionDate.toISOString(),
    });
  } catch (error) {
    logger.error('Failed to schedule account deletion:', error);
    throw error;
  }
}

/**
 * Cancel scheduled account deletion
 */
export async function cancelAccountDeletion(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('profiles')
      .update({
        deletion_scheduled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    logger.info('Account deletion cancelled', { userId: user.id });
  } catch (error) {
    logger.error('Failed to cancel account deletion:', error);
    throw error;
  }
}

/**
 * Delete user account immediately (requires password verification)
 * This is a destructive operation that cannot be undone
 */
export async function deleteUserAccountImmediately(password: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error('No authenticated user');

    // Verify password first
    const isPasswordValid = await verifyPassword(user.email, password);
    if (!isPasswordValid) {
      throw new Error('Invalid password. Please try again.');
    }

    logger.info('Starting immediate account deletion', { userId: user.id });

    // Delete all user data (cascade will handle most of this, but being explicit)
    // Order matters: delete child records first, then parent records

    // 1. Delete social data
    await Promise.all([
      supabase.from('buddies').delete().or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`),
      supabase.from('activity_feed').delete().eq('user_id', user.id),
      supabase.from('kudos').delete().or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`),
      supabase.from('user_badges').delete().eq('user_id', user.id),
    ]);

    // 2. Delete walks (will cascade to daily_stats via recalculation)
    const { error: walksError } = await supabase
      .from('walks')
      .delete()
      .eq('user_id', user.id);

    if (walksError) throw walksError;

    // 3. Delete daily stats
    const { error: statsError } = await supabase
      .from('daily_stats')
      .delete()
      .eq('user_id', user.id);

    if (statsError) throw statsError;

    // 4. Delete streaks
    const { error: streakError } = await supabase
      .from('streaks')
      .delete()
      .eq('user_id', user.id);

    if (streakError) throw streakError;

    // 5. Delete profile (this should cascade from auth.users deletion, but being explicit)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) throw profileError;

    // 6. Delete auth user (this is the final step)
    // Note: This requires admin privileges or RPC function
    // For now, we'll sign out and let the user contact support for full deletion
    // In production, you'd want to implement an RPC function with admin privileges

    logger.info('Account data deleted, signing out user', { userId: user.id });

    // Sign out the user
    await supabase.auth.signOut();
  } catch (error) {
    logger.error('Account deletion failed:', error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 * Use deleteUserAccountImmediately with password verification instead
 */
export async function deleteUserAccount(): Promise<void> {
  throw new Error('Please use deleteUserAccountImmediately with password verification');
}

/**
 * Upload avatar image to Supabase storage
 */
export async function uploadAvatar(uri: string, userId: string): Promise<string> {
  try {
    // Read the file
    const file = new File(uri);
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Generate unique filename
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, uint8Array, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    logger.error('Avatar upload failed:', error);
    throw error;
  }
}

/**
 * Delete avatar from Supabase storage
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length < 2) return;

    const filePath = `avatars/${urlParts[1]}`;

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    logger.error('Avatar deletion failed:', error);
    // Don't throw - avatar deletion is not critical
  }
}

