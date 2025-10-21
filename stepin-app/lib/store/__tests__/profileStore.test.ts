/**
 * Unit tests for profileStore
 * Tests profile state management and actions
 */

import { useProfileStore } from '../profileStore';
import { supabase } from '../../supabase/client';
import type { UserProfile, UserStats, NotificationSettings } from '../../../types/profile';

// Mock Supabase client
jest.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('profileStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useProfileStore.setState({
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
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useProfileStore.getState();
      
      expect(state.profile).toBeNull();
      expect(state.stats).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.notificationIds).toEqual({
        dailyReminder: null,
        streakReminder: null,
        goalCelebration: null,
      });
    });
  });

  describe('loadProfile', () => {
    it('should load profile successfully', async () => {
      const mockUser = { id: 'user-123' };
      const mockProfile = {
        id: 'user-123',
        display_name: 'Test User',
        daily_step_goal: 10000,
        units_preference: 'miles',
        theme_preference: 'light',
        notification_settings: {
          dailyReminder: true,
          streakReminder: true,
          goalCelebration: true,
          reminderTime: '09:00',
        },
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { loadProfile } = useProfileStore.getState();
      await loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toBeDefined();
      expect(state.profile?.id).toBe('user-123');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle no authenticated user', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const { loadProfile } = useProfileStore.getState();
      await loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.loading).toBe(false);
    });

    it('should handle load profile error', async () => {
      const mockUser = { id: 'user-123' };
      const mockError = { message: 'Profile not found' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const { loadProfile } = useProfileStore.getState();

      await expect(loadProfile()).rejects.toEqual(mockError);

      const state = useProfileStore.getState();
      expect(state.error).toBe('Profile not found');
      expect(state.loading).toBe(false);
    });
  });

  describe('loadStats', () => {
    it('should load stats successfully', async () => {
      const mockUser = { id: 'user-123' };
      const mockWalks = [
        { steps: 5000 },
        { steps: 7000 },
        { steps: 3000 },
      ];
      const mockStreak = { current_streak: 5 };
      const mockProfile = { created_at: '2025-01-01T00:00:00Z' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockWalks,
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockStreak,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        });

      const { loadStats } = useProfileStore.getState();
      await loadStats();

      const state = useProfileStore.getState();
      expect(state.stats).toBeDefined();
      expect(state.stats?.totalSteps).toBe(15000);
      expect(state.stats?.totalWalks).toBe(3);
      expect(state.stats?.currentStreak).toBe(5);
    });

    it('should handle no authenticated user', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const { loadStats } = useProfileStore.getState();
      await loadStats();

      const state = useProfileStore.getState();
      expect(state.stats).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockUser = { id: 'user-123' };
      const initialProfile: UserProfile = {
        id: 'user-123',
        display_name: 'Test User',
        daily_step_goal: 10000,
        units_preference: 'miles',
        theme_preference: 'light',
        notification_settings: {
          dailyReminder: false,
          streakReminder: false,
          goalCelebration: false,
          reminderTime: '09:00',
        },
        weather_alerts_enabled: false,
        preferred_walk_time: 'morning',
        location_coordinates: null,
        audio_coaching_enabled: false,
        audio_coaching_interval: 300,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      useProfileStore.setState({ profile: initialProfile });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const { updateProfile } = useProfileStore.getState();
      await updateProfile({ display_name: 'Updated Name' });

      const state = useProfileStore.getState();
      expect(state.profile?.display_name).toBe('Updated Name');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle update error', async () => {
      const mockUser = { id: 'user-123' };
      const mockError = { message: 'Update failed' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: mockError,
          }),
        }),
      });

      const { updateProfile } = useProfileStore.getState();

      await expect(updateProfile({ display_name: 'New Name' })).rejects.toEqual(mockError);

      const state = useProfileStore.getState();
      expect(state.error).toBe('Update failed');
      expect(state.loading).toBe(false);
    });
  });

  describe('updateGoal', () => {
    it('should update daily step goal', async () => {
      const mockUser = { id: 'user-123' };
      const initialProfile: UserProfile = {
        id: 'user-123',
        display_name: 'Test User',
        daily_step_goal: 10000,
      } as UserProfile;

      useProfileStore.setState({ profile: initialProfile });

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const { updateGoal } = useProfileStore.getState();
      await updateGoal(12000);

      const state = useProfileStore.getState();
      expect(state.profile?.daily_step_goal).toBe(12000);
    });
  });

  describe('setNotificationId', () => {
    it('should set notification ID', () => {
      const { setNotificationId } = useProfileStore.getState();
      
      setNotificationId('dailyReminder', 'notification-123');
      
      const state = useProfileStore.getState();
      expect(state.notificationIds.dailyReminder).toBe('notification-123');
    });

    it('should clear notification ID when set to null', () => {
      useProfileStore.setState({
        notificationIds: {
          dailyReminder: 'notification-123',
          streakReminder: null,
          goalCelebration: null,
        },
      });
      
      const { setNotificationId } = useProfileStore.getState();
      setNotificationId('dailyReminder', null);
      
      const state = useProfileStore.getState();
      expect(state.notificationIds.dailyReminder).toBeNull();
    });
  });

  describe('clearProfile', () => {
    it('should clear all profile data', () => {
      useProfileStore.setState({
        profile: { id: 'user-123' } as UserProfile,
        stats: { totalSteps: 50000 } as UserStats,
        loading: true,
        error: 'Some error',
        notificationIds: {
          dailyReminder: 'notification-123',
          streakReminder: 'notification-456',
          goalCelebration: 'notification-789',
        },
      });
      
      const { clearProfile } = useProfileStore.getState();
      clearProfile();
      
      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.stats).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.notificationIds).toEqual({
        dailyReminder: null,
        streakReminder: null,
        goalCelebration: null,
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useProfileStore.setState({ error: 'Some error' });
      
      const { clearError } = useProfileStore.getState();
      clearError();
      
      const state = useProfileStore.getState();
      expect(state.error).toBeNull();
    });
  });
});

