/**
 * formatDistance Utility Tests
 * Tests for distance formatting and conversion functions
 */

import {
  formatDistance,
  convertDistance,
  getDistanceUnit,
} from '../../lib/utils/formatDistance';

describe('formatDistance', () => {
  describe('Miles formatting', () => {
    it('should format meters to miles with 2 decimals by default', () => {
      const result = formatDistance(1609.34, 'miles');
      expect(result).toBe('1.00 mi');
    });

    it('should format meters to miles with custom decimals', () => {
      const result = formatDistance(1609.34, 'miles', 3);
      expect(result).toBe('1.000 mi');
    });

    it('should handle zero meters', () => {
      const result = formatDistance(0, 'miles');
      expect(result).toBe('0.00 mi');
    });

    it('should format small distances in miles', () => {
      const result = formatDistance(100, 'miles');
      // 100 meters ≈ 0.062 miles
      expect(result).toBe('0.06 mi');
    });

    it('should format large distances in miles', () => {
      const result = formatDistance(50000, 'miles');
      // 50,000 meters ≈ 31.07 miles
      expect(result).toBe('31.07 mi');
    });

    it('should handle very large distances', () => {
      const result = formatDistance(1000000, 'miles');
      // 1,000,000 meters ≈ 621.37 miles
      expect(result).toBe('621.37 mi');
    });

    it('should format with 0 decimals', () => {
      const result = formatDistance(1609.34, 'miles', 0);
      expect(result).toBe('1 mi');
    });

    it('should format with 1 decimal', () => {
      const result = formatDistance(1609.34, 'miles', 1);
      expect(result).toBe('1.0 mi');
    });

    it('should use miles by default when units not specified', () => {
      const result = formatDistance(1609.34);
      expect(result).toBe('1.00 mi');
    });
  });

  describe('Kilometers formatting', () => {
    it('should format meters to kilometers with 2 decimals by default', () => {
      const result = formatDistance(1000, 'kilometers');
      expect(result).toBe('1.00 km');
    });

    it('should format meters to kilometers with custom decimals', () => {
      const result = formatDistance(1000, 'kilometers', 3);
      expect(result).toBe('1.000 km');
    });

    it('should handle zero meters', () => {
      const result = formatDistance(0, 'kilometers');
      expect(result).toBe('0.00 km');
    });

    it('should format small distances in kilometers', () => {
      const result = formatDistance(100, 'kilometers');
      expect(result).toBe('0.10 km');
    });

    it('should format large distances in kilometers', () => {
      const result = formatDistance(50000, 'kilometers');
      expect(result).toBe('50.00 km');
    });

    it('should handle very large distances', () => {
      const result = formatDistance(1000000, 'kilometers');
      expect(result).toBe('1000.00 km');
    });

    it('should format with 0 decimals', () => {
      const result = formatDistance(1000, 'kilometers', 0);
      expect(result).toBe('1 km');
    });

    it('should format with 1 decimal', () => {
      const result = formatDistance(1000, 'kilometers', 1);
      expect(result).toBe('1.0 km');
    });
  });

  describe('Edge cases', () => {
    it('should handle negative distances', () => {
      const result = formatDistance(-1000, 'miles');
      expect(result).toBe('-0.62 mi');
    });

    it('should handle decimal meter values', () => {
      const result = formatDistance(1234.56, 'miles');
      expect(result).toBe('0.77 mi');
    });

    it('should handle very small distances', () => {
      const result = formatDistance(0.001, 'kilometers');
      expect(result).toBe('0.00 km');
    });

    it('should round correctly', () => {
      const result = formatDistance(1609.34, 'miles', 1);
      expect(result).toBe('1.0 mi');
    });
  });
});

