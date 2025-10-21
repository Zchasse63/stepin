/**
 * Integration Test Setup
 * Global setup and teardown for integration tests
 * Configures test environment and provides cleanup utilities
 */

// Mock Sentry before any imports
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  init: jest.fn(),
}));

// Mock logger to prevent Sentry imports
jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.test') });

// Set global timeout for all integration tests (30 seconds)
// This accommodates rate limiting delays between user creations
jest.setTimeout(30000);

// Validate required environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables in .env.test. ' +
    'Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

// Create Supabase clients for testing
export const supabaseTest = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role key (for cleanup and setup)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Global test timeout (10 seconds for integration tests)
 */
export const TEST_TIMEOUT = 10000;

/**
 * Set default timeout for all integration tests
 */
beforeAll(() => {
  jest.setTimeout(TEST_TIMEOUT);
});

/**
 * Clean up after all tests
 */
afterAll(async () => {
  // Close any open connections
  // Note: Supabase client doesn't have a close method, but we can clear any pending requests
});

/**
 * Helper to wait for async operations
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to generate unique test identifiers
 */
export const generateTestId = (prefix: string = 'test') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

/**
 * Helper to create a test user email
 * Use a format that passes Supabase email validation
 */
export const generateTestEmail = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  // Use proper email format with letters before @ symbol
  return `test.user.${timestamp}.${random}@example.com`;
};

/**
 * Helper to format dates for Supabase (ISO 8601)
 */
export const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

/**
 * Helper to get date string in YYYY-MM-DD format
 */
export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Helper to create a date N days ago
 */
export const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Helper to create a date N days from now
 */
export const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Console logger for integration tests
 */
export const testLogger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.TEST_VERBOSE === 'true') {
      console.log(`[TEST INFO] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[TEST ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[TEST WARN] ${message}`, ...args);
  },
};

/**
 * Export test configuration
 */
export const testConfig = {
  supabaseUrl,
  timeout: TEST_TIMEOUT,
  verbose: process.env.TEST_VERBOSE === 'true',
};

