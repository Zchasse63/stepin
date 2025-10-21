/**
 * Shared test utilities and mock data
 * Use these standardized mocks across all test files for consistency
 */

/**
 * Standard mock colors matching the actual theme structure
 * Use this in all test files to ensure consistency
 */
export const mockColors = {
  primary: {
    light: '#A8E6CF',
    main: '#4CAF50',
    dark: '#2E7D32',
  },
  secondary: {
    light: '#B3E5FC',
    main: '#03A9F4',
    dark: '#0277BD',
  },
  accent: {
    gold: '#FFD700',
    gray: '#9E9E9E',
    warning: '#FF9800',
  },
  surface: {
    card: '#FFFFFF',
    elevated: '#F5F5F5',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#FAFAFA',
  },
  text: {
    primary: '#000000',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E',
  },
  system: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
    gray: '#8E8E93',
    gray2: '#AEAEB2',
    gray3: '#C7C7CC',
    gray4: '#D1D1D6',
    gray5: '#E5E5EA',
    gray6: '#F2F2F7',
  },
};

/**
 * Standard mock theme object
 * Use this in beforeEach to mock useTheme
 */
export const mockTheme = {
  colors: mockColors,
  theme: 'light' as const,
  themePreference: 'system' as const,
  setThemePreference: jest.fn(),
};

/**
 * Standard mock user
 */
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

/**
 * Standard mock walk data
 */
export const mockWalk = {
  id: 'walk-123',
  user_id: 'user-123',
  steps: 5000,
  duration_minutes: 45,
  distance_km: 3.5,
  calories_burned: 250,
  created_at: '2025-10-09T12:00:00.000Z',
  updated_at: '2025-10-09T12:00:00.000Z',
};

/**
 * Standard mock buddy data
 */
export const mockBuddy = {
  id: 'buddy-123',
  user_id: 'user-123',
  buddy_id: 'buddy-456',
  status: 'accepted' as const,
  created_at: '2025-10-09T12:00:00.000Z',
  buddy_profile: {
    id: 'buddy-456',
    email: 'buddy@example.com',
    display_name: 'Test Buddy',
    avatar_url: null,
  },
};

/**
 * Standard mock activity data
 */
export const mockActivity = {
  id: 'activity-123',
  user_id: 'buddy-456',
  activity_type: 'walk_logged' as const,
  steps: 5000,
  created_at: '2025-10-09T12:00:00.000Z',
  user_profile: {
    id: 'buddy-456',
    display_name: 'Test Buddy',
    avatar_url: null,
  },
};

/**
 * Helper to create a mock Supabase response
 */
export const createMockSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

/**
 * Helper to create a mock Supabase query chain
 */
export const createMockSupabaseQuery = (response: any) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  rangeGt: jest.fn().mockReturnThis(),
  rangeGte: jest.fn().mockReturnThis(),
  rangeLt: jest.fn().mockReturnThis(),
  rangeLte: jest.fn().mockReturnThis(),
  rangeAdjacent: jest.fn().mockReturnThis(),
  overlaps: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue(response),
  maybeSingle: jest.fn().mockResolvedValue(response),
  then: jest.fn((resolve) => resolve(response)),
});

/**
 * Mock AsyncStorage
 * Use this in test files that need AsyncStorage
 *
 * Example usage:
 * ```
 * import { mockAsyncStorage } from '../tests/testUtils';
 *
 * jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
 * ```
 */
export const mockAsyncStorage = {
  getItem: jest.fn((key: string) => Promise.resolve(null)),
  setItem: jest.fn((key: string, value: string) => Promise.resolve()),
  removeItem: jest.fn((key: string) => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn((keys: string[]) => Promise.resolve(keys.map(key => [key, null]))),
  multiSet: jest.fn((keyValuePairs: string[][]) => Promise.resolve()),
  multiRemove: jest.fn((keys: string[]) => Promise.resolve()),
};

/**
 * Mock Supabase client
 * Use this in test files that need Supabase
 *
 * Example usage:
 * ```
 * import { createMockSupabaseClient } from '../tests/testUtils';
 *
 * jest.mock('../lib/supabase/client', () => ({
 *   supabase: createMockSupabaseClient(),
 * }));
 * ```
 */
export const createMockSupabaseClient = () => ({
  from: jest.fn((table: string) => createMockSupabaseQuery(createMockSupabaseResponse([], null))),
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } }),
    })),
  },
});

/**
 * Mock HealthKit service
 * Use this in test files that need HealthKit
 *
 * Example usage:
 * ```
 * import { createMockHealthService } from '../tests/testUtils';
 *
 * jest.mock('../lib/health', () => ({
 *   getHealthService: jest.fn(() => createMockHealthService()),
 * }));
 * ```
 */
export const createMockHealthService = () => ({
  requestPermissions: jest.fn().mockResolvedValue(true),
  getTodaySteps: jest.fn().mockResolvedValue(5000),
  getStepsForDateRange: jest.fn().mockResolvedValue([
    { date: '2025-10-09', steps: 5000 },
  ]),
  streamHeartRate: jest.fn().mockResolvedValue(undefined),
  stopHeartRateStream: jest.fn().mockResolvedValue(undefined),
  getHeartRateForDateRange: jest.fn().mockResolvedValue([
    { timestamp: new Date(), heartRate: 75 },
  ]),
  isAvailable: jest.fn().mockResolvedValue(true),
});

