# Authentication E2E Tests - TODO & Blockers

## Status: BLOCKED ⛔

**Last Updated**: 2025-10-09

---

## Executive Summary

Authentication E2E tests are currently blocked due to Supabase session persistence in expo-secure-store that survives Maestro's `launchApp: clearState: true`. Manual testing works correctly, but automated tests fail due to Fast Refresh interference causing session restoration.

**Impact**: Cannot reliably test sign-in, sign-out, or session persistence flows in automated E2E tests.

---

## Failed Tests

### 1. `02-auth-signin.yaml` - Sign-in with valid credentials
- **Status**: ❌ FAILED
- **Failure Point**: Cannot get app to show sign-in screen after ensuring signed-out state
- **Error**: "Welcome Back" is not visible after sign-out
- **Duration**: Test times out after 2+ minutes

### 2. `04-auth-session.yaml` - Session persistence
- **Status**: ⏸️ NOT RUN (blocked by sign-in test failure)
- **Blocker**: Requires reliable sign-in/sign-out flow

### 3. `05-auth-errors.yaml` - Error message display
- **Status**: ⏸️ NOT RUN (blocked by sign-in test failure)
- **Blocker**: Requires reliable sign-in flow

### 4. `01-auth-signup-real.yaml` - Real sign-up flow
- **Status**: ⏸️ NOT RUN (blocked by sign-in test failure)
- **Blocker**: Requires reliable sign-in/sign-out flow

### 5. `06-auth-signout.yaml` - Sign-out UI flow
- **Status**: ⏸️ NOT RUN (blocked by sign-in test failure)
- **Blocker**: Requires reliable sign-in flow to test sign-out

---

## Root Cause Analysis

### Primary Issue: Session Persistence in expo-secure-store

**Problem**: Supabase stores authentication sessions in expo-secure-store, which is NOT cleared by Maestro's `launchApp: clearState: true`.

**Technical Details**:
1. Supabase client uses custom storage adapter (`ExpoSecureStoreAdapter`) in `lib/supabase/client.ts`
2. Sessions are stored in expo-secure-store with Supabase's internal key format
3. Maestro's `clearState: true` clears app preferences and documents, but NOT secure keychain storage
4. On app launch, `_layout.tsx` calls `checkSession()` which reads from expo-secure-store
5. Session is restored even after `signOut()` was called in previous test run

### Secondary Issue: Fast Refresh Interference

**Problem**: Metro's Fast Refresh causes excessive app reloads during E2E tests, each reload restoring the session.

**Evidence from Logs**:
- Single test run (5m 40s) triggered **21 app reloads**
- Each reload shows: `iOS Bundled 141ms index.js (1 module)`
- Each reload calls `checkSession()` which finds and restores the session
- Logs show: `🔍 [AuthStore] Checking for existing session...` → `📦 [AuthStore] Session check result: Session: ✅ Found`

**Example Log Sequence**:
```
LOG  ✅ [AuthStore] Sign-out completed successfully
LOG  🔄 [RootLayout] Navigation effect triggered
LOG     user: ❌ None
LOG  ➡️  [RootLayout] Redirecting to sign-in (no user, not in auth)
iOS Bundled 141ms index.js (1 module)  // <-- App reloads
LOG  🔍 [AuthStore] Checking for existing session...
LOG  📦 [AuthStore] Session check result: Session: ✅ Found (user: c93818c0-9a07-4faa-bda1-3377d54bd6df)
LOG  🔄 [RootLayout] Navigation effect triggered
LOG     user: ✅ c93818c0-9a07-4faa-bda1-3377d54bd6df  // <-- Session restored!
```

### Contrast: Manual Testing Works Correctly

**Manual Test Procedure** (confirmed working):
1. Open app (authenticated)
2. Navigate to Profile
3. Scroll down and tap "Sign Out" button
4. Confirm sign-out in alert dialog
5. **Close app completely** (go to home screen)
6. **Reopen app from scratch**
7. ✅ Result: App shows sign-in screen with "Welcome Back" visible

**Why Manual Works**:
- Closing the app completely stops Metro/Fast Refresh
- Reopening the app is a true cold start
- `signOut()` successfully cleared the session from expo-secure-store
- No Fast Refresh to restore the session

