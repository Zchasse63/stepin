-- Phase 14: Buddy Discovery - Phone Contact Sync
-- Migration: Add phone_hash field for privacy-first contact matching
-- Date: 2025-01-09
-- Description: Enables opt-in contact sync with hashed phone numbers (SHA-256)

-- ============================================================================
-- 1. ADD PHONE_HASH FIELD TO PROFILES TABLE
-- ============================================================================

-- Add phone_hash field (stores SHA-256 hash of phone number)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_hash text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.phone_hash IS 'SHA-256 hash of user phone number for privacy-first contact matching (opt-in only)';

-- ============================================================================
-- 2. CREATE INDEX FOR FAST CONTACT MATCHING
-- ============================================================================

-- Index for matching contacts by phone hash
CREATE INDEX IF NOT EXISTS idx_profiles_phone_hash 
ON public.profiles (phone_hash)
WHERE phone_hash IS NOT NULL;

-- ============================================================================
-- 3. PRIVACY & SECURITY NOTES
-- ============================================================================

-- IMPORTANT PRIVACY CONSIDERATIONS:
-- 
-- 1. OPT-IN ONLY: Users must explicitly consent to contact sync
-- 2. HASHED DATA: Only SHA-256 hashes stored, never raw phone numbers
-- 3. USER CONTROL: Users can clear phone_hash at any time
-- 4. NO REVERSE LOOKUP: Hashes cannot be reversed to get phone numbers
-- 5. MINIMAL STORAGE: Only hash stored, no contact names or other data
--
-- Implementation requirements:
-- - Client must hash phone numbers before sending to server
-- - Client must normalize phone numbers (remove non-digits) before hashing
-- - Client must show clear privacy notice before requesting permission
-- - Client must provide "Skip" option for contact sync
-- - Client must allow users to disable contact sync in settings

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Check if phone_hash column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_hash'
  ) THEN
    RAISE EXCEPTION 'Migration failed: phone_hash column not created';
  END IF;
  
  -- Check if index exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_phone_hash'
  ) THEN
    RAISE EXCEPTION 'Migration failed: phone_hash index not created';
  END IF;
  
  RAISE NOTICE 'Phase 14 (Contact Sync) migration completed successfully';
  RAISE NOTICE 'Added column: phone_hash (SHA-256 hash)';
  RAISE NOTICE 'Created index: idx_profiles_phone_hash';
  RAISE NOTICE 'Privacy: Opt-in only, hashed data, user control';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

