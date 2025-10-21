-- ============================================================================
-- STEPIN DATABASE SEED SCRIPT - COMPREHENSIVE TEST DATA
-- ============================================================================
-- This script seeds the database with 5 users and 90 days of realistic data
-- Run this against your Supabase TEST database (hwzyuugggdubeejfpele)
-- ============================================================================

-- Clear existing data (be careful - this deletes everything!)
TRUNCATE TABLE public.kudos CASCADE;
TRUNCATE TABLE public.activity_feed CASCADE;
TRUNCATE TABLE public.buddies CASCADE;
TRUNCATE TABLE public.streaks CASCADE;
TRUNCATE TABLE public.daily_stats CASCADE;
TRUNCATE TABLE public.walks CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- ============================================================================
-- 0. CREATE AUTH USERS
-- ============================================================================
-- Note: In Supabase, profiles have a foreign key to auth.users
-- We need to create auth users first, then profiles will be auto-created by trigger

-- Insert auth users directly (bypassing normal signup flow for seeding)
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
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days',
    '',
    '',
    '',
    ''
  ),
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
    NOW() - INTERVAL '180 days',
    NOW() - INTERVAL '180 days',
    '',
    '',
    '',
    ''
  ),
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
    NOW() - INTERVAL '45 days',
    '',
    '',
    '',
    ''
  ),
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
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '120 days',
    '',
    '',
    '',
    ''
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'lisa.thompson@example.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Lisa Thompson"}',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days',
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 1. UPDATE PROFILES (auto-created by trigger)
-- ============================================================================
-- The handle_new_user trigger automatically creates profiles when auth users are created
-- Now we just need to update them with the full data

-- User 1: Sarah Johnson (Beginner, 62yo)
UPDATE public.profiles SET
  daily_step_goal = 5000,
  units_preference = 'miles',
  theme_preference = 'light',
  notification_settings = '{"dailyReminder": true, "streakReminder": true, "goalCelebration": true, "reminderTime": "09:00"}'::jsonb,
  onboarding_completed = true,
  weather_alerts_enabled = true,
  audio_coaching_enabled = true,
  audio_coaching_interval = 300,
  preferred_walk_time = 'morning',
  activity_visibility = 'buddies',
  location_city = 'Tampa, FL',
  location_coordinates = '{"lat": 27.9506, "lng": -82.4572}'::jsonb,
  created_at = NOW() - INTERVAL '90 days',
  updated_at = NOW() - INTERVAL '90 days'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- User 2: Mike Chen (Active, 45yo)
UPDATE public.profiles SET
  daily_step_goal = 12000,
  units_preference = 'miles',
  theme_preference = 'dark',
  notification_settings = '{"dailyReminder": false, "streakReminder": true, "goalCelebration": true, "reminderTime": "06:00"}'::jsonb,
  onboarding_completed = true,
  weather_alerts_enabled = true,
  audio_coaching_enabled = false,
  audio_coaching_interval = 300,
  preferred_walk_time = 'morning',
  activity_visibility = 'buddies',
  location_city = 'San Francisco, CA',
  location_coordinates = '{"lat": 37.7749, "lng": -122.4194}'::jsonb,
  created_at = NOW() - INTERVAL '180 days',
  updated_at = NOW() - INTERVAL '180 days'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- User 3: Emma Rodriguez (Recovery, 38yo)
UPDATE public.profiles SET
  daily_step_goal = 4000,
  units_preference = 'kilometers',
  theme_preference = 'system',
  notification_settings = '{"dailyReminder": true, "streakReminder": false, "goalCelebration": true, "reminderTime": "15:00"}'::jsonb,
  onboarding_completed = true,
  weather_alerts_enabled = true,
  audio_coaching_enabled = true,
  audio_coaching_interval = 420,
  preferred_walk_time = 'afternoon',
  activity_visibility = 'private',
  location_city = 'Austin, TX',
  location_coordinates = '{"lat": 30.2672, "lng": -97.7431}'::jsonb,
  created_at = NOW() - INTERVAL '45 days',
  updated_at = NOW() - INTERVAL '45 days'
