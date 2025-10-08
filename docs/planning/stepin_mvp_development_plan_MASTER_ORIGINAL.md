# Stepin MVP Development Plan: Complete Technical Specification

## Executive Summary

**Goal**: Ship a functional, non-competitive wellness walking app MVP in 6-8 weeks using Supabase, validating product-market fit before adding PowerSync offline-first capabilities.

**Core Value Proposition**: The only walking app that celebrates 2,000 steps as much as 10,000 steps, with zero competitive pressure and grandmother-friendly simplicity.

**Technical Stack**:
- React Native 0.81.4 with New Architecture
- Expo SDK 52+ with Expo Router
- Supabase (Auth + Postgres + Realtime)
- Zustand for state management
- @kingstinct/react-native-healthkit (iOS) + react-native-health-connect (Android)
- Expo Location for basic walk tracking
- React Native Reanimated for animations

**Success Metrics for MVP**:
- 100 users actively logging walks weekly
- Average 4+ walks logged per user
- 60%+ day-7 retention
- Positive qualitative feedback about non-competitive approach

---

## Phase 1: Foundation & Authentication (Week 1)

### 1.1 Project Setup

**Augment Code Prompt**:
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

### 1.2 Supabase Setup

**Database Schema** (execute in Supabase SQL editor):

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

### 1.3 Authentication Implementation

**Augment Code Prompt**:
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

**Acceptance Criteria**:
- User can sign up with email/password
- User can sign in with existing credentials
- Authentication persists across app restarts
- Onboarding only shows once per user
- Navigation guards work correctly

---

## Phase 2: Core Step Tracking (Week 2)

### 2.1 Health Data Integration

**Augment Code Prompt**:
```
Implement health data integration for iOS (HealthKit) and Android (Health Connect):

1. Install dependencies:
   - @kingstinct/react-native-healthkit (iOS)
   - react-native-health-connect (Android)
   - expo-device for platform detection

2. Create /lib/health/healthService.ts:
   - Abstract class for health operations
   - Methods:
     - requestPermissions(): Promise<boolean>
     - getTodaySteps(): Promise<number>
     - getStepsForDate(date: Date): Promise<number>
     - getStepsForDateRange(startDate: Date, endDate: Date): Promise<Array<{date: Date, steps: number}>>
   - Platform-specific implementations
   - Error handling with user-friendly messages

3. Create /lib/health/HealthKitService.ts (iOS):
   - Import @kingstinct/react-native-healthkit
   - Request read permissions for stepCount
   - Query HealthKit for step data
   - Handle authorization status

4. Create /lib/health/HealthConnectService.ts (Android):
   - Import react-native-health-connect
   - Check Health Connect availability
   - Request permissions for STEPS
   - Query Health Connect for step data
   - Handle Google Play approval requirements gracefully

5. Create /lib/store/healthStore.ts using Zustand:
   - Store: todaySteps, permissionsGranted, loading, lastSynced
   - Actions: requestPermissions(), syncTodaySteps(), syncHistoricalData()
   - Persist permissions state

Design considerations:
- Graceful degradation if health permissions denied
- Clear permission request screens explaining why data is needed
- Manual step entry fallback
- Sync indicator while fetching data

Error handling:
- iOS: Handle "not available" (simulator), "denied", "authorized"
- Android: Handle Health Connect not installed, permissions denied
- Show helpful error messages: "To track your steps automatically, please grant access to [HealthKit/Health Connect] in Settings."
```

### 2.2 Today Screen (Primary Interface)

