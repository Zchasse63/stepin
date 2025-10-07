# Phase 1: Foundation & Authentication (Week 1)

[← Back to README](README.md) | [Next: Phase 2 - Core Step Tracking →](phase-2-step-tracking.md)

---

## Overview

This phase establishes the foundational architecture for Stepin, including project setup, database configuration, and user authentication. By the end of this phase, users should be able to sign up, sign in, and complete onboarding.

**Timeline**: Week 1  
**Dependencies**: None (starting point)

---

## 1.1 Project Setup

### Augment Code Prompt

```
Create a new React Native project called "Stepin" using Expo SDK 52 with the following configuration:

- Use TypeScript with strict mode enabled
- Initialize with Expo Router for file-based navigation
- Configure for React Native 0.81+ with New Architecture enabled
- Install and configure:
  - @supabase/supabase-js for backend
  - zustand for state management
  - expo-secure-store for secure token storage
  - react-native-reanimated for animations
  - @expo/vector-icons for iconography

Project structure:
/app - Expo Router navigation
  /(auth) - Auth flow group
    sign-in.tsx
    sign-up.tsx
    onboarding.tsx
  /(tabs) - Main app tabs
    index.tsx (Today)
    history.tsx
    profile.tsx
  _layout.tsx - Root layout
/components - Reusable components
/lib - Utilities and services
  /supabase - Supabase client and helpers
  /store - Zustand stores
/constants - App constants and theme
/types - TypeScript types

Use SF Pro (iOS system font) and follow iOS Human Interface Guidelines for visual design.
```

---

## 1.2 Supabase Setup

### Database Schema

Execute the following SQL in your Supabase SQL editor to set up the complete database structure:

**Note**: The complete SQL schema is available in [`database-schema.sql`](database-schema.sql) for easy reference and execution.

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  daily_step_goal integer default 7000,
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

-- Walks table
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

-- Daily stats table (aggregated view for performance)
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

-- Streaks table
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

-- Function to handle new user creation
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

-- Indexes for performance
create index walks_user_date_idx on public.walks(user_id, date desc);
create index daily_stats_user_date_idx on public.daily_stats(user_id, date desc);
```

---

## 1.3 Authentication Implementation

### Augment Code Prompt

```
Implement authentication flow for Stepin using Supabase Auth with the following requirements:

1. Create /lib/supabase/client.ts:
   - Initialize Supabase client with URL and anon key from environment variables
   - Use expo-secure-store for session persistence
   - Export typed Supabase client

2. Create /lib/store/authStore.ts using Zustand:
   - Store: user, session, loading, error
   - Actions: signIn(email, password), signUp(email, password, displayName), signOut(), checkSession()
   - Integrate with Supabase auth
   - Persist authentication state

3. Create authentication screens in /app/(auth):
   
   sign-in.tsx:
   - Email and password inputs with validation
   - "Sign In" button (disabled during loading)
   - "Don't have an account? Sign up" link
   - Forgot password link (link to Supabase reset email)
   - Error message display
   - Auto-navigate to /(tabs) on successful sign in

   sign-up.tsx:
   - Display name, email, and password inputs
   - Password confirmation field
   - "Create Account" button (disabled during loading)
   - "Already have an account? Sign in" link
   - Validation: email format, password min 8 chars, passwords match
   - Navigate to onboarding on successful signup

   onboarding.tsx:
   - Welcome screen with app mission statement
   - Daily step goal selector (2,000 - 15,000 steps, default 7,000)
   - "Start Walking" button that saves goal and navigates to /(tabs)

4. Create /app/_layout.tsx root layout:
   - Check authentication state on mount
   - Show splash screen while checking
   - Redirect to /(auth) if not authenticated
   - Redirect to /(tabs) if authenticated

Design: Clean, minimal iOS style. Use system fonts. Soft colors (greens for health, blues for calm). Large tap targets (min 44x44pt).
```

---

## Acceptance Criteria

- [ ] User can sign up with email/password
- [ ] User can sign in with existing credentials
- [ ] Authentication persists across app restarts
- [ ] Onboarding only shows once per user
- [ ] Navigation guards work correctly
- [ ] Database schema is properly configured in Supabase
- [ ] All RLS policies are active and working
- [ ] New user trigger creates profile and streak records

---

[← Back to README](README.md) | [Next: Phase 2 - Core Step Tracking →](phase-2-step-tracking.md)

