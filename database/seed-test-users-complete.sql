-- ============================================================================
-- STEPIN TEST DATABASE - COMPREHENSIVE SEED SCRIPT
-- ============================================================================
-- Creates 4 complete test users with realistic data across ALL tables
-- Database: Steppin-Test (hwzyuugggdubeejfpele)
-- Date: 2025-10-10
-- ============================================================================

-- Clear existing data (CAUTION: This deletes everything!)
TRUNCATE TABLE public.user_badges CASCADE;
TRUNCATE TABLE public.kudos CASCADE;
TRUNCATE TABLE public.activity_feed CASCADE;
TRUNCATE TABLE public.buddies CASCADE;
TRUNCATE TABLE public.weekly_summaries CASCADE;
TRUNCATE TABLE public.streaks CASCADE;
TRUNCATE TABLE public.daily_stats CASCADE;
TRUNCATE TABLE public.walks CASCADE;
TRUNCATE TABLE public.invite_links CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Note: We cannot directly truncate auth.users, so we'll delete and recreate

-- Delete existing test users from auth.users
DELETE FROM auth.users WHERE email IN (
  'mike.chen@example.com',
  'sarah.johnson@example.com',
  'emma.rodriguez@example.com',
  'james.williams@example.com'
);

-- ============================================================================
-- STEP 1: CREATE AUTH USERS
-- ============================================================================
-- These users will have profiles auto-created by the handle_new_user trigger

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
  -- User 1: Mike Chen (Active walker, 45yo, high consistency)
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mike.chen@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Mike Chen"}',
    NOW() - INTERVAL '90 days',
    NOW(),
    '',
    '',
    '',
    ''
  ),
  -- User 2: Sarah Johnson (Beginner, 62yo, improving consistency)
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sarah.johnson@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Sarah Johnson"}',
    NOW() - INTERVAL '60 days',
    NOW(),
    '',
    '',
    '',
    ''
  ),
  -- User 3: Emma Rodriguez (Recovery, 38yo, moderate consistency)
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'emma.rodriguez@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Emma Rodriguez"}',
    NOW() - INTERVAL '45 days',
    NOW(),
    '',
    '',
    '',
    ''
  ),
  -- User 4: James Williams (Elderly, 71yo, steady consistency)
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'james.williams@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"James Williams"}',
    NOW() - INTERVAL '75 days',
    NOW(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: UPDATE PROFILES WITH COMPLETE DATA
-- ============================================================================
-- Profiles are auto-created by trigger, now we update them with full details

-- Mike Chen: Active walker, tech-savvy, high goals
UPDATE public.profiles SET
  display_name = 'Mike Chen',
  daily_step_goal = 12000,
  units_preference = 'miles',
  theme_preference = 'dark',
  notification_settings = '{"dailyReminder": false, "streakReminder": true, "goalCelebration": true, "reminderTime": "06:00"}'::jsonb,
  onboarding_completed = true,
  activity_visibility = 'buddies',
  location_city = 'San Francisco, CA',
  location_coordinates = '{"lat": 37.7749, "lng": -122.4194}'::jsonb,
  weather_alerts_enabled = true,
  preferred_walk_time = 'morning',
  audio_coaching_enabled = false,
  audio_coaching_interval = 300,
  auto_detect_enabled = true,
  username = 'mikechen',
  username_lowercase = 'mikechen',
  streak_freezes_available = 2,
  last_freeze_earned_date = CURRENT_DATE - 7,
  last_shown_milestone = 30,
  created_at = NOW() - INTERVAL '90 days',
  updated_at = NOW()
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Sarah Johnson: Beginner, needs encouragement
UPDATE public.profiles SET
  display_name = 'Sarah Johnson',
  daily_step_goal = 5000,
  units_preference = 'miles',
  theme_preference = 'light',
  notification_settings = '{"dailyReminder": true, "streakReminder": true, "goalCelebration": true, "reminderTime": "09:00"}'::jsonb,
  onboarding_completed = true,
  activity_visibility = 'buddies',
  location_city = 'Tampa, FL',
  location_coordinates = '{"lat": 27.9506, "lng": -82.4572}'::jsonb,
  weather_alerts_enabled = true,
  preferred_walk_time = 'morning',
  audio_coaching_enabled = true,
  audio_coaching_interval = 300,
  auto_detect_enabled = true,
  username = 'sarahjohnson',
  username_lowercase = 'sarahjohnson',
  streak_freezes_available = 1,
  last_shown_milestone = 7,
  created_at = NOW() - INTERVAL '60 days',
  updated_at = NOW()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Emma Rodriguez: Recovery mode, private
UPDATE public.profiles SET
  display_name = 'Emma Rodriguez',
  daily_step_goal = 4000,
  units_preference = 'kilometers',
  theme_preference = 'system',
  notification_settings = '{"dailyReminder": true, "streakReminder": false, "goalCelebration": true, "reminderTime": "15:00"}'::jsonb,
  onboarding_completed = true,
  activity_visibility = 'private',
  location_city = 'Austin, TX',
  location_coordinates = '{"lat": 30.2672, "lng": -97.7431}'::jsonb,
  weather_alerts_enabled = true,
  preferred_walk_time = 'afternoon',
  audio_coaching_enabled = true,
  audio_coaching_interval = 420,
  auto_detect_enabled = false,
  username = 'emmarodriguez',
  username_lowercase = 'emmarodriguez',
  streak_freezes_available = 0,
  last_shown_milestone = 0,
  created_at = NOW() - INTERVAL '45 days',
  updated_at = NOW()
WHERE id = '33333333-3333-3333-3333-333333333333';

-- James Williams: Elderly, steady walker
UPDATE public.profiles SET
  display_name = 'James Williams',
  daily_step_goal = 6000,
  units_preference = 'miles',
  theme_preference = 'light',
  notification_settings = '{"dailyReminder": true, "streakReminder": true, "goalCelebration": true, "reminderTime": "08:00"}'::jsonb,
  onboarding_completed = true,
  activity_visibility = 'buddies',
  location_city = 'Portland, OR',
  location_coordinates = '{"lat": 45.5152, "lng": -122.6784}'::jsonb,
  weather_alerts_enabled = true,
  preferred_walk_time = 'morning',
  audio_coaching_enabled = true,
  audio_coaching_interval = 240,
  auto_detect_enabled = true,
  username = 'jameswilliams',
  username_lowercase = 'jameswilliams',
  streak_freezes_available = 1,
  last_shown_milestone = 14,
  created_at = NOW() - INTERVAL '75 days',
  updated_at = NOW()
WHERE id = '44444444-4444-4444-4444-444444444444';

-- ============================================================================
-- STEP 3: CREATE BUDDY RELATIONSHIPS
-- ============================================================================

INSERT INTO public.buddies (user_id, buddy_id, status, created_at, updated_at) VALUES
  -- Mike <-> Sarah (accepted)
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'accepted', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted', NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days'),
  
  -- Mike <-> James (accepted)
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'accepted', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'accepted', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  
  -- Sarah <-> James (accepted)
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'accepted', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'accepted', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
  
  -- Mike -> Emma (pending - Emma hasn't accepted yet because she's private)
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'pending', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