**Augment Code Prompt**:
```
Create the Today screen (/app/(tabs)/index.tsx) - the main interface of Stepin:

Design Philosophy:
- Grandmother-friendly: Large text, clear hierarchy, minimal complexity
- Celebration-focused: Positive reinforcement for ANY progress
- No comparison: Never show other users' data or competitive elements

Layout (from top to bottom):

1. Header:
   - Date (large, friendly: "Sunday, January 14")
   - Greeting based on time of day: "Good morning!" / "Good afternoon!" / "Good evening!"

2. Step Count Card (hero element):
   - LARGE number showing today's steps (80pt+ font)
   - Animated circular progress ring showing progress toward goal
   - Color coding:
     * 0-25%: Soft gray
     * 25-50%: Light green
     * 50-75%: Medium green
     * 75-100%: Vibrant green
     * 100%+: Celebration gold with confetti animation
   - Subtext: "of your 7,000 step goal"
   - Sync button (small icon) to manually refresh from HealthKit/Health Connect

3. Encouraging Message:
   - Dynamic message based on progress:
     * 0 steps: "Ready for a walk?"
     * 1-1000: "Every step counts! 🌱"
     * 1000-3000: "You're off to a great start!"
     * 3000-5000: "Look at you go! 🎉"
     * 5000-goal-500: "You're so close!"
     * Goal met: "Goal complete! Fantastic! ⭐"
     * 150%+ goal: "You're unstoppable today! 🔥"
   - Never pressure or use guilt

4. Quick Stats Row:
   - Three small cards side-by-side:
     * Duration: "42 minutes"
     * Distance: "2.1 miles" (or km based on locale)
     * Calories: "~156 cal" (rough estimate)

5. Streak Card:
   - Current streak: "🔥 5 day streak"
   - Longest streak: "Best: 12 days"
   - Subtle, not pressuring

6. "Log a Walk" Button (prominent):
   - Opens modal to manually log a walk
   - Large, friendly, inviting button
   - Subtext: "Didn't wear your phone? Add it manually"

Components to create:

/components/StepCircle.tsx:
- Animated circular progress component
- Use react-native-reanimated for smooth animation
- Props: steps (number), goal (number), size (number)
- Animates on value change

/components/StatsCard.tsx:
- Reusable card for displaying stat
- Props: icon, label, value, subtitle (optional)

/components/StreakDisplay.tsx:
- Shows current and longest streak
- Flame emoji for current streak
- Trophy emoji for longest streak

/components/LogWalkModal.tsx:
- Bottom sheet modal
- Inputs: Steps (number), Duration (minutes), Date (date picker, default today)
- Save button that adds walk to Supabase
- Cancel button

Logic:
- On mount: check health permissions
- If granted: fetch today's steps from HealthKit/Health Connect
- If denied: show banner prompting to grant or log manually
- Refresh data every time app foregrounds
- Animate step count when it updates
- Save daily stats to Supabase daily_stats table
- Update streak using update_streak function
- Show loading skeleton while fetching

Interactions:
- Pull to refresh
- Tap step count to see breakdown by hour (nice to have)
- Tap streak to see streak history (future feature)
- Swipe down to dismiss any modal

Accessibility:
- All interactive elements 44x44pt minimum
- VoiceOver labels on all elements
- Dynamic Type support
- High contrast mode support

Animations:
- Step count increments smoothly when data loads
- Confetti burst when goal reached (use react-native-confetti-cannon)
- Gentle pulse on encouraging message
- All animations respect reduced motion settings
```

**Acceptance Criteria**:
- Today screen displays current step count from HealthKit/Health Connect
- Progress ring animates smoothly
- Encouraging messages update based on progress
- Manual walk logging works and updates display immediately
- Streak calculations are accurate
- All data syncs to Supabase correctly
- Screen is responsive and fast (<100ms interactions)

---

## Phase 3: History & Progress Tracking (Week 3)

### 3.1 History Screen

