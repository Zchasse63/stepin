# Phase 2 Unit Testing - Comprehensive Task List

**Last Updated**: 2025-10-09
**Status**: In Progress (212/~300 tests complete, 71% done)

---

## 🚫 Auth E2E Test Blocker (DOCUMENTED)

**Status**: ⛔ BLOCKED - Lower Priority
**Root Cause**: expo-secure-store session persistence (Maestro limitation)
**Impact**: 12/12 auth E2E tests failing

### Problem Summary
- Maestro's `clearState: true` clears app data but NOT expo-secure-store
- Supabase sessions persist between test runs
- Fast Refresh fix implemented but doesn't solve core issue
- Sessions are restored on app launch: `Session: ✅ Found (user: c93818c0-9a07-4faa-bda1-3377d54bd6df)`

### Mitigation
- ✅ Auth logic fully covered by unit tests (15/15 passing, 95% coverage)
- ✅ Manual testing confirms auth flows work correctly
- ⏸️ E2E auth tests deprioritized until Maestro solution found

### Potential Solutions (Future Work)
1. Create helper flow to manually clear sessions before each test
2. Reset test database between runs to invalidate sessions
3. Use different test accounts for each test run
4. Wait for Maestro to support expo-secure-store clearing

---

## ✅ Completed Tests (212 tests)

### Zustand Stores (42 tests, 3/6 stores)
- ✅ **authStore.test.ts** - 15 tests (95% coverage)
- ✅ **historyStore.test.ts** - 13 tests (100% coverage)
- ✅ **profileStore.test.ts** - 14 tests (85% coverage)

### Utility Functions (170 tests, 6/13 utilities)
- ✅ **calculateStats.test.ts** - 44 tests (96% coverage)
- ✅ **dateUtils.test.ts** - 36 tests (100% coverage)
- ✅ **formatDistance.test.ts** - 12 tests (100% coverage)
- ✅ **generateInsights.test.ts** - 24 tests (96% coverage)
- ✅ **logger.test.ts** - 16 tests (100% coverage)
- ✅ **errorMessages.test.ts** - 38 tests (100% coverage)

---

## 📋 Remaining Store Tests (3 stores, ~45 tests)

### 1. activeWalkStore.ts (COMPLEX - Skip for now)
**Estimated Tests**: 20-25 tests  
**Priority**: LOW (complex dependencies: GPS, HealthKit, Live Activities)  
**Reason to Skip**: Requires extensive mocking of native modules

**Functions to Test** (if implemented):
- `startWalk()` - Start walk with goal
- `pauseWalk()` - Pause active walk
- `resumeWalk()` - Resume paused walk
- `endWalk()` - End walk and save
- `updateSteps()` - Update step count
- `reset()` - Reset state
- Heart rate tracking functions
- GPS tracking functions

**Decision**: ⏭️ **SKIP** - Too complex for current phase

---

### 2. healthStore.ts (MEDIUM - Skip for now)
**Estimated Tests**: 15-18 tests  
**Priority**: MEDIUM (depends on native HealthKit/Health Connect)  
**Reason to Skip**: Requires mocking native health services

**Functions to Test** (if implemented):
- `requestPermissions()` - Request health permissions
- `checkPermissions()` - Check permission status
- `syncTodaySteps()` - Sync today's steps
- `syncHistoricalData()` - Sync historical data
- `getStepsForDate()` - Get steps for specific date
- `setTodaySteps()` - Set today's steps
- `clearError()` - Clear error state
- `reset()` - Reset state

**Decision**: ⏭️ **SKIP** - Requires native module mocking

---

### 3. socialStore.ts (COMPLEX - Skip for now)
**Estimated Tests**: 20-25 tests  
**Priority**: MEDIUM (social features, Supabase integration)  
**Reason to Skip**: Complex Supabase queries, social features

**Functions to Test** (if implemented):
- `loadBuddies()` - Load user's buddies
- `sendBuddyRequest()` - Send buddy request
- `acceptBuddyRequest()` - Accept request
- `declineBuddyRequest()` - Decline request
- `removeBuddy()` - Remove buddy
- `loadActivityFeed()` - Load activity feed
- `postActivity()` - Post activity
- `deleteActivity()` - Delete activity
- `giveKudos()` - Give kudos
- `removeKudos()` - Remove kudos
- `clearError()` - Clear error
- `reset()` - Reset state

**Decision**: ⏭️ **SKIP** - Complex social features

---

## 📋 Remaining Utility Tests (10 utilities, ~80 tests)

### Priority 1: Pure Functions (Easy to Test)

#### 1. generateInsights.ts ✅ HIGH PRIORITY
**Estimated Tests**: 15-20 tests  
**Complexity**: MEDIUM (pure functions, business logic)  
**Functions to Test**:
- `generateInsights()` - Main function (3 tests)
- `generatePositiveInsights()` - Positive insights (5 tests)
- `generateNudgeInsights()` - Nudge insights (4 tests)
- `generateMilestoneInsights()` - Milestone insights (6 tests)
- `getInsightIconName()` - Icon mapping (2 tests)

**Test Cases**:
- Empty data handling
- Single insight generation
- Multiple insights sorting by priority
- Top 3 insights selection
- Streak milestones (7, 14, 21, 30 days)
- Walk count milestones (10, 25, 50, 100)
- Perfect week detection
- Consistency percentage calculation

---

