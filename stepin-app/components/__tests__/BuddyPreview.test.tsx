// Mock dependencies BEFORE imports
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../../lib/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({ Feather: 'Feather' }));

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { BuddyPreview } from '../BuddyPreview';
import { supabase } from '../../lib/supabase/client';
import { useAuthStore } from '../../lib/store/authStore';

describe('BuddyPreview', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockProfile = {
    id: 'buddy-1',
    display_name: 'John Doe',
    username: 'johndoe',
    avatar_url: 'https://example.com/avatar.jpg',
    location_city: 'San Francisco',
    daily_step_goal: 10000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockUser);
  });

  describe('Loading State', () => {
    it('should render loading indicator initially', () => {
      // Mock Supabase to delay response
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves
          }),
        }),
      });

      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('Profile Display', () => {
    beforeEach(() => {
      // Mock successful profile fetch
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProfile,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'buddies') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });
    });

    it('should render buddy preview after loading', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('buddy-preview')).toBeTruthy();
      });
    });

    it('should display buddy name', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('buddy-display-name')).toBeTruthy();
        expect(getByTestId('buddy-display-name').props.children).toBe('John Doe');
      });
    });

    it('should display buddy username', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('buddy-username')).toBeTruthy();
        const children = getByTestId('buddy-username').props.children;
        // Children is an array: ["@", "johndoe"]
        expect(children).toEqual(['@', 'johndoe']);
      });
    });

    it('should display buddy location', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('buddy-location')).toBeTruthy();
        expect(getByTestId('buddy-location').props.children).toBe('San Francisco');
      });
    });

    it('should display buddy step goal', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('buddy-step-goal')).toBeTruthy();
        expect(getByTestId('buddy-step-goal').props.children).toBe('10,000');
      });
    });

    it('should display avatar when avatar_url exists', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('buddy-avatar')).toBeTruthy();
      });
    });

    it('should display avatar placeholder when no avatar_url', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockProfile, avatar_url: null },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'buddies') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('buddy-avatar-placeholder')).toBeTruthy();
      });
    });
  });

  describe('Send Request Button', () => {
    beforeEach(() => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProfile,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'buddies') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });
    });

    it('should display send request button when not connected', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('send-request-button')).toBeTruthy();
      });
    });
  });

  describe('Already Connected State', () => {
    beforeEach(() => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProfile,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'buddies') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [{ id: 'connection-1' }], // Already connected
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });
    });

    it('should display already connected message when connected', async () => {
      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('already-connected')).toBeTruthy();
      });
    });

    it('should not display send request button when already connected', async () => {
      const { queryByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(queryByTestId('send-request-button')).toBeNull();
      });
    });
  });

  describe('Error State', () => {
    it('should display error when profile not found', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { getByTestId } = render(<BuddyPreview buddyId="buddy-1" />);

      await waitFor(() => {
        expect(getByTestId('error-container')).toBeTruthy();
      });
    });
  });
});

