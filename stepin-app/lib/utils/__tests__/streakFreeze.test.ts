/**
 * Unit tests for streakFreeze utility functions
 * Tests streak freeze earning, usage, validation, and eligibility checks
 */

import {
  getStreakFreezeStatus,
  earnStreakFreeze,
  useStreakFreeze,
  canUseFreezeForDate,
  getFreezableDate,
  StreakFreezeStatus,
} from '../streakFreeze';
import { supabase } from '../../supabase/client';
import { logger } from '../logger';
import * as Sentry from '@sentry/react-native';

// Mock dependencies
jest.mock('../../supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('streakFreeze', () => {
  const userId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStreakFreezeStatus', () => {
    it('should return status with available freezes', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            streak_freezes_available: 2,
            last_freeze_earned_date: '2025-10-01',
            last_freeze_used_date: '2025-09-15',
          },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 14 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await getStreakFreezeStatus(userId);

      expect(result.available).toBe(2);
      expect(result.maxAllowed).toBe(3);
      expect(result.canEarn).toBe(true); // At 14-day milestone
      expect(result.nextEarnAt).toBe(21);
      expect(result.lastEarnedDate).toBe('2025-10-01');
      expect(result.lastUsedDate).toBe('2025-09-15');
    });

    it('should calculate canEarn correctly at 7-day milestone', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 1 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 7 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await getStreakFreezeStatus(userId);

      expect(result.canEarn).toBe(true);
      expect(result.nextEarnAt).toBe(14);
    });

    it('should not allow earning when at max freezes', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 3 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 14 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await getStreakFreezeStatus(userId);

      expect(result.available).toBe(3);
      expect(result.canEarn).toBe(false); // At max
    });

    it('should not allow earning when not at milestone', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 1 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await getStreakFreezeStatus(userId);

      expect(result.canEarn).toBe(false);
      expect(result.nextEarnAt).toBe(7);
    });

    it('should handle zero streak', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 0 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 0 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await getStreakFreezeStatus(userId);

      expect(result.canEarn).toBe(false);
      expect(result.nextEarnAt).toBe(7);
    });

    it('should return default status on error', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(profileChain);

      const result = await getStreakFreezeStatus(userId);

      expect(result.available).toBe(0);
      expect(result.maxAllowed).toBe(3);
      expect(result.canEarn).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle exception gracefully', async () => {
      const error = new Error('Unexpected error');
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const result = await getStreakFreezeStatus(userId);

      expect(result.available).toBe(0);
      expect(result.canEarn).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error in getStreakFreezeStatus:', error);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('earnStreakFreeze', () => {
    it('should successfully earn a freeze', async () => {
      // Mock getStreakFreezeStatus
      const profileChain1 = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 1 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 7 },
          error: null,
        }),
      };

      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain1)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(updateChain);

      const result = await earnStreakFreeze(userId);

      expect(result.success).toBe(true);
      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          streak_freezes_available: 2,
          last_freeze_earned_date: expect.any(String),
        })
      );
      expect(logger.info).toHaveBeenCalledWith('Streak freeze earned', {
        userId,
        newTotal: 2,
      });
    });

    it('should fail when already at max freezes', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 3 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 14 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await earnStreakFreeze(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already at maximum streak freezes');
    });

    it('should fail when not eligible', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 1 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await earnStreakFreeze(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not eligible to earn a freeze yet');
    });

    it('should handle database error', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 1 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 7 },
          error: null,
        }),
      };

      const updateError = new Error('Update failed');
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: updateError }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(updateChain);

      const result = await earnStreakFreeze(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('useStreakFreeze', () => {
    const date = '2025-10-09';

    it('should successfully use a freeze', async () => {
      // Mock getStreakFreezeStatus
      const profileChain1 = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 2 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      // Check if freeze already used
      const statsChain1 = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freeze_used: false },
          error: null,
        }),
      };

      // Update profile
      const profileUpdateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Upsert daily stats
      const statsUpsertChain = {
        upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain1)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(statsChain1)
        .mockReturnValueOnce(profileUpdateChain)
        .mockReturnValueOnce(statsUpsertChain);

      const result = await useStreakFreeze(userId, date);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Streak freeze used', {
        userId,
        date,
        remaining: 1,
      });
    });

    it('should fail when no freezes available', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 0 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await useStreakFreeze(userId, date);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No streak freezes available');
    });

    it('should fail when freeze already used on date', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 2 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freeze_used: true },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(statsChain);

      const result = await useStreakFreeze(userId, date);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Freeze already used on this date');
    });

    it('should rollback on stats update error', async () => {
      const profileChain1 = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 2 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      const statsChain1 = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freeze_used: false },
          error: null,
        }),
      };

      const profileUpdateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const statsError = new Error('Stats update failed');
      const statsUpsertChain = {
        upsert: jest.fn().mockResolvedValue({ data: null, error: statsError }),
      };

      const rollbackChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain1)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(statsChain1)
        .mockReturnValueOnce(profileUpdateChain)
        .mockReturnValueOnce(statsUpsertChain)
        .mockReturnValueOnce(rollbackChain);

      const result = await useStreakFreeze(userId, date);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stats update failed');
      expect(rollbackChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          streak_freezes_available: 2, // Rolled back to original
        })
      );
    });
  });

  describe('canUseFreezeForDate', () => {
    const date = '2025-10-09';

    it('should return true when freeze can be used', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 2 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freeze_used: false, goal_met: false },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(statsChain);

      const result = await canUseFreezeForDate(userId, date);

      expect(result.canUse).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return false when no freezes available', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 0 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await canUseFreezeForDate(userId, date);

      expect(result.canUse).toBe(false);
      expect(result.reason).toBe('No freezes available');
    });

    it('should return false for future dates', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 2 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain);

      const result = await canUseFreezeForDate(userId, futureDateStr);

      expect(result.canUse).toBe(false);
      expect(result.reason).toBe('Cannot use freeze for future dates');
    });

    it('should return false when freeze already used', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 2 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freeze_used: true, goal_met: false },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(statsChain);

      const result = await canUseFreezeForDate(userId, date);

      expect(result.canUse).toBe(false);
      expect(result.reason).toBe('Freeze already used on this date');
    });

    it('should return false when goal already met', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freezes_available: 2 },
          error: null,
        }),
      };

      const streakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { current_streak: 5 },
          error: null,
        }),
      };

      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { streak_freeze_used: false, goal_met: true },
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(streakChain)
        .mockReturnValueOnce(statsChain);

      const result = await canUseFreezeForDate(userId, date);

      expect(result.canUse).toBe(false);
      expect(result.reason).toBe('Goal already met on this date');
    });
  });

  describe('getFreezableDate', () => {
    it('should return yesterday when goal was missed', async () => {
      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { goal_met: false, streak_freeze_used: false },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(statsChain);

      const result = await getFreezableDate(userId);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expectedDate = yesterday.toISOString().split('T')[0];

      expect(result).toBe(expectedDate);
    });

    it('should return yesterday when no stats exist', async () => {
      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(statsChain);

      const result = await getFreezableDate(userId);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expectedDate = yesterday.toISOString().split('T')[0];

      expect(result).toBe(expectedDate);
    });

    it('should return null when goal was met', async () => {
      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { goal_met: true, streak_freeze_used: false },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(statsChain);

      const result = await getFreezableDate(userId);

      expect(result).toBeNull();
    });

    it('should return null when freeze already used', async () => {
      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { goal_met: false, streak_freeze_used: true },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(statsChain);

      const result = await getFreezableDate(userId);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      (supabase.from as jest.Mock).mockReturnValue(statsChain);

      const result = await getFreezableDate(userId);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