**Augment Code Prompt**:
```
Create the History screen (/app/(tabs)/history.tsx) for viewing past walks and progress:

Layout:

1. Header:
   - Title: "Your Walking Journey"
   - Time period selector: Week / Month / Year tabs

2. Summary Stats (top section):
   - Total steps this period
   - Total walks logged
   - Average steps per day
   - Days goal was met (count + percentage)
   - Display as clean card grid

3. Calendar Heat Map (Week view):
   - 7 days showing as circles with color intensity based on steps
   - Today highlighted
   - Tap date to see details

4. Bar Chart (Month/Year view):
   - Daily step counts as bars
   - Horizontal line showing goal
   - Bars colored based on goal achievement
   - Interactive: tap bar to see day details

5. Walks List (scrollable):
   - Chronological list of logged walks
   - Each item shows:
     * Date and time
     * Step count
     * Duration and distance
     * Small badge if goal was met that day
   - Swipe to delete walk
   - Tap to see full walk details

Components to create:

/components/CalendarHeatMap.tsx:
- 7-day scrollable calendar
- Each day is a circle with color intensity
- Legend: light gray (0%), light green (25%), medium green (50%), dark green (75%), gold (100%+)
- Tap handler for date selection

/components/StepsBarChart.tsx:
- Bar chart using react-native-svg
- Bars for each day in period
- Y-axis: steps (auto-scaled)
- X-axis: dates (abbreviated)
- Goal line overlay
- Touch handler for bar selection

/components/WalkListItem.tsx:
- List item component for walk display
- Left: Date circle indicator
- Center: Steps, duration, distance
- Right: Badge if goal met
- Swipeable using react-native-gesture-handler

/components/WalkDetailsSheet.tsx:
- Bottom sheet showing walk details
- All walk metadata
- Edit button (navigate to edit screen)
- Delete button with confirmation

Data fetching:
- On mount: fetch walks from Supabase for selected period
- Use React Query for caching and efficient fetching
- Paginate walks list (20 per page)
- Refresh on pull-to-refresh

Calculations:
- Aggregate stats from walks array
- Calculate streaks from daily_stats
- Cache calculations for performance

Empty states:
- No walks yet: Friendly illustration + "Start your first walk today!"
- No walks this period: "No walks this [week/month/year]. Check another time period."

Loading states:
- Skeleton screens for charts while loading
- Shimmer effect on list items

Accessibility:
- Chart data announced by screen reader
- Alternative text descriptions for visual data
```

### 3.2 Progress Insights

**Augment Code Prompt**:
```
Add insights section to History screen that provides encouraging analysis:

Create /components/InsightsCard.tsx:
- Container for insight
- Icon (checkmark, trend-up, flame, etc.)
- Title (bold, concise)
- Description (1-2 sentences)
- Appears above walks list

Generate insights based on data:

1. Positive reinforcement (always show at least one):
   - "You've walked [X] days this week!"
   - "Your longest streak was [X] days!"
   - "You've taken over [X] steps this month!"
   - "You're [X]% more active than last week!"

2. Gentle nudges (optional, only if supportive):
   - "You're close to a [X] day streak. Keep it up!"
   - "Just [X] more steps to beat your record!"
   - Never negative: no "You missed X days" or "You're behind"

3. Milestones:
   - "🎉 You've logged 10 walks!"
   - "🏆 You reached your goal 7 days in a row!"
   - "⭐ You've walked 100,000 total steps!"

Logic:
- Calculate insights from walks and stats data
- Prioritize most encouraging insights
- Limit to 2-3 insights at a time
- Rotate insights weekly to stay fresh

Design:
- Cards with subtle background colors
- Icons from @expo/vector-icons
- Tap insight to see more details (optional)
```

**Acceptance Criteria**:
- History screen shows accurate walk data
- Charts render correctly for week/month/year
- Calendar heat map is interactive and accurate
- Walks list is performant with 100+ walks
- Insights are encouraging and never negative
- Swipe to delete works smoothly
- All data comes from Supabase

---

## Phase 4: Profile & Settings (Week 4)

### 4.1 Profile Screen

**Augment Code Prompt**:
```
Create the Profile screen (/app/(tabs)/profile.tsx) for user settings and personalization:

Layout:

1. Header:
   - Profile avatar (initials or uploaded image)
   - Display name (editable)
   - Email (read-only)
   - "Edit Profile" button

2. Your Stats Summary:
   - Total steps all time
   - Total walks logged
   - Member since date
   - Current streak
   - Display as clean stat grid

3. Settings Sections:

   Goals:
   - Daily step goal (editable)
   - Slider: 2,000 - 20,000 steps
   - Shows recommendation: "Most people start with 5,000-7,000"
   - Save button

   Preferences:
   - Units (Miles / Kilometers)
   - App theme (Light / Dark / System)
   - Notifications (toggle switches):
     * Daily reminder
     * Streak reminder
     * Goal celebration
   - Reminder time picker (if enabled)

   Privacy:
   - HealthKit/Health Connect permissions status
   - Button to open system settings if denied
   - Data export (download all data as JSON)
   - Delete account (with confirmation)

   Support:
   - FAQs link
   - Contact support (email)
   - Privacy policy link
   - Terms of service link

   About:
   - App version
   - Credits

4. Sign Out Button:
   - Bottom of screen
   - Confirmation dialog
   - Clears local data and returns to auth

Components to create:

/components/ProfileHeader.tsx:
- Avatar component (circle with initials or image)
- Name and email display
- Edit button

/components/SettingsSection.tsx:
- Section container with title
- Grouped list of settings items

/components/SettingRow.tsx:
- Individual setting row
- Left: icon + label
- Right: value/toggle/chevron
- Tap handler
- Different variants: toggle, disclosure, action

/components/GoalSlider.tsx:
- Slider for setting daily goal
- Shows current value prominently
- Saves to Supabase on change
- Haptic feedback on value change

/screens/EditProfileScreen.tsx:
- Modal screen for editing profile
- Name input
- Avatar picker (using expo-image-picker)
- Save and cancel buttons

Data:
- Fetch profile from Supabase on mount
- Update profile in Supabase on changes
- Store preferences locally with Zustand
- Sync preferences to Supabase profile table

Design:
- iOS Settings app style
- Grouped lists with section headers
- System colors and fonts
- Subtle dividers
- Proper spacing

Interactions:
- Tap rows to edit/navigate
- Toggles provide immediate feedback
- Sliders show live preview
- Confirmations for destructive actions
```

