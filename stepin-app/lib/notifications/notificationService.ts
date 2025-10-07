/**
 * Notification Service
 * Handles local notifications for daily reminders, streak reminders, and goal celebrations
 */

import * as Notifications from 'expo-notifications';
import type { NotificationBehavior } from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationType } from '../../types/profile';
import { logger } from '../utils/logger';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    return true;
  } catch (error) {
    logger.error('Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * Get current notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<string> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    logger.error('Failed to get notification permission status:', error);
    return 'undetermined';
  }
}

/**
 * Schedule daily reminder notification
 * Title: "Time for a walk? 🌤️"
 * Body: "Your daily steps are waiting. Every step counts!"
 * Schedule: User-selected time (default 9:00 AM), repeats daily
 */
export async function scheduleDailyReminder(time: string): Promise<string | null> {
  try {
    // Parse time string (format: "HH:mm")
    const [hours, minutes] = time.split(':').map(Number);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for a walk? 🌤️',
        body: 'Your daily steps are waiting. Every step counts!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return notificationId;
  } catch (error) {
    logger.error('Failed to schedule daily reminder:', error);
    return null;
  }
}

/**
 * Schedule streak reminder notification
 * Title: "Keep your streak alive! 🔥"
 * Body: "You haven't logged steps today. A short walk counts!"
 * Schedule: 7:00 PM daily (conditional - only if no steps logged)
 */
export async function scheduleStreakReminder(): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Keep your streak alive! 🔥',
        body: "You haven't logged steps today. A short walk counts!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19, // 7:00 PM
        minute: 0,
      },
    });

    return notificationId;
  } catch (error) {
    logger.error('Failed to schedule streak reminder:', error);
    return null;
  }
}

/**
 * Send goal celebration notification immediately
 * Title: "Goal completed! 🎉"
 * Body: "You reached your daily step goal. Well done!"
 * Trigger: When daily steps reach goal, once per day maximum
 */
export async function sendGoalCelebrationNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Goal completed! 🎉',
        body: 'You reached your daily step goal. Well done!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    logger.error('Failed to send goal celebration notification:', error);
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    logger.error('Failed to cancel notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error('Failed to cancel all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    logger.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Send immediate notification (for testing or custom triggers)
 */
export async function sendImmediateNotification(
  title: string,
  body: string
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    logger.error('Failed to send immediate notification:', error);
  }
}

/**
 * Update notification schedule based on user settings
 * This should be called whenever notification settings change
 */
export async function updateNotificationSchedule(
  settings: {
    dailyReminder: boolean;
    streakReminder: boolean;
    goalCelebration: boolean;
    reminderTime: string;
  },
  currentIds: {
    dailyReminder: string | null;
    streakReminder: string | null;
  }
): Promise<{
  dailyReminder: string | null;
  streakReminder: string | null;
}> {
  try {
    const newIds = {
      dailyReminder: null as string | null,
      streakReminder: null as string | null,
    };

    // Cancel existing notifications
    if (currentIds.dailyReminder) {
      await cancelNotification(currentIds.dailyReminder);
    }
    if (currentIds.streakReminder) {
      await cancelNotification(currentIds.streakReminder);
    }

    // Schedule new notifications based on settings
    if (settings.dailyReminder) {
      newIds.dailyReminder = await scheduleDailyReminder(settings.reminderTime);
    }

    if (settings.streakReminder) {
      newIds.streakReminder = await scheduleStreakReminder();
    }

    // Note: Goal celebration is triggered programmatically, not scheduled

    return newIds;
  } catch (error) {
    logger.error('Failed to update notification schedule:', error);
    return {
      dailyReminder: null,
      streakReminder: null,
    };
  }
}

