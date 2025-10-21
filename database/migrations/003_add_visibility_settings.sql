-- Migration: Add Activity Visibility Settings
-- Phase 3: Privacy Features
-- This adds visibility controls for user activities

-- ============================================================================
-- ADD VISIBILITY COLUMN TO PROFILES
-- ============================================================================

-- Add activity_visibility column to profiles table
-- Default to 'buddies' for privacy and social engagement balance
alter table public.profiles
  add column if not exists activity_visibility text
  default 'buddies'
  check (activity_visibility in ('private', 'buddies', 'public'));

-- Add comment for documentation
comment on column public.profiles.activity_visibility is
  'Controls who can see user activities: private (only user), buddies (buddies only), public (everyone)';

-- ============================================================================
-- ADD VISIBILITY COLUMN TO WALKS
-- ============================================================================

-- Add visibility column to walks table (can override default per-walk)
alter table public.walks
  add column if not exists visibility text
  default 'inherit'
  check (visibility in ('inherit', 'private', 'buddies', 'public'));

-- Add comment for documentation
comment on column public.walks.visibility is
  'Visibility for this specific walk. "inherit" uses profile default setting.';

-- ============================================================================
-- ADD VISIBILITY COLUMN TO ACTIVITY FEED (if exists)
-- ============================================================================

-- Note: If you have an activity_feed table, add visibility there too
-- alter table public.activity_feed
--   add column if not exists visibility text
--   default 'inherit'
--   check (visibility in ('inherit', 'private', 'buddies', 'public'));

-- ============================================================================
-- UPDATE EXISTING DATA
-- ============================================================================

-- Set default visibility for existing profiles
update public.profiles
  set activity_visibility = 'buddies'
  where activity_visibility is null;

-- Set default visibility for existing walks
update public.walks
  set visibility = 'inherit'
  where visibility is null;

-- ============================================================================
-- USAGE NOTES
-- ============================================================================

-- To update user's default visibility:
-- UPDATE profiles SET activity_visibility = 'private' WHERE id = 'user-uuid';

-- To override visibility for a specific walk:
-- UPDATE walks SET visibility = 'public' WHERE id = 'walk-uuid';

-- The RLS policies will be updated in a separate migration to enforce visibility rules
