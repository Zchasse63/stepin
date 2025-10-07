/**
 * Social Features Type Definitions
 * Phase 11: Non-Competitive Social Features
 * 
 * Types for buddy connections, activity feed, and kudos system
 */

// ============================================================================
// BUDDY TYPES
// ============================================================================

/**
 * Buddy relationship status
 */
export type BuddyStatus = 'pending' | 'accepted' | 'blocked';

/**
 * Buddy profile information (joined from profiles table)
 */
export interface BuddyProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
}

/**
 * Buddy relationship record
 */
export interface Buddy {
  id: string;
  user_id: string;
  buddy_id: string;
  status: BuddyStatus;
  created_at: string;
  updated_at: string;
  buddy_profile?: BuddyProfile;
}

/**
 * Buddy request data for creating new connections
 */
export interface BuddyRequest {
  buddy_email: string;
}

/**
 * Buddy with profile data (for display in UI)
 */
export interface BuddyWithProfile extends Buddy {
  buddy_profile: BuddyProfile;
}

// ============================================================================
// ACTIVITY FEED TYPES
// ============================================================================

/**
 * Activity types that can be shared
 */
export type ActivityType = 'walk_completed' | 'streak_milestone' | 'goal_achieved';

/**
 * Visibility settings for activities
 */
export type Visibility = 'private' | 'buddies' | 'public';

/**
 * Feeling emojis for walk completion
 */
export type FeelingEmoji = '😣' | '😐' | '🙂' | '😊' | '🤩';

/**
 * Feeling labels corresponding to emojis
 */
export type FeelingLabel = 'Tough' | 'OK' | 'Good' | 'Great' | 'Amazing';

/**
 * Feeling option for selector
 */
export interface FeelingOption {
  emoji: FeelingEmoji;
  label: FeelingLabel;
  value: string;
}

/**
 * Walk completion activity data
 */
export interface WalkCompletedData {
  feeling: FeelingEmoji;
  note?: string;
  duration_minutes: number;
  distance_meters?: number;
  date: string;
}

/**
 * Streak milestone activity data
 */
export interface StreakMilestoneData {
  streak_days: number;
  milestone_type: 'week' | 'month' | 'custom';
}

/**
 * Goal achieved activity data
 */
export interface GoalAchievedData {
  goal_type: 'daily' | 'weekly' | 'monthly';
  achievement_date: string;
}

/**
 * Union type for all activity data types
 */
export type ActivityData = WalkCompletedData | StreakMilestoneData | GoalAchievedData;

/**
 * User profile information for activity feed
 */
export interface ActivityUserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

/**
 * Activity feed item record
 */
export interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  activity_data: ActivityData;
  visibility: Visibility;
  created_at: string;
  user_profile?: ActivityUserProfile;
  kudos_count?: number;
  user_gave_kudos?: boolean;
}

/**
 * Activity feed item with all joined data (for display)
 */
export interface ActivityFeedItemWithDetails extends ActivityFeedItem {
  user_profile: ActivityUserProfile;
  kudos_count: number;
  user_gave_kudos: boolean;
}

/**
 * Data for creating a new activity
 */
export interface CreateActivityData {
  activity_type: ActivityType;
  activity_data: ActivityData;
  visibility: Visibility;
}

// ============================================================================
// KUDOS TYPES
// ============================================================================

/**
 * Kudos record
 */
export interface Kudos {
  id: string;
  activity_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Kudos count for an activity
 */
export interface KudosCount {
  activity_id: string;
  count: number;
}

// ============================================================================
// DATABASE INSERT/UPDATE TYPES
// ============================================================================

/**
 * Data for inserting a new buddy request
 */
export interface InsertBuddy {
  user_id: string;
  buddy_id: string;
  status: BuddyStatus;
}

/**
 * Data for updating a buddy status
 */
export interface UpdateBuddy {
  status: BuddyStatus;
  updated_at?: string;
}

/**
 * Data for inserting a new activity
 */
export interface InsertActivity {
  user_id: string;
  activity_type: ActivityType;
  activity_data: ActivityData;
  visibility: Visibility;
}

/**
 * Data for inserting kudos
 */
export interface InsertKudos {
  activity_id: string;
  user_id: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Social store state
 */
export interface SocialState {
  buddies: BuddyWithProfile[];
  pendingRequests: BuddyWithProfile[];
  activityFeed: ActivityFeedItemWithDetails[];
  loading: boolean;
  error: string | null;
}

/**
 * Feeling selector state
 */
export interface FeelingState {
  selected: FeelingEmoji | null;
  note: string;
  visibility: Visibility;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Available feeling options for walk completion
 */
export const FEELING_OPTIONS: FeelingOption[] = [
  { emoji: '😣', label: 'Tough', value: 'tough' },
  { emoji: '😐', label: 'OK', value: 'ok' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🤩', label: 'Amazing', value: 'amazing' },
];

/**
 * Visibility options
 */
export const VISIBILITY_OPTIONS = [
  { value: 'private' as Visibility, label: 'Private', icon: 'lock' },
  { value: 'buddies' as Visibility, label: 'Buddies', icon: 'users' },
  { value: 'public' as Visibility, label: 'Public', icon: 'globe' },
];

/**
 * Maximum note length for activity posts
 */
export const MAX_NOTE_LENGTH = 200;

