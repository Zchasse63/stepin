/**
 * Unit tests for syncDailyStats utility functions
 * Tests daily stats synchronization and fetching
 */

import { syncDailyStats, getDailyStats, getDailyStatsRange } from '../syncDailyStats';
import { supabase } from '../../supabase/client';
import { logger } from '../logger';

// Mock dependencies
jest.mock('../../supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('syncDailyStats', () => {
  const userId = 'user-123';
  const date = '2025-10-09';
  const steps = 8000;
  const stepGoal = 7000;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncDailyStats', () => {
    it('should insert new stats when none exist', async () => {
      // Mock fetch - no existing stats (PGRST116 error)
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found error
        }),
      };

      // Mock insert
      const insertChain = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(insertChain);

      const result = await syncDailyStats({ userId, date, steps, stepGoal });

      expect(result.success).toBe(true);
      expect(insertChain.insert).toHaveBeenCalledWith({
        user_id: userId,
        date,
        total_steps: steps,
        goal_met: true, // 8000 >= 7000
      });
    });

    it('should update existing stats', async () => {
      const existingStats = {
        id: 'stats-123',
        user_id: userId,
        date,
        total_steps: 5000,
        goal_met: false,
      };

      // Mock fetch - existing stats found
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: existingStats,
          error: null,
        }),
      };

      // Mock update
      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(updateChain);

      const result = await syncDailyStats({ userId, date, steps, stepGoal });

      expect(result.success).toBe(true);
      expect(updateChain.update).toHaveBeenCalledWith({
        total_steps: steps,
        goal_met: true,
        updated_at: expect.any(String),
      });
      expect(updateChain.eq).toHaveBeenCalledWith('id', existingStats.id);
    });

    it('should set goal_met to true when steps meet goal', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      const insertChain = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(insertChain);

      await syncDailyStats({ userId, date, steps: 7000, stepGoal: 7000 });

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ goal_met: true })
      );
    });

    it('should set goal_met to false when steps below goal', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      const insertChain = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(insertChain);

      await syncDailyStats({ userId, date, steps: 5000, stepGoal: 7000 });

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ goal_met: false })
      );
    });

    it('should return error when fetch fails with non-PGRST116 error', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'OTHER_ERROR', message: 'Database error' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(fetchChain);

      const result = await syncDailyStats({ userId, date, steps, stepGoal });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return error when update fails', async () => {
      const existingStats = { id: 'stats-123', user_id: userId, date };

      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: existingStats,
          error: null,
        }),
      };

      const updateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(updateChain);

      const result = await syncDailyStats({ userId, date, steps, stepGoal });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });

    it('should return error when insert fails', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      const insertChain = {
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(insertChain);

      const result = await syncDailyStats({ userId, date, steps, stepGoal });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert failed');
    });

    it('should handle unexpected errors gracefully', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await syncDailyStats({ userId, date, steps, stepGoal });

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getDailyStats', () => {
    it('should successfully fetch daily stats', async () => {
      const mockStats = {
        user_id: userId,
        date,
        total_steps: 8000,
        goal_met: true,
      };

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockStats,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDailyStats(userId, date);

      expect(result).toEqual(mockStats);
    });

    it('should return null when stats not found (PGRST116)', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDailyStats(userId, date);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDailyStats(userId, date);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getDailyStatsRange', () => {
    it('should successfully fetch stats for date range', async () => {
      const mockStats = [
        { user_id: userId, date: '2025-10-01', total_steps: 7000, goal_met: true },
        { user_id: userId, date: '2025-10-02', total_steps: 8000, goal_met: true },
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockStats,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDailyStatsRange(userId, '2025-10-01', '2025-10-02');

      expect(result).toEqual(mockStats);
      expect(chain.gte).toHaveBeenCalledWith('date', '2025-10-01');
      expect(chain.lte).toHaveBeenCalledWith('date', '2025-10-02');
      expect(chain.order).toHaveBeenCalledWith('date', { ascending: true });
    });

    it('should return empty array when no stats found', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDailyStatsRange(userId, '2025-10-01', '2025-10-02');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDailyStatsRange(userId, '2025-10-01', '2025-10-02');

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

