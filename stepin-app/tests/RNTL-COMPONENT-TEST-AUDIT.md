# React Native Testing Library (RNTL) Component Test Audit
**Generated**: 2025-10-15  
**Purpose**: Comprehensive roadmap for writing RNTL component tests for the Steppin app

---

## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| **Total Components Identified** | 58 components |
| **Total Screens Identified** | 11 screens |
| **Already Tested (RNTL)** | 5 components |
| **Remaining to Test** | 64 items |
| **Estimated Total Test Cases** | 450-550 tests |
| **Estimated Effort** | 8-12 days |

---

## 🎯 Testing Priority Framework

### Priority Levels Defined

- **CRITICAL**: User-facing features with E2E test gaps, complex logic, or high user impact
- **HIGH**: Important UI components with moderate complexity or frequent user interaction
- **MEDIUM**: Supporting components with simpler logic or less frequent interaction
- **LOW**: Simple display components with minimal logic

---

## ✅ Already Tested Components (5 components, 58 tests)

| Component | File Path | Tests | Status |
|-----------|-----------|-------|--------|
| StepCircle | `components/StepCircle.tsx` | 15 tests | ✅ Complete |
| StatsCard | `components/StatsCard.tsx` | 14 tests | ✅ Complete |
| WalkListItem | `components/WalkListItem.tsx` | 13 tests | ✅ Complete |
| EmptyState | `components/EmptyState.tsx` | 8 tests | ✅ Complete |
| ErrorBoundary | `components/ErrorBoundary.tsx` | 8 tests | ✅ Complete |

---

## 🔴 CRITICAL PRIORITY (15 items, ~180-220 tests)

### 1. Walk Logging & Management (4 components, ~80-100 tests)

#### LogWalkModal
- **File**: `components/LogWalkModal.tsx`
- **Type**: Form Modal
- **Lines**: 365
- **Priority**: CRITICAL
- **Why**: Core feature with failing E2E tests due to scrolling issues
- **Estimated Tests**: 25-30

**Test Scenarios**:
- ✅ Rendering: Modal visibility, initial state, form fields present
- ✅ Form Validation: Steps validation (required, positive, max value), duration validation (optional, positive, max value)
- ✅ User Interactions: Input changes, form submission, modal close, keyboard handling
- ✅ Error States: Invalid steps alert, unusually high steps confirmation, invalid duration alert
- ✅ Success States: Successful walk logging, onWalkLogged callback, form reset after submission
- ✅ Edge Cases: Empty inputs, zero values, negative values, very large values, null duration

**Dependencies/Mocks**:
- `useTheme` hook
- `useAuthStore` (user state)
- `supabase` client
- `Alert` API
- `validation` utilities

---

#### EditWalkModal
- **File**: `components/EditWalkModal.tsx`
- **Type**: Form Modal
- **Lines**: 320
- **Priority**: CRITICAL
- **Why**: Complex form with date/time pickers, validation, and data updates
- **Estimated Tests**: 25-30

**Test Scenarios**:
- ✅ Rendering: Modal visibility with walk data, form pre-population, date/time pickers
- ✅ Form Validation: Steps, distance, duration validation, date validation
- ✅ User Interactions: Input changes, date picker interactions, time picker interactions, save button
- ✅ Data Updates: Form initialization from walk prop, updates to walk data, onSave callback
- ✅ Error States: Invalid inputs, save errors, validation alerts
- ✅ Edge Cases: Null walk prop, missing optional fields, date/time edge cases

**Dependencies/Mocks**:
- `useTheme` hook
- `DateTimePicker` component
- `Alert` API
- Walk type

---

#### WalkDetailsSheet
- **File**: `components/WalkDetailsSheet.tsx`
- **Type**: Bottom Sheet Modal
- **Priority**: CRITICAL
- **Why**: Displays detailed walk information, edit/delete actions
- **Estimated Tests**: 15-20

**Test Scenarios**:
- ✅ Rendering: Sheet visibility, walk data display, action buttons
- ✅ Data Display: Steps, duration, distance, date/time, heart rate (if available)
- ✅ User Interactions: Edit button, delete button, close button
- ✅ Conditional Rendering: Heart rate badge, distance display, duration display
- ✅ Callbacks: onEdit, onDelete, onClose

**Dependencies/Mocks**:
- `useTheme` hook
- Walk type
- `formatDistance`, `formatDuration` utilities

---

#### WalksList
- **File**: `components/WalksList.tsx`
- **Type**: List Component
- **Priority**: CRITICAL
- **Why**: Displays list of walks with filtering and sorting
- **Estimated Tests**: 15-20

**Test Scenarios**:
- ✅ Rendering: Empty state, list with walks, loading state
- ✅ Data Display: Walk items rendered correctly, sorted by date
- ✅ User Interactions: Walk item press, delete walk, refresh
- ✅ Empty States: No walks message, empty period message
- ✅ Performance: FlatList optimization, staggered animations

**Dependencies/Mocks**:
- `useTheme` hook
- `WalkListItem` component
- Walk array

---

### 2. Goal Management (3 components, ~50-60 tests)

#### GoalAdjustmentModal
- **File**: `components/GoalAdjustmentModal.tsx`
- **Type**: Modal
- **Lines**: 400
- **Priority**: CRITICAL
- **Why**: Adaptive goal suggestions with E2E test gaps
- **Estimated Tests**: 20-25

**Test Scenarios**:
- ✅ Rendering: Modal visibility, suggestion display, icon/color based on suggestion type
- ✅ Suggestion Types: Increase goal, decrease goal, optimal goal
- ✅ User Interactions: Accept button, decline button, close button
- ✅ Data Display: Current goal, suggested goal, reason, confidence level
- ✅ Conditional Rendering: Different titles/icons for increase/decrease/optimal
- ✅ Callbacks: onAccept, onDecline, onClose

**Dependencies/Mocks**:
- `useTheme` hook
- `GoalSuggestion` type

---