WHERE id = '33333333-3333-3333-3333-333333333333';

-- User 4: James Williams (Elderly, 71yo)
UPDATE public.profiles SET
  daily_step_goal = 6000,
  units_preference = 'miles',
  theme_preference = 'light',
  notification_settings = '{"dailyReminder": true, "streakReminder": true, "goalCelebration": true, "reminderTime": "08:00"}'::jsonb,
  onboarding_completed = true,
  weather_alerts_enabled = true,
  audio_coaching_enabled = true,
  audio_coaching_interval = 240,
  preferred_walk_time = 'morning',
  activity_visibility = 'buddies',
  location_city = 'Portland, OR',
  location_coordinates = '{"lat": 45.5152, "lng": -122.6784}'::jsonb,
  created_at = NOW() - INTERVAL '120 days',
  updated_at = NOW() - INTERVAL '120 days'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- User 5: Lisa Thompson (Busy Professional, 29yo)
UPDATE public.profiles SET
  daily_step_goal = 8000,
  units_preference = 'miles',
  theme_preference = 'dark',
  notification_settings = '{"dailyReminder": true, "streakReminder": false, "goalCelebration": true, "reminderTime": "18:00"}'::jsonb,
  onboarding_completed = true,
  weather_alerts_enabled = false,
  audio_coaching_enabled = false,
  audio_coaching_interval = 300,
  preferred_walk_time = 'evening',
  activity_visibility = 'public',
  location_city = 'New York, NY',
  location_coordinates = '{"lat": 40.7128, "lng": -74.0060}'::jsonb,
  created_at = NOW() - INTERVAL '60 days',
  updated_at = NOW() - INTERVAL '60 days'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ============================================================================
-- 2. CREATE WALKS (90 days of history per user)
-- ============================================================================
-- This uses a function to generate realistic walk data
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_walks() RETURNS void AS $$
DECLARE
  user_record RECORD;
  day_offset INTEGER;
  walk_date DATE;
  base_steps INTEGER;
  actual_steps INTEGER;
  duration INTEGER;
  distance NUMERIC;
  weather_temp INTEGER;
  weather_condition TEXT;
  should_walk BOOLEAN;
  walk_time TIME;
