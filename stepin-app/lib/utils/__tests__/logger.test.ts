/**
 * Unit tests for logger utility
 * Tests logging functionality in development and production modes
 */

import { logger } from '../logger';
import * as Sentry from '@sentry/react-native';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  describe('error', () => {
    it('should log to console in development mode', () => {
      // __DEV__ is true by default in Jest
      logger.error('Test error message');

      expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message', '');
    });

    it('should log error with error object in development', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message', error);
    });

    it('should send Error object to Sentry in production', () => {
      // Mock production mode
      const originalDev = global.__DEV__;
      (global as any).__DEV__ = false;

      const error = new Error('Test error');
      logger.error('Test error message', error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: { message: 'Test error message' },
      });

      // Restore __DEV__
      (global as any).__DEV__ = originalDev;
    });

    it('should send non-Error object to Sentry as message in production', () => {
      const originalDev = global.__DEV__;
      (global as any).__DEV__ = false;

      const errorData = { code: 'ERROR_CODE', details: 'Error details' };
      logger.error('Test error message', errorData);

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test error message', {
        level: 'error',
        extra: { error: errorData },
      });

      (global as any).__DEV__ = originalDev;
    });

    it('should send message-only to Sentry in production when no error object', () => {
      const originalDev = global.__DEV__;
      (global as any).__DEV__ = false;

      logger.error('Test error message');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test error message', {
        level: 'error',
      });

      (global as any).__DEV__ = originalDev;
    });
  });

  describe('warn', () => {
    it('should log to console in development mode', () => {
      logger.warn('Test warning message');

      expect(console.warn).toHaveBeenCalledWith('[WARN] Test warning message', '');
    });

    it('should log warning with data in development', () => {
      const data = { key: 'value' };
      logger.warn('Test warning message', data);

      expect(console.warn).toHaveBeenCalledWith('[WARN] Test warning message', data);
    });

    it('should not log in production mode', () => {
      const originalDev = global.__DEV__;
      (global as any).__DEV__ = false;

      logger.warn('Test warning message');

      expect(console.warn).not.toHaveBeenCalled();

      (global as any).__DEV__ = originalDev;
    });
  });

  describe('info', () => {
    it('should log to console in development mode', () => {
      logger.info('Test info message');

      expect(console.log).toHaveBeenCalledWith('[INFO] Test info message', '');
    });

    it('should log info with data in development', () => {
      const data = { userId: '123', action: 'login' };
      logger.info('User logged in', data);

      expect(console.log).toHaveBeenCalledWith('[INFO] User logged in', data);
    });

    it('should not log in production mode', () => {
      const originalDev = global.__DEV__;
      (global as any).__DEV__ = false;

      logger.info('Test info message');

      expect(console.log).not.toHaveBeenCalled();

      (global as any).__DEV__ = originalDev;
    });
  });

  describe('debug', () => {
    it('should log to console in development mode', () => {
      logger.debug('Test debug message');

      expect(console.log).toHaveBeenCalledWith('[DEBUG] Test debug message', '');
    });

    it('should log debug with data in development', () => {
      const data = { requestId: 'abc123', duration: 150 };
      logger.debug('API request completed', data);

      expect(console.log).toHaveBeenCalledWith('[DEBUG] API request completed', data);
    });

    it('should not log in production mode', () => {
      const originalDev = global.__DEV__;
      (global as any).__DEV__ = false;

      logger.debug('Test debug message');

      expect(console.log).not.toHaveBeenCalled();

      (global as any).__DEV__ = originalDev;
    });
  });
});

