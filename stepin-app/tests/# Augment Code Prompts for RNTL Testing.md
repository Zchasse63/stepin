# Augment Code Prompts for RNTL Testing
**Complete Test Suite - All Priorities (74 Items Total)**

---

## 📋 General Testing Context (Include with Every Prompt)

**Project**: Steppin - Non-competitive wellness walking app for beginners, elderly, and medical recovery patients

**Testing Framework**: React Native Testing Library (RNTL)

**Standard Mocks Required for ALL Tests**:
```typescript
// Always mock these
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      text: '#000000',
      border: '#E5E5EA',
      error: '#FF3B30',
      success: '#34C759',
      secondaryBackground: '#F2F2F7',
      secondaryText: '#8E8E93',
    },
  })),
}));

jest.mock('../../lib/store/authStore');
jest.mock('../../lib/supabase');
jest.spyOn(Alert, 'alert');
```

**Test File Structure**:
- Location: `components/__tests__/ComponentName.test.tsx` or `app/(tabs)/__tests__/screenname.test.tsx`
- Organize tests into: Rendering, User Interactions, Form Validation, Error States, Success States, Edge Cases
- Aim for 90-95% coverage on CRITICAL components, 85-90% on HIGH, 80-85% on MEDIUM, 70-80% on LOW

---

## 🔴 PHASE 1: CRITICAL - Walk Logging & Management (Week 1)

### Prompt 1: LogWalkModal Component Tests

**File**: `components/__tests__/LogWalkModal.test.tsx`

Create comprehensive RNTL tests for the LogWalkModal component (`components/LogWalkModal.tsx`, 365 lines). This is a CRITICAL component with failing E2E tests due to Maestro scrolling limitations.

**Requirements**:
- **25-30 test cases** covering:
  - ✅ Rendering: Modal visibility, initial state, all form fields present (steps input, duration input, save button, cancel button)
  - ✅ Form Validation: 
    - Steps validation: required field, must be positive, zero/negative rejection, empty input rejection
    - Steps edge case: Show confirmation dialog for unusually high steps (>50,000)
    - Duration validation: optional field, must be positive if provided, zero/negative rejection
  - ✅ User Interactions: Input changes (steps, duration), form submission, modal close, cancel button, keyboard handling
  - ✅ Error States: Alert.alert calls for invalid steps, invalid duration, database errors
  - ✅ Success States: Successful walk logging, onWalkLogged callback fired, form reset after submission, modal closes
  - ✅ Edge Cases: Empty inputs, null duration, very large values (100000 steps), non-numeric inputs

**Mocks Needed**:
- `useTheme` hook
- `useAuthStore` - mock user state with `{ user: { id: 'user-123', email: 'test@example.com' } }`
- `supabase.from().insert().select().single()` - mock success and error scenarios
- `Alert.alert` - verify validation messages

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  onClose: () => void;
  onWalkLogged: () => void;
}
```

**Key Test Scenarios**:
1. Modal visibility based on `visible` prop
2. Steps input changes and validation
3. Duration input changes and validation (optional)
4. Form submission with valid data
5. Form submission with invalid data (triggers alerts)
6. High steps confirmation dialog (>50k)
7. Database insertion success flow
8. Database insertion error handling
9. Form reset after successful submission
10. Cancel button closes modal without saving

---

### Prompt 2: EditWalkModal Component Tests

**File**: `components/__tests__/EditWalkModal.test.tsx`

Create comprehensive RNTL tests for the EditWalkModal component (`components/EditWalkModal.tsx`, 320 lines). This is a CRITICAL component with complex date/time picker interactions.

**Requirements**:
- **25-30 test cases** covering:
  - ✅ Rendering: Modal visibility with walk data, form pre-population from walk prop, date picker, time picker, all input fields
  - ✅ Form Validation:
    - Steps: required, positive, max value
    - Distance: optional, positive if provided
    - Duration: optional, positive if provided
    - Date: valid date, not future date
  - ✅ User Interactions: Input changes (steps, distance, duration), date picker interaction, time picker interaction, save button, cancel button
  - ✅ Data Updates: Form initializes from walk prop, updates reflect in state, onSave callback with updated data
  - ✅ Error States: Invalid inputs trigger alerts, save errors handled, validation alerts shown
  - ✅ Edge Cases: Null walk prop, missing optional fields (distance, duration), date/time edge cases

**Mocks Needed**:
- `useTheme` hook
- `DateTimePicker` component
- `Alert.alert`
- `supabase.from().update().eq().select().single()` - mock update operations

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  walk: Walk | null;
  onClose: () => void;
  onSave: (updatedWalk: Walk) => void;
}

interface Walk {
  id: string;
  steps: number;
  duration?: number;
  distance?: number;
  date: string;
  user_id: string;
}
```

**Key Test Scenarios**:
1. Form pre-populates with walk data
2. Edit steps field
3. Edit duration field
4. Edit distance field
5. Date picker interaction
6. Time picker interaction
7. Save button with valid changes
8. Save button with invalid data
9. Cancel button discards changes
10. Handle null walk prop gracefully

---

### Prompt 3: WalkDetailsSheet Component Tests

**File**: `components/__tests__/WalkDetailsSheet.test.tsx`

Create RNTL tests for the WalkDetailsSheet component (`components/WalkDetailsSheet.tsx`). This is a CRITICAL bottom sheet modal displaying detailed walk information.

**Requirements**:
- **15-20 test cases** covering:
  - ✅ Rendering: Sheet visibility, walk data display (steps, duration, distance, date/time), action buttons (edit, delete, close)
  - ✅ Data Display: Steps formatted correctly, duration formatted (e.g., "15 min"), distance formatted (e.g., "2.5 km"), date/time formatted
  - ✅ User Interactions: Edit button press, delete button press, close button press, swipe to close
  - ✅ Conditional Rendering: Heart rate badge (if heart_rate present), distance display (if distance present), duration display (if duration present)
  - ✅ Callbacks: onEdit called with walk, onDelete called with walk.id, onClose called