#### GoalSlider
- **File**: `components/GoalSlider.tsx`
- **Type**: Interactive Component
- **Lines**: 166
- **Priority**: CRITICAL
- **Why**: Core goal-setting UI with gesture interactions (E2E limitation)
- **Estimated Tests**: 15-20

**Test Scenarios**:
- ✅ Rendering: Slider component, current value display, min/max labels
- ✅ Value Changes: onValueChange callback, value rounding (500 increments), value display updates
- ✅ Slider Interactions: Sliding complete callback, haptic feedback (iOS)
- ✅ Bounds: Min value (2000), max value (20000), step increment (500)
- ✅ Formatting: Number formatting with commas

**Dependencies/Mocks**:
- `useTheme` hook
- `Slider` component
- `Haptics` API

---

#### GoalCelebrationModal
- **File**: `components/GoalCelebrationModal.tsx`
- **Type**: Celebration Modal
- **Priority**: HIGH
- **Why**: User engagement feature, celebration animations
- **Estimated Tests**: 15-18

**Test Scenarios**:
- ✅ Rendering: Modal visibility, celebration message, confetti animation
- ✅ Data Display: Steps achieved, goal value, celebration message
- ✅ User Interactions: Close button, share button (if applicable)
- ✅ Animations: Confetti trigger, modal entrance/exit
- ✅ Callbacks: onClose

**Dependencies/Mocks**:
- `useTheme` hook
- `ConfettiCelebration` component

---

### 3. Social Features (4 components, ~50-60 tests)

#### AddBuddyModal
- **File**: `components/AddBuddyModal.tsx`
- **Type**: Form Modal
- **Lines**: 290
- **Priority**: CRITICAL
- **Why**: Core social feature with E2E test coverage
- **Estimated Tests**: 15-18

**Test Scenarios**:
- ✅ Rendering: Modal visibility, email input field, send button
- ✅ Form Validation: Email validation (required, format), error alerts
- ✅ User Interactions: Email input changes, send button press, close button
- ✅ Loading States: Submitting state, loading indicator
- ✅ Success States: Success alert, form reset, modal close
- ✅ Error States: Invalid email alert, send error handling

**Dependencies/Mocks**:
- `useTheme` hook
- `useSocialStore` (sendBuddyRequest, loading)
- `Alert` API

---

#### BuddyListItem
- **File**: `components/BuddyListItem.tsx`
- **Type**: List Item Component
- **Lines**: 144
- **Priority**: CRITICAL
- **Why**: Core social feature display
- **Estimated Tests**: 12-15

**Test Scenarios**:
- ✅ Rendering: Avatar (image or placeholder), display name, status text
- ✅ Data Display: Buddy profile data, initials for missing avatar
- ✅ User Interactions: Remove button, block button (if provided)
- ✅ Conditional Rendering: Avatar image vs placeholder, block button visibility
- ✅ Callbacks: onRemove, onBlock

**Dependencies/Mocks**:
- `useTheme` hook
- `BuddyWithProfile` type

---

#### PendingRequestCard
- **File**: `components/PendingRequestCard.tsx`
- **Type**: Card Component
- **Priority**: HIGH
- **Why**: Social feature interaction
- **Estimated Tests**: 12-15

**Test Scenarios**:
- ✅ Rendering: Request card, sender info, accept/decline buttons
- ✅ Data Display: Sender name, sender email, request date
- ✅ User Interactions: Accept button, decline button
- ✅ Loading States: Accept loading, decline loading
- ✅ Callbacks: onAccept, onDecline

**Dependencies/Mocks**:
- `useTheme` hook
- Buddy request type

---

#### ActivityCard
- **File**: `components/ActivityCard.tsx`
- **Type**: Card Component
- **Priority**: HIGH
- **Why**: Social activity feed display
- **Estimated Tests**: 12-15

**Test Scenarios**:
- ✅ Rendering: Activity card, user info, activity details
- ✅ Data Display: Activity type, timestamp, user name, activity data
- ✅ User Interactions: Kudos button, delete button (if own activity)
- ✅ Conditional Rendering: Different activity types, kudos state
- ✅ Callbacks: onKudos, onDelete

**Dependencies/Mocks**:
- `useTheme` hook
- Activity type

---

### 4. Profile Management (1 component, ~15-20 tests)

#### ProfileHeader
- **File**: `components/ProfileHeader.tsx`
- **Type**: Display Component
- **Lines**: 162
- **Priority**: CRITICAL
- **Why**: User identity display, edit profile access
- **Estimated Tests**: 15-20

**Test Scenarios**:
- ✅ Rendering: Avatar, display name, email, edit button
- ✅ Data Display: Display name or fallback, email, avatar image or initials
- ✅ Initials Logic: Two-word name, single-word name, email fallback
- ✅ User Interactions: Edit button press, navigation to edit profile
- ✅ Loading States: Loading indicator
- ✅ Conditional Rendering: Avatar image vs placeholder

**Dependencies/Mocks**:
- `useTheme` hook
- `useRouter` hook

---

## 🟠 HIGH PRIORITY (18 items, ~150-180 tests)

### 5. History & Analytics Components (6 components, ~60-70 tests)

#### CalendarHeatMap
- **File**: `components/CalendarHeatMap.tsx`
- **Type**: Data Visualization
- **Priority**: HIGH
- **Why**: Complex visualization component, user engagement
- **Estimated Tests**: 15-18

**Test Scenarios**:
- ✅ Rendering: Calendar grid, day cells, color coding
- ✅ Data Display: Daily stats visualization, goal met indicators
- ✅ User Interactions: Day cell press, date selection
- ✅ Color Coding: Different colors for different step ranges
- ✅ Empty States: No data for date range
- ✅ Callbacks: onDayPress

**Dependencies/Mocks**:
- `useTheme` hook
- Daily stats array

---

#### DayDetailsCard
- **File**: `components/DayDetailsCard.tsx`
- **Type**: Card Component
- **Priority**: HIGH
- **Why**: Detailed day statistics display
- **Estimated Tests**: 12-15

