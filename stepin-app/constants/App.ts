/**
 * Application Constants
 * Centralized configuration values used throughout the app
 */

/**
 * Step Goals and Thresholds
 */
export const StepGoals = {
  DEFAULT_DAILY_GOAL: 7000,
  HIGH_DAILY_GOAL: 10000,
  EXCEPTIONAL_THRESHOLD: 10000,
} as const;

/**
 * Time Constants (in milliseconds)
 */
export const Time = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * Timeout Constants (in milliseconds)
 */
export const Timeouts = {
  GPS_LOCATION_MAX_AGE: 5 * 1000, // 5 seconds
  WEATHER_API: 10 * 1000, // 10 seconds
  HEALTH_SYNC: 5 * 1000, // 5 seconds
  LIVE_ACTIVITY_UPDATE: 15 * 1000, // 15 seconds
  SESSION_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Step Milestones for achievements
 */
export const StepMilestones = {
  BRONZE: 100_000,
  SILVER: 250_000,
  GOLD: 500_000,
  PLATINUM: 1_000_000,
  MILESTONE_THRESHOLD: 10_000, // Within 10k of milestone
} as const;

/**
 * Walk Estimation Constants
 */
export const WalkEstimates = {
  STEPS_PER_MINUTE: 100, // Average walking pace
  METERS_PER_STEP: 0.762, // Average step length
  METERS_PER_MILE: 1609.34,
} as const;

/**
 * Cache Configuration
 */
export const Cache = {
  ROUTE_ANALYTICS_MAX_SIZE: 100,
  ROUTE_ANALYTICS_MAX_AGE: 30 * 60 * 1000, // 30 minutes
} as const;
