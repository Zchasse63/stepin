/**
 * Unit tests for socialStore
 * Tests social features: buddies, activity feed, kudos
 *
 * NOTE: This store has complex Supabase dependencies and business logic that makes
 * comprehensive unit testing impractical. Many methods have been intentionally left
 * with minimal unit test coverage in favor of E2E testing.
 *
 * RECOMMENDED FOR E2E TESTING:
 * - blockBuddy/unblockBuddy: Complex auth + query chains + conditional logic
 * - sendBuddyRequest: Profile lookup + insert + error handling
 * - acceptBuddyRequest/declineBuddyRequest: Update/delete + reload buddies
 * - loadBuddies: Complex joins with profile transformations
 * - loadActivityFeed: Complex query with joins and visibility filtering
 * - postActivity: Insert + reload feed
 * - giveKudos/removeKudos: Optimistic updates with rollback on error
 *
 * CRITICAL E2E SCENARIOS TO COVER:
 * 1. Send buddy request → Accept → Verify both users see each other as buddies
 * 2. Block user → Verify they can't send requests or see activity
 * 3. Post activity → Give kudos → Remove kudos → Verify counts update correctly
 * 4. Optimistic update rollback on network error
 * 5. Activity feed visibility filtering (public vs buddies-only)
 */

// Mock Sentry before any imports that use it
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock Supabase client
jest.mock('../../supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import { useSocialStore } from '../socialStore';
import { supabase } from '../../supabase/client';
import { BuddyWithProfile, ActivityFeedItemWithDetails } from '../../../types/social';

describe('socialStore', () => {
  beforeEach(() => {
    // Reset store state
    useSocialStore.setState({
      buddies: [],
      pendingRequests: [],
      activityFeed: [],
      loading: false,
      error: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useSocialStore.getState();
      expect(state.buddies).toEqual([]);
      expect(state.pendingRequests).toEqual([]);
      expect(state.activityFeed).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // NOTE: Complex Supabase-dependent methods (loadBuddies, sendBuddyRequest, etc.)
  // are intentionally not unit tested here. See file header for E2E testing recommendations.

  describe('utility methods', () => {
    it('should clear error', () => {
      useSocialStore.setState({ error: 'Some error' });

      const { clearError } = useSocialStore.getState();
      clearError();

      const state = useSocialStore.getState();
      expect(state.error).toBeNull();
    });

    it('should reset store to initial state', () => {
      useSocialStore.setState({
        buddies: [{ id: 'buddy-1' } as BuddyWithProfile],
        pendingRequests: [{ id: 'request-1' } as BuddyWithProfile],
        activityFeed: [{ id: 'activity-1' } as ActivityFeedItemWithDetails],
        loading: true,
        error: 'Some error',
      });

      const { reset } = useSocialStore.getState();
      reset();

      const state = useSocialStore.getState();
      expect(state.buddies).toEqual([]);
      expect(state.pendingRequests).toEqual([]);
      expect(state.activityFeed).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});

