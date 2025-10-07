/**
 * Notification Service Factory
 * Returns the appropriate notification service based on test mode
 */

import { mockNotificationService } from './MockNotificationService';
import * as RealNotificationService from './notificationService';

/**
 * Check if we're in mock/test mode
 */
function isMockMode(): boolean {
  return process.env.MOCK_NOTIFICATIONS === 'true' || process.env.TEST_MODE === 'true';
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isMockMode()) {
    return mockNotificationService.requestPermissions();
  }
  return RealNotificationService.requestNotificationPermissions();
}

/**
 * Check if notification permissions are granted
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  if (isMockMode()) {
    return mockNotificationService.checkPermissions();
  }
  return RealNotificationService.checkNotificationPermissions();
}

/**
 * Schedule daily reminder notification
 */
export async function scheduleDailyReminder(time: string): Promise<void> {
  if (isMockMode()) {
    return mockNotificationService.scheduleDailyReminder(time);
  }
  return RealNotificationService.scheduleDailyReminder(time);
}

/**
 * Schedule streak reminder notification
 */
export async function scheduleStreakReminder(streakDays: number): Promise<void> {
  if (isMockMode()) {
    return mockNotificationService.scheduleStreakReminder(streakDays);
  }
  return RealNotificationService.scheduleStreakReminder(streakDays);
}

/**
 * Schedule goal celebration notification
 */
export async function scheduleGoalCelebration(steps: number, goal: number): Promise<void> {
  if (isMockMode()) {
    return mockNotificationService.scheduleGoalCelebration(steps, goal);
  }
  return RealNotificationService.scheduleGoalCelebration(steps, goal);
}

/**
 * Cancel notification by ID
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  if (isMockMode()) {
    return mockNotificationService.cancelNotification(notificationId);
  }
  return RealNotificationService.cancelNotification(notificationId);
}

/**
 * Cancel all notifications of a specific type
 */
export async function cancelNotificationsByType(type: any): Promise<void> {
  if (isMockMode()) {
    return mockNotificationService.cancelNotificationsByType(type);
  }
  return RealNotificationService.cancelNotificationsByType(type);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (isMockMode()) {
    return mockNotificationService.cancelAllNotifications();
  }
  return RealNotificationService.cancelAllNotifications();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<any[]> {
  if (isMockMode()) {
    return mockNotificationService.getAllScheduledNotifications();
  }
  return RealNotificationService.getAllScheduledNotifications();
}

/**
 * Send immediate notification
 */
export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  if (isMockMode()) {
    return mockNotificationService.sendImmediateNotification(title, body);
  }
  return RealNotificationService.sendImmediateNotification(title, body);
}

// Export mock service for testing
export { mockNotificationService };

