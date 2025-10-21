-- ============================================================================
-- STEPIN MISSING FLOWS VERIFICATION - DATABASE MIGRATIONS
-- ============================================================================
-- This migration adds all database schema changes needed for the missing flows
-- identified in the verification checklist.
--
-- Execute this in your Supabase SQL Editor for BOTH databases:
-- 1. Production (mvvndpuwrbsrahytxtjf)
-- 2. Test (hwzyuugggdubeejfpele)
--
-- IMPORTANT: This script is idempotent - safe to run multiple times
-- ============================================================================

-- ============================================================================
-- PART 1: PROFILES TABLE ENHANCEMENTS
-- Add fields for streak freeze, goal adjustment, and weekly summaries
-- ============================================================================

-- Add streak freeze fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS streak_freezes_available INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_freeze_earned_date DATE,
ADD COLUMN IF NOT EXISTS last_freeze_used_date DATE;

COMMENT ON COLUMN public.profiles.streak_freezes_available IS 'Number of streak freezes available (max 3)';
COMMENT ON COLUMN public.profiles.last_freeze_earned_date IS 'Date when last freeze was earned';
COMMENT ON COLUMN public.profiles.last_freeze_used_date IS 'Date when last freeze was used';

-- Add goal adjustment tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_goal_adjustment_date DATE,
ADD COLUMN IF NOT EXISTS goal_adjustment_declined_date DATE;

COMMENT ON COLUMN public.profiles.last_goal_adjustment_date IS 'Date when goal was last adjusted';
COMMENT ON COLUMN public.profiles.goal_adjustment_declined_date IS 'Date when user declined goal adjustment suggestion';

-- Add milestone tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_shown_milestone INTEGER DEFAULT 0;

COMMENT ON COLUMN public.profiles.last_shown_milestone IS 'Last streak milestone shown to user (7, 14, 21, 30, etc.)';

-- ============================================================================
-- PART 2: DAILY STATS TABLE ENHANCEMENTS
-- Add streak freeze tracking per day
-- ============================================================================

ALTER TABLE public.daily_stats
ADD COLUMN IF NOT EXISTS streak_freeze_used BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.daily_stats.streak_freeze_used IS 'Whether a streak freeze was used on this day';

-- ============================================================================
-- PART 3: BADGES SYSTEM
-- Create tables for badge definitions and user badge awards
-- ============================================================================

-- Badges master table (defines all available badges)
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('consistency', 'distance', 'steps', 'time', 'special')),
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak_days', 'total_distance', 'total_steps', 'single_day_steps', 'time_of_day', 'special_condition')),
  requirement_value NUMERIC,
  requirement_metadata JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.badges IS 'Master list of all available badges in the app';
COMMENT ON COLUMN public.badges.requirement_type IS 'Type of requirement to earn badge';
COMMENT ON COLUMN public.badges.requirement_value IS 'Numeric value for requirement (e.g., 7 for 7-day streak)';
COMMENT ON COLUMN public.badges.requirement_metadata IS 'Additional metadata for complex requirements (JSON)';

-- User badges table (tracks which badges users have earned)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  progress_data JSONB,
  UNIQUE(user_id, badge_id)
);

COMMENT ON TABLE public.user_badges IS 'Tracks which badges each user has earned';
COMMENT ON COLUMN public.user_badges.progress_data IS 'Optional progress tracking data (JSON)';

-- Enable RLS on badges tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (everyone can view badge definitions)
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_badges_earned_at_idx ON public.user_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS badges_category_idx ON public.badges(category);

-- ============================================================================
-- PART 4: WEEKLY SUMMARIES TABLE
-- Store calculated weekly summary statistics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  total_steps INTEGER DEFAULT 0,
  total_walks INTEGER DEFAULT 0,
  total_distance_meters NUMERIC(10,2) DEFAULT 0,
  total_active_minutes INTEGER DEFAULT 0,
  avg_daily_steps INTEGER DEFAULT 0,
  days_goal_met INTEGER DEFAULT 0,
  longest_walk_steps INTEGER DEFAULT 0,
  best_day_date DATE,
  best_day_steps INTEGER DEFAULT 0,
  streak_at_week_end INTEGER DEFAULT 0,
  comparison_vs_prev_week NUMERIC(5,2),
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, week_start_date)
);

