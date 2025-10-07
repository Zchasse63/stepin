/**
 * Social Store - Zustand store for social features
 * Phase 11: Non-Competitive Social Features
 * 
 * Manages buddies, activity feed, and kudos
 */

import { create } from 'zustand';
import { supabase } from '../supabase/client';
import * as Sentry from '@sentry/react-native';
import {
  BuddyWithProfile,
  ActivityFeedItemWithDetails,
  CreateActivityData,
  ActivityType,
  Visibility,
  BuddyStatus,
} from '../../types/social';

/**
 * Social store state interface
 */
interface SocialStore {
  // State
  buddies: BuddyWithProfile[];
  pendingRequests: BuddyWithProfile[];
  activityFeed: ActivityFeedItemWithDetails[];
  loading: boolean;
  error: string | null;

  // Buddy management methods
  loadBuddies: (userId: string) => Promise<void>;
  sendBuddyRequest: (buddyEmail: string) => Promise<void>;
  acceptBuddyRequest: (requestId: string) => Promise<void>;
  declineBuddyRequest: (requestId: string) => Promise<void>;
  removeBuddy: (buddyId: string) => Promise<void>;

  // Activity feed methods
  loadActivityFeed: (userId: string) => Promise<void>;
  postActivity: (userId: string, data: CreateActivityData) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;

  // Kudos methods
  giveKudos: (activityId: string, userId: string) => Promise<void>;
  removeKudos: (activityId: string, userId: string) => Promise<void>;

  // Utility methods
  clearError: () => void;
  reset: () => void;
}

/**
 * Social store implementation
 */
