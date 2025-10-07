/**
 * GPS Tracker Service
 * Battery-optimized background GPS tracking with motion detection
 * Uses react-native-background-geolocation for efficient location tracking
 */

import BackgroundGeolocation, {
  Location,
  State,
  MotionChangeEvent,
} from 'react-native-background-geolocation';
import type { GeoCoordinate } from '@/types/database';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';

/**
 * GPSTracker class for managing background GPS tracking
 *
 * Implements motion-based tracking (updates every 10-50m, not time-based)
 * for battery optimization. Includes route simplification using
 * Ramer-Douglas-Peucker algorithm to reduce storage by 50-90%.
 *
 * @example
 * ```typescript
 * import { gpsTracker } from '@/lib/gps/gpsTracker';
 *
 * // Start tracking
 * await gpsTracker.startTracking((coord) => {
 *   console.log('New location:', coord);
 * });
 *
 * // Stop tracking and get route
 * const route = await gpsTracker.stopTracking();
 *
 * // Simplify route
 * const simplified = gpsTracker.simplifyRoute(route);
 * ```
 */
class GPSTracker {
  private isConfigured: boolean = false;
  private currentRoute: GeoCoordinate[] = [];
  private onLocationUpdate: ((coord: GeoCoordinate) => void) | null = null;

  /**
   * Configure BackgroundGeolocation with battery-optimized settings
   *
   * Only needs to be called once per app lifecycle. Automatically called
   * by startTracking() if not already configured.
   *
   * Configuration includes:
   * - Motion-based tracking (10m distance filter)
   * - High accuracy GPS
   * - Background tracking support
   * - Battery optimization (stops after 5min stationary)
   *
   * @throws {Error} If BackgroundGeolocation fails to initialize
   */
  async configure(): Promise<void> {
    if (this.isConfigured) {
      logger.info('GPS Tracker already configured');
      return;
    }

    try {
      const state: State = await BackgroundGeolocation.ready({
        // Desired accuracy
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        
        // Motion-based tracking (not time-based)
        distanceFilter: 10, // Update every 10 meters
        
        // Stop tracking after 5 minutes of being stationary
        stopTimeout: 5,
        stopOnStationary: false, // Don't fully stop, just pause
        
        // Keep service alive
        preventSuspend: true,
        heartbeatInterval: 60, // Check-in every 60 seconds when stationary
        
        // iOS specific settings
        locationAuthorizationRequest: 'WhenInUse',
        pausesLocationUpdatesAutomatically: false,
        
        // Android specific settings
        notification: {
          title: 'Stepin is tracking your walk',
          text: 'Tap to return to app',
          priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_LOW,
          color: '#4CAF50',
        },
        foregroundService: true,
        
        // Logging (disable in production)
        debug: __DEV__,
        logLevel: __DEV__ ? BackgroundGeolocation.LOG_LEVEL_VERBOSE : BackgroundGeolocation.LOG_LEVEL_OFF,
      });

      // Register location listener
      BackgroundGeolocation.onLocation(
        this.handleLocation.bind(this),
        (error) => {
          logger.error('GPS location error:', error);
        }
      );

      // Register motion change listener
      BackgroundGeolocation.onMotionChange((event: MotionChangeEvent) => {
        logger.info('Motion change detected:', {
          isMoving: event.isMoving,
          location: event.location,
        });
      });

      this.isConfigured = true;
      logger.info('GPS Tracker configured successfully', { state });

      // Add Sentry breadcrumb
      Sentry.addBreadcrumb({
        category: 'gps',
        message: 'GPS Tracker configured',
        level: 'info',
        data: {
          desiredAccuracy: 'HIGH',
          distanceFilter: 10,
        },
      });
    } catch (error) {
      logger.error('Failed to configure GPS Tracker:', error);

      // Add Sentry breadcrumb for failure
      Sentry.addBreadcrumb({
        category: 'gps',
        message: 'GPS Tracker configuration failed',
        level: 'error',
      });

      throw error;
    }
  }

