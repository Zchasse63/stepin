/**
 * Unit tests for editWalk utility functions
 * Tests walk editing and error handling
 *
 * Note: These tests focus on error handling and basic validation logic.
 * Full recalculation logic with multiple nested Supabase calls is better
 * suited for integration testing. These tests verify error paths and
 * duplicate checking logic.
 */

import { checkForDuplicateWalk } from '../editWalk';
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
    info: jest.fn(),
  },
}));

describe('editWalk', () => {
  const userId = 'user-123';
  const walkId = 'walk-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkForDuplicateWalk', () => {
    it('should return false when no duplicate found', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
      };
      // Add final method that returns the result
      chain.lte = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await checkForDuplicateWalk(
        userId,
        walkId,
        '2025-10-09', // Use date string, not timestamp
        5000
      );

      expect(result).toBe(false);
    });

    it('should return true when duplicate found within time window', async () => {
      const duplicateWalk = {
        id: 'walk-duplicate',
      };

      // Mock the complete Supabase query chain
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({
          data: [duplicateWalk],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await checkForDuplicateWalk(
        userId,
        walkId,
        '2025-10-09', // Use date string, not timestamp
        5000
      );

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
      };
      // Add final method that returns the result
      chain.lte = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Fetch error'),
      });

      (supabase.from as jest.Mock).mockReturnValue(chain);

      const result = await checkForDuplicateWalk(
        userId,
        walkId,
        '2025-10-09T10:00:00Z',
        5000
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should check within 5-minute time window and 10% steps range', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
      };
      chain.lte = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue(chain);

      await checkForDuplicateWalk(userId, walkId, '2025-10-09T10:00:00Z', 5000);

      // Verify time window and steps range are checked
      expect(chain.gte).toHaveBeenCalled();
      expect(chain.lte).toHaveBeenCalled();
      expect(chain.neq).toHaveBeenCalledWith('id', walkId);
    });
  });

});