export const useSocialStore = create<SocialStore>((set, get) => ({
  // Initial state
  buddies: [],
  pendingRequests: [],
  activityFeed: [],
  loading: false,
  error: null,

  /**
   * Load user's buddies and pending requests
   */
  loadBuddies: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Loading buddies',
        level: 'info',
      });

      // Load accepted buddies
      const { data: acceptedBuddies, error: buddiesError } = await supabase
        .from('buddies')
        .select(`
          id,
          user_id,
          buddy_id,
          status,
          created_at,
          updated_at,
          buddy_profile:profiles!buddies_buddy_id_fkey(
            id,
            display_name,
            avatar_url,
            email
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (buddiesError) throw buddiesError;

      // Load pending requests (incoming)
      const { data: pendingData, error: pendingError } = await supabase
        .from('buddies')
        .select(`
          id,
          user_id,
          buddy_id,
          status,
          created_at,
          updated_at,
          buddy_profile:profiles!buddies_user_id_fkey(
            id,
            display_name,
            avatar_url,
            email
          )
        `)
        .eq('buddy_id', userId)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Transform buddy_profile from array to single object (Supabase joins return arrays)
      const transformedBuddies = (acceptedBuddies || []).map((buddy: any) => ({
        ...buddy,
        buddy_profile: Array.isArray(buddy.buddy_profile)
          ? buddy.buddy_profile[0]
          : buddy.buddy_profile
      }));

      const transformedPending = (pendingData || []).map((buddy: any) => ({
        ...buddy,
        buddy_profile: Array.isArray(buddy.buddy_profile)
          ? buddy.buddy_profile[0]
          : buddy.buddy_profile
      }));

      set({
        buddies: transformedBuddies as BuddyWithProfile[],
        pendingRequests: transformedPending as BuddyWithProfile[],
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load buddies';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'load_buddies' },
      });
      set({ error: message, loading: false });
    }
  },

  /**
   * Send a buddy request by email
   */
  sendBuddyRequest: async (buddyEmail: string) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Sending buddy request',
        level: 'info',
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find user by email
      const { data: buddyProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', buddyEmail.toLowerCase().trim())
        .single();

      if (profileError || !buddyProfile) {
        throw new Error('User not found with that email');
      }

      // Check if trying to add self
      if (buddyProfile.id === user.id) {
        throw new Error('You cannot add yourself as a buddy');
      }

      // Check if buddy relationship already exists
      const { data: existing } = await supabase
        .from('buddies')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},buddy_id.eq.${buddyProfile.id}),and(user_id.eq.${buddyProfile.id},buddy_id.eq.${user.id})`)
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          throw new Error('You are already buddies with this user');
        } else if (existing.status === 'pending') {
          throw new Error('A buddy request is already pending');
        }
      }

      // Create buddy request
      const { error: insertError } = await supabase
        .from('buddies')
        .insert({
          user_id: user.id,
          buddy_id: buddyProfile.id,
          status: 'pending' as BuddyStatus,
        });

      if (insertError) throw insertError;

      set({ loading: false });
      
      // Reload buddies to show updated state
      await get().loadBuddies(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send buddy request';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'send_buddy_request' },
      });
      set({ error: message, loading: false });
      throw error; // Re-throw so UI can handle it
    }
  },

  /**
   * Accept a buddy request
   */
  acceptBuddyRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Accepting buddy request',
        level: 'info',
      });

      const { error } = await supabase
        .from('buddies')
        .update({ status: 'accepted' as BuddyStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      // Get current user and reload
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await get().loadBuddies(user.id);
      }

      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept buddy request';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'accept_buddy_request' },
      });
      set({ error: message, loading: false });
    }
  },

  /**
   * Decline a buddy request
   */
  declineBuddyRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Declining buddy request',
        level: 'info',
      });

      const { error } = await supabase
        .from('buddies')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      // Get current user and reload
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await get().loadBuddies(user.id);
      }

      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline buddy request';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'decline_buddy_request' },
      });
      set({ error: message, loading: false });
    }
  },

  /**
   * Remove a buddy connection
   */
  removeBuddy: async (buddyId: string) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Removing buddy',
        level: 'info',
      });

      const { error } = await supabase
        .from('buddies')
        .delete()
        .eq('id', buddyId);

      if (error) throw error;

      // Get current user and reload
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await get().loadBuddies(user.id);
      }

      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove buddy';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'remove_buddy' },
      });
      set({ error: message, loading: false });
    }
  },

  /**
   * Load activity feed (RLS automatically filters by visibility)
   */
  loadActivityFeed: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Loading activity feed',
        level: 'info',
      });

      // Query activity feed with user profiles and kudos counts
      // RLS policies automatically filter based on visibility and buddy relationships
      const { data: activities, error: activitiesError } = await supabase
        .from('activity_feed')
        .select(`
          id,
          user_id,
          activity_type,
          activity_data,
          visibility,
          created_at,
          user_profile:profiles!activity_feed_user_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;

      // For each activity, get kudos count and check if current user gave kudos
      const activitiesWithKudos = await Promise.all(
        (activities || []).map(async (activity) => {
          // Get kudos count
          const { count, error: countError } = await supabase
            .from('kudos')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activity.id);

          // Check if current user gave kudos
          const { data: userKudos, error: userKudosError } = await supabase
            .from('kudos')
            .select('id')
            .eq('activity_id', activity.id)
            .eq('user_id', userId)
            .single();

          // Transform user_profile from array to single object (Supabase joins return arrays)
          const transformedActivity = {
            ...activity,
            user_profile: Array.isArray(activity.user_profile)
              ? activity.user_profile[0]
              : activity.user_profile,
            kudos_count: count || 0,
            user_gave_kudos: !!userKudos,
          };

          return transformedActivity as ActivityFeedItemWithDetails;
        })
      );

      set({
        activityFeed: activitiesWithKudos,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load activity feed';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'load_activity_feed' },
      });
      set({ error: message, loading: false });
    }
  },

  /**
   * Post a new activity to the feed
   */
  postActivity: async (userId: string, data: CreateActivityData) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: `Posting ${data.activity_type} activity`,
        level: 'info',
      });

      const { error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: userId,
          activity_type: data.activity_type,
          activity_data: data.activity_data,
          visibility: data.visibility,
        });

      if (error) throw error;

      // Reload feed to show new activity
      await get().loadActivityFeed(userId);

      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to post activity';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'post_activity' },
      });
      set({ error: message, loading: false });
      throw error; // Re-throw so UI can handle it
    }
  },

  /**
   * Delete an activity from the feed
   */
  deleteActivity: async (activityId: string) => {
    try {
      set({ loading: true, error: null });
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Deleting activity',
        level: 'info',
      });

      const { error } = await supabase
        .from('activity_feed')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      // Remove from local state immediately
      set((state) => ({
        activityFeed: state.activityFeed.filter((a) => a.id !== activityId),
        loading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete activity';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'delete_activity' },
      });
      set({ error: message, loading: false });
    }
  },

  /**
   * Give kudos to an activity
   */
  giveKudos: async (activityId: string, userId: string) => {
    try {
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Giving kudos',
        level: 'info',
      });

      // Optimistically update UI
      set((state) => ({
        activityFeed: state.activityFeed.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                kudos_count: activity.kudos_count + 1,
                user_gave_kudos: true,
              }
            : activity
        ),
      }));

      const { error } = await supabase
        .from('kudos')
        .insert({
          activity_id: activityId,
          user_id: userId,
        });

      if (error) {
        // Revert optimistic update on error
        set((state) => ({
          activityFeed: state.activityFeed.map((activity) =>
            activity.id === activityId
              ? {
                  ...activity,
                  kudos_count: activity.kudos_count - 1,
                  user_gave_kudos: false,
                }
              : activity
          ),
        }));
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to give kudos';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'give_kudos' },
      });
      set({ error: message });
    }
  },

  /**
   * Remove kudos from an activity
   */
  removeKudos: async (activityId: string, userId: string) => {
    try {
      Sentry.addBreadcrumb({
        category: 'social',
        message: 'Removing kudos',
        level: 'info',
      });

      // Optimistically update UI
      set((state) => ({
        activityFeed: state.activityFeed.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                kudos_count: Math.max(0, activity.kudos_count - 1),
                user_gave_kudos: false,
              }
            : activity
        ),
      }));

      const { error } = await supabase
        .from('kudos')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', userId);

      if (error) {
        // Revert optimistic update on error
        set((state) => ({
          activityFeed: state.activityFeed.map((activity) =>
            activity.id === activityId
              ? {
                  ...activity,
                  kudos_count: activity.kudos_count + 1,
                  user_gave_kudos: true,
                }
              : activity
          ),
        }));
        throw error;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove kudos';
      Sentry.captureException(error, {
        tags: { feature: 'social', action: 'remove_kudos' },
      });
      set({ error: message });
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set({
      buddies: [],
      pendingRequests: [],
      activityFeed: [],
      loading: false,
      error: null,
    });
  },
}));

