-- Phase 13: Comprehensive Seed Support
-- Migration: Add fields required for comprehensive seed data
-- Date: 2025-10-09
-- Description: Adds missing fields to profiles and walks tables to support
--              the comprehensive seed script with realistic multi-user data

-- ============================================================================
-- PROFILES TABLE ADDITIONS
-- ============================================================================

-- Add onboarding completion flag
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed onboarding flow';

-- Add activity visibility preference
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS activity_visibility TEXT DEFAULT 'buddies' 
  CHECK (activity_visibility IN ('private', 'buddies', 'public'));

COMMENT ON COLUMN profiles.activity_visibility IS 'Default visibility for user activities: private (self only), buddies (buddies only), public (everyone)';

-- Add location city for display
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS location_city TEXT;

COMMENT ON COLUMN profiles.location_city IS 'User city for display purposes (e.g., "Tampa, FL")';

-- ============================================================================
-- WALKS TABLE ADDITIONS
-- ============================================================================

-- Add GPS route coordinates
ALTER TABLE walks
ADD COLUMN IF NOT EXISTS route_coordinates JSONB;

COMMENT ON COLUMN walks.route_coordinates IS 'Array of GPS points: [{lat, lng, timestamp, altitude}, ...]';

-- Add start and end locations
ALTER TABLE walks
ADD COLUMN IF NOT EXISTS start_location JSONB,
ADD COLUMN IF NOT EXISTS end_location JSONB;

COMMENT ON COLUMN walks.start_location IS 'Walk start location: {lat, lng}';
COMMENT ON COLUMN walks.end_location IS 'Walk end location: {lat, lng}';

-- Add elevation data
ALTER TABLE walks
ADD COLUMN IF NOT EXISTS elevation_gain NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS elevation_loss NUMERIC(10,2);

COMMENT ON COLUMN walks.elevation_gain IS 'Total elevation gained during walk (meters)';
COMMENT ON COLUMN walks.elevation_loss IS 'Total elevation lost during walk (meters)';

-- Add average pace
ALTER TABLE walks
ADD COLUMN IF NOT EXISTS average_pace NUMERIC(10,2);

COMMENT ON COLUMN walks.average_pace IS 'Average pace in minutes per mile/km';

-- Add heart rate zones breakdown
ALTER TABLE walks
ADD COLUMN IF NOT EXISTS heart_rate_zones JSONB;

COMMENT ON COLUMN walks.heart_rate_zones IS 'Heart rate zone breakdown: {zone1_seconds, zone2_seconds, zone3_seconds, zone4_seconds, zone5_seconds}';

-- Add weather conditions
ALTER TABLE walks
ADD COLUMN IF NOT EXISTS weather_conditions JSONB;

COMMENT ON COLUMN walks.weather_conditions IS 'Weather data at walk time: {temperature, feels_like, condition, description, humidity, wind_speed, icon}';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for querying walks with GPS data
CREATE INDEX IF NOT EXISTS idx_walks_route_coordinates 
ON walks USING GIN (route_coordinates) 
WHERE route_coordinates IS NOT NULL;

-- Index for querying walks with weather data
CREATE INDEX IF NOT EXISTS idx_walks_weather_conditions 
ON walks USING GIN (weather_conditions) 
WHERE weather_conditions IS NOT NULL;

-- Index for activity visibility queries
CREATE INDEX IF NOT EXISTS idx_profiles_activity_visibility 
ON profiles(activity_visibility);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_location_city 
ON profiles(location_city) 
WHERE location_city IS NOT NULL;

-- ============================================================================
-- MIGRATION VERIFICATION
-- ============================================================================

DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  -- Check profiles.onboarding_completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    missing_columns := array_append(missing_columns, 'profiles.onboarding_completed');
  END IF;

  -- Check profiles.activity_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'activity_visibility'
  ) THEN
    missing_columns := array_append(missing_columns, 'profiles.activity_visibility');
  END IF;

  -- Check profiles.location_city
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'location_city'
  ) THEN
    missing_columns := array_append(missing_columns, 'profiles.location_city');
  END IF;

  -- Check walks.route_coordinates
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'route_coordinates'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.route_coordinates');
  END IF;

  -- Check walks.start_location
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'start_location'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.start_location');
  END IF;

  -- Check walks.end_location
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'end_location'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.end_location');
  END IF;

  -- Check walks.elevation_gain
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'elevation_gain'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.elevation_gain');
  END IF;

  -- Check walks.elevation_loss
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'elevation_loss'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.elevation_loss');
  END IF;

  -- Check walks.average_pace
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'average_pace'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.average_pace');
  END IF;

  -- Check walks.heart_rate_zones
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'heart_rate_zones'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.heart_rate_zones');
  END IF;

  -- Check walks.weather_conditions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'weather_conditions'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.weather_conditions');
  END IF;

  -- Raise error if any columns are missing
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration failed: Missing columns: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'Phase 13 migration completed successfully!';
    RAISE NOTICE 'Added 3 columns to profiles table';
    RAISE NOTICE 'Added 8 columns to walks table';
    RAISE NOTICE 'Created 4 performance indexes';
    RAISE NOTICE 'Database ready for comprehensive seed data';
  END IF;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

