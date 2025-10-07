/**
 * Mock Notification Service for E2E Testing
 * Simulates notification scheduling without actually delivering notifications
 * Tracks scheduled notifications for verification in tests
 */

import type { NotificationType } from '../../types/profile';
import { logger } from '../utils/logger';

interface MockNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledTime: Date;
  trigger: any;
  data?: any;
}

class MockNotificationService {
  private scheduledNotifications: Map<string, MockNotification> = new Map();
  private notificationIdCounter = 0;

  /**
   * Request notification permissions (always returns true in mock mode)
   */
  async requestPermissions(): Promise<boolean> {
    logger.info('MockNotifications: requestPermissions (granted)');
    return true;
  }

  /**
   * Check if permissions are granted (always true in mock mode)
   */
  async checkPermissions(): Promise<boolean> {
    logger.info('MockNotifications: checkPermissions (granted)');
    return true;
  }

  /**
   * Schedule a daily reminder notification
   */
  async scheduleDailyReminder(time: string): Promise<void> {
    const id = this.generateId();
    const [hours, minutes] = time.split(':').map(Number);

    const notification: MockNotification = {
      id,
      type: 'daily_reminder',
      title: 'Time for your daily walk! 🚶',
      body: 'Keep your streak going and hit your step goal today.',
      scheduledTime: new Date(),
      trigger: {
        type: 'daily',
        hour: hours,
        minute: minutes,
      },
    };

    this.scheduledNotifications.set(id, notification);
    logger.info('MockNotifications: scheduleDailyReminder', { id, time });
  }

  /**
   * Schedule a streak reminder notification
   */
  async scheduleStreakReminder(streakDays: number): Promise<void> {
    const id = this.generateId();

    const notification: MockNotification = {
      id,
      type: 'streak_reminder',
      title: `${streakDays} day streak! 🔥`,
      body: "Don't break your streak! Log a walk today.",
      scheduledTime: new Date(),
      trigger: {
        type: 'daily',
        hour: 20,
        minute: 0,
      },
      data: { streakDays },
    };

    this.scheduledNotifications.set(id, notification);
    logger.info('MockNotifications: scheduleStreakReminder', { id, streakDays });
  }

  /**
   * Schedule a goal celebration notification
   */
  async scheduleGoalCelebration(steps: number, goal: number): Promise<void> {
    const id = this.generateId();

    const notification: MockNotification = {
      id,
      type: 'goal_celebration',
      title: '🎉 Goal achieved!',
      body: `You hit ${steps.toLocaleString()} steps today! Great job!`,
      scheduledTime: new Date(),
      trigger: null, // Immediate
      data: { steps, goal },
    };

    this.scheduledNotifications.set(id, notification);
    logger.info('MockNotifications: scheduleGoalCelebration', { id, steps, goal });
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    const deleted = this.scheduledNotifications.delete(notificationId);
    logger.info('MockNotifications: cancelNotification', { 
      id: notificationId, 
      deleted 
    });
  }

  /**
   * Cancel all notifications of a specific type
   */
  async cancelNotificationsByType(type: NotificationType): Promise<void> {
    let canceledCount = 0;
    
    for (const [id, notification] of this.scheduledNotifications.entries()) {
      if (notification.type === type) {
        this.scheduledNotifications.delete(id);
        canceledCount++;
      }
    }

    logger.info('MockNotifications: cancelNotificationsByType', { 
      type, 
      canceledCount 
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    const count = this.scheduledNotifications.size;
    this.scheduledNotifications.clear();
    logger.info('MockNotifications: cancelAllNotifications', { count });
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<MockNotification[]> {
    const notifications = Array.from(this.scheduledNotifications.values());
    logger.info('MockNotifications: getAllScheduledNotifications', { 
      count: notifications.length 
    });
    return notifications;
  }

  /**
   * Send immediate notification (for testing)
   */
  async sendImmediateNotification(title: string, body: string): Promise<void> {
    const id = this.generateId();

    const notification: MockNotification = {
      id,
      type: 'goal_celebration', // Default type
      title,
      body,
      scheduledTime: new Date(),
      trigger: null,
    };

    this.scheduledNotifications.set(id, notification);
    logger.info('MockNotifications: sendImmediateNotification', { id, title });
  }

  // Test helper methods

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): MockNotification | undefined {
    return this.scheduledNotifications.get(id);
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationType): MockNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(n => n.type === type);
  }

  /**
   * Check if a notification is scheduled
   */
  isNotificationScheduled(type: NotificationType): boolean {
    return this.getNotificationsByType(type).length > 0;
  }

  /**
   * Get count of scheduled notifications
   */
  getScheduledCount(): number {
    return this.scheduledNotifications.size;
  }

  /**
   * Clear all notifications (for test cleanup)
   */
  clearAll(): void {
    this.scheduledNotifications.clear();
    this.notificationIdCounter = 0;
    logger.info('MockNotifications: clearAll');
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `mock-notification-${++this.notificationIdCounter}`;
  }

  /**
   * Get all notification data (for debugging)
   */
  getDebugInfo(): {
    count: number;
    notifications: MockNotification[];
  } {
    return {
      count: this.scheduledNotifications.size,
      notifications: Array.from(this.scheduledNotifications.values()),
    };
  }
}

// Export singleton instance
export const mockNotificationService = new MockNotificationService();

// Export class for testing
export { MockNotificationService };
export type { MockNotification };