-- ============================================================================
-- STEP 4: CREATE INVITE LINKS
-- ============================================================================

INSERT INTO public.invite_links (inviter_id, invite_code, expires_at, used_by_id, used_at, created_at) VALUES
  -- Mike's active invite link
  ('22222222-2222-2222-2222-222222222222', 'MIKE2025', NOW() + INTERVAL '30 days', NULL, NULL, NOW() - INTERVAL '5 days'),
  
  -- Sarah's used invite link (used by James)
  ('11111111-1111-1111-1111-111111111111', 'SARAH123', NOW() + INTERVAL '30 days', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '40 days', NOW() - INTERVAL '45 days'),
  
  -- James's expired invite link
  ('44444444-4444-4444-4444-444444444444', 'JAMES456', NOW() - INTERVAL '5 days', NULL, NULL, NOW() - INTERVAL '35 days');

-- ============================================================================
-- STEP 5: CREATE WALKS DATA (Last 30 days for each user)
-- ============================================================================
-- Mike Chen: High consistency (28/30 days), exceeds goals
DO $$
DECLARE
  day_offset INTEGER;
  walk_date DATE;
  steps INTEGER;
  duration INTEGER;
  distance NUMERIC;
BEGIN
  FOR day_offset IN 0..29 LOOP
    walk_date := CURRENT_DATE - day_offset;

    -- Mike walks almost every day (skip 2 random days)
    IF day_offset NOT IN (5, 17) THEN
      steps := 11000 + FLOOR(RANDOM() * 3000); -- 11k-14k steps
      duration := FLOOR(steps / 110.0); -- ~110 steps/min (brisk pace)
      distance := steps * 0.762; -- meters

      INSERT INTO public.walks (
        user_id, date, steps, duration_minutes, distance_meters,
        auto_detected, average_heart_rate, max_heart_rate,
        weather_conditions, created_at, updated_at
      ) VALUES (
        '22222222-2222-2222-2222-222222222222',
        walk_date,
        steps,
        duration,
        distance,
        (RANDOM() < 0.3), -- 30% auto-detected
        120 + FLOOR(RANDOM() * 20), -- 120-140 BPM
        150 + FLOOR(RANDOM() * 20), -- 150-170 BPM
        jsonb_build_object(
          'temp', 60 + FLOOR(RANDOM() * 25),
          'condition', CASE FLOOR(RANDOM() * 4)
            WHEN 0 THEN 'clear'
            WHEN 1 THEN 'clouds'
            WHEN 2 THEN 'partly_cloudy'
            ELSE 'sunny'
          END,
          'humidity', 40 + FLOOR(RANDOM() * 40)
        ),
        walk_date::timestamp,
        walk_date::timestamp
      );
    END IF;
  END LOOP;
