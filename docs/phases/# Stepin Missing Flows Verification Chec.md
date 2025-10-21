# Stepin Missing Flows Verification Checklist

**Purpose:** Systematically verify all user flows and systems are implemented. Use the prompts provided when you discover missing functionality.

**How to Use:**
1. Check each item in your codebase
2. Mark with ✅ if implemented and working
3. Mark with ❌ if missing or broken
4. Copy the provided prompt for any ❌ items

---

## 🔔 Notification System

### [ ] Daily Reminder Scheduling
**Check:** Search for `scheduleNotification` and daily reminder logic
**Why it matters:** Core engagement driver - users need gentle nudges

**If missing, use this prompt:**
```
We need to implement daily reminder notifications in Stepin. The requirements are:

1. User sets preferred reminder time in profile settings (default 9:00 AM)
2. Schedule notification at that time daily
3. Message: "Time to get moving! 🚶 Let's hit your step goal today."
4. Update schedule when user changes time preference
5. Respect notification permission status
6. Cancel if user disables daily reminders

Please implement the full notification scheduling system including:
- Schedule function using expo-notifications
- Update logic when preferences change
- Cancellation when disabled
- Handle app foreground/background states

Reference existing notification structure in profileStore notification_settings.
```

---

### [ ] Streak Reminder Logic
**Check:** Search for streak reminder notification triggers
**Why it matters:** Prevents streak breaks, high retention impact

**If missing, use this prompt:**
```
Implement streak reminder notifications with this logic:

Trigger Conditions:
- User has active streak (current_streak > 0)
- Current date's goal NOT yet met
- Current time is 8:00 PM or later
- User has not already walked today

Notification:
- Title: "Don't break your {X} day streak! 🔥"
- Body: "Just a few more steps to keep it going!"
- Only send once per day maximum
- Respect user's streak reminder setting in profile

Implementation needs:
- Check daily_stats for today
- Check current streak from streaks table
- Schedule notification at 8 PM if conditions met
- Cancel if goal gets met before 8 PM

Use the existing notification settings structure.
```

---

### [ ] Goal Celebration Notification
**Check:** Look for notification when goal is reached
**Why it matters:** Immediate positive reinforcement

**If missing, use this prompt:**
```
Implement instant goal celebration notifications:

Trigger: Immediately when user's steps reach or exceed daily_step_goal

Notification:
- Title: "🎉 You did it!"
- Body: "{X} steps today! Goal crushed!"
- Sound and haptic feedback
- Only send once per day (track in daily_stats or local storage)
- Respect goalCelebration setting in notification_settings

Logic:
- Trigger in healthStore when todaySteps updates
- Check if goal just crossed (previous < goal, current >= goal)
- Verify not already sent today
- Send notification + trigger confetti animation if app is open

Integration points:
- healthStore.syncTodaySteps()
- Check notification_settings from profileStore
```

---

### [ ] Notification Permission Re-request Flow
**Check:** Can user re-enable after initial denial?
**Why it matters:** Users change their minds

**If missing, use this prompt:**
```
Implement notification permission re-request flow:

Scenario: User initially denied, now wants to enable in Settings

UI Requirements:
- In Profile > Notification Settings
- If permission denied, show banner: "Notifications are disabled. Enable in Settings?"
- Button: "Open Settings"
- Use Linking.openSettings() on iOS, openURL('app-settings:') on Android

Logic:
- Check permission status on Profile screen mount
- Show re-request UI if denied
- When user returns from Settings, re-check permission
- If granted, enable notification toggles
- If still denied, keep toggles disabled with explanation

Handle edge cases:
- App was denied at OS level
- User disabled specific notification types
- Permission was never requested
```

---

## 👥 Social/Buddy Features

### [ ] Buddy Request Acceptance Flow
**Check:** Where do pending requests show up? Can users accept/decline?
**Why it matters:** Social features unusable without this

**If missing, use this prompt:**
```
Implement buddy request acceptance/rejection system:

UI Requirements:
- Pending requests section at top of Buddies screen
- Each request shows: avatar, name, "Accept" and "Decline" buttons
- Badge count on Buddies tab showing pending count

Database Operations:
- Query buddies table WHERE buddy_id = current_user AND status = 'pending'
- Accept: UPDATE status = 'accepted'
- Decline: DELETE record (or UPDATE status = 'rejected')
- Create reciprocal connection on accept

Features:
- Pull-to-refresh pending requests
- Empty state: "No pending requests"
- Success toast: "You're now buddies with {name}!"
- Haptic feedback on accept
- Notification to requester when accepted

Include:
- PendingRequestsList component
- PendingRequestItem component with actions
- socialStore methods: acceptBuddyRequest(), declineBuddyRequest()
```

---

### [ ] Blocking Buddies
**Check:** Can users block someone?
**Why it matters:** Safety and harassment prevention

