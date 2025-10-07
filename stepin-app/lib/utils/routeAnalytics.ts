/**
 * Route Analytics Utilities
 *
 * Functions for analyzing GPS routes: distance, elevation, pace.
 * All calculations are optimized for walking activities.
 *
 * @module routeAnalytics
 */

import type { GeoCoordinate } from '@/types/database';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 *
 * Uses the Haversine formula to calculate great-circle distance between
 * two points on Earth. Accurate for walking distances (<10km).
 *
 * @param coord1 - First coordinate (lat/lng)
 * @param coord2 - Second coordinate (lat/lng)
 * @returns Distance in meters
 *
 * @example
 * ```typescript
 * const distance = calculateDistance(
 *   { lat: 37.7749, lng: -122.4194, timestamp: '...' },
 *   { lat: 37.7750, lng: -122.4195, timestamp: '...' }
 * );
 * console.log(`Distance: ${distance.toFixed(2)}m`);
 * ```
 */
export function calculateDistance(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  const R = 6371e3; // Earth radius in meters
  
  // Convert to radians
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  return distance;
}

/**
 * Calculate total elevation gain from a route
 * Sums all positive altitude differences
 * @param route - Array of GPS coordinates with altitude data
 * @returns Total elevation gain in meters, rounded to 1 decimal
 */
export function calculateElevationGain(route: GeoCoordinate[]): number {
  if (route.length < 2) {
    return 0;
  }

  let totalGain = 0;

  for (let i = 1; i < route.length; i++) {
    const prevAltitude = route[i - 1].altitude;
    const currAltitude = route[i].altitude;

    // Skip if altitude data is missing
    if (prevAltitude === undefined || currAltitude === undefined) {
      continue;
    }

    const difference = currAltitude - prevAltitude;

    // Only count positive differences (gains)
    if (difference > 0) {
      totalGain += difference;
    }
  }

  return Math.round(totalGain * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate total elevation loss from a route
 * Sums all negative altitude differences
 * @param route - Array of GPS coordinates with altitude data
 * @returns Total elevation loss in meters (absolute value), rounded to 1 decimal
 */
export function calculateElevationLoss(route: GeoCoordinate[]): number {
  if (route.length < 2) {
    return 0;
  }

  let totalLoss = 0;

  for (let i = 1; i < route.length; i++) {
    const prevAltitude = route[i - 1].altitude;
    const currAltitude = route[i].altitude;

    // Skip if altitude data is missing
    if (prevAltitude === undefined || currAltitude === undefined) {
      continue;
    }

    const difference = currAltitude - prevAltitude;

    // Only count negative differences (losses)
    if (difference < 0) {
      totalLoss += Math.abs(difference);
    }
  }

  return Math.round(totalLoss * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate average pace from route
 *
 * Calculates pace in minutes per mile based on route duration and distance.
 * Typical walking pace is 15-20 minutes per mile.
 *
 * @param route - Array of GPS coordinates with timestamps
 * @param distanceMeters - Total distance in meters
 * @returns Average pace in minutes per mile (or null if invalid data)
 *
 * @example
 * ```typescript
 * const pace = calculateAveragePace(route, 1609.34); // 1 mile
 * if (pace) {
 *   console.log(`Pace: ${Math.floor(pace)}:${Math.round((pace % 1) * 60)} per mile`);
 *   // Output: "Pace: 16:30 per mile"
 * }
 * ```
 */
export function calculateAveragePace(
  route: GeoCoordinate[],
  distanceMeters: number
): number | null {
  if (route.length < 2 || distanceMeters <= 0) {
    return null;
  }

  try {
    // Get duration from first and last timestamps
    const startTime = new Date(route[0].timestamp).getTime();
    const endTime = new Date(route[route.length - 1].timestamp).getTime();
    const durationMs = endTime - startTime;

    if (durationMs <= 0) {
      return null;
    }

    // Convert to minutes
    const durationMinutes = durationMs / 60000;

    // Calculate pace in minutes per mile
    const distanceMiles = distanceMeters / 1609.34;
    const pace = durationMinutes / distanceMiles;

    // Return pace rounded to 1 decimal
    return Math.round(pace * 10) / 10;
  } catch (error) {
    return null;
  }
}

/**
 * Pace segment data
 */
export interface PaceSegment {
  startIndex: number;
  endIndex: number;
  pace: number; // minutes per mile
  distance: number; // meters
}

/**
 * Calculate pace for segments of the route
 * Useful for showing pace variation during walk
 * @param route - Array of GPS coordinates
 * @param segmentMeters - Segment distance in meters (default: 1 mile = 1609.34m)
 * @returns Array of pace segments
 */
export function calculatePaceSegments(
  route: GeoCoordinate[],
  segmentMeters: number = 1609.34
): PaceSegment[] {
  if (route.length < 2) {
    return [];
  }

  const segments: PaceSegment[] = [];
  let segmentStartIndex = 0;
  let segmentDistance = 0;

  for (let i = 1; i < route.length; i++) {
    const distance = calculateDistance(route[i - 1], route[i]);
    segmentDistance += distance;

    // When segment distance reached, calculate pace for that segment
    if (segmentDistance >= segmentMeters) {
      try {
        const startTime = new Date(route[segmentStartIndex].timestamp).getTime();
        const endTime = new Date(route[i].timestamp).getTime();
        const durationMs = endTime - startTime;
        const durationMinutes = durationMs / 60000;

        const distanceMiles = segmentDistance / 1609.34;
        const pace = durationMinutes / distanceMiles;

        segments.push({
          startIndex: segmentStartIndex,
          endIndex: i,
          pace: Math.round(pace * 10) / 10,
          distance: segmentDistance,
        });

        // Reset for next segment
        segmentStartIndex = i;
        segmentDistance = 0;
      } catch (error) {
        // Skip invalid segment
        segmentStartIndex = i;
        segmentDistance = 0;
      }
    }
  }

  return segments;
}

/**
 * Elevation profile point
 */
export interface ElevationPoint {
  distance: number; // Cumulative distance in meters
  elevation: number; // Elevation in meters
}

/**
 * Generate elevation profile for charting
 * @param route - Array of GPS coordinates with altitude data
 * @returns Array of distance/elevation points
 */
export function generateElevationProfile(route: GeoCoordinate[]): ElevationPoint[] {
  if (route.length === 0) {
    return [];
  }

  const profile: ElevationPoint[] = [];
  let cumulativeDistance = 0;

  for (let i = 0; i < route.length; i++) {
    // Calculate cumulative distance
    if (i > 0) {
      cumulativeDistance += calculateDistance(route[i - 1], route[i]);
    }

    // Add point to profile (skip if no altitude data)
    if (route[i].altitude !== undefined) {
      profile.push({
        distance: Math.round(cumulativeDistance * 10) / 10,
        elevation: Math.round(route[i].altitude! * 10) / 10,
      });
    }
  }

  return profile;
}

/**
 * Calculate total distance of a route
 * Sums distances between consecutive points
 * @param route - Array of GPS coordinates
 * @returns Total distance in meters
 */
export function calculateTotalDistance(route: GeoCoordinate[]): number {
  if (route.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 1; i < route.length; i++) {
    totalDistance += calculateDistance(route[i - 1], route[i]);
  }

  return totalDistance;
}