#### 2. logger.ts ✅ HIGH PRIORITY
**Estimated Tests**: 8-10 tests  
**Complexity**: LOW (simple logging functions)  
**Functions to Test**:
- `logger.error()` - Error logging (3 tests)
- `logger.warn()` - Warning logging (2 tests)
- `logger.info()` - Info logging (2 tests)
- `logger.debug()` - Debug logging (2 tests)

**Test Cases**:
- Development mode logging (console output)
- Production mode logging (Sentry integration)
- Error object handling
- Message-only logging
- Data parameter handling

---

#### 3. errorMessages.ts ✅ HIGH PRIORITY
**Estimated Tests**: 12-15 tests  
**Complexity**: LOW (pure functions, mapping)  
**Functions to Test**:
- `getErrorMessage()` - Get error message by code (10 tests)
- `formatErrorForDisplay()` - Format error for UI (3 tests)
- `getErrorAction()` - Get action button text (2 tests)

**Test Cases**:
- All error codes (NETWORK_ERROR, AUTH_ERROR, etc.)
- Unknown error code handling
- Error message structure validation
- Action button text retrieval

---

### Priority 2: Data Processing Functions

#### 4. dateService.ts (MEDIUM - Skip if complex)
**Estimated Tests**: 10-12 tests  
**Complexity**: MEDIUM (date manipulation)  
**Decision**: ⏭️ **SKIP if complex** - Already have dateUtils tested

---

#### 5. routeAnalytics.ts (MEDIUM - Skip if complex)
**Estimated Tests**: 12-15 tests  
**Complexity**: MEDIUM (GPS calculations)  
**Decision**: ⏭️ **SKIP** - Requires GPS data mocking

---

### Priority 3: Supabase Integration Functions (Skip)

#### 6. deleteWalk.ts
**Decision**: ⏭️ **SKIP** - Supabase integration

#### 7. fetchHistoryData.ts
**Decision**: ⏭️ **SKIP** - Supabase integration

#### 8. syncDailyStats.ts
**Decision**: ⏭️ **SKIP** - Supabase integration

#### 9. updateStreak.ts
**Decision**: ⏭️ **SKIP** - Supabase integration

#### 10. profileUtils.ts
**Decision**: ⏭️ **SKIP** - Supabase integration

---

## 📋 Component Tests (Priority Components Only)

### Decision: ⏭️ **SKIP ALL COMPONENTS**
**Reason**: Components require React Native Testing Library setup and are lower priority than business logic

**High-Priority Components** (for future reference):
1. **StepCircle.tsx** - Step count display (5 tests)
2. **SummaryStatsGrid.tsx** - Stats grid (5 tests)
3. **TimePeriodSelector.tsx** - Period selector (5 tests)
4. **CalendarHeatMap.tsx** - Calendar visualization (8 tests)
5. **InsightsCard.tsx** - Insights display (5 tests)

**Total Estimated**: 28 tests (SKIPPED)

---

## 📊 Revised Estimates

### Tests to Implement (Focus on High-Value Utilities)

**Priority 1 - Pure Functions** (35-45 tests):
- ✅ generateInsights.ts - 15-20 tests
- ✅ logger.ts - 8-10 tests
- ✅ errorMessages.ts - 12-15 tests

**Total New Tests**: 35-45 tests  
**Total After Completion**: 169-179 tests  
**Estimated Time**: 2-3 hours  
**Target Coverage**: >80% for tested modules

---

## 🎯 Immediate Action Plan

### Phase 2A: High-Value Utilities (CURRENT)
1. ✅ Create generateInsights.test.ts (15-20 tests)
2. ✅ Create logger.test.ts (8-10 tests)
3. ✅ Create errorMessages.test.ts (12-15 tests)
4. ✅ Run all tests and verify 100% pass rate
5. ✅ Generate coverage report

### Phase 2B: Documentation & Wrap-Up
1. ✅ Update tests/README.md with final stats
2. ✅ Create Phase 3 integration testing plan
3. ✅ Provide final progress summary

---

## 📈 Success Metrics

**Current Status**:
- Tests Passing: 134/134 (100%)
- Stores Tested: 3/6 (50%)
- Utilities Tested: 3/13 (23%)
- Components Tested: 0/60+ (0%)

**Target After Phase 2A**:
- Tests Passing: 169-179/169-179 (100%)
- Stores Tested: 3/6 (50%) - Skipping complex stores
- Utilities Tested: 6/13 (46%) - Focus on pure functions
- Components Tested: 0/60+ (0%) - Skipping for now

**Coverage Goals**:
- Tested Modules: >80% coverage ✅
- Overall Project: ~10-15% (low due to untested components/screens)

---

## 🚫 Explicitly Skipped (Out of Scope)

**Stores** (3 stores):
- activeWalkStore.ts - Too complex (GPS, HealthKit, Live Activities)
- healthStore.ts - Requires native module mocking
- socialStore.ts - Complex social features

**Utilities** (7 utilities):
- dateService.ts - Redundant with dateUtils
- routeAnalytics.ts - Requires GPS mocking
- deleteWalk.ts - Supabase integration
- fetchHistoryData.ts - Supabase integration
- syncDailyStats.ts - Supabase integration
- updateStreak.ts - Supabase integration
- profileUtils.ts - Supabase integration

**Components** (60+ components):
- All components - Lower priority than business logic

---

## 📝 Notes

- **Focus**: Pure functions and business logic (highest ROI)
- **Skip**: Complex integrations (GPS, HealthKit, Supabase, native modules)
- **Rationale**: 80/20 rule - get 80% of value from 20% of effort
- **Next Phase**: Integration tests for Supabase functions (Phase 3)