### 4.2 Notifications Setup

**Augment Code Prompt**:
```
Implement local notifications for Stepin using expo-notifications:

Create /lib/notifications/notificationService.ts:

1. Setup:
   - Request notification permissions on first app launch
   - Configure notification handler
   - Schedule notifications based on user preferences

2. Notification types:

   Daily Reminder:
   - Title: "Time for a walk? 🌤️"
   - Body: "Your daily steps are waiting. Every step counts!"
   - Schedule: User-selected time (default 9:00 AM)
   - Frequency: Daily
   - Cancellable if user disables

   Streak Reminder:
   - Title: "Keep your streak alive! 🔥"
   - Body: "You haven't logged steps today. A short walk counts!"
   - Schedule: 7:00 PM if no steps logged yet
   - Frequency: Daily (conditional)

   Goal Celebration:
   - Title: "Goal completed! 🎉"
   - Body: "You reached your daily step goal. Well done!"
   - Trigger: When daily steps reach goal
   - Frequency: Once per day

3. Methods:
   - scheduleReminder(type, time): Schedules notification
   - cancelReminder(type): Cancels scheduled notification
   - sendImmediateNotification(title, body): Sends now
   - updateSchedule(): Updates all based on settings

4. Integration:
   - Check preferences from profile settings
   - Schedule/cancel based on toggle states
   - Update schedule when time changes
   - Cancel all on sign out

Privacy:
- All notifications are local (no push server)
- No data leaves device
- User controls all notification settings

Implementation:
- Use expo-notifications
- Store notification IDs in Zustand
- Respect system notification settings
- Handle "Do Not Disturb" mode gracefully
```

**Acceptance Criteria**:
- Profile screen shows accurate user data
- Goal slider updates correctly
- Settings persist across app restarts
- Notifications schedule correctly based on settings
- Edit profile updates Supabase
- Sign out clears session and returns to auth

---

## Phase 5: Polish & Testing (Weeks 5-6)

### 5.1 Animation & Delight

**Augment Code Prompt**:
```
Add polish animations and micro-interactions throughout Stepin:

1. Goal Celebration:
   - When user reaches daily goal:
     * Confetti burst animation (react-native-confetti-cannon)
     * Haptic feedback (Heavy impact)
     * Scale animation on step count
     * Success sound (optional, user preference)
   - Show celebration modal:
     * "Goal Complete! 🎉"
     * Friendly message
     * Share button (optional)
     * Dismiss button

2. Streak Milestone:
   - Every 7 days of streak:
     * Flame icon pulse animation
     * Congratulations badge appears
     * Gentle haptic
   - Show milestone modal:
     * "7 Day Streak! 🔥"
     * Encouraging message
     * Continue button

3. Tab Bar:
   - Active tab scales slightly
   - Icon morphs with smooth transition
   - Haptic on tab change (Light impact)

4. Pull to Refresh:
   - Custom refresh animation
   - Step counter rotates while refreshing
   - Success haptic when complete

5. List Interactions:
   - Walk items slide in on mount (stagger animation)
   - Press animation on tap (scale down slightly)
   - Smooth swipe-to-delete with confirmation

6. Loading States:
   - Skeleton screens with shimmer effect
   - Never show blank screens
   - Progress indicators for long operations

7. Micro-interactions:
   - Button press: scale down 0.95
   - Toggle switches: smooth transition
   - Input focus: subtle glow
   - Modal appear/dismiss: slide up/down with fade

Implementation:
- Use react-native-reanimated for performant animations
- Use expo-haptics for tactile feedback
- Respect reduced motion accessibility setting
- All animations 60fps
- Keep animations subtle and purposeful

Create /lib/animations/celebrationAnimations.ts:
- reusable animation functions
- configurable parameters
- respects user preferences
```

