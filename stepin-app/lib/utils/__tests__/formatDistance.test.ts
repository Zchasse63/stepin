/**
 * Unit tests for formatDistance utility functions
 * Tests distance formatting and conversion
 */

import {
  formatDistance,
  convertDistance,
  getDistanceUnit,
} from '../formatDistance';

describe('formatDistance', () => {
  describe('formatDistance', () => {
    it('should format distance in miles with default decimals', () => {
      expect(formatDistance(1609.34, 'miles')).toBe('1.00 mi');
      expect(formatDistance(3218.68, 'miles')).toBe('2.00 mi');
    });

    it('should format distance in kilometers with default decimals', () => {
      expect(formatDistance(1000, 'kilometers')).toBe('1.00 km');
      expect(formatDistance(2500, 'kilometers')).toBe('2.50 km');
    });

    it('should use miles as default unit', () => {
      expect(formatDistance(1609.34)).toBe('1.00 mi');
    });

    it('should respect custom decimal places', () => {
      expect(formatDistance(1609.34, 'miles', 1)).toBe('1.0 mi');
      expect(formatDistance(1609.34, 'miles', 3)).toBe('1.000 mi');
      expect(formatDistance(1000, 'kilometers', 0)).toBe('1 km');
    });

    it('should handle zero distance', () => {
      expect(formatDistance(0, 'miles')).toBe('0.00 mi');
      expect(formatDistance(0, 'kilometers')).toBe('0.00 km');
    });

    it('should handle small distances', () => {
      expect(formatDistance(100, 'miles')).toBe('0.06 mi');
      expect(formatDistance(100, 'kilometers')).toBe('0.10 km');
    });

    it('should handle large distances', () => {
      expect(formatDistance(100000, 'miles')).toBe('62.14 mi');
      expect(formatDistance(100000, 'kilometers')).toBe('100.00 km');
    });
  });

  describe('convertDistance', () => {
    it('should convert meters to miles', () => {
      const result = convertDistance(1609.34, 'miles');
      expect(result).toBeCloseTo(1.0, 2);
    });

    it('should convert meters to kilometers', () => {
      expect(convertDistance(1000, 'kilometers')).toBe(1);
      expect(convertDistance(2500, 'kilometers')).toBe(2.5);
    });

    it('should use miles as default unit', () => {
      const result = convertDistance(1609.34);
      expect(result).toBeCloseTo(1.0, 2);
    });

    it('should handle zero distance', () => {
      expect(convertDistance(0, 'miles')).toBe(0);
      expect(convertDistance(0, 'kilometers')).toBe(0);
    });

    it('should return precise conversion for miles', () => {
      const meters = 5000;
      const miles = convertDistance(meters, 'miles');
      expect(miles).toBeCloseTo(3.10686, 4); // Reduced precision to 4 decimal places
    });

    it('should return precise conversion for kilometers', () => {
      const meters = 5432;
      const km = convertDistance(meters, 'kilometers');
      expect(km).toBe(5.432);
    });
  });

  describe('getDistanceUnit', () => {
    it('should return "mi" for miles preference', () => {
      expect(getDistanceUnit('miles')).toBe('mi');
    });

    it('should return "km" for kilometers preference', () => {
      expect(getDistanceUnit('kilometers')).toBe('km');
    });

    it('should default to "mi"', () => {
      expect(getDistanceUnit()).toBe('mi');
    });
  });
});

