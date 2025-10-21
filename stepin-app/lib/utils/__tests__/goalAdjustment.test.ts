/**
 * Unit tests for goalAdjustment utility functions
 * Tests adaptive goal suggestion logic, trend analysis, and eligibility checks
 */

import {
  analyzeAndSuggestGoal,
  shouldShowGoalSuggestion,
  markGoalSuggestionShown,
  GoalSuggestion,
} from '../goalAdjustment';
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

describe('goalAdjustment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeAndSuggestGoal', () => {
    const userId = 'user-123';
    const currentGoal = 10000;

    const mockSupabaseChain = (profileData: any, statsData: any) => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: profileData, error: null }),
      };

      const statsChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: statsData, error: null }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(profileChain)
        .mockReturnValueOnce(statsChain);
    };

    it('should return null when profile fetch fails', async () => {
      const profileChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Profile error') }),
      };
      (supabase.from as jest.Mock).mockReturnValue(profileChain);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching profile for goal analysis:',
        expect.any(Error)
      );
    });

    it('should return null when insufficient data (less than 7 days)', async () => {
      const profileData = { daily_step_goal: currentGoal };
      const statsData = [
        { date: '2025-10-01', total_steps: 8000, goal_met: false },
        { date: '2025-10-02', total_steps: 9000, goal_met: false },
      ];

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('Insufficient data for goal suggestion', {
        userId,
        daysAvailable: 2,
      });
    });

    it('should suggest increasing goal when consistently overachieving', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // 14 days of data, 12 days exceeding goal by 20%+
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: i < 12 ? 12500 : 9000, // 12 days at 12500 (25% over), 2 days at 9000
        goal_met: i < 12,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.reason).toBe('overachieving');
      expect(result?.suggestedGoal).toBeGreaterThan(currentGoal);
      expect(result?.confidence).toBe('high'); // 12/14 = 85.7% consistency
      expect(result?.message).toContain('crushing it');
      expect(result?.analysis.daysAnalyzed).toBe(14);
    });

    it('should suggest decreasing goal when consistently underachieving', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // 14 days of data, 12 days below 80% of goal
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: i < 12 ? 7000 : 10500, // 12 days at 7000 (70% of goal), 2 days at 10500
        goal_met: i >= 12,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.reason).toBe('underachieving');
      expect(result?.suggestedGoal).toBeLessThan(currentGoal);
      expect(result?.suggestedGoal).toBeGreaterThanOrEqual(2000); // Minimum goal
      expect(result?.confidence).toBe('high'); // 12/14 = 85.7% consistency
      expect(result?.message).toContain('too ambitious');
      expect(result?.analysis.goalMetPercentage).toBeLessThan(0.5);
    });

    it('should suggest optimal when goal is appropriate', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // 14 days of balanced performance
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 9000 + (i % 3) * 1000, // Mix of 9000, 10000, 11000
        goal_met: i % 2 === 0, // 50% goal met
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.reason).toBe('optimal');
      expect(result?.suggestedGoal).toBe(currentGoal);
      expect(result?.confidence).toBe('high');
      expect(result?.message).toContain('looks great');
    });

    it('should not suggest change if difference is less than 500 steps', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // Slightly overachieving but not enough to warrant change
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 10200, // Only 200 steps over goal
        goal_met: true,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.suggestedGoal).toBe(currentGoal);
      expect(result?.reason).toBe('optimal');
    });

    it('should calculate correct average steps', async () => {
      const profileData = { daily_step_goal: currentGoal };
      const statsData = [
        { date: '2025-10-01', total_steps: 8000, goal_met: false },
        { date: '2025-10-02', total_steps: 9000, goal_met: false },
        { date: '2025-10-03', total_steps: 10000, goal_met: true },
        { date: '2025-10-04', total_steps: 11000, goal_met: true },
        { date: '2025-10-05', total_steps: 12000, goal_met: true },
        { date: '2025-10-06', total_steps: 9500, goal_met: false },
        { date: '2025-10-07', total_steps: 10500, goal_met: true },
      ];

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      const expectedAverage = Math.round((8000 + 9000 + 10000 + 11000 + 12000 + 9500 + 10500) / 7);
      expect(result?.analysis.averageSteps).toBe(expectedAverage);
    });

    it('should calculate correct goal met percentage', async () => {
      const profileData = { daily_step_goal: currentGoal };
      const statsData = Array.from({ length: 10 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 10000,
        goal_met: i < 7, // 7 out of 10 days met goal
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.analysis.goalMetPercentage).toBe(0.7);
    });

    it('should round suggested goal to nearest 500', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // Create scenario that would suggest 11234 steps
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: i < 12 ? 12000 : 9000,
        goal_met: i < 12,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.suggestedGoal % 500).toBe(0); // Should be divisible by 500
    });

    it('should enforce minimum goal of 2000 steps', async () => {
      const profileData = { daily_step_goal: 3000 }; // Low starting goal
      // Very low performance
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 1500, // Well below goal
        goal_met: false,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.suggestedGoal).toBeGreaterThanOrEqual(2000);
    });

    it('should determine increasing trend correctly', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // Steadily increasing steps
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 8000 + i * 300, // Increasing by 300 per day
        goal_met: i > 5,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.analysis.trend).toBe('increasing');
    });

    it('should determine decreasing trend correctly', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // Steadily decreasing steps
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 12000 - i * 300, // Decreasing by 300 per day
        goal_met: i < 5,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.analysis.trend).toBe('decreasing');
    });

    it('should determine stable trend correctly', async () => {
      const profileData = { daily_step_goal: currentGoal };
      // Relatively stable steps
      const statsData = Array.from({ length: 14 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 9000 + (i % 2) * 100, // Small variations
        goal_met: false,
      }));

      mockSupabaseChain(profileData, statsData);

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).not.toBeNull();
      expect(result?.analysis.trend).toBe('stable');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const result = await analyzeAndSuggestGoal(userId);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Error in analyzeAndSuggestGoal:', error);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should log suggestion details', async () => {
      const profileData = { daily_step_goal: currentGoal };
      const statsData = Array.from({ length: 10 }, (_, i) => ({
        date: `2025-10-${String(i + 1).padStart(2, '0')}`,
        total_steps: 10000,
        goal_met: true,
      }));

      mockSupabaseChain(profileData, statsData);

      await analyzeAndSuggestGoal(userId);

      expect(logger.info).toHaveBeenCalledWith(
        'Goal suggestion generated',
        expect.objectContaining({
          userId,
          currentGoal,
          suggestedGoal: expect.any(Number),
          reason: expect.any(String),
          confidence: expect.any(String),
        })
      );
    });
  });

  describe('shouldShowGoalSuggestion', () => {
    const userId = 'user-123';

    it('should return true when never shown before', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { last_goal_suggestion_date: null }, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await shouldShowGoalSuggestion(userId);

      expect(result).toBe(true);
    });

    it('should return true when 14+ days have passed', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15);
      const pastDateString = pastDate.toISOString().split('T')[0]; // Use date string format

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { last_goal_suggestion_date: pastDateString },
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await shouldShowGoalSuggestion(userId);

      expect(result).toBe(true);
    });

    it('should return false when less than 14 days have passed', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { last_goal_suggestion_date: recentDate.toISOString() },
          error: null,
        }),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await shouldShowGoalSuggestion(userId);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await shouldShowGoalSuggestion(userId);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Error checking goal suggestion eligibility:',
        expect.any(Error)
      );
    });
  });

  describe('markGoalSuggestionShown', () => {
    const userId = 'user-123';

    it('should update last suggestion date', async () => {
      const updateFn = jest.fn().mockResolvedValue({ data: null, error: null });
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: updateFn,
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await markGoalSuggestionShown(userId);

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          last_goal_suggestion_date: expect.any(String),
          updated_at: expect.any(String),
        })
      );
      expect(updateFn).toHaveBeenCalledWith('id', userId);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Update error');
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(error),
      };
      (supabase.from as jest.Mock).mockReturnValue(chain);

      await markGoalSuggestionShown(userId);

      expect(logger.error).toHaveBeenCalledWith('Error marking goal suggestion shown:', error);
    });
  });
});

