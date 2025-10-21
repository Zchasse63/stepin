# Phase 3 Integration Testing Plan

**Status**: Not Started (Planning Only)  
**Last Updated**: 2025-10-09  
**Prerequisites**: Phase 2 unit testing complete (212 tests passing)

---

## Overview

Phase 3 focuses on **integration testing** - testing how different parts of the system work together. Unlike unit tests that test individual functions in isolation, integration tests verify that:

1. **Supabase Integration**: Database queries, mutations, and real-time subscriptions work correctly
2. **Store Integration**: Zustand stores correctly fetch, transform, and update state
3. **Native Module Integration**: HealthKit, GPS, notifications work with the app
4. **API Integration**: External services (weather, location) integrate properly

---

## 1. Supabase Integration Tests

### 1.1 Data Fetching Functions

**Test File**: `lib/utils/__tests__/integration/fetchHistoryData.integration.test.ts`

**Functions to Test**:
- `fetchWalksForDate()` - Fetch walks for specific date
- `fetchDailyStatsForDate()` - Fetch daily stats for date range
- `fetchStreak()` - Fetch current streak data
- `fetchProfile()` - Fetch user profile
- `fetchBuddies()` - Fetch user's buddies
- `fetchActivityFeed()` - Fetch activity feed

**Test Cases** (15-20 tests):
- Successful data fetching with valid user ID
- Empty results for new users
- Date range filtering
- Pagination handling
- Error handling (network errors, auth errors)
- Data transformation (database → app types)
- Null/undefined handling

**Setup Requirements**:
- Test Supabase project (separate from production)
- Seed data scripts for consistent test data
- Test user accounts with known data
- Database cleanup between tests

---

### 1.2 Data Mutation Functions

**Test File**: `lib/utils/__tests__/integration/mutations.integration.test.ts`

**Functions to Test**:
- `createWalk()` - Create new walk record
- `updateWalk()` - Update existing walk
- `deleteWalk()` - Delete walk record
- `updateProfile()` - Update user profile
- `syncDailyStats()` - Sync daily statistics
- `updateStreak()` - Update streak data

**Test Cases** (15-20 tests):
- Successful creation with valid data
- Update existing records
- Delete records and verify cascade
- Validation error handling
- Duplicate entry detection
- Optimistic updates and rollback
- Transaction handling

**Setup Requirements**:
- Test database with rollback capability
- Mock data generators
- Transaction isolation
- Cleanup scripts

---

### 1.3 Authentication Flows

**Test File**: `lib/store/__tests__/integration/authStore.integration.test.ts`

**Flows to Test**:
- Sign up → email verification → profile creation
- Sign in → session restoration → data loading
- Sign out → session cleanup → state reset
- Password reset flow
- Session expiration handling

**Test Cases** (10-15 tests):
- Complete sign-up flow with real Supabase client
- Sign-in with valid credentials
- Sign-in with invalid credentials
- Session persistence across app restarts
- Automatic session refresh
- Sign-out cleanup

**Setup Requirements**:
- Test Supabase project with auth enabled
- Test email service (or mock)
- Session storage mocking
- Auth state cleanup

---

## 2. Store Integration Tests

### 2.1 Full Data Loading Flows

**Test File**: `lib/store/__tests__/integration/dataLoading.integration.test.ts`

**Stores to Test**:
- `historyStore` - Load history data → transform → update state
- `profileStore` - Load profile → load stats → update state
- `healthStore` - Request permissions → sync data → update state
- `socialStore` - Load buddies → load feed → update state

**Test Cases** (20-25 tests):
- Complete data loading flow (fetch → transform → setState)
- Loading state management (loading → success → loaded)
- Error handling (fetch error → error state → retry)
- Data transformation accuracy
- State updates trigger re-renders
- Concurrent requests handling
- Cache invalidation

**Setup Requirements**:
- Mock Supabase responses
- Test data fixtures
- State inspection utilities
- Async testing utilities

---

### 2.2 Error Handling and Retry Logic

**Test File**: `lib/store/__tests__/integration/errorHandling.integration.test.ts`

**Scenarios to Test**:
- Network timeout → retry → success
- Auth error → redirect to login
- Permission denied → show permission modal
- Database error → show error message
- Retry with exponential backoff
- Max retry limit reached

**Test Cases** (10-15 tests):
- Automatic retry on network failure
- Exponential backoff timing
- Max retry limit enforcement
- Error state persistence
- User-initiated retry
- Error recovery flows

---

### 2.3 Optimistic Updates and Rollback

**Test File**: `lib/store/__tests__/integration/optimisticUpdates.integration.test.ts`

**Scenarios to Test**:
- Create walk → optimistic update → server confirmation
- Update profile → optimistic update → server error → rollback
- Delete walk → optimistic removal → server error → restore
- Give kudos → optimistic increment → server confirmation

**Test Cases** (10-12 tests):
- Optimistic update applied immediately
- Server confirmation updates state
- Server error triggers rollback
- Rollback restores previous state
- Multiple concurrent optimistic updates
- Conflict resolution

---

## 3. Native Module Integration Tests

### 3.1 HealthKit/Health Connect Integration

**Test File**: `lib/health/__tests__/integration/healthService.integration.test.ts`