**Test Scenarios**:
- ✅ Rendering: Card with day stats, walks list
- ✅ Data Display: Total steps, walks count, goal status
- ✅ Conditional Rendering: Goal met badge, no walks message
- ✅ User Interactions: Walk item press
- ✅ Callbacks: onWalkPress

**Dependencies/Mocks**:
- `useTheme` hook
- Daily stats type
- Walks array

---

#### StepsBarChart
- **File**: `components/StepsBarChart.tsx`
- **Type**: Data Visualization
- **Priority**: HIGH
- **Why**: Visual analytics component
- **Estimated Tests**: 12-15

**Test Scenarios**:
- ✅ Rendering: Bar chart, axis labels, bars
- ✅ Data Display: Steps per day, goal line
- ✅ Scaling: Y-axis scaling, bar heights
- ✅ Empty States: No data message
- ✅ Accessibility: Chart description

**Dependencies/Mocks**:
- `useTheme` hook
- Daily stats array

---

#### SummaryStatsGrid
- **File**: `components/SummaryStatsGrid.tsx`
- **Type**: Grid Component
- **Priority**: HIGH
- **Why**: Summary statistics display
- **Estimated Tests**: 10-12

**Test Scenarios**:
- ✅ Rendering: Grid of stats cards
- ✅ Data Display: Total steps, average steps, days goal met, percentage
- ✅ Loading States: Loading placeholders
- ✅ Empty States: Zero values

**Dependencies/Mocks**:
- `useTheme` hook
- `StatsCard` component
- Summary stats type

---

#### InsightsSection
- **File**: `components/InsightsSection.tsx`
- **Type**: Section Component
- **Priority**: HIGH
- **Why**: User engagement, insights display
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Insights list, insight cards
- ✅ Data Display: Insight text, icons, types
- ✅ Empty States: No insights message
- ✅ Conditional Rendering: Different insight types

**Dependencies/Mocks**:
- `useTheme` hook
- `InsightsCard` component
- Insights array

---

#### TimePeriodSelector
- **File**: `components/TimePeriodSelector.tsx`
- **Type**: Selector Component
- **Priority**: HIGH
- **Why**: Navigation control for history views
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Period buttons (Week, Month, Year)
- ✅ User Interactions: Period selection, active state
- ✅ Callbacks: onPeriodChange
- ✅ Visual States: Active vs inactive buttons

**Dependencies/Mocks**:
- `useTheme` hook
- `TimePeriod` type

---

### 6. Display Components (7 components, ~50-60 tests)

#### StreakDisplay
- **File**: `components/StreakDisplay.tsx`
- **Type**: Display Component
- **Priority**: HIGH
- **Why**: Gamification feature, user motivation
- **Estimated Tests**: 10-12

**Test Scenarios**:
- ✅ Rendering: Streak count, flame icon, streak text
- ✅ Data Display: Current streak, longest streak
- ✅ Visual States: Active streak vs no streak
- ✅ Conditional Rendering: Streak freeze indicator

**Dependencies/Mocks**:
- `useTheme` hook
- Streak type

---

#### StatsGrid
- **File**: `components/StatsGrid.tsx`
- **Type**: Grid Component
- **Priority**: HIGH
- **Why**: Profile stats display
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Grid of stats (total walks, total steps, streak)
- ✅ Data Display: Formatted numbers, labels
- ✅ Loading States: Loading placeholders
- ✅ Empty States: Zero values

**Dependencies/Mocks**:
- `useTheme` hook
- `StatsCard` component
- Stats type

---

#### InsightsCard
- **File**: `components/InsightsCard.tsx`
- **Type**: Card Component
- **Priority**: HIGH
- **Why**: Insight display component
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Card with insight text, icon
- ✅ Data Display: Insight type, message
- ✅ Icon Mapping: Different icons for different insight types
- ✅ Visual States: Different colors for insight types

**Dependencies/Mocks**:
- `useTheme` hook
- Insight type

---

#### CalendarDay
- **File**: `components/CalendarDay.tsx`
- **Type**: Display Component
- **Priority**: MEDIUM
- **Why**: Part of calendar heat map
- **Estimated Tests**: 6-8

**Test Scenarios**:
- ✅ Rendering: Day cell, date number
- ✅ Data Display: Steps count, goal status
- ✅ Visual States: Selected, goal met, no data
- ✅ User Interactions: Day press
- ✅ Callbacks: onPress

**Dependencies/Mocks**:
- `useTheme` hook
- Day data type

---

#### SkeletonLoader
- **File**: `components/SkeletonLoader.tsx`
- **Type**: Loading Component
- **Priority**: MEDIUM
- **Why**: Loading state UX
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Skeleton shapes, animation
- ✅ Props: Width, height, borderRadius
- ✅ Animation: Pulse effect

**Dependencies/Mocks**:
- `useTheme` hook
- Animated API

---

#### EmptyHistoryState
- **File**: `components/EmptyHistoryState.tsx`
- **Type**: Empty State Component
- **Priority**: MEDIUM
- **Why**: User guidance
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Empty message, icon, call-to-action
- ✅ User Interactions: CTA button press
- ✅ Callbacks: onAction

**Dependencies/Mocks**:
- `useTheme` hook

---

#### EmptyPeriodState
- **File**: `components/EmptyPeriodState.tsx`
- **Type**: Empty State Component
- **Priority**: MEDIUM
- **Why**: User guidance for filtered views
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Empty message for selected period
- ✅ Data Display: Period name in message
- ✅ User Interactions: Change period button

**Dependencies/Mocks**:
- `useTheme` hook
- `TimePeriod` type

---

### 7. Settings Components (5 components, ~40-50 tests)

#### SettingsSection
- **File**: `components/SettingsSection.tsx`
- **Type**: Section Component
- **Priority**: HIGH
- **Why**: Settings organization
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Section header, children
- ✅ Data Display: Section title, description
- ✅ Layout: Proper spacing, borders

**Dependencies/Mocks**:
- `useTheme` hook

---

#### SettingRow
- **File**: `components/SettingRow.tsx`
- **Type**: Row Component
- **Priority**: HIGH
- **Why**: Settings interaction
- **Estimated Tests**: 10-12

