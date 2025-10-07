/**
 * Date Service for E2E Testing
 * Provides mockable date/time functionality for testing streak logic
 * 
 * Usage:
 * - In production: Returns real current date/time
 * - In test mode: Returns mocked date from environment variable
 * 
 * Replace all `new Date()` calls with `dateService.now()`
 */

import { logger } from './logger';

class DateService {
  private mockDate: Date | null = null;

  constructor() {
    this.loadMockConfiguration();
  }

  /**
   * Load mock date from environment variable
   */
  private loadMockConfiguration() {
    const mockEnabled = process.env.MOCK_DATE === 'true';
    const mockDateStr = process.env.MOCK_CURRENT_DATE;

    if (mockEnabled && mockDateStr) {
      try {
        this.mockDate = new Date(mockDateStr);
        logger.info('DateService: Mock date enabled', { date: this.mockDate.toISOString() });
      } catch (error) {
        logger.error('DateService: Failed to parse MOCK_CURRENT_DATE', error);
        this.mockDate = null;
      }
    }
  }

  /**
   * Get current date/time
   * Returns mock date in test mode, real date otherwise
   */
  now(): Date {
    if (this.mockDate) {
      return new Date(this.mockDate);
    }
    return new Date();
  }

  /**
   * Get today's date at midnight (start of day)
   */
  today(): Date {
    const now = this.now();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  /**
   * Get yesterday's date at midnight
   */
  yesterday(): Date {
    const today = this.today();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  /**
   * Get tomorrow's date at midnight
   */
  tomorrow(): Date {
    const today = this.today();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  /**
   * Get date N days ago
   */
  daysAgo(days: number): Date {
    const today = this.today();
    const past = new Date(today);
    past.setDate(past.getDate() - days);
    return past;
  }

  /**
   * Get date N days from now
   */
  daysFromNow(days: number): Date {
    const today = this.today();
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    return future;
  }

  /**
   * Check if a date is today
   */
  isToday(date: Date): boolean {
    const today = this.today();
    return this.isSameDay(date, today);
  }

  /**
   * Check if a date is yesterday
   */
  isYesterday(date: Date): boolean {
    const yesterday = this.yesterday();
    return this.isSameDay(date, yesterday);
  }

  /**
   * Check if two dates are the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Get number of days between two dates
   */
  daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / oneDay);
  }

  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse date string (YYYY-MM-DD) to Date object
   */
  parseDate(dateStr: string): Date {
    return new Date(dateStr);
  }

  // Test helper methods

  /**
   * Set mock date for testing
   * @param date - Date to use as "now"
   */
  setMockDate(date: Date | string) {
    if (typeof date === 'string') {
      this.mockDate = new Date(date);
    } else {
      this.mockDate = new Date(date);
    }
    logger.info('DateService: Mock date set', { date: this.mockDate.toISOString() });
  }

  /**
   * Clear mock date (return to real time)
   */
  clearMockDate() {
    this.mockDate = null;
    logger.info('DateService: Mock date cleared');
  }

  /**
   * Advance mock date by N days
   */
  advanceDays(days: number) {
    if (!this.mockDate) {
      logger.warn('DateService: Cannot advance days - mock date not set');
      return;
    }
    this.mockDate.setDate(this.mockDate.getDate() + days);
    logger.info('DateService: Advanced mock date', { 
      days, 
      newDate: this.mockDate.toISOString() 
    });
  }

  /**
   * Check if mock mode is enabled
   */
  isMockMode(): boolean {
    return this.mockDate !== null;
  }

  /**
   * Get current mock date (or null if not in mock mode)
   */
  getMockDate(): Date | null {
    return this.mockDate ? new Date(this.mockDate) : null;
  }
}

// Export singleton instance
export const dateService = new DateService();

// Export class for testing
export { DateService };