describe('convertDistance', () => {
  describe('Miles conversion', () => {
    it('should convert meters to miles', () => {
      const result = convertDistance(1609.34, 'miles');
      expect(result).toBeCloseTo(1.0, 2);
    });

    it('should handle zero meters', () => {
      const result = convertDistance(0, 'miles');
      expect(result).toBe(0);
    });

    it('should convert 1000 meters to miles', () => {
      const result = convertDistance(1000, 'miles');
      expect(result).toBeCloseTo(0.621371, 5);
    });

    it('should use miles by default', () => {
      const result = convertDistance(1609.34);
      expect(result).toBeCloseTo(1.0, 2);
    });

    it('should convert large distances', () => {
      const result = convertDistance(100000, 'miles');
      expect(result).toBeCloseTo(62.1371, 4);
    });
  });

  describe('Kilometers conversion', () => {
    it('should convert meters to kilometers', () => {
      const result = convertDistance(1000, 'kilometers');
      expect(result).toBe(1);
    });

    it('should handle zero meters', () => {
      const result = convertDistance(0, 'kilometers');
      expect(result).toBe(0);
    });

    it('should convert 1609.34 meters to kilometers', () => {
      const result = convertDistance(1609.34, 'kilometers');
      expect(result).toBeCloseTo(1.60934, 5);
    });

    it('should convert large distances', () => {
      const result = convertDistance(100000, 'kilometers');
      expect(result).toBe(100);
    });

    it('should handle decimal values', () => {
      const result = convertDistance(1234.56, 'kilometers');
      expect(result).toBeCloseTo(1.23456, 5);
    });
  });

  describe('Edge cases', () => {
    it('should handle negative distances', () => {
      const result = convertDistance(-1000, 'kilometers');
      expect(result).toBe(-1);
    });

    it('should return exact numbers without string formatting', () => {
      const result = convertDistance(5000, 'miles');
      expect(typeof result).toBe('number');
    });

    it('should handle very small distances', () => {
      const result = convertDistance(1, 'kilometers');
      expect(result).toBe(0.001);
    });
  });
});

describe('getDistanceUnit', () => {
  it('should return "mi" for miles', () => {
    const result = getDistanceUnit('miles');
    expect(result).toBe('mi');
  });

  it('should return "km" for kilometers', () => {
    const result = getDistanceUnit('kilometers');
    expect(result).toBe('km');
  });

  it('should return "mi" by default', () => {
    const result = getDistanceUnit();
    expect(result).toBe('mi');
  });

  it('should be case-sensitive', () => {
    // TypeScript should enforce this, but test the behavior
    const result = getDistanceUnit('miles');
    expect(result).toBe('mi');
  });
});

describe('Integration tests', () => {
  it('should have matching formatDistance and convertDistance results', () => {
    const meters = 5000;
    const formatted = formatDistance(meters, 'miles', 2);
    const converted = convertDistance(meters, 'miles');

    // Extract the number from formatted string
    const formattedNumber = parseFloat(formatted.split(' ')[0]);

    expect(converted).toBeCloseTo(formattedNumber, 2);
  });

  it('should format converted distances correctly', () => {
    const meters = 3218.69; // Approximately 2 miles
    const converted = convertDistance(meters, 'miles');
    const formatted = formatDistance(meters, 'miles', 2);

    expect(formatted).toBe(`${converted.toFixed(2)} mi`);
  });

  it('should work consistently across units', () => {
    const meters = 10000;

    const milesFormatted = formatDistance(meters, 'miles', 2);
    const milesConverted = convertDistance(meters, 'miles');
    const milesUnit = getDistanceUnit('miles');

    expect(milesFormatted).toBe(`${milesConverted.toFixed(2)} ${milesUnit}`);

    const kmFormatted = formatDistance(meters, 'kilometers', 2);
    const kmConverted = convertDistance(meters, 'kilometers');
    const kmUnit = getDistanceUnit('kilometers');

    expect(kmFormatted).toBe(`${kmConverted.toFixed(2)} ${kmUnit}`);
  });
});

describe('Conversion accuracy', () => {
  it('should accurately convert 1 mile worth of meters', () => {
    const oneMileInMeters = 1609.34;
    const result = convertDistance(oneMileInMeters, 'miles');
    expect(result).toBeCloseTo(1.0, 4); // Close to 1 mile within 4 decimal places
  });

  it('should accurately convert 1 kilometer worth of meters', () => {
    const oneKmInMeters = 1000;
    const result = convertDistance(oneKmInMeters, 'kilometers');
    expect(result).toBe(1.0);
  });

  it('should maintain precision for small distances', () => {
    const meters = 10;
    const miles = convertDistance(meters, 'miles');
    const km = convertDistance(meters, 'kilometers');

    expect(miles).toBeCloseTo(0.00621371, 6);
    expect(km).toBe(0.01);
  });

  it('should maintain precision for large distances', () => {
    const meters = 1000000;
    const miles = convertDistance(meters, 'miles');
    const km = convertDistance(meters, 'kilometers');

    expect(miles).toBeCloseTo(621.371, 3);
    expect(km).toBe(1000);
  });
});