**Mocks Needed**:
- `useTheme` hook
- `formatDistance` utility (e.g., `(m) => ${(m/1000).toFixed(1)} km`)
- `formatDuration` utility (e.g., `(sec) => ${Math.floor(sec/60)} min`)

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  walk: Walk | null;
  onClose: () => void;
  onEdit: (walk: Walk) => void;
  onDelete: (walkId: string) => void;
}
```

**Key Test Scenarios**:
1. Display all walk data fields
2. Edit button triggers onEdit with walk
3. Delete button triggers onDelete with walk.id
4. Close button triggers onClose
5. Conditional heart rate badge
6. Conditional distance display
7. Optional duration display
8. Formatted date/time
9. Handle null walk prop

---

### Prompt 4: WalksList Component Tests

**File**: `components/__tests__/WalksList.test.tsx`

Create RNTL tests for the WalksList component (`components/WalksList.tsx`). This is a CRITICAL list component displaying walks with filtering.

**Requirements**:
- **15-20 test cases** covering:
  - ✅ Rendering: Empty state (no walks), list with walks (uses FlatList), loading state (skeleton loaders)
  - ✅ Data Display: Walk items rendered correctly via WalkListItem, walks sorted by date (most recent first)
  - ✅ User Interactions: Walk item press opens details, delete walk (swipe action), pull-to-refresh
  - ✅ Empty States: "No walks yet" message, "No walks in this period" message
  - ✅ Performance: FlatList with proper keyExtractor, staggered animations on mount

**Mocks Needed**:
- `useTheme` hook
- `WalkListItem` component (mock as simple view)
- `EmptyState` component

**Props to Test**:
```typescript
interface Props {
  walks: Walk[];
  onWalkPress: (walk: Walk) => void;
  onDeleteWalk: (walkId: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  emptyMessage?: string;
}
```

**Key Test Scenarios**:
1. Empty state with no walks
2. List renders all walks
3. Walks sorted by date descending
4. Walk press triggers callback
5. Delete walk triggers callback
6. Pull to refresh
7. Loading state shows skeletons
8. Custom empty message
9. FlatList optimization (keyExtractor)

---

## 🔴 PHASE 2: CRITICAL - Goal Management (Week 1-2)

### Prompt 5: GoalAdjustmentModal Component Tests

**File**: `components/__tests__/GoalAdjustmentModal.test.tsx`

Create RNTL tests for GoalAdjustmentModal (`components/GoalAdjustmentModal.tsx`, 400 lines). This is CRITICAL for adaptive goal suggestions with E2E gaps.

**Requirements**:
- **20-25 test cases** covering:
  - ✅ Rendering: Modal visibility, suggestion display, icon/color based on suggestion type (increase/decrease/optimal)
  - ✅ Suggestion Types: "increase" type (up arrow, green), "decrease" type (down arrow, orange), "optimal" type (checkmark, blue)
  - ✅ User Interactions: Accept button (updates goal), decline button (dismisses), close button, backdrop press
  - ✅ Data Display: Current goal (e.g., "5,000"), suggested goal (e.g., "7,500"), reason text, confidence level
  - ✅ Conditional Rendering: Different titles ("Increase Goal", "Adjust Goal", "Optimal Goal"), different icons, different colors
  - ✅ Callbacks: onAccept called with new goal, onDecline called, onClose called

**Mocks Needed**:
- `useTheme` hook
- `useProfileStore` - mock goal update function

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  suggestion: GoalSuggestion | null;
  onAccept: (newGoal: number) => void;
  onDecline: () => void;
  onClose: () => void;
}

interface GoalSuggestion {
  type: 'increase' | 'decrease' | 'optimal';
  currentGoal: number;
  suggestedGoal: number;
  reason: string;
  confidence: number; // 0-1
}
```

**Key Test Scenarios**:
1. Increase suggestion renders with green color
2. Decrease suggestion renders with orange color
3. Optimal suggestion renders with blue color
4. Accept button calls onAccept with suggested goal
5. Decline button calls onDecline
6. Display current vs suggested goal
7. Display reason text
8. Display confidence level
9. Different titles per type
10. Handle null suggestion prop

---

### Prompt 6: GoalSlider Component Tests

**File**: `components/__tests__/GoalSlider.test.tsx`

Create RNTL tests for GoalSlider (`components/GoalSlider.tsx`, 166 lines). This is CRITICAL for goal-setting UI with gesture interactions that E2E can't test.

**Requirements**:
- **15-20 test cases** covering:
  - ✅ Rendering: Slider component, current value display (formatted with commas), min/max labels (2,000 - 20,000)
  - ✅ Value Changes: onValueChange callback fired, value rounding to nearest 500, value display updates immediately
  - ✅ Slider Interactions: onSlidingComplete callback, haptic feedback on iOS (mock Haptics.impactAsync)
  - ✅ Bounds: Min value (2000), max value (20000), step increment (500)
  - ✅ Formatting: Number formatting with commas (e.g., "10,000")

**Mocks Needed**:
- `useTheme` hook
- `Slider` component from `@react-native-community/slider`
- `Haptics` from `expo-haptics`

**Props to Test**:
```typescript
interface Props {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete: (value: number) => void;
  min?: number; // default 2000
  max?: number; // default 20000
  step?: number; // default 500
}
```

**Key Test Scenarios**:
1. Initial value renders correctly
2. Slider value change triggers callback
3. Value rounds to nearest 500
4. Min bound enforced (2000)
5. Max bound enforced (20000)
6. Step increment (500)
7. Number formatting with commas
8. Haptic feedback on iOS
9. onSlidingComplete fires when sliding stops
10. Custom min/max/step props

---

### Prompt 7: GoalCelebrationModal Component Tests

**File**: `components/__tests__/GoalCelebrationModal.test.tsx`

Create RNTL tests for GoalCelebrationModal (`components/GoalCelebrationModal.tsx`). This is HIGH priority for user engagement.

**Requirements**:
- **15-18 test cases** covering:
  - ✅ Rendering: Modal visibility, celebration message, confetti animation component, steps achieved display, goal value display
  - ✅ Data Display: Steps achieved (e.g., "12,450 steps"), goal (e.g., "Goal: 10,000"), celebration message (e.g., "Great job!")
  - ✅ User Interactions: Close button, share button (if provided), backdrop press
  - ✅ Animations: ConfettiCelebration component rendered, modal entrance/exit animations
  - ✅ Callbacks: onClose called, onShare called (if provided)

**Mocks Needed**:
- `useTheme` hook
- `ConfettiCelebration` component

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  stepsAchieved: number;
  goal: number;
  onClose: () => void;
  onShare?: () => void;
}
```

**Key Test Scenarios**:
1. Modal renders when visible
2. Display steps achieved
3. Display goal value
4. Celebration message shown
5. Confetti component rendered
6. Close button works
7. Share button (if provided)
8. Handle missing onShare prop
9. Modal animations

---

## 🟠 PHASE 3: HIGH - Social Features (Week 2)

### Prompt 8: AddBuddyModal Component Tests

**File**: `components/__tests__/AddBuddyModal.test.tsx`

Create RNTL tests for AddBuddyModal (`components/AddBuddyModal.tsx`, 290 lines). This is CRITICAL for social features.

**Requirements**:
- **15-18 test cases** covering:
  - ✅ Rendering: Modal visibility, email input field, send button, cancel button
  - ✅ Form Validation: Email required, email format validation (test@example.com valid, "notanemail" invalid)
  - ✅ User Interactions: Email input changes, send button press, close button
  - ✅ Loading States: Submitting state shows loading indicator, send button disabled while loading
  - ✅ Success States: Success alert shown, form reset after success, modal closes, onBuddyAdded callback
  - ✅ Error States: Invalid email alert, send error handling (e.g., user not found, already buddies)

**Mocks Needed**:
- `useTheme` hook
- `useSocialStore` - mock `sendBuddyRequest` function and `loading` state
- `Alert.alert`

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  onClose: () => void;
  onBuddyAdded?: () => void;
}
```

**Key Test Scenarios**:
1. Email input validation
2. Send button disabled when empty
3. Send button triggers API call
4. Loading state during submission
5. Success alert and form reset
6. Error handling (invalid email)
7. Error handling (user not found)
8. Error handling (already buddies)
9. Cancel button closes modal

---

### Prompt 9: BuddyListItem Component Tests

**File**: `components/__tests__/BuddyListItem.test.tsx`

Create RNTL tests for BuddyListItem (`components/BuddyListItem.tsx`, 144 lines). CRITICAL social feature display component.

**Requirements**:
- **12-15 test cases** covering:
  - ✅ Rendering: Avatar (image or placeholder), display name, status text (e.g., "123 steps today")
  - ✅ Data Display: Buddy profile data (name, email), initials for missing avatar (e.g., "JD" for "John Doe")
  - ✅ User Interactions: Item press (navigate to profile), remove button, block button (if provided)
  - ✅ Conditional Rendering: Avatar image vs placeholder with initials, block button visibility (optional prop)
  - ✅ Callbacks: onPress, onRemove, onBlock (if provided)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  buddy: BuddyWithProfile;
  onPress?: () => void;
  onRemove?: () => void;
  onBlock?: () => void;
}

interface BuddyWithProfile {
  id: string;
  profile: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
  status?: string; // e.g., "5,432 steps today"
}
```

**Key Test Scenarios**:
1. Display avatar image if avatar_url provided
2. Display initials if no avatar (first letters of name)
3. Display name and email
4. Display status text
5. Press triggers onPress
6. Remove button triggers onRemove
7. Block button triggers onBlock (if provided)
8. Block button hidden if onBlock not provided
9. Handle missing status field

---

### Prompt 10: PendingRequestCard Component Tests

**File**: `components/__tests__/PendingRequestCard.test.tsx`

Create RNTL tests for PendingRequestCard (`components/PendingRequestCard.tsx`). HIGH priority social interaction component.

**Requirements**:
- **12-15 test cases** covering:
  - ✅ Rendering: Request card, sender info (name, email), accept button, decline button, request date
  - ✅ Data Display: Sender name, sender email, formatted request date (e.g., "2 days ago")
  - ✅ User Interactions: Accept button press, decline button press
  - ✅ Loading States: Accept loading (button shows spinner, disabled), decline loading
  - ✅ Callbacks: onAccept called with request.id, onDecline called with request.id

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  request: BuddyRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  acceptLoading?: boolean;
  declineLoading?: boolean;
}

interface BuddyRequest {
  id: string;
  sender: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
  created_at: string;
}
```

