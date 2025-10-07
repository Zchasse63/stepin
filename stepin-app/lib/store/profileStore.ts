/**
 * Profile store using Zustand
 * Manages user profile data, settings, and preferences
 */

import { create } from 'zustand';
import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';
import type {
  UserProfile,
  UserStats,
  NotificationSettings,
  UnitsPreference,
  ThemePreference,
  NotificationIdentifiers,
} from '../../types/profile';

interface ProfileState {
  // State
  profile: UserProfile | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  notificationIds: NotificationIdentifiers;

  // Actions
  loadProfile: () => Promise<void>;
  loadStats: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  updateUnits: (units: UnitsPreference) => Promise<void>;
  updateTheme: (theme: ThemePreference) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  setNotificationId: (type: keyof NotificationIdentifiers, id: string | null) => void;
  clearProfile: () => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  stats: null,
  loading: false,
  error: null,
  notificationIds: {
    dailyReminder: null,
    streakReminder: null,
    goalCelebration: null,
  },

  // Load user profile from Supabase
  loadProfile: async () => {
    try {
      set({ loading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No authenticated user - this is expected during initial load
        set({ loading: false });
        return;
      }

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
        // Phase 10: Ensure weather and audio preferences have defaults
        weather_alerts_enabled: data.weather_alerts_enabled ?? false,
        preferred_walk_time: data.preferred_walk_time || 'morning',
        location_coordinates: data.location_coordinates || null,
        audio_coaching_enabled: data.audio_coaching_enabled ?? false,
        audio_coaching_interval: data.audio_coaching_interval || 300,
      };

      set({ profile, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load profile',
        loading: false,
      });
      throw error;
    }
  },

  // Load user stats (total steps, walks, streak)
  loadStats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No authenticated user - this is expected during initial load
        return;
      }

      // Get total steps and walks
      const { data: walks, error: walksError } = await supabase
        .from('walks')
        .select('steps')
        .eq('user_id', user.id);

      if (walksError) throw walksError;

      const totalSteps = walks?.reduce((sum, walk) => sum + walk.steps, 0) || 0;
      const totalWalks = walks?.length || 0;

      // Get current streak
      const { data: streak, error: streakError } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      if (streakError) throw streakError;

      // Get member since date from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const stats: UserStats = {
        totalSteps,
        totalWalks,
        memberSince: profile.created_at,
        currentStreak: streak?.current_streak || 0,
      };

      set({ stats });
    } catch (error: any) {
      logger.error('Failed to load stats:', error);
      // Don't set error state for stats loading failure
    }
  },

  // Update profile in Supabase
  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      set({ loading: true, error: null });

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

      // Update local state
      const currentProfile = get().profile;
      if (currentProfile) {
        set({
          profile: { ...currentProfile, ...updates },
          loading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update profile',
        loading: false,
      });
      throw error;
    }
  },

  // Update daily step goal
  updateGoal: async (goal: number) => {
    await get().updateProfile({ daily_step_goal: goal });
  },

  // Update units preference
  updateUnits: async (units: UnitsPreference) => {
    await get().updateProfile({ units_preference: units });
  },

  // Update theme preference
  updateTheme: async (theme: ThemePreference) => {
    await get().updateProfile({ theme_preference: theme });
  },

  // Update notification settings
  updateNotificationSettings: async (settings: NotificationSettings) => {
    await get().updateProfile({ notification_settings: settings });
  },

  // Set notification ID for tracking scheduled notifications
  setNotificationId: (type: keyof NotificationIdentifiers, id: string | null) => {
    set((state) => ({
      notificationIds: {
        ...state.notificationIds,
        [type]: id,
      },
    }));
  },

  // Clear profile data (on sign out)
  clearProfile: () => {
    set({
      profile: null,
      stats: null,
      loading: false,
      error: null,
      notificationIds: {
        dailyReminder: null,
        streakReminder: null,
        goalCelebration: null,
      },
    });
  },

  // Clear error message
  clearError: () => set({ error: null }),
}));