### 5.2 Error Handling & Edge Cases

**Augment Code Prompt**:
```
Implement comprehensive error handling and edge cases:

1. Network Errors:
   - Offline state banner: "You're offline. Data will sync when connected."
   - Retry mechanism for failed Supabase calls
   - Queue writes for when connection returns
   - Show last sync time

2. Health Data Errors:
   - Permissions denied: Clear explanation + link to settings
   - HealthKit unavailable: Offer manual entry
   - Health Connect not installed: Show install instructions
   - Sync failures: Retry button + error message

3. Validation:
   - Step count: 0-200,000 (reject obvious errors)
   - Duration: 0-1440 minutes (24 hours max)
   - Date: Cannot be future date
   - Show inline error messages

4. Empty States:
   - No walks yet: Friendly illustration + call-to-action
   - No internet: Helpful message + retry button
   - No permissions: Explanation + grant button

5. Edge Cases:
   - Same walk logged twice: Warn user before creating duplicate
   - Very large step counts: Confirm before saving
   - Goal set too low: Gentle warning ("Most people aim higher")
   - Streak broken: Supportive message ("Start a new streak today!")

6. Error Boundaries:
   - App-level error boundary
   - Screen-level error boundaries
   - Graceful fallback UI
   - Error reporting (Sentry optional)

Create /components/ErrorBoundary.tsx:
- Catches render errors
- Shows friendly error screen
- "Try Again" button
- Option to report issue

Create /components/OfflineBanner.tsx:
- Appears at top when offline
- Dismissible
- Shows reconnection status

Create /lib/utils/errorMessages.ts:
- Map error codes to user-friendly messages
- Multi-language ready (for future)
```

### 5.3 Onboarding Improvements

**Augment Code Prompt**:
```
Enhance onboarding flow to set proper expectations and request permissions gracefully:

Create multi-step onboarding in /app/(auth)/onboarding.tsx:

Step 1 - Welcome:
- App name and logo
- Mission statement: "Celebrate every step, at your own pace"
- Key value props:
  * No competition or comparison
  * Your progress, your way
  * Simple and encouraging
- "Get Started" button

Step 2 - How It Works:
- 3 simple illustrations:
  1. "Track your steps automatically"
  2. "Set your personal goal"
  3. "Celebrate your progress"
- "Next" button

Step 3 - Goal Setting:
- "What's your daily step goal?"
- Slider (2,000 - 20,000)
- Suggestions:
  * "Starting out: 3,000-5,000 steps"
  * "Active: 7,000-10,000 steps"
  * "Very active: 10,000+ steps"
- "Remember: you can change this anytime"
- "Next" button

Step 4 - Health Permissions:
- "To track your steps automatically"
- Clear explanation why permission needed
- What data is accessed (just step count)
- What data is NOT accessed (emphasize privacy)
- "Grant Permission" button
- "Skip for now" option (allows manual entry)

Step 5 - Notifications (Optional):
- "Stay motivated with gentle reminders"
- Toggle for each notification type with description
- "All reminders are supportive, never pushy"
- "Enable Notifications" button
- "Skip" option

Step 6 - Ready:
- "You're all set! 🎉"
- Summary of setup
- "Start Walking" button

Implementation:
- Use horizontal paginated FlatList for steps
- Progress dots at bottom
- Back button (except on first step)
- Skip button on optional steps
- Save choices to Supabase profile
- Set onboarding_completed flag

Design:
- Full-screen steps
- Large, friendly illustrations
- Generous whitespace
- Easy-to-tap buttons
- System fonts and colors
```

**Acceptance Criteria**:
- Onboarding explains app value clearly
- Permission requests are well-explained
- Users can skip optional steps
- Choices save to profile
- Flow is smooth and encouraging
- Works on both iOS and Android