**Test Scenarios**:
- ✅ Rendering: Row with label, value, icon
- ✅ User Interactions: Row press, chevron indicator
- ✅ Conditional Rendering: Switch, value text, chevron
- ✅ Callbacks: onPress, onValueChange (for switch)

**Dependencies/Mocks**:
- `useTheme` hook

---

#### HealthSettingsCard
- **File**: `components/HealthSettingsCard.tsx`
- **Type**: Card Component
- **Priority**: HIGH
- **Why**: Health permissions management
- **Estimated Tests**: 10-12

**Test Scenarios**:
- ✅ Rendering: Card with health settings
- ✅ Data Display: Permission status, sync status
- ✅ User Interactions: Request permissions, sync now
- ✅ Loading States: Syncing indicator
- ✅ Callbacks: onRequestPermissions, onSync

**Dependencies/Mocks**:
- `useTheme` hook
- Health service

---

#### TimePickerModal
- **File**: `components/TimePickerModal.tsx`
- **Type**: Modal
- **Priority**: MEDIUM
- **Why**: Time selection for notifications
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Modal with time picker
- ✅ User Interactions: Time selection, save, cancel
- ✅ Callbacks: onSave, onCancel
- ✅ Platform Differences: iOS vs Android picker

**Dependencies/Mocks**:
- `useTheme` hook
- `DateTimePicker` component

---

#### HistoricalImportModal
- **File**: `components/HistoricalImportModal.tsx`
- **Type**: Modal
- **Priority**: MEDIUM
- **Why**: Data import feature
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Modal with import options
- ✅ User Interactions: Date range selection, import button
- ✅ Loading States: Importing indicator
- ✅ Success/Error States: Import success, import error
- ✅ Callbacks: onImport, onClose

**Dependencies/Mocks**:
- `useTheme` hook
- Health service

---

## 🟡 MEDIUM PRIORITY (16 items, ~80-100 tests)

### 8. Celebration & Notification Components (5 components, ~30-35 tests)

#### StreakMilestoneModal
- **File**: `components/StreakMilestoneModal.tsx`
- **Type**: Celebration Modal
- **Priority**: MEDIUM
- **Why**: User engagement, milestone celebration
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Modal with milestone message, streak count
- ✅ Data Display: Milestone type, streak value
- ✅ User Interactions: Close button, share button
- ✅ Animations: Celebration animation
- ✅ Callbacks: onClose, onShare

**Dependencies/Mocks**:
- `useTheme` hook
- Streak milestone type

---

#### BadgeCelebrationModal
- **File**: `components/BadgeCelebrationModal.tsx`
- **Type**: Celebration Modal
- **Priority**: MEDIUM
- **Why**: Achievement system
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Modal with badge display
- ✅ Data Display: Badge name, description, icon
- ✅ User Interactions: Close button
- ✅ Animations: Badge reveal animation
- ✅ Callbacks: onClose

**Dependencies/Mocks**:
- `useTheme` hook
- Badge type

---

#### ConfettiCelebration
- **File**: `components/ConfettiCelebration.tsx`
- **Type**: Animation Component
- **Priority**: MEDIUM
- **Why**: Visual celebration effect
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Confetti animation
- ✅ Props: Trigger, duration, colors
- ✅ Animation: Start/stop confetti

**Dependencies/Mocks**:
- Confetti library
- Animated API

---

#### NotificationPermissionBanner
- **File**: `components/NotificationPermissionBanner.tsx`
- **Type**: Banner Component
- **Priority**: MEDIUM
- **Why**: Permission request UX
- **Estimated Tests**: 6-8

**Test Scenarios**:
- ✅ Rendering: Banner with permission request message
- ✅ User Interactions: Enable button, dismiss button
- ✅ Callbacks: onEnable, onDismiss
- ✅ Conditional Rendering: Show/hide based on permission status

**Dependencies/Mocks**:
- `useTheme` hook
- Notification service

---

#### PermissionBanner
- **File**: `components/PermissionBanner.tsx`
- **Type**: Banner Component
- **Priority**: MEDIUM
- **Why**: Generic permission request
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Banner with custom message
- ✅ User Interactions: Action button, dismiss button
- ✅ Callbacks: onAction, onDismiss
- ✅ Props: Message, action text, icon

**Dependencies/Mocks**:
- `useTheme` hook

---

### 9. Social & Sharing Components (4 components, ~20-25 tests)

#### PostActivityModal
- **File**: `components/PostActivityModal.tsx`
- **Type**: Modal
- **Priority**: MEDIUM
- **Why**: Social sharing feature
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Modal with activity details, caption input
- ✅ User Interactions: Caption input, post button, cancel button
- ✅ Loading States: Posting indicator
- ✅ Success/Error States: Post success, post error
- ✅ Callbacks: onPost, onCancel

**Dependencies/Mocks**:
- `useTheme` hook
- `useSocialStore`

---

#### KudosButton
- **File**: `components/KudosButton.tsx`
- **Type**: Interactive Component
- **Priority**: MEDIUM
- **Why**: Social interaction
- **Estimated Tests**: 6-8

**Test Scenarios**:
- ✅ Rendering: Button with kudos icon, count
- ✅ User Interactions: Button press, kudos toggle
- ✅ Visual States: Given kudos vs not given
- ✅ Callbacks: onPress
- ✅ Animation: Heart animation on kudos

**Dependencies/Mocks**:
- `useTheme` hook

---

#### BuddyPreview
- **File**: `components/BuddyPreview.tsx`
- **Type**: Preview Component
- **Priority**: MEDIUM
- **Why**: Buddy profile preview
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Buddy avatar, name, stats preview
- ✅ Data Display: Buddy profile data
- ✅ User Interactions: View profile button
- ✅ Callbacks: onViewProfile

**Dependencies/Mocks**:
- `useTheme` hook
- Buddy profile type

---

#### InviteFriend
- **File**: `components/InviteFriend.tsx`
- **Type**: Action Component
- **Priority**: MEDIUM
- **Why**: User growth feature
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Invite button, message
- ✅ User Interactions: Invite button press
- ✅ Callbacks: onInvite
- ✅ Share Sheet: Native share integration

