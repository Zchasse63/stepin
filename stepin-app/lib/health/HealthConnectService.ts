/**
 * Android Health Connect Service Implementation
 * Handles step data access via Google Health Connect
 */

import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
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

const ACTIVITY_RECOGNITION_KEY = 'healthconnect_activity_recognition_active';
const LAST_ACTIVITY_CHECK_KEY = 'healthconnect_last_activity_check';

export class HealthConnectService implements HealthServiceInterface {
  private static instance: HealthConnectService;
  private initialized = false;
  private activityRecognitionInterval: NodeJS.Timeout | null = null;
  private activityRecognitionCallback: ((startTime: Date) => void) | null = null;
  private heartRateStreamInterval: NodeJS.Timeout | null = null;
  private heartRateCallback: ((hr: number) => void) | null = null;

  private constructor() {}

  static getInstance(): HealthConnectService {
    if (!HealthConnectService.instance) {
      HealthConnectService.instance = new HealthConnectService();
    }
    return HealthConnectService.instance;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      try {
        const isInitialized = await initialize();
        this.initialized = isInitialized;
      } catch (error) {
        logger.error('Error initializing Health Connect:', error);
        this.initialized = false;
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const status = await getSdkStatus();
      return (
        status === SdkAvailabilityStatus.SDK_AVAILABLE ||
        status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
      );
    } catch (error) {
      logger.info('Health Connect not available:', error);
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

      await this.ensureInitialized();

      // Request permission to read steps, exercise sessions, and heart rate
      const grantedPermissions = await requestPermission([
        {
          accessType: 'read',
          recordType: 'Steps',
        },
        {
          accessType: 'read',
          recordType: 'ExerciseSession',
        },
        {
          accessType: 'read',
          recordType: 'HeartRate',
        },
      ]);

      const granted = grantedPermissions.length > 0;

      return {
        granted,
        canRequest: !granted,
        message: granted
          ? undefined
          : HealthServiceErrorMessages[HealthServiceErrorCode.PERMISSION_DENIED],
      };
    } catch (error) {
      logger.error('Error requesting Health Connect permissions:', error);
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

      await this.ensureInitialized();

      // Try to read a small amount of data to check permissions
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      try {
        await readRecords('Steps', {
          timeRangeFilter: {
            operator: 'between',
            startTime: oneDayAgo.toISOString(),
            endTime: now.toISOString(),
          },
        });
        return true;
      } catch (error) {
        // If we get a permission error, permissions are not granted
        return false;
      }
    } catch (error) {
      logger.error('Error checking Health Connect permissions:', error);
      return false;
    }
  }

  async getTodaySteps(): Promise<number> {
    try {
      await this.ensureInitialized();

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      // Sum up all step records for today
      const totalSteps = result.records.reduce((sum: number, record: any) => {
        return sum + (record.count || 0);
      }, 0);

      return Math.round(totalSteps);
    } catch (error) {
      logger.error('Error fetching today steps from Health Connect:', error);
      throw new HealthServiceError(
        'Failed to fetch today steps',
        HealthServiceErrorCode.DATA_UNAVAILABLE,
        HealthServiceErrorMessages[HealthServiceErrorCode.DATA_UNAVAILABLE]
      );
    }
  }

  async getStepsForDate(date: Date): Promise<number> {
    try {
      await this.ensureInitialized();

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      // Sum up all step records for the date
      const totalSteps = result.records.reduce((sum: number, record: any) => {
        return sum + (record.count || 0);
      }, 0);

      return Math.round(totalSteps);
    } catch (error) {
      logger.error('Error fetching steps for date from Health Connect:', error);
      throw new HealthServiceError(
        'Failed to fetch steps for date',
        HealthServiceErrorCode.DATA_UNAVAILABLE,
        HealthServiceErrorMessages[HealthServiceErrorCode.DATA_UNAVAILABLE]
      );
    }
  }

  async getStepsForDateRange(startDate: Date, endDate: Date): Promise<StepData[]> {
    try {
      await this.ensureInitialized();

      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });

      // Group records by date
      const stepsByDate = new Map<string, number>();

      result.records.forEach((record: any) => {
        const recordDate = new Date(record.startTime);
        const dateKey = recordDate.toISOString().split('T')[0];

        const currentSteps = stepsByDate.get(dateKey) || 0;
        stepsByDate.set(dateKey, currentSteps + (record.count || 0));
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
      logger.error('Error fetching steps for date range from Health Connect:', error);
      throw new HealthServiceError(
        'Failed to fetch steps for date range',
        HealthServiceErrorCode.DATA_UNAVAILABLE,
        HealthServiceErrorMessages[HealthServiceErrorCode.DATA_UNAVAILABLE]
      );
    }
  }

