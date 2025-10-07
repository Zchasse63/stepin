/**
 * Logger utility for development and production logging
 *
 * In development (__DEV__ = true):
 * - Logs to console for debugging
 *
 * In production (__DEV__ = false):
 * - Silences console output
 * - Sends errors to Sentry for monitoring
 *
 * Usage:
 * import { logger } from '@/lib/utils/logger';
 * logger.error('Failed to fetch data', error);
 * logger.warn('Deprecated API usage');
 * logger.info('User logged in');
 * logger.debug('Detailed debug info');
 */

import * as Sentry from '@sentry/react-native';

export const logger = {
  /**
   * Log error messages
   * Use for errors that need attention but don't crash the app
   * In production, sends to Sentry for monitoring
   */
  error: (message: string, error?: any) => {
    if (__DEV__) {
      console.error(`[ERROR] ${message}`, error || '');
    } else {
      // Send to Sentry in production
      if (error instanceof Error) {
        Sentry.captureException(error, { extra: { message } });
      } else if (error) {
        // If error is not an Error object, capture as message with context
        Sentry.captureMessage(message, {
          level: 'error',
          extra: { error },
        });
      } else {
        // No error object, just capture the message
        Sentry.captureMessage(message, { level: 'error' });
      }
    }
  },

  /**
   * Log warning messages
   * Use for potential issues that don't prevent functionality
   */
  warn: (message: string, data?: any) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },

  /**
   * Log informational messages
   * Use for important state changes or user actions
   */
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },

  /**
   * Log debug messages
   * Use for detailed debugging information
   */
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
};