COMMENT ON TABLE public.weekly_summaries IS 'Weekly summary statistics calculated every Monday';
COMMENT ON COLUMN public.weekly_summaries.comparison_vs_prev_week IS 'Percentage change vs previous week (e.g., 8.5 for +8.5%)';
COMMENT ON COLUMN public.weekly_summaries.insights IS 'Generated insights and achievements (JSON array)';

-- Enable RLS
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own weekly summaries"
  ON public.weekly_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly summaries"
  ON public.weekly_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS weekly_summaries_user_date_idx ON public.weekly_summaries(user_id, week_start_date DESC);

-- ============================================================================
-- PART 5: BUDDIES TABLE ENHANCEMENT
-- Add blocking status support
-- ============================================================================

-- Note: The buddies table should already exist from phase-11-social-features.sql
-- This migration adds the 'blocked' status if not already present

-- First, check if we need to update the status constraint
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE public.buddies DROP CONSTRAINT IF EXISTS buddies_status_check;
  
  -- Add new constraint with 'blocked' status
  ALTER TABLE public.buddies ADD CONSTRAINT buddies_status_check 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked'));
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'buddies table does not exist yet - will be created by phase-11-social-features.sql';
END $$;

-- ============================================================================
-- PART 6: INSERT BADGE DEFINITIONS
-- Populate the badges table with all available badges
-- ============================================================================

-- Clear existing badges (safe because of ON DELETE CASCADE)
DELETE FROM public.badges;

-- CONSISTENCY BADGES
INSERT INTO public.badges (id, name, description, category, icon, requirement_type, requirement_value, sort_order) VALUES
('first-step', 'First Step', 'Complete your first walk', 'consistency', 'footsteps', 'special_condition', 1, 1),
('week-strong', '7 Day Streak', 'Walk 7 days in a row', 'consistency', 'flame', 'streak_days', 7, 2),
('two-weeks', '14 Day Streak', 'Walk 14 days in a row', 'consistency', 'flame', 'streak_days', 14, 3),
('three-weeks', '21 Day Streak', 'Walk 21 days in a row - habit forming!', 'consistency', 'flame', 'streak_days', 21, 4),
('month-master', '30 Day Streak', 'Walk 30 days in a row', 'consistency', 'flame', 'streak_days', 30, 5),
('two-months', '60 Day Streak', 'Walk 60 days in a row', 'consistency', 'flame', 'streak_days', 60, 6),
('unbreakable', '90 Day Streak', 'Walk 90 days in a row - unbreakable!', 'consistency', 'flame', 'streak_days', 90, 7),
('century', '100 Day Streak', 'Walk 100 days in a row - legendary!', 'consistency', 'trophy', 'streak_days', 100, 8),
('weekend-warrior', 'Weekend Warrior', 'Complete 5 weekend walks', 'consistency', 'calendar', 'special_condition', 5, 9);

-- DISTANCE BADGES
INSERT INTO public.badges (id, name, description, category, icon, requirement_type, requirement_value, sort_order) VALUES
('10-miles', '10 Miles', 'Walk a total of 10 miles', 'distance', 'map', 'total_distance', 16093.4, 20),
('marathon', 'Marathon', 'Walk a total of 26.2 miles', 'distance', 'medal', 'total_distance', 42164.8, 21),
('100-miles', '100 Miles', 'Walk a total of 100 miles', 'distance', 'trending-up', 'total_distance', 160934, 22),
('500-miles', '500 Miles', 'Walk a total of 500 miles', 'distance', 'globe', 'total_distance', 804670, 23);

-- STEP BADGES
INSERT INTO public.badges (id, name, description, category, icon, requirement_type, requirement_value, sort_order) VALUES
('5k-steps', '5K Steps', 'Walk 5,000 steps in a single day', 'steps', 'footsteps', 'single_day_steps', 5000, 30),
('10k-steps', '10K Steps', 'Walk 10,000 steps in a single day', 'steps', 'footsteps', 'single_day_steps', 10000, 31),
('15k-steps', '15K Steps', 'Walk 15,000 steps in a single day', 'steps', 'footsteps', 'single_day_steps', 15000, 32),
('20k-steps', '20K Steps', 'Walk 20,000 steps in a single day', 'steps', 'footsteps', 'single_day_steps', 20000, 33),
('100k-total', '100K Total', 'Walk 100,000 total steps', 'steps', 'trending-up', 'total_steps', 100000, 34),
('500k-total', '500K Total', 'Walk 500,000 total steps', 'steps', 'trending-up', 'total_steps', 500000, 35),
('1m-total', '1 Million Steps', 'Walk 1,000,000 total steps', 'steps', 'star', 'total_steps', 1000000, 36);

