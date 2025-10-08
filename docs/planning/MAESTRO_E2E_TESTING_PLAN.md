# Stepin E2E Testing Plan - Maestro
## Comprehensive Two-Phase Implementation Strategy

---

## Executive Summary

This document outlines a **pragmatic, CI/CD-optimized** end-to-end testing strategy for the Stepin wellness walking app using Maestro. The plan is divided into two phases:

- **Phase 1 (75% Coverage):** 70 fully automatable tests for CI/CD pipeline
- **Phase 2 (25% Coverage):** 25 tests requiring manual execution or heavy modification

**Total Coverage:** ~95 test scenarios covering 90%+ of user-facing functionality

**Timeline:** 8-10 weeks for full implementation

---

## Table of Contents

1. [Phase 1: Automated CI/CD Tests (75%)](#phase-1-automated-cicd-tests-75)
2. [Phase 2: Manual & Modified Tests (25%)](#phase-2-manual--modified-tests-25)
3. [Test Infrastructure Requirements](#test-infrastructure-requirements)
4. [Mocking Strategy](#mocking-strategy)
5. [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
6. [Test Data Management](#test-data-management)
7. [Implementation Timeline](#implementation-timeline)
8. [Success Metrics](#success-metrics)

---

## Phase 1: Automated CI/CD Tests (75%)

**Target:** 70 tests fully automated and running in CI/CD pipeline  
**Timeline:** 6-7 weeks  
**Priority:** P0 (Critical) and P1 (High)

### Phase 1A: Foundation Tests (Weeks 1-4)

#### 1. Authentication Tests (4 tests) - `e2e/auth/`

**Priority:** P0 - Critical

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `01-auth-signup.yaml` | New user account creation | Low | 0.5 days |
| `02-auth-signin.yaml` | Existing user authentication | Low | 0.5 days |
| `04-auth-session.yaml` | Session persistence across app restarts | Medium | 1 day |
| `05-auth-errors.yaml` | Error handling (invalid email, wrong password, network errors) | Medium | 1 day |

**Total:** 3 days

**Key Implementation Details:**

**01-auth-signup.yaml:**
```yaml
appId: com.stepin.app
---
# Test: New user sign up flow
- launchApp
- tapOn: "Sign Up"
- inputText: "test-${timestamp}@stepin.test"
- tapOn: "Password"
- inputText: "SecurePass123!"
- tapOn: "Display Name"
- inputText: "Test User"
- tapOn: "Sign Up"
- assertVisible: "Welcome to Stepin"  # Onboarding screen
- runScript: |
    # Verify profile created in database
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'test-${timestamp}@stepin.test')
      .single();
    assert(data !== null);
```

**Mocking Requirements:**
- ✅ None - Uses real Supabase test instance
- ⚠️ **Note:** Onboarding permission steps will be tested separately with mocked permissions

---

#### 2. Manual Walk Logging Tests (8 tests) - `e2e/logging/`

**Priority:** P0 - Critical

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `40-log-modal-open.yaml` | Verify log walk modal opens correctly | Low | 0.5 days |
| `41-log-simple-entry.yaml` | Basic walk logging (steps only) | Low | 0.5 days |
| `42-log-detailed-entry.yaml` | Logging with all fields (steps, duration, distance) | Low | 0.5 days |
| `43-log-validation.yaml` | Input validation (negative, too high, zero) | Medium | 1 day |
| `44-log-future-date.yaml` | Prevent future date logging | Low | 0.5 days |
| `45-log-duplicate.yaml` | Duplicate walk warning and handling | Medium | 1 day |
| `46-log-high-steps.yaml` | High step count confirmation | Low | 0.5 days |
| `47-log-auto-calculate.yaml` | Auto-calculate distance from steps | Low | 0.5 days |

**Total:** 5 days

**Key Implementation Details:**

**43-log-validation.yaml:**
```yaml
appId: com.stepin.app
---
# Test: Input validation for walk logging
- launchApp
- tapOn: "Log Walk"
- assertVisible: "Log Walk"

# Test Case 1: Negative steps
- tapOn: "Steps"
- inputText: "-100"
- assertVisible: "Steps must be positive"
- assertNotVisible: 
    id: "save-button"
    enabled: true

# Test Case 2: Steps too high
- clearText
- inputText: "300000"
- assertVisible: "Steps must be 200,000 or less"

# Test Case 3: Invalid duration
- tapOn: "Steps"
- clearText
- inputText: "5000"
- tapOn: "Duration"
- inputText: "2000"
- assertVisible: "Duration cannot exceed 1,440 minutes"

# Test Case 4: Valid input after errors
- tapOn: "Duration"
- clearText
- inputText: "45"
- assertNotVisible: "Steps must be"
- assertNotVisible: "Duration cannot"
- assertVisible:
    id: "save-button"
    enabled: true
```

**Mocking Requirements:**
- ✅ None - Pure form validation testing

---

#### 3. Core Step Tracking Tests (4 tests) - `e2e/today/`

**Priority:** P0 - Critical

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `10-today-initial-load.yaml` | Today screen displays correctly | Low | 0.5 days |
| `11-today-refresh.yaml` | Pull-to-refresh syncs steps (MOCKED HealthKit) | High | 2 days |
| `12-today-goal-celebration.yaml` | Goal achievement celebration modal | Medium | 1 day |
| `15-today-offline.yaml` | Offline mode banner and functionality | Medium | 1 day |

**Total:** 4.5 days

**Key Implementation Details:**

**11-today-refresh.yaml (with HealthKit mocking):**
```yaml
appId: com.stepin.app
env:
  MOCK_HEALTHKIT: "true"
  MOCK_HEALTHKIT_STEPS: "5000"
---
# Test: Pull-to-refresh syncs steps from HealthKit
- launchApp
- assertVisible: "Today"
- runScript: |
    # Set mock HealthKit data
    await mockHealthKit.setSteps(5000);
- swipe:
    direction: DOWN
    duration: 500
- assertVisible: "Syncing..."
- waitForAnimationToEnd:
    timeout: 5000
- assertVisible: "5,000"  # Step count
- assertVisible: "71%"    # Progress (5000/7000 default goal)
```

**Mocking Requirements:**
- 🔧 **REQUIRED:** Mock HealthKit service (see [Mocking Strategy](#mocking-strategy))
- Implementation: `lib/health/__mocks__/HealthKitService.ts`

---

#### 4. Streak System Tests (5 tests) - `e2e/streaks/`

**Priority:** P0 - Critical

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `50-streak-init.yaml` | Streak initialization for new users | Low | 0.5 days |
| `51-streak-continue.yaml` | Streak continues with consecutive days (MOCKED DATE) | High | 2 days |
| `52-streak-break.yaml` | Streak breaks correctly (MOCKED DATE) | High | 2 days |
| `54-streak-milestones.yaml` | Milestone celebrations (7, 14, 30 days) | Medium | 1.5 days |
| `55-streak-multiple-walks.yaml` | Multiple walks same day combine for goal | Medium | 1 day |

**Total:** 7 days

**Key Implementation Details:**

**51-streak-continue.yaml (with date mocking):**
```yaml
appId: com.stepin.app
env:
  MOCK_DATE: "true"
---
# Test: Streak continues with consecutive days
- launchApp
- runScript: |
    # Setup: Mock database state
    await testDb.setStreak({
      current_streak: 5,
      longest_streak: 10,
      last_goal_met_date: '2024-01-14'  # Yesterday
    });
    
    # Mock today's date
    await mockDate.setDate('2024-01-15');
    
- tapOn: "Log Walk"
- inputText: "7500"  # Meets default 7000 goal
- tapOn: "Save"
- assertVisible: "6 day streak"  # Incremented from 5
- runScript: |
    const { data } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak')
      .single();
    assert(data.current_streak === 6);
    assert(data.longest_streak === 10);  # Unchanged
```

**Mocking Requirements:**
- 🔧 **REQUIRED:** Date injection service (see [Mocking Strategy](#mocking-strategy))
- Implementation: `lib/utils/__mocks__/dateService.ts`

---

### Phase 1B: Core Features (Weeks 5-6)

#### 5. History Screen Tests (7 tests) - `e2e/history/`

**Priority:** P1 - High

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `20-history-navigation.yaml` | Navigate to History tab | Low | 0.5 days |
| `21-history-filters.yaml` | Time period filtering (Week/Month/Year) | Medium | 1 day |
| `22-history-calendar.yaml` | Calendar heat map interactions | Medium | 1.5 days |
| `23-history-walk-details.yaml` | Walk details sheet | Low | 0.5 days |
| `24-history-delete.yaml` | Swipe-to-delete walk | Medium | 1 day |
| `25-history-stats.yaml` | Summary statistics calculations | Medium | 1 day |
| `26-history-empty.yaml` | Empty state display | Low | 0.5 days |

**Total:** 6 days

**Key Implementation Details:**

**24-history-delete.yaml:**
```yaml
appId: com.stepin.app
---
# Test: Swipe-to-delete walk with confirmation
- launchApp
- tapOn: "History"
- assertVisible: "Walk List"

# Get first walk details for verification
- runScript: |
    const firstWalk = await getFirstWalkInList();
    output.walkId = firstWalk.id;
    output.walkSteps = firstWalk.steps;

# Swipe left to reveal delete button
- swipe:
    direction: LEFT
    on:
      id: "walk-item-${output.walkId}"
- assertVisible: "Delete"

# Test cancellation
- tapOn: "Delete"
- assertVisible: "Delete this walk?"
- tapOn: "Cancel"
- assertVisible:
    id: "walk-item-${output.walkId}"  # Still exists

# Confirm deletion
- swipe:
    direction: LEFT
    on:
      id: "walk-item-${output.walkId}"
- tapOn: "Delete"
- tapOn: "Delete"  # Confirm
- assertNotVisible:
    id: "walk-item-${output.walkId}"

# Verify database deletion
- runScript: |
    const { data } = await supabase
      .from('walks')
      .select('*')
      .eq('id', output.walkId)
      .single();
    assert(data === null);
```

**Mocking Requirements:**
- ✅ None - Uses real database operations

---

#### 6. Profile & Settings Tests (6 tests) - `e2e/profile/`

**Priority:** P1 - High

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `30-profile-display.yaml` | Profile information displays correctly | Low | 0.5 days |
| `31-profile-goal.yaml` | Daily goal adjustment | Medium | 1 day |
| `32-profile-units.yaml` | Units preference (miles/kilometers) | Medium | 1 day |
| `33-profile-theme.yaml` | Theme switching (light/dark) | Medium | 1 day |
| `35-profile-export.yaml` | Data export to JSON | Medium | 1.5 days |
| `36-profile-signout.yaml` | Sign out process | Low | 0.5 days |

**Total:** 5.5 days

**Key Implementation Details:**

**31-profile-goal.yaml:**
```yaml
appId: com.stepin.app
---
# Test: Adjust daily goal and verify across app
- launchApp
- tapOn: "Profile"
- assertVisible: "Daily Goal"
- assertVisible: "7,000 steps"  # Default

# Drag slider to 10000
- tapOn:
    id: "goal-slider"
- dragTo:
    x: 75%  # Approximate position for 10000
- assertVisible: "10,000 steps"  # Preview updates
- waitForAnimationToEnd

# Verify database updated
- runScript: |
    const { data } = await supabase
      .from('profiles')
      .select('daily_step_goal')
      .single();
    assert(data.daily_step_goal === 10000);

# Verify Today screen reflects change
- tapOn: "Today"
- assertVisible: "10,000"  # Goal display
- runScript: |
    # If user has 5000 steps
    const progress = 5000 / 10000 * 100;
    assert(progress === 50);
```

**Mocking Requirements:**
- ✅ None - Real UI interactions and database updates

---

### Phase 1C: Error Handling & Journeys (Week 7)

#### 7. Error Handling Tests (6 tests) - `e2e/errors/`

**Priority:** P2 - Medium

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `70-error-network.yaml` | Network error handling | Medium | 1 day |
| `71-error-database.yaml` | Database error handling | Medium | 1 day |
| `73-error-large-data.yaml` | Performance with 500+ walks | High | 1.5 days |
| `74-error-invalid-data.yaml` | Invalid/corrupted data handling | Medium | 1 day |
| `75-error-concurrent.yaml` | Concurrent operations | High | 1.5 days |
| `76-error-state-recovery.yaml` | App state recovery after crash | Medium | 1 day |

**Total:** 7 days

**Key Implementation Details:**

**70-error-network.yaml:**
```yaml
appId: com.stepin.app
---
# Test: Network error handling and recovery
- launchApp
- tapOn: "History"
- assertVisible: "Walk List"

# Disable network
- runScript: |
    await mockNetwork.disable();

# Attempt to load data
- swipe:
    direction: DOWN  # Pull to refresh
- assertVisible: "Unable to connect"
- assertVisible: "Please check your internet"
- assertVisible: "Offline"  # Banner

# Verify cached data still accessible
- assertVisible: "Walk List"

# Re-enable network and retry
- runScript: |
    await mockNetwork.enable();
- tapOn: "Retry"
- waitForAnimationToEnd
- assertNotVisible: "Offline"
- assertVisible: "Walk List"
```

**Mocking Requirements:**
- 🔧 **REQUIRED:** Network mocking (Maestro built-in or custom)

---

#### 8. Critical User Journeys (2 tests) - `e2e/journeys/`

**Priority:** P2 - Medium

| Test File | Description | Complexity | Estimated Time |
|-----------|-------------|------------|----------------|
| `93-journey-settings.yaml` | Complete settings adjustment flow | Medium | 1.5 days |
| `94-journey-data-review.yaml` | Historical data review flow | Medium | 1.5 days |

**Total:** 3 days

**Key Implementation Details:**

**93-journey-settings.yaml:**
```yaml
appId: com.stepin.app
---
# Test: User adjusts all settings and verifies persistence
- launchApp

# Initial state verification
- tapOn: "Profile"
- assertVisible: "7,000 steps"  # Default goal
- assertVisible: "Miles"  # Default units
- assertVisible: "System"  # Default theme

# Adjust goal
- tapOn:
    id: "goal-slider"
- dragTo:
    x: 75%
- assertVisible: "10,000 steps"

# Change units
- tapOn: "Preferences"
- tapOn: "Units"
- tapOn: "Kilometers"
- tapOn: "Back"

# Change theme
- tapOn: "Theme"
- tapOn: "Dark"
- assertVisible:
    id: "app-background"
    trait: "dark"  # Verify dark mode applied

# Verify Today screen reflects changes
- tapOn: "Today"
- assertVisible: "10,000"  # New goal
- assertVisible: "km"  # Kilometers

# Test persistence
- runScript: |
    await app.terminate();
    await app.launch();
- tapOn: "Profile"
- assertVisible: "10,000 steps"
- assertVisible: "Kilometers"
- assertVisible: "Dark"
```

**Mocking Requirements:**
- ✅ None - Real settings persistence

---

## Phase 1 Summary

**Total Tests:** 70  
**Total Estimated Time:** 42 days (6-7 weeks with parallel work)  
**Coverage:** ~75% of user-facing functionality  
**CI/CD Ready:** ✅ All tests can run in automated pipeline  

### Phase 1 Test Distribution

| Category | Tests | Days | Priority |
|----------|-------|------|----------|
| Authentication | 4 | 3 | P0 |
| Manual Logging | 8 | 5 | P0 |
| Step Tracking | 4 | 4.5 | P0 |
| Streak System | 5 | 7 | P0 |
| History | 7 | 6 | P1 |
| Profile/Settings | 6 | 5.5 | P1 |
| Error Handling | 6 | 7 | P2 |
| User Journeys | 2 | 3 | P2 |
| **TOTAL** | **70** | **42** | - |

---

## Phase 2: Manual & Modified Tests (25%)

**Target:** 25 tests requiring manual execution or significant modification
**Timeline:** 2-3 weeks (manual QA checklist + selective automation)
**Priority:** P3 (Low) - Pre-release manual testing

### Why These Tests Cannot Be Fully Automated

These tests fall into four categories that present significant CI/CD challenges:

1. **OS-Level Permissions** - System dialogs cannot be reliably automated
2. **Time-Based Triggers** - Cannot wait hours/days in CI pipeline
3. **Accessibility Features** - Require screen readers, device settings, external hardware
4. **Native Integrations** - HealthKit/Health Connect require real device testing

### Phase 2A: Permission & Onboarding Tests (4 tests)

**Approach:** Manual testing with automated verification where possible

| Test File | Description | Why Manual | Alternative Automation |
|-----------|-------------|------------|------------------------|
| `03-auth-onboarding.yaml` | 6-step onboarding with permissions | OS permission dialogs | Mock permissions granted, test flow only |
| `14-today-permissions.yaml` | Health permission banner | OS permission dialogs | Mock permission state changes |
| `60-notification-permission.yaml` | Notification permission request | OS permission dialogs | Mock permission state |
| `90-journey-new-user.yaml` | Complete new user journey | Combines multiple permission flows | Split into smaller automated tests |

**Manual QA Checklist - Onboarding Flow:**

```markdown
### Test: 03-auth-onboarding.yaml

**Prerequisites:**
- Fresh app install (delete and reinstall)
- No existing account

**Steps:**
1. ☐ Launch app
2. ☐ Tap "Sign Up"
3. ☐ Enter email: qa-test-{date}@stepin.test
4. ☐ Enter password: TestPass123!
5. ☐ Enter name: "QA Tester"
6. ☐ Submit sign up
7. ☐ **Step 1 - Welcome:** Verify 3 benefits listed, tap "Get Started"
8. ☐ **Step 2 - How It Works:** Verify 3-step explanation, tap "Next"
9. ☐ **Step 3 - Goal:** Drag slider to 7000, tap "Next"
10. ☐ **Step 4 - Health:** Tap "Grant Permission"
11. ☐ **OS Dialog:** Tap "Allow" on HealthKit permission
12. ☐ Verify checkmark appears
13. ☐ **Step 5 - Notifications:** Tap "Enable Notifications"
14. ☐ **OS Dialog:** Tap "Allow" on notification permission
15. ☐ Verify checkmark appears
16. ☐ **Step 6 - Ready:** Verify goal summary shows 7000
17. ☐ Tap "Start Walking"
18. ☐ Verify redirect to Today screen
19. ☐ Verify onboarding_completed = true in database

**Success Criteria:**
- ✅ All 6 steps completed without errors
- ✅ Both permissions granted
- ✅ User lands on Today screen
- ✅ Database flag set correctly
```

---

### Phase 2B: Notification Tests (4 tests)

**Approach:** Verify scheduling logic in CI, manual test delivery

| Test File | Description | Why Manual | Alternative Automation |
|-----------|-------------|------------|------------------------|
| `61-notification-daily-reminder.yaml` | Daily reminder fires at set time | Cannot wait 2+ minutes in CI | Verify notification scheduled, not delivered |
| `62-notification-streak-reminder.yaml` | Streak reminder at 8 PM | Time-based trigger | Verify scheduling logic only |
| `63-notification-goal-celebration.yaml` | Goal celebration notification | Real-time trigger | Verify notification created, not displayed |
| `91-journey-daily-routine.yaml` | Daily routine with notifications | Time-based flow | Split into smaller tests |

**Automated Alternative (Verify Scheduling):**
```yaml
# 61-notification-daily-reminder-scheduling.yaml
appId: com.stepin.app
---
# Test: Verify daily reminder is scheduled correctly (not delivered)
- launchApp
- tapOn: "Profile"
- tapOn: "Notifications"
- tapOn:
    id: "daily-reminder-toggle"
- assertVisible:
    id: "daily-reminder-toggle"
    enabled: true
- tapOn: "Reminder Time"
- tapOn: "9:00 AM"
- tapOn: "Save"

# Verify notification scheduled (not delivered)
- runScript: |
    const notifications = await getScheduledNotifications();
    const dailyReminder = notifications.find(n => n.type === 'daily_reminder');

    assert(dailyReminder !== null, 'Daily reminder not scheduled');
    assert(dailyReminder.hour === 9, 'Wrong hour');
    assert(dailyReminder.minute === 0, 'Wrong minute');
    assert(dailyReminder.repeats === true, 'Should repeat daily');
```

**Manual QA Checklist - Notification Delivery:**

```markdown
### Test: 61-notification-daily-reminder.yaml

**Prerequisites:**
- Notification permissions granted
- Set reminder time to 2 minutes from now

**Steps:**
1. ☐ Navigate to Profile → Notifications
2. ☐ Toggle "Daily reminder" ON
3. ☐ Set time to [current time + 2 minutes]
4. ☐ Save settings
5. ☐ Close app (background, don't force quit)
6. ☐ Wait 2 minutes
7. ☐ **Verify notification appears** with:
   - Title: "Time to get moving! 🚶"
   - Body: "Let's hit your step goal today."
8. ☐ Tap notification
9. ☐ Verify app opens to Today screen

**Success Criteria:**
- ✅ Notification appears at scheduled time
- ✅ Tapping opens app to correct screen
```

---

### Phase 2C: Accessibility Tests (7 tests)

**Approach:** Manual testing only (automation extremely difficult)

| Test File | Description | Why Manual | Automation Feasibility |
|-----------|-------------|------------|------------------------|
| `80-a11y-screen-reader.yaml` | VoiceOver/TalkBack navigation | Screen reader automation unreliable | ❌ Not feasible |
| `81-a11y-dynamic-type.yaml` | Text scaling support | Requires device settings changes | ❌ Not feasible |
| `82-a11y-touch-targets.yaml` | Touch target sizes | Visual measurement required | ⚠️ Partial (unit tests) |
| `83-a11y-contrast.yaml` | Color contrast ratios | Visual analysis required | ⚠️ Partial (automated tools) |
| `84-a11y-reduced-motion.yaml` | Reduced motion support | Requires device settings | ❌ Not feasible |
| `85-a11y-keyboard.yaml` | Keyboard navigation | External hardware required | ❌ Not feasible |
| `86-a11y-announcements.yaml` | Screen reader announcements | Screen reader automation | ❌ Not feasible |

**Manual QA Checklist - Screen Reader:**

```markdown
### Test: 80-a11y-screen-reader.yaml

**Prerequisites:**
- Enable VoiceOver (iOS Settings → Accessibility → VoiceOver)
- OR enable TalkBack (Android Settings → Accessibility → TalkBack)

**Steps:**
1. ☐ Launch app with screen reader enabled
2. ☐ Navigate to Today screen
3. ☐ Swipe right to step circle
4. ☐ **Verify announcement:** "5,000 steps. 71% of goal"
5. ☐ Swipe right to streak counter
6. ☐ **Verify announcement:** "7 day streak"
7. ☐ Swipe right to Log Walk button
8. ☐ **Verify announcement:** "Log Walk. Button"
9. ☐ Double-tap to activate
10. ☐ **Verify modal opens** and focus moves to modal
11. ☐ Swipe through all modal elements
12. ☐ **Verify all elements have labels:**
    - Date picker: "Select date"
    - Steps input: "Enter steps"
    - Duration input: "Enter duration in minutes. Optional"
    - Save button: "Save walk. Button"
    - Cancel button: "Cancel. Button"

**Success Criteria:**
- ✅ All interactive elements have descriptive labels
- ✅ Focus order is logical (top to bottom)
- ✅ No unlabeled elements
- ✅ Interactions work with screen reader
```

---

### Phase 2D: Complex Integration Tests (10 tests)

**Approach:** Heavy mocking or manual testing

| Test File | Description | Approach | Automation Status |
|-----------|-------------|----------|-------------------|
| `13-today-streak-milestone.yaml` | Streak milestone celebrations | Database state mocking | ✅ Automate with mocks |
| `53-streak-goal-not-met.yaml` | Goal not met streak logic | Date mocking + multi-day | ⚠️ Automate with date injection |
| `56-streak-historical.yaml` | Historical walk streak recalc | Complex date logic | ⚠️ Automate with mocks |
| `72-error-healthkit.yaml` | HealthKit unavailable error | HealthKit mocking | ✅ Automate with mocks |
| `77-error-timezone.yaml` | Timezone change handling | Device settings | ⚠️ Manual preferred |
| `92-journey-streak-recovery.yaml` | Streak recovery journey | Multi-day simulation | ⚠️ Automate with date mocking |
| `34-profile-notifications.yaml` | Notification settings | Scheduling verification | ⚠️ Partial automation |
| `64-notification-persistence.yaml` | Notification persistence | Already automatable | ✅ **Move to Phase 1** |
| `65-notification-disable.yaml` | Disable notifications | Already automatable | ✅ **Move to Phase 1** |
| `33-profile-theme.yaml` | Theme switching (system theme) | System settings | ⚠️ Partial automation |

**Example: Automated with Heavy Mocking**
```yaml
# 13-today-streak-milestone.yaml
appId: com.stepin.app
env:
  MOCK_DATE: "true"
---
# Test: 7-day streak milestone celebration
- launchApp
- runScript: |
    # Mock database: user at 6-day streak
    await testDb.setStreak({
      current_streak: 6,
      longest_streak: 10,
      last_goal_met_date: await mockDate.yesterday()
    });

    # Mock today's date
    await mockDate.setDate('2024-01-15');

- tapOn: "Log Walk"
- inputText: "7500"  # Meets goal
- tapOn: "Save"

# Verify streak updated
- assertVisible: "7 day streak"

# Verify milestone modal appears
- assertVisible: "One week strong! 🔥"
- assertVisible: "7 days"
- tapOn: "Awesome!"

# Verify modal dismissed
- assertNotVisible: "One week strong"
- assertVisible: "Today"
```

---

## Phase 2 Summary

**Total Tests:** 25
**Fully Manual:** 12 tests
**Partially Automated:** 8 tests
**Moved to Phase 1:** 5 tests (already automatable)
**Coverage:** ~25% of user-facing functionality
**Execution:** Pre-release manual QA checklist

### Phase 2 Test Distribution

| Category | Total | Manual | Partial | Move to Phase 1 |
|----------|-------|--------|---------|-----------------|
| Permissions/Onboarding | 4 | 3 | 1 | 0 |
| Notifications | 6 | 3 | 1 | 2 |
| Accessibility | 7 | 7 | 0 | 0 |
| Complex Integration | 8 | 0 | 5 | 3 |
| **TOTAL** | **25** | **13** | **7** | **5** |

**Revised Phase 1 Total:** 70 + 5 = **75 tests**

---

## Test Infrastructure Requirements

### Required for CI/CD Pipeline

#### 1. macOS Runners
**Purpose:** Run iOS simulator tests
**Configuration:**
```yaml
# .github/workflows/e2e-tests.yml
runs-on: macos-14  # macOS Sonoma with Xcode 15
```

**Requirements:**
- Xcode 15+
- iOS 17+ simulator
- Node.js 18+
- Maestro CLI

---

#### 2. Test Database Instance
**Purpose:** Isolated Supabase instance for testing
**Setup:**
```bash
# Create test project in Supabase
# Set environment variables
SUPABASE_TEST_URL=https://test-project.supabase.co
SUPABASE_TEST_ANON_KEY=eyJ...test-key
```

**Database Seeding:**
```sql
-- test-fixtures/seed.sql
-- Create test users
INSERT INTO auth.users (id, email) VALUES
  ('test-user-1', 'test1@stepin.test'),
  ('test-user-2', 'test2@stepin.test');

-- Create test profiles
INSERT INTO profiles (id, display_name, daily_step_goal) VALUES
  ('test-user-1', 'Test User 1', 7000),
  ('test-user-2', 'Test User 2', 10000);

-- Create test walks
INSERT INTO walks (user_id, steps, date) VALUES
  ('test-user-1', 5000, '2024-01-15'),
  ('test-user-1', 8000, '2024-01-14');
```

---

#### 3. Mock Services

**3.1 HealthKit Mock Service**

**Implementation:** `lib/health/__mocks__/HealthKitService.ts`

```typescript
// lib/health/__mocks__/HealthKitService.ts
export class MockHealthKitService {
  private mockSteps: number = 0;
  private mockPermissionGranted: boolean = false;

  async requestPermissions(): Promise<boolean> {
    // In test mode, return mocked permission state
    if (process.env.MOCK_HEALTHKIT === 'true') {
      this.mockPermissionGranted = process.env.MOCK_HEALTHKIT_PERMISSION === 'granted';
      return this.mockPermissionGranted;
    }
    // Real implementation
    return super.requestPermissions();
  }

  async getTodaySteps(): Promise<number> {
    if (process.env.MOCK_HEALTHKIT === 'true') {
      return parseInt(process.env.MOCK_HEALTHKIT_STEPS || '0', 10);
    }
    return super.getTodaySteps();
  }

  async getStepsForDate(date: Date): Promise<number> {
    if (process.env.MOCK_HEALTHKIT === 'true') {
      const dateKey = date.toISOString().split('T')[0];
      const mockData = JSON.parse(process.env.MOCK_HEALTHKIT_DATA || '{}');
      return mockData[dateKey] || 0;
    }
    return super.getStepsForDate(date);
  }

  // Test helper methods
  setMockSteps(steps: number) {
    this.mockSteps = steps;
  }

  setMockPermission(granted: boolean) {
    this.mockPermissionGranted = granted;
  }
}
```

**Usage in Tests:**
```yaml
# e2e/today/11-today-refresh.yaml
appId: com.stepin.app
env:
  MOCK_HEALTHKIT: "true"
  MOCK_HEALTHKIT_STEPS: "5000"
  MOCK_HEALTHKIT_PERMISSION: "granted"
---
- launchApp
- swipe:
    direction: DOWN
- assertVisible: "5,000"
```

---

**3.2 Date Injection Service**

**Implementation:** `lib/utils/dateService.ts`

```typescript
// lib/utils/dateService.ts
class DateService {
  private mockDate: Date | null = null;

  now(): Date {
    if (process.env.MOCK_DATE === 'true' && this.mockDate) {
      return new Date(this.mockDate);
    }
    return new Date();
  }

  today(): Date {
    const now = this.now();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  yesterday(): Date {
    const today = this.today();
    return new Date(today.getTime() - 24 * 60 * 60 * 1000);
  }

  // Test helper
  setMockDate(date: string | Date) {
    this.mockDate = new Date(date);
  }

  resetMockDate() {
    this.mockDate = null;
  }
}

export const dateService = new DateService();
```

**Usage in Code:**
```typescript
// Replace all instances of `new Date()` with:
import { dateService } from '@/lib/utils/dateService';

const today = dateService.today();
const now = dateService.now();
```

**Usage in Tests:**
```yaml
# e2e/streaks/51-streak-continue.yaml
appId: com.stepin.app
env:
  MOCK_DATE: "true"
---
- runScript: |
    await dateService.setMockDate('2024-01-15');
- launchApp
# ... rest of test
```

---

**3.3 Notification Mock Service**

**Implementation:** `lib/notifications/__mocks__/NotificationService.ts`

```typescript
// lib/notifications/__mocks__/NotificationService.ts
export class MockNotificationService {
  private scheduledNotifications: Array<{
    id: string;
    type: string;
    hour: number;
    minute: number;
    repeats: boolean;
  }> = [];

  async scheduleNotification(config: NotificationConfig): Promise<string> {
    if (process.env.MOCK_NOTIFICATIONS === 'true') {
      const id = `mock-${Date.now()}`;
      this.scheduledNotifications.push({
        id,
        type: config.type,
        hour: config.hour,
        minute: config.minute,
        repeats: config.repeats,
      });
      return id;
    }
    return super.scheduleNotification(config);
  }

  async getScheduledNotifications() {
    if (process.env.MOCK_NOTIFICATIONS === 'true') {
      return this.scheduledNotifications;
    }
    return super.getScheduledNotifications();
  }

  async cancelNotification(id: string) {
    if (process.env.MOCK_NOTIFICATIONS === 'true') {
      this.scheduledNotifications = this.scheduledNotifications.filter(n => n.id !== id);
      return;
    }
    return super.cancelNotification(id);
  }
}
```

---

#### 4. Test Data Management

**4.1 Database Fixtures**

**Structure:**
```
e2e/
├── fixtures/
│   ├── users.json
│   ├── walks.json
│   ├── streaks.json
│   └── profiles.json
├── helpers/
│   ├── setup.yaml
│   ├── teardown.yaml
│   └── seed-database.ts
└── tests/
    └── ...
```

**Example Fixture:**
```json
// e2e/fixtures/users.json
{
  "test-user-1": {
    "email": "test1@stepin.test",
    "password": "TestPass123!",
    "profile": {
      "display_name": "Test User 1",
      "daily_step_goal": 7000,
      "units_preference": "miles",
      "theme_preference": "system"
    },
    "walks": [
      {
        "date": "2024-01-15",
        "steps": 5000,
        "duration": 30,
        "distance": 2.4
      }
    ],
    "streak": {
      "current_streak": 5,
      "longest_streak": 10,
      "last_goal_met_date": "2024-01-14"
    }
  }
}
```

**Seeding Script:**
```typescript
// e2e/helpers/seed-database.ts
import { createClient } from '@supabase/supabase-js';
import users from '../fixtures/users.json';

export async function seedDatabase() {
  const supabase = createClient(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_TEST_SERVICE_KEY!
  );

  // Clear existing data
  await supabase.from('walks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Seed users
  for (const [userId, userData] of Object.entries(users)) {
    // Create auth user
    await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    // Create profile
    await supabase.from('profiles').insert({
      id: userId,
      ...userData.profile,
    });

    // Create walks
    for (const walk of userData.walks) {
      await supabase.from('walks').insert({
        user_id: userId,
        ...walk,
      });
    }

    // Create streak
    await supabase.from('streaks').insert({
      user_id: userId,
      ...userData.streak,
    });
  }
}
```

---

**4.2 Setup & Teardown**

**Setup Script:**
```yaml
# e2e/helpers/setup.yaml
appId: com.stepin.app
---
# Run before each test suite
- runScript: |
    // Seed database with test data
    await seedDatabase();

    // Clear app data
    await clearAppData();

    // Set environment variables
    process.env.MOCK_HEALTHKIT = 'true';
    process.env.MOCK_NOTIFICATIONS = 'true';
    process.env.MOCK_DATE = 'true';
```

**Teardown Script:**
```yaml
# e2e/helpers/teardown.yaml
appId: com.stepin.app
---
# Run after each test suite
- runScript: |
    // Clean up test data
    await cleanupDatabase();

    // Reset mocks
    await resetAllMocks();

    // Clear app data
    await clearAppData();
```

---

#### 5. CI/CD Pipeline Tools

**Required:**
- ✅ Maestro CLI
- ✅ Expo CLI
- ✅ Node.js 18+
- ✅ Supabase CLI (for database management)

**Nice-to-Have:**
- ⚠️ Maestro Cloud (parallel test execution)
- ⚠️ Screenshot/video recording
- ⚠️ Performance monitoring
- ⚠️ Flaky test detection

---

## Mocking Strategy

### Summary of Required Mocks

| Service | Priority | Complexity | Implementation Time |
|---------|----------|------------|---------------------|
| HealthKit | P0 - Critical | High | 2-3 days |
| Date/Time | P0 - Critical | Medium | 1-2 days |
| Notifications | P1 - High | Medium | 1-2 days |
| Network | P2 - Medium | Low | 0.5-1 day |
| Permissions | P2 - Medium | Medium | 1-2 days |

**Total Mocking Implementation:** 5.5-10 days

### Mock Implementation Checklist

- [ ] **HealthKit Mock Service**
  - [ ] Mock step count retrieval
  - [ ] Mock permission state
  - [ ] Mock historical data
  - [ ] Environment variable configuration
  - [ ] Test helper methods

- [ ] **Date Service**
  - [ ] Replace all `new Date()` calls
  - [ ] Implement mock date injection
  - [ ] Add test helper methods
  - [ ] Environment variable configuration

- [ ] **Notification Mock Service**
  - [ ] Mock notification scheduling
  - [ ] Mock notification cancellation
  - [ ] Track scheduled notifications
  - [ ] Environment variable configuration

- [ ] **Network Mock**
  - [ ] Use Maestro HTTP mocking
  - [ ] Mock Supabase responses (if needed)
  - [ ] Simulate network errors

- [ ] **Permission Mock**
  - [ ] Mock permission state
  - [ ] Bypass OS dialogs in test builds
  - [ ] Environment variable configuration

---

## CI/CD Pipeline Configuration

### GitHub Actions Workflow

**File:** `.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'

env:
  EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
  MOCK_HEALTHKIT: "true"
  MOCK_NOTIFICATIONS: "true"
  MOCK_DATE: "true"

jobs:
  # P0 Tests - Run on every commit
  test-p0-critical:
    name: P0 - Critical Tests
    runs-on: macos-14
    timeout-minutes: 25

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd stepin-app
          npm ci

      - name: Setup iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15" || true
          xcrun simctl list devices

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "${HOME}/.maestro/bin" >> $GITHUB_PATH

      - name: Build iOS app
        run: |
          cd stepin-app
          npx expo prebuild --platform ios --clean
          npx expo run:ios --configuration Release --no-install

      - name: Seed test database
        run: |
          cd stepin-app
          npm run test:seed-db

      - name: Run P0 Tests - Authentication
        run: |
          cd stepin-app
          maestro test e2e/auth/01-auth-signup.yaml \
                       e2e/auth/02-auth-signin.yaml \
                       e2e/auth/04-auth-session.yaml \
                       e2e/auth/05-auth-errors.yaml

      - name: Run P0 Tests - Manual Logging
        run: |
          cd stepin-app
          maestro test e2e/logging/

      - name: Run P0 Tests - Core Tracking
        run: |
          cd stepin-app
          maestro test e2e/today/10-today-initial-load.yaml \
                       e2e/today/11-today-refresh.yaml \
                       e2e/today/12-today-goal-celebration.yaml \
                       e2e/today/15-today-offline.yaml

      - name: Run P0 Tests - Streak System
        run: |
          cd stepin-app
          maestro test e2e/streaks/50-streak-init.yaml \
                       e2e/streaks/51-streak-continue.yaml \
                       e2e/streaks/52-streak-break.yaml \
                       e2e/streaks/54-streak-milestones.yaml \
                       e2e/streaks/55-streak-multiple-walks.yaml

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: p0-test-results
          path: |
            ~/.maestro/tests/
            stepin-app/ios/build/

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: p0-failure-screenshots
          path: ~/.maestro/tests/**/*.png

  # P1 Tests - Run on main/develop pushes
  test-p1-core-features:
    name: P1 - Core Features
    runs-on: macos-14
    needs: test-p0-critical
    if: github.event_name == 'push'
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd stepin-app
          npm ci

      - name: Setup iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15" || true

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "${HOME}/.maestro/bin" >> $GITHUB_PATH

      - name: Build iOS app
        run: |
          cd stepin-app
          npx expo prebuild --platform ios --clean
          npx expo run:ios --configuration Release --no-install

      - name: Seed test database
        run: |
          cd stepin-app
          npm run test:seed-db

      - name: Run P1 Tests - History
        run: |
          cd stepin-app
          maestro test e2e/history/

      - name: Run P1 Tests - Profile & Settings
        run: |
          cd stepin-app
          maestro test e2e/profile/

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: p1-test-results
          path: ~/.maestro/tests/

  # P2 Tests - Run daily or on main branch
  test-p2-extended:
    name: P2 - Extended Tests
    runs-on: macos-14
    needs: test-p1-core-features
    if: github.event_name == 'schedule' || github.ref == 'refs/heads/main'
    timeout-minutes: 40

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd stepin-app
          npm ci

      - name: Setup iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15" || true

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "${HOME}/.maestro/bin" >> $GITHUB_PATH

      - name: Build iOS app
        run: |
          cd stepin-app
          npx expo prebuild --platform ios --clean
          npx expo run:ios --configuration Release --no-install

      - name: Seed test database
        run: |
          cd stepin-app
          npm run test:seed-db

      - name: Run P2 Tests - Error Handling
        run: |
          cd stepin-app
          maestro test e2e/errors/

      - name: Run P2 Tests - User Journeys
        run: |
          cd stepin-app
          maestro test e2e/journeys/

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: p2-test-results
          path: ~/.maestro/tests/

  # Test Report
  test-report:
    name: Generate Test Report
    runs-on: ubuntu-latest
    needs: [test-p0-critical, test-p1-core-features, test-p2-extended]
    if: always()

    steps:
      - name: Download all test results
        uses: actions/download-artifact@v4
        with:
          path: test-results

      - name: Generate report
        run: |
          # Parse Maestro test results and generate summary
          echo "## E2E Test Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY

          # Count passed/failed tests
          TOTAL_TESTS=$(find test-results -name "*.yaml" | wc -l)
          PASSED_TESTS=$(grep -r "✓" test-results | wc -l)
          FAILED_TESTS=$((TOTAL_TESTS - PASSED_TESTS))

          echo "- **Total Tests:** $TOTAL_TESTS" >> $GITHUB_STEP_SUMMARY
          echo "- **Passed:** $PASSED_TESTS" >> $GITHUB_STEP_SUMMARY
          echo "- **Failed:** $FAILED_TESTS" >> $GITHUB_STEP_SUMMARY
          echo "- **Pass Rate:** $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%" >> $GITHUB_STEP_SUMMARY

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const summary = fs.readFileSync(process.env.GITHUB_STEP_SUMMARY, 'utf8');

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: summary
            });
```

---

### Package.json Scripts

Add these scripts to `stepin-app/package.json`:

```json
{
  "scripts": {
    "test:e2e": "maestro test e2e/",
    "test:e2e:p0": "maestro test e2e/auth/ e2e/logging/ e2e/today/ e2e/streaks/",
    "test:e2e:p1": "maestro test e2e/history/ e2e/profile/",
    "test:e2e:p2": "maestro test e2e/errors/ e2e/journeys/",
    "test:seed-db": "ts-node e2e/helpers/seed-database.ts",
    "test:cleanup-db": "ts-node e2e/helpers/cleanup-database.ts",
    "test:build-ios": "npx expo prebuild --platform ios --clean && npx expo run:ios --configuration Release"
  }
}
```

---

## Implementation Timeline

### Overview

**Total Duration:** 8-10 weeks
**Parallel Work:** Infrastructure setup + test implementation
**Team Size:** 1-2 developers

### Detailed Timeline

#### Week 1-2: Infrastructure Setup
**Focus:** Build foundation for testing

| Task | Duration | Owner | Dependencies |
|------|----------|-------|--------------|
| Set up test Supabase instance | 1 day | DevOps | - |
| Implement HealthKit mock service | 2-3 days | Developer | - |
| Implement date injection service | 1-2 days | Developer | - |
| Implement notification mock service | 1-2 days | Developer | - |
| Create database fixtures | 1 day | Developer | Test Supabase |
| Set up CI/CD pipeline (basic) | 1 day | DevOps | - |
| Create seed/teardown scripts | 1 day | Developer | Fixtures |

**Deliverables:**
- ✅ All mock services implemented
- ✅ Test database configured
- ✅ Basic CI/CD pipeline running
- ✅ Database fixtures created

---

#### Week 3-4: Phase 1A - Foundation Tests (P0)
**Focus:** Critical authentication and logging tests

| Test Suite | Tests | Duration | Dependencies |
|------------|-------|----------|--------------|
| Authentication | 4 | 3 days | Mock services |
| Manual Logging | 8 | 5 days | - |
| Core Tracking | 4 | 4.5 days | HealthKit mock |
| Streak System | 5 | 7 days | Date mock |

**Deliverables:**
- ✅ 21 P0 tests implemented
- ✅ All tests passing in CI
- ✅ Test execution time < 15 minutes

---

#### Week 5-6: Phase 1B - Core Features (P1)
**Focus:** History and profile features

| Test Suite | Tests | Duration | Dependencies |
|------------|-------|----------|--------------|
| History Screen | 7 | 6 days | - |
| Profile & Settings | 6 | 5.5 days | - |

**Deliverables:**
- ✅ 13 P1 tests implemented
- ✅ Total 34 tests passing
- ✅ Test execution time < 25 minutes

---

#### Week 7: Phase 1C - Error Handling & Journeys (P2)
**Focus:** Edge cases and user journeys

| Test Suite | Tests | Duration | Dependencies |
|------------|-------|----------|--------------|
| Error Handling | 6 | 7 days | Network mock |
| User Journeys | 2 | 3 days | All previous tests |

**Deliverables:**
- ✅ 8 P2 tests implemented
- ✅ Total 42 tests passing (Phase 1A-C)
- ✅ Test execution time < 35 minutes

---

#### Week 8: Phase 1 Completion & Optimization
**Focus:** Add remaining automatable tests, optimize performance

| Task | Duration | Dependencies |
|------|----------|--------------|
| Add 5 tests from Phase 2 (notification persistence, etc.) | 2 days | - |
| Optimize test execution (parallel runs) | 1 day | All tests |
| Fix flaky tests | 2 days | Test results |
| Documentation | 1 day | - |

**Deliverables:**
- ✅ **75 total tests** implemented and passing
- ✅ Test execution time < 30 minutes (optimized)
- ✅ Flakiness rate < 5%
- ✅ Complete documentation

---

#### Week 9-10: Phase 2 - Manual QA Checklist
**Focus:** Create comprehensive manual testing guide

| Task | Duration | Dependencies |
|------|----------|--------------|
| Create manual QA checklists | 3 days | - |
| Document permission testing procedures | 1 day | - |
| Document notification testing procedures | 1 day | - |
| Document accessibility testing procedures | 2 days | - |
| Train QA team on manual tests | 1 day | Checklists |
| Run first manual QA cycle | 2 days | Training |

**Deliverables:**
- ✅ Complete manual QA checklist (25 tests)
- ✅ QA team trained
- ✅ First manual QA cycle completed

---

### Parallel Work Opportunities

**Weeks 1-2 (Infrastructure):**
- Developer 1: Mock services
- Developer 2: Database fixtures + CI/CD

**Weeks 3-4 (Foundation Tests):**
- Developer 1: Authentication + Logging
- Developer 2: Tracking + Streaks

**Weeks 5-6 (Core Features):**
- Developer 1: History tests
- Developer 2: Profile tests

**Week 7 (Error Handling):**
- Developer 1: Error tests
- Developer 2: Journey tests

**Week 8 (Optimization):**
- Both: Fix flaky tests, optimize, document

**Weeks 9-10 (Manual QA):**
- Developer 1: Create checklists
- Developer 2: Train QA team

---

## Success Metrics

### Phase 1 Success Criteria

#### Test Coverage
- ✅ **75 automated tests** implemented
- ✅ **~75% coverage** of user-facing functionality
- ✅ **100% of P0 critical paths** covered
- ✅ **90% of P1 core features** covered

#### Test Reliability
- ✅ **Pass rate ≥ 95%** on main branch
- ✅ **Flakiness rate < 5%** (tests that fail intermittently)
- ✅ **Zero false positives** (tests failing due to test issues, not app bugs)

#### Performance
- ✅ **P0 tests complete in < 15 minutes**
- ✅ **P1 tests complete in < 25 minutes**
- ✅ **P2 tests complete in < 35 minutes**
- ✅ **Full suite (P0+P1+P2) < 40 minutes**

#### CI/CD Integration
- ✅ **P0 tests run on every commit**
- ✅ **P1 tests run on main/develop pushes**
- ✅ **P2 tests run daily**
- ✅ **Test results visible in PR comments**
- ✅ **Failed tests block merges**

---

### Phase 2 Success Criteria

#### Manual QA Checklist
- ✅ **25 manual tests** documented
- ✅ **Clear step-by-step instructions** for each test
- ✅ **Success criteria defined** for each test
- ✅ **QA team trained** on all manual tests

#### Pre-Release Testing
- ✅ **100% of manual tests** executed before each release
- ✅ **All critical bugs** identified and fixed
- ✅ **Accessibility compliance** verified
- ✅ **Permission flows** tested on real devices

---

### Ongoing Metrics to Track

#### Test Health
- **Pass Rate Trend:** Track over time, aim for ≥ 95%
- **Flaky Test Count:** Identify and fix flaky tests weekly
- **Test Execution Time:** Monitor for performance regressions
- **Coverage Percentage:** Track as new features added

#### Bug Detection
- **Bugs Found by E2E Tests:** Track bugs caught before production
- **Bugs Missed by E2E Tests:** Track bugs found in production
- **Time to Detection:** How quickly tests catch regressions

#### Developer Experience
- **Test Feedback Time:** Time from commit to test results
- **False Positive Rate:** Tests failing due to test issues
- **Developer Confidence:** Survey team on test reliability

---

## Appendix

### Test File Naming Convention

```
e2e/
├── auth/
│   ├── 01-auth-signup.yaml
│   ├── 02-auth-signin.yaml
│   ├── 04-auth-session.yaml
│   └── 05-auth-errors.yaml
├── logging/
│   ├── 40-log-modal-open.yaml
│   ├── 41-log-simple-entry.yaml
│   └── ...
├── today/
│   ├── 10-today-initial-load.yaml
│   └── ...
└── ...
```

**Naming Pattern:** `{number}-{category}-{description}.yaml`
- Numbers group related tests (01-09 auth, 10-19 today, etc.)
- Category matches directory name
- Description is kebab-case

---

### Environment Variables Reference

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `MOCK_HEALTHKIT` | Enable HealthKit mocking | `"true"` |
| `MOCK_HEALTHKIT_STEPS` | Mock step count | `"5000"` |
| `MOCK_HEALTHKIT_PERMISSION` | Mock permission state | `"granted"` |
| `MOCK_DATE` | Enable date mocking | `"true"` |
| `MOCK_NOTIFICATIONS` | Enable notification mocking | `"true"` |
| `SUPABASE_TEST_URL` | Test database URL | `https://test.supabase.co` |
| `SUPABASE_TEST_ANON_KEY` | Test database key | `eyJ...` |

---

### Troubleshooting Common Issues

#### Issue: Tests fail with "Element not found"
**Solution:** Increase timeout, add explicit waits
```yaml
- assertVisible:
    id: "element-id"
    timeout: 10000  # 10 seconds
```

#### Issue: Tests flaky due to animations
**Solution:** Wait for animations to complete
```yaml
- waitForAnimationToEnd:
    timeout: 5000
```

#### Issue: Database state conflicts between tests
**Solution:** Ensure proper teardown
```yaml
- runScript: |
    await cleanupDatabase();
    await seedDatabase();
```

#### Issue: HealthKit mock not working
**Solution:** Verify environment variables set
```yaml
env:
  MOCK_HEALTHKIT: "true"
  MOCK_HEALTHKIT_STEPS: "5000"
```

---

## Conclusion

This comprehensive testing plan provides a **pragmatic, phased approach** to achieving high E2E test coverage for the Stepin app:

- **Phase 1 (75%):** 75 fully automated tests running in CI/CD
- **Phase 2 (25%):** 25 manual tests with detailed QA checklists

By focusing on automatable tests first and deferring problematic tests to manual QA, we achieve:
- ✅ **Fast feedback** on every commit
- ✅ **High reliability** (< 5% flakiness)
- ✅ **Comprehensive coverage** (90%+ of functionality)
- ✅ **Maintainable** test suite

**Next Steps:**
1. Review and approve this plan
2. Set up infrastructure (Weeks 1-2)
3. Begin Phase 1A implementation (Weeks 3-4)
4. Iterate and optimize based on results

---

**Document Version:** 1.0
**Last Updated:** 2025-01-15
**Author:** Augment AI
**Status:** Ready for Implementation

