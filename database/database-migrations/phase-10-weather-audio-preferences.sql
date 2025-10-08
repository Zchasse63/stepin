-- Phase 10: Weather Integration & Audio Coaching
-- Migration: Add weather and audio coaching preferences to profiles table
-- Date: 2025-01-06

-- Add weather preferences columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS weather_alerts_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_walk_time TEXT DEFAULT 'morning' CHECK (preferred_walk_time IN ('morning', 'afternoon', 'evening')),
ADD COLUMN IF NOT EXISTS location_coordinates JSONB DEFAULT NULL;

-- Add audio coaching preferences columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS audio_coaching_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audio_coaching_interval INTEGER DEFAULT 300 CHECK (audio_coaching_interval >= 180 AND audio_coaching_interval <= 600);

-- Add comments for documentation
COMMENT ON COLUMN profiles.weather_alerts_enabled IS 'Enable proactive weather notifications before walks';
COMMENT ON COLUMN profiles.preferred_walk_time IS 'Preferred time of day for walks: morning (8am), afternoon (2pm), or evening (6pm)';
COMMENT ON COLUMN profiles.location_coordinates IS 'User location for weather data: {lat: number, lng: number}';
COMMENT ON COLUMN profiles.audio_coaching_enabled IS 'Enable voice announcements during walks';
COMMENT ON COLUMN profiles.audio_coaching_interval IS 'Interval between audio announcements in seconds (180-600, default 300)';

-- Create index on location_coordinates for faster weather queries
CREATE INDEX IF NOT EXISTS idx_profiles_location_coordinates ON profiles USING GIN (location_coordinates);

-- Verify migration
DO $$
BEGIN
  -- Check if all columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name IN ('weather_alerts_enabled', 'preferred_walk_time', 'location_coordinates', 'audio_coaching_enabled', 'audio_coaching_interval')
    GROUP BY table_name
    HAVING COUNT(*) = 5
  ) THEN
    RAISE EXCEPTION 'Migration failed: Not all columns were created';
  END IF;
  
  RAISE NOTICE 'Phase 10 migration completed successfully';
END $$;

