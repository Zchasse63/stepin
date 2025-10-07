# Phase 2: Core Step Tracking (Week 2)

[← Previous: Phase 1 - Foundation & Authentication](phase-1-foundation-auth.md) | [Back to README](README.md) | [Next: Phase 3 - History & Progress →](phase-3-history-progress.md)

---

## Overview

This phase implements the core functionality of Stepin: tracking steps from health data sources and displaying them in an encouraging, user-friendly interface. The Today screen becomes the heart of the app.

**Timeline**: Week 2  
**Dependencies**: Phase 1 (Authentication and database must be complete)

---

## 2.1 Health Data Integration

### Augment Code Prompt

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

---

## 2.2 Today Screen (Primary Interface)

### Augment Code Prompt

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

---

## Acceptance Criteria

- [ ] Today screen displays current step count from HealthKit/Health Connect
- [ ] Progress ring animates smoothly
- [ ] Encouraging messages update based on progress
- [ ] Manual walk logging works and updates display immediately
- [ ] Streak calculations are accurate
- [ ] All data syncs to Supabase correctly
- [ ] Screen is responsive and fast (<100ms interactions)
- [ ] Health permissions are requested gracefully
- [ ] Fallback to manual entry works when permissions denied
- [ ] Pull to refresh updates step count
- [ ] Confetti animation triggers when goal is reached

---

[← Previous: Phase 1 - Foundation & Authentication](phase-1-foundation-auth.md) | [Back to README](README.md) | [Next: Phase 3 - History & Progress →](phase-3-history-progress.md)

