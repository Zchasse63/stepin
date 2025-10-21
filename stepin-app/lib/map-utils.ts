/**
 * Map Utility Functions
 * Geographic calculations and map-related helpers
 */

import type { GeoCoordinate } from '@/types/database';

export interface PrivacyZone {
  id: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  name: string;
}

export interface RouteSegment {
  coordinates: GeoCoordinate[];
  isPrivate: boolean;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 *
 * @param lat1 - Latitude of first point in degrees
 * @param lon1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lon2 - Longitude of second point in degrees
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a coordinate is within any privacy zone
 *
 * @param coord - Coordinate to check
 * @param privacyZones - Array of privacy zones
 * @returns True if coordinate is within any privacy zone
 */
export function isInPrivacyZone(
  coord: GeoCoordinate,
  privacyZones: PrivacyZone[]
): boolean {
  return privacyZones.some((zone) => {
    const distance = calculateDistance(
      coord.lat,
      coord.lng,
      zone.latitude,
      zone.longitude
    );
    return distance <= zone.radius_meters;
  });
}

/**
 * Split route into segments based on privacy zones
 * Returns array of segments with their privacy status
 *
 * @param route - Array of coordinates representing the route
 * @param privacyZones - Array of privacy zones
 * @returns Array of route segments with privacy status
 */
export function splitRouteByPrivacy(
  route: GeoCoordinate[],
  privacyZones: PrivacyZone[]
): RouteSegment[] {
  if (!privacyZones || privacyZones.length === 0) {
    return [{ coordinates: route, isPrivate: false }];
  }

  const segments: RouteSegment[] = [];
  let currentSegment: GeoCoordinate[] = [];
  let currentPrivacy = isInPrivacyZone(route[0], privacyZones);

  route.forEach((coord, index) => {
    const coordPrivacy = isInPrivacyZone(coord, privacyZones);

    // If privacy status changes, start a new segment
    if (coordPrivacy !== currentPrivacy && currentSegment.length > 0) {
      segments.push({
        coordinates: currentSegment,
        isPrivate: currentPrivacy,
      });
      currentSegment = [coord];
      currentPrivacy = coordPrivacy;
    } else {
      currentSegment.push(coord);
    }
  });

  // Add final segment
  if (currentSegment.length > 0) {
    segments.push({
      coordinates: currentSegment,
      isPrivate: currentPrivacy,
    });
  }

  return segments;
}

/**
 * Create GeoJSON circle for privacy zone visualization
 *
 * @param center - Center point of the circle
 * @param radiusMeters - Radius in meters
 * @param points - Number of points to generate for the circle (default: 64)
 * @returns GeoJSON Feature with Polygon geometry
 */
export function createCircleGeoJSON(
  center: { lat: number; lng: number },
  radiusMeters: number,
  points: number = 64
) {
  const coordinates: number[][] = [];
  const earthRadius = 6371000; // meters

  for (let i = 0; i <= points; i++) {
    const angle = (i * 360) / points;
    const angleRad = (angle * Math.PI) / 180;

    const lat = center.lat + (radiusMeters / earthRadius) * (180 / Math.PI) * Math.cos(angleRad);
    const lng =
      center.lng +
      ((radiusMeters / earthRadius) * (180 / Math.PI) * Math.sin(angleRad)) /
        Math.cos((center.lat * Math.PI) / 180);

    coordinates.push([lng, lat]);
  }

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coordinates],
    },
    properties: {},
  };
}

/**
 * Calculate bounding box from all coordinates
 *
 * @param routes - Array of route arrays
 * @returns Bounding box [[minLng, minLat], [maxLng, maxLat]] or null
 */
export function calculateBounds(
  routes: GeoCoordinate[][]
): [[number, number], [number, number]] | null {
  if (!routes || routes.length === 0) return null;

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  routes.forEach((route) => {
    route.forEach((coord) => {
      minLng = Math.min(minLng, coord.lng);
      maxLng = Math.max(maxLng, coord.lng);
      minLat = Math.min(minLat, coord.lat);
      maxLat = Math.max(maxLat, coord.lat);
    });
  });

  // Add padding (10% on each side)
  const lngPadding = (maxLng - minLng) * 0.1;
  const latPadding = (maxLat - minLat) * 0.1;

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ];
}

/**
 * Convert GeoCoordinate array to GeoJSON LineString
 *
 * @param coordinates - Array of coordinates
 * @returns GeoJSON Feature with LineString geometry
 */
export function convertToLineString(coordinates: GeoCoordinate[]) {
  return {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: coordinates.map((coord) => [coord.lng, coord.lat]),
    },
    properties: {},
  };
}
