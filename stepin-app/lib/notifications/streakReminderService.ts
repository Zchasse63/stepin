/**
 * Streak Reminder Service
 * Handles conditional streak reminder notifications
 * Only sends if user has active streak and hasn't met goal today
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';

const STREAK_REMINDER_SENT_KEY = 'streak_reminder_sent_';

/**
 * Check if streak reminder should be sent and send it
 * Trigger Conditions:
 * - User has active streak (current_streak > 0)
 * - Current date's goal NOT yet met
 * - Current time is 8:00 PM or later
 * - User has not already walked today (total_steps === 0 or very low)
 * - Notification not already sent today
 * - User has streak reminder enabled in settings
 */
export async function checkAndSendStreakReminder(userId: string): Promise<boolean> {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Only check after 8 PM (20:00)
    if (currentHour < 20) {
      logger.info('Streak reminder: Too early, skipping', { currentHour });
      return false;
    }

    // Check if already sent today
    const today = now.toISOString().split('T')[0];
    const sentKey = `${STREAK_REMINDER_SENT_KEY}${today}`;
    const alreadySent = await AsyncStorage.getItem(sentKey);
    
    if (alreadySent) {
      logger.info('Streak reminder: Already sent today');
      return false;
    }

    // Get user profile and check if streak reminders are enabled
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('notification_settings, daily_step_goal')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      logger.error('Streak reminder: Failed to fetch profile', profileError);
      return false;
    }

    const notificationSettings = typeof profile.notification_settings === 'string'
      ? JSON.parse(profile.notification_settings)
      : profile.notification_settings;

    if (!notificationSettings?.streakReminder) {
      logger.info('Streak reminder: Disabled in settings');
      return false;
    }

    // Get current streak
    const { data: streak, error: streakError } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    if (streakError || !streak || streak.current_streak === 0) {
      logger.info('Streak reminder: No active streak', { currentStreak: streak?.current_streak });
      return false;
    }

    // Get today's stats
    const { data: todayStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('total_steps, goal_met')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // If goal already met, don't send reminder
    if (todayStats?.goal_met) {
      logger.info('Streak reminder: Goal already met today');
      return false;
    }

    // If user has walked a significant amount (>50% of goal), don't send
    const stepGoal = profile.daily_step_goal || 7000;
    const todaySteps = todayStats?.total_steps || 0;
    
    if (todaySteps > stepGoal * 0.5) {
      logger.info('Streak reminder: User has walked significantly today', { 
        todaySteps, 
        threshold: stepGoal * 0.5 
      });
      return false;
    }

    // All conditions met - send the reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Don't break your ${streak.current_streak} day streak! 🔥`,
        body: 'Just a few more steps to keep it going!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: 'streak_reminder',
          userId,
          streakDays: streak.current_streak,
        },
      },
      trigger: null, // Send immediately
    });

    // Mark as sent for today
    await AsyncStorage.setItem(sentKey, 'true');

    logger.info('Streak reminder: Sent successfully', { 
      userId, 
      streakDays: streak.current_streak,
      todaySteps 
    });

    return true;
  } catch (error) {
    logger.error('Streak reminder: Failed to check/send', error);
    return false;
  }
}

/**
 * Schedule periodic checks for streak reminder
 * Should be called when app is active
 * Checks every hour after 8 PM
 */
export function scheduleStreakReminderChecks(userId: string): NodeJS.Timeout {
  const checkInterval = setInterval(async () => {
    await checkAndSendStreakReminder(userId);
  }, 60 * 60 * 1000); // Check every hour

  // Do initial check
  checkAndSendStreakReminder(userId);

  return checkInterval;
}

/**
 * Clear streak reminder sent flag (for testing)
 */
export async function clearStreakReminderFlag(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const sentKey = `${STREAK_REMINDER_SENT_KEY}${today}`;
  await AsyncStorage.removeItem(sentKey);
}