**If missing, use this prompt:**
```
Implement buddy blocking system:

Requirements:
- Add "Block" option in buddy profile menu (three dots)
- Confirmation dialog: "Block {name}? They won't be notified."
- Update buddies status to 'blocked'
- Hide all activity from blocked user
- Prevent future requests from blocked user

Database:
- buddies.status can be 'blocked'
- RLS policy: blocked users can't see each other's activities
- Prevent searches from returning blocked users

UI:
- Blocked users list in Settings > Privacy
- Unblock option available
- Clear messaging: "Blocked users can't send you requests"

Edge cases:
- Block while pending request exists
- Block after being buddies (removes both connections)
- Blocked user tries to send new request
```

---

### [ ] Removing Buddies
**Check:** Can users delete connections?
**Why it matters:** Users need control over their connections

**If missing, use this prompt:**
```
Implement buddy removal (unfriend) feature:

UI:
- In buddy profile, add "Remove Buddy" option
- Confirmation: "Remove {name} as a buddy? You can reconnect later."
- Destructive action styling (red)

Logic:
- DELETE both buddy records (user → buddy AND buddy → user)
- Remove from activity feed visibility
- Don't delete historical kudos (keep data integrity)
- Show "Removed" toast

Edge cases:
- Ensure both reciprocal records deleted
- Handle if already removed by other user
- Update buddy list immediately
- Clear any cached data

Create:
- removeBuddy() function in socialStore
- Cascade delete in database
- Confirmation modal component
```

---

### [ ] Activity Feed Pagination
**Check:** Load more than initial posts?
**Why it matters:** Performance and data efficiency

**If missing, use this prompt:**
```
Implement infinite scroll pagination for activity feed:

Requirements:
- Initial load: 20 posts
- Load more when scrolling near bottom
- Show loading indicator while fetching
- Handle end of feed (no more posts)

Implementation:
- Use cursor-based pagination (created_at timestamp)
- FlatList with onEndReached
- Track loading state
- Prevent duplicate loads

Query:
SELECT * FROM activity_feed
WHERE created_at < {last_post_timestamp}
ORDER BY created_at DESC
LIMIT 20;

UX:
- Skeleton loaders for initial load
- Small spinner at bottom for "load more"
- "You're all caught up!" when no more posts
- Pull-to-refresh resets to top

Add to socialStore:
- loadMoreActivityFeed()
- hasMorePosts boolean
- lastPostTimestamp tracking
```

---

### [ ] Kudos Giving Flow
**Check:** Does tapping kudos button actually work?
**Why it matters:** Core social engagement mechanism

**If missing, use this prompt:**
```
Implement kudos giving/removing functionality:

UI Interaction:
- Heart icon (outline if not given, filled if given)
- Tap to give kudos (fills heart, increments count)
- Tap again to remove kudos (outline heart, decrements count)
- Optimistic UI update (instant feedback)
- Haptic feedback on give

Database:
- INSERT into kudos table (activity_id, user_id)
- DELETE when removing kudos
- Unique constraint prevents duplicate kudos
- Update activity_feed kudos_count in real-time

Features:
- Show who gave kudos (tap count to see list)
- Prevent kudos on own posts
- Kudos notification to post author (optional, settings-based)

Error handling:
- Rollback UI if database insert fails
- Handle network errors gracefully
- Show retry option

Components:
- KudosButton with animation
- KudosListModal (who gave kudos)
- socialStore methods: giveKudos(), removeKudos()
```

---

## 📊 Progress & Goals

### [ ] Adaptive Goal Adjustment
**Check:** Does goal auto-adjust based on performance?
**Why it matters:** Keeps users challenged but not overwhelmed

**If missing, use this prompt:**
```
Implement adaptive goal adjustment system:

Analysis Window: Past 7 days

Trigger Conditions:
1. Goal met 6-7 days straight → Suggest +10% increase
2. Goal missed 5-7 days straight → Suggest -15% decrease
3. Consistently exceed by 30%+ → Suggest +20% increase

Prompt Format:
- Non-pushy notification or in-app banner
- "You've been crushing your goal! Want to challenge yourself?"
- "Your goal seems tough lately. Let's adjust to {new_goal} steps?"
- Always show "Keep Current Goal" option

Logic:
- Weekly check (Monday morning)
- Calculate from daily_stats
- Store suggestion in user preferences
- Don't auto-adjust (user control)
- Remember if user declined suggestion

Implementation:
- checkForGoalAdjustment() function
- Run on app open Monday
- Show modal with recommendation
- Update daily_step_goal if accepted

Include emotional support:
- "Great consistency!" when suggesting increase
- "That's okay, let's try something more achievable" when suggesting decrease
```

---

### [ ] Streak Freeze/Repair
**Check:** Can users save broken streaks?
**Why it matters:** Reduces all-or-nothing pressure

