-- Phase 12: Advanced Features - Database Migration
-- Auto-Detection & Heart Rate Zones
-- Created: 2025-01-XX

-- ============================================================================
-- 1. Add auto_detect_enabled to profiles table
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS auto_detect_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN profiles.auto_detect_enabled IS 'Enable/disable workout auto-detection feature';

-- ============================================================================
-- 2. Add auto_detected flag to walks table
-- ============================================================================

ALTER TABLE walks
ADD COLUMN IF NOT EXISTS auto_detected BOOLEAN DEFAULT false;

COMMENT ON COLUMN walks.auto_detected IS 'Whether this walk was started via auto-detection';

-- ============================================================================
-- 3. Add heart rate fields to walks table
-- ============================================================================

ALTER TABLE walks
ADD COLUMN IF NOT EXISTS average_heart_rate INTEGER,
ADD COLUMN IF NOT EXISTS max_heart_rate INTEGER;

COMMENT ON COLUMN walks.average_heart_rate IS 'Average heart rate during walk (BPM)';
COMMENT ON COLUMN walks.max_heart_rate IS 'Maximum heart rate during walk (BPM)';

-- Add constraints to ensure valid heart rate values
ALTER TABLE walks
ADD CONSTRAINT walks_average_heart_rate_check 
  CHECK (average_heart_rate IS NULL OR (average_heart_rate >= 30 AND average_heart_rate <= 250));

ALTER TABLE walks
ADD CONSTRAINT walks_max_heart_rate_check 
  CHECK (max_heart_rate IS NULL OR (max_heart_rate >= 30 AND max_heart_rate <= 250));

-- ============================================================================
-- 4. Create indexes for performance
-- ============================================================================

-- Index for querying auto-detected walks
CREATE INDEX IF NOT EXISTS idx_walks_auto_detected 
ON walks(user_id, auto_detected) 
WHERE auto_detected = true;

-- Index for querying walks with heart rate data
CREATE INDEX IF NOT EXISTS idx_walks_heart_rate 
ON walks(user_id, average_heart_rate) 
WHERE average_heart_rate IS NOT NULL;

-- ============================================================================
-- 5. Update RLS policies (if needed)
-- ============================================================================

-- The existing RLS policies on walks and profiles tables should already cover
-- the new columns, but we'll verify they're in place:

-- Verify profiles RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- Verify walks RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'walks' 
    AND policyname = 'Users can view own walks'
  ) THEN
    CREATE POLICY "Users can view own walks"
      ON walks FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'walks' 
    AND policyname = 'Users can insert own walks'
  ) THEN
    CREATE POLICY "Users can insert own walks"
      ON walks FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'walks' 
    AND policyname = 'Users can update own walks'
  ) THEN
    CREATE POLICY "Users can update own walks"
      ON walks FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'walks' 
    AND policyname = 'Users can delete own walks'
  ) THEN
    CREATE POLICY "Users can delete own walks"
      ON walks FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- 6. Migration verification
-- ============================================================================

-- Verify all columns were added successfully
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  -- Check profiles.auto_detect_enabled
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'auto_detect_enabled'
  ) THEN
    missing_columns := array_append(missing_columns, 'profiles.auto_detect_enabled');
  END IF;

  -- Check walks.auto_detected
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'auto_detected'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.auto_detected');
  END IF;

  -- Check walks.average_heart_rate
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'average_heart_rate'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.average_heart_rate');
  END IF;

  -- Check walks.max_heart_rate
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'walks' AND column_name = 'max_heart_rate'
  ) THEN
    missing_columns := array_append(missing_columns, 'walks.max_heart_rate');
  END IF;

  -- Raise error if any columns are missing
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration failed: Missing columns: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'Phase 12 migration completed successfully!';
  END IF;
END $$;