**Key Test Scenarios**:
1. Display sender name and email
2. Display request date
3. Accept button triggers callback
4. Decline button triggers callback
5. Accept loading state
6. Decline loading state
7. Buttons disabled during loading
8. Handle missing avatar

---

### Prompt 11: ActivityCard Component Tests

**File**: `components/__tests__/ActivityCard.test.tsx`

Create RNTL tests for ActivityCard (`components/ActivityCard.tsx`). HIGH priority social activity feed component.

**Requirements**:
- **12-15 test cases** covering:
  - ✅ Rendering: Activity card, user info (name, avatar), activity details, timestamp, kudos button
  - ✅ Data Display: Activity type (walk, milestone, badge), timestamp (e.g., "3h ago"), user name, activity data (steps, distance)
  - ✅ User Interactions: Kudos button press, delete button (if own activity), card press (view details)
  - ✅ Conditional Rendering: Different activity types (walk vs milestone vs badge), kudos state (given vs not given), delete button (only for own activity)
  - ✅ Callbacks: onKudos called with activity.id, onDelete called with activity.id (if own)

**Mocks Needed**:
- `useTheme` hook
- `useAuthStore` - to determine if activity is user's own

**Props to Test**:
```typescript
interface Props {
  activity: Activity;
  onKudos: (activityId: string) => void;
  onDelete?: (activityId: string) => void;
  currentUserId: string;
}

interface Activity {
  id: string;
  type: 'walk' | 'milestone' | 'badge';
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  data: {
    steps?: number;
    distance?: number;
    badge_name?: string;
  };
  kudos_count: number;
  has_kudos: boolean; // current user gave kudos
  created_at: string;
}
```

**Key Test Scenarios**:
1. Walk activity display
2. Milestone activity display
3. Badge activity display
4. Kudos button (not given state)
5. Kudos button (already given state)
6. Delete button for own activity
7. No delete button for others' activity
8. Timestamp formatting
9. Activity data display

---

## 🟠 PHASE 4: HIGH - Profile & Display Components (Week 2-3)

### Prompt 12: ProfileHeader Component Tests

**File**: `components/__tests__/ProfileHeader.test.tsx`

Create RNTL tests for ProfileHeader (`components/ProfileHeader.tsx`, 162 lines). CRITICAL for user identity display.

**Requirements**:
- **15-20 test cases** covering:
  - ✅ Rendering: Avatar, display name, email, edit button, loading state
  - ✅ Data Display: Display name or email fallback, email, avatar image or initials placeholder
  - ✅ Initials Logic: Two-word name ("John Doe" → "JD"), single-word name ("John" → "J"), email fallback ("john@email.com" → "J")
  - ✅ User Interactions: Edit button press navigates to edit profile screen
  - ✅ Loading States: Loading indicator while profile data fetches, skeleton placeholders
  - ✅ Conditional Rendering: Avatar image (if avatar_url) vs placeholder with initials

**Mocks Needed**:
- `useTheme` hook
- `useRouter` hook (Expo Router)
- `useProfileStore` - mock profile data

**Props to Test**:
```typescript
interface Props {
  profile: {
    display_name?: string;
    email: string;
    avatar_url?: string;
  } | null;
  loading?: boolean;
}
```

**Key Test Scenarios**:
1. Display avatar image if provided
2. Display initials if no avatar
3. Initials from two-word name
4. Initials from single-word name
5. Initials from email (fallback)
6. Display name shown if provided
7. Email fallback if no display name
8. Edit button navigates to edit profile
9. Loading state shows skeleton
10. Handle null profile

---

### Prompt 13: StreakDisplay Component Tests

**File**: `components/__tests__/StreakDisplay.test.tsx`

Create RNTL tests for StreakDisplay (`components/StreakDisplay.tsx`). HIGH priority gamification component.

**Requirements**:
- **10-12 test cases** covering:
  - ✅ Rendering: Streak count (large number), flame icon, streak text ("day streak" or "days streak"), longest streak display
  - ✅ Data Display: Current streak (e.g., "7 days"), longest streak (e.g., "Best: 14 days")
  - ✅ Visual States: Active streak (flame icon colored), no streak (0 days, grey flame)
  - ✅ Conditional Rendering: Streak freeze indicator (snowflake icon if freeze active), singular vs plural ("1 day" vs "2 days")

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  currentStreak: number;
  longestStreak: number;
  freezeActive?: boolean;
}
```

**Key Test Scenarios**:
1. Display current streak
2. Display longest streak
3. Singular "day" for streak of 1
4. Plural "days" for streak > 1
5. Active streak visual (colored flame)
6. Zero streak visual (grey flame)
7. Freeze indicator shown when active
8. Freeze indicator hidden when inactive

---

### Prompt 14: StatsGrid Component Tests

**File**: `components/__tests__/StatsGrid.test.tsx`

Create RNTL tests for StatsGrid (`components/StatsGrid.tsx`). HIGH priority profile stats display.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Grid of stats cards (total walks, total steps, current streak), uses StatsCard components
  - ✅ Data Display: Formatted numbers (commas), labels (e.g., "Total Walks", "Total Steps", "Current Streak")
  - ✅ Loading States: Loading placeholders (SkeletonLoader) while data fetches
  - ✅ Empty States: Zero values shown as "0" (not hidden)

**Mocks Needed**:
- `useTheme` hook
- `StatsCard` component (already tested, can use real component)
- `SkeletonLoader` component

**Props to Test**:
```typescript
interface Props {
  stats: {
    totalWalks: number;
    totalSteps: number;
    currentStreak: number;
  } | null;
  loading?: boolean;
}
```

**Key Test Scenarios**:
1. Display all three stat cards
2. Format numbers with commas
3. Display correct labels
4. Loading state shows skeletons
5. Handle null stats
6. Handle zero values

---

### Prompt 15: InsightsCard Component Tests

**File**: `components/__tests__/InsightsCard.test.tsx`

Create RNTL tests for InsightsCard (`components/InsightsCard.tsx`). HIGH priority insight display.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Card with insight text, icon, background color
  - ✅ Data Display: Insight type (e.g., "streak", "goal", "improvement"), message text
  - ✅ Icon Mapping: Different icons for different insight types (flame for streak, target for goal, trending-up for improvement)
  - ✅ Visual States: Different background colors for insight types (e.g., green for positive, blue for info)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  insight: {
    type: 'streak' | 'goal' | 'improvement' | 'consistency';
    message: string;
  };
}
```

**Key Test Scenarios**:
1. Streak insight with flame icon
2. Goal insight with target icon
3. Improvement insight with trending-up icon
4. Consistency insight with calendar icon
5. Message text displayed
6. Background color per type

---

## 🟠 PHASE 5: HIGH - History & Analytics Components (Week 3)

### Prompt 16: CalendarHeatMap Component Tests

**File**: `components/__tests__/CalendarHeatMap.test.tsx`

Create RNTL tests for CalendarHeatMap (`components/CalendarHeatMap.tsx`). HIGH priority data visualization component.

**Requirements**:
- **15-18 test cases** covering:
  - ✅ Rendering: Calendar grid (7 columns for days of week), day cells (CalendarDay components), month labels, color legend
  - ✅ Data Display: Daily stats visualization, goal met indicators (green cells), color coding (grey = no data, light green = some steps, dark green = goal met)
  - ✅ User Interactions: Day cell press triggers callback with day data, tooltip on press shows exact steps
  - ✅ Color Coding: 0 steps (grey), 1-4999 steps (light green), 5000-9999 steps (medium green), 10000+ steps (dark green)
  - ✅ Empty States: No data for date range shows all grey cells
  - ✅ Callbacks: onDayPress called with { date, steps, goalMet }

**Mocks Needed**:
- `useTheme` hook
- `CalendarDay` component (or mock)