**If missing, use this prompt:**
```
Implement streak freeze and repair features:

Streak Freeze:
- Earn 1 freeze per week of active streak
- Use freeze on rest day (goal not met)
- Maintains streak count
- Max 3 freezes stored
- Show freeze count in streak display

Streak Repair (Premium):
- Within 24 hours of missing goal
- Cost: 100 virtual currency or $0.99
- Retroactively marks day as goal_met
- Updates streak calculation
- One repair per week maximum

UI:
- Freeze indicator on calendar (snowflake icon)
- Repair prompt next morning: "Repair yesterday's streak?"
- Clear messaging: "Streaks are about consistency, not perfection"

Database:
- Add streak_freezes_available to profiles
- Add streak_freeze_used to daily_stats
- Track last_freeze_earned date

Logic:
- Earn freeze: 7 consecutive goal_met days
- Apply freeze: check freezes_available > 0
- Repair: verify within 24h, sufficient currency/payment

Create:
- StreakFreezeModal component
- StreakRepairModal component
- Freeze/repair logic in streakStore
```

---

### [ ] Milestone Detection & Celebrations
**Check:** How do we know when to show 7/14/30 day celebrations?
**Why it matters:** Key motivation moments

**If missing, use this prompt:**
```
Implement milestone detection and celebration system:

Milestones:
- 7 days: "One week strong! 🔥"
- 14 days: "Two weeks of consistency! 💪"
- 21 days: "Three weeks! You're building a habit! 🌟"
- 30 days: "One month streak! Incredible! 🎉"
- 60 days: "Two months! You're unstoppable! 🚀"
- 90 days: "Three months! This is a lifestyle! 🏆"
- 100+ days: "100+ days! You're a walking legend! 👑"

Trigger Logic:
- Check when current_streak updates
- If new streak value matches milestone, trigger celebration
- Show only once per milestone (track shown_milestones in local storage)

Celebration Components:
- Full-screen modal with confetti
- Large milestone number
- Encouraging message
- Share achievement button (optional)
- "Keep Going!" button to dismiss

Implementation:
- checkMilestones() in streakStore
- StreakMilestoneModal component
- Track last_shown_milestone
- Post to activity_feed as 'streak_milestone'

Animation:
- Confetti cannon
- Scale animation for number
- Haptic success feedback
- Celebration sound (optional, respects settings)
```

---

## 🚶 Walk Management

### [ ] Walk Editing
**Check:** Can users edit logged walks?
**Why it matters:** Fix mistakes and add missing data

**If missing, use this prompt:**
```
Implement walk editing functionality:

UI:
- Tap walk in history → details modal
- "Edit" button in top right
- Editable fields: date, steps, duration, distance
- Save/Cancel buttons
- Validation on save

Editable Fields:
- Date (can't be future)
- Steps (100 - 200,000)
- Duration (1 - 1440 minutes)
- Distance (auto-calculate or manual)
- Notes (optional field to add)

Logic:
- Update walks table
- Recalculate daily_stats for that date
- Update streak if goal_met status changes
- Update activity_feed if goal achievement affected

Constraints:
- Can only edit own walks
- Can't change date if it breaks data integrity
- Warn if large changes (>50% step change)

Components:
- EditWalkModal
- Validation functions
- historyStore.updateWalk()

Database:
- Add updated_at timestamp
- Track edit history (optional)
```

---

### [ ] Walk Deletion with Cascade
**Check:** Delete flow updates all dependent data?
**Why it matters:** Data integrity and accurate stats

**If missing, use this prompt:**
```
Implement walk deletion with proper cascade:

UI:
- Swipe-to-delete on walk list items
- Confirmation dialog: "Delete this walk? This can't be undone."
- Destructive styling

Cascade Effects:
1. Delete walk record from walks table
2. Recalculate daily_stats for that date
3. Update current_streak if affects consecutive days
4. Update longest_streak if was part of record
5. Remove from activity_feed if posted
6. Update total distance/steps in profile stats

Logic:
async function deleteWalk(walkId, userId) {
  1. Get walk data (date, steps)
  2. Delete walk
  3. Recalculate daily_stats for date
  4. Call updateStreak(userId)
  5. Update profile aggregate stats
  6. Delete activity_feed posts for this walk
}

Error Handling:
- Transaction rollback if any step fails
- Show error message if delete fails
- Optimistic UI (remove immediately, rollback if fails)

Components:
- Delete confirmation modal
- Undo toast (5 second window)
- historyStore.deleteWalk()
- Utility: lib/utils/deleteWalk.ts
```

---

### [ ] Duplicate Walk Prevention
**Check:** Can users log same walk twice?
**Why it matters:** Data accuracy and user confusion