### 5.4 Testing Checklist

**Manual Testing Checklist**:

Authentication:
- [ ] Sign up with new email
- [ ] Sign in with existing account
- [ ] Sign out and sign back in
- [ ] Password validation works
- [ ] Error messages show for invalid inputs
- [ ] Auth state persists across app restart

Health Integration:
- [ ] iOS: HealthKit permission request shows
- [ ] iOS: Steps sync from HealthKit correctly
- [ ] Android: Health Connect permission request shows
- [ ] Android: Steps sync from Health Connect correctly
- [ ] Handles permission denial gracefully
- [ ] Manual step entry works as fallback

Today Screen:
- [ ] Step count displays correctly
- [ ] Progress ring animates smoothly
- [ ] Encouraging messages update appropriately
- [ ] Stats calculate correctly
- [ ] Streak displays accurately
- [ ] Manual walk logging works
- [ ] Goal celebration triggers at right time
- [ ] Pull to refresh works
- [ ] Offline state handles gracefully

History Screen:
- [ ] Walks list loads correctly
- [ ] Pagination works for 50+ walks
- [ ] Charts render for all time periods
- [ ] Calendar heat map is interactive
- [ ] Stats calculations are accurate
- [ ] Swipe to delete works
- [ ] Walk details sheet displays correctly
- [ ] Empty states show appropriately

Profile Screen:
- [ ] Profile loads correctly
- [ ] Name edits save to Supabase
- [ ] Goal slider updates profile
- [ ] Preference toggles work
- [ ] Notification settings apply correctly
- [ ] Sign out returns to auth screen

Performance:
- [ ] App loads in <2 seconds
- [ ] Interactions respond in <100ms
- [ ] Animations run at 60fps
- [ ] No memory leaks after 30 min use
- [ ] Battery drain is reasonable (<5%/hour when tracking)

Cross-platform:
- [ ] All features work on iOS
- [ ] All features work on Android
- [ ] UI looks correct on small phones (iPhone SE)
- [ ] UI looks correct on large phones (iPhone Pro Max)
- [ ] UI looks correct on Android phones

Edge Cases:
- [ ] Works offline (shows banner, queues writes)
- [ ] Handles no health permissions
- [ ] Handles very large step counts
- [ ] Handles date changes (midnight rollover)
- [ ] Handles app backgrounding during walk
- [ ] Handles streaks correctly on DST change

Accessibility:
- [ ] VoiceOver works on iOS
- [ ] TalkBack works on Android
- [ ] Dynamic Type support works
- [ ] All buttons are 44x44pt minimum
- [ ] Color contrast passes WCAG AA
- [ ] Animations respect reduced motion

---

## Phase 6: MVP Launch Prep (Week 7-8)

### 6.1 App Store Preparation

**Augment Code Prompt**:
```
Prepare Stepin for App Store and Google Play submission:

1. App Configuration:

Update app.json:
- Set final app name: "Stepin"
- Set bundle identifier: "com.stepin.app"
- Set version: "1.0.0"
- Set build number: "1"
- Configure app icon (1024x1024)
- Configure splash screen
- Set orientation: portrait only
- Set background modes: location (if needed)
- Set required permissions with descriptions

iOS Info.plist additions:
- NSHealthShareUsageDescription: "Stepin uses your step count to track your daily walking activity and celebrate your progress."
- NSHealthUpdateUsageDescription: "Stepin does not write any data to HealthKit."
- NSLocationWhenInUseUsageDescription: "Stepin uses your location to calculate distance walked (optional)."
- UIBackgroundModes: ["location"] (if using background tracking)

Android AndroidManifest.xml additions:
- ACTIVITY_RECOGNITION permission
- Health Connect permission
- Foreground service permission (if using)
- Clear permission rationales

2. App Store Assets:

Create /assets/store:
- App icon (1024x1024, no alpha)
- Screenshots (all required sizes):
  * 6.7" iPhone (1290x2796) - 3 screenshots minimum
  * 5.5" iPhone (1242x2208)
  * 12.9" iPad (2048x2732) - if supporting iPad
- Android screenshots:
  * Phone (1080x1920)
  * 7" tablet (1200x1920)
  * 10" tablet (1600x2560)

Screenshot content:
1. Today screen showing steps with progress ring
2. History screen with charts
3. Encouraging message and streak display
4. Profile/settings screen
5. Onboarding welcome screen

3. App Store Copy:

App Name: Stepin

Subtitle: Wellness walking, your way

Description:
```
The only walking app that celebrates 2,000 steps as much as 10,000 steps.

