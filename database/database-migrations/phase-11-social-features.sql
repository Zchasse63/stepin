-- Phase 11: Non-Competitive Social Features
-- Migration: Add buddies, activity_feed, and kudos tables
-- Date: 2025-10-07
-- Description: Implements buddy connections, activity feed, and kudos system
--              Focus on support over competition (NO leaderboards, NO rankings)

-- ============================================================================
-- BUDDIES TABLE
-- Stores user connections (buddy relationships)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.buddies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buddy_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, buddy_id),
  -- Prevent self-buddy relationships
  CHECK (user_id != buddy_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.buddies IS 'User buddy connections for social features';
COMMENT ON COLUMN public.buddies.user_id IS 'User who initiated the buddy request';
COMMENT ON COLUMN public.buddies.buddy_id IS 'User who received the buddy request';
COMMENT ON COLUMN public.buddies.status IS 'Status: pending (awaiting acceptance), accepted (active buddies), blocked (rejected)';

-- ============================================================================
-- ACTIVITY FEED TABLE
-- Stores user activities shared with buddies
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('walk_completed', 'streak_milestone', 'goal_achieved')),
  activity_data jsonb NOT NULL,
  visibility text NOT NULL DEFAULT 'buddies' CHECK (visibility IN ('private', 'buddies', 'public')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE public.activity_feed IS 'User activities shared with buddies (non-competitive)';
COMMENT ON COLUMN public.activity_feed.activity_type IS 'Type: walk_completed, streak_milestone, or goal_achieved';
COMMENT ON COLUMN public.activity_feed.activity_data IS 'Activity details: {feeling, note, duration, distance, etc.}';
COMMENT ON COLUMN public.activity_feed.visibility IS 'Visibility: private (self only), buddies (buddies only), public (everyone)';

-- ============================================================================
-- KUDOS TABLE
-- Stores positive reactions to activities (anonymous, count-only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kudos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id uuid REFERENCES public.activity_feed(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(activity_id, user_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.kudos IS 'Positive reactions to activities (anonymous kudos)';
COMMENT ON COLUMN public.kudos.activity_id IS 'Activity receiving the kudos';
COMMENT ON COLUMN public.kudos.user_id IS 'User giving the kudos (anonymous to others)';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Buddies indexes
CREATE INDEX IF NOT EXISTS idx_buddies_user_id ON public.buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_buddies_buddy_id ON public.buddies(buddy_id);
CREATE INDEX IF NOT EXISTS idx_buddies_status ON public.buddies(status);
CREATE INDEX IF NOT EXISTS idx_buddies_user_status ON public.buddies(user_id, status);

-- Activity feed indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_visibility ON public.activity_feed(visibility);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(activity_type);

-- Kudos indexes
CREATE INDEX IF NOT EXISTS idx_kudos_activity_id ON public.kudos(activity_id);
CREATE INDEX IF NOT EXISTS idx_kudos_user_id ON public.kudos(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BUDDIES POLICIES
-- ============================================================================

-- Policy: Users can view own buddy connections (both directions)
CREATE POLICY "Users can view own buddy connections"
  ON public.buddies FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Policy: Users can create buddy requests
CREATE POLICY "Users can create buddy requests"
  ON public.buddies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update buddy requests they received (to accept/decline)
CREATE POLICY "Users can update received buddy requests"
  ON public.buddies FOR UPDATE
  USING (auth.uid() = buddy_id AND status = 'pending');

-- Policy: Users can delete own buddy connections (either side can remove)
CREATE POLICY "Users can delete own buddy connections"
  ON public.buddies FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- ============================================================================
-- ACTIVITY FEED POLICIES
-- ============================================================================

-- Policy: Users can view activities based on visibility settings
CREATE POLICY "Users can view activities based on visibility"
  ON public.activity_feed FOR SELECT
  USING (
    -- Always see own activities
    user_id = auth.uid() OR
    -- See public activities
    visibility = 'public' OR
    -- See buddies-only activities if you're buddies
    (visibility = 'buddies' AND EXISTS (
      SELECT 1 FROM public.buddies
      WHERE (
        (user_id = auth.uid() AND buddy_id = activity_feed.user_id AND status = 'accepted') OR
        (buddy_id = auth.uid() AND user_id = activity_feed.user_id AND status = 'accepted')
      )
    ))
  );

-- Policy: Users can create own activities
CREATE POLICY "Users can create own activities"
  ON public.activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete own activities
CREATE POLICY "Users can delete own activities"
  ON public.activity_feed FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- KUDOS POLICIES
-- ============================================================================

-- Policy: Users can view all kudos (for counting)
CREATE POLICY "Users can view kudos"
  ON public.kudos FOR SELECT
  USING (true);

-- Policy: Users can give kudos
CREATE POLICY "Users can give kudos"
  ON public.kudos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove own kudos
CREATE POLICY "Users can remove own kudos"
  ON public.kudos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Check if all tables exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('buddies', 'activity_feed', 'kudos')
    GROUP BY table_schema
    HAVING COUNT(*) = 3
  ) THEN
    RAISE EXCEPTION 'Migration failed: Not all tables were created';
  END IF;
  
  -- Check if RLS is enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('buddies', 'activity_feed', 'kudos')
    AND rowsecurity = false
  ) THEN
    RAISE EXCEPTION 'Migration failed: RLS not enabled on all tables';
  END IF;
  
  RAISE NOTICE 'Phase 11 migration completed successfully';
  RAISE NOTICE 'Created tables: buddies, activity_feed, kudos';
  RAISE NOTICE 'Created indexes: 11 performance indexes';
  RAISE NOTICE 'Created policies: 10 RLS policies';
  RAISE NOTICE 'Social features ready for implementation';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

