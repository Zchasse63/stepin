/**
 * Dashboard Data Aggregation Integration Tests
 * Tests integration between date utilities, distance formatting, and walk data aggregation
 */

import {
  getDateRangeForPeriod,
  getLastNDays,
  formatDateDisplay,
  formatDateForAPI,
  areSameDay,
  getDatesInRange,
  getDaysBetween,
} from '../../lib/utils/dateUtils';
import {
  formatDistance,
  convertDistance,
  getDistanceUnit,
} from '../../lib/utils/formatDistance';
import { mockWalk } from '../utils/test-utils';
import type { Walk } from '../../types/supabase';

describe('Dashboard Data Aggregation', () => {
  const testDate = new Date(2025, 9, 21, 12, 0, 0); // Oct 21, 2025

  describe('Weekly stats aggregation', () => {
    it('should aggregate steps for current week', () => {
      // Get current week range (Sunday to Saturday)
      const { startDate, endDate } = getDateRangeForPeriod('week', testDate);

      // Create walks for the week
      const walks: Walk[] = [
        mockWalk({
          id: 'walk-1',
          date: formatDateForAPI(startDate),
          steps: 5000,
        }),
        mockWalk({
          id: 'walk-2',
          date: formatDateForAPI(new Date(startDate.getTime() + 86400000)), // +1 day
          steps: 7000,
        }),
        mockWalk({
          id: 'walk-3',
          date: formatDateForAPI(endDate),
          steps: 8500,
        }),
      ];

      // Aggregate steps
      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);

      expect(totalSteps).toBe(20500);
    });

    it('should aggregate distance for week with unit conversion', () => {
      const { startDate, endDate } = getDateRangeForPeriod('week', testDate);

      const walks: Walk[] = [
        mockWalk({
          date: formatDateForAPI(startDate),
          distance_meters: 5000,
        }),
        mockWalk({
          date: formatDateForAPI(new Date(startDate.getTime() + 86400000)),
          distance_meters: 7500,
        }),
        mockWalk({
          date: formatDateForAPI(endDate),
          distance_meters: 10000,
        }),
      ];

      const totalMeters = walks.reduce(
        (sum, walk) => sum + walk.distance_meters,
        0
      );
      const totalMiles = convertDistance(totalMeters, 'miles');
      const formattedDistance = formatDistance(totalMeters, 'miles', 2);

      expect(totalMeters).toBe(22500);
      expect(totalMiles).toBeCloseTo(13.98, 2);
      expect(formattedDistance).toBe('13.98 mi');
    });

    it('should calculate daily averages for week', () => {
      const { startDate, endDate } = getDateRangeForPeriod('week', testDate);
      const daysInPeriod = getDaysBetween(startDate, endDate) + 1; // +1 for inclusive

      const walks: Walk[] = [
        mockWalk({ date: formatDateForAPI(startDate), steps: 8000 }),
        mockWalk({
          date: formatDateForAPI(new Date(startDate.getTime() + 86400000)),
          steps: 10000,
        }),
        mockWalk({
          date: formatDateForAPI(new Date(startDate.getTime() + 2 * 86400000)),
          steps: 7000,
        }),
      ];

      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);
      const averageSteps = Math.round(totalSteps / daysInPeriod);

      expect(daysInPeriod).toBe(7);
      expect(totalSteps).toBe(25000);
      expect(averageSteps).toBe(3571); // 25000 / 7
    });

    it('should filter walks by date range', () => {
      const { startDate, endDate } = getDateRangeForPeriod('week', testDate);

      const walks: Walk[] = [
        mockWalk({
          id: 'before',
          date: '2025-10-01',
          steps: 5000,
        }), // Before week
        mockWalk({
          id: 'during-1',
          date: formatDateForAPI(startDate),
          steps: 7000,
        }),
        mockWalk({
          id: 'during-2',
          date: formatDateForAPI(endDate),
          steps: 8000,
        }),
        mockWalk({
          id: 'after',
          date: '2025-11-01',
          steps: 6000,
        }), // After week
      ];

      // Filter walks within date range
      const walksInRange = walks.filter((walk) => {
        const walkDate = new Date(walk.date);
        return walkDate >= startDate && walkDate <= endDate;
      });

      expect(walksInRange.length).toBe(2);
      expect(walksInRange[0].id).toBe('during-1');
      expect(walksInRange[1].id).toBe('during-2');
    });
  });

  describe('Monthly stats aggregation', () => {
    it('should aggregate steps for entire month', () => {
      const { startDate, endDate } = getDateRangeForPeriod('month', testDate);

      // Create walks throughout the month
      const walks: Walk[] = Array.from({ length: 15 }, (_, i) => {
        const walkDate = new Date(startDate);
        walkDate.setDate(startDate.getDate() + i * 2); // Every other day

        return mockWalk({
          id: `walk-${i}`,
          date: formatDateForAPI(walkDate),
          steps: 8000,
        });
      });

      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);

      expect(totalSteps).toBe(120000); // 15 walks × 8000 steps
    });

    it('should calculate month completion percentage', () => {
      const { startDate, endDate } = getDateRangeForPeriod('month', testDate);
      const daysInMonth = getDaysBetween(startDate, endDate) + 1;

      // 20 walks out of 31 days
      const walksCompleted = 20;
      const completionRate = (walksCompleted / daysInMonth) * 100;

      expect(daysInMonth).toBe(31); // October has 31 days
      expect(Math.round(completionRate)).toBe(65); // 20/31 ≈ 64.5%
    });

    it('should identify days with multiple walks', () => {
      const walks: Walk[] = [
        mockWalk({ id: 'walk-1', date: '2025-10-15', steps: 5000 }),
        mockWalk({ id: 'walk-2', date: '2025-10-15', steps: 3000 }), // Same day
        mockWalk({ id: 'walk-3', date: '2025-10-16', steps: 7000 }),
      ];

      // Group walks by date
      const walksByDate = walks.reduce(
        (acc, walk) => {
          if (!acc[walk.date]) {
            acc[walk.date] = [];
          }
          acc[walk.date].push(walk);
          return acc;
        },
        {} as Record<string, Walk[]>
      );

      const datesWithMultipleWalks = Object.entries(walksByDate).filter(
        ([, walksOnDate]) => walksOnDate.length > 1
      );

      expect(datesWithMultipleWalks.length).toBe(1);
      expect(datesWithMultipleWalks[0][0]).toBe('2025-10-15');
      expect(datesWithMultipleWalks[0][1].length).toBe(2);
    });
  });

  describe('Last N days aggregation', () => {
    it('should aggregate last 7 days of walks', () => {
      const { startDate, endDate } = getLastNDays(7, testDate);

      const walks: Walk[] = Array.from({ length: 7 }, (_, i) => {
        const walkDate = new Date(startDate);
        walkDate.setDate(startDate.getDate() + i);

        return mockWalk({
          id: `walk-${i}`,
          date: formatDateForAPI(walkDate),
          steps: 7500,
        });
      });

      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);
      const averageSteps = Math.round(totalSteps / 7);

      expect(totalSteps).toBe(52500);
      expect(averageSteps).toBe(7500);
    });

    it('should calculate trend over last 30 days', () => {
      const { startDate } = getLastNDays(30, testDate);

      // First 15 days: 5000 steps, Last 15 days: 8000 steps
      const walks: Walk[] = Array.from({ length: 30 }, (_, i) => {
        const walkDate = new Date(startDate);
        walkDate.setDate(startDate.getDate() + i);

        return mockWalk({
          id: `walk-${i}`,
          date: formatDateForAPI(walkDate),
          steps: i < 15 ? 5000 : 8000,
        });
      });

      const firstHalf = walks.slice(0, 15).reduce((sum, w) => sum + w.steps, 0) / 15;
      const secondHalf = walks.slice(15).reduce((sum, w) => sum + w.steps, 0) / 15;
      const trend = ((secondHalf - firstHalf) / firstHalf) * 100;

      expect(firstHalf).toBe(5000);
      expect(secondHalf).toBe(8000);
      expect(Math.round(trend)).toBe(60); // 60% increase
    });
  });

  describe('Distance formatting across periods', () => {
    it('should format weekly distance in miles', () => {
      const walks: Walk[] = [
        mockWalk({ distance_meters: 5000 }),
        mockWalk({ distance_meters: 7500 }),
        mockWalk({ distance_meters: 10000 }),
      ];

      const totalMeters = walks.reduce(
        (sum, walk) => sum + walk.distance_meters,
        0
      );
      const formatted = formatDistance(totalMeters, 'miles', 2);

      expect(formatted).toBe('13.98 mi');
    });

    it('should format weekly distance in kilometers', () => {
      const walks: Walk[] = [
        mockWalk({ distance_meters: 5000 }),
        mockWalk({ distance_meters: 7500 }),
        mockWalk({ distance_meters: 10000 }),
      ];

      const totalMeters = walks.reduce(
        (sum, walk) => sum + walk.distance_meters,
        0
      );
      const formatted = formatDistance(totalMeters, 'kilometers', 2);

      expect(formatted).toBe('22.50 km');
    });

    it('should convert between miles and kilometers consistently', () => {
      const meters = 10000;
      const miles = convertDistance(meters, 'miles');
      const km = convertDistance(meters, 'kilometers');

      // 10km = 6.21371 miles
      expect(miles).toBeCloseTo(6.21371, 5);
      expect(km).toBe(10);
    });
  });

  describe('Date display formatting', () => {
    it('should format date ranges for display', () => {
      const { startDate, endDate } = getDateRangeForPeriod('week', testDate);

      const startFormatted = formatDateDisplay(startDate, 'MMM d');
      const endFormatted = formatDateDisplay(endDate, 'MMM d');

      expect(startFormatted).toContain('Oct');
      expect(endFormatted).toContain('Oct');
    });

    it('should format walk dates consistently', () => {
      const walk = mockWalk({ date: '2025-10-15' });

      const formatted = formatDateDisplay(walk.date, 'MMM d, yyyy');

      expect(formatted).toBe('Oct 15, 2025');
    });

    it('should handle date comparisons for streak calculation', () => {
      const today = new Date(2025, 9, 21);
      const yesterday = new Date(2025, 9, 20);
      const twoDaysAgo = new Date(2025, 9, 19);

      const walks: Walk[] = [
        mockWalk({ date: formatDateForAPI(today) }),
        mockWalk({ date: formatDateForAPI(yesterday) }),
        mockWalk({ date: formatDateForAPI(twoDaysAgo) }),
      ];

      // Check if each walk is consecutive (1 day apart)
      const isConsecutive = walks.every((walk, i) => {
        if (i === 0) return true;
        const currentDate = new Date(walk.date);
        const previousDate = new Date(walks[i - 1].date);
        const daysDiff = Math.abs(getDaysBetween(currentDate, previousDate));
        return daysDiff === 1;
      });

      expect(isConsecutive).toBe(true);
    });
  });

  describe('Complex aggregations', () => {
    it('should calculate best week in a month', () => {
      const { startDate, endDate } = getDateRangeForPeriod('month', testDate);

      // Create walks throughout the month
      const walks: Walk[] = Array.from({ length: 28 }, (_, i) => {
        const walkDate = new Date(startDate);
        walkDate.setDate(startDate.getDate() + i);

        // Week 2 has higher steps
        const steps = i >= 7 && i < 14 ? 10000 : 6000;

        return mockWalk({
          id: `walk-${i}`,
          date: formatDateForAPI(walkDate),
          steps,
        });
      });

      // Group walks by week
      const walksByWeek = walks.reduce(
        (acc, walk) => {
          const walkDate = new Date(walk.date);
          const weekNumber = Math.floor(
            getDaysBetween(startDate, walkDate) / 7
          );
          if (!acc[weekNumber]) {
            acc[weekNumber] = [];
          }
          acc[weekNumber].push(walk);
          return acc;
        },
        {} as Record<number, Walk[]>
      );

      // Calculate total steps per week
      const weekTotals = Object.values(walksByWeek).map((weekWalks) =>
        weekWalks.reduce((sum, walk) => sum + walk.steps, 0)
      );

      const bestWeekSteps = Math.max(...weekTotals);

      expect(bestWeekSteps).toBe(70000); // Week 2: 7 days × 10000 steps
    });

    it('should calculate stats for active days only', () => {
      const { startDate } = getLastNDays(14, testDate);

      // Only 10 walks in 14 days
      const walks: Walk[] = Array.from({ length: 10 }, (_, i) => {
        const walkDate = new Date(startDate);
        walkDate.setDate(startDate.getDate() + i);

        return mockWalk({
          id: `walk-${i}`,
          date: formatDateForAPI(walkDate),
          steps: 8000,
          distance_meters: 6400,
        });
      });

      const activeDays = walks.length;
      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);
      const totalDistance = walks.reduce(
        (sum, walk) => sum + walk.distance_meters,
        0
      );

      const avgStepsPerActiveDay = totalSteps / activeDays;
      const avgDistancePerActiveDay = totalDistance / activeDays;

      expect(activeDays).toBe(10);
      expect(avgStepsPerActiveDay).toBe(8000);
      expect(avgDistancePerActiveDay).toBe(6400);
    });

    it('should aggregate multi-walk days correctly', () => {
      const walks: Walk[] = [
        mockWalk({
          id: 'morning',
          date: '2025-10-15',
          steps: 5000,
          distance_meters: 4000,
        }),
        mockWalk({
          id: 'evening',
          date: '2025-10-15',
          steps: 3000,
          distance_meters: 2400,
        }),
        mockWalk({
          id: 'next-day',
          date: '2025-10-16',
          steps: 7000,
          distance_meters: 5600,
        }),
      ];

      // Aggregate by date
      const dailyStats = walks.reduce(
        (acc, walk) => {
          if (!acc[walk.date]) {
            acc[walk.date] = { steps: 0, distance: 0 };
          }
          acc[walk.date].steps += walk.steps;
          acc[walk.date].distance += walk.distance_meters;
          return acc;
        },
        {} as Record<string, { steps: number; distance: number }>
      );

      expect(dailyStats['2025-10-15'].steps).toBe(8000);
      expect(dailyStats['2025-10-15'].distance).toBe(6400);
      expect(dailyStats['2025-10-16'].steps).toBe(7000);
    });
  });

  describe('Edge cases in aggregation', () => {
    it('should handle empty walk data', () => {
      const walks: Walk[] = [];

      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);
      const totalDistance = walks.reduce(
        (sum, walk) => sum + walk.distance_meters,
        0
      );

      expect(totalSteps).toBe(0);
      expect(totalDistance).toBe(0);
    });

    it('should handle walks with zero values', () => {
      const walks: Walk[] = [
        mockWalk({ steps: 0, distance_meters: 0 }),
        mockWalk({ steps: 5000, distance_meters: 4000 }),
      ];

      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);
      const avgSteps = totalSteps / walks.length;

      expect(totalSteps).toBe(5000);
      expect(avgSteps).toBe(2500);
    });

    it('should handle month boundary correctly', () => {
      const octWalks: Walk[] = [
        mockWalk({ date: '2025-10-30', steps: 5000 }),
        mockWalk({ date: '2025-10-31', steps: 6000 }),
      ];

      const novWalks: Walk[] = [
        mockWalk({ date: '2025-11-01', steps: 7000 }),
        mockWalk({ date: '2025-11-02', steps: 8000 }),
      ];

      const octTotal = octWalks.reduce((sum, walk) => sum + walk.steps, 0);
      const novTotal = novWalks.reduce((sum, walk) => sum + walk.steps, 0);

      expect(octTotal).toBe(11000);
      expect(novTotal).toBe(15000);
    });

    it('should handle year boundary correctly', () => {
      const { startDate, endDate } = getDateRangeForPeriod(
        'year',
        new Date(2025, 0, 15)
      );

      expect(startDate.getFullYear()).toBe(2025);
      expect(endDate.getFullYear()).toBe(2025);
      expect(startDate.getMonth()).toBe(0); // January
      expect(endDate.getMonth()).toBe(11); // December
    });
  });

  describe('Performance with large datasets', () => {
    it('should efficiently aggregate year of walks', () => {
      // Create 365 walks (one per day)
      const walks: Walk[] = Array.from({ length: 365 }, (_, i) => {
        const date = new Date(2025, 0, 1);
        date.setDate(date.getDate() + i);

        return mockWalk({
          id: `walk-${i}`,
          date: formatDateForAPI(date),
          steps: 8000,
          distance_meters: 6400,
        });
      });

      const startTime = Date.now();

      const totalSteps = walks.reduce((sum, walk) => sum + walk.steps, 0);
      const totalDistance = walks.reduce(
        (sum, walk) => sum + walk.distance_meters,
        0
      );
      const avgSteps = totalSteps / walks.length;

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(totalSteps).toBe(2920000); // 365 × 8000
      expect(avgSteps).toBe(8000);

      // Total distance: 365 * 6400 = 2,336,000 meters = ~1451.5 miles
      const formattedMiles = formatDistance(totalDistance, 'miles', 0);
      expect(formattedMiles).toMatch(/^145[0-9] mi$/); // Allow 1450-1459 mi
    });
  });
});
