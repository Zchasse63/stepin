# Authentication E2E Tests (Phase 1A + 1B)

This directory contains end-to-end (E2E) tests for the Steppin app's authentication flows using Maestro.

## 📋 Test Suite Overview

### Phase 1A: Core Authentication (P0 - Critical)

| # | Test File | Test Name | Status | What It Tests |
|---|-----------|-----------|--------|---------------|
| 1 | `01-auth-signup.yaml` | Sign-Up Flow | ✅ STABLE | New user account creation |
| 2 | `02-auth-signin.yaml` | Sign-In Flow | ✅ STABLE | Existing user authentication |
| 3 | `03-auth-signout.yaml` | Sign-Out Flow | ✅ STABLE | Session cleanup and sign-out |
| 4 | `04-auth-signup-validation.yaml` | Sign-Up Validation | ✅ STABLE | Form validation errors |
| 5 | `05-auth-signin-errors.yaml` | Sign-In Error Handling | ✅ STABLE | Error handling for invalid credentials |

### Phase 1B: Enhanced Authentication (P1 - Important)

| # | Test File | Test Name | Status | What It Tests |
|---|-----------|-----------|--------|---------------|
| 6 | `06-auth-password-reset.yaml` | Password Reset Flow | ✅ STABLE | Forgot password UI flow |
| 7 | `07-auth-session-persistence.yaml` | Session Persistence | ✅ STABLE | Session persists across app restarts |
| 8 | `08-auth-token-refresh.yaml` | Token Refresh Configuration | ✅ STABLE | Auto-refresh token configuration |

## 🚀 Running the Tests

### Prerequisites

1. **Metro bundler must be running:**
   ```bash
   npm start
   ```

2. **Maestro must be installed:**
   ```bash
   brew install maestro
   ```

3. **Java 17 must be installed:**
   ```bash
   brew install openjdk@17
   ```

### Run Individual Tests

Each test should be run with database cleanup first:

```bash
# Run signup test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/01-auth-signup.yaml

# Run signin test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/02-auth-signin.yaml

# Run signout test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/03-auth-signout.yaml

# Run signup validation test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/04-auth-signup-validation.yaml

# Run signin error handling test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/05-auth-signin-errors.yaml

# Run password reset test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/06-auth-password-reset.yaml

# Run session persistence test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/07-auth-session-persistence.yaml

# Run token refresh test
npm run test:cleanup-db && \
export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && \
export PATH="$JAVA_HOME/bin:$PATH" && \
maestro test e2e/auth/08-auth-token-refresh.yaml
```

### Run All Tests

Use the test suite runner to run all tests in sequence:

```bash
./e2e/run-auth-tests.sh
```

This script will:
- Run all 8 authentication tests (Phase 1A + 1B) in priority order
- Clean the database before each test
- Provide a summary report at the end
- Exit with error code if any test fails

## 🔧 Test Configuration

### Test Account Credentials

All tests use a consistent test account:
- **Email:** `e2e-signup-test@stepin.test`
- **Password:** `TestPass123!`
- **Name:** `E2E Test User`

### Database Cleanup

Before each test, run:
```bash
npm run test:cleanup-db
```

This deletes all users from the TEST Supabase database to ensure clean state.

### iOS Password Autofill Fix

To prevent iOS password autofill from blocking Maestro input, both sign-in and sign-up screens use:

```typescript
textContentType={__DEV__ ? 'oneTimeCode' : 'password'}
autoComplete={__DEV__ ? 'off' : 'password'}
```

This disables iOS password suggestions in development mode while maintaining proper autofill in production.

## 📝 Test Details

### 1. Sign-Up Flow (`01-auth-signup.yaml`)

**What it tests:**
- User can create a new account
- Form accepts valid inputs
- User is redirected to home screen after signup
- Session is created and persisted

**Test steps:**
1. Launch app and connect to Expo Dev Launcher
2. Ensure signed out state
3. Navigate to sign-up screen
4. Fill in name, email, password, and confirm password
5. Submit form
6. Verify navigation to home screen ("Today" tab visible)

**Expected result:** ✅ User account created, redirected to home screen

---

### 2. Sign-In Flow (`02-auth-signin.yaml`)

**What it tests:**
- Existing user can sign in with valid credentials
- Session is created after successful sign-in
- User is redirected to home screen

**Test steps:**
1. Launch app and connect to Expo Dev Launcher
2. Ensure signed out state
3. Fill in email and password
4. Submit sign-in form
5. Verify navigation to home screen

**Expected result:** ✅ User signed in, redirected to home screen

---

### 3. Sign-Out Flow (`03-auth-signout.yaml`)