**Props to Test**:
```typescript
interface Props {
  dailyStats: {
    date: string; // ISO date
    steps: number;
    goalMet: boolean;
  }[];
  onDayPress: (day: DayData) => void;
  startDate: string; // ISO date
  endDate: string; // ISO date
}
```

**Key Test Scenarios**:
1. Render calendar grid for date range
2. Color code cells by step count
3. Day press triggers callback
4. Goal met indicator (checkmark or color)
5. Empty state (all grey)
6. Month labels shown
7. Week day headers
8. Handle missing days in data

---

### Prompt 17: DayDetailsCard Component Tests

**File**: `components/__tests__/DayDetailsCard.test.tsx`

Create RNTL tests for DayDetailsCard (`components/DayDetailsCard.tsx`). HIGH priority detailed day stats component.

**Requirements**:
- **12-15 test cases** covering:
  - ✅ Rendering: Card with day stats (total steps, walks count, goal status), walks list (expandable)
  - ✅ Data Display: Total steps (formatted with commas), walks count (e.g., "3 walks"), goal status (met or not met with icon)
  - ✅ Conditional Rendering: Goal met badge (checkmark, green), goal not met (no badge), "No walks" message if empty
  - ✅ User Interactions: Walk item press triggers callback, expand/collapse walks list
  - ✅ Callbacks: onWalkPress called with walk data

**Mocks Needed**:
- `useTheme` hook
- `WalkListItem` component

**Props to Test**:
```typescript
interface Props {
  date: string; // ISO date
  stats: {
    totalSteps: number;
    walksCount: number;
    goalMet: boolean;
    walks: Walk[];
  };
  onWalkPress: (walk: Walk) => void;
}
```

**Key Test Scenarios**:
1. Display total steps
2. Display walks count
3. Goal met badge
4. Goal not met (no badge)
5. Walks list rendered
6. Walk press callback
7. Empty walks list
8. Expand/collapse walks

---

### Prompt 18: StepsBarChart Component Tests

**File**: `components/__tests__/StepsBarChart.test.tsx`

Create RNTL tests for StepsBarChart (`components/StepsBarChart.tsx`). HIGH priority visual analytics component.

**Requirements**:
- **12-15 test cases** covering:
  - ✅ Rendering: Bar chart with bars for each day, X-axis labels (days), Y-axis labels (step counts), goal line (horizontal line at goal value)
  - ✅ Data Display: Steps per day rendered as bars, bar heights proportional to steps, goal line shows target
  - ✅ Scaling: Y-axis scaling to fit data (max value + 20% padding), bar heights calculated correctly
  - ✅ Empty States: "No data" message if no daily stats, empty chart
  - ✅ Accessibility: Chart description for screen readers

**Mocks Needed**:
- `useTheme` hook
- Chart library (if using react-native-chart-kit or similar)

**Props to Test**:
```typescript
interface Props {
  dailyStats: {
    date: string;
    steps: number;
  }[];
  goal: number;
}
```

**Key Test Scenarios**:
1. Render bars for all days
2. Bar heights proportional to steps
3. Goal line at correct position
4. X-axis labels (dates)
5. Y-axis labels (step counts)
6. Empty data message
7. Handle single data point
8. Handle all zero values

---

### Prompt 19: SummaryStatsGrid Component Tests

**File**: `components/__tests__/SummaryStatsGrid.test.tsx`

Create RNTL tests for SummaryStatsGrid (`components/SummaryStatsGrid.tsx`). HIGH priority summary statistics display.

**Requirements**:
- **10-12 test cases** covering:
  - ✅ Rendering: Grid of 4 stats cards (total steps, average steps, days goal met, percentage goal met)
  - ✅ Data Display: Total steps (e.g., "142,350"), average steps per day (e.g., "7,118"), days goal met (e.g., "18 days"), percentage (e.g., "60%")
  - ✅ Loading States: Loading placeholders (SkeletonLoader) for each card
  - ✅ Empty States: Zero values shown as "0" or "0%"

**Mocks Needed**:
- `useTheme` hook
- `StatsCard` component
- `SkeletonLoader` component

**Props to Test**:
```typescript
interface Props {
  stats: {
    totalSteps: number;
    averageSteps: number;
    daysGoalMet: number;
    totalDays: number;
  } | null;
  loading?: boolean;
}
```

**Key Test Scenarios**:
1. Display all four cards
2. Calculate percentage correctly
3. Format numbers with commas
4. Loading state
5. Handle null stats
6. Handle zero values

---

### Prompt 20: InsightsSection Component Tests

**File**: `components/__tests__/InsightsSection.test.tsx`

Create RNTL tests for InsightsSection (`components/InsightsSection.tsx`). HIGH priority user engagement component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Insights list (FlatList or ScrollView), insight cards (InsightsCard components), section header
  - ✅ Data Display: Insight text, icons, types (uses InsightsCard)
  - ✅ Empty States: "No insights yet" message if insights array empty
  - ✅ Conditional Rendering: Different insight types rendered

**Mocks Needed**:
- `useTheme` hook
- `InsightsCard` component

**Props to Test**:
```typescript
interface Props {
  insights: Insight[];
}

interface Insight {
  id: string;
  type: 'streak' | 'goal' | 'improvement' | 'consistency';
  message: string;
}
```

**Key Test Scenarios**:
1. Render all insights
2. Empty state message
3. Use InsightsCard component
4. Handle single insight
5. Handle many insights (scrollable)

---

### Prompt 21: TimePeriodSelector Component Tests

**File**: `components/__tests__/TimePeriodSelector.test.tsx`

Create RNTL tests for TimePeriodSelector (`components/TimePeriodSelector.tsx`). HIGH priority navigation control.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Three period buttons ("Week", "Month", "Year"), active button highlighted
  - ✅ User Interactions: Period selection triggers callback, active state updates
  - ✅ Callbacks: onPeriodChange called with selected period
  - ✅ Visual States: Active button (colored background), inactive buttons (transparent background)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  selectedPeriod: 'week' | 'month' | 'year';
  onPeriodChange: (period: TimePeriod) => void;
}

type TimePeriod = 'week' | 'month' | 'year';
```

**Key Test Scenarios**:
1. Render all three buttons
2. Active period highlighted
3. Week button press
4. Month button press
5. Year button press
6. Only one button active at a time

---

## 🟡 PHASE 6: MEDIUM - Celebration & Notification Components (Week 3-4)

### Prompt 22: StreakMilestoneModal Component Tests

**File**: `components/__tests__/StreakMilestoneModal.test.tsx`

Create RNTL tests for StreakMilestoneModal (`components/StreakMilestoneModal.tsx`). MEDIUM priority celebration component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Modal with milestone message, streak count (e.g., "7 Day Streak!"), celebration animation, share button
  - ✅ Data Display: Milestone type (7, 30, 100 days), streak value, congratulatory message
  - ✅ User Interactions: Close button, share button, backdrop press
  - ✅ Animations: Celebration animation (confetti or lottie), modal entrance
  - ✅ Callbacks: onClose, onShare (optional)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  milestone: number; // 7, 30, 100, etc.
  onClose: () => void;
  onShare?: () => void;
}
```

**Key Test Scenarios**:
1. Display milestone number
2. Congratulatory message
3. Close button
4. Share button (if provided)
5. Celebration animation
6. Different milestones (7, 30, 100)

---

### Prompt 23: BadgeCelebrationModal Component Tests

**File**: `components/__tests__/BadgeCelebrationModal.test.tsx`

