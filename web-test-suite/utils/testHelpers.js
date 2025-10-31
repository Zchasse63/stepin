/**
 * Test Helper Functions
 * Utility functions to support test suites
 */

/**
 * Generate a unique test email
 */
export function generateTestEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-${timestamp}-${random}@stepin.test`;
}

/**
 * Generate a test password
 */
export function generateTestPassword() {
  return 'TestPass123!';
}

/**
 * Wait for a specified duration
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Get a date N days ago in YYYY-MM-DD format
 */
export function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate distance from steps (rough estimate)
 */
export function calculateDistanceFromSteps(steps, metersPerStep = 0.762) {
  return steps * metersPerStep;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Assert that a value is truthy
 */
export function assertTrue(value, message = 'Expected value to be truthy') {
  if (!value) {
    throw new Error(message);
  }
}

/**
 * Assert that a value is falsy
 */
export function assertFalse(value, message = 'Expected value to be falsy') {
  if (value) {
    throw new Error(message);
  }
}

/**
 * Assert that two values are equal
 */
export function assertEqual(actual, expected, message = 'Values are not equal') {
  if (actual !== expected) {
    throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
  }
}

/**
 * Assert that an error is thrown
 */
export async function assertThrows(fn, message = 'Expected function to throw') {
  let threw = false;
  try {
    await fn();
  } catch (error) {
    threw = true;
  }
  if (!threw) {
    throw new Error(message);
  }
}