**If missing, use this prompt:**
```
Implement duplicate walk detection and prevention:

Detection Rules:
- Same user + same date + similar steps (within 10%)
- Same user + same timestamp (for auto-detected walks)
- Overlapping time ranges if time data exists

UI Warnings:
- Before save: "You already logged {X} steps today. Add anyway?"
- Show existing walk details
- Options: "Replace", "Add Anyway", "Cancel"

Replace Logic:
- Delete old walk
- Insert new walk
- Preserve creation timestamp
- Show "Walk updated" message

Add Anyway:
- Allow multiple walks per day (legitimate use case)
- Sum for daily_stats
- Show both in history

Implementation:
- Check on manual walk log
- Query walks for same date
- Compare step counts
- DuplicateWalkModal component
- Clear user messaging

Edge Cases:
- Auto-detected + manual log
- Morning walk + evening walk (both legitimate)
- User correcting mistake
```

---

## 📱 Health Data Integration

### [ ] Permission Denied Flow
**Check:** What if user denies HealthKit/Health Connect?
**Why it matters:** Common scenario, needs graceful handling

**If missing, use this prompt:**
```
Implement health permission denied flow:

Initial Denial:
- Show friendly message: "No problem! You can still track walks manually."
- Highlight manual logging option
- Don't show permission banner on every screen
- Store denial in AsyncStorage

Later Re-request:
- Settings > Health Integration section
- "Enable Health Tracking" button
- Explains benefits clearly
- Links to system Settings (can't re-request directly)

Manual Tracking Mode:
- Prominent "Log Walk" button on Today screen
- Quick-add widget
- Simple form: just steps (duration/distance optional)
- Still show all other features

UI States:
- Permission never requested
- Permission denied
- Permission granted
- Permission restricted (corporate device)

Components:
- PermissionDeniedBanner (dismissible)
- HealthSettingsCard in Profile
- ManualTrackingPromotion component

Logic:
- Check permission status on app launch
- Store in healthStore.permissionsGranted
- Show appropriate UI based on status
- Don't repeatedly ask
```

---

### [ ] Historical Data Import
**Check:** One-time sync on first permission grant?
**Why it matters:** Users want to see existing data

**If missing, use this prompt:**
```
Implement one-time historical data import:

Trigger: First time user grants health permissions

Import Window: Last 90 days

Process:
1. Show loading modal: "Importing your walking history..."
2. Query HealthKit/Health Connect for last 90 days
3. For each day with data:
   - Create walk record
   - Create daily_stats entry
4. Calculate initial streak
5. Show success: "Imported {X} days of walks!"

UI/UX:
- Progress bar showing days imported
- Allow cancellation
- Handle partial imports gracefully
- Don't block app usage during import

Data Handling:
- Batch insert walks (don't insert one-by-one)
- Use transaction for atomic operation
- Handle gaps in data (no walks some days)
- Deduplicate if user already manually logged

Limits:
- Max 90 days (performance)
- Verify data quality (exclude extreme outliers)
- Skip days with <100 steps (likely errors)

Implementation:
- importHistoricalData() in healthStore
- HistoricalImportModal component
- Progress tracking state
- Error recovery
```

---

### [ ] Health Data Refresh Timing
**Check:** When does app query health data?
**Why it matters:** Battery and data freshness balance

**If missing, use this prompt:**
```
Define and implement health data refresh strategy:

Refresh Triggers:
1. App opens/foregrounds - immediate sync
2. User pulls-to-refresh on Today screen
3. Every 15 minutes while app active (background timer)
4. After manual walk log (verify against health data)
5. Daily at midnight (new day rollover)

Refresh Logic:
- Query only today's data (not full history)
- Use background fetch for iOS when app backgrounded
- Respect battery saver mode (reduce frequency)
- Cancel pending syncs when app backgrounds

Implementation:
useEffect(() => {
  // Sync on mount
  syncTodaySteps();
  
  // Set interval for periodic sync
  const interval = setInterval(() => {
    syncTodaySteps();
  }, 15 * 60 * 1000); // 15 minutes
  
  return () => clearInterval(interval);
}, []);

Background Sync (iOS):
- Register background fetch task
- Request HealthKit data
- Update local database
- Trigger notification if goal met while away

State Management:
- healthStore.lastSynced timestamp
- healthStore.syncing boolean
- Show sync indicator in UI

Battery Optimization:
- Don't sync if no user activity
- Batch multiple sync requests
- Use motion detection (only sync if walking)
```

---

## 🔒 Privacy & Security

### [ ] Account Deletion Flow
**Check:** Full cascade delete of all user data?
**Why it matters:** Legal requirement (GDPR, CCPA)

