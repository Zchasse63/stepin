# Unit Testing Guide

**Last Updated**: 2025-10-10 at 11:49 AM
**Framework**: Jest + React Testing Library
**Status**: ✅ COMPLETE - 270/270 tests passing

> **📊 For current testing status, see [TESTING-STATUS.md](./TESTING-STATUS.md)**

---

## 🎯 Overview

This directory contains unit tests for the Stepin app. Unit tests focus on testing individual functions, components, and modules in isolation, providing fast feedback and high code coverage.

**Current Status**:
- ✅ **270 tests** passing (100% pass rate)
- ✅ **11 test files** created
- ✅ **<1 second** execution time
- ✅ **96%+ average coverage** for tested modules

### Why Unit Tests?

- ✅ **Fast**: Run in milliseconds vs seconds (E2E tests)
- ✅ **Reliable**: No UI flakiness or timing issues
- ✅ **Better Coverage**: Can test edge cases, error states, calculations
- ✅ **Easier to Debug**: Clear failure messages, isolated failures
- ✅ **No Limitations**: Can test any code, not just visible UI

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- authStore.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="signIn"
```

---

## 📁 Test Structure

```
stepin-app/
├── lib/
│   ├── store/
│   │   ├── __tests__/
│   │   │   ├── authStore.test.ts       ✅ 15 tests
│   │   │   ├── historyStore.test.ts    (planned)
│   │   │   ├── profileStore.test.ts    (planned)
│   │   │   └── todayStore.test.ts      (planned)
│   │   ├── authStore.ts
│   │   ├── historyStore.ts
│   │   ├── profileStore.ts
│   │   └── todayStore.ts
│   ├── utils/
│   │   ├── __tests__/
│   │   │   ├── calculations.test.ts    (planned)
│   │   │   ├── formatters.test.ts      (planned)
│   │   │   └── validators.test.ts      (planned)
│   │   ├── calculations.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── ...
├── components/
│   ├── __tests__/
│   │   ├── StepCircle.test.tsx         (planned)
│   │   └── ...
│   └── ...
├── jest.config.js
├── jest.setup.js
└── tests/
    ├── README.md                        (this file)
    └── PHASE-3-INTEGRATION-TESTS.md     (planned)