Create RNTL tests for BadgeCelebrationModal (`components/BadgeCelebrationModal.tsx`). MEDIUM priority achievement system component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Modal with badge display (icon, name), badge description, close button
  - ✅ Data Display: Badge name (e.g., "First Steps"), description (e.g., "Logged your first walk"), badge icon
  - ✅ User Interactions: Close button, backdrop press
  - ✅ Animations: Badge reveal animation (scale up, fade in)
  - ✅ Callbacks: onClose

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  badge: {
    name: string;
    description: string;
    icon: string; // icon name
  };
  onClose: () => void;
}
```

**Key Test Scenarios**:
1. Display badge name
2. Display badge description
3. Display badge icon
4. Close button
5. Badge reveal animation

---

### Prompt 24: ConfettiCelebration Component Tests

**File**: `components/__tests__/ConfettiCelebration.test.tsx`

Create RNTL tests for ConfettiCelebration (`components/ConfettiCelebration.tsx`). MEDIUM priority visual effect component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Confetti animation component
  - ✅ Props: Trigger (when to start), duration (how long), colors (customizable)
  - ✅ Animation: Start confetti when trigger changes, stop after duration

**Mocks Needed**:
- Confetti library (react-native-confetti-cannon or similar)
- Animated API

**Props to Test**:
```typescript
interface Props {
  trigger: boolean;
  duration?: number; // milliseconds
  colors?: string[];
}
```

**Key Test Scenarios**:
1. Starts animation when trigger true
2. Stops after duration
3. Custom colors applied
4. Default duration if not provided

---

### Prompt 25: NotificationPermissionBanner Component Tests

**File**: `components/__tests__/NotificationPermissionBanner.test.tsx`

Create RNTL tests for NotificationPermissionBanner (`components/NotificationPermissionBanner.tsx`). MEDIUM priority permission UX component.

**Requirements**:
- **6-8 test cases** covering:
  - ✅ Rendering: Banner with permission request message, enable button, dismiss button
  - ✅ User Interactions: Enable button triggers permission request, dismiss button hides banner
  - ✅ Callbacks: onEnable (request permissions), onDismiss (hide banner)
  - ✅ Conditional Rendering: Show/hide based on permission status (hide if already granted)

**Mocks Needed**:
- `useTheme` hook
- Notification service

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}
```

**Key Test Scenarios**:
1. Banner visible when prop true
2. Enable button triggers callback
3. Dismiss button triggers callback
4. Message text displayed

---

### Prompt 26: PermissionBanner Component Tests

**File**: `components/__tests__/PermissionBanner.test.tsx`

Create RNTL tests for PermissionBanner (`components/PermissionBanner.tsx`). MEDIUM priority generic permission component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Banner with custom message, action button, dismiss button
  - ✅ User Interactions: Action button, dismiss button
  - ✅ Callbacks: onAction, onDismiss
  - ✅ Props: Custom message, action text, icon

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  message: string;
  actionText: string;
  icon?: string;
  onAction: () => void;
  onDismiss: () => void;
}
```

---

## 🟡 PHASE 7: MEDIUM - Social & Sharing Components (Week 4)

### Prompt 27: PostActivityModal Component Tests

**File**: `components/__tests__/PostActivityModal.test.tsx`

Create RNTL tests for PostActivityModal (`components/PostActivityModal.tsx`). MEDIUM priority social sharing component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Modal with activity details (steps, distance, duration), caption input field, post button, cancel button
  - ✅ User Interactions: Caption input changes, post button, cancel button
  - ✅ Loading States: Posting indicator, post button disabled while posting
  - ✅ Success/Error States: Success message, error alert, modal closes on success
  - ✅ Callbacks: onPost (with caption), onCancel

**Mocks Needed**:
- `useTheme` hook
- `useSocialStore` - mock `postActivity` function

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  activity: {
    steps: number;
    distance?: number;
    duration?: number;
  };
  onPost: (caption: string) => void;
  onCancel: () => void;
}
```

---

### Prompt 28: KudosButton Component Tests

**File**: `components/__tests__/KudosButton.test.tsx`

Create RNTL tests for KudosButton (`components/KudosButton.tsx`). MEDIUM priority social interaction component.

**Requirements**:
- **6-8 test cases** covering:
  - ✅ Rendering: Button with heart icon, kudos count (e.g., "12")
  - ✅ User Interactions: Button press toggles kudos state, animation on kudos
  - ✅ Visual States: Given kudos (filled red heart), not given (outline heart)
  - ✅ Callbacks: onPress
  - ✅ Animation: Heart animation (scale bounce) when kudos given

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  kudosCount: number;
  hasGivenKudos: boolean;
  onPress: () => void;
}
```

---

### Prompt 29: BuddyPreview Component Tests

**File**: `components/__tests__/BuddyPreview.test.tsx`

Create RNTL tests for BuddyPreview (`components/BuddyPreview.tsx`). MEDIUM priority buddy profile preview component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Buddy avatar, name, stats preview (steps today, current streak)
  - ✅ Data Display: Buddy profile data, recent activity stats
  - ✅ User Interactions: View profile button, card press
  - ✅ Callbacks: onViewProfile

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  buddy: {
    id: string;
    profile: {
      display_name: string;
      avatar_url?: string;
    };
    stepsToday: number;
    currentStreak: number;
  };
  onViewProfile: () => void;
}
```

---

### Prompt 30: InviteFriend Component Tests

**File**: `components/__tests__/InviteFriend.test.tsx`

Create RNTL tests for InviteFriend (`components/InviteFriend.tsx`). MEDIUM priority user growth component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Invite button, invite message
  - ✅ User Interactions: Invite button opens native share sheet
  - ✅ Callbacks: onInvite
  - ✅ Share Sheet: Native share API integration (mock Share.share)

**Mocks Needed**:
- `useTheme` hook
- `Share` API from react-native

**Props to Test**:
```typescript
interface Props {
  onInvite?: () => void;
}
```

---

## 🟡 PHASE 8: MEDIUM - Settings Components (Week 4)

### Prompt 31: SettingsSection Component Tests

**File**: `components/__tests__/SettingsSection.test.tsx`

Create RNTL tests for SettingsSection (`components/SettingsSection.tsx`). HIGH priority settings organization component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Section header, children, proper spacing
  - ✅ Data Display: Section title, description (optional)
  - ✅ Layout: Borders, padding, background color

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}
```

---

### Prompt 32: SettingRow Component Tests

**File**: `components/__tests__/SettingRow.test.tsx`

Create RNTL tests for SettingRow (`components/SettingRow.tsx`). HIGH priority settings interaction component.

**Requirements**:
- **10-12 test cases** covering:
  - ✅ Rendering: Row with label, value text OR switch, icon (optional), chevron (if pressable)
  - ✅ User Interactions: Row press, switch toggle
  - ✅ Conditional Rendering: Switch OR value text (not both), chevron (if onPress), icon (if provided)
  - ✅ Callbacks: onPress (navigation), onValueChange (for switch)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  label: string;
  value?: string;
  icon?: string;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
}
```

**Key Test Scenarios**:
1. Label and value text
2. Label and switch
3. Icon displayed if provided
4. Chevron if pressable
5. Row press callback
6. Switch toggle callback
7. Switch vs value (mutually exclusive)

---

### Prompt 33: HealthSettingsCard Component Tests

**File**: `components/__tests__/HealthSettingsCard.test.tsx`

Create RNTL tests for HealthSettingsCard (`components/HealthSettingsCard.tsx`). HIGH priority health permissions component.

**Requirements**:
- **10-12 test cases** covering:
  - ✅ Rendering: Card with health settings, permission status, sync status, request permissions button, sync now button
  - ✅ Data Display: Permission status (granted/denied), last sync time
  - ✅ User Interactions: Request permissions button, sync now button
  - ✅ Loading States: Syncing indicator (spinner on sync button)
  - ✅ Callbacks: onRequestPermissions, onSync

**Mocks Needed**:
- `useTheme` hook
- Health service

**Props to Test**:
```typescript
interface Props {
  permissionStatus: 'granted' | 'denied' | 'unknown';
  lastSyncTime?: string;
  syncing?: boolean;
  onRequestPermissions: () => void;
  onSync: () => void;
}
```

---

### Prompt 34: TimePickerModal Component Tests

**File**: `components/__tests__/TimePickerModal.test.tsx`

Create RNTL tests for TimePickerModal (`components/TimePickerModal.tsx`). MEDIUM priority time selection component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Modal with time picker, save button, cancel button
  - ✅ User Interactions: Time selection (wheel picker), save button, cancel button
  - ✅ Callbacks: onSave (with selected time), onCancel
  - ✅ Platform Differences: iOS DateTimePicker vs Android TimePickerAndroid