END $$;

-- Sarah Johnson: Improving consistency (18/30 days), meets goals
DO $$
DECLARE
  day_offset INTEGER;
  walk_date DATE;
  steps INTEGER;
  duration INTEGER;
  distance NUMERIC;
  should_walk BOOLEAN;
BEGIN
  FOR day_offset IN 0..29 LOOP
    walk_date := CURRENT_DATE - day_offset;

    -- Sarah's consistency improves over time (60% early, 80% recent)
    should_walk := RANDOM() < (0.60 + (day_offset::FLOAT / 150));

    IF should_walk THEN
      steps := 4500 + FLOOR(RANDOM() * 2000); -- 4.5k-6.5k steps
      duration := FLOOR(steps / 85.0); -- ~85 steps/min (moderate pace)
      distance := steps * 0.762;

      INSERT INTO public.walks (
        user_id, date, steps, duration_minutes, distance_meters,
        auto_detected, average_heart_rate, max_heart_rate,
        weather_conditions, created_at, updated_at
      ) VALUES (
        '11111111-1111-1111-1111-111111111111',
        walk_date,
        steps,
        duration,
        distance,
        (RANDOM() < 0.5), -- 50% auto-detected
        100 + FLOOR(RANDOM() * 15), -- 100-115 BPM
        130 + FLOOR(RANDOM() * 15), -- 130-145 BPM
        jsonb_build_object(
          'temp', 70 + FLOOR(RANDOM() * 20),
          'condition', CASE FLOOR(RANDOM() * 3)
            WHEN 0 THEN 'clear'
            WHEN 1 THEN 'sunny'
            ELSE 'partly_cloudy'
          END,
          'humidity', 50 + FLOOR(RANDOM() * 30)
        ),
        walk_date::timestamp,
        walk_date::timestamp
      );
    END IF;
  END LOOP;
END $$;

-- Emma Rodriguez: Moderate consistency (20/30 days), below goals (recovery)
DO $$
DECLARE
  day_offset INTEGER;
  walk_date DATE;
  steps INTEGER;
  duration INTEGER;
  distance NUMERIC;
  should_walk BOOLEAN;
BEGIN
  FOR day_offset IN 0..29 LOOP
    walk_date := CURRENT_DATE - day_offset;

    -- Emma walks ~65% of days
    should_walk := RANDOM() < 0.65;

    IF should_walk THEN
      steps := 3000 + FLOOR(RANDOM() * 2500); -- 3k-5.5k steps (below 4k goal)
      duration := FLOOR(steps / 75.0); -- ~75 steps/min (gentle pace)
      distance := steps * 0.762;

      INSERT INTO public.walks (
        user_id, date, steps, duration_minutes, distance_meters,
        auto_detected, weather_conditions, created_at, updated_at
      ) VALUES (
        '33333333-3333-3333-3333-333333333333',
        walk_date,
        steps,
        duration,
        distance,
        false, -- Emma disabled auto-detect
        jsonb_build_object(
          'temp', 65 + FLOOR(RANDOM() * 25),
          'condition', CASE FLOOR(RANDOM() * 4)
            WHEN 0 THEN 'clear'
            WHEN 1 THEN 'clouds'
            WHEN 2 THEN 'partly_cloudy'
            ELSE 'sunny'
          END,
          'humidity', 45 + FLOOR(RANDOM() * 35)
        ),
        walk_date::timestamp,
        walk_date::timestamp
      );
    END IF;
  END LOOP;
