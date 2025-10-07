/**
 * Active Walk Store
 * Zustand store for managing active walk sessions with real-time tracking
 */

import { create } from 'zustand';
import { getHealthService } from '../health';
import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';
import { liveActivityManager, LiveActivityEventListener } from '../liveActivities/liveActivityManager';
import type { GeoCoordinate, Location } from '@/types/database';
import { gpsTracker } from '../gps/gpsTracker';
import {
  calculateDistance,
  calculateElevationGain,
  calculateElevationLoss,
  calculateAveragePace,
} from '../utils/routeAnalytics';
import * as Sentry from '@sentry/react-native';
import { weatherService } from '../weather/weatherService';
import { audioCoach } from '../audio/audioCoach';

interface StartWalkOptions {
  retroactive?: boolean;
  startTime?: Date;
}

/**
 * Calculate heart rate zone (1-5) based on current HR and max HR
 * Zone 1: 50-60% (Very Light)
 * Zone 2: 60-70% (Light)
 * Zone 3: 70-80% (Moderate)
 * Zone 4: 80-90% (Hard)
 * Zone 5: 90-100% (Maximum)
 */
function calculateHeartRateZone(currentHR: number, maxHR: number): number {
  const percentage = (currentHR / maxHR) * 100;

  if (percentage < 60) return 1;
  if (percentage < 70) return 2;
  if (percentage < 80) return 3;
  if (percentage < 90) return 4;
  return 5;
}

interface ActiveWalkState {
  // Walk state
  isWalking: boolean;
  isPaused: boolean;
  startTime: Date | null;
  pausedTime: Date | null;
  totalPausedDuration: number; // milliseconds
  currentSteps: number;
  distanceMeters: number;
  goalSteps: number;
  walkId: string | null;
  autoDetected: boolean; // Phase 12: Auto-detection flag

  // GPS tracking state
  route: GeoCoordinate[];
  startLocation: Location | null;
  endLocation: Location | null;
  isTrackingGPS: boolean;

  // Phase 12: Heart rate tracking state
  currentHeartRate: number | null;
  averageHeartRate: number | null;
  maxHeartRate: number | null;
  heartRateSamples: number[]; // Array of HR samples for calculating average
  currentZone: number | null; // 1-5 for zones, null if no HR data

  // Tracking intervals
  stepTrackingInterval: NodeJS.Timeout | null;
  coachingInterval: NodeJS.Timeout | null; // Phase 10: Audio coaching interval

  // Subscriptions for cleanup
  liveActivitySubscriptions: any[];

  // Live Activity event listeners
  pauseListener: LiveActivityEventListener | null;
  endListener: LiveActivityEventListener | null;

  // Actions
  startWalk: (goalSteps: number, options?: StartWalkOptions) => Promise<void>;
  pauseWalk: () => void;
  resumeWalk: () => void;
  endWalk: (userId: string) => Promise<void>;
  updateSteps: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  isWalking: false,
  isPaused: false,
  startTime: null,
  pausedTime: null,
  totalPausedDuration: 0,
  currentSteps: 0,
  distanceMeters: 0,
  goalSteps: 7000,
  walkId: null,
  autoDetected: false, // Phase 12
  route: [],
  startLocation: null,
  endLocation: null,
  isTrackingGPS: false,
  currentHeartRate: null, // Phase 12
  averageHeartRate: null, // Phase 12
  maxHeartRate: null, // Phase 12
  heartRateSamples: [], // Phase 12
  currentZone: null, // Phase 12
  stepTrackingInterval: null,
  coachingInterval: null, // Phase 10
  liveActivitySubscriptions: [],
  pauseListener: null,
  endListener: null,
};

