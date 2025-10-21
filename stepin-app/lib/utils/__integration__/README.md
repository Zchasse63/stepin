# Integration Tests

This directory contains integration tests for Supabase utilities that require real database operations.

## Overview

Integration tests complement our unit tests by testing complete workflows with real Supabase database operations. Unlike unit tests that mock Supabase calls, integration tests:

- Use the **Steppin-Test** Supabase project (hwzyuugggdubeejfpele)
- Create real test users and data
- Test full end-to-end flows (e.g., edit walk → recalculate stats → update streak)
- Verify data integrity and consistency
- Clean up test data after each test

## Directory Structure

```
__integration__/
├── README.md                            # This file
├── helpers/
│   ├── testSetup.ts                     # Global setup, Supabase clients, utilities
│   └── testData.ts                      # Test data generators and cleanup
├── editWalk.integration.test.ts         # Edit walk + recalculation tests (11 tests)
├── deleteWalk.integration.test.ts       # Delete walk + recalculation tests (8 tests)
├── syncStats.integration.test.ts        # Stats sync + streak update tests (12 tests)
└── fetchHistoryData.integration.test.ts # Data fetching tests (15 tests)
```

**Total: 46 integration tests** covering critical data integrity operations.

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test file
npm run test:integration -- editWalk.integration.test.ts

# Run all tests (unit + integration)
npm run test:all

# Run only unit tests
npm run test:unit
```

## Environment Setup

Integration tests use the `.env.test` file which points to the **Steppin-Test** Supabase project:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://hwzyuugggdubeejfpele.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-key>  # For admin operations
```

**Important:** Ensure `mailer_autoconfirm: true` is enabled in the Steppin-Test Supabase auth configuration to allow test user creation without email verification.

## Performance Considerations

Integration tests run **serially** (not in parallel) to avoid Supabase rate limiting:

- **Test Duration**: ~460 seconds (~7.7 minutes) for all 46 tests
- **Rate Limiting**: 10-second delay between user creations to avoid auth rate limits
- **Test Timeout**: 30 seconds per test (configured globally in `testSetup.ts`)
- **Serial Execution**: Tests run with `--runInBand` flag and `maxWorkers: 1` in Jest config

This is intentional to ensure reliable test execution without hitting Supabase API rate limits.

## Writing Integration Tests

### Basic Structure

```typescript
import { supabaseTest, generateTestEmail } from './helpers/testSetup';
import { createTestUser, createTestWalk, deleteTestUser } from './helpers/testData';
import { editWalk } from '../editWalk';

describe('editWalk integration tests', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create test user
    testUserId = await createTestUser();
  });

  afterEach(async () => {
    // Clean up test user and all data
    await deleteTestUser(testUserId);
  });

  it('should edit walk and recalculate daily stats', async () => {
    // Arrange: Create test data
    const walk = await createTestWalk(testUserId, { steps: 5000 });

    // Act: Edit the walk
    const result = await editWalk({
      walkId: walk.id,
      userId: testUserId,
      updates: { steps: 6000 },
    });

    // Assert: Verify results
    expect(result.success).toBe(true);

    // Verify daily stats were recalculated
    const { data: stats } = await supabaseTest
      .from('daily_stats')
      .select('*')
      .eq('user_id', testUserId)
      .eq('date', walk.date)
      .single();

    expect(stats?.total_steps).toBe(6000);
  });
});
```

### Test Helpers

#### Creating Test Data

```typescript
// Create test user
const userId = await createTestUser();
const userId = await createTestUser('custom@email.com', 'password123');

// Create test profile
const profile = await createTestProfile(userId, {
  daily_step_goal: 8000,
});

// Create test walk
const walk = await createTestWalk(userId, {
  steps: 5000,
  date: '2025-10-09',
});

// Create multiple walks
const walks = await createTestWalks(userId, 5); // 5 walks on consecutive days

// Create daily stats
const stats = await createTestDailyStats(userId, {
  total_steps: 7000,
  goal_met: true,
});

// Create streak
const streak = await createTestStreak(userId, {
  current_streak: 5,
  longest_streak: 10,
});
```

