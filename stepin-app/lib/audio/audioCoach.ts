/**
 * Audio Coach Service
 * Provides voice guidance and encouragement during walks using text-to-speech
 * Phase 10: Weather Integration & Audio Coaching
 */

import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';

/**
 * Coaching message types
 */
export type CoachingMessage =
  | { type: 'progress'; data: { elapsed: number; steps: number; distance: number } }
  | { type: 'milestone'; data: { milestone: string } }
  | { type: 'encouragement'; data: { message: string } }
  | { type: 'heartRate'; data: { hr: number; zone: string } };

/**
 * Audio Coach Class
 * Manages text-to-speech announcements during walks with music ducking
 */
class AudioCoach {
  private enabled: boolean = false;
  private intervalSeconds: number = 300; // 5 minutes default
  private lastAnnouncementTime: Date | null = null;
  private isSpeaking: boolean = false;

  /**
   * Configure audio coaching settings
   * @param enabled Whether audio coaching is enabled
   * @param intervalSeconds Interval between announcements in seconds (180-600)
   */
  async configure(enabled: boolean, intervalSeconds: number = 300): Promise<void> {
    try {
      this.enabled = enabled;
      this.intervalSeconds = Math.max(180, Math.min(600, intervalSeconds)); // Clamp to 3-10 minutes

      if (enabled) {
        // Configure audio mode for background playback and ducking
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true, // Lower other audio during announcements
          playThroughEarpieceAndroid: false,
        });

        logger.info('Audio Coach: Configured', {
          enabled,
          intervalSeconds: this.intervalSeconds,
        });

        Sentry.addBreadcrumb({
          category: 'audio_coach',
          message: 'Audio coach configured',
          level: 'info',
          data: { enabled, intervalSeconds: this.intervalSeconds },
        });
      }
    } catch (error: any) {
      logger.error('Audio Coach: Failed to configure', error);
      Sentry.captureException(error, {
        tags: { feature: 'audio_coach' },
      });
    }
  }

  /**
   * Announce a coaching message
   * @param message Coaching message to announce
   */
  async announce(message: CoachingMessage): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      // Check interval (except for milestones which are always announced)
      if (message.type !== 'milestone' && this.lastAnnouncementTime) {
        const timeSinceLastAnnouncement = Date.now() - this.lastAnnouncementTime.getTime();
        const intervalMs = this.intervalSeconds * 1000;

        if (timeSinceLastAnnouncement < intervalMs) {
          logger.info('Audio Coach: Skipping announcement (too soon)', {
            timeSince: Math.round(timeSinceLastAnnouncement / 1000),
            interval: this.intervalSeconds,
          });
          return;
        }
      }

      // Stop any current speech
      if (this.isSpeaking) {
        await Speech.stop();
      }

      // Format message
      const text = this.formatMessage(message);

      logger.info('Audio Coach: Announcing', { type: message.type, text });

      Sentry.addBreadcrumb({
        category: 'audio_coach',
        message: 'Audio announcement',
        level: 'info',
        data: { type: message.type, text },
      });

      // Speak the message
      this.isSpeaking = true;
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for clarity
        onDone: () => {
          this.isSpeaking = false;
          this.lastAnnouncementTime = new Date();
          logger.info('Audio Coach: Announcement complete');
        },
        onError: (error) => {
          this.isSpeaking = false;
          logger.error('Audio Coach: Speech error', error);
        },
      });
    } catch (error: any) {
      this.isSpeaking = false;
      logger.error('Audio Coach: Failed to announce', error);
      Sentry.captureException(error, {
        tags: { feature: 'audio_coach' },
        extra: { messageType: message.type },
      });
    }
  }

  /**
   * Stop any current announcement
   */
  async stop(): Promise<void> {
    try {
      if (this.isSpeaking) {
        await Speech.stop();
        this.isSpeaking = false;
        logger.info('Audio Coach: Stopped');
      }
    } catch (error: any) {
      logger.error('Audio Coach: Failed to stop', error);
    }
  }

  /**
   * Format coaching message into speech text
   * @param message Coaching message
   * @returns Formatted text for speech
   */
  private formatMessage(message: CoachingMessage): string {
    switch (message.type) {
      case 'progress': {
        const { elapsed, steps, distance } = message.data;
        const minutes = Math.floor(elapsed / 60);
        const encouragement = this.getProgressEncouragement(minutes);
        
        // Format distance (assuming miles)
        const miles = (distance / 1609.34).toFixed(2);
        
        return `${encouragement} You've been walking for ${minutes} minutes. ${steps} steps so far, covering ${miles} miles. Keep it up!`;
      }

      case 'milestone': {
        return `Great job! ${message.data.milestone}`;
      }

      case 'encouragement': {
        return message.data.message;
      }

      case 'heartRate': {
        const { hr, zone } = message.data;
        const advice = this.getHeartRateAdvice(zone);
        return `Your heart rate is ${hr}. You're in the ${zone} zone. ${advice}`;
      }

      default:
        return 'Keep going!';
    }
  }

  /**
   * Get encouraging message based on elapsed time
   * @param minutes Minutes elapsed
   * @returns Encouragement phrase
   */
  private getProgressEncouragement(minutes: number): string {
    if (minutes < 5) {
      return 'Nice start!';
    } else if (minutes < 15) {
      return "You're doing great!";
    } else if (minutes < 30) {
      return 'Excellent progress!';
    } else if (minutes < 45) {
      return "Wow, you're really going!";
    } else {
      return 'Amazing endurance!';
    }
  }

  /**
   * Get heart rate advice based on zone
   * @param zone Heart rate zone
   * @returns Advice message
   */
  private getHeartRateAdvice(zone: string): string {
    switch (zone.toLowerCase()) {
      case 'resting':
        return 'Consider picking up the pace a bit.';
      case 'fat burn':
        return 'Perfect pace for fat burning!';
      case 'cardio':
        return 'Great cardio workout!';
      case 'peak':
        return 'Intense! Make sure to stay hydrated.';
      default:
        return 'Keep up the good work!';
    }
  }

  /**
   * Check if audio coach is currently speaking
   * @returns True if speaking
   */
  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get time until next announcement
   * @returns Seconds until next announcement, or null if no last announcement
   */
  getTimeUntilNextAnnouncement(): number | null {
    if (!this.lastAnnouncementTime) {
      return 0; // Ready to announce
    }

    const timeSinceLastAnnouncement = Date.now() - this.lastAnnouncementTime.getTime();
    const intervalMs = this.intervalSeconds * 1000;
    const timeRemaining = intervalMs - timeSinceLastAnnouncement;

    return Math.max(0, Math.floor(timeRemaining / 1000));
  }

  /**
   * Reset announcement timer
   */
  resetTimer(): void {
    this.lastAnnouncementTime = null;
    logger.info('Audio Coach: Timer reset');
  }
}

// Export singleton instance
export const audioCoach = new AudioCoach();

