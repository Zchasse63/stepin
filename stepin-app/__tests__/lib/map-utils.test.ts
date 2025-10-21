/**
 * Map Utilities Tests
 * Tests for geographic calculations and map-related helpers
 */

import {
  calculateDistance,
  isInPrivacyZone,
  splitRouteByPrivacy,
  createCircleGeoJSON,
  calculateBounds,
  convertToLineString,
  PrivacyZone,
} from '../../lib/map-utils';
import type { GeoCoordinate } from '../../types/database';

describe('Map Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // San Francisco to Los Angeles (approximately 559 km)
      const sanFrancisco = { lat: 37.7749, lng: -122.4194 };
      const losAngeles = { lat: 34.0522, lng: -118.2437 };

      const distance = calculateDistance(
        sanFrancisco.lat,
        sanFrancisco.lng,
        losAngeles.lat,
        losAngeles.lng
      );

      // Allow 1% margin of error
      expect(distance).toBeGreaterThan(550000); // 550 km
      expect(distance).toBeLessThan(565000); // 565 km
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(37.7749, -122.4194, 37.7749, -122.4194);
      expect(distance).toBe(0);
    });

    it('should calculate short distances accurately', () => {
      // Two points approximately 100 meters apart
      const point1 = { lat: 37.7749, lng: -122.4194 };
      const point2 = { lat: 37.7758, lng: -122.4194 }; // ~100m north

      const distance = calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);

      // Allow 5% margin of error for short distances
      expect(distance).toBeGreaterThan(95);
      expect(distance).toBeLessThan(105);
    });

    it('should handle equator crossing', () => {
      const northHemisphere = { lat: 5, lng: 0 };
      const southHemisphere = { lat: -5, lng: 0 };

      const distance = calculateDistance(
        northHemisphere.lat,
        northHemisphere.lng,
        southHemisphere.lat,
        southHemisphere.lng
      );

      expect(distance).toBeGreaterThan(1100000); // ~1100 km
      expect(distance).toBeLessThan(1120000);
    });

    it('should handle prime meridian crossing', () => {
      const west = { lat: 0, lng: -5 };
      const east = { lat: 0, lng: 5 };

      const distance = calculateDistance(west.lat, west.lng, east.lat, east.lng);

      expect(distance).toBeGreaterThan(1100000); // ~1100 km
      expect(distance).toBeLessThan(1120000);
    });
  });

  describe('isInPrivacyZone', () => {
    const homeZone: PrivacyZone = {
      id: '1',
      name: 'Home',
      latitude: 37.7749,
      longitude: -122.4194,
      radius_meters: 250,
    };

    const workZone: PrivacyZone = {
      id: '2',
      name: 'Work',
      latitude: 37.7849,
      longitude: -122.4094,
      radius_meters: 100,
    };

    it('should return true for coordinate inside privacy zone', () => {
      const coord: GeoCoordinate = { lat: 37.7749, lng: -122.4194 };
      expect(isInPrivacyZone(coord, [homeZone])).toBe(true);
    });

    it('should return false for coordinate outside privacy zone', () => {
      const coord: GeoCoordinate = { lat: 37.8049, lng: -122.4394 }; // ~3.3 km away
      expect(isInPrivacyZone(coord, [homeZone])).toBe(false);
    });

    it('should return true if coordinate is in any of multiple zones', () => {
      const coord: GeoCoordinate = { lat: 37.7849, lng: -122.4094 }; // At work
      expect(isInPrivacyZone(coord, [homeZone, workZone])).toBe(true);
    });

    it('should return false for empty privacy zones array', () => {
      const coord: GeoCoordinate = { lat: 37.7749, lng: -122.4194 };
      expect(isInPrivacyZone(coord, [])).toBe(false);
    });

    it('should handle coordinate on zone boundary', () => {
      // Create a point very close to the boundary (249m away)
      const coord: GeoCoordinate = {
        lat: 37.7749 + (249 / 6371000) * (180 / Math.PI),
        lng: -122.4194,
      };
      expect(isInPrivacyZone(coord, [homeZone])).toBe(true);
    });
  });

  describe('splitRouteByPrivacy', () => {
    const privacyZone: PrivacyZone = {
      id: '1',
      name: 'Home',
      latitude: 37.7750,
      longitude: -122.4194,
      radius_meters: 200,
    };

    it('should return single public segment when no privacy zones', () => {
      const route: GeoCoordinate[] = [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7759, lng: -122.4184 },
        { lat: 37.7769, lng: -122.4174 },
      ];

      const segments = splitRouteByPrivacy(route, []);

      expect(segments).toHaveLength(1);
      expect(segments[0].isPrivate).toBe(false);
      expect(segments[0].coordinates).toEqual(route);
    });

    it('should split route into private and public segments', () => {
      const route: GeoCoordinate[] = [
        { lat: 37.7750, lng: -122.4194 }, // Inside zone
        { lat: 37.7751, lng: -122.4194 }, // Inside zone
        { lat: 37.7850, lng: -122.4094 }, // Outside zone
        { lat: 37.7950, lng: -122.3994 }, // Outside zone
      ];

      const segments = splitRouteByPrivacy(route, [privacyZone]);

      expect(segments.length).toBeGreaterThan(1);
      expect(segments[0].isPrivate).toBe(true);
      expect(segments[segments.length - 1].isPrivate).toBe(false);
    });

    it('should handle route entirely within privacy zone', () => {
      const route: GeoCoordinate[] = [
        { lat: 37.7750, lng: -122.4194 },
        { lat: 37.7751, lng: -122.4194 },
      ];

      const segments = splitRouteByPrivacy(route, [privacyZone]);

      expect(segments).toHaveLength(1);
      expect(segments[0].isPrivate).toBe(true);
      expect(segments[0].coordinates).toHaveLength(2);
    });

    it('should handle route entirely outside privacy zone', () => {
      const route: GeoCoordinate[] = [
        { lat: 37.8050, lng: -122.4394 },
        { lat: 37.8060, lng: -122.4384 },
      ];

      const segments = splitRouteByPrivacy(route, [privacyZone]);

      expect(segments).toHaveLength(1);
      expect(segments[0].isPrivate).toBe(false);
    });

    it('should handle multiple transitions between private and public', () => {
      const route: GeoCoordinate[] = [
        { lat: 37.7750, lng: -122.4194 }, // Private
        { lat: 37.7850, lng: -122.4094 }, // Public
        { lat: 37.7750, lng: -122.4194 }, // Private again
        { lat: 37.7950, lng: -122.3994 }, // Public again
      ];

      const segments = splitRouteByPrivacy(route, [privacyZone]);

      expect(segments.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('createCircleGeoJSON', () => {
    it('should create valid GeoJSON polygon', () => {
      const center = { lat: 37.7749, lng: -122.4194 };
      const radius = 250;

      const circle = createCircleGeoJSON(center, radius);

      expect(circle.type).toBe('Feature');
      expect(circle.geometry.type).toBe('Polygon');
      expect(circle.geometry.coordinates).toHaveLength(1);
      expect(circle.geometry.coordinates[0].length).toBe(65); // 64 points + 1 closing
    });

    it('should create circle with custom number of points', () => {
      const center = { lat: 37.7749, lng: -122.4194 };
      const radius = 250;
      const points = 32;

      const circle = createCircleGeoJSON(center, radius, points);

      expect(circle.geometry.coordinates[0].length).toBe(points + 1);
    });

    it('should have first and last coordinates equal (closed polygon)', () => {
      const center = { lat: 37.7749, lng: -122.4194 };
      const radius = 250;

      const circle = createCircleGeoJSON(center, radius);
      const coords = circle.geometry.coordinates[0];

      expect(coords[0][0]).toBeCloseTo(coords[coords.length - 1][0], 5);
      expect(coords[0][1]).toBeCloseTo(coords[coords.length - 1][1], 5);
    });

    it('should create larger circle for larger radius', () => {
      const center = { lat: 37.7749, lng: -122.4194 };
      const smallCircle = createCircleGeoJSON(center, 100);
      const largeCircle = createCircleGeoJSON(center, 500);

      const smallCoord = smallCircle.geometry.coordinates[0][16]; // Take a point
      const largeCoord = largeCircle.geometry.coordinates[0][16]; // Same angle

      // Large circle point should be farther from center
      const smallDist = Math.sqrt(
        Math.pow(smallCoord[0] - center.lng, 2) +
          Math.pow(smallCoord[1] - center.lat, 2)
      );
      const largeDist = Math.sqrt(
        Math.pow(largeCoord[0] - center.lng, 2) +
          Math.pow(largeCoord[1] - center.lat, 2)
      );

      expect(largeDist).toBeGreaterThan(smallDist);
    });
  });

  describe('calculateBounds', () => {
    it('should calculate correct bounds for single route', () => {
      const routes: GeoCoordinate[][] = [
        [
          { lat: 37.7749, lng: -122.4194 },
          { lat: 37.7849, lng: -122.4094 },
        ],
      ];

      const bounds = calculateBounds(routes);

      expect(bounds).not.toBeNull();
      expect(bounds![0][0]).toBeLessThan(-122.4194); // minLng with padding
      expect(bounds![0][1]).toBeLessThan(37.7749); // minLat with padding
      expect(bounds![1][0]).toBeGreaterThan(-122.4094); // maxLng with padding
      expect(bounds![1][1]).toBeGreaterThan(37.7849); // maxLat with padding
    });

    it('should return null for empty routes array', () => {
      const bounds = calculateBounds([]);
      expect(bounds).toBeNull();
    });

    it('should calculate bounds for multiple routes', () => {
      const routes: GeoCoordinate[][] = [
        [
          { lat: 37.7749, lng: -122.4194 },
          { lat: 37.7759, lng: -122.4184 },
        ],
        [
          { lat: 37.7849, lng: -122.4094 },
          { lat: 37.7859, lng: -122.4084 },
        ],
      ];

      const bounds = calculateBounds(routes);

      expect(bounds).not.toBeNull();
      expect(bounds![0][0]).toBeLessThan(-122.4194);
      expect(bounds![1][0]).toBeGreaterThan(-122.4084);
    });

    it('should add 10% padding to bounds', () => {
      const routes: GeoCoordinate[][] = [
        [
          { lat: 37.7749, lng: -122.4194 },
          { lat: 37.7849, lng: -122.4094 }, // 0.01 degree difference
        ],
      ];

      const bounds = calculateBounds(routes);
      const lngPadding = (-122.4094 - -122.4194) * 0.1;
      const latPadding = (37.7849 - 37.7749) * 0.1;

      expect(bounds![0][0]).toBeCloseTo(-122.4194 - lngPadding, 5);
      expect(bounds![0][1]).toBeCloseTo(37.7749 - latPadding, 5);
      expect(bounds![1][0]).toBeCloseTo(-122.4094 + lngPadding, 5);
      expect(bounds![1][1]).toBeCloseTo(37.7849 + latPadding, 5);
    });
  });

  describe('convertToLineString', () => {
    it('should convert coordinates to GeoJSON LineString', () => {
      const coordinates: GeoCoordinate[] = [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7759, lng: -122.4184 },
        { lat: 37.7769, lng: -122.4174 },
      ];

      const lineString = convertToLineString(coordinates);

      expect(lineString.type).toBe('Feature');
      expect(lineString.geometry.type).toBe('LineString');
      expect(lineString.geometry.coordinates).toHaveLength(3);
    });

    it('should convert coordinates in correct order [lng, lat]', () => {
      const coordinates: GeoCoordinate[] = [
        { lat: 37.7749, lng: -122.4194 },
      ];

      const lineString = convertToLineString(coordinates);

      expect(lineString.geometry.coordinates[0]).toEqual([-122.4194, 37.7749]);
    });

    it('should handle empty coordinate array', () => {
      const lineString = convertToLineString([]);

      expect(lineString.geometry.coordinates).toHaveLength(0);
    });

    it('should include empty properties object', () => {
      const coordinates: GeoCoordinate[] = [
        { lat: 37.7749, lng: -122.4194 },
      ];

      const lineString = convertToLineString(coordinates);

      expect(lineString.properties).toEqual({});
    });
  });
});
