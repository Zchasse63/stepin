/**
 * Unit tests for deleteWalk utility functions
 * Tests walk deletion and error handling
 *
 * Note: These tests focus on error handling and basic deletion logic.
 * Full recalculation logic with multiple nested Supabase calls is better
 * suited for integration testing. These tests verify error paths and
 * basic deletion functionality.
 */

import { deleteWalk, deleteWalks } from '../deleteWalk';
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

describe('deleteWalk', () => {
  const userId = 'user-123';
  const walkId = 'walk-456';
  const date = '2025-10-09';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteWalk - Error Handling', () => {
    it('should throw error when walk not found', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(fetchChain);

      await expect(deleteWalk(walkId, userId)).rejects.toThrow('Failed to fetch walk');
      expect(logger.error).toHaveBeenCalledWith('Error fetching walk:', expect.any(Error));
    });

    it('should throw error when walk data is null', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(fetchChain);

      await expect(deleteWalk(walkId, userId)).rejects.toThrow('Walk not found');
    });

    it('should throw error when delete fails', async () => {
      const mockWalk = {
        id: walkId,
        user_id: userId,
        date,
        steps: 5000,
      };

      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockWalk,
          error: null,
        }),
      };

      let eqCallCount = 0;
      const deleteChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn(function(this: any) {
          eqCallCount++;
          if (eqCallCount < 2) {
            return this;
          }
          return Promise.resolve({
            data: null,
            error: new Error('Delete failed'),
          });
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(deleteChain);

      await expect(deleteWalk(walkId, userId)).rejects.toThrow('Failed to delete walk');
      expect(logger.error).toHaveBeenCalledWith('Error deleting walk:', expect.any(Error));
    });



    it('should handle unexpected errors', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(deleteWalk(walkId, userId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith('Error in deleteWalk:', expect.any(Error));
    });
  });

  describe('deleteWalks - Error Handling', () => {
    const walkIds = ['walk-1', 'walk-2', 'walk-3'];

    it('should throw error when no walks found', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValueOnce(fetchChain);

      await expect(deleteWalks(walkIds, userId)).rejects.toThrow('No walks found');
    });

    it('should throw error when fetch fails', async () => {
      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Fetch error'),
        }),
      };

      (supabase.from as jest.Mock).mockReturnValueOnce(fetchChain);

      await expect(deleteWalks(walkIds, userId)).rejects.toThrow('Failed to fetch walks');
      expect(logger.error).toHaveBeenCalledWith('Error fetching walks:', expect.any(Error));
    });

    it('should throw error when delete fails', async () => {
      const mockWalks = [
        { id: 'walk-1', user_id: userId, date: '2025-10-09', steps: 5000 },
        { id: 'walk-2', user_id: userId, date: '2025-10-09', steps: 6000 },
      ];

      const fetchChain = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockWalks,
          error: null,
        }),
      };

      const deleteChain = {
        delete: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Delete failed'),
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(fetchChain)
        .mockReturnValueOnce(deleteChain);

      await expect(deleteWalks(walkIds, userId)).rejects.toThrow('Failed to delete walks');
      expect(logger.error).toHaveBeenCalledWith('Error deleting walks:', expect.any(Error));
    });

    it('should handle unexpected errors', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(deleteWalks(walkIds, userId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith('Error in deleteWalks:', expect.any(Error));
    });
  });
});

