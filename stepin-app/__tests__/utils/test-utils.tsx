/**
 * Test Utilities
 * Common utilities and helpers for testing components
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../../lib/theme/themeManager';

/**
 * Custom render function that wraps components with necessary providers
 */
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };

/**
 * Mock data generators
 */

export const mockWalk = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  date: '2025-10-21',
  steps: 8500,
  distance_meters: 6800,
  duration_minutes: 85,
  calories_burned: 340,
  route: {
    type: 'LineString',
    coordinates: [
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7750, longitude: -122.4195 },
    ],
  },
  created_at: '2025-10-21T10:00:00Z',
  ...overrides,
});

export const mockProfile = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  daily_goal: 8000,
  current_streak: 5,
  longest_streak: 12,
  total_steps: 50000,
  total_distance_meters: 40000,
  activity_visibility: 'buddies' as const,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-10-21T00:00:00Z',
  ...overrides,
});

export const mockPrivacyZone = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174002',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Home',
  address: '123 Main St, San Francisco, CA',
  latitude: 37.7749,
  longitude: -122.4194,
  radius_meters: 250,
  created_at: '2025-10-21T00:00:00Z',
  updated_at: '2025-10-21T00:00:00Z',
  ...overrides,
});

export const mockBuddy = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174003',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  buddy_id: '123e4567-e89b-12d3-a456-426614174004',
  status: 'accepted' as const,
  created_at: '2025-10-21T00:00:00Z',
  buddy: {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: 'Buddy User',
    avatar_url: null,
  },
  ...overrides,
});

/**
 * Wait utilities
 */

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock navigation
 */

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};

/**
 * Mock Supabase client for specific tests
 */

export const createMockSupabaseClient = (overrides = {}) => ({
  auth: {
    signInWithPassword: jest.fn(() =>
      Promise.resolve({
        data: { session: { access_token: 'mock-token' }, user: mockProfile() },
        error: null,
      })
    ),
    signUp: jest.fn(() =>
      Promise.resolve({ data: { user: mockProfile() }, error: null })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getSession: jest.fn(() =>
      Promise.resolve({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      })
    ),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn((table: string) => {
    const chainable = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() =>
        Promise.resolve({
          data: table === 'profiles' ? mockProfile() : mockWalk(),
          error: null,
        })
      ),
      then: jest.fn((resolve) =>
        resolve({
          data: table === 'walks' ? [mockWalk()] : [mockProfile()],
          error: null,
        })
      ),
    };
    return chainable;
  }),
  ...overrides,
});

/**
 * Accessibility helpers
 */

export const testAccessibility = (component: ReactElement) => {
  const { getByRole, getAllByRole } = render(component);

  return {
    hasAccessibleButtons: () => {
      try {
        const buttons = getAllByRole('button');
        return buttons.length > 0;
      } catch {
        return false;
      }
    },
    hasAccessibleLabels: () => {
      // Test that important elements have accessibility labels
      const { UNSAFE_getAllByProps } = render(component);
      const elementsWithLabels = UNSAFE_getAllByProps({ accessibilityLabel: /.+/ }, { exact: false });
      return elementsWithLabels.length > 0;
    },
  };
};

/**
 * Animation helpers
 */

export const flushMicrotasksQueue = () =>
  new Promise((resolve) => setImmediate(resolve));

export const advanceAnimationByTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
  return flushMicrotasksQueue();
};