```

---

## 📝 Test File Naming Conventions

- **Test files**: `*.test.ts` or `*.test.tsx`
- **Location**: `__tests__/` directory next to the code being tested
- **Example**: `lib/store/authStore.ts` → `lib/store/__tests__/authStore.test.ts`

---

## ✅ Current Test Coverage (Phase 2 Complete!)

### Zustand Stores (42 tests, 3/6 stores)

**authStore.ts** - ✅ 15/15 tests passing (95% coverage)
- Initial state verification
- signIn: success, loading state, error handling, error clearing
- signUp: success, display name inclusion, error handling
- signOut: success, error handling
- checkSession: restore session, clear state, error handling
- clearError: error state clearing
- devBypassAuth: mock user/session creation

**historyStore.ts** - ✅ 13/13 tests passing (100% coverage)
- Initial state verification
- setSelectedPeriod: updates period and date range, clears selected date
- setHistoryData: sets data and clears error
- setLoading: toggles loading state
- setError: sets error and stops loading
- setSelectedDate: sets/clears selected date
- clearHistoryData: resets all state

**profileStore.ts** - ✅ 14/14 tests passing (85% coverage)
- Initial state verification
- loadProfile: success, no user, error handling
- loadStats: success, no user
- updateProfile: success, error handling
- updateGoal: updates daily step goal
- setNotificationId: sets/clears notification IDs
- clearProfile: resets all state
- clearError: clears error state

### Utility Functions (170 tests, 6/13 utilities)

**calculateStats.ts** - ✅ 44/44 tests passing (96% coverage)
- calculateSummaryStats: aggregation, empty data, filtering inactive days
- calculateTotalDuration: sum, null handling, empty array
- calculateTotalDistance: sum, null handling, empty array
- calculateAverageStepsPerWalk: average, empty array, rounding
- formatNumber: comma formatting, small numbers
- formatDuration: minutes only, hours+minutes, hours only
- formatDistance: meters, kilometers
- formatDateDisplay: today, yesterday, other dates, custom format
- calculateGoalPercentage: percentage, exceeding goal, zero goal, rounding
- getProgressColor: color thresholds
- groupWalksByDate: grouping, empty array
- calculateCurrentStreak: current streak, broken streak, empty array
- calculateLongestStreak: longest streak, empty array, all days met

**dateUtils.ts** - ✅ 36/36 tests passing (100% coverage)
- getDateRangeForPeriod: week, month, year ranges
- getLastNDays: date range calculation, single day
- formatDateDisplay: default format, string dates, custom format
- formatDateForAPI: ISO date string, time component handling
- isDateToday: today check, yesterday check
- areSameDay: same day, different days, string dates, mixed types
- getDatesInRange: all dates, single date
- getDaysBetween: positive, zero, negative differences
- getAbbreviatedDayName: all days of week
- getDayOfMonth: day extraction, first/last days
- getMonthAbbreviation: all months
- getTimeBasedGreeting: morning, afternoon, evening

**formatDistance.ts** - ✅ 12/12 tests passing (100% coverage)
- formatDistance: miles/kilometers with default/custom decimals, zero, small/large distances
- convertDistance: meters to miles/kilometers, zero, precise conversion
- getDistanceUnit: miles/kilometers labels, default

**generateInsights.ts** - ✅ 24/24 tests passing (96% coverage)
- generateInsights: main function, sorting, top 3 selection
- generatePositiveInsights: days walked, current streak, longest streak, total steps, consistency
- generateNudgeInsights: streak milestone, beat record
- generateMilestoneInsights: walk count, streak milestones, steps milestones, perfect week
- getInsightIconName: icon mapping

**logger.ts** - ✅ 16/16 tests passing (100% coverage)
- logger.error: development mode, production mode, Error object, non-Error object, message-only
- logger.warn: development mode, production mode, with data
- logger.info: development mode, production mode, with data
- logger.debug: development mode, production mode, with data

**errorMessages.ts** - ✅ 38/38 tests passing (100% coverage)
- getErrorMessage: all error codes (13 tests)
- parseError: network, auth, permission, HealthKit, Health Connect, sync, database errors
- getUserFriendlyError: error object parsing
- validation.steps: valid/invalid step counts
- validation.duration: valid/invalid durations
- validation.date: past dates, today, future dates
- validation.isUnusuallyHigh: normal/high step counts
- validation.isUnusuallyLowGoal: normal/low goals
- formatValidationError: error message formatting

### Components (0 tests - Skipped)

**Decision**: Components skipped in Phase 2 to focus on high-value business logic testing.

**Reason**: Components require React Native Testing Library setup and are lower priority than pure functions and state management. Will be addressed in future phases if needed.

---

## 📊 Phase 2 Summary

**Total Tests**: 212/212 passing (100% pass rate)
**Execution Time**: <1 second
**Test Files**: 9 files
**Coverage**: 85-100% for tested modules

**Breakdown**:
- Zustand Stores: 42 tests (3/6 stores)
- Utility Functions: 170 tests (6/13 utilities)
- Components: 0 tests (skipped)

**Skipped** (out of scope for Phase 2):
- Complex stores (activeWalkStore, healthStore, socialStore)
- Supabase integration utilities
- Components (60+ components)
- Native module integrations

---

## 🧪 Writing Tests

### Basic Test Structure

```typescript
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      // Arrange: Set up test data and mocks
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      // Act: Execute the function being tested
      const { signIn } = useAuthStore.getState();
      await signIn('test@example.com', 'password123');

      // Assert: Verify the expected outcome
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const mockData = { id: '123', name: 'Test' };
  
  (supabase.from as jest.Mock).mockResolvedValue({
    data: mockData,
    error: null,
  });

  const result = await fetchData();
  
  expect(result).toEqual(mockData);
});
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  const mockError = { message: 'Something went wrong' };
  
  (supabase.from as jest.Mock).mockResolvedValue({
    data: null,
    error: mockError,
  });

  await expect(fetchData()).rejects.toEqual(mockError);
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react-native';
import StepCircle from '../StepCircle';

