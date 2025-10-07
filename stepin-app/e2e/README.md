# Stepin E2E Tests

This directory contains end-to-end tests for the Stepin app using Maestro.

## 📁 Directory Structure

```
e2e/
├── auth/           # Authentication tests (signup, signin, session)
├── today/          # Today screen tests (step display, refresh, goals)
├── logging/        # Manual walk logging tests
├── streaks/        # Streak system tests
├── history/        # History view tests
├── profile/        # Profile and settings tests
├── errors/         # Error handling tests
├── journeys/       # Journey/route tests
├── fixtures/       # Test data fixtures (JSON)
│   ├── users.json
│   ├── walks.json
│   └── streaks.json
└── helpers/        # Helper scripts and utilities
    ├── seed-database.ts
    ├── cleanup-database.ts
    ├── verify-database.ts
    ├── setup.yaml
    └── teardown.yaml
```

## 🚀 Quick Start

### Prerequisites

1. **Maestro CLI installed:**
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. **Test database configured:**
   - Follow steps in `../../SUPABASE_TEST_SETUP.md`
   - Update `.env.test` with your test database credentials

3. **Dependencies installed:**
   ```bash
   npm install
   ```

### Running Tests

```bash
# Verify database setup
npm run test:verify-db

# Seed test database
npm run test:seed-db

# Run all tests
npm run test:e2e

# Run P0 (critical) tests only
npm run test:e2e:p0

# Run specific test suite
npm run test:e2e:auth
npm run test:e2e:logging
npm run test:e2e:streaks

# Run single test file
maestro test e2e/auth/01-auth-signup.yaml

# Cleanup test database
npm run test:cleanup-db
```

## 🧪 Test Priorities

### P0 - Critical (21 tests)
Must pass on every commit. Blocks deployment if failing.
- **Authentication** (4 tests): Signup, signin, session, errors
- **Manual Logging** (8 tests): Log modal, validation, duplicates
- **Core Tracking** (4 tests): Step display, refresh, goal tracking
- **Streak System** (5 tests): Calculation, milestones, broken streaks

### P1 - High (29 tests)
Run on main/develop branches. Important but not blocking.
- **Today Screen** (9 tests): Display, refresh, goals, insights
- **History** (10 tests): List, filtering, stats, calendar
- **Profile & Settings** (10 tests): Profile updates, preferences

### P2 - Medium (25 tests)
Run on schedule (daily). Nice to have.
- **Error Handling** (10 tests): Network errors, validation, edge cases
- **Journeys** (15 tests): Route tracking, GPS, maps

## 🔧 Mock Services

All tests use mock services to enable CI/CD testing:

### HealthKit Mock
- **Location:** `lib/health/MockHealthKitService.ts`
- **Environment Variables:**
  - `MOCK_HEALTHKIT=true` - Enable mocking
  - `MOCK_HEALTHKIT_STEPS=5000` - Set step count
  - `MOCK_HEALTHKIT_PERMISSION=granted` - Set permission state
  - `MOCK_HEALTHKIT_DATA={"2024-01-15":8000}` - Historical data

### Date Service
- **Location:** `lib/utils/dateService.ts`
- **Environment Variables:**
  - `MOCK_DATE=true` - Enable date mocking
  - `MOCK_CURRENT_DATE=2024-01-15` - Set current date

### Notification Mock
- **Location:** `lib/notifications/MockNotificationService.ts`
- **Environment Variables:**
  - `MOCK_NOTIFICATIONS=true` - Enable mocking

## 📊 Test Data

### Fixtures
Test data is defined in JSON files in `fixtures/`:

- **users.json**: Test user accounts with profiles, walks, and streaks
- **walks.json**: Sample walk data for various scenarios
- **streaks.json**: Streak configurations for testing

### Seeding
```bash
# Seed database with all fixtures
npm run test:seed-db

# Reset database (cleanup + seed)
npm run test:reset-db
```

## 🎯 Writing Tests

### Test File Naming
```
{number}-{category}-{description}.yaml
```

Examples:
- `01-auth-signup.yaml`
- `40-log-modal-open.yaml`
- `50-streak-calculation.yaml`

### Test Template
```yaml
appId: com.stepin.app
---
# Test: [Description]
# Priority: P0/P1/P2
# Estimated time: X days

- launchApp:
    clearState: true

- waitForAnimationToEnd:
    timeout: 5000

# Your test steps here

- assertVisible: "Expected Text"
```

### Best Practices

1. **Always clear state** at the start of tests
2. **Wait for animations** to complete before assertions
3. **Use explicit waits** for async operations
4. **Add descriptive comments** for complex flows
5. **Test one thing** per test file
6. **Use fixtures** for consistent test data

## 🔍 Debugging

### View Test Execution
```bash
# Record test execution
maestro test --record e2e/auth/01-auth-signup.yaml

# View in Maestro Studio
maestro studio
```

### Common Issues

**Test fails with "Element not found"**
- Increase timeout
- Add explicit wait
- Check element text/ID

**Database conflicts**
- Run cleanup: `npm run test:cleanup-db`
- Re-seed: `npm run test:seed-db`

**Mock not working**
- Verify environment variables are set
- Check `.env.test` configuration
- Restart app with `clearState: true`

## 📚 Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Full Testing Plan](../../MAESTRO_E2E_TESTING_PLAN.md)
- [Quick Start Guide](../../TESTING_QUICK_START.md)
- [Supabase Setup](../../SUPABASE_TEST_SETUP.md)

## 🎯 Success Metrics

- **Pass Rate:** ≥ 95% on main branch
- **Flakiness:** < 5%
- **Execution Time:** 
  - P0 tests: < 15 minutes
  - Full suite: < 40 minutes
- **Coverage:** 90%+ of user-facing functionality

## 🚨 CI/CD

Tests run automatically in GitHub Actions:

- **P0 tests:** Every commit
- **P1 tests:** Main/develop branches
- **Full suite:** Daily at 2 AM UTC

See `.github/workflows/e2e-tests.yml` for configuration.

