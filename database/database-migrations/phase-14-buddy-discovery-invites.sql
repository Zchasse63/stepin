-- Phase 14: Buddy Discovery - Invite Links
-- Migration: Create invite_links table for shareable invite links
-- Date: 2025-01-09
-- Description: Enables users to invite friends via shareable links

-- ============================================================================
-- 1. CREATE INVITE_LINKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invite_links (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  inviter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  expires_at timestamptz,
  used_by_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE public.invite_links IS 'Shareable invite links for buddy discovery';
COMMENT ON COLUMN public.invite_links.inviter_id IS 'User who created the invite link';
COMMENT ON COLUMN public.invite_links.invite_code IS 'Unique 8-character invite code';
COMMENT ON COLUMN public.invite_links.expires_at IS 'When the invite link expires (typically 30 days)';
COMMENT ON COLUMN public.invite_links.used_by_id IS 'User who used this invite (null if unused)';
COMMENT ON COLUMN public.invite_links.used_at IS 'When the invite was used';

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for looking up invite codes (most common query)
CREATE INDEX IF NOT EXISTS idx_invite_links_code 
ON public.invite_links (invite_code);

-- Index for finding user's invites
CREATE INDEX IF NOT EXISTS idx_invite_links_inviter 
ON public.invite_links (inviter_id);

-- Index for finding unused invites
CREATE INDEX IF NOT EXISTS idx_invite_links_unused 
ON public.invite_links (used_by_id) 
WHERE used_by_id IS NULL;

-- ============================================================================
-- 3. CREATE HELPER FUNCTION TO GENERATE INVITE CODES
-- ============================================================================

-- Function to generate random 8-character invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
BEGIN
  RETURN LOWER(
    SUBSTRING(
      MD5(RANDOM()::text || CLOCK_TIMESTAMP()::text) 
      FROM 1 FOR 8
    )
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_invite_code() IS 'Generates a random 8-character lowercase invite code';

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================

-- Policy: Users can view their own invites
DROP POLICY IF EXISTS "Users can view own invites" ON public.invite_links;
CREATE POLICY "Users can view own invites"
  ON public.invite_links FOR SELECT
  USING (auth.uid() = inviter_id);

-- Policy: Users can create invite links
DROP POLICY IF EXISTS "Users can create invites" ON public.invite_links;
CREATE POLICY "Users can create invites"
  ON public.invite_links FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- Policy: Anyone can view invite by code (for validation during signup)
-- This is needed so new users can validate invite codes before creating account
DROP POLICY IF EXISTS "Anyone can view invite by code" ON public.invite_links;
CREATE POLICY "Anyone can view invite by code"
  ON public.invite_links FOR SELECT
  USING (true);

-- Policy: System can update invite when used (via service role)
DROP POLICY IF EXISTS "System can update used invites" ON public.invite_links;
CREATE POLICY "System can update used invites"
  ON public.invite_links FOR UPDATE
  USING (true);

-- ============================================================================
-- 6. VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'invite_links'
  ) THEN
    RAISE EXCEPTION 'Migration failed: invite_links table not created';
  END IF;
  
  -- Check if RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'invite_links'
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Migration failed: RLS not enabled on invite_links';
  END IF;
  
  -- Check if function exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_invite_code'
  ) THEN
    RAISE EXCEPTION 'Migration failed: generate_invite_code function not created';
  END IF;
  
  RAISE NOTICE 'Phase 14 (Invite Links) migration completed successfully';
  RAISE NOTICE 'Created table: invite_links';
  RAISE NOTICE 'Created indexes: 3 performance indexes';
  RAISE NOTICE 'Created function: generate_invite_code()';
  RAISE NOTICE 'Created policies: 4 RLS policies';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

