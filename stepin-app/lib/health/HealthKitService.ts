/**
 * iOS HealthKit Service Implementation
 * Handles step data access via Apple HealthKit
 */

import HealthKit, {
  queryQuantitySamples,
  requestAuthorization,
  authorizationStatusFor,
  AuthorizationRequestStatus,
  AuthorizationStatus,
  queryWorkoutSamples,
  WorkoutActivityType,
} from '@kingstinct/react-native-healthkit';
import {
  HealthServiceInterface,
  HealthPermissionStatus,
  StepData,
  HealthServiceError,
  HealthServiceErrorCode,
  HealthServiceErrorMessages,
  AutoDetectedWorkout,
  HeartRateSample,
} from './healthService';
import { logger } from '../utils/logger';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITY_RECOGNITION_KEY = 'healthkit_activity_recognition_active';
const LAST_WORKOUT_CHECK_KEY = 'healthkit_last_workout_check';

export class HealthKitService implements HealthServiceInterface {
  private static instance: HealthKitService;
  private activityRecognitionInterval: NodeJS.Timeout | null = null;
  private activityRecognitionCallback: ((startTime: Date) => void) | null = null;
  private heartRateStreamInterval: NodeJS.Timeout | null = null;
  private heartRateCallback: ((hr: number) => void) | null = null;

  private constructor() {}

  static getInstance(): HealthKitService {
    if (!HealthKitService.instance) {
      HealthKitService.instance = new HealthKitService();
    }
    return HealthKitService.instance;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const available = await HealthKit.isHealthDataAvailable();
      return available;
    } catch (error) {
      logger.info('HealthKit not available:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<HealthPermissionStatus> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          granted: false,
          canRequest: false,
          message: HealthServiceErrorMessages[HealthServiceErrorCode.NOT_AVAILABLE],
        };
      }

      // Request authorization to read step count, workouts, and heart rate
      await requestAuthorization([], [
        'HKQuantityTypeIdentifierStepCount',
        'HKWorkoutTypeIdentifier',
        'HKQuantityTypeIdentifierHeartRate',
      ]);

      // Check the authorization status for step count (primary permission)
      const status = authorizationStatusFor('HKQuantityTypeIdentifierStepCount');

      const granted = status === AuthorizationStatus.sharingAuthorized;