**If missing, use this prompt:**
```
Implement complete account deletion flow:

UI Requirements:
- Settings > Account > Delete Account
- Requires password confirmation
- Multiple confirmation dialogs
- Warning: "This will permanently delete all your data"
- List what gets deleted (walks, stats, buddies, posts)
- Cannot be undone

Deletion Cascade:
1. Delete from profiles (cascades to all related tables via ON DELETE CASCADE)
2. Delete avatar from Supabase Storage
3. Delete invite_links
4. Remove from buddies for all other users
5. Delete activity_feed posts
6. Delete kudos given
7. Sign out and clear local storage
8. Revoke Supabase session

Database:
- Verify CASCADE is set on all foreign keys
- Double-check orphaned data
- Run deletion in transaction
- Log deletion for audit trail

Final Steps:
- Show "Account deleted" message
- Navigate to welcome screen
- Clear all app state
- Clear AsyncStorage
- Clear Zustand stores

Components:
- DeleteAccountModal with password input
- Multiple confirmation steps
- accountDeletion() utility function
- Error handling and rollback

Legal:
- Add deletion confirmation email
- Keep audit log (anonymized) for 30 days
- Comply with data retention regulations
```

---

### [ ] Avatar Upload to Supabase Storage
**Check:** Image upload working?
**Why it matters:** Profile personalization

**If missing, use this prompt:**
```
Implement avatar upload to Supabase Storage:

Flow:
1. User taps avatar placeholder
2. Show options: "Take Photo" / "Choose from Library"
3. Request camera/photo permissions
4. User selects/takes photo
5. Crop to square (1:1 aspect)
6. Compress to max 500KB
7. Upload to Supabase Storage (avatars bucket)
8. Update profile.avatar_url
9. Show success toast

Image Processing:
- expo-image-picker for selection
- expo-image-manipulator for crop/resize
- Compress quality: 0.8
- Max dimensions: 500x500px
- Convert to JPEG

Upload:
const fileName = `${userId}-${Date.now()}.jpg`;
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(fileName, file, {
    contentType: 'image/jpeg',
    upsert: true
  });

Storage Bucket Config:
- Name: avatars
- Public: false
- Max file size: 2MB
- Allowed MIME types: image/jpeg, image/png, image/webp

Components:
- AvatarUploadModal
- ImagePicker integration
- Upload progress indicator
- Error handling (too large, wrong format, etc.)

Cleanup:
- Delete old avatar when uploading new one
- Prevent orphaned files
```

---

## 🎯 Onboarding & First Run

### [ ] Empty State Handling
**Check:** Proper empty states for no data scenarios?
**Why it matters:** First-time user experience

**If missing, use this prompt:**
```
Implement comprehensive empty state components:

Scenarios:
1. No walks yet (new user)
2. No buddies yet
3. No activity feed posts
4. No walks this week/month
5. No current streak

Empty State Components:
Each needs:
- Friendly illustration or icon
- Clear heading
- Supportive message
- Clear call-to-action button

Examples:

EmptyWalksState:
- Icon: Walking person illustration
- Heading: "Start Your Walking Journey"
- Message: "Your first walk will appear here"
- CTA: "Log a Walk" button

EmptyBuddiesState:
- Icon: Two people icon
- Heading: "Connect with Friends"
- Message: "Add buddies to share your progress and stay motivated"
- CTA: "Add Buddy" button

EmptyActivityFeedState:
- Icon: Heart icon
- Heading: "No Activity Yet"
- Message: "When your buddies complete walks, you'll see them here"
- CTA: "Invite a Friend" button

EmptyHistoryState:
- Icon: Calendar icon
- Heading: "No Walks This Period"
- Message: "Select a different time range or log a walk"
- CTA: "Log Walk" button

Implementation:
- Create reusable EmptyState component
- Pass props: icon, heading, message, buttonText, onPress
- Use across all screens
- Consistent styling
- Animations (fade in)
```

---

## 📴 Offline & Sync

### [ ] Offline Walk Logging
**Check:** Can users log walks without internet?
**Why it matters:** Users walk in areas without coverage

**If missing, use this prompt:**
```
Implement offline walk logging with sync queue:

Offline Detection:
- Use @react-native-community/netinfo
- Show offline banner at top
- Disable features that require network
- Enable offline-capable features

Offline Walk Logging:
- Allow manual walk entry offline
- Store in AsyncStorage as pending sync
- Show indicator: "Will sync when online"
- Queue multiple walks

Data Structure:
interface PendingSyncWalk {
  id: string; // temp local ID
  userId: string;
  date: string;
  steps: number;
  duration_minutes?: number;
  distance_meters?: number;
  createdAt: string; // local timestamp
  syncStatus: 'pending' | 'syncing' | 'failed';
}

Sync Queue:
- Store array in AsyncStorage: 'pending_walks'
- On connection restored, sync all pending
- Show progress: "Syncing 3 walks..."
- Handle failures gracefully

Sync Process:
1. Detect connection restored
2. Load pending walks from AsyncStorage
3. For each walk:
   - Insert to Supabase
   - Update sync status
   - Remove from queue on success
4. Update daily_stats and streaks
5. Clear AsyncStorage on complete success

Error Handling:
- Retry failed syncs (max 3 attempts)
- Show specific error: "Walk from Oct 6 failed to sync"
- Allow manual retry
- Don't lose data

Components:
- OfflineBanner
- SyncQueueIndicator
- OfflineSyncService
- ConnectionListener
```

