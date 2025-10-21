/**
 * Goal Celebration Service
 * Handles goal celebration notifications
 * Only sends once per day when user reaches their step goal
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';

const GOAL_CELEBRATION_SENT_KEY = 'goal_celebration_sent_';

/**
 * Check if goal celebration notification should be sent and send it
 * Trigger Conditions:
 * - User has reached their daily step goal
 * - Notification not already sent today
 * - User has goal celebration enabled in settings
 */
export async function checkAndSendGoalCelebration(
  userId: string,
  currentSteps: number,
  stepGoal: number
): Promise<boolean> {
  try {
    // Check if goal is met
    if (currentSteps < stepGoal) {
      return false;
    }

    // Check if already sent today
    const today = new Date().toISOString().split('T')[0];
    const sentKey = `${GOAL_CELEBRATION_SENT_KEY}${today}`;
    const alreadySent = await AsyncStorage.getItem(sentKey);
    
    if (alreadySent) {
      logger.info('Goal celebration: Already sent today');
      return false;
    }

    // Get user profile and check if goal celebrations are enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error('Goal celebration: Failed to fetch profile', profileError);
      return false;
    }

    const notificationSettings = typeof profile.notification_settings === 'string'
      ? JSON.parse(profile.notification_settings)
      : profile.notification_settings;

    if (!notificationSettings?.goalCelebration) {
      logger.info('Goal celebration: Disabled in settings');
      return false;
    }

    // All conditions met - send the celebration
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Goal completed! 🎉',
        body: 'You reached your daily step goal. Well done!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'goal_celebration',
          userId,
          steps: currentSteps,
          goal: stepGoal,
        },
      },
      trigger: null, // Send immediately
    });

    // Mark as sent for today
    await AsyncStorage.setItem(sentKey, 'true');

    logger.info('Goal celebration: Sent successfully', { 
      userId, 
      steps: currentSteps,
      goal: stepGoal
    });

    return true;
  } catch (error) {
    logger.error('Goal celebration: Failed to check/send', error);
    return false;
  }
}

/**
 * Clear goal celebration sent flag (for testing)
 */
export async function clearGoalCelebrationFlag(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const sentKey = `${GOAL_CELEBRATION_SENT_KEY}${today}`;
  await AsyncStorage.removeItem(sentKey);
}