END $$;

-- James Williams: Steady consistency (24/30 days), meets goals
DO $$
DECLARE
  day_offset INTEGER;
  walk_date DATE;
  steps INTEGER;
  duration INTEGER;
  distance NUMERIC;
  should_walk BOOLEAN;
BEGIN
  FOR day_offset IN 0..29 LOOP
    walk_date := CURRENT_DATE - day_offset;

    -- James walks ~80% of days, very steady
    should_walk := RANDOM() < 0.80;

    IF should_walk THEN
      steps := 5500 + FLOOR(RANDOM() * 1500); -- 5.5k-7k steps
      duration := FLOOR(steps / 90.0); -- ~90 steps/min
      distance := steps * 0.762;

      INSERT INTO public.walks (
        user_id, date, steps, duration_minutes, distance_meters,
        auto_detected, average_heart_rate, max_heart_rate,
        weather_conditions, created_at, updated_at
      ) VALUES (
        '44444444-4444-4444-4444-444444444444',
        walk_date,
        steps,
        duration,
        distance,
        (RANDOM() < 0.4), -- 40% auto-detected
        95 + FLOOR(RANDOM() * 15), -- 95-110 BPM
        125 + FLOOR(RANDOM() * 15), -- 125-140 BPM
        jsonb_build_object(
          'temp', 55 + FLOOR(RANDOM() * 20),
          'condition', CASE FLOOR(RANDOM() * 5)
            WHEN 0 THEN 'clear'
            WHEN 1 THEN 'clouds'
            WHEN 2 THEN 'rain'
            WHEN 3 THEN 'partly_cloudy'
            ELSE 'sunny'
          END,
          'humidity', 60 + FLOOR(RANDOM() * 30)
        ),
        walk_date::timestamp,
        walk_date::timestamp
      );
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 6: CREATE DAILY STATS (Auto-aggregated from walks)
-- ============================================================================

INSERT INTO public.daily_stats (user_id, date, total_steps, goal_met, streak_freeze_used, created_at, updated_at)
SELECT
  user_id,
  date,
  SUM(steps) as total_steps,
  CASE
    WHEN user_id = '22222222-2222-2222-2222-222222222222' THEN SUM(steps) >= 12000
    WHEN user_id = '11111111-1111-1111-1111-111111111111' THEN SUM(steps) >= 5000
    WHEN user_id = '33333333-3333-3333-3333-333333333333' THEN SUM(steps) >= 4000
    WHEN user_id = '44444444-4444-4444-4444-444444444444' THEN SUM(steps) >= 6000
    ELSE false
  END as goal_met,
  false as streak_freeze_used,
  date::timestamp as created_at,
  date::timestamp as updated_at
FROM public.walks
GROUP BY user_id, date
ORDER BY user_id, date;

-- ============================================================================
-- STEP 7: CREATE STREAKS
-- ============================================================================

-- Calculate current streaks based on daily_stats
INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date, created_at, updated_at)
SELECT
  user_id,
  -- Current streak: count consecutive days from today backwards
  (SELECT COUNT(*) FROM public.daily_stats ds2
   WHERE ds2.user_id = ds.user_id
   AND ds2.date >= CURRENT_DATE - INTERVAL '30 days'
   AND ds2.goal_met = true
   AND NOT EXISTS (
     SELECT 1 FROM generate_series(ds2.date::date, CURRENT_DATE, '1 day'::interval) d
     WHERE NOT EXISTS (
       SELECT 1 FROM public.daily_stats ds3
       WHERE ds3.user_id = ds2.user_id
       AND ds3.date = d::date
       AND ds3.goal_met = true
     )
   )
  ) as current_streak,
  -- Longest streak: maximum consecutive days
  (SELECT MAX(streak_length) FROM (
    SELECT user_id, COUNT(*) as streak_length
    FROM (
      SELECT user_id, date, goal_met,
        date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date)::integer as grp
      FROM public.daily_stats
      WHERE goal_met = true
    ) sub
    GROUP BY user_id, grp
  ) streaks WHERE streaks.user_id = ds.user_id) as longest_streak,
  MAX(date) as last_activity_date,
  MIN(created_at) as created_at,
  NOW() as updated_at