BEGIN
  -- Loop through each user
  FOR user_record IN 
    SELECT id, daily_step_goal, preferred_walk_time FROM public.profiles
  LOOP
    base_steps := user_record.daily_step_goal;
    
    -- Generate 90 days of walks
    FOR day_offset IN 0..89 LOOP
      walk_date := CURRENT_DATE - day_offset;
      
      -- Determine if user walks this day (realistic patterns)
      should_walk := CASE 
        -- Sarah (beginner): 60% consistency, improving over time
        WHEN user_record.id = '11111111-1111-1111-1111-111111111111' THEN
          (RANDOM() < 0.4 + (day_offset::FLOAT / 180))
        -- Mike (active): 95% consistency
        WHEN user_record.id = '22222222-2222-2222-2222-222222222222' THEN
          (RANDOM() < 0.95)
        -- Emma (recovery): 70% consistency, varies
        WHEN user_record.id = '33333333-3333-3333-3333-333333333333' THEN
          (RANDOM() < 0.70)
        -- James (elderly): 85% consistency
        WHEN user_record.id = '44444444-4444-4444-4444-444444444444' THEN
          (RANDOM() < 0.85)
        -- Lisa (busy): 50% consistency, better on weekends
        WHEN user_record.id = '55555555-5555-5555-5555-555555555555' THEN
          CASE 
            WHEN EXTRACT(DOW FROM walk_date) IN (0, 6) THEN (RANDOM() < 0.75)
            ELSE (RANDOM() < 0.40)
          END
        ELSE FALSE
      END;
      
      IF should_walk THEN
        -- Generate realistic step count (80-120% of goal)
        actual_steps := FLOOR(base_steps * (0.8 + RANDOM() * 0.4));
        
        -- Calculate duration (average 100 steps/minute)
        duration := FLOOR(actual_steps / 100.0);
        
        -- Calculate distance (average stride 0.762m)
        distance := actual_steps * 0.762;
        
        -- Random weather
        weather_temp := FLOOR(50 + RANDOM() * 40); -- 50-90°F
        weather_condition := CASE FLOOR(RANDOM() * 4)
          WHEN 0 THEN 'clear'
          WHEN 1 THEN 'clouds'
          WHEN 2 THEN 'rain'
          ELSE 'partly cloudy'
        END;

        -- Insert walk (NOTE: using average_heart_rate instead of avg_heart_rate)
        INSERT INTO public.walks (
          user_id,
          date,
          steps,
          duration_minutes,
          distance_meters,
          route_coordinates,
          start_location,
          end_location,
          elevation_gain,
          elevation_loss,
          average_pace,
          max_heart_rate,
          average_heart_rate,
          heart_rate_zones,
          weather_conditions,
          auto_detected,
          created_at
        ) VALUES (
          user_record.id,
          walk_date,
          actual_steps,
          duration,
          distance,
          -- Simplified route (5 GPS points)
          jsonb_build_array(
            jsonb_build_object('lat', 27.9506 + (RANDOM() * 0.01), 'lng', -82.4572 + (RANDOM() * 0.01), 'timestamp', NOW() - (day_offset || ' days')::INTERVAL, 'altitude', 10 + RANDOM() * 5),
            jsonb_build_object('lat', 27.9506 + (RANDOM() * 0.01), 'lng', -82.4572 + (RANDOM() * 0.01), 'timestamp', NOW() - (day_offset || ' days')::INTERVAL + INTERVAL '5 minutes', 'altitude', 12 + RANDOM() * 5),
            jsonb_build_object('lat', 27.9506 + (RANDOM() * 0.01), 'lng', -82.4572 + (RANDOM() * 0.01), 'timestamp', NOW() - (day_offset || ' days')::INTERVAL + INTERVAL '10 minutes', 'altitude', 15 + RANDOM() * 5),
            jsonb_build_object('lat', 27.9506 + (RANDOM() * 0.01), 'lng', -82.4572 + (RANDOM() * 0.01), 'timestamp', NOW() - (day_offset || ' days')::INTERVAL + INTERVAL '15 minutes', 'altitude', 13 + RANDOM() * 5),
            jsonb_build_object('lat', 27.9506 + (RANDOM() * 0.01), 'lng', -82.4572 + (RANDOM() * 0.01), 'timestamp', NOW() - (day_offset || ' days')::INTERVAL + INTERVAL '20 minutes', 'altitude', 10 + RANDOM() * 5)
          ),
          jsonb_build_object('lat', 27.9506, 'lng', -82.4572),
          jsonb_build_object('lat', 27.9506 + (RANDOM() * 0.01), 'lng', -82.4572 + (RANDOM() * 0.01)),
          ROUND((RANDOM() * 30)::NUMERIC, 1), -- elevation gain 0-30ft
          ROUND((RANDOM() * 20)::NUMERIC, 1), -- elevation loss 0-20ft
          ROUND((8 + RANDOM() * 8)::NUMERIC, 1), -- pace 8-16 min/mile
          FLOOR(120 + RANDOM() * 50), -- max HR 120-170
          FLOOR(100 + RANDOM() * 30), -- avg HR 100-130
          jsonb_build_object(
            'zone1_seconds', FLOOR(duration * 60 * 0.1),
            'zone2_seconds', FLOOR(duration * 60 * 0.3),
            'zone3_seconds', FLOOR(duration * 60 * 0.4),
            'zone4_seconds', FLOOR(duration * 60 * 0.15),
            'zone5_seconds', FLOOR(duration * 60 * 0.05)
          ),
          jsonb_build_object(
            'temperature', weather_temp,
            'feels_like', weather_temp - 2,
            'condition', weather_condition,
            'description', weather_condition || ' skies',
            'humidity', FLOOR(40 + RANDOM() * 40),
            'wind_speed', ROUND((RANDOM() * 15)::NUMERIC, 1),
            'icon', '01d'
          ),
          (RANDOM() < 0.7), -- 70% auto-detected
          NOW() - (day_offset || ' days')::INTERVAL
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the walk generation function
SELECT generate_walks();

-- Clean up the function
DROP FUNCTION generate_walks();

-- ============================================================================
-- 3. CREATE DAILY STATS (aggregated from walks)
-- ============================================================================

INSERT INTO public.daily_stats (user_id, date, total_steps, goal_met, created_at)
SELECT
  user_id,
  date,
  SUM(steps) as total_steps,
  SUM(steps) >= (SELECT daily_step_goal FROM public.profiles WHERE id = walks.user_id) as goal_met,
  MIN(created_at) as created_at
FROM public.walks
GROUP BY user_id, date;

-- ============================================================================
-- 4. CREATE STREAKS (calculated from daily_stats)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_streaks() RETURNS void AS $$
DECLARE
  user_record RECORD;
  current_streak_count INTEGER;
  longest_streak_count INTEGER;
  last_date DATE;
  streak_active BOOLEAN;
  day_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.profiles LOOP
    current_streak_count := 0;
    longest_streak_count := 0;
    last_date := NULL;
    streak_active := TRUE;

    -- Loop through all days in chronological order
    FOR day_record IN
      SELECT date, goal_met
      FROM public.daily_stats
      WHERE user_id = user_record.id
      ORDER BY date ASC
    LOOP
      IF day_record.goal_met THEN
        -- Check if this continues the streak
        IF last_date IS NULL OR day_record.date = last_date + INTERVAL '1 day' THEN
          current_streak_count := current_streak_count + 1;
          IF current_streak_count > longest_streak_count THEN
            longest_streak_count := current_streak_count;
          END IF;
        ELSE
          -- Streak broken, check if we're still in "current" territory
          IF streak_active AND day_record.date < CURRENT_DATE - INTERVAL '2 days' THEN
            streak_active := FALSE;
            current_streak_count := 0;
          END IF;
          current_streak_count := 1;
        END IF;
        last_date := day_record.date;
      ELSE
        -- Missed a day - break current streak if active
        IF streak_active THEN
          current_streak_count := 0;
          streak_active := FALSE;
        END IF;
      END IF;
    END LOOP;

    -- Update streak record (already exists from trigger)
    UPDATE public.streaks SET
      current_streak = CASE WHEN streak_active THEN current_streak_count ELSE 0 END,
      longest_streak = longest_streak_count,
      last_activity_date = last_date,
      updated_at = NOW()
    WHERE user_id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute streak calculation
SELECT calculate_streaks();

-- Clean up
DROP FUNCTION calculate_streaks();

-- ============================================================================
-- 5. CREATE BUDDY RELATIONSHIPS
-- ============================================================================

-- Sarah → Mike (accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'accepted',
  NOW() - INTERVAL '60 days'
);

-- Mike → Sarah (reciprocal, accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'accepted',
  NOW() - INTERVAL '60 days'
);

-- Sarah → James (accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '44444444-4444-4444-4444-444444444444',
  'accepted',
  NOW() - INTERVAL '45 days'
);

-- James → Sarah (reciprocal, accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'accepted',
  NOW() - INTERVAL '45 days'
);

-- Mike → Emma (accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'accepted',
  NOW() - INTERVAL '30 days'
);

-- Emma → Mike (reciprocal, accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'accepted',
  NOW() - INTERVAL '30 days'
);

-- Lisa → Mike (pending - Lisa sent request)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'pending',
  NOW() - INTERVAL '5 days'
);