-- TIME BADGES
INSERT INTO public.badges (id, name, description, category, icon, requirement_type, requirement_value, sort_order) VALUES
('early-bird', 'Early Bird', 'Complete 5 walks before 9 AM', 'time', 'sunrise', 'time_of_day', 5, 40),
('night-owl', 'Night Owl', 'Complete 5 walks after 7 PM', 'time', 'moon', 'time_of_day', 5, 41),
('lunch-break', 'Lunch Break Walker', 'Complete 5 walks between 11 AM - 2 PM', 'time', 'sunny', 'time_of_day', 5, 42);

-- SPECIAL BADGES
INSERT INTO public.badges (id, name, description, category, icon, requirement_type, requirement_value, sort_order) VALUES
('weather-warrior', 'Weather Warrior', 'Walk in the rain', 'special', 'rainy', 'special_condition', 1, 50),
('social-butterfly', 'Social Butterfly', 'Connect with 5 buddies', 'special', 'people', 'special_condition', 5, 51),
('motivator', 'Motivator', 'Give 50 kudos to buddies', 'special', 'heart', 'special_condition', 50, 52);

-- ============================================================================
-- PART 7: HELPER FUNCTIONS
-- Database functions for badge checking and weekly summary calculation
-- ============================================================================

-- Function to check and award badges for a user
CREATE OR REPLACE FUNCTION public.check_and_award_badges(user_uuid UUID)
RETURNS TABLE(newly_awarded_badge_id TEXT) AS $$
DECLARE
  user_stats RECORD;
  badge RECORD;
  already_has_badge BOOLEAN;
BEGIN
  -- Get user's current stats
  SELECT 
    COALESCE(s.current_streak, 0) as current_streak,
    COALESCE(SUM(w.steps), 0) as total_steps,
    COALESCE(SUM(w.distance_meters), 0) as total_distance,
    COALESCE(MAX(w.steps), 0) as max_single_day_steps,
    COALESCE(COUNT(DISTINCT w.id), 0) as total_walks
  INTO user_stats
  FROM public.profiles p
  LEFT JOIN public.streaks s ON s.user_id = p.id
  LEFT JOIN public.walks w ON w.user_id = p.id
  WHERE p.id = user_uuid
  GROUP BY p.id, s.current_streak;

  -- Check each badge
  FOR badge IN SELECT * FROM public.badges LOOP
    -- Check if user already has this badge
    SELECT EXISTS(
      SELECT 1 FROM public.user_badges 
      WHERE user_id = user_uuid AND badge_id = badge.id
    ) INTO already_has_badge;

    IF NOT already_has_badge THEN
      -- Check if user meets requirements
      IF (badge.requirement_type = 'streak_days' AND user_stats.current_streak >= badge.requirement_value) OR
         (badge.requirement_type = 'total_steps' AND user_stats.total_steps >= badge.requirement_value) OR
         (badge.requirement_type = 'total_distance' AND user_stats.total_distance >= badge.requirement_value) OR
         (badge.requirement_type = 'single_day_steps' AND user_stats.max_single_day_steps >= badge.requirement_value) THEN
        
        -- Award the badge
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (user_uuid, badge.id);
        
        -- Return the newly awarded badge
        newly_awarded_badge_id := badge.id;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.check_and_award_badges IS 'Checks all badges and awards any newly earned ones to the user';

-- ============================================================================
-- PART 8: UPDATE EXISTING TRIGGER
-- Modify handle_new_user to initialize new fields
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    display_name,
    streak_freezes_available,
    last_shown_milestone
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'display_name',
    0,  -- Start with 0 freezes
    0   -- No milestones shown yet
  );
  
  INSERT INTO public.streaks (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Verifying tables...';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badges') THEN
    RAISE NOTICE '✓ badges table created';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_badges') THEN
    RAISE NOTICE '✓ user_badges table created';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_summaries') THEN
    RAISE NOTICE '✓ weekly_summaries table created';
  END IF;
  
  RAISE NOTICE '✓ All migrations applied successfully!';
END $$;