**What it tests:**
- User can successfully sign out
- Session is cleared from expo-secure-store
- User is redirected to sign-in screen
- Cannot access protected routes after sign-out

**Test steps:**
1. Create a test account (run signup flow)
2. Verify on home screen
3. Tap "Reset Auth State (Dev Only)" button
4. Verify redirected to sign-in screen
5. Verify home screen is no longer accessible

**Expected result:** ✅ User signed out, session cleared, redirected to sign-in

---

### 4. Sign-Up Validation (`04-auth-signup-validation.yaml`)

**What it tests:**
- Password too short (< 8 characters) shows error
- Passwords don't match shows error
- Invalid email format shows error
- Form validation prevents submission with invalid data

**Test cases:**
1. **Password too short:** Enter 7-character password → Error message
2. **Passwords don't match:** Different confirm password → Error message
3. **Invalid email:** Enter "not-an-email" → Error message

**Expected result:** ✅ Validation errors shown, user stays on sign-up screen

---

### 5. Sign-In Error Handling (`05-auth-signin-errors.yaml`)

**What it tests:**
- Wrong password shows error message
- Non-existent email shows error message
- Empty fields show validation errors
- Error messages are user-friendly

**Test cases:**
1. **Wrong password:** Correct email + wrong password → "Invalid" error
2. **Non-existent email:** Fake email + any password → "Invalid" error
3. **Empty fields:** Submit without filling → Validation prevents submission

**Expected result:** ✅ Error messages shown, user stays on sign-in screen

## 🐛 Debugging Failed Tests

### View Test Screenshots

Maestro saves screenshots of failed tests:

```bash
# List recent test runs
ls -lt ~/.maestro/tests/ | head -5

# Open screenshots from latest test
open ~/.maestro/tests/[latest-folder]/screenshot-*.png
```

### Common Issues

#### 1. Metro bundler not running
**Error:** App doesn't load after tapping "http://localhost:8081"

**Solution:**
```bash
npm start
```

#### 2. Database not cleaned
**Error:** "User already exists" or duplicate account errors

**Solution:**
```bash
npm run test:cleanup-db
```

#### 3. iOS password autofill blocking input
**Error:** Only 1 character entered instead of full password

**Solution:** Verify `textContentType="oneTimeCode"` is set in dev mode in both:
- `stepin-app/app/(auth)/sign-in.tsx`
- `stepin-app/app/(auth)/sign-up.tsx`

#### 4. Test timeout
**Error:** "Timed out waiting for element"

**Solution:**
- Increase timeout values in the test file
- Check if Metro bundler is responding
- Verify Expo Dev Launcher is working

#### 5. Expo Dev Menu blocking test
**Error:** Test fails at Expo Dev Launcher connection step

**Solution:** The test includes steps to dismiss the Expo Dev Menu:
```yaml
- tapOn:
    text: "Continue"
    optional: true
- tapOn:
    point: "10%,20%"
    optional: true
```

## 📊 Test Execution Times

Expected execution times (approximate):

| Test | Expected Time |
|------|---------------|
| Sign-Up Flow | 2-3 minutes |
| Sign-In Flow | 2-3 minutes |
| Sign-Out Flow | 3-4 minutes (includes signup) |
| Sign-Up Validation | 3-4 minutes (multiple test cases) |
| Sign-In Error Handling | 4-5 minutes (includes signup + multiple test cases) |

**Total suite time:** ~15-20 minutes

## 🔍 Test Isolation Strategy

Each test is designed to be independent and create its own fresh state:

1. **Database cleanup** before each test (`npm run test:cleanup-db`)
2. **Clear app state** on launch (`clearState: true`)
3. **Ensure signed out** using `ensure-signed-out.yaml` helper
4. **Create test accounts** as needed within each test

This ensures:
- Tests can run in any order
- Tests don't interfere with each other
- Failures are isolated and reproducible

## 📈 Success Criteria

A test is considered **STABLE** when:
- ✅ It passes 2 consecutive runs without changes
- ✅ It produces consistent results
- ✅ It doesn't have timing-related flakiness
- ✅ It properly cleans up after itself

## 🎯 Next Steps (Phase 1B)

Future authentication tests to consider:

- **Session persistence:** App restart maintains session
- **Duplicate account prevention:** Can't create account with existing email
- **Password reset flow:** User can reset forgotten password
- **Email verification:** User must verify email before accessing app
- **Social auth:** Google/Apple sign-in flows
- **Multi-device sessions:** Sign in on multiple devices
- **Rate limiting:** Prevent brute force attacks

## 📚 Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

**Last Updated:** October 15, 2025  
**Test Suite Version:** 1.0.0  
**Status:** Ready for execution

