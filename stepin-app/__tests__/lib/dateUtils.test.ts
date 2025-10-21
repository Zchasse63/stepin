/**
 * dateUtils Utility Tests
 * Tests for date manipulation and formatting functions
 */

import {
  getDateRangeForPeriod,
  getLastNDays,
  formatDateDisplay,
  formatDateForAPI,
  isDateToday,
  areSameDay,
  getDatesInRange,
  getDaysBetween,
  getAbbreviatedDayName,
  getDayOfMonth,
  getMonthAbbreviation,
  getTimeBasedGreeting,
} from '../../lib/utils/dateUtils';

describe('dateUtils', () => {
  // Fixed date for testing: October 15, 2025 (Wednesday)
  const testDate = new Date(2025, 9, 15, 12, 0, 0); // Month is 0-indexed

  describe('getDateRangeForPeriod', () => {
    it('should get week range (Sunday to Saturday)', () => {
      const range = getDateRangeForPeriod('week', testDate);

      // Week should start on Sunday (Oct 12) and end on Saturday (Oct 18)
      expect(range.startDate.getDay()).toBe(0); // Sunday
      expect(range.endDate.getDay()).toBe(6); // Saturday
    });

    it('should get month range', () => {
      const range = getDateRangeForPeriod('month', testDate);

      // Month should start on Oct 1 and end on Oct 31
      expect(range.startDate.getDate()).toBe(1);
      expect(range.endDate.getDate()).toBe(31);
      expect(range.startDate.getMonth()).toBe(9); // October
      expect(range.endDate.getMonth()).toBe(9);
    });

    it('should get year range', () => {
      const range = getDateRangeForPeriod('year', testDate);

      // Year should start on Jan 1 and end on Dec 31
      expect(range.startDate.getDate()).toBe(1);
      expect(range.startDate.getMonth()).toBe(0); // January
      expect(range.endDate.getDate()).toBe(31);
      expect(range.endDate.getMonth()).toBe(11); // December
      expect(range.startDate.getFullYear()).toBe(2025);
      expect(range.endDate.getFullYear()).toBe(2025);
    });

    it('should use current date when no reference date provided', () => {
      const range = getDateRangeForPeriod('week');

      expect(range.startDate).toBeInstanceOf(Date);
      expect(range.endDate).toBeInstanceOf(Date);
    });
  });

  describe('getLastNDays', () => {
    it('should get last 7 days', () => {
      const range = getLastNDays(7, testDate);

      const daysDiff = getDaysBetween(range.startDate, range.endDate);
      expect(daysDiff).toBe(6); // 7 days inclusive (0-6)
    });

    it('should get last 30 days', () => {
      const range = getLastNDays(30, testDate);

      const daysDiff = getDaysBetween(range.startDate, range.endDate);
      expect(daysDiff).toBe(29);
    });

    it('should include end date', () => {
      const range = getLastNDays(7, testDate);

      expect(range.endDate).toBe(testDate);
    });

    it('should use current date when no end date provided', () => {
      const range = getLastNDays(7);

      expect(range.endDate).toBeInstanceOf(Date);
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date with default format', () => {
      const result = formatDateDisplay(testDate);

      expect(result).toBe('Oct 15, 2025');
    });

    it('should format date with custom format', () => {
      const result = formatDateDisplay(testDate, 'yyyy-MM-dd');

      expect(result).toBe('2025-10-15');
    });

    it('should format date from ISO string', () => {
      const result = formatDateDisplay('2025-10-15');

      expect(result).toBe('Oct 15, 2025');
    });

    it('should handle different format patterns', () => {
      const result = formatDateDisplay(testDate, 'MMMM d, yyyy');

      expect(result).toBe('October 15, 2025');
    });
  });

  describe('formatDateForAPI', () => {
    it('should format date in yyyy-MM-dd format', () => {
      const result = formatDateForAPI(testDate);

      expect(result).toBe('2025-10-15');
    });

    it('should format dates with single digit day/month correctly', () => {
      const date = new Date(2025, 0, 5); // Jan 5
      const result = formatDateForAPI(date);

      expect(result).toBe('2025-01-05');
    });
  });

  describe('isDateToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      const result = isDateToday(today);

      expect(result).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = isDateToday(yesterday);

      expect(result).toBe(false);
    });

    it('should work with ISO string', () => {
      const today = new Date();
      const todayISO = formatDateForAPI(today);
      const result = isDateToday(todayISO);

      expect(result).toBe(true);
    });
  });

  describe('areSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date(2025, 9, 15, 10, 0, 0);
      const date2 = new Date(2025, 9, 15, 18, 0, 0);

      expect(areSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2025, 9, 15);
      const date2 = new Date(2025, 9, 16);

      expect(areSameDay(date1, date2)).toBe(false);
    });

    it('should work with ISO strings', () => {
      const result = areSameDay('2025-10-15', '2025-10-15');

      expect(result).toBe(true);
    });

    it('should work with mixed Date and string', () => {
      const date = new Date(2025, 9, 15);
      const result = areSameDay(date, '2025-10-15');

      expect(result).toBe(true);
    });
  });

  describe('getDatesInRange', () => {
    it('should get all dates in range', () => {
      const start = new Date(2025, 9, 15);
      const end = new Date(2025, 9, 17);
      const dates = getDatesInRange(start, end);

      expect(dates).toHaveLength(3); // Oct 15, 16, 17
    });

    it('should include start and end dates', () => {
      const start = new Date(2025, 9, 15);
      const end = new Date(2025, 9, 15);
      const dates = getDatesInRange(start, end);

      expect(dates).toHaveLength(1);
    });

    it('should handle month boundary', () => {
      const start = new Date(2025, 9, 30); // Oct 30
      const end = new Date(2025, 10, 2); // Nov 2
      const dates = getDatesInRange(start, end);

      expect(dates).toHaveLength(4); // Oct 30, 31, Nov 1, 2
    });
  });

  describe('getDaysBetween', () => {
    it('should calculate days between dates', () => {
      const start = new Date(2025, 9, 15);
      const end = new Date(2025, 9, 20);
      const days = getDaysBetween(start, end);

      expect(days).toBe(5);
    });

    it('should return 0 for same day', () => {
      const date = new Date(2025, 9, 15);
      const days = getDaysBetween(date, date);

      expect(days).toBe(0);
    });

    it('should handle negative for past dates', () => {
      const start = new Date(2025, 9, 20);
      const end = new Date(2025, 9, 15);
      const days = getDaysBetween(start, end);

      expect(days).toBe(-5);
    });
  });

  describe('getAbbreviatedDayName', () => {
    it('should return abbreviated day name', () => {
      // Oct 15, 2025 is a Wednesday
      const result = getAbbreviatedDayName(testDate);

      expect(result).toBe('Wed');
    });

    it('should work with ISO string', () => {
      const result = getAbbreviatedDayName('2025-10-15');

      expect(result).toBe('Wed');
    });

    it('should return correct abbreviations for all days', () => {
      // Oct 12-18, 2025 is Sun-Sat
      const sunday = new Date(2025, 9, 12);
      const monday = new Date(2025, 9, 13);

      expect(getAbbreviatedDayName(sunday)).toBe('Sun');
      expect(getAbbreviatedDayName(monday)).toBe('Mon');
    });
  });

  describe('getDayOfMonth', () => {
    it('should return day of month', () => {
      const result = getDayOfMonth(testDate);

      expect(result).toBe(15);
    });

    it('should work with ISO string', () => {
      const result = getDayOfMonth('2025-10-15');

      expect(result).toBe(15);
    });

    it('should handle first day of month', () => {
      const date = new Date(2025, 9, 1);
      const result = getDayOfMonth(date);

      expect(result).toBe(1);
    });

    it('should handle last day of month', () => {
      const date = new Date(2025, 9, 31);
      const result = getDayOfMonth(date);

      expect(result).toBe(31);
    });
  });

  describe('getMonthAbbreviation', () => {
    it('should return month abbreviation', () => {
      const result = getMonthAbbreviation(testDate);

      expect(result).toBe('Oct');
    });

    it('should work with ISO string', () => {
      const result = getMonthAbbreviation('2025-10-15');

      expect(result).toBe('Oct');
    });

    it('should return correct abbreviations', () => {
      const jan = new Date(2025, 0, 1);
      const dec = new Date(2025, 11, 1);

      expect(getMonthAbbreviation(jan)).toBe('Jan');
      expect(getMonthAbbreviation(dec)).toBe('Dec');
    });
  });

  describe('getTimeBasedGreeting', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return morning greeting', () => {
      // Mock getHours to return morning hour
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);

      const result = getTimeBasedGreeting();

      expect(result).toBe('Good morning');
    });

    it('should return afternoon greeting', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);

      const result = getTimeBasedGreeting();

      expect(result).toBe('Good afternoon');
    });

    it('should return evening greeting', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(20);

      const result = getTimeBasedGreeting();

      expect(result).toBe('Good evening');
    });

    it('should return morning greeting at noon boundary', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(11);

      const result = getTimeBasedGreeting();

      expect(result).toBe('Good morning');
    });

    it('should return afternoon greeting at evening boundary', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(17);

      const result = getTimeBasedGreeting();

      expect(result).toBe('Good afternoon');
    });
  });

  describe('Integration tests', () => {
    it('should work together for date range formatting', () => {
      const range = getDateRangeForPeriod('week', testDate);
      const startFormatted = formatDateDisplay(range.startDate);
      const endFormatted = formatDateDisplay(range.endDate);

      expect(startFormatted).toContain('Oct');
      expect(endFormatted).toContain('Oct');
    });

    it('should work for API date range', () => {
      const range = getLastNDays(7, testDate);
      const startAPI = formatDateForAPI(range.startDate);
      const endAPI = formatDateForAPI(range.endDate);

      expect(startAPI).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(endAPI).toBe('2025-10-15');
    });
  });
});