**Why Automated Fails**:
- Maestro keeps the app running (doesn't close it completely)
- Fast Refresh triggers multiple reloads during test execution
- Each reload calls `checkSession()` which finds the session in expo-secure-store
- Session is restored before test can verify sign-out worked

---

## Attempted Solutions (All Failed)

### 1. Using `launchApp: clearState: true`
- **Approach**: Launch app with `clearState: true` to clear all app data
- **Result**: ❌ FAILED - Does not clear expo-secure-store
- **Evidence**: App still loads with authenticated session after `clearState: true`

### 2. Manual expo-secure-store Deletion
- **Approach**: Created Reset Auth button that calls `SecureStore.deleteItemAsync('session')`
- **Result**: ❌ FAILED - Session restored by Fast Refresh
- **Evidence**: Logs show session cleared, then immediately restored on next reload
- **Code**: `stepin-app/app/(auth)/sign-in.tsx` - `handleResetAuth()` function

### 3. Using Supabase's signOut()
- **Approach**: Call `supabase.auth.signOut()` to properly clear session
- **Result**: ❌ FAILED - Session restored by Fast Refresh
- **Evidence**: `signOut()` completes successfully, but `checkSession()` finds session again after reload
- **Code**: `stepin-app/lib/store/authStore.ts` - `signOut()` function

### 4. Restarting App After Sign-Out
- **Approach**: Use `stopApp` then `launchApp: clearState: true` after sign-out
- **Result**: ❌ FAILED - `clearState: true` still doesn't clear expo-secure-store
- **Test File**: `e2e/auth/archive/02-auth-signin-final.yaml`

### 5. Adaptive Test Approach
- **Approach**: Test handles both authenticated and unauthenticated start states
- **Result**: ❌ FAILED - Fast Refresh restores session during test execution
- **Test File**: `e2e/auth/archive/02-auth-signin-v4.yaml`

### 6. Extended Wait Times
- **Approach**: Increased timeouts to 15-30 seconds to wait for sign-in screen
- **Result**: ❌ FAILED - "Welcome Back" never appears because session is restored
- **Evidence**: Tests timeout waiting for sign-in screen that never appears

---

## Recommended Approaches for Future Resolution

### Option A: Disable Fast Refresh During E2E Tests (RECOMMENDED)
**Pros**:
- Addresses root cause of session restoration
- Allows tests to run without interference
- No code changes required

**Cons**:
- Requires Metro configuration changes
- May slow down test execution
- Need to research how to disable Fast Refresh programmatically

**Implementation**:
1. Research Metro configuration options for disabling Fast Refresh
2. Create separate Metro config for E2E tests
3. Update test scripts to use E2E-specific Metro config
4. Re-run authentication tests

### Option B: Manual expo-secure-store Clearing via Script
**Pros**:
- Directly addresses the storage persistence issue
- Can be integrated into test setup/teardown
- Works with existing test structure

**Cons**:
- Platform-specific (different commands for iOS/Android)
- Requires shell access to simulator/emulator
- May be fragile across different environments

**Implementation**:
1. Create shell script to clear iOS Keychain for app bundle ID
2. Create shell script to clear Android SharedPreferences
3. Add `beforeAll` step in Maestro tests to run cleanup script
4. Re-run authentication tests

**Example iOS Command**:
```bash
xcrun simctl privacy booted reset all com.stepin.app
```

### Option C: Alternative Session Storage for E2E Tests
**Pros**:
- Complete control over session storage in tests
- Can easily clear storage between tests
- Doesn't affect production behavior

**Cons**:
- Requires code changes
- Need to maintain separate storage logic
- May not test real production behavior

**Implementation**:
1. Create environment variable `E2E_TEST_MODE`
2. Modify Supabase client to use AsyncStorage instead of expo-secure-store when in E2E mode
3. AsyncStorage IS cleared by `launchApp: clearState: true`
4. Update test scripts to set E2E_TEST_MODE
5. Re-run authentication tests

### Option D: Accept Limitation & Test Differently
**Pros**:
- No code or infrastructure changes needed
- Can focus on other test scenarios
- Manual testing still validates auth flows

**Cons**:
- Reduced test coverage
- Auth flows not validated in CI/CD
- Regression risk for auth features

**Implementation**:
1. Document that auth E2E tests require manual execution
2. Create manual test checklist for auth flows
3. Focus automated E2E tests on non-auth features
4. Use Dev Bypass for tests that need authenticated state

---

## Partially Working Code to Preserve

### 1. Reset Auth Button (Dev-Only)
**Location**: `stepin-app/app/(auth)/sign-in.tsx`
**Function**: `handleResetAuth()`
**Status**: Works for manual testing, fails in automated tests due to Fast Refresh
**Code**:
```typescript
const handleResetAuth = async () => {
  if (__DEV__) {
    try {
      console.log('🔄 [Sign-In] Resetting auth state...');
      const { signOut } = useAuthStore.getState();
      await signOut();
      console.log('✅ [Sign-In] Auth state reset complete');
    } catch (error: any) {
      console.error('❌ [Sign-In] Failed to reset auth:', error);
    }
  }
};
```

**UI**:
```tsx
<TouchableOpacity
  style={[styles.devButton, { backgroundColor: colors.status.error, marginTop: 8 }]}
  onPress={handleResetAuth}
  testID="reset-auth-button"
  accessibilityLabel="Reset Auth State"
>
  <Text style={styles.devButtonText}>🔄 Reset Auth State</Text>
</TouchableOpacity>
```

### 2. Sign-Out Button testID
**Location**: `stepin-app/app/(tabs)/profile.tsx`
**Addition**: Added `testID="sign-out-button"` for Maestro targeting
**Status**: Works correctly for manual and automated sign-out
**Code**:
```tsx
<TouchableOpacity
  style={styles.signOutButton}
  onPress={handleSignOut}
  activeOpacity={0.7}
  testID="sign-out-button"
  accessibilityLabel="Sign Out"
>
  <Text style={styles.signOutButtonText}>Sign Out</Text>
</TouchableOpacity>
```

### 3. Enhanced Logging in Auth Store
**Location**: `stepin-app/lib/store/authStore.ts`
**Addition**: Comprehensive console logging for debugging
**Status**: Very helpful for understanding auth flow in tests
**Functions**: `signIn()`, `signOut()`, `checkSession()`

### 4. ensure-signed-out Helper
**Location**: `stepin-app/e2e/helpers/ensure-signed-out.yaml`
**Status**: Works for UI-based sign-out, but session restored by Fast Refresh
**Features**:
- Uses Reset Auth button if available
- Falls back to UI-based sign-out (Profile → scroll → Sign Out)
- Uses `scrollUntilVisible` to find Sign Out button reliably

---

## Test Files Archived

The following experimental test files have been moved to `e2e/auth/archive/`:

1. **02-auth-signin-v2.yaml** - Simplified version with Reset Auth button
2. **02-auth-signin-v3.yaml** - Ultra-simplified assuming clearState works
3. **02-auth-signin-v4.yaml** - Adaptive approach handling both states
4. **02-auth-signin-final.yaml** - App restart approach with stopApp/launchApp
5. **test-simple-launch.yaml** - Diagnostic test to check initial app state

**Original Test Preserved**: `02-auth-signin.yaml` remains in main directory for future use.

---

## ✅ SOLUTION IMPLEMENTED: Option A - Disable Fast Refresh During E2E Tests

**Implementation Date**: 2025-10-09

### Changes Made

1. **Modified `metro.config.js`**:
   - Added check for `E2E_TEST` environment variable
   - When `E2E_TEST=true`, sets `config.server.hot = false` to disable Fast Refresh
   - Added console log to confirm E2E mode is active

2. **Created `scripts/start-metro-e2e.sh`**:
   - Helper script to start Metro with E2E_TEST environment variable
   - Runs `E2E_TEST=true npx expo start --clear`

3. **Updated `package.json`**:
   - Added `start:e2e` script: `E2E_TEST=true expo start --clear`
   - Provides easy way to start Metro in E2E mode

### How to Use

**To run E2E tests with Fast Refresh disabled**:

1. **Stop current Metro server** (if running)
2. **Start Metro in E2E mode**:
   ```bash
   npm run start:e2e
   ```
   OR
   ```bash
   ./scripts/start-metro-e2e.sh
   ```
3. **In a separate terminal, run E2E tests**:
   ```bash
   npm run test:e2e:auth
   ```

### Expected Results

With Fast Refresh disabled:
- ✅ App should reload 0-1 times during tests (instead of 21+)
- ✅ Sign-out should clear session successfully
- ✅ App restart should show sign-in screen (not restore session)
- ✅ All authentication E2E tests should pass

### Verification Steps

1. Check Metro console for: `🧪 [Metro] E2E_TEST mode: Disabling Fast Refresh`
2. Run `npm run test:e2e:auth` and monitor Metro logs
3. Count app reloads - should be minimal (0-1 instead of 21+)
4. Verify tests pass without session restoration issues

### Rollback Instructions

If this solution causes issues:
1. Stop Metro server
2. Start Metro normally: `npm start`
3. Fast Refresh will be re-enabled automatically

---

## Next Steps

1. **Test the Solution**: User needs to restart Metro with `npm run start:e2e` and re-run auth tests
2. **Verify Results**: Confirm all auth tests pass with Fast Refresh disabled
3. **Document Findings**: Update this file with test results
4. **Expand Coverage**: Add remaining auth test scenarios if solution works

---

## Additional Notes

- **Dev Bypass Feature**: The `devBypassAuth()` function works correctly and can be used for tests that need authenticated state but don't test the auth flow itself
- **Manual Testing**: All auth flows work correctly when tested manually
- **Production Impact**: This is purely a testing issue - production auth functionality is working correctly
- **CI/CD Impact**: Cannot run auth E2E tests in CI/CD until this is resolved

---

## Contact

For questions or to discuss resolution approaches, contact the development team.

