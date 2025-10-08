# Phase 4: Profile & Settings (Week 4)

[← Previous: Phase 3 - History & Progress](phase-3-history-progress.md) | [Back to README](README.md) | [Next: Phase 5 - Polish & Testing →](phase-5-polish-testing.md)

---

## Overview

This phase implements user profile management, app settings, and local notifications. Users can customize their experience, manage their goals, and configure gentle reminders.

**Timeline**: Week 4  
**Dependencies**: Phases 1-3 (All core functionality should be working)

---

## 4.1 Profile Screen

### Augment Code Prompt

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

---

## 4.2 Notifications Setup

### Augment Code Prompt

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

---

## Acceptance Criteria

- [x] Profile screen shows accurate user data
- [x] Goal slider updates correctly
- [x] Settings persist across app restarts
- [x] Notifications schedule correctly based on settings
- [x] Edit profile updates Supabase
- [x] Sign out clears session and returns to auth
- [x] Avatar picker works for profile images
- [x] Units preference affects distance display throughout app
- [x] Theme preference changes app appearance (100% - all 34 files updated)
- [x] Daily reminder notification fires at scheduled time
- [x] Streak reminder only fires when no steps logged
- [x] Goal celebration notification triggers when goal met
- [x] Data export generates valid JSON file
- [x] Delete account removes all user data
- [x] Permission status displays correctly
- [x] All toggles provide immediate visual feedback

**Status:** ✅ **17/17 Acceptance Criteria Met** - Phase 4 is 100% complete

---

[← Previous: Phase 3 - History & Progress](phase-3-history-progress.md) | [Back to README](README.md) | [Next: Phase 5 - Polish & Testing →](phase-5-polish-testing.md)

