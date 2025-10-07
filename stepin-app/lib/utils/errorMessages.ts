/**
 * Error Messages Utility
 * Maps error codes to user-friendly messages
 * Multi-language ready for future internationalization
 */

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_DENIED'
  | 'HEALTHKIT_UNAVAILABLE'
  | 'HEALTH_CONNECT_NOT_INSTALLED'
  | 'SYNC_FAILED'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_ENTRY'
  | 'INVALID_DATE'
  | 'INVALID_STEPS'
  | 'INVALID_DURATION'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';

interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
}

const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  NETWORK_ERROR: {
    title: "Can't Connect",
    message: "Please check your internet connection and try again.",
    action: 'Retry',
  },
  AUTH_ERROR: {
    title: 'Authentication Failed',
    message: 'There was a problem signing you in. Please try again.',
    action: 'Try Again',
  },
  PERMISSION_DENIED: {
    title: 'Permission Required',
    message: 'Stepin needs permission to access your health data to track your steps automatically.',
    action: 'Grant Permission',
  },
  HEALTHKIT_UNAVAILABLE: {
    title: 'HealthKit Unavailable',
    message: 'HealthKit is not available on this device. You can still log walks manually.',
    action: 'Log Manually',
  },
  HEALTH_CONNECT_NOT_INSTALLED: {
    title: 'Health Connect Not Found',
    message: 'Please install Health Connect from the Play Store to track steps automatically.',
    action: 'Install Health Connect',
  },
  SYNC_FAILED: {
    title: 'Sync Failed',
    message: "We couldn't sync your latest data. Your progress is saved and will sync when possible.",
    action: 'Try Again',
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    action: 'OK',
  },
  DUPLICATE_ENTRY: {
    title: 'Walk Already Logged',
    message: 'It looks like you already logged a walk for this time. Would you like to add it anyway?',
    action: 'Add Anyway',
  },
  INVALID_DATE: {
    title: 'Invalid Date',
    message: "You can't log a walk for a future date. Please select today or an earlier date.",
    action: 'OK',
  },
  INVALID_STEPS: {
    title: 'Invalid Step Count',
    message: 'Please enter a step count between 0 and 200,000.',
    action: 'OK',
  },
  INVALID_DURATION: {
    title: 'Invalid Duration',
    message: 'Please enter a duration between 0 and 1,440 minutes (24 hours).',
    action: 'OK',
  },
  DATABASE_ERROR: {
    title: 'Something Went Wrong',
    message: "We couldn't save your data. Please try again.",
    action: 'Try Again',
  },
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    message: 'Something unexpected happened. Please try again.',
    action: 'OK',
  },
};

/**
 * Get user-friendly error message for an error code
 */
export function getErrorMessage(code: ErrorCode): ErrorMessage {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Parse error object and return appropriate error code
 */
export function parseError(error: any): ErrorCode {
  if (!error) return 'UNKNOWN_ERROR';

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('offline') ||
    errorCode.includes('network')
  ) {
    return 'NETWORK_ERROR';
  }

  // Auth errors
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('token') ||
    errorCode.includes('auth')
  ) {
    return 'AUTH_ERROR';
  }

  // Permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('denied') ||
    errorCode.includes('permission')
  ) {
    return 'PERMISSION_DENIED';
  }

  // HealthKit errors
  if (errorMessage.includes('healthkit')) {
    return 'HEALTHKIT_UNAVAILABLE';
  }

  // Health Connect errors
  if (errorMessage.includes('health connect')) {
    return 'HEALTH_CONNECT_NOT_INSTALLED';
  }

  // Sync errors
  if (errorMessage.includes('sync')) {
    return 'SYNC_FAILED';
  }

  // Database errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('supabase') ||
    errorCode.includes('pgrst')
  ) {
    return 'DATABASE_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Get user-friendly error message from error object
 */
export function getUserFriendlyError(error: any): ErrorMessage {
  const code = parseError(error);
  return getErrorMessage(code);
}

/**
 * Validation helpers
 */
export const validation = {
  /**
   * Validate step count
   */
  steps: (steps: number): { valid: boolean; error?: ErrorCode } => {
    if (steps < 0 || steps > 200000) {
      return { valid: false, error: 'INVALID_STEPS' };
    }
    return { valid: true };
  },

  /**
   * Validate duration in minutes
   */
  duration: (minutes: number): { valid: boolean; error?: ErrorCode } => {
    if (minutes < 0 || minutes > 1440) {
      return { valid: false, error: 'INVALID_DURATION' };
    }
    return { valid: true };
  },

  /**
   * Validate date (cannot be in the future)
   */
  date: (date: Date): { valid: boolean; error?: ErrorCode } => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    
    if (date > now) {
      return { valid: false, error: 'INVALID_DATE' };
    }
    return { valid: true };
  },

  /**
   * Check for very large step counts (might be a mistake)
   */
  isUnusuallyHigh: (steps: number): boolean => {
    return steps > 50000;
  },

  /**
   * Check for very low goal (might be a mistake)
   */
  isUnusuallyLowGoal: (goal: number): boolean => {
    return goal < 2000;
  },
};

/**
 * Format validation error for display
 */
export function formatValidationError(error: ErrorCode): string {
  const errorMessage = getErrorMessage(error);
  return errorMessage.message;
}