Stepin is different. No leaderboards. No competition. No pressure. Just you, your walks, and your progress.

GENTLE MOTIVATION
• Set your own daily step goal
• Track your walking streak
• Celebrate every milestone
• Encouraging messages, never guilt

PRIVACY FIRST
• Your data stays yours
• No social comparison
• Optional sharing only
• Secure and private

EASY TO USE
• Automatic step tracking via HealthKit/Health Connect
• Manual walk logging option
• Clean, simple interface
• Works offline

PERFECT FOR:
• Beginners starting their wellness journey
• Seniors looking for gentle encouragement
• Anyone recovering from injury
• People who find other fitness apps too intense

Your walking journey, your pace, your way. Download Stepin and start celebrating every step today.
```

Keywords (App Store):
walking, steps, wellness, fitness, health, tracker, pedometer, streak, beginner-friendly, gentle, non-competitive

Categories:
- Primary: Health & Fitness
- Secondary: Lifestyle

4. Privacy Policy & Terms:

Create simple, clear documents:
- What data is collected (steps, profile)
- How data is used (personal tracking only)
- Data storage (Supabase, encrypted)
- User rights (delete data, export)
- Contact information

Host at: https://stepin.app/privacy and https://stepin.app/terms
```

### 6.2 Build and Submit

**Build Instructions**:

```bash
# Configure EAS (Expo Application Services)
npm install -g eas-cli
eas login
eas build:configure

# Create iOS build
eas build --platform ios --profile production

# Create Android build  
eas build --platform android --profile production

# Submit to stores (after builds complete)
eas submit --platform ios
eas submit --platform android
```

**Pre-submission Checklist**:
- [ ] All environment variables set in EAS
- [ ] Supabase project in production mode
- [ ] API keys secured
- [ ] Privacy policy and terms published
- [ ] Support email set up
- [ ] Screenshots generated
- [ ] App description finalized
- [ ] TestFlight beta tested (iOS)
- [ ] Internal testing track used (Android)
- [ ] No debug code in production
- [ ] Analytics configured (optional)
- [ ] Crash reporting configured (optional)

### 6.3 Post-Launch Monitoring

**Augment Code Prompt**:
```
Set up basic analytics and monitoring for Stepin MVP:

1. Optional: Configure Sentry for crash reporting:
   - Install @sentry/react-native
   - Initialize with DSN
   - Wrap app in Sentry error boundary
   - Track errors only, no user data

2. Basic usage metrics (privacy-respecting):
   - Track screen views (no personal data)
   - Track button clicks (no personal data)
   - Daily active users (anonymous count)
   - Store in Supabase analytics table

Create /lib/analytics/analyticsService.ts:
- trackEvent(eventName, properties): Logs event
- trackScreen(screenName): Logs screen view
- Privacy-respecting: no personal data, no tracking IDs
- User can opt-out in settings

3. Health checks:
   - Monitor Supabase connection status
   - Track sync success/failure rates
   - Log health data fetch success rates
   - Store in internal logs table

4. User feedback:
   - In-app feedback form in Settings
   - Email to support@stepin.app
   - Rate app prompt (after 7 days + 10 walks logged)
```

---

## Implementation Strategy for Augment Code

### How to Use This Plan with Augment Code

1. **Start with Foundation** (Phase 1):
   - Feed the project setup prompt first
   - Then provide the database schema
   - Then implement authentication
   - Test each piece before moving forward

2. **Build Incrementally** (Phases 2-4):
   - Implement one screen at a time
   - Test thoroughly before moving to next
   - Keep the mission in mind: simple, encouraging, non-competitive
   - Review each component for grandmother-friendliness

3. **Iterate Based on Testing** (Phase 5):
   - Use the testing checklist
   - Fix bugs before adding polish
   - Get real user feedback if possible
   - Adjust based on actual usage patterns

