/**
 * Unit tests for updateStreak utility functions
 * Tests streak update RPC calls and streak fetching
 */

import { updateStreak, getStreak } from '../updateStreak';
import { supabase } from '../../supabase/client';
import { logger } from '../logger';

// Mock dependencies
jest.mock('../../supabase/client', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('updateStreak', () => {
  const userId = 'user-123';
  const date = '2025-10-09';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStreak', () => {
    it('should successfully update streak via RPC', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await updateStreak(userId, date);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(supabase.rpc).toHaveBeenCalledWith('update_streak', {
        user_uuid: userId,
        activity_date: date,
      });
    });

    it('should return error when RPC call fails', async () => {
      const error = new Error('RPC error');
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      const result = await updateStreak(userId, date);

      expect(result.success).toBe(false);
      expect(result.error).toBe('RPC error');
      expect(logger.error).toHaveBeenCalledWith('Error updating streak:', error);
    });

    it('should handle unexpected errors gracefully', async () => {
      (supabase.rpc as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      const result = await updateStreak(userId, date);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(logger.error).toHaveBeenCalledWith('Error updating streak:', expect.any(Error));
    });

    it('should call RPC with correct parameter names', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await updateStreak(userId, date);

      const rpcCall = (supabase.rpc as jest.Mock).mock.calls[0];
      expect(rpcCall[0]).toBe('update_streak');
      expect(rpcCall[1]).toEqual({
        user_uuid: userId,
        activity_date: date,
      });
    });
  });

  describe('getStreak', () => {
    it('should successfully fetch streak data', async () => {
      const mockStreak = {
        user_id: userId,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: '2025-10-09',
      };

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockStreak,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getStreak(userId);

      expect(result).toEqual(mockStreak);
      expect(supabase.from).toHaveBeenCalledWith('streaks');
      expect(chain.select).toHaveBeenCalledWith('*');
      expect(chain.eq).toHaveBeenCalledWith('user_id', userId);
      expect(chain.single).toHaveBeenCalled();
    });

    it('should return null when streak fetch fails', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getStreak(userId);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Error fetching streak:', expect.any(Error));
    });

    it('should return null when no streak exists', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getStreak(userId);

      expect(result).toBeNull();
    });

    it('should handle unexpected errors gracefully', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await getStreak(userId);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Error fetching streak:', expect.any(Error));
    });

    it('should fetch all streak fields', async () => {
      const mockStreak = {
        user_id: userId,
        current_streak: 7,
        longest_streak: 15,
        last_activity_date: '2025-10-09',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-10-09T12:00:00Z',
      };

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockStreak,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getStreak(userId);

      expect(result).toEqual(mockStreak);
      expect(chain.select).toHaveBeenCalledWith('*');
    });
  });
});