-- James → Lisa (accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  'accepted',
  NOW() - INTERVAL '20 days'
);

-- Lisa → James (reciprocal, accepted)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  'accepted',
  NOW() - INTERVAL '20 days'
);

-- Emma → Sarah (pending - Emma sent request)
INSERT INTO public.buddies (user_id, buddy_id, status, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'pending',
  NOW() - INTERVAL '2 days'
);

-- ============================================================================
-- 6. CREATE ACTIVITY FEED (recent walk achievements)
-- ============================================================================

-- Sarah's recent goal achievement
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'goal_achieved',
  jsonb_build_object(
    'date', CURRENT_DATE - 1,
    'steps', 5234,
    'goal', 5000,
    'message', 'Reached my daily goal!'
  ),
  'buddies',
  NOW() - INTERVAL '1 day'
);

-- Mike's walk completed
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'walk_completed',
  jsonb_build_object(
    'date', CURRENT_DATE,
    'steps', 13567,
    'distance_miles', 6.2,
    'duration_minutes', 78,
    'message', 'Morning power walk in the park!'
  ),
  'buddies',
  NOW() - INTERVAL '3 hours'
);

-- James' streak milestone
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'streak_milestone',
  jsonb_build_object(
    'streak_days', 14,
    'milestone', '2 weeks',
    'message', 'Two weeks of consistent walking!'
  ),
  'buddies',
  NOW() - INTERVAL '2 days'
);