4. **Prepare for Launch** (Phase 6):
   - Don't skip the store preparation
   - Quality over speed at this stage
   - Test on real devices, not just simulator
   - Get beta testers (TestFlight/Internal Testing)

### Prompting Strategy for AI Development

**For each feature, provide Augment Code with**:
1. **Context**: "We're building Stepin, a non-competitive wellness walking app for beginners"
2. **Specific requirement**: Copy the relevant prompt from this document
3. **Design principles**: Reference grandmother-friendly, encouraging, simple
4. **Technical constraints**: "Use Supabase, Zustand, Expo Router, React Native 0.81+"
5. **Acceptance criteria**: How to verify it works correctly

**Example prompt structure**:
```
Context: Building Stepin wellness walking app - non-competitive, beginner-friendly

Task: Create the Today screen showing step count and progress

Requirements:
[Copy relevant section from Phase 2.2]

Design principles:
- Grandmother-friendly: large text, clear hierarchy
- Encouraging: celebrate all progress
- Simple: no complexity or confusion

Technical stack:
- React Native 0.81 with Expo
- Fetch from Supabase
- Zustand for state
- Reanimated for animations

Acceptance criteria:
[List from Phase 2.2]

Please implement this component with all requirements.
```

### Key Reminders for AI Development

1. **Stay mission-focused**: Every feature should align with non-competitive, encouraging values
2. **Simplicity first**: When in doubt, make it simpler
3. **Test incrementally**: Don't build everything before testing anything
4. **Real devices**: Test on physical iOS and Android devices
5. **Accessibility**: Every user should be able to use this, regardless of ability
6. **Privacy**: No user data leaves their control without explicit permission
7. **Performance**: 60fps animations, <2s load times, <100ms interactions

---

## Success Metrics & Next Steps

### MVP Success Criteria (8 weeks post-launch)

**Usage**:
- 100+ active users (logging walks weekly)
- 60%+ day-7 retention
- 40%+ day-30 retention
- Average 4+ walks logged per user
- Average 3+ days per week active

**Feedback**:
- 4.5+ star rating on app stores
- Positive qualitative feedback about non-competitive approach
- Users report feeling encouraged, not pressured
- Grandmother demographic gives positive feedback

**Technical**:
- <1% crash rate
- <2 second app load time
- Health data syncs successfully >95% of time
- Zero critical bugs

### Post-MVP: PowerSync Integration (Weeks 9-12)

Once MVP validates product-market fit, integrate PowerSync:

1. **Week 9**: PowerSync setup and sync rules
2. **Week 10**: Migrate to SQLite local-first architecture
3. **Week 11**: Test offline functionality thoroughly
4. **Week 12**: Deploy to production with staged rollout

This approach lets you validate the core value proposition (non-competitive wellness tracking) before investing in sophisticated offline infrastructure.

### Future Feature Roadmap (Post-MVP)

**Phase 2 Features** (Months 2-3):
- Buddy system (1-3 friends for accountability)
- Achievements and badges (non-competitive)
- Walking routes with GPS tracking
- Photos attached to walks
- Weekly summaries and insights

**Phase 3 Features** (Months 4-6):
- Beginner-only safe community spaces
- Collaborative group challenges (team goals)
- Adaptive AI goal recommendations
- Health condition-aware suggestions
- Corporate wellness partnerships

Always prioritize features that support the mission: accessibility, encouragement, and celebration of all progress.

---

## Summary: Your 8-Week MVP Plan

**Week 1**: Foundation, auth, Supabase setup
**Week 2**: Health integration, Today screen, step tracking
**Week 3**: History screen, charts, insights
**Week 4**: Profile, settings, notifications
**Week 5-6**: Polish, animations, testing, bug fixes
**Week 7-8**: App store prep, submission, launch

**Total cost** (first 3 months, 1000 users):
- Supabase: $0-25/month
- Expo EAS: $0 (hobby plan)
- Domain: $12/year
- Total: ~$25-40/month

**After validation, add PowerSync** ($35-60/month) for true offline-first experience that makes Stepin unbeatable in areas with poor connectivity.

You now have everything you need to feed Augment Code and build Stepin MVP. Start with Phase 1, test thoroughly, and move forward incrementally. The mission is clear: make walking accessible, encouraging, and judgment-free for everyone.

**Ready to start walking? Start coding. 🚶‍♀️**