#### Cleanup

```typescript
// Delete test user and ALL associated data
await deleteTestUser(userId);

// Clean up data but keep user
await cleanupTestData(userId);

// Sign out
await signOutTestUser();
```

#### Utilities

```typescript
// Generate unique identifiers
const id = generateTestId('walk');
const email = generateTestEmail();

// Date helpers
const yesterday = daysAgo(1);
const tomorrow = daysFromNow(1);
const dateStr = getDateString(new Date()); // 'YYYY-MM-DD'
const isoStr = formatDateForSupabase(new Date()); // ISO 8601

// Wait for async operations
await wait(1000); // Wait 1 second
```

## Best Practices

1. **Always clean up**: Use `afterEach` to delete test users and data
2. **Unique identifiers**: Use `generateTestEmail()` and `generateTestId()` to avoid conflicts
3. **Test isolation**: Each test should be independent and not rely on other tests
4. **Real database**: Tests use real Supabase operations, so they're slower than unit tests
5. **Timeout**: Integration tests have a 30-second timeout (configured globally in `testSetup.ts`)
6. **Error handling**: Always check for errors from Supabase operations
7. **Assertions**: Verify both the function result AND the database state
8. **Admin client**: Use `supabaseAdmin` for test data creation to bypass RLS policies
9. **Date handling**: Use `parseISO()` for date strings to avoid timezone issues (e.g., `parseISO('2025-10-15')` instead of `new Date('2025-10-15')`)
10. **Optional client parameter**: Pass `supabaseAdmin` to utility functions that accept optional `supabase` parameter for testing

## Test Coverage

**Completed: 46/46 integration tests (100%)** ✅

- **Priority 1 (Critical)**: editWalk (11), deleteWalk (8), syncDailyStats + updateStreak (12) - **31 tests**
- **Priority 2 (User Data)**: profileUtils - **Cancelled** (requires native modules, better suited for E2E tests)
- **Priority 3 (Data Fetching)**: fetchHistoryData (15) - **15 tests**

All tests passing with real Supabase database operations.

## Troubleshooting

### Tests timing out
- Global timeout is 30 seconds (configured in `testSetup.ts`)
- Check Supabase connection and network
- Verify rate limiting delays are sufficient (currently 10 seconds between user creations)

### Rate limit errors ("Request rate limit reached")
- Tests run serially with 10-second delays between user creations
- If still seeing rate limits, increase `MIN_USER_CREATION_INTERVAL_MS` in `testData.ts`
- Ensure `--runInBand` flag is set in `test:integration` npm script
- Verify `maxWorkers: 1` is set in Jest integration project config

### Database errors
- Verify `.env.test` has correct credentials
- Check Steppin-Test project is accessible
- Ensure database schema is up to date
- Verify `mailer_autoconfirm: true` is enabled in Supabase auth config

### Cleanup failures
- Check that `SUPABASE_SERVICE_KEY` is set in `.env.test`
- Verify admin client has permissions to delete users
- Use `supabaseAdmin` for test data creation to bypass RLS

### Tests interfering with each other
- Ensure each test creates unique users with `generateTestEmail()`
- Use `beforeEach`/`afterEach` for proper setup/teardown
- Don't share test data between tests

### Timezone issues with date queries
- Use `parseISO(dateString)` instead of `new Date(dateString)` for date strings
- `new Date('2025-10-15')` creates UTC midnight, which may be previous day in local timezone
- `parseISO('2025-10-15')` creates local midnight, which matches database date strings

## CI/CD Integration

Integration tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  env:
    EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
  run: npm run test:integration
```

## Related Documentation

- [Unit Tests](../__tests__/README.md) - Mocked unit tests
- [E2E Tests](../../../e2e/README.md) - Maestro end-to-end tests
- [Supabase Documentation](https://supabase.com/docs)