      return {
        granted,
        canRequest: !granted,
        message: granted
          ? undefined
          : HealthServiceErrorMessages[HealthServiceErrorCode.PERMISSION_DENIED],
      };
    } catch (error) {
      logger.error('Error requesting HealthKit permissions:', error);
      return {
        granted: false,
        canRequest: true,
        message: HealthServiceErrorMessages[HealthServiceErrorCode.UNKNOWN_ERROR],
      };
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return false;
      }

      const status = authorizationStatusFor('HKQuantityTypeIdentifierStepCount');

      return status === AuthorizationStatus.sharingAuthorized;
    } catch (error) {
      logger.error('Error checking HealthKit permissions:', error);
      return false;
    }
  }

  async getTodaySteps(): Promise<number> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const result = await queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
        filter: {
          startDate: startOfDay,
          endDate: endOfDay,
        },
      });

      // Sum up all step samples for today
      const totalSteps = result.reduce((sum: number, sample: any) => {
        return sum + (sample.quantity || 0);
      }, 0);

      return Math.round(totalSteps);
    } catch (error) {
      logger.error('Error fetching today steps from HealthKit:', error);
      throw new HealthServiceError(
        'Failed to fetch today steps',
        HealthServiceErrorCode.DATA_UNAVAILABLE,
        HealthServiceErrorMessages[HealthServiceErrorCode.DATA_UNAVAILABLE]
      );
    }
  }

  async getStepsForDate(date: Date): Promise<number> {
    try {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const result = await queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
        filter: {
          startDate: startOfDay,
          endDate: endOfDay,
        },
      });

      // Sum up all step samples for the date
      const totalSteps = result.reduce((sum: number, sample: any) => {
        return sum + (sample.quantity || 0);
      }, 0);

      return Math.round(totalSteps);
    } catch (error) {
      logger.error('Error fetching steps for date from HealthKit:', error);
      throw new HealthServiceError(
        'Failed to fetch steps for date',
        HealthServiceErrorCode.DATA_UNAVAILABLE,
        HealthServiceErrorMessages[HealthServiceErrorCode.DATA_UNAVAILABLE]
      );
    }
  }

  async getStepsForDateRange(startDate: Date, endDate: Date): Promise<StepData[]> {
    try {
      const result = await queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
        filter: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      // Group samples by date
      const stepsByDate = new Map<string, number>();

      result.forEach((sample: any) => {
        const sampleDate = new Date(sample.startDate);
        const dateKey = sampleDate.toISOString().split('T')[0];

        const currentSteps = stepsByDate.get(dateKey) || 0;
        stepsByDate.set(dateKey, currentSteps + (sample.quantity || 0));
      });

      // Convert to array of StepData
      const stepDataArray: StepData[] = [];
      stepsByDate.forEach((steps, dateKey) => {
        stepDataArray.push({
          date: new Date(dateKey),
          steps: Math.round(steps),
        });
      });

      // Sort by date
      stepDataArray.sort((a, b) => a.date.getTime() - b.date.getTime());

      return stepDataArray;
    } catch (error) {
      logger.error('Error fetching steps for date range from HealthKit:', error);
      throw new HealthServiceError(
        'Failed to fetch steps for date range',
        HealthServiceErrorCode.DATA_UNAVAILABLE,
        HealthServiceErrorMessages[HealthServiceErrorCode.DATA_UNAVAILABLE]
      );
    }
  }

  async getAutoDetectedWorkouts(startDate: Date, endDate: Date): Promise<AutoDetectedWorkout[]> {
    try {
      // Query workouts from HealthKit using the correct API: queryWorkoutSamples
      // Filter for walking and running workouts only
      const workouts = await queryWorkoutSamples({
        filter: {
          OR: [
            { workoutActivityType: WorkoutActivityType.walking },
            { workoutActivityType: WorkoutActivityType.running },
          ],
        },
        ascending: false, // Most recent first
        limit: 100, // Reasonable limit to avoid performance issues
      });

      // Filter by date range (HealthKit doesn't support date filtering in the query)
      const filteredWorkouts = workouts.filter((workout) => {
        const workoutStart = new Date(workout.startDate);
        return workoutStart >= startDate && workoutStart <= endDate;
      });

      // Convert HealthKit WorkoutProxy to AutoDetectedWorkout format
      const autoDetectedWorkouts: AutoDetectedWorkout[] = await Promise.all(
        filteredWorkouts.map(async (workout) => {
          const duration = (new Date(workout.endDate).getTime() - new Date(workout.startDate).getTime()) / 1000;

          // Get workout statistics for distance and steps
          let distance: number | undefined;
          let steps: number | undefined;

          try {
            // Query distance statistic
            const distanceStats = await workout.getStatistic('HKQuantityTypeIdentifierDistanceWalkingRunning');
            if (distanceStats?.sumQuantity) {
              distance = distanceStats.sumQuantity.quantity;
            }

            // Query step count statistic
            const stepStats = await workout.getStatistic('HKQuantityTypeIdentifierStepCount');
            if (stepStats?.sumQuantity) {
              steps = Math.round(stepStats.sumQuantity.quantity);
            }
          } catch (statsError) {
            logger.warn('Error fetching workout statistics:', statsError);
            // Continue without stats - they're optional
          }

          return {
            id: workout.uuid,
            startTime: new Date(workout.startDate),
            endTime: new Date(workout.endDate),
            type: workout.workoutActivityType === WorkoutActivityType.running ? 'running' : 'walking',
            steps,
            distance,
            duration: Math.round(duration),
            autoDetected: true,
          };
        })
      );

      logger.info('HealthKit auto-detected workouts retrieved', {
        count: autoDetectedWorkouts.length,
        dateRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      });

      return autoDetectedWorkouts;
    } catch (error) {
      logger.error('Error fetching auto-detected workouts from HealthKit:', error);
      return [];
    }
  }

  async startActivityRecognition(callback: (startTime: Date) => void): Promise<void> {
    try {
      this.activityRecognitionCallback = callback;

      // Store that activity recognition is active
      await AsyncStorage.setItem(ACTIVITY_RECOGNITION_KEY, 'true');

      // Check for new workouts every 2 minutes
      this.activityRecognitionInterval = setInterval(async () => {
        await this.checkForNewWorkouts();
      }, 2 * 60 * 1000); // 2 minutes

      logger.info('Activity recognition started');
    } catch (error) {
      logger.error('Error starting activity recognition:', error);
    }
  }

  async stopActivityRecognition(): Promise<void> {
    try {
      if (this.activityRecognitionInterval) {
        clearInterval(this.activityRecognitionInterval);
        this.activityRecognitionInterval = null;
      }

      this.activityRecognitionCallback = null;

      // Clear activity recognition flag
      await AsyncStorage.removeItem(ACTIVITY_RECOGNITION_KEY);
      await AsyncStorage.removeItem(LAST_WORKOUT_CHECK_KEY);

      logger.info('Activity recognition stopped');
    } catch (error) {
      logger.error('Error stopping activity recognition:', error);
    }
  }

  private async checkForNewWorkouts(): Promise<void> {
    try {
      // Check if user is already tracking a walk
      const isWalkingKey = await AsyncStorage.getItem('is_walking');
      if (isWalkingKey === 'true') {
        return; // Don't notify if already tracking
      }

      // Get last check time
      const lastCheckStr = await AsyncStorage.getItem(LAST_WORKOUT_CHECK_KEY);
      const lastCheck = lastCheckStr ? new Date(lastCheckStr) : new Date(Date.now() - 30 * 60 * 1000); // Default to 30 min ago
      const now = new Date();

      // Query for workouts since last check
      const workouts = await this.getAutoDetectedWorkouts(lastCheck, now);

      // Filter for walking workouts that are at least 5 minutes long
      const recentWalks = workouts.filter(w =>
        w.type === 'walking' &&
        w.duration >= 5 * 60 && // At least 5 minutes
        (now.getTime() - w.startTime.getTime()) <= 15 * 60 * 1000 // Started within last 15 minutes
      );

      if (recentWalks.length > 0 && this.activityRecognitionCallback) {
        const latestWalk = recentWalks[recentWalks.length - 1];

        // Send notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Looks like you're walking! 🚶",
            body: 'Want to track this walk?',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: {
              type: 'auto_detect_walk',
              startTime: latestWalk.startTime.toISOString(),
            },
            categoryIdentifier: 'AUTO_DETECT_WALK',
          },
          trigger: null, // Send immediately
        });

        logger.info('Auto-detection notification sent', {
          startTime: latestWalk.startTime,
          duration: latestWalk.duration,
        });
      }

      // Update last check time
      await AsyncStorage.setItem(LAST_WORKOUT_CHECK_KEY, now.toISOString());
    } catch (error) {
      logger.error('Error checking for new workouts:', error);
    }
  }

  async getCurrentHeartRate(): Promise<number | null> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const result = await queryQuantitySamples('HKQuantityTypeIdentifierHeartRate', {
        filter: {
          startDate: fiveMinutesAgo,
          endDate: now,
        },
        limit: 1,
        ascending: false,
      });

      if (result.length > 0) {
        return Math.round(result[0].quantity);
      }

      return null;
    } catch (error) {
      logger.error('Error fetching current heart rate from HealthKit:', error);
      return null;
    }
  }

  async streamHeartRate(callback: (hr: number) => void): Promise<void> {
    try {
      this.heartRateCallback = callback;

      // Poll for heart rate every 5 seconds
      this.heartRateStreamInterval = setInterval(async () => {
        const hr = await this.getCurrentHeartRate();
        if (hr !== null && this.heartRateCallback) {
          this.heartRateCallback(hr);
        }
      }, 5000); // 5 seconds

      logger.info('Heart rate streaming started');
    } catch (error) {
      logger.error('Error starting heart rate stream:', error);
    }
  }

  async stopHeartRateStream(): Promise<void> {
    try {
      if (this.heartRateStreamInterval) {
        clearInterval(this.heartRateStreamInterval);
        this.heartRateStreamInterval = null;
      }

      this.heartRateCallback = null;

      logger.info('Heart rate streaming stopped');
    } catch (error) {
      logger.error('Error stopping heart rate stream:', error);
    }
  }
}

export default HealthKitService.getInstance();