---

### [ ] Sync Conflict Resolution
**Check:** Handle server data changes during offline period?
**Why it matters:** Data integrity

**If missing, use this prompt:**
```
Implement sync conflict resolution:

Conflict Scenarios:
1. User logged walk offline, then online on different device
2. Server data changed while offline
3. User edited walk offline that was deleted online
4. Duplicate walks (same date, similar steps)

Resolution Strategy:

For New Walks:
- Local wins (keep both if different)
- Merge into daily_stats
- Recalculate streak after merge

For Edited Walks:
- Show conflict modal: "This walk was changed. Which version?"
- Display both versions side-by-side
- Let user choose: Keep Local / Keep Server / Merge

For Deleted Walks:
- If walk deleted on server, don't sync local edits
- Notify user: "Walk was deleted on another device"
- Option to restore

Conflict Resolution UI:
- ConflictResolutionModal
- Show timestamps: "Local (edited 5 min ago)" vs "Server (edited 2 min ago)"
- Highlight differences
- Clear actions

Implementation:
- Compare updated_at timestamps
- Check for duplicate IDs
- Use last-write-wins for simple conflicts
- Prompt user for complex conflicts

Best Practices:
- Prefer server data when in doubt
- Log all conflicts for debugging
- Provide undo option after resolution
- Show clear user messaging
```

---

## 🎉 Celebrations & Gamification

### [ ] Badge System Definition
**Check:** What badges exist and how to earn them?
**Why it matters:** Motivation and goal clarity

**If missing, use this prompt:**
```
Define complete badge system for Stepin:

Badge Categories:

CONSISTENCY BADGES:
- "First Step" - Complete first walk
- "Weekend Warrior" - 5 weekend walks
- "Week Strong" - 7-day streak
- "Two Weeks" - 14-day streak  
- "Month Master" - 30-day streak
- "Unbreakable" - 90-day streak

DISTANCE BADGES:
- "10 Miles" - Accumulate 10 total miles
- "Marathon" - Accumulate 26.2 total miles
- "100 Miles" - Accumulate 100 total miles
- "500 Miles" - Accumulate 500 total miles

STEP BADGES:
- "5k Steps" - First day with 5,000 steps
- "10k Steps" - First day with 10,000 steps
- "15k Steps" - First day with 15,000 steps
- "100k Total" - Accumulate 100,000 total steps
- "1 Million" - Accumulate 1 million total steps

TIME BADGES:
- "Early Bird" - 5 walks before 9 AM
- "Night Owl" - 5 walks after 7 PM
- "Lunch Break" - 5 walks between 11 AM-2 PM

SPECIAL BADGES:
- "Weather Warrior" - Walk in rain (from weather data)
- "Hill Climber" - Walk with 100+ ft elevation gain
- "Explorer" - Walk in 5 different locations

Database Schema:
CREATE TABLE public.badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  category text
);

CREATE TABLE public.user_badges (
  user_id uuid REFERENCES profiles(id),
  badge_id text REFERENCES badges(id),
  earned_at timestamp with time zone DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

Badge Checking Logic:
- Run after walk insert
- Run after daily_stats update
- Check relevant conditions
- Award badge if earned
- Post to activity_feed
- Show celebration modal

Create:
- Badge icon assets
- Badge earning logic functions
- BadgeCelebrationModal
- BadgesGrid display component
```

---

## ⚙️ Settings & Preferences

### [ ] Units Preference Switching
**Check:** Does changing miles/km update all displays?
**Why it matters:** User control over their experience

**If missing, use this prompt:**
```
Implement units preference with full display updates:

User Action: Settings > Preferences > Units > Select km or miles

Immediate Updates Required:
1. Today screen distance display
2. History screen walk distances
3. Walk details modals
4. Progress graphs axis labels
5. Goal setting slider labels
6. Activity feed posts
7. Profile statistics

Database:
- Update profiles.units_preference
- Don't recalculate stored distances (keep in meters)
- Convert on display only

Conversion Logic:
export function formatDistance(meters: number, units: UnitsPreference) {
  if (units === 'miles') {
    const miles = meters / 1609.34;
    return `${miles.toFixed(2)} mi`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
  }
}

Pace Conversion:
- Miles: min/mile
- Kilometers: min/km
- Recalculate pace display

Implementation:
- Update profileStore.updateUnits()
- Subscribe to units preference in all components
- Use formatDistance() utility everywhere
- Test with extreme values (0 meters, 100,000 meters)

Edge Cases:
- Mid-walk unit change (should update live)
- Historical data display
- Goal setting (keep in steps, but show equivalent distance)
```