  async getAutoDetectedWorkouts(startDate: Date, endDate: Date): Promise<AutoDetectedWorkout[]> {
    try {
      await this.ensureInitialized();

      const result = await readRecords('ExerciseSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });

      // Filter for walking and running sessions
      const filteredSessions = result.records.filter((session: any) => {
        const exerciseType = session.exerciseType;
        return exerciseType === 7 || exerciseType === 79; // 7 = Walking, 79 = Running
      });

      // Convert to AutoDetectedWorkout format
      const autoDetectedWorkouts: AutoDetectedWorkout[] = filteredSessions.map((session: any) => {
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        const duration = (endTime.getTime() - startTime.getTime()) / 1000;

        return {
          id: session.metadata?.id || `${session.startTime}-${session.endTime}`,
          startTime,
          endTime,
          type: session.exerciseType === 79 ? 'running' : 'walking',
          steps: undefined, // Health Connect doesn't provide steps in exercise sessions
          distance: session.distance || undefined,
          duration: Math.round(duration),
          autoDetected: true,
        };
      });

      return autoDetectedWorkouts;
    } catch (error) {
      logger.error('Error fetching auto-detected workouts from Health Connect:', error);
      return [];
    }
  }

  async startActivityRecognition(callback: (startTime: Date) => void): Promise<void> {
    try {
      this.activityRecognitionCallback = callback;

      // Store that activity recognition is active
      await AsyncStorage.setItem(ACTIVITY_RECOGNITION_KEY, 'true');

      // Check for new exercise sessions every 2 minutes
      this.activityRecognitionInterval = setInterval(async () => {
        await this.checkForNewActivity();
      }, 2 * 60 * 1000); // 2 minutes

      logger.info('Activity recognition started (Health Connect)');
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
      await AsyncStorage.removeItem(LAST_ACTIVITY_CHECK_KEY);

      logger.info('Activity recognition stopped (Health Connect)');
    } catch (error) {
      logger.error('Error stopping activity recognition:', error);
    }
  }

  private async checkForNewActivity(): Promise<void> {
    try {
      // Check if user is already tracking a walk
      const isWalkingKey = await AsyncStorage.getItem('is_walking');
      if (isWalkingKey === 'true') {
        return; // Don't notify if already tracking
      }

      // Get last check time
      const lastCheckStr = await AsyncStorage.getItem(LAST_ACTIVITY_CHECK_KEY);
      const lastCheck = lastCheckStr ? new Date(lastCheckStr) : new Date(Date.now() - 30 * 60 * 1000);
      const now = new Date();

      // Query for exercise sessions since last check
      const workouts = await this.getAutoDetectedWorkouts(lastCheck, now);

      // Filter for walking sessions that are at least 5 minutes long
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

        logger.info('Auto-detection notification sent (Health Connect)', {
          startTime: latestWalk.startTime,
          duration: latestWalk.duration,
        });
      }

      // Update last check time
      await AsyncStorage.setItem(LAST_ACTIVITY_CHECK_KEY, now.toISOString());
    } catch (error) {
      logger.error('Error checking for new activity:', error);
    }
  }

  async getCurrentHeartRate(): Promise<number | null> {
    try {
      await this.ensureInitialized();

      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const result = await readRecords('HeartRate', {
        timeRangeFilter: {
          operator: 'between',
          startTime: fiveMinutesAgo.toISOString(),
          endTime: now.toISOString(),
        },
      });

      if (result.records.length > 0) {
        // Get the most recent heart rate sample
        const latestSample = result.records[result.records.length - 1];
        // Health Connect stores heart rate in samples array
        const bpm = (latestSample as any).samples?.[0]?.beatsPerMinute ||
                    (latestSample as any).beatsPerMinute || 0;
        return Math.round(bpm);
      }

      return null;
    } catch (error) {
      logger.error('Error fetching current heart rate from Health Connect:', error);
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

      logger.info('Heart rate streaming started (Health Connect)');
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

      logger.info('Heart rate streaming stopped (Health Connect)');
    } catch (error) {
      logger.error('Error stopping heart rate stream:', error);
    }
  }
}

export default HealthConnectService.getInstance();