**Mocks Needed**:
- `useTheme` hook
- `DateTimePicker` component (from @react-native-community/datetimepicker)

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  initialTime: Date;
  onSave: (time: Date) => void;
  onCancel: () => void;
}
```

---

### Prompt 35: HistoricalImportModal Component Tests

**File**: `components/__tests__/HistoricalImportModal.test.tsx`

Create RNTL tests for HistoricalImportModal (`components/HistoricalImportModal.tsx`). MEDIUM priority data import component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Modal with date range picker, import button, cancel button, import options
  - ✅ User Interactions: Date range selection (start/end date), import button, cancel button
  - ✅ Loading States: Importing indicator, import button disabled while importing
  - ✅ Success/Error States: Import success message, import error alert
  - ✅ Callbacks: onImport (with date range), onClose

**Mocks Needed**:
- `useTheme` hook
- Health service

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  onImport: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
}
```

---

## 🟡 PHASE 9: MEDIUM - Miscellaneous Components (Week 5)

### Prompt 36: AnimatedButton Component Tests

**File**: `components/__tests__/AnimatedButton.test.tsx`

Create RNTL tests for AnimatedButton (`components/AnimatedButton.tsx`). MEDIUM priority reusable button component.

**Requirements**:
- **8-10 test cases** covering:
  - ✅ Rendering: Button with label, icon (optional), correct variant style
  - ✅ User Interactions: Press triggers callback, press in/out animations
  - ✅ Props: Variant (primary/secondary/outline), size (small/medium/large), disabled state
  - ✅ Animations: Scale animation on press (press in: scale 0.95, press out: scale 1.0)
  - ✅ Callbacks: onPress

**Mocks Needed**:
- `useTheme` hook
- Animated API

**Props to Test**:
```typescript
interface Props {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onPress: () => void;
}
```

---

### Prompt 37: ProfileButton Component Tests

**File**: `components/__tests__/ProfileButton.test.tsx`

Create RNTL tests for ProfileButton (`components/ProfileButton.tsx`). MEDIUM priority navigation component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Button with avatar or default icon
  - ✅ User Interactions: Button press
  - ✅ Callbacks: onPress
  - ✅ Visual States: With avatar (image), without avatar (icon)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  avatarUrl?: string;
  onPress: () => void;
}
```

---

### Prompt 38: HealthPermissionDeniedBanner Component Tests

**File**: `components/__tests__/HealthPermissionDeniedBanner.test.tsx`

Create RNTL tests for HealthPermissionDeniedBanner (`components/HealthPermissionDeniedBanner.tsx`). MEDIUM priority permission guidance component.

**Requirements**:
- **6-8 test cases** covering:
  - ✅ Rendering: Banner with denied message, open settings button, dismiss button
  - ✅ User Interactions: Open settings button (opens device settings), dismiss button (hides banner, saves to AsyncStorage)
  - ✅ Callbacks: onOpenSettings, onDismiss
  - ✅ Persistence: Dismiss state saved to AsyncStorage

**Mocks Needed**:
- `useTheme` hook
- `AsyncStorage`
- `Linking.openSettings()`

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  onOpenSettings: () => void;
  onDismiss: () => void;
}
```

---

### Prompt 39: OfflineBanner Component Tests

**File**: `components/__tests__/OfflineBanner.test.tsx`

Create RNTL tests for OfflineBanner (`components/OfflineBanner.tsx`). MEDIUM priority offline state component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Banner with offline message
  - ✅ Conditional Rendering: Show when offline, hide when online
  - ✅ Auto-dismiss: Automatically hides when network restored

**Mocks Needed**:
- `useTheme` hook
- Network state hook (or NetInfo)

**Props to Test**:
```typescript
interface Props {
  isOffline: boolean;
}
```

---

### Prompt 40: ConflictResolutionModal Component Tests

**File**: `components/__tests__/ConflictResolutionModal.test.tsx`

Create RNTL tests for ConflictResolutionModal (`components/ConflictResolutionModal.tsx`). LOW priority data sync component.

**Requirements**:
- **6-8 test cases** covering:
  - ✅ Rendering: Modal with conflict details, local data, remote data, resolution buttons (keep local, keep remote, merge)
  - ✅ Data Display: Local data vs remote data side-by-side
  - ✅ User Interactions: Keep local button, keep remote button, merge button (if applicable)
  - ✅ Callbacks: onResolve (with resolution choice)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  visible: boolean;
  conflict: {
    local: any;
    remote: any;
    field: string;
  };
  onResolve: (resolution: 'local' | 'remote' | 'merge') => void;
}
```

---

### Prompt 41: HeartRateZone Component Tests

**File**: `components/__tests__/HeartRateZone.test.tsx`

Create RNTL tests for HeartRateZone (`components/HeartRateZone.tsx`). LOW priority heart rate display component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Zone indicator, heart rate value, zone name
  - ✅ Data Display: Zone name (e.g., "Fat Burn", "Cardio"), color coding (grey, blue, green, yellow, red)
  - ✅ Zone Calculation: Different zones based on HR (Resting <100, Fat Burn 100-130, Cardio 130-160, Peak >160)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  heartRate: number;
  maxHeartRate?: number; // for zone calculation
}
```

---

### Prompt 42: HeartRateAnalytics Component Tests

**File**: `components/__tests__/HeartRateAnalytics.test.tsx`

Create RNTL tests for HeartRateAnalytics (`components/HeartRateAnalytics.tsx`). LOW priority advanced HR component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: HR chart, zone breakdown (time in each zone), average HR, max HR
  - ✅ Data Display: Average HR (e.g., "145 bpm"), max HR (e.g., "178 bpm"), time in zones (e.g., "15 min in Cardio")
  - ✅ Empty States: No HR data message

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  heartRateData: {
    avgHR: number;
    maxHR: number;
    timeInZones: {
      zone: string;
      minutes: number;
    }[];
  } | null;
}
```

---

## 🔵 PHASE 10: LOW - Specialized Components (Week 5-6)

### Prompt 43: QRCodeDisplay Component Tests

**File**: `components/__tests__/QRCodeDisplay.test.tsx`

Create RNTL tests for QRCodeDisplay (`components/QRCodeDisplay.tsx`). LOW priority QR code display component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: QR code image, user ID text
  - ✅ Data Display: QR code generated from user ID
  - ✅ Props: Size (small/medium/large), color (customizable)

**Mocks Needed**:
- `useTheme` hook
- QR code library (react-native-qrcode-svg or similar)

**Props to Test**:
```typescript
interface Props {
  userId: string;
  size?: number;
  color?: string;
}
```

---

### Prompt 44: QRScanner Component Tests

**File**: `components/__tests__/QRScanner.test.tsx`

Create RNTL tests for QRScanner (`components/QRScanner.tsx`). LOW priority QR scanning component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Camera view, scan overlay (frame)
  - ✅ User Interactions: Scan success triggers callback, scan error handled
  - ✅ Callbacks: onScan (with scanned data), onError
  - ✅ Permissions: Camera permission handling

**Mocks Needed**:
- `useTheme` hook
- Camera API (expo-camera)
- QR scanner library

**Props to Test**:
```typescript
interface Props {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}
```

---

### Prompt 45: BuddySearch Component Tests

**File**: `components/__tests__/BuddySearch.test.tsx`

Create RNTL tests for BuddySearch (`components/BuddySearch.tsx`). LOW priority buddy discovery component.

**Requirements**:
- **6-8 test cases** covering:
  - ✅ Rendering: Search input field, results list
  - ✅ User Interactions: Search input changes triggers search, result selection
  - ✅ Loading States: Searching indicator
  - ✅ Empty States: "No results" message
  - ✅ Callbacks: onSelect (with selected user)

**Mocks Needed**:
- `useTheme` hook
- `useSocialStore` - mock search function

**Props to Test**:
```typescript
interface Props {
  onSelect: (user: User) => void;
}
```

---

### Prompt 46: BuddySearchResult Component Tests

**File**: `components/__tests__/BuddySearchResult.test.tsx`

Create RNTL tests for BuddySearchResult (`components/BuddySearchResult.tsx`). LOW priority search result display component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: User avatar, name, email, add button
  - ✅ User Interactions: Result press, add button press
  - ✅ Callbacks: onPress, onAdd

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  user: {
    id: string;
    display_name: string;
    email: string;
    avatar_url?: string;
  };
  onPress: () => void;
  onAdd: () => void;
}
```