---

## 🔄 Background Operations

### [ ] Background Health Data Sync
**Check:** Periodic fetch when app backgrounded?
**Why it matters:** Keep data current without user interaction

**If missing, use this prompt:**
```
Implement background health data sync:

iOS Background Fetch:
- Use expo-task-manager
- Register background fetch task
- Fetch every 15-30 minutes (iOS decides actual interval)
- Query HealthKit for today's steps
- Update local database
- Trigger notification if goal met while away

Setup:
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = 'background-step-sync';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const todaySteps = await getHealthService().getTodaySteps();
    await updateLocalDatabase(todaySteps);
    
    // Check if goal met
    const goal = await getUserGoal();
    if (todaySteps >= goal) {
      await scheduleGoalNotification();
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register
await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
  minimumInterval: 15 * 60, // 15 minutes
  stopOnTerminate: false,
  startOnBoot: true,
});

Android Considerations:
- Use foreground service with notification
- WorkManager for periodic sync
- Respect battery optimization settings
- Allow user to disable background sync

Configuration:
- Add to app.json: "ios": { "backgroundModes": ["fetch"] }
- Request background permissions
- Handle permission denial gracefully

Battery Optimization:
- Only sync if significant time passed (>10 min)
- Don't sync if battery low (<20%)
- Use motion detection (skip if stationary)
```

---

## 🐛 Error Handling

### [ ] Network Error Handling
**Check:** Graceful degradation for offline/errors?
**Why it matters:** User experience during failures

**If missing, use this prompt:**
```
Implement comprehensive error handling:

Error Categories:

1. Network Errors:
- Connection timeout
- No internet
- Server unreachable
- DNS failure

2. Authentication Errors:
- Session expired
- Invalid credentials
- Unauthorized access

3. Data Errors:
- Validation failed
- Constraint violation
- Invalid format

4. Permission Errors:
- Health data denied
- Camera denied
- Notifications denied

Error Handling Strategy:

User-Friendly Messages:
- Never show raw error codes
- Use plain language
- Explain what happened
- Suggest solutions

Example Messages:
```typescript
const errorMessages = {
  'network.timeout': 'Connection timed out. Please check your internet and try again.',
  'auth.expired': 'Your session expired. Please sign in again.',
  'validation.steps': 'Steps must be between 100 and 200,000.',
  'permission.health': 'Health data access needed. Enable in Settings?',
};
```

Error UI Components:
- ErrorBoundary (catch React errors)
- ErrorToast (temporary notification)
- ErrorModal (requires action)
- InlineError (form validation)

Retry Logic:
- Automatic retry for network errors (max 3 attempts)
- Exponential backoff (1s, 2s, 4s)
- User-initiated retry button
- Show retry count: "Retrying... (2/3)"

Logging:
- Log all errors to Sentry
- Include context (user ID, action, timestamp)
- Group similar errors
- Alert on critical errors

Implementation:
- Create ErrorHandler service
- Wrap API calls in try/catch
- Use error boundaries for component errors
- Standard error response format
```

---

## 📈 Analytics & Insights

### [ ] Weekly Summary Calculation
**Check:** Auto-generate weekly stats?
**Why it matters:** Insights and motivation

**If missing, use this prompt:**
```
Implement weekly summary generation:

Trigger: Monday morning, calculate previous week (Mon-Sun)

Calculations:
- Total steps
- Total walks
- Total distance
- Total active minutes
- Average daily steps
- Days goal met
- Current streak status
- Longest walk
- Best day
- Comparison to previous week

Summary Format:
{
  weekStart: '2025-10-06',
  weekEnd: '2025-10-12',
  totalSteps: 52400,
  totalWalks: 12,
  totalDistance: 39920, // meters
  avgDailySteps: 7486,
  daysGoalMet: 5,
  longestWalkSteps: 12300,
  bestDay: '2025-10-08',
  comparisonVsPrevWeek: '+8%',
  streakEnd: 5
}

Display:
- WeeklySummaryCard on Today screen
- Tap to see full details
- Share to activity feed (optional)
- Archive past summaries

Implementation:
- Run calculation on Monday at 6 AM
- Store in weekly_summaries table
- Show notification: "Your week in review is ready!"
- Populate from daily_stats

Insights:
- "You walked every weekday!" (if Mon-Fri complete)
- "Your best week yet!" (if total > all previous)
- "8% more than last week 📈" (percentage change)

Create:
- calculateWeeklySummary() utility
- WeeklySummaryCard component
- weekly_summaries table
```

---

## 📅 Date/Time Handling

### [ ] Timezone Handling
**Check:** Does app handle timezone changes?
**Why it matters:** Users travel

