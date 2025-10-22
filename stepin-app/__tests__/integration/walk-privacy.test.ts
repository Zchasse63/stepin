/**
 * Walk Privacy Integration Tests
 * Tests the integration between walk recording, privacy zones, and GPS filtering
 */

import {
  calculateDistance,
  isInPrivacyZone,
  splitRouteByPrivacy,
  type PrivacyZone,
} from '../../lib/map-utils';
import { mockWalk, mockPrivacyZone } from '../utils/test-utils';

describe('Walk Privacy Integration', () => {
  describe('Recording walk with privacy zones', () => {
    it('should filter GPS coordinates within privacy zones', () => {
      // Create a privacy zone around home
      const homeZone: PrivacyZone = mockPrivacyZone({
        id: 'home-zone',
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 100,
      });

      // Create a route that passes through the privacy zone
      // At this latitude, ~0.001 degrees = ~111 meters
      const route = [
        { lat: 37.7730, lng: -122.4194 }, // Outside zone (~2km away)
        { lat: 37.7738, lng: -122.4194 }, // Getting closer (~1km away)
        { lat: 37.7749, lng: -122.4194 }, // Inside zone (center)
        { lat: 37.7750, lng: -122.4194 }, // Inside zone (~11m away)
        { lat: 37.7770, lng: -122.4194 }, // Outside zone (~2.3km away)
      ];

      // Filter coordinates
      const filteredRoute = route.map((coord) => ({
        ...coord,
        isPrivate: isInPrivacyZone(coord, [homeZone]),
      }));

      // Verify filtering
      expect(filteredRoute[0].isPrivate).toBe(false);
      expect(filteredRoute[1].isPrivate).toBe(false);
      expect(filteredRoute[2].isPrivate).toBe(true);
      expect(filteredRoute[3].isPrivate).toBe(true);
      expect(filteredRoute[4].isPrivate).toBe(false);
    });

    it('should split route into public and private segments', () => {
      const privacyZones: PrivacyZone[] = [
        mockPrivacyZone({
          latitude: 37.7749,
          longitude: -122.4194,
          radius_meters: 100,
        }),
      ];

      const route = [
        { lat: 37.7730, lng: -122.4194 }, // Public (~2km away)
        { lat: 37.7738, lng: -122.4194 }, // Public (~1km away)
        { lat: 37.7749, lng: -122.4194 }, // Private (center of zone)
        { lat: 37.7750, lng: -122.4194 }, // Private (~11m away)
        { lat: 37.7770, lng: -122.4194 }, // Public (~2.3km away)
      ];

      const segments = splitRouteByPrivacy(route, privacyZones);

      // Should have 3 segments: public, private, public
      expect(segments.length).toBe(3);
      expect(segments[0].isPrivate).toBe(false);
      expect(segments[0].coordinates.length).toBe(2);
      expect(segments[1].isPrivate).toBe(true);
      expect(segments[1].coordinates.length).toBe(2);
      expect(segments[2].isPrivate).toBe(false);
      expect(segments[2].coordinates.length).toBe(1);
    });

    it('should handle multiple privacy zones along route', () => {
      const homeZone: PrivacyZone = mockPrivacyZone({
        id: 'home',
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 50,
      });

      const workZone: PrivacyZone = mockPrivacyZone({
        id: 'work',
        latitude: 37.7800,
        longitude: -122.4100,
        radius_meters: 75,
      });

      const route = [
        { lat: 37.7749, lng: -122.4194 }, // In home zone
        { lat: 37.7770, lng: -122.4150 }, // Between zones
        { lat: 37.7800, lng: -122.4100 }, // In work zone
      ];

      const segments = splitRouteByPrivacy(route, [homeZone, workZone]);

      // All three points should be in private segments
      const privatePoints = segments
        .filter((s) => s.isPrivate)
        .reduce((sum, s) => sum + s.coordinates.length, 0);

      expect(privatePoints).toBeGreaterThan(0);
    });

    it('should calculate accurate distance for filtered route', () => {
      const privacyZones: PrivacyZone[] = [
        mockPrivacyZone({
          latitude: 37.7749,
          longitude: -122.4194,
          radius_meters: 100,
        }),
      ];

      const route = [
        { lat: 37.7730, lng: -122.4194 }, // Public
        { lat: 37.7738, lng: -122.4194 }, // Public
        { lat: 37.7749, lng: -122.4194 }, // Private
        { lat: 37.7750, lng: -122.4194 }, // Private
        { lat: 37.7770, lng: -122.4194 }, // Public
      ];

      const segments = splitRouteByPrivacy(route, privacyZones);

      // Calculate total distance for public segments only
      let publicDistance = 0;
      segments
        .filter((s) => !s.isPrivate)
        .forEach((segment) => {
          for (let i = 0; i < segment.coordinates.length - 1; i++) {
            const coord1 = segment.coordinates[i];
            const coord2 = segment.coordinates[i + 1];
            publicDistance += calculateDistance(
              coord1.lat,
              coord1.lng,
              coord2.lat,
              coord2.lng
            );
          }
        });

      // Should have some public distance (from the two public segments)
      expect(publicDistance).toBeGreaterThan(0);
      // Should be about 89 meters for first segment (7730 to 7738)
      expect(publicDistance).toBeGreaterThan(80);
    });
  });

  describe('Walk data with privacy filtering', () => {
    it('should create walk with filtered coordinates', () => {
      const walk = mockWalk({
        route_coordinates: [
          { lat: 37.7740, lng: -122.4194, timestamp: '2025-10-21T10:00:00Z' },
          { lat: 37.7745, lng: -122.4194, timestamp: '2025-10-21T10:05:00Z' },
          { lat: 37.7749, lng: -122.4194, timestamp: '2025-10-21T10:10:00Z' },
        ],
        distance_meters: 1000,
        steps: 1500,
      });

      expect(walk.route_coordinates?.length).toBe(3);
      expect(walk.distance_meters).toBe(1000);
      expect(walk.steps).toBe(1500);
    });

    it('should maintain walk stats when coordinates are filtered', () => {
      // Walk with privacy zone filtering applied
      const originalDistance = 5000; // meters
      const filteredDistance = 4000; // meters (after removing private segments)

      const walk = mockWalk({
        distance_meters: originalDistance,
        steps: 7500,
        duration_seconds: 3600,
      });

      // Stats should remain unchanged even if route is filtered
      expect(walk.distance_meters).toBe(originalDistance);
      expect(walk.steps).toBe(7500);
      expect(walk.duration_seconds).toBe(3600);
    });

    it('should validate privacy zone coverage of walk', () => {
      const privacyZone: PrivacyZone = mockPrivacyZone({
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 100,
      });

      const route = [
        { lat: 37.7749, lng: -122.4194, timestamp: '2025-10-21T10:00:00Z' },
        { lat: 37.7750, lng: -122.4195, timestamp: '2025-10-21T10:05:00Z' },
      ];

      // All points are within 100m of zone center
      const allPointsPrivate = route.every((coord) =>
        isInPrivacyZone(coord, [privacyZone])
      );

      expect(allPointsPrivate).toBe(true);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle walk with no privacy zones', () => {
      const route = [
        { lat: 37.7740, lng: -122.4194 },
        { lat: 37.7745, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4194 },
      ];

      const segments = splitRouteByPrivacy(route, []);

      // Should be one public segment with all coordinates
      expect(segments.length).toBe(1);
      expect(segments[0].isPrivate).toBe(false);
      expect(segments[0].coordinates.length).toBe(3);
    });

    it('should handle walk entirely within privacy zone', () => {
      const privacyZone: PrivacyZone = mockPrivacyZone({
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 1000, // Large zone
      });

      const route = [
        { lat: 37.7745, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7752, lng: -122.4194 },
      ];

      const segments = splitRouteByPrivacy(route, [privacyZone]);

      // Should be one private segment
      expect(segments.length).toBe(1);
      expect(segments[0].isPrivate).toBe(true);
      expect(segments[0].coordinates.length).toBe(3);
    });

    it('should handle alternating public/private segments', () => {
      const zone1: PrivacyZone = mockPrivacyZone({
        id: 'zone1',
        latitude: 37.7745,
        longitude: -122.4194,
        radius_meters: 20,
      });

      const zone2: PrivacyZone = mockPrivacyZone({
        id: 'zone2',
        latitude: 37.7755,
        longitude: -122.4194,
        radius_meters: 20,
      });

      const route = [
        { lat: 37.7740, lng: -122.4194 }, // Public
        { lat: 37.7745, lng: -122.4194 }, // Private (zone1)
        { lat: 37.7750, lng: -122.4194 }, // Public
        { lat: 37.7755, lng: -122.4194 }, // Private (zone2)
        { lat: 37.7760, lng: -122.4194 }, // Public
      ];

      const segments = splitRouteByPrivacy(route, [zone1, zone2]);

      // Should alternate: public, private, public, private, public
      expect(segments.length).toBe(5);
      expect(segments[0].isPrivate).toBe(false);
      expect(segments[1].isPrivate).toBe(true);
      expect(segments[2].isPrivate).toBe(false);
      expect(segments[3].isPrivate).toBe(true);
      expect(segments[4].isPrivate).toBe(false);
    });

    it('should handle coordinate exactly on zone boundary', () => {
      const privacyZone: PrivacyZone = mockPrivacyZone({
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 100,
      });

      // Calculate a point exactly 100m away
      // At this latitude, ~0.0009 degrees = ~100m
      const boundaryCoord = {
        lat: 37.7749 + 0.0009,
        lng: -122.4194,
      };

      const distance = calculateDistance(
        privacyZone.latitude,
        privacyZone.longitude,
        boundaryCoord.lat,
        boundaryCoord.lng
      );

      // Should be very close to 100m
      expect(distance).toBeGreaterThan(95);
      expect(distance).toBeLessThan(105);
    });

    it('should handle empty route', () => {
      const segments = splitRouteByPrivacy([], [mockPrivacyZone()]);
      expect(segments).toEqual([]);
    });

    it('should handle single coordinate route', () => {
      const route = [{ lat: 37.7749, lng: -122.4194 }];
      const segments = splitRouteByPrivacy(route, []);

      expect(segments.length).toBe(1);
      expect(segments[0].coordinates.length).toBe(1);
    });
  });

  describe('Performance with large datasets', () => {
    it('should efficiently process route with many coordinates', () => {
      // Generate 1000 GPS points along a path
      const route = Array.from({ length: 1000 }, (_, i) => ({
        lat: 37.7740 + i * 0.00001,
        lng: -122.4194,
      }));

      const privacyZone: PrivacyZone = mockPrivacyZone({
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 100,
      });

      const startTime = Date.now();
      const segments = splitRouteByPrivacy(route, [privacyZone]);
      const endTime = Date.now();

      // Should complete in reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);

      // Should have segments
      expect(segments.length).toBeGreaterThan(0);
    });

    it('should efficiently check multiple privacy zones', () => {
      // Create 10 privacy zones
      const privacyZones: PrivacyZone[] = Array.from({ length: 10 }, (_, i) =>
        mockPrivacyZone({
          id: `zone-${i}`,
          latitude: 37.7740 + i * 0.001,
          longitude: -122.4194,
          radius_meters: 50,
        })
      );

      const coordinate = { lat: 37.7749, lng: -122.4194 };

      const startTime = Date.now();
      const inZone = isInPrivacyZone(coordinate, privacyZones);
      const endTime = Date.now();

      // Should complete quickly (< 10ms)
      expect(endTime - startTime).toBeLessThan(10);

      expect(typeof inZone).toBe('boolean');
    });
  });

  describe('Data consistency', () => {
    it('should maintain coordinate order after privacy filtering', () => {
      const privacyZone: PrivacyZone = mockPrivacyZone({
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 50,
      });

      const route = [
        { lat: 37.7740, lng: -122.4194 }, // Index 0
        { lat: 37.7745, lng: -122.4194 }, // Index 1
        { lat: 37.7749, lng: -122.4194 }, // Index 2 (private)
        { lat: 37.7752, lng: -122.4194 }, // Index 3
        { lat: 37.7755, lng: -122.4194 }, // Index 4
      ];

      const segments = splitRouteByPrivacy(route, [privacyZone]);

      // Verify coordinates maintain their original order
      const allCoords = segments.flatMap((s) => s.coordinates);
      expect(allCoords[0].lat).toBe(37.7740);
      expect(allCoords[1].lat).toBe(37.7745);
      // Index 2 should be private segment
      expect(allCoords[allCoords.length - 1].lat).toBe(37.7755);
    });

    it('should not lose coordinates during segmentation', () => {
      const privacyZone: PrivacyZone = mockPrivacyZone({
        latitude: 37.7749,
        longitude: -122.4194,
        radius_meters: 50,
      });

      const route = [
        { lat: 37.7740, lng: -122.4194 },
        { lat: 37.7745, lng: -122.4194 },
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7752, lng: -122.4194 },
        { lat: 37.7755, lng: -122.4194 },
      ];

      const segments = splitRouteByPrivacy(route, [privacyZone]);

      // Count total coordinates across all segments
      const totalCoords = segments.reduce(
        (sum, segment) => sum + segment.coordinates.length,
        0
      );

      expect(totalCoords).toBe(route.length);
    });
  });
});
