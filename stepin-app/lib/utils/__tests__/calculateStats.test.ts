/**
 * Unit tests for calculateStats utility functions
 * Tests statistics calculations, formatting, and aggregations
 */

import {
  calculateSummaryStats,
  calculateTotalDuration,
  calculateTotalDistance,
  calculateAverageStepsPerWalk,
  formatNumber,
  formatDuration,
  formatDistance,
  formatDateDisplay,
  calculateGoalPercentage,
  getProgressColor,
  groupWalksByDate,
  calculateCurrentStreak,
  calculateLongestStreak,
} from '../calculateStats';
import { Walk, DailyStats } from '../../../types/database';

describe('calculateStats', () => {
  describe('calculateSummaryStats', () => {
    it('should calculate summary stats correctly', () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-02', total_steps: 8000, goal_met: true } as DailyStats,
        { date: '2025-10-03', total_steps: 5000, goal_met: false } as DailyStats,
      ];
      const walks: Walk[] = [{}, {}, {}] as Walk[];

      const result = calculateSummaryStats(dailyStats, walks);

      expect(result.totalSteps).toBe(23000);
      expect(result.totalWalks).toBe(3);
      expect(result.averageSteps).toBe(7667); // 23000 / 3 = 7666.67, rounded to 7667
      expect(result.daysGoalMet).toBe(2);
      expect(result.goalMetPercentage).toBe(67); // 2/3 = 66.67%, rounded to 67
    });

    it('should handle empty data', () => {
      const result = calculateSummaryStats([], []);

      expect(result.totalSteps).toBe(0);
      expect(result.totalWalks).toBe(0);
      expect(result.averageSteps).toBe(0);
      expect(result.daysGoalMet).toBe(0);
      expect(result.goalMetPercentage).toBe(0);
    });

    it('should filter out days with no activity for average calculation', () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', total_steps: 10000, goal_met: true } as DailyStats,
        { date: '2025-10-02', total_steps: 0, goal_met: false } as DailyStats,
        { date: '2025-10-03', total_steps: 8000, goal_met: true } as DailyStats,
      ];

      const result = calculateSummaryStats(dailyStats, []);

      expect(result.totalSteps).toBe(18000);
      expect(result.averageSteps).toBe(9000); // Only counting days with activity: 18000 / 2
    });
  });

  describe('calculateTotalDuration', () => {
    it('should calculate total duration from walks', () => {
      const walks: Walk[] = [
        { duration_minutes: 30 } as Walk,
        { duration_minutes: 45 } as Walk,
        { duration_minutes: 20 } as Walk,
      ];

      expect(calculateTotalDuration(walks)).toBe(95);
    });

    it('should handle walks with null duration', () => {
      const walks: Walk[] = [
        { duration_minutes: 30 } as Walk,
        { duration_minutes: null } as Walk,
        { duration_minutes: 20 } as Walk,
      ];

      expect(calculateTotalDuration(walks)).toBe(50);
    });

    it('should return 0 for empty walks array', () => {
      expect(calculateTotalDuration([])).toBe(0);
    });
  });

  describe('calculateTotalDistance', () => {
    it('should calculate total distance from walks', () => {
      const walks: Walk[] = [
        { distance_meters: 1000 } as Walk,
        { distance_meters: 2500 } as Walk,
        { distance_meters: 1500 } as Walk,
      ];

      expect(calculateTotalDistance(walks)).toBe(5000);
    });

    it('should handle walks with null distance', () => {
      const walks: Walk[] = [
        { distance_meters: 1000 } as Walk,
        { distance_meters: null } as Walk,
        { distance_meters: 1500 } as Walk,
      ];

      expect(calculateTotalDistance(walks)).toBe(2500);
    });

    it('should return 0 for empty walks array', () => {
      expect(calculateTotalDistance([])).toBe(0);
    });
  });

  describe('calculateAverageStepsPerWalk', () => {
    it('should calculate average steps per walk', () => {
      const walks: Walk[] = [
        { steps: 5000 } as Walk,
        { steps: 7000 } as Walk,
        { steps: 3000 } as Walk,
      ];

      expect(calculateAverageStepsPerWalk(walks)).toBe(5000); // 15000 / 3
    });

    it('should return 0 for empty walks array', () => {
      expect(calculateAverageStepsPerWalk([])).toBe(0);
    });

    it('should round to nearest integer', () => {
      const walks: Walk[] = [
        { steps: 5000 } as Walk,
        { steps: 5001 } as Walk,
      ];

      expect(calculateAverageStepsPerWalk(walks)).toBe(5001); // 10001 / 2 = 5000.5, rounded to 5001
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(12345)).toBe('12,345');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only for durations under 60 minutes', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(59)).toBe('59m');
    });

    it('should format hours and minutes for durations over 60 minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(125)).toBe('2h 5m');
    });

    it('should format hours only when minutes is 0', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });
  });

  describe('formatDistance', () => {
    it('should format meters for distances under 1000m', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format kilometers for distances over 1000m', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(2500)).toBe('2.5km');
      expect(formatDistance(5432)).toBe('5.4km');
    });
  });

  describe('formatDateDisplay', () => {
    beforeEach(() => {
      // Mock Date to return consistent value in local time
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 9, 9, 12, 0, 0)); // Oct 9, 2025 12:00 PM local time
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Today" for today\'s date', () => {
      const today = new Date(2025, 9, 9); // Oct 9, 2025 local time
      expect(formatDateDisplay(today)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date(2025, 9, 8); // Oct 8, 2025 local time
      expect(formatDateDisplay(yesterday)).toBe('Yesterday');
    });

    it('should format other dates', () => {
      const date = new Date(2025, 9, 1); // Oct 1, 2025 local time
      expect(formatDateDisplay(date)).toContain('Oct');
      expect(formatDateDisplay(date)).toContain('1');
    });

    it('should handle string dates', () => {
      const formatted = formatDateDisplay('2025-10-09');
      // String dates may be parsed differently, just check it returns a string
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle custom format', () => {
      const date = new Date(2025, 9, 1); // Oct 1, 2025 local time
      expect(formatDateDisplay(date, 'MMM')).toBe('Oct');
    });
  });

  describe('calculateGoalPercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculateGoalPercentage(5000, 10000)).toBe(50);
      expect(calculateGoalPercentage(7500, 10000)).toBe(75);
      expect(calculateGoalPercentage(10000, 10000)).toBe(100);
    });

    it('should handle exceeding goal', () => {
      expect(calculateGoalPercentage(12000, 10000)).toBe(120);
    });

    it('should return 0 when goal is 0', () => {
      expect(calculateGoalPercentage(5000, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(calculateGoalPercentage(3333, 10000)).toBe(33); // 33.33%
      expect(calculateGoalPercentage(6666, 10000)).toBe(67); // 66.66%
    });
  });

  describe('getProgressColor', () => {
    it('should return gold for 100% or more', () => {
      expect(getProgressColor(100)).toBe('#FFD700');
      expect(getProgressColor(150)).toBe('#FFD700');
    });

    it('should return dark green for 75-99%', () => {
      expect(getProgressColor(75)).toBe('#2E7D32');
      expect(getProgressColor(99)).toBe('#2E7D32');
    });

    it('should return medium green for 50-74%', () => {
      expect(getProgressColor(50)).toBe('#4CAF50');
      expect(getProgressColor(74)).toBe('#4CAF50');
    });

    it('should return light green for 25-49%', () => {
      expect(getProgressColor(25)).toBe('#A8E6CF');
      expect(getProgressColor(49)).toBe('#A8E6CF');
    });

    it('should return gray for under 25%', () => {
      expect(getProgressColor(0)).toBe('#9E9E9E');
      expect(getProgressColor(24)).toBe('#9E9E9E');
    });
  });

  describe('groupWalksByDate', () => {
    it('should group walks by date', () => {
      const walks: Walk[] = [
        { date: '2025-10-01', id: '1' } as Walk,
        { date: '2025-10-01', id: '2' } as Walk,
        { date: '2025-10-02', id: '3' } as Walk,
      ];

      const grouped = groupWalksByDate(walks);

      expect(grouped.size).toBe(2);
      expect(grouped.get('2025-10-01')).toHaveLength(2);
      expect(grouped.get('2025-10-02')).toHaveLength(1);
    });

    it('should handle empty walks array', () => {
      const grouped = groupWalksByDate([]);
      expect(grouped.size).toBe(0);
    });
  });

  describe('calculateCurrentStreak', () => {
    it('should calculate current streak correctly', () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-09', goal_met: true } as DailyStats,
        { date: '2025-10-08', goal_met: true } as DailyStats,
        { date: '2025-10-07', goal_met: true } as DailyStats,
        { date: '2025-10-06', goal_met: false } as DailyStats,
      ];

      expect(calculateCurrentStreak(dailyStats)).toBe(3);
    });

    it('should return 0 if most recent day did not meet goal', () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-09', goal_met: false } as DailyStats,
        { date: '2025-10-08', goal_met: true } as DailyStats,
      ];

      expect(calculateCurrentStreak(dailyStats)).toBe(0);
    });

    it('should return 0 for empty array', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });
  });

  describe('calculateLongestStreak', () => {
    it('should calculate longest streak correctly', () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', goal_met: true } as DailyStats,
        { date: '2025-10-02', goal_met: true } as DailyStats,
        { date: '2025-10-03', goal_met: true } as DailyStats,
        { date: '2025-10-04', goal_met: false } as DailyStats,
        { date: '2025-10-05', goal_met: true } as DailyStats,
        { date: '2025-10-06', goal_met: true } as DailyStats,
      ];

      expect(calculateLongestStreak(dailyStats)).toBe(3);
    });

    it('should return 0 for empty array', () => {
      expect(calculateLongestStreak([])).toBe(0);
    });

    it('should handle all days meeting goal', () => {
      const dailyStats: DailyStats[] = [
        { date: '2025-10-01', goal_met: true } as DailyStats,
        { date: '2025-10-02', goal_met: true } as DailyStats,
        { date: '2025-10-03', goal_met: true } as DailyStats,
      ];

      expect(calculateLongestStreak(dailyStats)).toBe(3);
    });
  });
});

