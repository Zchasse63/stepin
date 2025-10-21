# Testing Guide

This document provides an overview of the testing strategy for the Steppin app, including unit tests, integration tests, and end-to-end (E2E) tests.

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [Writing Tests](#writing-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## Testing Strategy

Steppin uses a comprehensive testing approach with three layers:

1. **Unit Tests** - Fast, isolated tests for pure functions and business logic
2. **Integration Tests** - Real database operations testing complete workflows
3. **E2E Tests** - Full user journey testing with Maestro

### Test Pyramid

```
        /\
       /  \      E2E Tests (Maestro)
      /    \     - Full user journeys
     /------\    - Real device/simulator
    /        \   
   /          \  Integration Tests (Jest + Supabase)
  /            \ - Real database operations
 /--------------\- Complete workflows
/                \
|  Unit Tests    | Unit Tests (Jest)
|  (Jest)        | - Pure functions
|________________| - Business logic
                  - Components
```

---

## Test Types

### 1. Unit Tests

**Location**: `lib/**/__tests__/*.test.ts(x)`

**Purpose**: Test individual functions and components in isolation with mocked dependencies.

**Coverage**:
- ✅ Pure utility functions (accessibility, date utils, etc.)
- ✅ Business logic (goal adjustment, streak freeze, etc.)
- ✅ Critical UI components (StepCircle, StatsCard, etc.)

**Total**: 250+ unit tests

**Run**: `npm run test:unit`

### 2. Integration Tests

**Location**: `lib/utils/__integration__/*.integration.test.ts`

**Purpose**: Test complete workflows with real Supabase database operations.

**Coverage**:
- ✅ editWalk + recalculation (11 tests)
- ✅ deleteWalk + recalculation (8 tests)
- ✅ syncDailyStats + updateStreak (12 tests)
- ✅ fetchHistoryData queries (15 tests)

**Total**: 46 integration tests

**Run**: `npm run test:integration`

**Note**: Integration tests run serially (~7.7 minutes) to avoid Supabase rate limits.

### 3. E2E Tests

**Location**: `e2e/*.yaml`

**Purpose**: Test complete user journeys on real devices/simulators using Maestro.

**Coverage**:
- P0: Authentication, logging, tracking, streaks
- P1: Today screen, history, profile
- P2: Settings, notifications, edge cases

**Run**: `npm run test:e2e`

---

## Running Tests

### All Tests

```bash
# Run all tests (unit + integration)
npm run test:all

# Run all tests with coverage
npm run test:all -- --coverage
```

### Unit Tests Only

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- accessibility.test.ts

# Run tests in watch mode
npm run test:unit -- --watch

# Run with coverage
npm run test:unit -- --coverage
```

### Integration Tests Only

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test file
npm run test:integration -- editWalk.integration.test.ts

# Run specific test by name
npm run test:integration -- -t "should edit walk and recalculate"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run P0 critical tests only
npm run test:e2e:p0

# Run P1 high priority tests
npm run test:e2e:p1

# Run specific test flow
maestro test e2e/01-auth-signup.yaml
```

---

## Test Coverage

### Current Coverage

| Test Type | Count | Coverage | Status |
|-----------|-------|----------|--------|
| Unit Tests | 250+ | ~70% overall | ✅ Complete |
| Integration Tests | 46 | Critical paths | ✅ Complete |
| E2E Tests | 15+ flows | User journeys | ✅ Active |

### Coverage Goals

- **Pure Functions**: 95%+ coverage
- **Business Logic**: 85%+ coverage
- **Components**: 70%+ coverage
- **Integration**: Critical data integrity paths
- **E2E**: All major user journeys

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:unit -- --coverage

# Open HTML coverage report
open coverage/lcov-report/index.html
```

---

## Writing Tests

### Unit Tests

See individual test files for examples:
- `lib/utils/__tests__/accessibility.test.ts` - Pure function tests
- `lib/utils/__tests__/goalAdjustment.test.ts` - Business logic tests
- `components/__tests__/StepCircle.test.tsx` - Component tests

### Integration Tests

See `lib/utils/__integration__/README.md` for comprehensive guide.

**Quick Example**:

```typescript
import { supabaseAdmin } from './helpers/testSetup';
import { createTestUser, deleteTestUser } from './helpers/testData';
import { editWalk } from '../editWalk';

describe('editWalk integration tests', () => {
  let testUserId: string;

  beforeEach(async () => {
    testUserId = await createTestUser();
  });

  afterEach(async () => {
    await deleteTestUser(testUserId);
  });

  it('should edit walk and recalculate stats', async () => {
    // Test implementation
  });
});
```

### E2E Tests

See `e2e/README.md` for Maestro test documentation.

---

## CI/CD Integration

### GitHub Actions Workflows

1. **Integration Tests** (`.github/workflows/integration-tests.yml`)
   - Runs on: Push to main/develop, PRs
   - Duration: ~15 minutes
   - Uses: Steppin-Test Supabase instance

2. **E2E Tests** (`.github/workflows/e2e-tests.yml`)
   - P0 tests: Every commit
   - P1 tests: main/develop branches
   - Full suite: Daily schedule + manual trigger

### Required Secrets

Configure these in GitHub repository settings:

- `SUPABASE_TEST_URL` - Steppin-Test Supabase URL
- `SUPABASE_TEST_ANON_KEY` - Steppin-Test anon key
- `SUPABASE_TEST_SERVICE_KEY` - Steppin-Test service role key

**Important**: Always use the TEST instance (hwzyuugggdubeejfpele), never production!

---

## Troubleshooting

### Unit Tests

**Issue**: Tests fail with "Cannot find module"
- **Solution**: Run `npm install` to ensure all dependencies are installed

**Issue**: Mock not working
- **Solution**: Ensure mocks are defined before imports (see `testSetup.ts`)

### Integration Tests

**Issue**: "Request rate limit reached"
- **Solution**: Tests run serially with 10-second delays. This is expected and intentional.

**Issue**: Tests timeout
- **Solution**: Global timeout is 30 seconds. Check Supabase connection.

**Issue**: Timezone issues with date queries
- **Solution**: Use `parseISO(dateString)` instead of `new Date(dateString)`

See `lib/utils/__integration__/README.md` for more troubleshooting tips.

### E2E Tests

**Issue**: Maestro not found
- **Solution**: Install Maestro CLI: `curl -Ls "https://get.maestro.mobile.dev" | bash`

**Issue**: Simulator not booting
- **Solution**: Manually boot simulator: `xcrun simctl boot "iPhone 16 Plus"`

---

## Related Documentation

- [Integration Tests README](lib/utils/__integration__/README.md) - Detailed integration testing guide
- [E2E Tests README](e2e/README.md) - Maestro E2E testing guide
- [Manual Testing Checklist](../database/testing/testing-checklist.md) - Comprehensive manual testing
- [GitHub Actions Workflows](.github/workflows/) - CI/CD configuration

---

**Questions?** Check the specific README files for each test type, or review the troubleshooting sections above.