**Dependencies/Mocks**:
- `useTheme` hook
- Share API

---

### 10. Miscellaneous Components (7 components, ~30-40 tests)

#### AnimatedButton
- **File**: `components/AnimatedButton.tsx`
- **Type**: Interactive Component
- **Priority**: MEDIUM
- **Why**: Reusable button with animations
- **Estimated Tests**: 8-10

**Test Scenarios**:
- ✅ Rendering: Button with label, icon
- ✅ User Interactions: Press, press in/out animations
- ✅ Props: Variant, size, disabled state
- ✅ Animations: Scale animation on press
- ✅ Callbacks: onPress

**Dependencies/Mocks**:
- `useTheme` hook
- Animated API

---

#### ProfileButton
- **File**: `components/ProfileButton.tsx`
- **Type**: Navigation Component
- **Priority**: MEDIUM
- **Why**: Profile access
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Button with avatar or icon
- ✅ User Interactions: Button press
- ✅ Callbacks: onPress
- ✅ Visual States: With/without avatar

**Dependencies/Mocks**:
- `useTheme` hook

---

#### HealthPermissionDeniedBanner
- **File**: `components/HealthPermissionDeniedBanner.tsx`
- **Type**: Banner Component
- **Priority**: MEDIUM
- **Why**: Permission guidance
- **Estimated Tests**: 6-8

**Test Scenarios**:
- ✅ Rendering: Banner with denied message
- ✅ User Interactions: Open settings button, dismiss button
- ✅ Callbacks: onOpenSettings, onDismiss
- ✅ Persistence: Dismiss state storage

**Dependencies/Mocks**:
- `useTheme` hook
- AsyncStorage

---

#### OfflineBanner
- **File**: `components/OfflineBanner.tsx`
- **Type**: Banner Component
- **Priority**: MEDIUM
- **Why**: Offline state indication
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Banner with offline message
- ✅ Conditional Rendering: Show/hide based on network status
- ✅ Auto-dismiss: Hide when back online

**Dependencies/Mocks**:
- `useTheme` hook
- Network state

---

#### ConflictResolutionModal
- **File**: `components/ConflictResolutionModal.tsx`
- **Type**: Modal
- **Priority**: LOW
- **Why**: Data sync conflict handling
- **Estimated Tests**: 6-8

**Test Scenarios**:
- ✅ Rendering: Modal with conflict details
- ✅ Data Display: Local vs remote data
- ✅ User Interactions: Keep local, keep remote, merge
- ✅ Callbacks: onResolve

**Dependencies/Mocks**:
- `useTheme` hook
- Conflict type

---

#### HeartRateZone
- **File**: `components/HeartRateZone.tsx`
- **Type**: Display Component
- **Priority**: LOW
- **Why**: Heart rate analytics
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Zone indicator, heart rate value
- ✅ Data Display: Zone name, color coding
- ✅ Zone Calculation: Different zones based on HR

**Dependencies/Mocks**:
- `useTheme` hook
- Heart rate data

---

#### HeartRateAnalytics
- **File**: `components/HeartRateAnalytics.tsx`
- **Type**: Analytics Component
- **Priority**: LOW
- **Why**: Advanced heart rate data
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: HR chart, zone breakdown
- ✅ Data Display: Average HR, max HR, time in zones
- ✅ Empty States: No HR data

**Dependencies/Mocks**:
- `useTheme` hook
- Heart rate analytics data

---

## 🔵 LOW PRIORITY (9 items, ~40-50 tests)

### 11. Specialized Components (9 components, ~40-50 tests)

#### QRCodeDisplay
- **File**: `components/QRCodeDisplay.tsx`
- **Type**: Display Component
- **Priority**: LOW
- **Why**: QR code sharing feature
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: QR code image, user ID
- ✅ Data Display: QR code generation from user ID
- ✅ Props: Size, color

**Dependencies/Mocks**:
- `useTheme` hook
- QR code library

---

#### QRScanner
- **File**: `components/QRScanner.tsx`
- **Type**: Camera Component
- **Priority**: LOW
- **Why**: QR code scanning feature
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Camera view, scan overlay
- ✅ User Interactions: Scan success, scan error
- ✅ Callbacks: onScan, onError
- ✅ Permissions: Camera permission handling

**Dependencies/Mocks**:
- `useTheme` hook
- Camera API
- QR scanner library

---

#### BuddySearch
- **File**: `components/BuddySearch.tsx`
- **Type**: Search Component
- **Priority**: LOW
- **Why**: Buddy discovery feature
- **Estimated Tests**: 6-8

**Test Scenarios**:
- ✅ Rendering: Search input, results list
- ✅ User Interactions: Search input changes, result selection
- ✅ Loading States: Searching indicator
- ✅ Empty States: No results message
- ✅ Callbacks: onSelect

**Dependencies/Mocks**:
- `useTheme` hook
- `useSocialStore`

---

#### BuddySearchResult
- **File**: `components/BuddySearchResult.tsx`
- **Type**: List Item Component
- **Priority**: LOW
- **Why**: Search result display
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: User avatar, name, email
- ✅ User Interactions: Result press, add button
- ✅ Callbacks: onPress, onAdd

**Dependencies/Mocks**:
- `useTheme` hook
- User search result type

---

#### ContactsSync
- **File**: `components/ContactsSync.tsx`
- **Type**: Feature Component
- **Priority**: LOW
- **Why**: Contacts integration
- **Estimated Tests**: 6-8

**Test Scenarios**:
- ✅ Rendering: Contacts list, sync button
- ✅ User Interactions: Sync contacts, select contact
- ✅ Permissions: Contacts permission handling
- ✅ Loading States: Syncing indicator
- ✅ Callbacks: onSync, onSelect

**Dependencies/Mocks**:
- `useTheme` hook
- Contacts API

---

