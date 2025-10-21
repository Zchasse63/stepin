/**
 * Tests for dateService.ts
 * Date service for mockable date/time functionality
 */

// Mock Sentry before any imports that use it
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock logger to avoid Sentry import issues
jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { DateService } from '../dateService';

describe('DateService', () => {
  let dateService: DateService;

  beforeEach(() => {
    dateService = new DateService();
    // Clear any mock date before each test
    dateService.clearMockDate();
  });

  describe('now', () => {
    it('should return current date when not in mock mode', () => {
      const before = new Date();
      const now = dateService.now();
      const after = new Date();

      expect(now.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(now.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should return mock date when in mock mode', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const now = dateService.now();
      expect(now.getTime()).toBe(mockDate.getTime());
    });

    it('should return new instance each time', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const now1 = dateService.now();
      const now2 = dateService.now();

      expect(now1).not.toBe(now2); // Different instances
      expect(now1.getTime()).toBe(now2.getTime()); // Same time
    });
  });

  describe('today', () => {
    it('should return today at midnight', () => {
      const today = dateService.today();

      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
      expect(today.getMilliseconds()).toBe(0);
    });

    it('should respect mock date', () => {
      const mockDate = new Date(2025, 9, 9, 15, 30, 45);
      dateService.setMockDate(mockDate);

      const today = dateService.today();

      expect(today.getFullYear()).toBe(2025);
      expect(today.getMonth()).toBe(9);
      expect(today.getDate()).toBe(9);
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
    });
  });

  describe('yesterday', () => {
    it('should return yesterday at midnight', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const yesterday = dateService.yesterday();

      expect(yesterday.getFullYear()).toBe(2025);
      expect(yesterday.getMonth()).toBe(9);
      expect(yesterday.getDate()).toBe(8);
      expect(yesterday.getHours()).toBe(0);
    });

    it('should handle month boundaries', () => {
      const mockDate = new Date(2025, 10, 1, 12, 0, 0); // November 1
      dateService.setMockDate(mockDate);

      const yesterday = dateService.yesterday();

      expect(yesterday.getMonth()).toBe(9); // October
      expect(yesterday.getDate()).toBe(31);
    });
  });

  describe('tomorrow', () => {
    it('should return tomorrow at midnight', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const tomorrow = dateService.tomorrow();

      expect(tomorrow.getFullYear()).toBe(2025);
      expect(tomorrow.getMonth()).toBe(9);
      expect(tomorrow.getDate()).toBe(10);
      expect(tomorrow.getHours()).toBe(0);
    });

    it('should handle month boundaries', () => {
      const mockDate = new Date(2025, 9, 31, 12, 0, 0); // October 31
      dateService.setMockDate(mockDate);

      const tomorrow = dateService.tomorrow();

      expect(tomorrow.getMonth()).toBe(10); // November
      expect(tomorrow.getDate()).toBe(1);
    });
  });

  describe('daysAgo', () => {
    it('should return date N days ago', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const threeDaysAgo = dateService.daysAgo(3);

      expect(threeDaysAgo.getFullYear()).toBe(2025);
      expect(threeDaysAgo.getMonth()).toBe(9);
      expect(threeDaysAgo.getDate()).toBe(6);
    });

    it('should handle 0 days', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const zeroDaysAgo = dateService.daysAgo(0);

      expect(zeroDaysAgo.getDate()).toBe(9);
    });

    it('should handle month boundaries', () => {
      const mockDate = new Date(2025, 10, 2, 12, 0, 0); // November 2
      dateService.setMockDate(mockDate);

      const fiveDaysAgo = dateService.daysAgo(5);

      expect(fiveDaysAgo.getMonth()).toBe(9); // October
      expect(fiveDaysAgo.getDate()).toBe(28);
    });
  });

  describe('daysFromNow', () => {
    it('should return date N days from now', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const threeDaysFromNow = dateService.daysFromNow(3);

      expect(threeDaysFromNow.getFullYear()).toBe(2025);
      expect(threeDaysFromNow.getMonth()).toBe(9);
      expect(threeDaysFromNow.getDate()).toBe(12);
    });

    it('should handle month boundaries', () => {
      const mockDate = new Date(2025, 9, 29, 12, 0, 0); // October 29
      dateService.setMockDate(mockDate);

      const fiveDaysFromNow = dateService.daysFromNow(5);

      expect(fiveDaysFromNow.getMonth()).toBe(10); // November
      expect(fiveDaysFromNow.getDate()).toBe(3);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const today = new Date(2025, 9, 9, 18, 30, 0); // Same day, different time
      expect(dateService.isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const yesterday = new Date(2025, 9, 8, 12, 0, 0);
      expect(dateService.isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const tomorrow = new Date(2025, 9, 10, 12, 0, 0);
      expect(dateService.isToday(tomorrow)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const yesterday = new Date(2025, 9, 8, 18, 30, 0);
      expect(dateService.isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      const today = new Date(2025, 9, 9, 12, 0, 0);
      expect(dateService.isYesterday(today)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day different times', () => {
      const date1 = new Date(2025, 9, 9, 8, 0, 0);
      const date2 = new Date(2025, 9, 9, 20, 0, 0);

      expect(dateService.isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2025, 9, 9, 12, 0, 0);
      const date2 = new Date(2025, 9, 10, 12, 0, 0);

      expect(dateService.isSameDay(date1, date2)).toBe(false);
    });

    it('should return true for exact same date', () => {
      const date = new Date(2025, 9, 9, 12, 0, 0);

      expect(dateService.isSameDay(date, date)).toBe(true);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date(2025, 9, 9);
      const date2 = new Date(2025, 9, 12);

      expect(dateService.daysBetween(date1, date2)).toBe(3);
    });

    it('should return absolute value', () => {
      const date1 = new Date(2025, 9, 12);
      const date2 = new Date(2025, 9, 9);

      expect(dateService.daysBetween(date1, date2)).toBe(3);
    });

    it('should return 0 for same day', () => {
      const date = new Date(2025, 9, 9);

      expect(dateService.daysBetween(date, date)).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 9, 9);
      expect(dateService.formatDate(date)).toBe('2025-10-09');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2025, 0, 5); // January 5
      expect(dateService.formatDate(date)).toBe('2025-01-05');
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD string', () => {
      const date = dateService.parseDate('2025-10-09');

      // Note: Date parsing from string can be timezone-dependent
      // The date string is parsed as UTC, which may result in different local date
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(9); // October (0-indexed)
      // Date may be 8 or 9 depending on timezone
      expect(date.getDate()).toBeGreaterThanOrEqual(8);
      expect(date.getDate()).toBeLessThanOrEqual(9);
    });
  });

  describe('Mock mode helpers', () => {
    it('should set mock date from Date object', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      expect(dateService.isMockMode()).toBe(true);
      expect(dateService.getMockDate()?.getTime()).toBe(mockDate.getTime());
    });

    it('should set mock date from string', () => {
      dateService.setMockDate('2025-10-09T12:00:00Z');

      expect(dateService.isMockMode()).toBe(true);
      const mockDate = dateService.getMockDate();
      expect(mockDate).not.toBeNull();
    });

    it('should clear mock date', () => {
      dateService.setMockDate(new Date(2025, 9, 9));
      expect(dateService.isMockMode()).toBe(true);

      dateService.clearMockDate();
      expect(dateService.isMockMode()).toBe(false);
      expect(dateService.getMockDate()).toBeNull();
    });

    it('should advance mock date by days', () => {
      const mockDate = new Date(2025, 9, 9, 12, 0, 0);
      dateService.setMockDate(mockDate);

      dateService.advanceDays(3);

      const newDate = dateService.getMockDate();
      expect(newDate?.getDate()).toBe(12);
    });

    it('should not advance when not in mock mode', () => {
      dateService.clearMockDate();
      dateService.advanceDays(3);

      expect(dateService.isMockMode()).toBe(false);
    });
  });
});

