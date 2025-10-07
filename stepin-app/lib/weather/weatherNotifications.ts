/**
 * Weather Notifications Service
 * Schedules proactive notifications for bad weather at user's preferred walk time
 * Phase 10: Weather Integration & Audio Coaching
 */

import * as Notifications from 'expo-notifications';
import { weatherService } from './weatherService';
import { supabase } from '@/lib/supabase/client';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';
import type { PreferredWalkTime, LocationCoordinates } from '@/types/profile';

/**
 * Schedule weather notifications for a user
 * Checks forecast and schedules notification 1 hour before preferred walk time if bad weather
 * @param userId User ID to schedule notifications for
 */
export async function scheduleWeatherNotifications(userId: string): Promise<void> {
  try {
    logger.info('Weather Notifications: Scheduling for user', { userId });

    // Get user profile with weather preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('location_coordinates, preferred_walk_time, weather_alerts_enabled')
      .eq('id', userId)
      .single();

    if (profileError) {
      logger.error('Weather Notifications: Failed to fetch profile', profileError);
      return;
    }

    // Check if weather alerts are enabled
    if (!profile.weather_alerts_enabled) {
      logger.info('Weather Notifications: Alerts disabled for user', { userId });
      return;
    }

    // Check if location is available
    const locationCoords = profile.location_coordinates as LocationCoordinates | null;
    if (!locationCoords || !locationCoords.lat || !locationCoords.lng) {
      logger.info('Weather Notifications: No location available', { userId });
      return;
    }

    // Get 5-day forecast
    const forecast = await weatherService.get5DayForecast(
      locationCoords.lat,
      locationCoords.lng
    );

    if (forecast.length === 0) {
      logger.warn('Weather Notifications: No forecast data available', { userId });
      return;
    }

    // Check if reminder should be sent
    const preferredTime = (profile.preferred_walk_time || 'morning') as PreferredWalkTime;
    const reminderResult = weatherService.shouldSendWalkReminder(forecast, preferredTime);

    if (!reminderResult.shouldSend) {
      logger.info('Weather Notifications: Good weather, no notification needed', { 
        userId, 
        reason: reminderResult.reason 
      });
      return;
    }

    // Cancel any existing weather notifications
    await cancelWeatherNotifications(userId);

    // Calculate notification time (1 hour before preferred walk time)
    const notificationTime = calculateNotificationTime(preferredTime);

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌤️ Weather Update for Your Walk',
        body: `${reminderResult.reason}. ${reminderResult.suggestedTime}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'weather_alert',
          userId,
          preferredTime,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.floor((notificationTime.getTime() - Date.now()) / 1000),
      },
    });

    logger.info('Weather Notifications: Scheduled successfully', {
      userId,
      notificationId,
      scheduledFor: notificationTime.toISOString(),
      reason: reminderResult.reason,
    });

    Sentry.addBreadcrumb({
      category: 'weather',
      message: 'Weather notification scheduled',
      level: 'info',
      data: {
        userId,
        notificationId,
        reason: reminderResult.reason,
      },
    });

    // Store notification ID for tracking (optional)
    await storeNotificationId(userId, notificationId);

  } catch (error: any) {
    logger.error('Weather Notifications: Failed to schedule', error);
    Sentry.captureException(error, {
      tags: { feature: 'weather_notifications' },
      extra: { userId },
    });
  }
}

/**
 * Check weather and schedule notifications for all users
 * This would typically be called by a background task or cron job
 */
export async function checkWeatherForAllUsers(): Promise<void> {
  try {
    logger.info('Weather Notifications: Checking weather for all users');

    // Get current user (in a real app, this would iterate through all users)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error('Weather Notifications: No authenticated user', authError);
      return;
    }

    // Schedule notifications for current user
    await scheduleWeatherNotifications(user.id);

  } catch (error: any) {
    logger.error('Weather Notifications: Failed to check weather for all users', error);
    Sentry.captureException(error, {
      tags: { feature: 'weather_notifications' },
    });
  }
}

/**
 * Cancel all weather notifications for a user
 * @param userId User ID
 */
export async function cancelWeatherNotifications(userId: string): Promise<void> {
  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Filter weather notifications for this user
    const weatherNotifications = scheduledNotifications.filter(
      notification => 
        notification.content.data?.type === 'weather_alert' &&
        notification.content.data?.userId === userId
    );

    // Cancel each weather notification
    for (const notification of weatherNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      logger.info('Weather Notifications: Cancelled notification', {
        userId,
        notificationId: notification.identifier,
      });
    }

  } catch (error: any) {
    logger.error('Weather Notifications: Failed to cancel notifications', error);
  }
}

/**
 * Calculate notification time (1 hour before preferred walk time)
 * @param preferredTime User's preferred walk time
 * @returns Date object for notification trigger
 */
function calculateNotificationTime(preferredTime: PreferredWalkTime): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Set time based on preference (1 hour before walk time)
  switch (preferredTime) {
    case 'morning':
      tomorrow.setHours(7, 0, 0, 0); // 7 AM (1 hour before 8 AM walk)
      break;
    case 'afternoon':
      tomorrow.setHours(13, 0, 0, 0); // 1 PM (1 hour before 2 PM walk)
      break;
    case 'evening':
      tomorrow.setHours(17, 0, 0, 0); // 5 PM (1 hour before 6 PM walk)
      break;
    default:
      tomorrow.setHours(13, 0, 0, 0);
  }

  // If the time has already passed today, schedule for tomorrow
  if (tomorrow <= now) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }

  return tomorrow;
}

/**
 * Store notification ID for tracking (optional)
 * This allows us to manage notifications more easily
 * @param userId User ID
 * @param notificationId Notification identifier
 */
async function storeNotificationId(userId: string, notificationId: string): Promise<void> {
  try {
    // Store in AsyncStorage or a notifications table
    // For now, we'll just log it
    logger.info('Weather Notifications: Notification ID stored', {
      userId,
      notificationId,
    });
  } catch (error: any) {
    logger.error('Weather Notifications: Failed to store notification ID', error);
  }
}

/**
 * Reschedule weather notifications when settings change
 * @param userId User ID
 */
export async function rescheduleWeatherNotifications(userId: string): Promise<void> {
  try {
    logger.info('Weather Notifications: Rescheduling for user', { userId });

    // Cancel existing notifications
    await cancelWeatherNotifications(userId);

    // Schedule new notifications
    await scheduleWeatherNotifications(userId);

  } catch (error: any) {
    logger.error('Weather Notifications: Failed to reschedule', error);
    Sentry.captureException(error, {
      tags: { feature: 'weather_notifications' },
      extra: { userId },
    });
  }
}