---

### Prompt 47: ContactsSync Component Tests

**File**: `components/__tests__/ContactsSync.test.tsx`

Create RNTL tests for ContactsSync (`components/ContactsSync.tsx`). LOW priority contacts integration component.

**Requirements**:
- **6-8 test cases** covering:
  - ✅ Rendering: Contacts list, sync button
  - ✅ User Interactions: Sync contacts button, select contact
  - ✅ Permissions: Contacts permission handling (request if denied)
  - ✅ Loading States: Syncing indicator
  - ✅ Callbacks: onSync, onSelect

**Mocks Needed**:
- `useTheme` hook
- Contacts API (expo-contacts)

**Props to Test**:
```typescript
interface Props {
  onSync: () => void;
  onSelect: (contact: Contact) => void;
}
```

---

### Prompt 48: MapView Component Tests

**File**: `components/__tests__/MapView.test.tsx`

Create RNTL tests for MapView (`components/MapView.tsx`). LOW priority map visualization component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Map component, route overlay (polyline), markers (start/end)
  - ✅ Data Display: Walk route visualized, start/end markers
  - ✅ Props: Route data (array of coordinates), zoom level
  - ✅ User Interactions: Map gestures (pan, zoom)

**Mocks Needed**:
- `useTheme` hook
- Mapbox library (react-native-mapbox-gl)

**Props to Test**:
```typescript
interface Props {
  route: {
    coordinates: [number, number][]; // [lng, lat]
  };
  zoomLevel?: number;
}
```

---

### Prompt 49: SentryTestButton Component Tests

**File**: `components/__tests__/SentryTestButton.test.tsx`

Create RNTL tests for SentryTestButton (`components/SentryTestButton.tsx`). LOW priority debug component.

**Requirements**:
- **3-4 test cases** covering:
  - ✅ Rendering: Button (dev mode only), not rendered in production
  - ✅ User Interactions: Button press triggers Sentry test error
  - ✅ Conditional Rendering: Only visible in __DEV__ mode

**Mocks Needed**:
- Sentry SDK

**Props to Test**:
```typescript
interface Props {
  // No props
}
```

---

### Prompt 50-51: Onboarding Components Tests

**File**: `components/onboarding/__tests__/OnboardingStep.test.tsx`

Create RNTL tests for OnboardingStep (`components/onboarding/OnboardingStep.tsx`). LOW priority first-time user component.

**Requirements (5-6 test cases)**:
- ✅ Rendering: Step content (image, title, description), next button, skip button
- ✅ Props: Step data, current step index
- ✅ User Interactions: Next button, skip button
- ✅ Callbacks: onNext, onSkip

**File**: `components/onboarding/__tests__/ProgressDots.test.tsx`

Create RNTL tests for ProgressDots (`components/onboarding/ProgressDots.tsx`). LOW priority progress indicator.

**Requirements (3-4 test cases)**:
- ✅ Rendering: Dots for each step (e.g., 4 dots for 4 steps)
- ✅ Visual States: Active dot (filled), inactive dots (outline)
- ✅ Props: Total steps, current step

---

## 🔵 PHASE 11: LOW - Display Components (Week 6)

### Prompt 52: CalendarDay Component Tests

**File**: `components/__tests__/CalendarDay.test.tsx`

Create RNTL tests for CalendarDay (`components/CalendarDay.tsx`). MEDIUM priority calendar cell component.

**Requirements**:
- **6-8 test cases** covering:
  - ✅ Rendering: Day cell, date number, steps indicator
  - ✅ Data Display: Steps count (e.g., "5,432"), goal status (checkmark if met)
  - ✅ Visual States: Selected (highlighted), goal met (green background), no data (grey)
  - ✅ User Interactions: Day press triggers callback
  - ✅ Callbacks: onPress (with day data)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  date: string; // ISO date
  steps: number;
  goalMet: boolean;
  selected?: boolean;
  onPress: (date: string) => void;
}
```

---

### Prompt 53: SkeletonLoader Component Tests

**File**: `components/__tests__/SkeletonLoader.test.tsx`

Create RNTL tests for SkeletonLoader (`components/SkeletonLoader.tsx`). MEDIUM priority loading component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Skeleton shape (rectangle), pulse animation
  - ✅ Props: Width, height, borderRadius (customizable)
  - ✅ Animation: Pulse effect (opacity fade in/out)

**Mocks Needed**:
- `useTheme` hook
- Animated API

**Props to Test**:
```typescript
interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}
```

---

### Prompt 54: EmptyHistoryState Component Tests

**File**: `components/__tests__/EmptyHistoryState.test.tsx`

Create RNTL tests for EmptyHistoryState (`components/EmptyHistoryState.tsx`). MEDIUM priority empty state component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Empty message, icon, call-to-action button
  - ✅ User Interactions: CTA button press
  - ✅ Callbacks: onAction

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  message?: string;
  actionText?: string;
  onAction?: () => void;
}
```

---

### Prompt 55: EmptyPeriodState Component Tests

**File**: `components/__tests__/EmptyPeriodState.test.tsx`

Create RNTL tests for EmptyPeriodState (`components/EmptyPeriodState.tsx`). MEDIUM priority filtered empty state component.

**Requirements**:
- **5-6 test cases** covering:
  - ✅ Rendering: Empty message for selected period (e.g., "No walks this week")
  - ✅ Data Display: Period name in message
  - ✅ User Interactions: Change period button (optional)

**Mocks Needed**:
- `useTheme` hook

**Props to Test**:
```typescript
interface Props {
  period: 'week' | 'month' | 'year';
  onChangePeriod?: () => void;
}
```

---

## 📱 PHASE 12: SCREENS (Week 4-5)

### Prompt 56: TodayScreen Tests

**File**: `app/(tabs)/__tests__/index.test.tsx`

Create comprehensive RNTL integration tests for TodayScreen (`app/(tabs)/index.tsx`, 1074 lines). This is CRITICAL - the primary user interface.

**Requirements**:
- **25-30 test cases** covering:
  - ✅ Rendering: StepCircle (center), StatsCards (distance, duration, calories), StreakDisplay, LogWalkButton, ProfileButton
  - ✅ Data Display: Steps from `useHealthStore`, goal from `useProfileStore`, streak data from store
  - ✅ User Interactions: Log walk button opens LogWalkModal, refresh (pull-to-refresh), profile button navigates
  - ✅ Modal States: LogWalkModal, GoalCelebrationModal, StreakMilestoneModal, PostActivityModal
  - ✅ Loading States: Initial load (skeleton loaders), refreshing indicator
  - ✅ Empty States: No data (first-time user), no steps yet
  - ✅ Celebrations: Goal met confetti triggers, streak milestone modal triggers
  - ✅ Permissions: Health permission banner (if denied), notification banner (if not enabled)
  - ✅ Weather: Weather display (if weather enabled in settings)

**Mocks Needed**:
- All Zustand stores: `useHealthStore`, `useAuthStore`, `useProfileStore`, `useActiveWalkStore`
- All child components: `StepCircle`, `StatsCard`, `StreakDisplay`, `LogWalkModal`, `GoalCelebrationModal`, `StreakMilestoneModal`, `PostActivityModal`
- `useRouter` hook
- `supabase` client
- Weather service
- AsyncStorage

**Integration Points**:
- Test interaction between StepCircle and goal (fills based on steps/goal ratio)
- Test stats calculations (distance, duration, calories)
- Test celebration triggers (goal met, streak milestone)
- Test modal flow (open LogWalkModal → log walk → close modal → refresh data)

---

### Prompt 57: BuddiesScreen Tests

**File**: `app/(tabs)/__tests__/buddies.test.tsx`

Create comprehensive RNTL integration tests for BuddiesScreen (`app/(tabs)/buddies.tsx`, 660 lines). CRITICAL social feature screen.

