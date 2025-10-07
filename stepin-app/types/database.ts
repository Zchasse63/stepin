/**
 * Database types for Stepin
 * Matching the Supabase schema
 */

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  daily_step_goal: number;
  created_at: string;
  updated_at: string;
}

/**
 * GPS coordinate with timestamp and optional metadata
 */
export interface GeoCoordinate {
  lat: number;
  lng: number;
  timestamp: string; // ISO 8601 format
  altitude?: number; // meters
  accuracy?: number; // meters
  speed?: number; // meters per second
}

/**
 * Geographic location with optional address
 */
export interface Location {
  lat: number;
  lng: number;
  address?: string; // reverse geocoded address
}

/**
 * Weather conditions snapshot
 */
export interface WeatherConditions {
  temperature: number; // Fahrenheit
  feels_like: number;
  condition: string; // 'clear', 'rain', 'clouds', 'snow', etc.
  description: string; // human-readable description
  humidity: number; // percentage
  wind_speed: number; // mph
  icon: string; // OpenWeather icon code
}

export interface Walk {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  duration_minutes?: number;
  distance_meters?: number;

  // GPS route tracking fields (Phase 8)
  route_coordinates?: GeoCoordinate[];
  start_location?: Location;
  end_location?: Location;
  elevation_gain?: number;
  elevation_loss?: number;
  average_pace?: number; // minutes per mile/km
  weather_conditions?: WeatherConditions;

  // Phase 12: Auto-detection & Heart Rate
  auto_detected?: boolean;
  average_heart_rate?: number; // BPM
  max_heart_rate?: number; // BPM

  created_at: string;
  updated_at?: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  total_steps: number;
  goal_met: boolean;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Phase 11: Social Features Database Types
 */

/**
 * Buddy relationship status
 */
export type BuddyStatus = 'pending' | 'accepted' | 'blocked';

/**
 * Buddy connection record
 */
export interface Buddy {
  id: string;
  user_id: string;
  buddy_id: string;
  status: BuddyStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Activity type for social feed
 */
export type ActivityType = 'walk_completed' | 'streak_milestone' | 'goal_achieved';

/**
 * Visibility setting for activities
 */
export type Visibility = 'private' | 'buddies' | 'public';

/**
 * Activity feed record
 */
export interface ActivityFeed {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  activity_data: any; // JSONB - structure depends on activity_type
  visibility: Visibility;
  created_at: string;
}

/**
 * Kudos (positive reaction) record
 */
export interface KudosRecord {
  id: string;
  activity_id: string;
  user_id: string;
  created_at: string;
}

// Database table names
export type TableName = 'profiles' | 'walks' | 'daily_stats' | 'streaks' | 'buddies' | 'activity_feed' | 'kudos';

// Database insert types (without auto-generated fields)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type WalkInsert = Omit<Walk, 'id' | 'created_at'>;
export type DailyStatsInsert = Omit<DailyStats, 'id' | 'created_at'>;
export type StreakInsert = Omit<Streak, 'id' | 'created_at' | 'updated_at'>;
export type BuddyInsert = Omit<Buddy, 'id' | 'created_at' | 'updated_at'>;
export type ActivityFeedInsert = Omit<ActivityFeed, 'id' | 'created_at'>;
export type KudosInsert = Omit<KudosRecord, 'id' | 'created_at'>;

// Database update types (all fields optional except id)
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>> & { id: string };
export type WalkUpdate = Partial<Omit<Walk, 'id' | 'created_at'>> & { id: string };
export type DailyStatsUpdate = Partial<Omit<DailyStats, 'id' | 'created_at'>> & { id: string };
export type StreakUpdate = Partial<Omit<Streak, 'id' | 'created_at' | 'updated_at'>> & { id: string };
export type BuddyUpdate = Partial<Omit<Buddy, 'id' | 'created_at' | 'updated_at'>> & { id: string };
export type ActivityFeedUpdate = Partial<Omit<ActivityFeed, 'id' | 'created_at'>> & { id: string };