#### MapView
- **File**: `components/MapView.tsx`
- **Type**: Map Component
- **Priority**: LOW
- **Why**: Walk route visualization
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Map component, route overlay
- ✅ Data Display: Walk route, markers
- ✅ Props: Route data, zoom level
- ✅ User Interactions: Map gestures

**Dependencies/Mocks**:
- `useTheme` hook
- Mapbox library

---

#### SentryTestButton
- **File**: `components/SentryTestButton.tsx`
- **Type**: Debug Component
- **Priority**: LOW
- **Why**: Development/testing only
- **Estimated Tests**: 3-4

**Test Scenarios**:
- ✅ Rendering: Button (dev mode only)
- ✅ User Interactions: Button press triggers Sentry test
- ✅ Conditional Rendering: Only in dev mode

**Dependencies/Mocks**:
- Sentry SDK

---

#### Onboarding Components (2 components, ~8-10 tests)

##### OnboardingStep
- **File**: `components/onboarding/OnboardingStep.tsx`
- **Type**: Onboarding Component
- **Priority**: LOW
- **Why**: First-time user experience
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Step content, image, text
- ✅ Props: Step data, current step index
- ✅ User Interactions: Next button, skip button
- ✅ Callbacks: onNext, onSkip

**Dependencies/Mocks**:
- `useTheme` hook

---

##### ProgressDots
- **File**: `components/onboarding/ProgressDots.tsx`
- **Type**: Progress Indicator
- **Priority**: LOW
- **Why**: Onboarding progress
- **Estimated Tests**: 3-4

**Test Scenarios**:
- ✅ Rendering: Dots for each step
- ✅ Visual States: Active vs inactive dots
- ✅ Props: Total steps, current step

**Dependencies/Mocks**:
- `useTheme` hook

---

## 📱 SCREENS (11 screens, ~100-120 tests)

### CRITICAL Priority Screens (3 screens, ~50-60 tests)

#### TodayScreen
- **File**: `app/(tabs)/index.tsx`
- **Type**: Main Screen
- **Lines**: 1074
- **Priority**: CRITICAL
- **Why**: Primary user interface, complex state management
- **Estimated Tests**: 25-30

**Test Scenarios**:
- ✅ Rendering: Step circle, stats cards, streak display, log walk button
- ✅ Data Display: Steps from store, goal from profile, streak data
- ✅ User Interactions: Log walk button, refresh, profile button
- ✅ Modal States: LogWalkModal, GoalCelebrationModal, StreakMilestoneModal, PostActivityModal
- ✅ Loading States: Initial load, refreshing
- ✅ Empty States: No data, first-time user
- ✅ Celebrations: Goal met confetti, streak milestone
- ✅ Permissions: Health permission banner, notification banner
- ✅ Weather: Weather display (if available)

**Dependencies/Mocks**:
- `useHealthStore`, `useAuthStore`, `useProfileStore`, `useActiveWalkStore`
- All child components (StepCircle, StatsCard, StreakDisplay, etc.)
- `supabase` client
- Weather service
- AsyncStorage

---

#### BuddiesScreen
- **File**: `app/(tabs)/buddies.tsx`
- **Type**: Social Screen
- **Lines**: 660
- **Priority**: CRITICAL
- **Why**: Core social feature
- **Estimated Tests**: 20-25

**Test Scenarios**:
- ✅ Rendering: Tab selector, buddy list, activity feed, pending requests
- ✅ Tab Navigation: Activity tab, buddies tab
- ✅ Data Display: Buddies list, activity feed items, pending requests
- ✅ User Interactions: Add buddy button, accept/decline requests, remove buddy
- ✅ Search: Buddy search functionality
- ✅ Modals: AddBuddyModal, discovery modal
- ✅ Loading States: Initial load, refreshing
- ✅ Empty States: No buddies, no activity, no pending requests

**Dependencies/Mocks**:
- `useSocialStore`, `useAuthStore`
- All child components (BuddyListItem, ActivityCard, PendingRequestCard, etc.)

---

#### ProfileScreen
- **File**: `app/profile.tsx`
- **Type**: Settings Screen
- **Lines**: 1164
- **Priority**: CRITICAL
- **Why**: User settings and profile management
- **Estimated Tests**: 20-25

**Test Scenarios**:
- ✅ Rendering: ProfileHeader, StatsGrid, settings sections
- ✅ Data Display: Profile data, stats, settings values
- ✅ User Interactions: Edit profile, goal slider, settings toggles, sign out
- ✅ Modals: TimePickerModal, units modal, theme modal, historical import modal
- ✅ Settings: Notifications, units, theme, walk time, weather interval
- ✅ Permissions: Notification permission banner, health settings
- ✅ Data Management: Export data, delete account
- ✅ Loading States: Profile loading, stats loading

**Dependencies/Mocks**:
- `useAuthStore`, `useProfileStore`, `useSocialStore`
- All child components (ProfileHeader, StatsGrid, SettingsSection, etc.)
- Notification service
- Location service
- Health service

---

### HIGH Priority Screens (2 screens, ~30-35 tests)

#### HistoryScreen
- **File**: `app/(tabs)/history.tsx`
- **Type**: Analytics Screen
- **Lines**: 424
- **Priority**: HIGH
- **Why**: Historical data visualization
- **Estimated Tests**: 18-20

**Test Scenarios**:
- ✅ Rendering: TimePeriodSelector, CalendarHeatMap, SummaryStatsGrid, StepsBarChart
- ✅ Period Selection: Week, month, year views
- ✅ Data Display: Daily stats, walks list, insights
- ✅ User Interactions: Day selection, walk selection, edit walk, delete walk
- ✅ Modals: WalkDetailsSheet, EditWalkModal
- ✅ Loading States: Initial load, period change
- ✅ Empty States: No data for period, no walks for day
- ✅ Animations: Fade transitions on period change

**Dependencies/Mocks**:
- `useHistoryStore`, `useAuthStore`, `useProfileStore`
- All child components (TimePeriodSelector, CalendarHeatMap, etc.)
- History data utilities

---

#### InsightsScreen
- **File**: `app/(tabs)/insights.tsx`
- **Type**: Analytics Screen
- **Lines**: 313
- **Priority**: HIGH
- **Why**: User engagement, analytics
- **Estimated Tests**: 12-15

