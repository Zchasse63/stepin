/**
 * Health Service Interface
 * Abstract interface for health data operations across platforms
 */

export interface StepData {
  date: Date;
  steps: number;
}

export interface HealthPermissionStatus {
  granted: boolean;
  canRequest: boolean;
  message?: string;
}

export interface AutoDetectedWorkout {
  id: string;
  startTime: Date;
  endTime: Date;
  type: 'walking' | 'running';
  steps?: number;
  distance?: number;
  duration: number;
  autoDetected: boolean;
}

export interface HeartRateSample {
  hr: number;
  timestamp: Date;
}

export interface HealthServiceInterface {
  /**
   * Request permissions to access health data
   * @returns Promise<HealthPermissionStatus> - Permission status with details
   */
  requestPermissions(): Promise<HealthPermissionStatus>;

  /**
   * Check if permissions are already granted
   * @returns Promise<boolean> - True if permissions granted
   */
  checkPermissions(): Promise<boolean>;

  /**
   * Get step count for today
   * @returns Promise<number> - Total steps for today
   */
  getTodaySteps(): Promise<number>;

  /**
   * Get step count for a specific date
   * @param date - The date to query
   * @returns Promise<number> - Total steps for the date
   */
  getStepsForDate(date: Date): Promise<number>;

  /**
   * Get step counts for a date range
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Promise<StepData[]> - Array of step data by date
   */
  getStepsForDateRange(startDate: Date, endDate: Date): Promise<StepData[]>;

  /**
   * Check if health service is available on this device
   * @returns Promise<boolean> - True if available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get auto-detected workouts in a date range
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Promise<AutoDetectedWorkout[]> - Array of auto-detected workouts
   */
  getAutoDetectedWorkouts(startDate: Date, endDate: Date): Promise<AutoDetectedWorkout[]>;

  /**
   * Start activity recognition for workout auto-detection
   * @param callback - Callback function when walking is detected
   * @returns Promise<void>
   */
  startActivityRecognition(callback: (startTime: Date) => void): Promise<void>;

  /**
   * Stop activity recognition
   * @returns Promise<void>
   */
  stopActivityRecognition(): Promise<void>;

  /**
   * Get current heart rate
   * @returns Promise<number | null> - Current heart rate in BPM or null if unavailable
   */
  getCurrentHeartRate(): Promise<number | null>;

  /**
   * Stream heart rate data in real-time
   * @param callback - Callback function when new HR sample arrives
   * @returns Promise<void>
   */
  streamHeartRate(callback: (hr: number) => void): Promise<void>;

  /**
   * Stop heart rate streaming
   * @returns Promise<void>
   */
  stopHeartRateStream(): Promise<void>;
}

/**
 * Health Service Error Types
 */
export class HealthServiceError extends Error {
  constructor(
    message: string,
    public code: HealthServiceErrorCode,
    public userMessage: string
  ) {
    super(message);
    this.name = 'HealthServiceError';
  }
}

export enum HealthServiceErrorCode {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PERMISSION_NOT_REQUESTED = 'PERMISSION_NOT_REQUESTED',
  DATA_UNAVAILABLE = 'DATA_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages
 */
export const HealthServiceErrorMessages = {
  [HealthServiceErrorCode.NOT_AVAILABLE]:
    'Health tracking is not available on this device. You can still log walks manually.',
  [HealthServiceErrorCode.PERMISSION_DENIED]:
    'To track your steps automatically, please grant access to health data in Settings.',
  [HealthServiceErrorCode.PERMISSION_NOT_REQUESTED]:
    'Health permissions have not been requested yet.',
  [HealthServiceErrorCode.DATA_UNAVAILABLE]:
    'Unable to fetch step data at this time. Please try again later.',
  [HealthServiceErrorCode.UNKNOWN_ERROR]:
    'An unexpected error occurred. Please try again.',
};