**If missing, use this prompt:**
```
Implement robust timezone handling:

Issues to Solve:
1. User travels to different timezone
2. Walks logged in one timezone, viewed in another
3. Midnight rollover happens at different times
4. Historical data shows wrong dates

Strategy: Store everything in UTC, display in user's local timezone

Database:
- All timestamps: timestamp with time zone (UTC)
- Dates: date type (no timezone)
- Use timezone('utc', now()) for consistency

Walk Timestamps:
- Store created_at in UTC
- Store date as local date string (YYYY-MM-DD)
- When displaying, convert UTC to local

Today's Data:
- Always calculate "today" from user's device timezone
- Don't cache "today" calculation
- Recalculate on app foreground

Midnight Rollover:
- Use device's midnight (not server's)
- Check every minute if date changed
- Trigger new day initialization

Implementation:
import { format, startOfDay, isSameDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

// Get user's timezone
const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Convert UTC to local for display
const localDate = utcToZonedTime(utcDate, userTZ);

// Store as UTC
const utcDate = zonedTimeToUtc(localDate, userTZ);

Edge Cases:
- Daylight saving time transitions
- Traveling across dateline
- Walk logged at 11:59 PM, synced at 12:01 AM next day
- Historical data viewed weeks later in different timezone

Testing:
- Manual timezone changes on device
- Walk logs around midnight
- View history after travel
```

---

## 🌐 Accessibility

### [ ] VoiceOver/TalkBack Labels
**Check:** All interactive elements labeled?
**Why it matters:** Screen reader users

**If missing, use this prompt:**
```
Implement comprehensive accessibility labels:

Requirements:
- Every touchable element needs accessibilityLabel
- Images need accessibilityLabel or accessibilityHint
- Decorative elements: accessibilityElementsHidden={true}
- Group related content with accessibilityRole="group"

Examples:

Button Labels:
<TouchableOpacity 
  accessibilityRole="button"
  accessibilityLabel="Log a walk"
  accessibilityHint="Opens form to manually log your steps"
>

Tab Bar:
<Tab 
  accessibilityRole="tab"
  accessibilityLabel="Today screen"
  accessibilityState={{ selected: isActive }}
>

Step Count:
<Text 
  accessibilityLabel={`${todaySteps} steps today, ${percentageComplete}% of your goal`}
  accessibilityRole="text"
>
  {todaySteps}
</Text>

Icons:
<Feather 
  name="heart"
  accessibilityLabel="Give kudos"
  accessibilityHint="Double tap to support this activity"
/>

Progress Ring:
<View 
  accessibilityLabel={`Step progress: ${progress}% complete`}
  accessibilityRole="progressbar"
  accessibilityValue={{ min: 0, max: 100, now: progress }}
>

Testing:
- Enable VoiceOver on iOS (Settings > Accessibility)
- Enable TalkBack on Android (Settings > Accessibility)
- Navigate entire app using screen reader only
- Verify all content is readable
- Ensure logical navigation order

Common Issues:
- Images without labels
- Buttons that just say "button"
- Decorative icons confusing screen readers
- Poor focus order
- Unlabeled form inputs

Audit Tool:
- Use React Native Accessibility Inspector
- Test with actual screen reader users
```

---

## Quick Reference: Priority Matrix

| Priority | Feature | Impact | Complexity | Implement Order |
|----------|---------|--------|------------|-----------------|
| 🔥 Critical | Buddy request acceptance | High | Low | 1 |
| 🔥 Critical | Walk deletion cascade | High | Medium | 2 |
| 🔥 Critical | Health permission denied | High | Low | 3 |
| 🔥 Critical | Notification scheduling | High | Medium | 4 |
| 🔥 Critical | Offline walk logging | High | High | 5 |
| ⚠️ Important | Empty state handling | Medium | Low | 6 |
| ⚠️ Important | Milestone celebrations | Medium | Medium | 7 |
| ⚠️ Important | Activity feed pagination | Medium | Medium | 8 |
| ⚠️ Important | Walk editing | Medium | Medium | 9 |
| ⚠️ Important | Streak freeze/repair | Medium | Medium | 10 |
| ✅ Nice to Have | Badge system | Low | High | 11 |
| ✅ Nice to Have | Timezone handling | Low | High | 12 |
| ✅ Nice to Have | Weekly summaries | Low | Medium | 13 |

---

## How to Use This Document

1. **Quick Scan**: Look for [ ] checkboxes - these need verification
2. **Check Your Code**: Search your codebase for each feature
3. **Mark Status**: Check ✅ if working, leave empty if missing
4. **Use Prompts**: Copy the prompt for any missing feature
5. **Implement**: Build the feature using the provided prompt
6. **Test**: Verify the feature works end-to-end
7. **Document**: Update this checklist

## Next Steps

After completing this audit:
1. Count total ❌ items
2. Prioritize by Impact × User Frequency
3. Implement in order of priority matrix
4. Test each feature thoroughly
5. Update technical documentation

This checklist ensures no critical flows are missing before launch.