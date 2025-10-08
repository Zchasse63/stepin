-- Stepin MVP Database Schema
-- Execute this complete script in your Supabase SQL editor
-- This creates all tables, policies, functions, and indexes needed for the MVP

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific user data
-- ============================================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  daily_step_goal integer default 7000,
  units_preference text default 'miles' check (units_preference in ('miles', 'kilometers')),
  theme_preference text default 'system' check (theme_preference in ('light', 'dark', 'system')),
  notification_settings jsonb default '{"dailyReminder": false, "streakReminder": false, "goalCelebration": false, "reminderTime": "09:00"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================================
-- WALKS TABLE
-- Stores individual walk records logged by users
-- ============================================================================

create table public.walks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  steps integer not null check (steps >= 0 and steps <= 200000),
  duration_minutes integer check (duration_minutes >= 0),
  distance_meters numeric(10,2) check (distance_meters >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.walks enable row level security;

-- Walks policies
create policy "Users can view own walks"
  on public.walks for select
  using (auth.uid() = user_id);

create policy "Users can insert own walks"
  on public.walks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own walks"
  on public.walks for update
  using (auth.uid() = user_id);

create policy "Users can delete own walks"
  on public.walks for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- DAILY STATS TABLE
-- Aggregated daily statistics for performance optimization
-- ============================================================================

create table public.daily_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  total_steps integer default 0,
  goal_met boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.daily_stats enable row level security;

create policy "Users can view own stats"
  on public.daily_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.daily_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.daily_stats for update
  using (auth.uid() = user_id);

-- ============================================================================
-- STREAKS TABLE
-- Tracks user walking streaks (current and longest)
-- ============================================================================

create table public.streaks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.streaks enable row level security;

create policy "Users can view own streak"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "Users can update own streak"
  on public.streaks for update
  using (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- Database functions for automated operations
-- ============================================================================

-- Function to handle new user creation
-- Automatically creates profile and streak records when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  
  insert into public.streaks (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update streak
-- Calculates and updates user's current and longest streak
-- Call this function whenever a user logs activity
create or replace function public.update_streak(user_uuid uuid, activity_date date)
returns void as $$
declare
  current_record record;
  days_diff integer;
begin
  select * into current_record from public.streaks where user_id = user_uuid;
  
  if current_record.last_activity_date is null then
    -- First activity ever
    update public.streaks
    set current_streak = 1,
        longest_streak = 1,
        last_activity_date = activity_date,
        updated_at = now()
    where user_id = user_uuid;
  else
    days_diff := activity_date - current_record.last_activity_date;
    
    if days_diff = 0 then
      -- Same day, no change
      return;
    elsif days_diff = 1 then
      -- Consecutive day, increment streak
      update public.streaks
      set current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          last_activity_date = activity_date,
          updated_at = now()
      where user_id = user_uuid;
    else
      -- Streak broken, reset to 1
      update public.streaks
      set current_streak = 1,
          longest_streak = greatest(longest_streak, current_record.current_streak),
          last_activity_date = activity_date,
          updated_at = now()
      where user_id = user_uuid;
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- INDEXES
-- Performance optimization for common queries
-- ============================================================================

create index walks_user_date_idx on public.walks(user_id, date desc);
create index daily_stats_user_date_idx on public.daily_stats(user_id, date desc);

-- ============================================================================
-- USAGE NOTES
-- ============================================================================

-- To call the update_streak function from your app:
-- SELECT update_streak('user-uuid-here', '2024-01-15');

-- The handle_new_user function runs automatically on signup via trigger

-- All tables have Row Level Security (RLS) enabled
-- Users can only access their own data
-- Supabase auth handles user authentication

-- ============================================================================
-- STORAGE BUCKETS
-- For storing user-uploaded files (avatars, etc.)
-- ============================================================================

-- Create avatars bucket for profile pictures
-- Note: This must be created via Supabase Dashboard or Storage API
-- Go to: Storage > Create Bucket
-- Bucket name: avatars
-- Public bucket: Yes (for public avatar URLs)
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policies for avatars bucket
-- These can be created via SQL after bucket exists:

-- Policy: Anyone can view avatars (public read)
-- create policy "Public avatar access"
--   on storage.objects for select
--   using (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
-- create policy "Users can upload own avatar"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy: Users can update their own avatar
-- create policy "Users can update own avatar"
--   on storage.objects for update
--   using (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Policy: Users can delete their own avatar
-- create policy "Users can delete own avatar"
--   on storage.objects for delete
--   using (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Avatar file naming convention: {user_id}/avatar.{ext}
-- Example: 123e4567-e89b-12d3-a456-426614174000/avatar.jpg

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