**Test Scenarios**:
- ✅ Rendering: Insights cards, analytics charts
- ✅ Data Display: Weekly average, best day, consistency
- ✅ Calculations: Averages, comparisons, trends
- ✅ Loading States: Initial load
- ✅ Empty States: No data

**Dependencies/Mocks**:
- `useProfileStore`, `useHistoryStore`, `useAuthStore`
- History data utilities

---

### MEDIUM Priority Screens (6 screens, ~20-25 tests)

#### SignInScreen
- **File**: `app/(auth)/sign-in.tsx`
- **Type**: Auth Screen
- **Priority**: MEDIUM
- **Why**: Already covered by E2E tests
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Email input, password input, sign in button
- ✅ Form Validation: Email format, password required
- ✅ User Interactions: Input changes, sign in button press
- ✅ Error States: Invalid credentials, network error
- ✅ Navigation: Forgot password link, sign up link

**Dependencies/Mocks**:
- `useAuthStore`

---

#### SignUpScreen
- **File**: `app/(auth)/sign-up.tsx`
- **Type**: Auth Screen
- **Priority**: MEDIUM
- **Why**: Already covered by E2E tests
- **Estimated Tests**: 5-6

**Test Scenarios**:
- ✅ Rendering: Name, email, password, confirm password inputs
- ✅ Form Validation: All fields required, password match, email format
- ✅ User Interactions: Input changes, sign up button press
- ✅ Error States: Validation errors, account exists
- ✅ Navigation: Sign in link

**Dependencies/Mocks**:
- `useAuthStore`

---

#### ForgotPasswordScreen
- **File**: `app/(auth)/forgot-password.tsx`
- **Type**: Auth Screen
- **Priority**: LOW
- **Why**: Simple form, already covered by E2E tests
- **Estimated Tests**: 3-4

**Test Scenarios**:
- ✅ Rendering: Email input, reset button
- ✅ Form Validation: Email format
- ✅ User Interactions: Submit, success message

**Dependencies/Mocks**:
- `supabase` client

---

#### OnboardingScreen
- **File**: `app/(auth)/onboarding.tsx`
- **Type**: Onboarding Screen
- **Priority**: LOW
- **Why**: First-time user flow
- **Estimated Tests**: 3-4

**Test Scenarios**:
- ✅ Rendering: Onboarding steps, progress dots
- ✅ User Interactions: Next, skip, complete
- ✅ Navigation: Complete onboarding

**Dependencies/Mocks**:
- Onboarding components

---

#### MapScreen
- **File**: `app/(tabs)/map.tsx`
- **Type**: Map Screen
- **Priority**: LOW
- **Why**: Specialized feature
- **Estimated Tests**: 3-4

**Test Scenarios**:
- ✅ Rendering: Map component, walk routes
- ✅ Data Display: Walk routes on map
- ✅ User Interactions: Map gestures, route selection

**Dependencies/Mocks**:
- MapView component
- Walk routes data

---

#### Modal Screens (5 screens, ~5-6 tests)

All modal screens are simple wrappers around components already tested:
- `app/modals/buddy-preview.tsx` - Uses BuddyPreview component
- `app/modals/buddy-search.tsx` - Uses BuddySearch component
- `app/modals/contacts-sync.tsx` - Uses ContactsSync component
- `app/modals/edit-profile.tsx` - Profile edit form
- `app/modals/qr-scan.tsx` - Uses QRScanner component
- `app/modals/show-qr.tsx` - Uses QRCodeDisplay component

**Estimated Tests**: 1-2 per modal (just test modal wrapper, not component logic)

---

## 📋 TESTING STRATEGY & RECOMMENDATIONS

### Suggested Testing Order

#### Phase 1: Critical Walk Logging (Week 1)
1. LogWalkModal (25-30 tests) - **HIGHEST PRIORITY**
2. EditWalkModal (25-30 tests)
3. WalkDetailsSheet (15-20 tests)
4. WalksList (15-20 tests)

**Rationale**: These components have failing E2E tests due to Maestro scrolling limitations. RNTL tests will provide reliable coverage for walk logging functionality.

**Estimated Effort**: 3-4 days

---

#### Phase 2: Goal Management (Week 1-2)
5. GoalAdjustmentModal (20-25 tests)
6. GoalSlider (15-20 tests)
7. GoalCelebrationModal (15-18 tests)

**Rationale**: Core goal-setting features with gesture interactions that Maestro can't test reliably.

**Estimated Effort**: 2-3 days

---

#### Phase 3: Social Features (Week 2)
8. AddBuddyModal (15-18 tests)
9. BuddyListItem (12-15 tests)
10. PendingRequestCard (12-15 tests)
11. ActivityCard (12-15 tests)

**Rationale**: Social features are critical for user engagement and have E2E coverage gaps.

**Estimated Effort**: 2-3 days

---

#### Phase 4: Profile & Display Components (Week 2-3)
12. ProfileHeader (15-20 tests)
13. StreakDisplay (10-12 tests)
14. StatsGrid (8-10 tests)
15. InsightsCard (8-10 tests)

**Rationale**: User-facing components that display critical data.

**Estimated Effort**: 2 days

---

#### Phase 5: History & Analytics (Week 3)
16. CalendarHeatMap (15-18 tests)
17. DayDetailsCard (12-15 tests)
18. StepsBarChart (12-15 tests)
19. SummaryStatsGrid (10-12 tests)
20. InsightsSection (8-10 tests)
21. TimePeriodSelector (8-10 tests)

**Rationale**: Complex visualization components that benefit from component testing.

**Estimated Effort**: 3 days

---

#### Phase 6: Settings & Modals (Week 3-4)
22. SettingsSection (8-10 tests)
23. SettingRow (10-12 tests)
24. HealthSettingsCard (10-12 tests)
25. TimePickerModal (8-10 tests)
26. HistoricalImportModal (8-10 tests)

**Rationale**: Settings UI components.

**Estimated Effort**: 2 days

---

