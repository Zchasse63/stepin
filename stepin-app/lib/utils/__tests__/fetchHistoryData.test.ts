/**
 * Unit tests for fetchHistoryData utility functions
 * Tests data fetching for history screen
 */

import {
  fetchWalks,
  fetchDailyStats,
  fetchStreak,
  fetchWalksPaginated,
  fetchHistoryData,
  fetchWalksForDate,
  fetchDailyStatsForDate,
} from '../fetchHistoryData';
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

describe('fetchHistoryData', () => {
  const userId = 'user-123';
  const dateRange = {
    startDate: new Date('2025-10-01'),
    endDate: new Date('2025-10-09'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWalks', () => {
    it('should successfully fetch walks for date range', async () => {
      const mockWalks = [
        { id: 'walk-1', user_id: userId, date: '2025-10-01', steps: 5000 },
        { id: 'walk-2', user_id: userId, date: '2025-10-02', steps: 6000 },
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockWalks,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchWalks(userId, dateRange);

      expect(result).toEqual(mockWalks);
      expect(chain.eq).toHaveBeenCalledWith('user_id', userId);
      expect(chain.gte).toHaveBeenCalled();
      expect(chain.lte).toHaveBeenCalled();
      expect(chain.order).toHaveBeenCalledWith('date', { ascending: false });
    });

    it('should throw error on fetch failure', async () => {
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

      await expect(fetchWalks(userId, dateRange)).rejects.toThrow('Failed to fetch walks');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return empty array when no walks found', async () => {
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

      const result = await fetchWalks(userId, dateRange);

      expect(result).toEqual([]);
    });
  });

  describe('fetchDailyStats', () => {
    it('should successfully fetch daily stats for date range', async () => {
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

      const result = await fetchDailyStats(userId, dateRange);

      expect(result).toEqual(mockStats);
      expect(chain.eq).toHaveBeenCalledWith('user_id', userId);
      expect(chain.gte).toHaveBeenCalled();
      expect(chain.lte).toHaveBeenCalled();
      expect(chain.order).toHaveBeenCalledWith('date', { ascending: true });
    });

    it('should throw error on fetch failure', async () => {
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

      await expect(fetchDailyStats(userId, dateRange)).rejects.toThrow('Failed to fetch daily stats');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('fetchStreak', () => {
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

      const result = await fetchStreak(userId);

      expect(result).toEqual(mockStreak);
      expect(chain.eq).toHaveBeenCalledWith('user_id', userId);
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

      const result = await fetchStreak(userId);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('fetchWalksPaginated', () => {
    it('should fetch paginated walks with correct range', async () => {
      const mockWalks = [
        { id: 'walk-1', user_id: userId, date: '2025-10-01', steps: 5000 },
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockWalks,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchWalksPaginated(userId, dateRange, 0, 10);

      expect(result.walks).toEqual(mockWalks);
      expect(result.hasMore).toBe(false);
      expect(chain.range).toHaveBeenCalledWith(0, 9); // page 0, pageSize 10 = range(0, 9)
    });

    it('should calculate correct range for page 2', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      await fetchWalksPaginated(userId, dateRange, 2, 10);

      expect(chain.range).toHaveBeenCalledWith(20, 29); // page 2, pageSize 10 = range(20, 29)
    });

    it('should throw error on fetch failure', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchWalksPaginated(userId, dateRange, 0, 10)).rejects.toThrow('Failed to fetch walks');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('fetchWalksForDate', () => {
    it('should fetch walks for specific date', async () => {
      const date = '2025-10-09';
      const mockWalks = [
        { id: 'walk-1', user_id: userId, date, steps: 5000 },
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockWalks,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await fetchWalksForDate(userId, date);

      expect(result).toEqual(mockWalks);
      const eqCalls = chain.eq.mock.calls;
      expect(eqCalls[0]).toEqual(['user_id', userId]);
      expect(eqCalls[1]).toEqual(['date', date]);
    });

    it('should throw error on fetch failure', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchWalksForDate(userId, '2025-10-09')).rejects.toThrow('Failed to fetch walks');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('fetchDailyStatsForDate', () => {
    it('should fetch daily stats for specific date', async () => {
      const date = '2025-10-09';
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

      const result = await fetchDailyStatsForDate(userId, date);

      expect(result).toEqual(mockStats);
      const eqCalls = chain.eq.mock.calls;
      expect(eqCalls[0]).toEqual(['user_id', userId]);
      expect(eqCalls[1]).toEqual(['date', date]);
    });

    it('should throw error on fetch failure', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      await expect(fetchDailyStatsForDate(userId, '2025-10-09')).rejects.toThrow('Failed to fetch daily stats');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('fetchHistoryData', () => {
    it('should fetch complete history data with summary stats', async () => {
      const mockWalks = [
        { id: 'walk-1', user_id: userId, date: '2025-10-01', steps: 5000, distance: 4000 },
        { id: 'walk-2', user_id: userId, date: '2025-10-02', steps: 6000, distance: 5000 },
      ];

      const mockStats = [
        { user_id: userId, date: '2025-10-01', total_steps: 7000, goal_met: true },
        { user_id: userId, date: '2025-10-02', total_steps: 8000, goal_met: true },
      ];

      // Mock walks fetch
      const walksChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockWalks,
          error: null,
        }),
      };

      // Mock stats fetch
      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockStats,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(walksChain)
        .mockReturnValueOnce(statsChain);

      const result = await fetchHistoryData(userId, dateRange, 7000);

      expect(result.walks).toEqual(mockWalks);
      expect(result.dailyStats).toEqual(mockStats);
      expect(result.totalSteps).toBe(15000); // 7000 + 8000 from stats
      expect(result.totalWalks).toBe(2);
      expect(result.daysGoalMet).toBe(2);
      expect(result.goalMetPercentage).toBe(100);
    });

    it('should throw error when stats fetch fails', async () => {
      // Mock walks fetch - success
      const walksChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      // Mock stats fetch - error
      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Stats error'),
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(walksChain)
        .mockReturnValueOnce(statsChain);

      await expect(fetchHistoryData(userId, dateRange, 7000)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should calculate summary stats correctly', async () => {
      const mockWalks = [
        { id: 'walk-1', user_id: userId, date: '2025-10-01', steps: 5000, distance: 4000, duration: 3600 },
        { id: 'walk-2', user_id: userId, date: '2025-10-02', steps: 6000, distance: 5000, duration: 4000 },
        { id: 'walk-3', user_id: userId, date: '2025-10-03', steps: 7000, distance: 6000, duration: 5000 },
      ];

      const mockStats = [
        { user_id: userId, date: '2025-10-01', total_steps: 5000, goal_met: false },
        { user_id: userId, date: '2025-10-02', total_steps: 6000, goal_met: true },
        { user_id: userId, date: '2025-10-03', total_steps: 7000, goal_met: true },
      ];

      const walksChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockWalks,
          error: null,
        }),
      };

      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockStats,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(walksChain)
        .mockReturnValueOnce(statsChain);

      const result = await fetchHistoryData(userId, dateRange, 7000);

      expect(result.totalSteps).toBe(18000); // 5000 + 6000 + 7000
      expect(result.totalWalks).toBe(3);
      expect(result.averageSteps).toBe(6000); // 18000 / 3
      expect(result.daysGoalMet).toBe(2); // 2 out of 3 days
      expect(result.goalMetPercentage).toBe(67); // 2/3 * 100 = 66.67 rounded to 67
    });
  });
});