FROM public.daily_stats ds
GROUP BY user_id;

-- Update with realistic streak values (simplified for testing)
UPDATE public.streaks SET current_streak = 7, longest_streak = 28 WHERE user_id = '22222222-2222-2222-2222-222222222222';
UPDATE public.streaks SET current_streak = 3, longest_streak = 12 WHERE user_id = '11111111-1111-1111-1111-111111111111';
UPDATE public.streaks SET current_streak = 0, longest_streak = 8 WHERE user_id = '33333333-3333-3333-3333-333333333333';
UPDATE public.streaks SET current_streak = 5, longest_streak = 21 WHERE user_id = '44444444-4444-4444-4444-444444444444';

-- ============================================================================
-- STEP 8: CREATE ACTIVITY FEED ENTRIES
-- ============================================================================

-- Mike's recent activities (public/buddies)
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'goal_achieved', '{"steps": 13500, "goal": 12000, "feeling": "energized"}'::jsonb, 'buddies', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'streak_milestone', '{"streak": 7, "milestone": 7}'::jsonb, 'buddies', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'walk_completed', '{"steps": 12800, "duration": 115, "distance": 9753.6, "note": "Beautiful morning walk!"}'::jsonb, 'buddies', NOW() - INTERVAL '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'goal_achieved', '{"steps": 14200, "goal": 12000}'::jsonb, 'buddies', NOW() - INTERVAL '5 days');

-- Sarah's activities (buddies only, needs encouragement)
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'goal_achieved', '{"steps": 5200, "goal": 5000, "feeling": "proud"}'::jsonb, 'buddies', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'walk_completed', '{"steps": 4800, "duration": 56, "note": "Walked with my neighbor!"}'::jsonb, 'buddies', NOW() - INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111111', 'streak_milestone', '{"streak": 3, "milestone": 3}'::jsonb, 'buddies', NOW() - INTERVAL '4 days');

-- Emma's activities (private - won't show to others)
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'walk_completed', '{"steps": 3500, "duration": 47}'::jsonb, 'private', NOW() - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333', 'walk_completed', '{"steps": 4200, "duration": 56}'::jsonb, 'private', NOW() - INTERVAL '3 days');

-- James's activities (buddies)
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at) VALUES
  ('44444444-4444-4444-4444-444444444444', 'goal_achieved', '{"steps": 6500, "goal": 6000, "feeling": "accomplished"}'::jsonb, 'buddies', NOW() - INTERVAL '1 day'),
  ('44444444-4444-4444-4444-444444444444', 'streak_milestone', '{"streak": 5, "milestone": 5}'::jsonb, 'buddies', NOW() - INTERVAL '2 days'),
  ('44444444-4444-4444-4444-444444444444', 'walk_completed', '{"steps": 6200, "duration": 69, "note": "Morning walk in the park"}'::jsonb, 'buddies', NOW() - INTERVAL '4 days');

-- ============================================================================
-- STEP 9: CREATE KUDOS (Buddies giving each other encouragement)
-- ============================================================================

-- Get activity IDs for kudos
DO $$
DECLARE
  mike_activity_id UUID;
  sarah_activity_id UUID;
  james_activity_id UUID;