#### Phase 7: Screens (Week 4-5)
27. TodayScreen (25-30 tests)
28. BuddiesScreen (20-25 tests)
29. ProfileScreen (20-25 tests)
30. HistoryScreen (18-20 tests)
31. InsightsScreen (12-15 tests)

**Rationale**: Integration tests for main screens.

**Estimated Effort**: 4-5 days

---

#### Phase 8: Remaining Components (Week 5-6)
32. All MEDIUM and LOW priority components

**Rationale**: Complete coverage for all components.

**Estimated Effort**: 3-4 days

---

### Testing Best Practices for This Project

#### 1. Mock Strategy

**Always Mock**:
- `useTheme` hook (consistent colors)
- Zustand stores (`useAuthStore`, `useProfileStore`, etc.)
- `supabase` client
- `Alert` API
- Navigation (`useRouter`, `router`)
- Native modules (Camera, Contacts, Location, Health)
- Third-party libraries (Mapbox, QR scanner, etc.)

**Example Mock Pattern**:
```typescript
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(() => ({ colors: mockColors })),
}));

jest.mock('../../lib/store/authStore', () => ({
  useAuthStore: jest.fn((selector) => selector(mockAuthState)),
}));
```

---

#### 2. Test File Organization

**File Structure**:
```
components/
├── LogWalkModal.tsx
└── __tests__/
    └── LogWalkModal.test.tsx

app/(tabs)/
├── index.tsx
└── __tests__/
    └── index.test.tsx
```

**Test File Template**:
```typescript
/**
 * Unit tests for [ComponentName]
 * Tests [brief description of what's being tested]
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ComponentName } from '../ComponentName';

// Mock dependencies
jest.mock('../../lib/theme/themeManager');
jest.mock('../../lib/store/authStore');

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly with required props', () => {
      const { getByText } = render(<ComponentName />);
      expect(getByText('Expected Text')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call callback when button is pressed', () => {
      const mockCallback = jest.fn();
      const { getByTestId } = render(
        <ComponentName onPress={mockCallback} />
      );

      fireEvent.press(getByTestId('button'));
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null props gracefully', () => {
      const { getByText } = render(<ComponentName data={null} />);
      expect(getByText('No Data')).toBeTruthy();
    });
  });
});
```

---

#### 3. Common Testing Patterns

**Testing Form Inputs**:
```typescript
it('should update input value when user types', () => {
  const { getByTestId } = render(<LogWalkModal visible={true} />);

  fireEvent.changeText(getByTestId('steps-input'), '5000');

  expect(getByTestId('steps-input').props.value).toBe('5000');
});
```

**Testing Modals**:
```typescript
it('should show modal when visible prop is true', () => {
  const { getByText } = render(<LogWalkModal visible={true} />);
  expect(getByText('Log a Walk')).toBeTruthy();
});

it('should hide modal when visible prop is false', () => {
  const { queryByText } = render(<LogWalkModal visible={false} />);
  expect(queryByText('Log a Walk')).toBeNull();
});
```

**Testing Async Operations**:
```typescript
it('should show loading state during submission', async () => {
  const { getByTestId, getByText } = render(<LogWalkModal visible={true} />);

  fireEvent.press(getByTestId('submit-button'));

  await waitFor(() => {
    expect(getByText('Saving...')).toBeTruthy();
  });
});
```

**Testing Conditional Rendering**:
```typescript
it('should show error message when validation fails', () => {
  const { getByTestId, getByText } = render(<LogWalkModal visible={true} />);

  fireEvent.changeText(getByTestId('steps-input'), '0');
  fireEvent.press(getByTestId('submit-button'));

  expect(getByText('Steps must be greater than 0')).toBeTruthy();
});
```

---

#### 4. Coverage Goals

**Target Coverage by Component Type**:
- **Critical Components**: 90-95% coverage
- **High Priority Components**: 85-90% coverage
- **Medium Priority Components**: 80-85% coverage
- **Low Priority Components**: 70-80% coverage
- **Screens**: 75-85% coverage (integration tests)

**Overall Project Goal**: 85% component coverage

---

### Running Tests

```bash
# Run all component tests
npm test

# Run tests for specific component
npm test -- LogWalkModal.test.tsx

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only component tests (exclude unit tests)
npm test -- components/

# Run only screen tests
npm test -- app/
```

---

## 📊 SUMMARY

### Total Testing Scope

| Category | Items | Estimated Tests | Priority |
|----------|-------|-----------------|----------|
| **Already Tested** | 5 components | 58 tests | ✅ Complete |
| **CRITICAL** | 15 items | 180-220 tests | 🔴 Weeks 1-2 |
| **HIGH** | 18 items | 150-180 tests | 🟠 Weeks 2-3 |
| **MEDIUM** | 16 items | 80-100 tests | 🟡 Weeks 3-5 |
| **LOW** | 9 items | 40-50 tests | 🔵 Weeks 5-6 |
| **Screens** | 11 screens | 100-120 tests | 📱 Weeks 4-5 |
| **TOTAL** | **74 items** | **608-728 tests** | **6-8 weeks** |

---

### Key Benefits of This Testing Strategy

1. **Fills E2E Gaps**: Tests walk logging, goal adjustment, and social features that Maestro can't reliably test
2. **Fast Feedback**: Component tests run in <1 second vs 2-5 minutes for E2E tests
3. **Better Coverage**: Tests edge cases, error states, and UI states that E2E can't reach
4. **Easier Debugging**: Clear error messages vs cryptic Maestro failures
5. **No Flakiness**: Deterministic tests vs Maestro timing/scrolling issues
6. **Completes Testing Pyramid**: Adds missing component/integration layer

---

### Next Steps

1. **Review this audit** and adjust priorities based on your needs
2. **Start with Phase 1** (Critical Walk Logging components)
3. **Write tests incrementally** - don't try to do everything at once
4. **Run tests frequently** - use watch mode during development
5. **Track progress** - mark items as complete in this document
6. **Iterate** - adjust strategy based on what you learn

---

**Good luck with your testing! 🚀**

