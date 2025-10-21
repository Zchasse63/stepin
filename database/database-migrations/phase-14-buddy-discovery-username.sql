-- Phase 14: Buddy Discovery - Username Fields
-- Migration: Add username and username_lowercase fields to profiles table
-- Date: 2025-01-09
-- Description: Enables username-based search for buddy discovery

-- ============================================================================
-- 1. ADD USERNAME FIELDS TO PROFILES TABLE
-- ============================================================================

-- Add username field (unique, required for search)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS username_lowercase text;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.username IS 'Unique username for buddy search and discovery';
COMMENT ON COLUMN public.profiles.username_lowercase IS 'Lowercase version of username for case-insensitive search (auto-generated)';

-- ============================================================================
-- 2. CREATE INDEX FOR FAST SEARCHING
-- ============================================================================

-- Index for case-insensitive username search
CREATE INDEX IF NOT EXISTS idx_profiles_username_search 
ON public.profiles (username_lowercase);

-- Index for exact username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles (username);

-- ============================================================================
-- 3. CREATE TRIGGER FUNCTION TO AUTO-UPDATE LOWERCASE USERNAME
-- ============================================================================

-- Function to automatically update username_lowercase when username changes
CREATE OR REPLACE FUNCTION update_username_lowercase()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if username is not null
  IF NEW.username IS NOT NULL THEN
    NEW.username_lowercase := LOWER(NEW.username);
  ELSE
    NEW.username_lowercase := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call function on insert or update
DROP TRIGGER IF EXISTS trigger_update_username_lowercase ON public.profiles;
CREATE TRIGGER trigger_update_username_lowercase
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_username_lowercase();

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Check if username column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    RAISE EXCEPTION 'Migration failed: username column not created';
  END IF;
  
  -- Check if username_lowercase column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username_lowercase'
  ) THEN
    RAISE EXCEPTION 'Migration failed: username_lowercase column not created';
  END IF;
  
  -- Check if trigger exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_username_lowercase'
  ) THEN
    RAISE EXCEPTION 'Migration failed: trigger not created';
  END IF;
  
  RAISE NOTICE 'Phase 14 (Username) migration completed successfully';
  RAISE NOTICE 'Added columns: username, username_lowercase';
  RAISE NOTICE 'Created indexes: idx_profiles_username_search, idx_profiles_username';
  RAISE NOTICE 'Created trigger: trigger_update_username_lowercase';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

