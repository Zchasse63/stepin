// Profile and Settings Types for Phase 4

export type UnitsPreference = 'miles' | 'kilometers';

export type ThemePreference = 'light' | 'dark' | 'system';

export type NotificationType = 'dailyReminder' | 'streakReminder' | 'goalCelebration';

export type PreferredWalkTime = 'morning' | 'afternoon' | 'evening';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  streakReminder: boolean;
  goalCelebration: boolean;
  reminderTime: string; // Format: "HH:mm" (e.g., "09:00")
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  daily_step_goal: number;
  units_preference: UnitsPreference;
  theme_preference: ThemePreference;
  notification_settings: NotificationSettings;
  // Phase 10: Weather preferences
  weather_alerts_enabled: boolean;
  preferred_walk_time: PreferredWalkTime;
  location_coordinates: LocationCoordinates | null;
  // Phase 10: Audio coaching preferences
  audio_coaching_enabled: boolean;
  audio_coaching_interval: number; // seconds (180-600)
  // Phase 12: Auto-detection preference
  auto_detect_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  totalSteps: number;
  totalWalks: number;
  memberSince: string;
  currentStreak: number;
}

export interface ProfileUpdateData {
  display_name?: string;
  avatar_url?: string;
  daily_step_goal?: number;
  units_preference?: UnitsPreference;
  theme_preference?: ThemePreference;
  notification_settings?: NotificationSettings;
  weather_alerts_enabled?: boolean;
  preferred_walk_time?: PreferredWalkTime;
  location_coordinates?: LocationCoordinates | null;
  audio_coaching_enabled?: boolean;
  audio_coaching_interval?: number;
  auto_detect_enabled?: boolean;
}

// Notification identifiers for scheduling
export interface NotificationIdentifiers {
  dailyReminder: string | null;
  streakReminder: string | null;
  goalCelebration: string | null;
}