**Flows to Test**:
- Permission request → grant → data access
- Permission request → deny → fallback to manual
- Fetch today's steps → display in UI
- Fetch historical data → sync to database
- Real-time step updates

**Test Cases** (15-20 tests):
- Request permissions flow
- Check permission status
- Fetch step data for date range
- Handle permission denial gracefully
- Sync data to Supabase
- Handle HealthKit unavailable (simulator)

**Setup Requirements**:
- Real device testing (HealthKit not available in simulator)
- Mock HealthKit service for CI/CD
- Test data seeding
- Permission state reset

---

### 3.2 GPS/Location Services Integration

**Test File**: `lib/gps/__tests__/integration/gpsTracker.integration.test.ts`

**Flows to Test**:
- Request location permission → grant → start tracking
- Track route during walk → save coordinates
- Calculate distance from GPS data
- Handle GPS signal loss
- Background location tracking

**Test Cases** (12-15 tests):
- Request location permissions
- Start GPS tracking
- Receive location updates
- Calculate distance accurately
- Handle permission denial
- Handle GPS unavailable
- Background tracking

**Setup Requirements**:
- Real device testing (GPS not available in simulator)
- Mock location service for CI/CD
- Simulated GPS routes
- Permission state reset

---

### 3.3 Push Notification Integration

**Test File**: `lib/notifications/__tests__/integration/notificationService.integration.test.ts`

**Flows to Test**:
- Request notification permission → grant → register token
- Schedule local notification → receive notification
- Handle notification tap → navigate to screen
- Update notification badge count

**Test Cases** (10-12 tests):
- Request notification permissions
- Register for push notifications
- Schedule local notification
- Handle notification received
- Handle notification tapped
- Update badge count

**Setup Requirements**:
- Real device testing (notifications limited in simulator)
- Mock notification service for CI/CD
- Notification scheduling utilities
- Permission state reset

---

## 4. API Integration Tests

### 4.1 Weather Service Integration

**Test File**: `lib/weather/__tests__/integration/weatherService.integration.test.ts`

**Flows to Test**:
- Fetch weather for location → display in UI
- Handle API rate limiting
- Handle API errors gracefully
- Cache weather data

**Test Cases** (8-10 tests):
- Fetch weather successfully
- Handle API errors
- Handle rate limiting
- Cache responses
- Retry on failure

**Setup Requirements**:
- Mock weather API responses
- Rate limiting simulation
- Cache testing utilities

---

## 5. Setup Requirements

### 5.1 Test Supabase Project

**Configuration**:
- Separate Supabase project for testing
- Same schema as production
- Test data seeding scripts
- Automatic cleanup between tests

**Environment Variables**:
```bash
SUPABASE_TEST_URL=https://test-project.supabase.co
SUPABASE_TEST_ANON_KEY=test-anon-key
SUPABASE_TEST_SERVICE_KEY=test-service-key
```

**Seed Data Scripts**:
- `scripts/seed-test-db.ts` - Seed test data
- `scripts/cleanup-test-db.ts` - Clean up test data
- `scripts/reset-test-db.ts` - Reset to initial state

---

### 5.2 Mock Data Generators

**Utilities**:
- `tests/fixtures/mockWalks.ts` - Generate mock walk data
- `tests/fixtures/mockProfiles.ts` - Generate mock profiles
- `tests/fixtures/mockDailyStats.ts` - Generate mock daily stats
- `tests/fixtures/mockStreaks.ts` - Generate mock streaks

**Example**:
```typescript
import { generateMockWalk } from '@/tests/fixtures/mockWalks';

const walk = generateMockWalk({
  date: '2025-10-09',
  steps: 10000,
  duration: 60,
});
```

---

### 5.3 CI/CD Integration

**GitHub Actions Workflow**:
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:integration
    env:
      SUPABASE_TEST_URL: ${{ secrets.SUPABASE_TEST_URL }}
      SUPABASE_TEST_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
```

---

## 6. Estimated Effort

**Total Integration Tests**: 120-150 tests  
**Estimated Time**: 2-3 weeks  
**Complexity**: HIGH (requires test infrastructure setup)

**Breakdown**:
- Supabase integration: 40-50 tests (1 week)
- Store integration: 40-50 tests (1 week)
- Native module integration: 30-40 tests (3-5 days)
- API integration: 10-15 tests (2-3 days)

---

## 7. Success Metrics

**Coverage Goals**:
- Integration test coverage: >60% for integration points
- E2E + Unit + Integration: >80% overall coverage
- All critical user flows tested end-to-end

**Quality Goals**:
- 100% pass rate in CI/CD
- <5 minute test execution time
- Reliable tests (no flaky tests)
- Clear failure messages

---

## 8. Next Steps (When Ready)

1. ✅ Set up test Supabase project
2. ✅ Create seed data scripts
3. ✅ Implement mock data generators
4. ✅ Start with Supabase integration tests (highest priority)
5. ✅ Add store integration tests
6. ✅ Add native module integration tests (requires real devices)
7. ✅ Add API integration tests
8. ✅ Configure CI/CD pipeline
9. ✅ Document integration testing best practices

---

## Notes

- **Do NOT start Phase 3 yet** - This is a planning document only
- Integration tests require more setup than unit tests
- Some tests require real devices (HealthKit, GPS, notifications)
- Test Supabase project needed to avoid affecting production data
- CI/CD integration important for automated testing