export const useActiveWalkStore = create<ActiveWalkState>((set, get) => ({
  ...initialState,

  /**
   * Start a new walk session
   * @param goalSteps - Daily step goal
   * @param options - Optional parameters for retroactive walks
   */
  startWalk: async (goalSteps: number, options?: StartWalkOptions) => {
    try {
      const startTime = options?.startTime || new Date();
      const walkId = `walk_${Date.now()}`;
      const isRetroactive = options?.retroactive || false;

      logger.info('Starting walk session', {
        walkId,
        goalSteps,
        retroactive: isRetroactive,
        startTime: startTime.toISOString(),
      });

      // Get initial step count from HealthKit
      const healthService = getHealthService();
      let initialSteps = 0;

      if (isRetroactive) {
        // For retroactive walks, get steps from the detected start time to now
        try {
          const now = new Date();
          const retroSteps = await healthService.getStepsForDateRange(startTime, now);

          // Sum up steps from the range
          initialSteps = retroSteps.reduce((sum, data) => sum + data.steps, 0);

          logger.info('Retroactive steps captured', {
            startTime: startTime.toISOString(),
            endTime: now.toISOString(),
            steps: initialSteps,
          });

          Sentry.addBreadcrumb({
            category: 'auto-detection',
            message: 'Retroactive walk started',
            level: 'info',
            data: {
              startTime: startTime.toISOString(),
              retroSteps: initialSteps,
            },
          });
        } catch (error) {
          logger.error('Error fetching retroactive steps:', error);
          initialSteps = 0;
        }
      } else {
        initialSteps = await healthService.getTodaySteps();
      }

      set({
        isWalking: true,
        isPaused: false,
        startTime,
        pausedTime: null,
        totalPausedDuration: 0,
        currentSteps: isRetroactive ? initialSteps : 0, // Use retroactive steps if applicable
        distanceMeters: 0,
        goalSteps,
        walkId,
        autoDetected: isRetroactive,
        route: [],
        startLocation: null,
        endLocation: null,
        isTrackingGPS: false,
      });

      // Start GPS tracking
      try {
        // Get starting location
        const startLoc = await gpsTracker.getCurrentPosition();
        if (startLoc) {
          set({
            startLocation: {
              lat: startLoc.lat,
              lng: startLoc.lng,
            },
          });
          logger.info('Starting location captured', { startLocation: startLoc });
        }

        // Start GPS tracking with real-time updates
        await gpsTracker.startTracking((coord) => {
          const state = get();
          const newRoute = [...state.route, coord];

          // Calculate total distance by summing distances between consecutive points
          let totalDistance = 0;
          for (let i = 1; i < newRoute.length; i++) {
            totalDistance += calculateDistance(newRoute[i - 1], newRoute[i]);
          }

          set({
            route: newRoute,
            distanceMeters: totalDistance,
            isTrackingGPS: true,
          });

          logger.info('GPS location update', {
            routePoints: newRoute.length,
            distance: totalDistance,
          });
        });

        logger.info('GPS tracking started successfully');
      } catch (error) {
        logger.error('Failed to start GPS tracking:', error);
        // Continue with walk even if GPS fails (graceful degradation)
      }

      // Phase 12: Start heart rate streaming
      try {
        await healthService.streamHeartRate((hr) => {
          const state = get();
          const newSamples = [...state.heartRateSamples, hr];

          // Calculate average HR
          const avgHR = Math.round(newSamples.reduce((sum, val) => sum + val, 0) / newSamples.length);

          // Calculate max HR
          const maxHR = Math.max(...newSamples);

          // Calculate current zone (assuming max HR = 220 - age, using 30 as default age)
          const estimatedMaxHR = 190; // 220 - 30
          const zone = calculateHeartRateZone(hr, estimatedMaxHR);

          set({
            currentHeartRate: hr,
            averageHeartRate: avgHR,
            maxHeartRate: maxHR,
            heartRateSamples: newSamples,
            currentZone: zone,
          });

          logger.info('Heart rate update', { hr, zone, avgHR, maxHR });
        });

        logger.info('Heart rate streaming started successfully');
      } catch (error) {
        logger.error('Failed to start heart rate streaming:', error);
        // Continue with walk even if HR fails (graceful degradation)
      }

      // Start tracking steps every 5 seconds
      const interval = setInterval(async () => {
        if (!get().isPaused) {
          await get().updateSteps();
        }
      }, 5000);

      set({ stepTrackingInterval: interval });

      // Start Live Activity
      if (liveActivityManager.supported) {
        try {
          await liveActivityManager.startActivity({
            attributes: {
              walkId,
              goalSteps,
              startTime: startTime.toISOString(),
            },
            initialState: {
              elapsedSeconds: 0,
              currentSteps: 0,
              distanceMeters: 0,
              goalProgress: 0,
            },
          });

          // Start auto-update for Live Activity (every 15 seconds)
          liveActivityManager.startAutoUpdate(async () => {
            const state = get();
            if (!state.isWalking || !state.startTime) return null;

            const elapsedSeconds = Math.floor(
              (Date.now() - state.startTime.getTime() - state.totalPausedDuration) / 1000
            );
            const goalProgress = Math.min(state.currentSteps / state.goalSteps, 1.0);

            return {
              elapsedSeconds,
              currentSteps: state.currentSteps,
              distanceMeters: state.distanceMeters,
              goalProgress,
            };
          }, 15000);

          // Set up event listeners for Live Activity buttons
          const pauseListener: LiveActivityEventListener = () => {
            get().pauseWalk();
          };

          const endListener: LiveActivityEventListener = () => {
            const state = get();
            if (state.isWalking) {
              // We need userId for endWalk, so we'll just pause for now
              // The UI should handle the actual end walk flow
              get().pauseWalk();
              logger.info('End walk requested from Live Activity - pausing walk');
            }
          };

          liveActivityManager.addEventListener('pauseWalk', pauseListener);
          liveActivityManager.addEventListener('endWalk', endListener);

          set({ pauseListener, endListener });

          logger.info('Live Activity started and configured');
        } catch (error) {
          logger.error('Failed to start Live Activity:', error);
          // Continue without Live Activity - not a critical error
        }
      }

      // Phase 10: Configure and start audio coaching
      try {
        // Get audio coaching preferences from profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('audio_coaching_enabled, audio_coaching_interval')
            .eq('id', user.id)
            .single();

          if (profile?.audio_coaching_enabled) {
            const intervalSeconds = profile.audio_coaching_interval || 300;
            await audioCoach.configure(true, intervalSeconds);

            // Set up coaching interval
            const coachingInterval = setInterval(() => {
              const state = get();
              if (!state.isWalking || state.isPaused || !state.startTime) return;

              const elapsedSeconds = Math.floor(
                (Date.now() - state.startTime.getTime() - state.totalPausedDuration) / 1000
              );

              audioCoach.announce({
                type: 'progress',
                data: {
                  elapsed: elapsedSeconds,
                  steps: state.currentSteps,
                  distance: state.distanceMeters,
                },
              });
            }, intervalSeconds * 1000);

            set({ coachingInterval });
            logger.info('Audio coaching started', { intervalSeconds });
          }
        }
      } catch (error) {
        logger.error('Failed to start audio coaching:', error);
        // Continue without audio coaching - not critical
      }

      logger.info('Walk session started successfully', { walkId });
    } catch (error) {
      logger.error('Error starting walk:', error);
      throw error;
    }
  },

  /**
   * Pause the current walk
   */
  pauseWalk: () => {
    const state = get();
    if (!state.isWalking || state.isPaused) return;

    logger.info('Pausing walk', { walkId: state.walkId });

    // Phase 10: Stop audio coaching
    audioCoach.stop();

    set({
      isPaused: true,
      pausedTime: new Date(),
    });

    // Update Live Activity to show paused state
    if (liveActivityManager.isActive && state.startTime) {
      const elapsedSeconds = Math.floor(
        (Date.now() - state.startTime.getTime() - state.totalPausedDuration) / 1000
      );
      const goalProgress = Math.min(state.currentSteps / state.goalSteps, 1.0);

      liveActivityManager.updateActivity({
        elapsedSeconds,
        currentSteps: state.currentSteps,
        distanceMeters: state.distanceMeters,
        goalProgress,
      }).catch(error => {
        logger.error('Failed to update Live Activity on pause:', error);
      });
    }
  },

  /**
   * Resume a paused walk
   */
  resumeWalk: () => {
    const state = get();
    if (!state.isWalking || !state.isPaused || !state.pausedTime) return;

    logger.info('Resuming walk', { walkId: state.walkId });

    const pauseDuration = Date.now() - state.pausedTime.getTime();

    set({
      isPaused: false,
      pausedTime: null,
      totalPausedDuration: state.totalPausedDuration + pauseDuration,
    });

    // Phase 10: Audio coaching resumes automatically with interval

    // Update Live Activity to show resumed state
    if (liveActivityManager.isActive && state.startTime) {
      const elapsedSeconds = Math.floor(
        (Date.now() - state.startTime.getTime() - (state.totalPausedDuration + pauseDuration)) / 1000
      );
      const goalProgress = Math.min(state.currentSteps / state.goalSteps, 1.0);

      liveActivityManager.updateActivity({
        elapsedSeconds,
        currentSteps: state.currentSteps,
        distanceMeters: state.distanceMeters,
        goalProgress,
      }).catch(error => {
        logger.error('Failed to update Live Activity on resume:', error);
      });
    }
  },

  /**
   * End the current walk and save to database
   */
  endWalk: async (userId: string) => {
    const state = get();
    if (!state.isWalking || !state.startTime) {
      logger.warn('Attempted to end walk when no walk is active');
      return;
    }

    try {
      logger.info('Ending walk', { walkId: state.walkId, steps: state.currentSteps });

      // Clear step tracking interval
      if (state.stepTrackingInterval) {
        clearInterval(state.stepTrackingInterval);
      }

      // Phase 10: Stop audio coaching and clear interval
      if (state.coachingInterval) {
        clearInterval(state.coachingInterval);
      }
      await audioCoach.stop();

      // End Live Activity
      if (liveActivityManager.isActive) {
        try {
          await liveActivityManager.endActivity();

          // Remove event listeners
          if (state.pauseListener) {
            liveActivityManager.removeEventListener('pauseWalk', state.pauseListener);
          }
          if (state.endListener) {
            liveActivityManager.removeEventListener('endWalk', state.endListener);
          }

          logger.info('Live Activity ended and cleaned up');
        } catch (error) {
          logger.error('Failed to end Live Activity:', error);
          // Continue with walk end even if Live Activity fails
        }
      }

      // Clean up Live Activity subscriptions
      state.liveActivitySubscriptions.forEach((sub) => {
        if (sub && typeof sub.remove === 'function') {
          sub.remove();
        }
      });

      // Phase 12: Stop heart rate streaming
      try {
        const healthService = getHealthService();
        await healthService.stopHeartRateStream();
        logger.info('Heart rate streaming stopped');
      } catch (error) {
        logger.error('Failed to stop heart rate streaming:', error);
        // Continue with walk end even if HR stop fails
      }

      // Stop GPS tracking and get route
      let simplifiedRoute: GeoCoordinate[] = [];
      let elevationGain: number | null = null;
      let elevationLoss: number | null = null;
      let averagePace: number | null = null;
      let endLocation: Location | null = null;

      try {
        // Stop GPS tracking
        const fullRoute = await gpsTracker.stopTracking();
        logger.info('GPS tracking stopped', { routePoints: fullRoute.length });

        if (fullRoute.length > 0) {
          // Simplify route to reduce storage (50-90% reduction)
          simplifiedRoute = gpsTracker.simplifyRoute(fullRoute, 0.00001);
          logger.info('Route simplified', {
            originalPoints: fullRoute.length,
            simplifiedPoints: simplifiedRoute.length,
            reduction: `${Math.round((1 - simplifiedRoute.length / fullRoute.length) * 100)}%`,
          });

          // Calculate analytics
          elevationGain = calculateElevationGain(simplifiedRoute);
          elevationLoss = calculateElevationLoss(simplifiedRoute);
          averagePace = calculateAveragePace(simplifiedRoute, state.distanceMeters);

          // Get end location from last coordinate
          endLocation = {
            lat: simplifiedRoute[simplifiedRoute.length - 1].lat,
            lng: simplifiedRoute[simplifiedRoute.length - 1].lng,
          };

          logger.info('Route analytics calculated', {
            elevationGain,
            elevationLoss,
            averagePace,
          });

          // Add Sentry breadcrumb for successful GPS processing
          Sentry.addBreadcrumb({
            category: 'walk',
            message: 'GPS route processed successfully',
            level: 'info',
            data: {
              originalPoints: fullRoute.length,
              simplifiedPoints: simplifiedRoute.length,
              elevationGain,
              elevationLoss,
              averagePace,
            },
          });
        }
      } catch (error) {
        logger.error('Failed to process GPS data:', error);

        // Add Sentry breadcrumb for GPS processing failure
        Sentry.addBreadcrumb({
          category: 'walk',
          message: 'GPS route processing failed',
          level: 'warning',
        });

        // Continue with walk save even if GPS processing fails
      }

      // Calculate final metrics
      const endTime = new Date();
      const totalDuration = endTime.getTime() - state.startTime.getTime() - state.totalPausedDuration;
      const durationMinutes = Math.round(totalDuration / 60000);

      // Use GPS distance if available, otherwise estimate from steps
      const distanceMeters = state.distanceMeters > 0 ? state.distanceMeters : state.currentSteps * 0.762;

      // Phase 10: Fetch current weather conditions
      let weatherConditions = null;
      try {
        // Get user's location coordinates from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('location_coordinates')
          .eq('id', userId)
          .single();

        if (profile?.location_coordinates) {
          const coords = profile.location_coordinates as { lat: number; lng: number };
          weatherConditions = await weatherService.getCurrentWeather(coords.lat, coords.lng);

          if (weatherConditions) {
            logger.info('Weather conditions fetched for walk', {
              temp: weatherConditions.temperature,
              condition: weatherConditions.condition,
            });
          }
        }
      } catch (error) {
        logger.error('Failed to fetch weather for walk:', error);
        // Continue without weather data - it's optional
      }

      // Save walk to database
      const today = new Date().toISOString().split('T')[0];

      const { error: walkError } = await supabase.from('walks').insert({
        user_id: userId,
        date: today,
        steps: state.currentSteps,
        duration_minutes: durationMinutes,
        distance_meters: distanceMeters,
        route_coordinates: simplifiedRoute.length > 0 ? simplifiedRoute : null,
        start_location: state.startLocation,
        end_location: endLocation,
        elevation_gain: elevationGain,
        elevation_loss: elevationLoss,
        average_pace: averagePace,
        weather_conditions: weatherConditions,
        auto_detected: state.autoDetected, // Phase 12: Auto-detection flag
        average_heart_rate: state.averageHeartRate, // Phase 12: Heart rate data
        max_heart_rate: state.maxHeartRate, // Phase 12: Heart rate data
      });

      if (walkError) {
        logger.error('Error saving walk to database:', walkError);
        throw walkError;
      }

      logger.info('Walk saved successfully', {
        walkId: state.walkId,
        steps: state.currentSteps,
        duration: durationMinutes,
        distance: distanceMeters,
      });

      // Reset state
      get().reset();
    } catch (error) {
      logger.error('Error ending walk:', error);
      throw error;
    }
  },

  /**
   * Update current step count from HealthKit
   */
  updateSteps: async () => {
    const state = get();
    if (!state.isWalking || !state.startTime) return;

    try {
      const healthService = getHealthService();
      const currentTotalSteps = await healthService.getTodaySteps();

      // Calculate steps taken during this walk
      // Note: This is a simplified approach. In production, you'd want to track
      // the step count at walk start and calculate the difference
      const elapsedMinutes = Math.floor((Date.now() - state.startTime.getTime()) / 60000);
      const estimatedSteps = Math.floor(elapsedMinutes * 100); // Rough estimate: 100 steps/min

      // Use the smaller of estimated or actual to avoid over-counting
      const walkSteps = Math.min(estimatedSteps, currentTotalSteps);

      // Calculate distance
      const distanceMeters = walkSteps * 0.762;

      set({
        currentSteps: walkSteps,
        distanceMeters,
      });
    } catch (error) {
      logger.error('Error updating steps:', error);
    }
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    const state = get();

    // Clear interval if exists
    if (state.stepTrackingInterval) {
      clearInterval(state.stepTrackingInterval);
    }

    // Phase 10: Clear coaching interval
    if (state.coachingInterval) {
      clearInterval(state.coachingInterval);
    }

    // Clean up Live Activity
    if (liveActivityManager.isActive) {
      liveActivityManager.endActivity().catch(error => {
        logger.error('Failed to end Live Activity during reset:', error);
      });

      // Remove event listeners
      if (state.pauseListener) {
        liveActivityManager.removeEventListener('pauseWalk', state.pauseListener);
      }
      if (state.endListener) {
        liveActivityManager.removeEventListener('endWalk', state.endListener);
      }
    }

    // Clean up subscriptions
    state.liveActivitySubscriptions.forEach((sub) => {
      if (sub && typeof sub.remove === 'function') {
        sub.remove();
      }
    });

    set(initialState);
  },
}));

