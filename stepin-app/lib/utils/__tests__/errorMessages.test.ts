/**
 * Unit tests for errorMessages utility
 * Tests error message mapping, parsing, and validation
 */

import {
  getErrorMessage,
  parseError,
  getUserFriendlyError,
  validation,
  formatValidationError,
  ErrorCode,
} from '../errorMessages';

describe('errorMessages', () => {
  describe('getErrorMessage', () => {
    it('should return correct message for NETWORK_ERROR', () => {
      const message = getErrorMessage('NETWORK_ERROR');
      expect(message.title).toBe("Can't Connect");
      expect(message.message).toContain('internet connection');
      expect(message.action).toBe('Retry');
    });

    it('should return correct message for AUTH_ERROR', () => {
      const message = getErrorMessage('AUTH_ERROR');
      expect(message.title).toBe('Authentication Failed');
      expect(message.action).toBe('Try Again');
    });

    it('should return correct message for PERMISSION_DENIED', () => {
      const message = getErrorMessage('PERMISSION_DENIED');
      expect(message.title).toBe('Permission Required');
      expect(message.action).toBe('Grant Permission');
    });

    it('should return correct message for HEALTHKIT_UNAVAILABLE', () => {
      const message = getErrorMessage('HEALTHKIT_UNAVAILABLE');
      expect(message.title).toBe('HealthKit Unavailable');
      expect(message.action).toBe('Log Manually');
    });

    it('should return correct message for HEALTH_CONNECT_NOT_INSTALLED', () => {
      const message = getErrorMessage('HEALTH_CONNECT_NOT_INSTALLED');
      expect(message.title).toBe('Health Connect Not Found');
      expect(message.action).toBe('Install Health Connect');
    });

    it('should return correct message for SYNC_FAILED', () => {
      const message = getErrorMessage('SYNC_FAILED');
      expect(message.title).toBe('Sync Failed');
      expect(message.action).toBe('Try Again');
    });

    it('should return correct message for VALIDATION_ERROR', () => {
      const message = getErrorMessage('VALIDATION_ERROR');
      expect(message.title).toBe('Invalid Input');
      expect(message.action).toBe('OK');
    });

    it('should return correct message for DUPLICATE_ENTRY', () => {
      const message = getErrorMessage('DUPLICATE_ENTRY');
      expect(message.title).toBe('Walk Already Logged');
      expect(message.action).toBe('Add Anyway');
    });

    it('should return correct message for INVALID_DATE', () => {
      const message = getErrorMessage('INVALID_DATE');
      expect(message.title).toBe('Invalid Date');
      expect(message.message).toContain('future date');
    });

    it('should return correct message for INVALID_STEPS', () => {
      const message = getErrorMessage('INVALID_STEPS');
      expect(message.title).toBe('Invalid Step Count');
      expect(message.message).toContain('0 and 200,000');
    });

    it('should return correct message for INVALID_DURATION', () => {
      const message = getErrorMessage('INVALID_DURATION');
      expect(message.title).toBe('Invalid Duration');
      expect(message.message).toContain('1,440 minutes');
    });

    it('should return correct message for DATABASE_ERROR', () => {
      const message = getErrorMessage('DATABASE_ERROR');
      expect(message.title).toBe('Something Went Wrong');
      expect(message.action).toBe('Try Again');
    });

    it('should return correct message for UNKNOWN_ERROR', () => {
      const message = getErrorMessage('UNKNOWN_ERROR');
      expect(message.title).toBe('Unexpected Error');
      expect(message.action).toBe('OK');
    });
  });

  describe('parseError', () => {
    it('should return UNKNOWN_ERROR for null/undefined', () => {
      expect(parseError(null)).toBe('UNKNOWN_ERROR');
      expect(parseError(undefined)).toBe('UNKNOWN_ERROR');
    });

    it('should parse network errors', () => {
      expect(parseError({ message: 'Network request failed' })).toBe('NETWORK_ERROR');
      expect(parseError({ message: 'Connection timeout' })).toBe('NETWORK_ERROR');
      expect(parseError({ message: 'Device is offline' })).toBe('NETWORK_ERROR');
      expect(parseError({ code: 'NETWORK_FAILURE' })).toBe('NETWORK_ERROR');
    });

    it('should parse auth errors', () => {
      expect(parseError({ message: 'Authentication failed' })).toBe('AUTH_ERROR');
      expect(parseError({ message: 'Unauthorized access' })).toBe('AUTH_ERROR');
      expect(parseError({ message: 'Invalid token' })).toBe('AUTH_ERROR');
      expect(parseError({ code: 'AUTH_INVALID' })).toBe('AUTH_ERROR');
    });

    it('should parse permission errors', () => {
      expect(parseError({ message: 'Permission denied' })).toBe('PERMISSION_DENIED');
      expect(parseError({ message: 'Access denied' })).toBe('PERMISSION_DENIED');
      expect(parseError({ code: 'PERMISSION_ERROR' })).toBe('PERMISSION_DENIED');
    });

    it('should parse HealthKit errors', () => {
      expect(parseError({ message: 'HealthKit not available' })).toBe('HEALTHKIT_UNAVAILABLE');
    });

    it('should parse Health Connect errors', () => {
      expect(parseError({ message: 'Health Connect not installed' })).toBe('HEALTH_CONNECT_NOT_INSTALLED');
    });

    it('should parse sync errors', () => {
      expect(parseError({ message: 'Sync failed' })).toBe('SYNC_FAILED');
    });

    it('should parse database errors', () => {
      expect(parseError({ message: 'Database query failed' })).toBe('DATABASE_ERROR');
      expect(parseError({ message: 'Supabase error' })).toBe('DATABASE_ERROR');
      expect(parseError({ code: 'PGRST001' })).toBe('DATABASE_ERROR');
    });

    it('should return UNKNOWN_ERROR for unrecognized errors', () => {
      expect(parseError({ message: 'Some random error' })).toBe('UNKNOWN_ERROR');
      expect(parseError({ code: 'UNKNOWN_CODE' })).toBe('UNKNOWN_ERROR');
    });

    it('should be case-insensitive', () => {
      expect(parseError({ message: 'NETWORK ERROR' })).toBe('NETWORK_ERROR');
      expect(parseError({ message: 'Network Error' })).toBe('NETWORK_ERROR');
    });
  });

  describe('getUserFriendlyError', () => {
    it('should return user-friendly message for error object', () => {
      const error = { message: 'Network request failed' };
      const result = getUserFriendlyError(error);

      expect(result.title).toBe("Can't Connect");
      expect(result.message).toContain('internet connection');
    });

    it('should handle unknown errors gracefully', () => {
      const error = { message: 'Random error' };
      const result = getUserFriendlyError(error);

      expect(result.title).toBe('Unexpected Error');
    });
  });

  describe('validation.steps', () => {
    it('should validate valid step counts', () => {
      expect(validation.steps(0).valid).toBe(true);
      expect(validation.steps(5000).valid).toBe(true);
      expect(validation.steps(10000).valid).toBe(true);
      expect(validation.steps(200000).valid).toBe(true);
    });

    it('should reject negative step counts', () => {
      const result = validation.steps(-1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_STEPS');
    });

    it('should reject step counts over 200,000', () => {
      const result = validation.steps(200001);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_STEPS');
    });
  });

  describe('validation.duration', () => {
    it('should validate valid durations', () => {
      expect(validation.duration(0).valid).toBe(true);
      expect(validation.duration(30).valid).toBe(true);
      expect(validation.duration(60).valid).toBe(true);
      expect(validation.duration(1440).valid).toBe(true);
    });

    it('should reject negative durations', () => {
      const result = validation.duration(-1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_DURATION');
    });

    it('should reject durations over 1440 minutes (24 hours)', () => {
      const result = validation.duration(1441);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_DURATION');
    });
  });

  describe('validation.date', () => {
    it('should validate past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(validation.date(yesterday).valid).toBe(true);
    });

    it('should validate today', () => {
      const today = new Date();
      expect(validation.date(today).valid).toBe(true);
    });

    it('should reject future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = validation.date(tomorrow);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_DATE');
    });
  });

  describe('validation.isUnusuallyHigh', () => {
    it('should return false for normal step counts', () => {
      expect(validation.isUnusuallyHigh(5000)).toBe(false);
      expect(validation.isUnusuallyHigh(10000)).toBe(false);
      expect(validation.isUnusuallyHigh(30000)).toBe(false);
      expect(validation.isUnusuallyHigh(50000)).toBe(false);
    });

    it('should return true for unusually high step counts', () => {
      expect(validation.isUnusuallyHigh(50001)).toBe(true);
      expect(validation.isUnusuallyHigh(100000)).toBe(true);
    });
  });

  describe('validation.isUnusuallyLowGoal', () => {
    it('should return false for normal goals', () => {
      expect(validation.isUnusuallyLowGoal(2000)).toBe(false);
      expect(validation.isUnusuallyLowGoal(5000)).toBe(false);
      expect(validation.isUnusuallyLowGoal(10000)).toBe(false);
    });

    it('should return true for unusually low goals', () => {
      expect(validation.isUnusuallyLowGoal(1999)).toBe(true);
      expect(validation.isUnusuallyLowGoal(1000)).toBe(true);
      expect(validation.isUnusuallyLowGoal(500)).toBe(true);
    });
  });

  describe('formatValidationError', () => {
    it('should format validation error message', () => {
      const message = formatValidationError('INVALID_STEPS');
      expect(message).toContain('0 and 200,000');
    });

    it('should format duration error message', () => {
      const message = formatValidationError('INVALID_DURATION');
      expect(message).toContain('1,440 minutes');
    });

    it('should format date error message', () => {
      const message = formatValidationError('INVALID_DATE');
      expect(message).toContain('future date');
    });
  });
});

