/**
 * Date utility functions for history and progress tracking
 */

import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  subDays,
  format,
  parseISO,
  isToday,
  isSameDay,
  eachDayOfInterval,
  differenceInDays
} from 'date-fns';
import { TimePeriod, DateRange } from '../../types/history';

/**
 * Get date range for a given time period
 */
export function getDateRangeForPeriod(period: TimePeriod, referenceDate: Date = new Date()): DateRange {
  switch (period) {
    case 'week':
      return {
        startDate: startOfWeek(referenceDate, { weekStartsOn: 0 }), // Sunday
        endDate: endOfWeek(referenceDate, { weekStartsOn: 0 })
      };
    case 'month':
      return {
        startDate: startOfMonth(referenceDate),
        endDate: endOfMonth(referenceDate)
      };
    case 'year':
      return {
        startDate: startOfYear(referenceDate),
        endDate: endOfYear(referenceDate)
      };
  }
}

/**
 * Get last N days date range
 */
export function getLastNDays(days: number, endDate: Date = new Date()): DateRange {
  return {
    startDate: subDays(endDate, days - 1),
    endDate
  };
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date | string, formatString: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format date for API (ISO date string)
 */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Check if date is today
 */
export function isDateToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: Date | string, date2: Date | string): boolean {
  const date1Obj = typeof date1 === 'string' ? parseISO(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(date1Obj, date2Obj);
}

/**
 * Get all dates in a range
 */
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Get number of days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate);
}

/**
 * Get abbreviated day name (Mon, Tue, etc.)
 */
export function getAbbreviatedDayName(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEE');
}

/**
 * Get day of month (1-31)
 */
export function getDayOfMonth(date: Date | string): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.getDate();
}

/**
 * Get month abbreviation (Jan, Feb, etc.)
 */
export function getMonthAbbreviation(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM');
}

/**
 * Get time-based greeting
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