it('should display step count correctly', () => {
  render(<StepCircle steps={5000} goal={10000} />);
  
  expect(screen.getByText('5,000')).toBeTruthy();
  expect(screen.getByText('50%')).toBeTruthy();
});
```

---

## 🔧 Configuration

### jest.config.js

- **Preset**: `jest-expo` (React Native + Expo support)
- **Setup**: `jest.setup.js` (mocks and global config)
- **Transform Ignore**: Configured for React Native modules
- **Coverage Threshold**: 70% statements, 60% branches, 70% functions, 70% lines

### jest.setup.js

Mocks for:
- expo-router
- expo-secure-store
- @supabase/supabase-js
- expo-constants
- @react-native-async-storage/async-storage
- react-native-reanimated
- react-native-gesture-handler
- @rnmapbox/maps
- @kingstinct/react-native-healthkit
- expo-device

---

## 📊 Coverage Goals

### Current Coverage
- **Stores**: 25% (1/4 stores tested)
- **Utilities**: 0% (0/3 utility modules tested)
- **Components**: 0% (0/3 components tested)
- **Overall**: ~10%

### Target Coverage
- **Stores**: 100% (4/4 stores tested, >80% line coverage)
- **Utilities**: 100% (3/3 utility modules tested, >90% line coverage)
- **Components**: 60% (key components tested, >70% line coverage)
- **Overall**: >70%

---

## 🎯 Testing Best Practices

### DO ✅

1. **Test behavior, not implementation**
   - Focus on what the code does, not how it does it
   - Test public APIs, not internal details

2. **Use descriptive test names**
   - `it('should successfully sign in with valid credentials')`
   - Not: `it('test sign in')`

3. **Follow AAA pattern**
   - **Arrange**: Set up test data and mocks
   - **Act**: Execute the function being tested
   - **Assert**: Verify the expected outcome

4. **Test edge cases**
   - Empty inputs
   - Null/undefined values
   - Error conditions
   - Boundary values

5. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` to reset state
   - Clear mocks between tests

6. **Mock external dependencies**
   - Supabase client
   - API calls
   - File system
   - Date/time

### DON'T ❌

1. **Don't test implementation details**
   - Avoid testing internal state
   - Don't test private methods

2. **Don't write brittle tests**
   - Avoid testing exact error messages
   - Don't rely on specific timing

3. **Don't skip error cases**
   - Always test error handling
   - Test what happens when things go wrong

4. **Don't make tests dependent**
   - Tests should not rely on execution order
   - Each test should set up its own state

---

## 🐛 Debugging Tests

### View Test Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- --testNamePattern="should successfully sign in"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)
- [Zustand Testing Guide](https://docs.pmnd.rs/zustand/guides/testing)

---

## 🚀 Next Steps

### Phase 2 - COMPLETE ✅
1. ✅ Complete authStore tests (15/15 done)
2. ✅ Complete historyStore tests (13/13 done)
3. ✅ Complete profileStore tests (14/14 done)
4. ✅ Complete calculateStats tests (44/44 done)
5. ✅ Complete dateUtils tests (36/36 done)
6. ✅ Complete formatDistance tests (12/12 done)
7. ✅ Complete generateInsights tests (24/24 done)
8. ✅ Complete logger tests (16/16 done)
9. ✅ Complete errorMessages tests (38/38 done)
10. ✅ Achieve >85% coverage for tested modules

### Phase 3 - Integration Testing (Planned)
See `stepin-app/tests/PHASE-3-INTEGRATION-TESTS.md` for detailed plan:
- Supabase integration tests (40-50 tests)
- Store integration tests (40-50 tests)
- Native module integration tests (30-40 tests)
- API integration tests (10-15 tests)

### Future Enhancements (Optional)
- Component tests for high-priority UI components
- Remaining store tests (activeWalkStore, healthStore, socialStore)
- Remaining utility tests (Supabase integration utilities)

---

**For E2E testing**, see `stepin-app/e2e/COMPLETION-CHECKLIST.md`
**For integration testing plans**, see `stepin-app/tests/PHASE-3-INTEGRATION-TESTS.md`
**For Phase 2 task breakdown**, see `stepin-app/tests/PHASE-2-TASK-LIST.md`

