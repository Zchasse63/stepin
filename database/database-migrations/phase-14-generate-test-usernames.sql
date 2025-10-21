-- Phase 14: Buddy Discovery - Generate Test Usernames
-- Migration: Generate unique usernames for existing 5 test users
-- Date: 2025-01-09
-- Description: Assigns memorable usernames to test users for buddy discovery testing

-- ============================================================================
-- GENERATE USERNAMES FOR EXISTING TEST USERS
-- ============================================================================

-- Update test users with memorable, unique usernames
-- These match the test user personas from the comprehensive seed script

-- User 1: Sarah Johnson (Beginner, 62yo)
UPDATE public.profiles 
SET username = 'sarah_walker'
WHERE id = '11111111-1111-1111-1111-111111111111'
AND username IS NULL;

-- User 2: Mike Chen (Active, 45yo)
UPDATE public.profiles 
SET username = 'mike_active'
WHERE id = '22222222-2222-2222-2222-222222222222'
AND username IS NULL;

-- User 3: Emma Rodriguez (Recovery, 38yo)
UPDATE public.profiles 
SET username = 'emma_recovery'
WHERE id = '33333333-3333-3333-3333-333333333333'
AND username IS NULL;

-- User 4: James Williams (Elderly, 71yo)
UPDATE public.profiles 
SET username = 'james_senior'
WHERE id = '44444444-4444-4444-4444-444444444444'
AND username IS NULL;

-- User 5: Lisa Thompson (Busy Professional, 29yo)
UPDATE public.profiles 
SET username = 'lisa_busy'
WHERE id = '55555555-5555-5555-5555-555555555555'
AND username IS NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  username_count INTEGER;
BEGIN
  -- Count how many test users have usernames
  SELECT COUNT(*) INTO username_count
  FROM public.profiles
  WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555'
  )
  AND username IS NOT NULL;
  
  -- Verify all 5 users have usernames
  IF username_count != 5 THEN
    RAISE EXCEPTION 'Migration failed: Expected 5 users with usernames, found %', username_count;
  END IF;
  
  RAISE NOTICE 'Phase 14 (Test Usernames) migration completed successfully';
  RAISE NOTICE 'Generated usernames for 5 test users:';
  RAISE NOTICE '  - sarah_walker (Sarah Johnson)';
  RAISE NOTICE '  - mike_active (Mike Chen)';
  RAISE NOTICE '  - emma_recovery (Emma Rodriguez)';
  RAISE NOTICE '  - james_senior (James Williams)';
  RAISE NOTICE '  - lisa_busy (Lisa Thompson)';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now test username search with these usernames!';
END $$;

-- ============================================================================
-- DISPLAY TEST USERNAMES
-- ============================================================================

-- Show all test users with their new usernames
SELECT 
  display_name,
  username,
  email,
  location_city
FROM public.profiles
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
)
ORDER BY display_name;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