  /**
   * Handle incoming location updates
   * Converts native location to GeoCoordinate and stores in route
   */
  private handleLocation(location: Location): void {
    try {
      const coord: GeoCoordinate = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
        altitude: location.coords.altitude ?? undefined,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed ?? undefined,
      };

      // Add to current route
      this.currentRoute.push(coord);

      // Call update callback if exists
      if (this.onLocationUpdate) {
        this.onLocationUpdate(coord);
      }

      logger.info('GPS location update:', {
        lat: coord.lat,
        lng: coord.lng,
        accuracy: coord.accuracy,
        routeLength: this.currentRoute.length,
      });
    } catch (error) {
      logger.error('Error handling location:', error);
    }
  }

  /**
   * Start GPS tracking with real-time location updates
   *
   * Begins background GPS tracking and calls the provided callback
   * function for each location update. Tracking continues even when
   * the phone is locked.
   *
   * @param onUpdate - Callback function called on each location update
   * @throws {Error} If GPS tracking fails to start
   *
   * @example
   * ```typescript
   * await gpsTracker.startTracking((coord) => {
   *   console.log(`Location: ${coord.lat}, ${coord.lng}`);
   *   console.log(`Accuracy: ${coord.accuracy}m`);
   * });
   * ```
   */
  async startTracking(onUpdate: (coord: GeoCoordinate) => void): Promise<void> {
    try {
      // Configure if not already configured
      if (!this.isConfigured) {
        await this.configure();
      }

      // Clear previous route
      this.currentRoute = [];

      // Set update callback
      this.onLocationUpdate = onUpdate;

      // Start tracking
      await BackgroundGeolocation.start();

      logger.info('GPS tracking started');

      // Add Sentry breadcrumb
      Sentry.addBreadcrumb({
        category: 'gps',
        message: 'GPS tracking started',
        level: 'info',
      });
    } catch (error) {
      logger.error('Failed to start GPS tracking:', error);

      // Add Sentry breadcrumb for failure
      Sentry.addBreadcrumb({
        category: 'gps',
        message: 'GPS tracking start failed',
        level: 'error',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Stop GPS tracking and return the recorded route
   * @returns Array of GPS coordinates recorded during tracking
   */
  async stopTracking(): Promise<GeoCoordinate[]> {
    try {
      // Stop tracking
      await BackgroundGeolocation.stop();

      // Copy route to return
      const route = [...this.currentRoute];

      // Clear state
      this.currentRoute = [];
      this.onLocationUpdate = null;

      logger.info('GPS tracking stopped', { routePoints: route.length });

      // Add Sentry breadcrumb
      Sentry.addBreadcrumb({
        category: 'gps',
        message: 'GPS tracking stopped',
        level: 'info',
        data: {
          routePoints: route.length,
        },
      });

      return route;
    } catch (error) {
      logger.error('Failed to stop GPS tracking:', error);

      // Add Sentry breadcrumb for failure
      Sentry.addBreadcrumb({
        category: 'gps',
        message: 'GPS tracking stop failed',
        level: 'warning',
      });

      // Return route even if stop fails
      const route = [...this.currentRoute];
      this.currentRoute = [];
      this.onLocationUpdate = null;
      return route;
    }
  }

  /**
   * Get current position (single location fix)
   * Useful for getting start/end locations
   * @returns Current GPS coordinate or null if unavailable
   */
  async getCurrentPosition(): Promise<GeoCoordinate | null> {
    try {
      const location: Location = await BackgroundGeolocation.getCurrentPosition({
        timeout: 30, // 30 second timeout
        maximumAge: 5000, // Accept cached location up to 5 seconds old
        desiredAccuracy: 10, // 10 meter accuracy
        samples: 1,
      });

      const coord: GeoCoordinate = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
        altitude: location.coords.altitude ?? undefined,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed ?? undefined,
      };

      logger.info('Got current position:', coord);

      return coord;
    } catch (error) {
      logger.error('Failed to get current position:', error);
      return null;
    }
  }

  /**
   * Simplify route using Ramer-Douglas-Peucker algorithm
   *
   * Reduces number of GPS points while maintaining route shape.
   * Typically achieves 50-90% reduction in storage size.
   *
   * @param route - Array of GPS coordinates to simplify
   * @param tolerance - Simplification tolerance (default: 0.00001 ≈ 1 meter)
   *                    Higher values = more aggressive simplification
   * @returns Simplified route with fewer points
   *
   * @example
   * ```typescript
   * const route = [...]; // 1000 points
   * const simplified = gpsTracker.simplifyRoute(route, 0.00001);
   * console.log(simplified.length); // ~100-500 points (50-90% reduction)
   * ```
   */
  simplifyRoute(route: GeoCoordinate[], tolerance: number = 0.00001): GeoCoordinate[] {
    if (route.length <= 2) {
      return route;
    }

    // Find point with maximum perpendicular distance from line (first to last)
    let maxDistance = 0;
    let maxIndex = 0;

    const first = route[0];
    const last = route[route.length - 1];

    for (let i = 1; i < route.length - 1; i++) {
      const distance = this.perpendicularDistance(route[i], first, last);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
      // Recursively simplify left and right segments
      const leftSegment = this.simplifyRoute(route.slice(0, maxIndex + 1), tolerance);
      const rightSegment = this.simplifyRoute(route.slice(maxIndex), tolerance);

      // Concatenate results (excluding duplicate middle point)
      return [...leftSegment.slice(0, -1), ...rightSegment];
    } else {
      // All points between first and last can be removed
      return [first, last];
    }
  }

  /**
   * Calculate perpendicular distance from point to line
   * Helper function for Ramer-Douglas-Peucker algorithm
   */
  private perpendicularDistance(
    point: GeoCoordinate,
    lineStart: GeoCoordinate,
    lineEnd: GeoCoordinate
  ): number {
    const x = point.lat;
    const y = point.lng;
    const x1 = lineStart.lat;
    const y1 = lineStart.lng;
    const x2 = lineEnd.lat;
    const y2 = lineEnd.lng;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Export singleton instance
export const gpsTracker = new GPSTracker();

