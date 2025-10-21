/**
 * Unit tests for profileUtils utility functions
 * Tests profile operations and error handling
 * 
 * Note: These tests focus on error handling and basic profile operations.
 * Complex operations like exportUserData and deleteUserAccountImmediately
 * involve file system operations and are better suited for integration testing.
 */

import { fetchUserProfile, updateUserProfile } from '../profileUtils';
import { supabase } from '../../supabase/client';
import { logger } from '../logger';

// Mock dependencies
jest.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('profileUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserProfile', () => {
    it('should successfully fetch user profile with default notification settings', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        daily_step_goal: 7000,
        created_at: '2025-01-01T00:00:00Z',
        notification_settings: null,
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchUserProfile();

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
      expect(result.notification_settings).toEqual({
        dailyReminder: false,
        streakReminder: false,
        goalCelebration: false,
        reminderTime: '09:00',
      });
      expect(chain.eq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should throw error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(fetchUserProfile()).rejects.toThrow('No authenticated user');
    });

    it('should throw error when profile fetch fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchUserProfile()).rejects.toThrow('Fetch error');
    });
  });

  describe('updateUserProfile', () => {
    it('should successfully update user profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const updates = {
        daily_step_goal: 8000,
        name: 'Test User',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(updateChain);

      await updateUserProfile(updates);

      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updates,
          updated_at: expect.any(String),
        })
      );
      expect(updateChain.eq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should throw error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(updateUserProfile({ daily_step_goal: 8000 })).rejects.toThrow('No authenticated user');
    });

    it('should throw error when update fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Update failed'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(updateChain);

      await expect(updateUserProfile({ daily_step_goal: 8000 })).rejects.toThrow('Update failed');
    });

    it('should include updated_at timestamp', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(updateChain);

      await updateUserProfile({ daily_step_goal: 8000 });

      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });
  });
});