**Requirements**:
- **20-25 test cases** covering:
  - ✅ Rendering: Tab selector (Activity/Buddies), buddy list, activity feed, pending requests section, add buddy button
  - ✅ Tab Navigation: Switch between Activity tab and Buddies tab
  - ✅ Data Display: Buddies list (BuddyListItem), activity feed items (ActivityCard), pending requests (PendingRequestCard)
  - ✅ User Interactions: Add buddy button opens modal, accept/decline requests, remove buddy, give kudos
  - ✅ Search: Buddy search functionality (opens search modal)
  - ✅ Modals: AddBuddyModal, discovery modal, buddy search modal
  - ✅ Loading States: Initial load, refreshing, sending request
  - ✅ Empty States: No buddies ("Add your first buddy"), no activity ("No activity yet"), no pending requests

**Mocks Needed**:
- `useSocialStore`, `useAuthStore`
- All child components: `BuddyListItem`, `ActivityCard`, `PendingRequestCard`, `AddBuddyModal`
- `useRouter` hook

---

### Prompt 58: ProfileScreen Tests

**File**: `app/__tests__/profile.test.tsx`

Create comprehensive RNTL integration tests for ProfileScreen (`app/profile.tsx`, 1164 lines). CRITICAL settings and profile management screen.

**Requirements**:
- **20-25 test cases** covering:
  - ✅ Rendering: ProfileHeader, StatsGrid, settings sections (Notifications, Units, Appearance, Health, Data), sign out button
  - ✅ Data Display: Profile data (name, email, avatar), stats (total walks, total steps, streak), all settings values
  - ✅ User Interactions: Edit profile button, goal slider (change goal), settings toggles, sign out button
  - ✅ Modals: TimePickerModal (notification time), units modal, theme modal, historical import modal
  - ✅ Settings: Notifications (toggle, time picker), units (km/mi, kg/lb), theme (light/dark/auto), walk time (toggle), weather interval (dropdown)
  - ✅ Permissions: Notification permission banner, health settings card
  - ✅ Data Management: Export data button, delete account button (with confirmation)
  - ✅ Loading States: Profile loading, stats loading

**Mocks Needed**:
- `useAuthStore`, `useProfileStore`, `useSocialStore`
- All child components: `ProfileHeader`, `StatsGrid`, `SettingsSection`, `SettingRow`, `GoalSlider`, `HealthSettingsCard`
- Notification service, Location service, Health service
- `useRouter` hook

---

### Prompt 59: HistoryScreen Tests

**File**: `app/(tabs)/__tests__/history.test.tsx`

Create comprehensive RNTL integration tests for HistoryScreen (`app/(tabs)/history.tsx`, 424 lines). HIGH priority historical data screen.

**Requirements**:
- **18-20 test cases** covering:
  - ✅ Rendering: TimePeriodSelector, CalendarHeatMap, SummaryStatsGrid, StepsBarChart, InsightsSection, WalksList
  - ✅ Period Selection: Week/Month/Year views, data updates on period change
  - ✅ Data Display: Daily stats on calendar, summary stats (total, average, days goal met), walks list for selected period
  - ✅ User Interactions: Day selection (shows day details), walk selection (opens details sheet), edit walk, delete walk
  - ✅ Modals: WalkDetailsSheet, EditWalkModal
  - ✅ Loading States: Initial load, period change loading
  - ✅ Empty States: No data for period, no walks for selected day
  - ✅ Animations: Fade transitions on period change

**Mocks Needed**:
- `useHistoryStore`, `useAuthStore`, `useProfileStore`
- All child components: `TimePeriodSelector`, `CalendarHeatMap`, `SummaryStatsGrid`, `StepsBarChart`, `InsightsSection`, `WalksList`
- History data utilities (date calculations, stats aggregation)

---

### Prompt 60: InsightsScreen Tests

**File**: `app/(tabs)/__tests__/insights.test.tsx`

Create RNTL integration tests for InsightsScreen (`app/(tabs)/insights.tsx`, 313 lines). HIGH priority analytics screen.

**Requirements**:
- **12-15 test cases** covering:
  - ✅ Rendering: Insights cards (weekly average, best day, consistency), analytics charts
  - ✅ Data Display: Weekly average steps, best day (day name + steps), consistency percentage
  - ✅ Calculations: Averages calculated from historical data, best day determination, consistency calculation
  - ✅ Loading States: Initial load
  - ✅ Empty States: No data (first-time user or insufficient data)

**Mocks Needed**:
- `useProfileStore`, `useHistoryStore`, `useAuthStore`
- History data utilities
- `InsightsCard` component

---

### Prompt 61-66: Auth & Modal Screens Tests

**File**: `app/(auth)/__tests__/sign-in.test.tsx` - SignInScreen (5-6 tests, MEDIUM priority)
**File**: `app/(auth)/__tests__/sign-up.test.tsx` - SignUpScreen (5-6 tests, MEDIUM priority)
**File**: `app/(auth)/__tests__/forgot-password.test.tsx` - ForgotPasswordScreen (3-4 tests, LOW priority)
**File**: `app/(auth)/__tests__/onboarding.test.tsx` - OnboardingScreen (3-4 tests, LOW priority)
**File**: `app/(tabs)/__tests__/map.test.tsx` - MapScreen (3-4 tests, LOW priority)

Create RNTL tests for auth screens (sign-in, sign-up, forgot-password, onboarding) and map screen. These are MEDIUM-LOW priority since they're covered by E2E tests or are simple screens.

**Requirements**:
- ✅ Form rendering and validation
- ✅ User input changes
- ✅ Submit button interactions
- ✅ Error states (validation, API errors)
- ✅ Success states (navigation)
- ✅ Loading states

---

### Prompt 67-71: Modal Screen Wrappers Tests

Create simple RNTL tests for modal screen wrappers. These are just navigation wrappers around already-tested components, so only need 1-2 tests each:

- `app/modals/__tests__/buddy-preview.test.tsx` - BuddyPreviewModal (uses BuddyPreview component)
- `app/modals/__tests__/buddy-search.test.tsx` - BuddySearchModal (uses BuddySearch component)
- `app/modals/__tests__/contacts-sync.test.tsx` - ContactsSyncModal (uses ContactsSync component)
- `app/modals/__tests__/edit-profile.test.tsx` - EditProfileModal (profile edit form)
- `app/modals/__tests__/qr-scan.test.tsx` - QRScanModal (uses QRScanner component)
- `app/modals/__tests__/show-qr.test.tsx` - ShowQRModal (uses QRCodeDisplay component)

**Requirements (1-2 tests each)**:
- ✅ Modal wrapper renders component
- ✅ Modal close navigation

---

## 🎯 SUMMARY & EXECUTION STRATEGY

### Total Testing Scope
- **74 total items** (58 components + 11 screens + 5 already tested)
- **608-728 estimated test cases**
- **71 prompts** above (covering 69 new items, 5 already complete)

### Recommended Execution Order

**Week 1**: Prompts 1-7 (CRITICAL Walk Logging & Goal Management)
**Week 2**: Prompts 8-15 (CRITICAL/HIGH Social Features & Profile)
**Week 3**: Prompts 16-26 (HIGH History/Analytics & Celebrations)
**Week 4**: Prompts 27-35 (MEDIUM Social Sharing & Settings)
**Week 5**: Prompts 36-55 (MEDIUM Miscellaneous & Display Components)
**Week 6**: Prompts 56-71 (Screens & Remaining Components)

### How to Use These Prompts with Augment Code

1. **Copy the General Testing Context** section at the top and include it with EVERY prompt you give to Augment
2. **Give prompts one at a time** or in small batches (2-3 max) to ensure quality
3. **Review generated tests** before moving to next prompt - make sure mocks are correct and test scenarios are comprehensive
4. **Run tests frequently** during development: `npm test -- ComponentName.test.tsx`
5. **Track progress** - mark prompts as complete in this document

### Key Success Factors

✅ **Always include General Testing Context** with each prompt
✅ **Verify mocks are correct** - incorrect mocks = failing tests
✅ **Check coverage** - aim for targets per priority level
✅ **Test edge cases** - null props, empty arrays, error states
✅ **Keep tests isolated** - each test should be independent
✅ **Use descriptive test names** - clearly state what's being tested

---

**Good luck! You've got this! 🚀**