-- Emma's recovery milestone
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'goal_achieved',
  jsonb_build_object(
    'date', CURRENT_DATE - 3,
    'steps', 4123,
    'goal', 4000,
    'message', 'Slowly building back up! 💪'
  ),
  'buddies',
  NOW() - INTERVAL '3 days'
);

-- Lisa's walk completed
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'walk_completed',
  jsonb_build_object(
    'date', CURRENT_DATE - 1,
    'steps', 9843,
    'distance_miles', 4.5,
    'duration_minutes', 62,
    'message', 'Finally got out for an evening walk!'
  ),
  'public',
  NOW() - INTERVAL '1 day'
);

-- Mike's milestone achievement (changed from badge_earned to goal_achieved)
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'goal_achieved',
  jsonb_build_object(
    'milestone_name', '100 Miles Total',
    'milestone_description', 'Walked 100 total miles',
    'total_distance', 103.4,
    'message', 'Hit 100 miles total! 🎉'
  ),
  'buddies',
  NOW() - INTERVAL '7 days'
);

-- Sarah's consistency achievement
INSERT INTO public.activity_feed (user_id, activity_type, activity_data, visibility, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'streak_milestone',
  jsonb_build_object(
    'streak_days', 7,
    'milestone', '1 week',
    'message', 'One week strong! 🔥'
  ),
  'buddies',
  NOW() - INTERVAL '10 days'
);

-- ============================================================================
-- 7. CREATE KUDOS (reactions to activity feed)
-- ============================================================================

