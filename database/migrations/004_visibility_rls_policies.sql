-- Migration: Update RLS Policies for Activity Visibility
-- Phase 3: Privacy Features
-- This enforces visibility controls through Row Level Security

-- ============================================================================
-- DROP EXISTING WALKS POLICIES
-- ============================================================================

-- Drop existing policies to recreate them with visibility rules
drop policy if exists "Users can view own walks" on public.walks;
drop policy if exists "Buddies can view public walks" on public.walks;

-- ============================================================================
-- CREATE NEW WALKS SELECT POLICIES WITH VISIBILITY
-- ============================================================================

-- Policy 1: Users can always view their own walks
create policy "Users can view own walks"
  on public.walks for select
  using (auth.uid() = user_id);

-- Policy 2: Public walks are visible to everyone
create policy "Public walks are visible to everyone"
  on public.walks for select
  using (
    -- Walk is explicitly set to public
    (visibility = 'public')
    or
    -- Walk inherits from profile and profile is public
    (visibility = 'inherit' and exists (
      select 1 from public.profiles
      where profiles.id = walks.user_id
      and profiles.activity_visibility = 'public'
    ))
  );

-- Policy 3: Buddies-only walks are visible to buddies
create policy "Buddies can view buddy walks"
  on public.walks for select
  using (
    -- Check if walk is set to buddies or inherits buddies visibility
    (
      (visibility = 'buddies')
      or
      (visibility = 'inherit' and exists (
        select 1 from public.profiles
        where profiles.id = walks.user_id
        and profiles.activity_visibility = 'buddies'
      ))
    )
    and
    -- Check if current user is a buddy of the walk owner
    (
      exists (
        select 1 from public.buddy_relationships
        where (
          (user_id = walks.user_id and buddy_id = auth.uid())
          or
          (buddy_id = walks.user_id and user_id = auth.uid())
        )
        and status = 'accepted'
      )
    )
  );

-- ============================================================================
-- HELPER FUNCTION: Check if user can view walk
-- ============================================================================

-- This function can be used in application code to check visibility
create or replace function can_view_walk(walk_id uuid, viewer_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  walk_record record;
  owner_visibility text;
  is_buddy boolean;
begin
  -- Get walk details
  select * into walk_record from public.walks where id = walk_id;

  if not found then
    return false;
  end if;

  -- Owner can always view their own walks
  if walk_record.user_id = viewer_id then
    return true;
  end if;

  -- Get owner's default visibility if walk uses 'inherit'
  if walk_record.visibility = 'inherit' then
    select activity_visibility into owner_visibility
    from public.profiles
    where id = walk_record.user_id;
  else
    owner_visibility := walk_record.visibility;
  end if;

  -- Public walks are visible to everyone
  if owner_visibility = 'public' then
    return true;
  end if;

  -- Private walks only visible to owner
  if owner_visibility = 'private' then
    return false;
  end if;

  -- For buddies-only, check buddy relationship
  if owner_visibility = 'buddies' then
    select exists(
      select 1 from public.buddy_relationships
      where (
        (user_id = walk_record.user_id and buddy_id = viewer_id)
        or
        (buddy_id = walk_record.user_id and user_id = viewer_id)
      )
      and status = 'accepted'
    ) into is_buddy;

    return is_buddy;
  end if;

  return false;
end;
$$;

-- ============================================================================
-- UPDATE ACTIVITY FEED POLICIES (if table exists)
-- ============================================================================

-- Note: If you have an activity_feed table, update its policies similarly

-- Example for activity feed:
-- drop policy if exists "Users can view public activities" on public.activity_feed;
--
-- create policy "Activity feed respects visibility"
--   on public.activity_feed for select
--   using (
--     -- User is viewing their own activity
--     (auth.uid() = user_id)
--     or
--     -- Activity is public
--     (visibility = 'public' or (visibility = 'inherit' and exists (
--       select 1 from public.profiles
--       where profiles.id = activity_feed.user_id
--       and profiles.activity_visibility = 'public'
--     )))
--     or
--     -- Activity is buddies-only and viewer is a buddy
--     (
--       (visibility = 'buddies' or (visibility = 'inherit' and exists (
--         select 1 from public.profiles
--         where profiles.id = activity_feed.user_id
--         and profiles.activity_visibility = 'buddies'
--       )))
--       and exists (
--         select 1 from public.buddy_relationships
--         where (
--           (user_id = activity_feed.user_id and buddy_id = auth.uid())
--           or
--           (buddy_id = activity_feed.user_id and user_id = auth.uid())
--         )
--         and status = 'accepted'
--       )
--     )
--   );

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================

grant execute on function can_view_walk(uuid, uuid) to authenticated;

-- ============================================================================
-- USAGE NOTES
-- ============================================================================

-- To check if a user can view a walk in your application:
-- SELECT can_view_walk('walk-uuid', 'viewer-uuid');

-- The RLS policies will automatically enforce visibility rules for all queries

-- To test visibility:
-- 1. Set user's activity_visibility: UPDATE profiles SET activity_visibility = 'private' WHERE id = 'user-uuid';
-- 2. Query walks as different user: SELECT * FROM walks WHERE user_id = 'other-user-uuid';
-- 3. Should only see walks based on visibility settings and buddy relationship
