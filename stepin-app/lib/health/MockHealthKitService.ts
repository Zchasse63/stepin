/**
 * Mock HealthKit Service for E2E Testing
 * Simulates HealthKit behavior using environment variables
 * Enables testing without real HealthKit access
 */

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

export class MockHealthKitService implements HealthServiceInterface {
  private static instance: MockHealthKitService;
  private mockSteps: number = 0;
  private mockPermissionGranted: boolean = false;
  private mockHistoricalData: Map<string, number> = new Map();
  private activityRecognitionCallback: ((startTime: Date) => void) | null = null;
  private heartRateCallback: ((hr: number) => void) | null = null;

  private constructor() {
    this.loadMockConfiguration();
  }

  static getInstance(): MockHealthKitService {
    if (!MockHealthKitService.instance) {
      MockHealthKitService.instance = new MockHealthKitService();
    }
    return MockHealthKitService.instance;
  }

  /**
   * Load mock configuration from environment variables
   */
  private loadMockConfiguration() {
    // Load mock steps
    const mockSteps = process.env.MOCK_HEALTHKIT_STEPS;
    if (mockSteps) {
      this.mockSteps = parseInt(mockSteps, 10);
    }

    // Load mock permission state
    const mockPermission = process.env.MOCK_HEALTHKIT_PERMISSION;
    this.mockPermissionGranted = mockPermission === 'granted';

    // Load mock historical data
    const mockData = process.env.MOCK_HEALTHKIT_DATA;
    if (mockData) {
      try {
        const data = JSON.parse(mockData);
        Object.entries(data).forEach(([date, steps]) => {
          this.mockHistoricalData.set(date, steps as number);
        });
      } catch (error) {
        logger.error('Failed to parse MOCK_HEALTHKIT_DATA:', error);
      }
    }

    logger.info('MockHealthKit: Configuration loaded', {
      steps: this.mockSteps,
      permission: this.mockPermissionGranted,
      historicalDates: this.mockHistoricalData.size,
    });
  }

  async isAvailable(): Promise<boolean> {
    const available = process.env.MOCK_HEALTHKIT_AVAILABLE !== 'false';
    logger.info('MockHealthKit: isAvailable', { available });
    return available;
  }

  async requestPermissions(): Promise<HealthPermissionStatus> {
    logger.info('MockHealthKit: requestPermissions called');

    // Simulate permission request delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const granted = this.mockPermissionGranted;

    return {
      granted,
      canRequest: !granted,
      message: granted
        ? undefined
        : HealthServiceErrorMessages[HealthServiceErrorCode.PERMISSION_DENIED],
    };
  }

  async checkPermissions(): Promise<boolean> {
    logger.info('MockHealthKit: checkPermissions', { granted: this.mockPermissionGranted });
    return this.mockPermissionGranted;
  }

  async getTodaySteps(): Promise<number> {
    if (!this.mockPermissionGranted) {
      throw new HealthServiceError(
        'Permission denied',
        HealthServiceErrorCode.PERMISSION_DENIED,
        HealthServiceErrorMessages[HealthServiceErrorCode.PERMISSION_DENIED]
      );
    }

    logger.info('MockHealthKit: getTodaySteps', { steps: this.mockSteps });
    return this.mockSteps;
  }

  async getStepsForDate(date: Date): Promise<number> {
    if (!this.mockPermissionGranted) {
      throw new HealthServiceError(
        'Permission denied',
        HealthServiceErrorCode.PERMISSION_DENIED,
        HealthServiceErrorMessages[HealthServiceErrorCode.PERMISSION_DENIED]
      );
    }

    const dateKey = date.toISOString().split('T')[0];
    const steps = this.mockHistoricalData.get(dateKey) || 0;

    logger.info('MockHealthKit: getStepsForDate', { date: dateKey, steps });
    return steps;
  }

  async getStepsForDateRange(startDate: Date, endDate: Date): Promise<StepData[]> {
    if (!this.mockPermissionGranted) {
      throw new HealthServiceError(
        'Permission denied',
        HealthServiceErrorCode.PERMISSION_DENIED,
        HealthServiceErrorMessages[HealthServiceErrorCode.PERMISSION_DENIED]
      );
    }

    const result: StepData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const steps = this.mockHistoricalData.get(dateKey) || 0;

      result.push({
        date: new Date(currentDate),
        steps,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    logger.info('MockHealthKit: getStepsForDateRange', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      count: result.length,
    });

    return result;
  }

  async getAutoDetectedWorkouts(startDate: Date, endDate: Date): Promise<AutoDetectedWorkout[]> {
    logger.info('MockHealthKit: getAutoDetectedWorkouts (returning empty array)');
    return [];
  }

  async startActivityRecognition(callback: (startTime: Date) => void): Promise<void> {
    logger.info('MockHealthKit: startActivityRecognition');
    this.activityRecognitionCallback = callback;
  }

  async stopActivityRecognition(): Promise<void> {
    logger.info('MockHealthKit: stopActivityRecognition');
    this.activityRecognitionCallback = null;
  }

  async getCurrentHeartRate(): Promise<number | null> {
    const mockHR = process.env.MOCK_HEALTHKIT_HEART_RATE;
    const hr = mockHR ? parseInt(mockHR, 10) : null;
    logger.info('MockHealthKit: getCurrentHeartRate', { hr });
    return hr;
  }

  async streamHeartRate(callback: (hr: number) => void): Promise<void> {
    logger.info('MockHealthKit: streamHeartRate');
    this.heartRateCallback = callback;

    // Simulate heart rate updates
    const mockHR = process.env.MOCK_HEALTHKIT_HEART_RATE;
    if (mockHR && this.heartRateCallback) {
      const hr = parseInt(mockHR, 10);
      this.heartRateCallback(hr);
    }
  }

  async stopHeartRateStream(): Promise<void> {
    logger.info('MockHealthKit: stopHeartRateStream');
    this.heartRateCallback = null;
  }

  // Test helper methods
  setMockSteps(steps: number) {
    this.mockSteps = steps;
    logger.info('MockHealthKit: setMockSteps', { steps });
  }

  setMockPermission(granted: boolean) {
    this.mockPermissionGranted = granted;
    logger.info('MockHealthKit: setMockPermission', { granted });
  }

  setMockHistoricalData(date: string, steps: number) {
    this.mockHistoricalData.set(date, steps);
    logger.info('MockHealthKit: setMockHistoricalData', { date, steps });
  }

  clearMockData() {
    this.mockHistoricalData.clear();
    logger.info('MockHealthKit: clearMockData');
  }

  triggerActivityDetection() {
    if (this.activityRecognitionCallback) {
      this.activityRecognitionCallback(new Date());
      logger.info('MockHealthKit: triggerActivityDetection');
    }
  }

  triggerHeartRateUpdate(hr: number) {
    if (this.heartRateCallback) {
      this.heartRateCallback(hr);
      logger.info('MockHealthKit: triggerHeartRateUpdate', { hr });
    }
  }
}

export default MockHealthKitService.getInstance();