BEGIN
  -- Mike's recent goal achievement
  SELECT id INTO mike_activity_id FROM public.activity_feed
  WHERE user_id = '22222222-2222-2222-2222-222222222222'
  AND activity_type = 'goal_achieved'
  ORDER BY created_at DESC LIMIT 1;

  -- Sarah's recent goal achievement
  SELECT id INTO sarah_activity_id FROM public.activity_feed
  WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND activity_type = 'goal_achieved'
  ORDER BY created_at DESC LIMIT 1;

  -- James's recent streak milestone
  SELECT id INTO james_activity_id FROM public.activity_feed
  WHERE user_id = '44444444-4444-4444-4444-444444444444'
  AND activity_type = 'streak_milestone'
  ORDER BY created_at DESC LIMIT 1;

  -- Sarah gives kudos to Mike
  IF mike_activity_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (mike_activity_id, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '12 hours');
  END IF;

  -- Mike gives kudos to Sarah
  IF sarah_activity_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (sarah_activity_id, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '18 hours');
  END IF;

  -- James gives kudos to Sarah
  IF sarah_activity_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (sarah_activity_id, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '16 hours');
  END IF;

  -- Mike gives kudos to James
  IF james_activity_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (james_activity_id, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day');
  END IF;

  -- Sarah gives kudos to James
  IF james_activity_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (james_activity_id, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day');
  END IF;
END $$;

-- ============================================================================
-- STEP 10: AWARD BADGES TO USERS
-- ============================================================================

-- Mike Chen: Active walker - multiple badges
INSERT INTO public.user_badges (user_id, badge_id, earned_at, progress_data) VALUES
  ('22222222-2222-2222-2222-222222222222', 'first-step', NOW() - INTERVAL '90 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'week-strong', NOW() - INTERVAL '83 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'two-weeks', NOW() - INTERVAL '76 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'three-weeks', NOW() - INTERVAL '69 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'month-master', NOW() - INTERVAL '60 days', NULL),
  ('22222222-2222-2222-2222-222222222222', '10k-steps', NOW() - INTERVAL '85 days', NULL),
  ('22222222-2222-2222-2222-222222222222', '15k-steps', NOW() - INTERVAL '70 days', NULL),
  ('22222222-2222-2222-2222-222222222222', '100k-total', NOW() - INTERVAL '80 days', NULL),
  ('22222222-2222-2222-2222-222222222222', '500k-total', NOW() - INTERVAL '40 days', NULL),
  ('22222222-2222-2222-2222-222222222222', '10-miles', NOW() - INTERVAL '88 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'marathon', NOW() - INTERVAL '75 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'early-bird', NOW() - INTERVAL '82 days', NULL),
  ('22222222-2222-2222-2222-222222222222', 'social-butterfly', NOW() - INTERVAL '50 days', NULL);

-- Sarah Johnson: Beginner - early badges
INSERT INTO public.user_badges (user_id, badge_id, earned_at, progress_data) VALUES
  ('11111111-1111-1111-1111-111111111111', 'first-step', NOW() - INTERVAL '60 days', NULL),
  ('11111111-1111-1111-1111-111111111111', '5k-steps', NOW() - INTERVAL '55 days', NULL),
  ('11111111-1111-1111-1111-111111111111', 'week-strong', NOW() - INTERVAL '48 days', NULL),
  ('11111111-1111-1111-1111-111111111111', '100k-total', NOW() - INTERVAL '30 days', NULL),
  ('11111111-1111-1111-1111-111111111111', '10-miles', NOW() - INTERVAL '45 days', NULL);

-- Emma Rodriguez: Private walker - minimal badges
INSERT INTO public.user_badges (user_id, badge_id, earned_at, progress_data) VALUES
  ('33333333-3333-3333-3333-333333333333', 'first-step', NOW() - INTERVAL '45 days', NULL),
  ('33333333-3333-3333-3333-333333333333', '5k-steps', NOW() - INTERVAL '38 days', NULL);

-- James Williams: Steady walker - consistency badges
INSERT INTO public.user_badges (user_id, badge_id, earned_at, progress_data) VALUES
  ('44444444-4444-4444-4444-444444444444', 'first-step', NOW() - INTERVAL '75 days', NULL),
  ('44444444-4444-4444-4444-444444444444', 'week-strong', NOW() - INTERVAL '68 days', NULL),
  ('44444444-4444-4444-4444-444444444444', 'two-weeks', NOW() - INTERVAL '61 days', NULL),
  ('44444444-4444-4444-4444-444444444444', 'three-weeks', NOW() - INTERVAL '54 days', NULL),
  ('44444444-4444-4444-4444-444444444444', '5k-steps', NOW() - INTERVAL '72 days', NULL),
  ('44444444-4444-4444-4444-444444444444', '10k-steps', NOW() - INTERVAL '65 days', NULL),
  ('44444444-4444-4444-4444-444444444444', '100k-total', NOW() - INTERVAL '50 days', NULL),
  ('44444444-4444-4444-4444-444444444444', '10-miles', NOW() - INTERVAL '70 days', NULL),
  ('44444444-4444-4444-4444-444444444444', 'early-bird', NOW() - INTERVAL '60 days', NULL);

-- ============================================================================
-- STEP 11: CREATE WEEKLY SUMMARIES
-- ============================================================================

-- Calculate weekly summaries for the last 4 weeks for each user
DO $$
DECLARE
  week_num INTEGER;
  week_start DATE;
  week_end DATE;
  user_rec RECORD;
BEGIN
  FOR week_num IN 0..3 LOOP
    week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE - (week_num * 7);
    week_end := week_start + 6;

    FOR user_rec IN SELECT id, daily_step_goal FROM public.profiles LOOP
      INSERT INTO public.weekly_summaries (
        user_id,
        week_start_date,
        week_end_date,
        total_steps,
        total_walks,
        total_distance_meters,
        total_active_minutes,
        avg_daily_steps,
        days_goal_met,
        longest_walk_steps,
        best_day_date,
        best_day_steps,
        streak_at_week_end,
        comparison_vs_prev_week,
        insights,
        created_at
      )
      SELECT
        user_rec.id,
        week_start,
        week_end,
        COALESCE(SUM(w.steps), 0) as total_steps,
        COALESCE(COUNT(w.id), 0) as total_walks,
        COALESCE(SUM(w.distance_meters), 0) as total_distance_meters,
        COALESCE(SUM(w.duration_minutes), 0) as total_active_minutes,
        COALESCE(AVG(ds.total_steps)::INTEGER, 0) as avg_daily_steps,
        COALESCE(SUM(CASE WHEN ds.goal_met THEN 1 ELSE 0 END), 0) as days_goal_met,
        COALESCE(MAX(w.steps), 0) as longest_walk_steps,
        (SELECT date FROM public.daily_stats WHERE user_id = user_rec.id AND date BETWEEN week_start AND week_end ORDER BY total_steps DESC LIMIT 1) as best_day_date,
        COALESCE(MAX(ds.total_steps), 0) as best_day_steps,
        (SELECT current_streak FROM public.streaks WHERE user_id = user_rec.id) as streak_at_week_end,
        CASE
          WHEN week_num > 0 THEN
            (SELECT
              CASE
                WHEN prev.total_steps > 0 THEN
                  ((COALESCE(SUM(w.steps), 0) - prev.total_steps)::NUMERIC / prev.total_steps * 100)
                ELSE 0
              END
            FROM public.weekly_summaries prev
            WHERE prev.user_id = user_rec.id
            AND prev.week_start_date = week_start + 7
            )
          ELSE NULL
        END as comparison_vs_prev_week,
        jsonb_build_object(
          'most_active_day', EXTRACT(DOW FROM (SELECT date FROM public.daily_stats WHERE user_id = user_rec.id AND date BETWEEN week_start AND week_end ORDER BY total_steps DESC LIMIT 1)),
          'consistency_score', ROUND((COALESCE(COUNT(w.id), 0)::NUMERIC / 7 * 100), 0)
        ) as insights,
        week_end::timestamp as created_at
      FROM public.walks w
      LEFT JOIN public.daily_stats ds ON ds.user_id = w.user_id AND ds.date = w.date
      WHERE w.user_id = user_rec.id
      AND w.date BETWEEN week_start AND week_end
      GROUP BY user_rec.id;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- SEED SCRIPT COMPLETE
-- ============================================================================

DO $$
DECLARE
  user_count INTEGER;
  walk_count INTEGER;
  buddy_count INTEGER;
  badge_count INTEGER;
  activity_count INTEGER;
  kudos_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  SELECT COUNT(*) INTO walk_count FROM public.walks;
  SELECT COUNT(*) INTO buddy_count FROM public.buddies;
  SELECT COUNT(*) INTO badge_count FROM public.user_badges;
  SELECT COUNT(*) INTO activity_count FROM public.activity_feed;
  SELECT COUNT(*) INTO kudos_count FROM public.kudos;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'SEED SCRIPT COMPLETED SUCCESSFULLY';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Users created: %', user_count;
  RAISE NOTICE 'Walks created: %', walk_count;
  RAISE NOTICE 'Buddy connections: %', buddy_count;
  RAISE NOTICE 'Badges awarded: %', badge_count;
  RAISE NOTICE 'Activity feed entries: %', activity_count;
  RAISE NOTICE 'Kudos given: %', kudos_count;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Test Users:';
  RAISE NOTICE '  1. mike.chen@example.com (Active, 28/30 days)';
  RAISE NOTICE '  2. sarah.johnson@example.com (Beginner, 18/30 days)';
  RAISE NOTICE '  3. emma.rodriguez@example.com (Recovery, 20/30 days, private)';
  RAISE NOTICE '  4. james.williams@example.com (Steady, 24/30 days)';
  RAISE NOTICE 'Password for all: TestPassword123!';
  RAISE NOTICE '============================================';
END $$;