-- Get activity feed IDs (we'll need to query them)
DO $$
DECLARE
  sarah_goal_id UUID;
  mike_walk_id UUID;
  james_streak_id UUID;
  emma_goal_id UUID;
  lisa_walk_id UUID;
BEGIN
  -- Find Sarah's goal achievement
  SELECT id INTO sarah_goal_id
  FROM public.activity_feed
  WHERE user_id = '11111111-1111-1111-1111-111111111111'
    AND activity_type = 'goal_achieved'
  LIMIT 1;

  -- Find Mike's recent walk
  SELECT id INTO mike_walk_id
  FROM public.activity_feed
  WHERE user_id = '22222222-2222-2222-2222-222222222222'
    AND activity_type = 'walk_completed'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Find James' streak
  SELECT id INTO james_streak_id
  FROM public.activity_feed
  WHERE user_id = '44444444-4444-4444-4444-444444444444'
    AND activity_type = 'streak_milestone'
  LIMIT 1;

  -- Find Emma's goal
  SELECT id INTO emma_goal_id
  FROM public.activity_feed
  WHERE user_id = '33333333-3333-3333-3333-333333333333'
    AND activity_type = 'goal_achieved'
  LIMIT 1;

  -- Find Lisa's walk
  SELECT id INTO lisa_walk_id
  FROM public.activity_feed
  WHERE user_id = '55555555-5555-5555-5555-555555555555'
    AND activity_type = 'walk_completed'
  LIMIT 1;

  -- Mike gives kudos to Sarah's goal
  IF sarah_goal_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (sarah_goal_id, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day');
  END IF;

  -- James gives kudos to Sarah's goal
  IF sarah_goal_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (sarah_goal_id, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '23 hours');
  END IF;

  -- Sarah gives kudos to Mike's walk
  IF mike_walk_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (mike_walk_id, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours');
  END IF;

  -- Emma gives kudos to Mike's walk
  IF mike_walk_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (mike_walk_id, '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 hours');
  END IF;

  -- Sarah gives kudos to James' streak
  IF james_streak_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (james_streak_id, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days');
  END IF;

  -- Lisa gives kudos to James' streak
  IF james_streak_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (james_streak_id, '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days');
  END IF;

  -- Mike gives kudos to Emma's goal
  IF emma_goal_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (emma_goal_id, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 days');
  END IF;

  -- James gives kudos to Lisa's walk
  IF lisa_walk_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (lisa_walk_id, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day');
  END IF;

  -- Mike gives kudos to Lisa's walk
  IF lisa_walk_id IS NOT NULL THEN
    INSERT INTO public.kudos (activity_id, user_id, created_at)
    VALUES (lisa_walk_id, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '20 hours');
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check user count
SELECT COUNT(*) as user_count FROM public.profiles;

-- Check walks per user
SELECT
  p.display_name,
  COUNT(w.id) as walk_count,
  ROUND(AVG(w.steps)::numeric, 0) as avg_steps
FROM public.profiles p
LEFT JOIN public.walks w ON p.id = w.user_id
GROUP BY p.id, p.display_name
ORDER BY p.display_name;

-- Check streaks
SELECT
  p.display_name,
  s.current_streak,
  s.longest_streak,
  s.last_activity_date
FROM public.profiles p
JOIN public.streaks s ON p.id = s.user_id
ORDER BY p.display_name;

-- Check buddy relationships
SELECT
  p1.display_name as user_name,
  p2.display_name as buddy_name,
  b.status
FROM public.buddies b
JOIN public.profiles p1 ON b.user_id = p1.id
JOIN public.profiles p2 ON b.buddy_id = p2.id
ORDER BY b.status, p1.display_name;

-- Check activity feed
SELECT
  p.display_name,
  af.activity_type,
  af.created_at,
  COUNT(k.id) as kudos_count
FROM public.activity_feed af
JOIN public.profiles p ON af.user_id = p.id
LEFT JOIN public.kudos k ON af.id = k.activity_id
GROUP BY af.id, p.display_name, af.activity_type, af.created_at
ORDER BY af.created_at DESC;

-- Check total data counts
SELECT
  'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'walks', COUNT(*) FROM public.walks
UNION ALL
SELECT 'daily_stats', COUNT(*) FROM public.daily_stats
UNION ALL
SELECT 'streaks', COUNT(*) FROM public.streaks
UNION ALL
SELECT 'buddies', COUNT(*) FROM public.buddies
UNION ALL
SELECT 'activity_feed', COUNT(*) FROM public.activity_feed
UNION ALL
SELECT 'kudos', COUNT(*) FROM public.kudos;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Your database is now fully seeded with:
-- - 5 diverse users with complete profiles
-- - ~270-360 walks (90 days × 5 users × 60-80% consistency)
-- - Daily aggregated statistics for all walks
-- - Current and longest streaks for each user
-- - 9 buddy relationships (7 accepted, 2 pending)
-- - 7 activity feed posts
-- - 9 kudos reactions
-- - All walks include: GPS routes, elevation, heart rate, weather, pace
-- - All optional fields populated with realistic data
-- ============================================================================

