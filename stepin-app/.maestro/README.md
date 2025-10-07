# Maestro E2E Tests for Stepin

This directory contains end-to-end (E2E) tests for the Stepin MVP using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

### System Requirements
- macOS 10.15+ (Catalina or later)
- Xcode 14.0+ with iOS Simulator
- Java 17+ (OpenJDK recommended)
- Maestro CLI installed

### Test Account
You need a test account in Supabase Auth:
- **Email:** `test@stepin.app`
- **Password:** `TestPassword123!`

Create this account before running tests, or update the test flows with your own test credentials.

## Installation

### Install Maestro CLI

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Install Java (if not already installed)

```bash
brew install openjdk@17
```

### Add to PATH

Add these lines to your `~/.zshrc` or `~/.bash_profile`:

```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export PATH="$PATH:$HOME/.maestro/bin"
```

Then reload your shell:

```bash
source ~/.zshrc
```

### Verify Installation

```bash
maestro --version
```

Expected output: `2.0.3` (or later)

## Running Tests

### Build the App First

Before running tests, build and install the app on iOS Simulator:

```bash
cd stepin-app
npx expo run:ios
```

Select an iPhone simulator when prompted (e.g., iPhone 16 Plus).

### Run All Tests

```bash
maestro test .maestro/
```

This runs all 4 test flows sequentially.

### Run Individual Tests

```bash
# Authentication flow
maestro test .maestro/auth-flow.yaml

# Walk tracking flow
maestro test .maestro/walk-flow.yaml

# Navigation flow
maestro test .maestro/navigation-flow.yaml

# Profile update flow
maestro test .maestro/profile-flow.yaml
```

## Test Flows

### 1. Authentication Flow (`auth-flow.yaml`)

**What it tests:**
- User can sign in with valid credentials
- Home screen loads after sign in
- User can sign out
- Returns to welcome screen after sign out

**Duration:** ~15 seconds

**Assertions:**
- ✅ Welcome screen visible
- ✅ Sign in form works
- ✅ Home screen displays after login
- ✅ Sign out returns to welcome

---

### 2. Walk Tracking Flow (`walk-flow.yaml`)

**What it tests:**
- User can start a walk
- Walk UI displays correctly
- User can pause a walk
- User can resume a walk
- User can end and save a walk
- Walk appears in history

**Duration:** ~30 seconds

**Assertions:**
- ✅ Start Walk button works
- ✅ Walking UI displays
- ✅ Pause/Resume functionality
- ✅ End Walk saves to history
- ✅ Walk appears in History tab

---

### 3. Navigation Flow (`navigation-flow.yaml`)

**What it tests:**
- User can navigate between all 5 tabs
- Each screen loads correctly
- Expected content is visible on each screen

**Tabs tested:**
- Home
- History
- Buddies
- Feed
- Map
- Profile

**Duration:** ~20 seconds

**Assertions:**
- ✅ All tabs are accessible
- ✅ Each screen displays expected content
- ✅ Navigation works in both directions

---

### 4. Profile Update Flow (`profile-flow.yaml`)

**What it tests:**
- User can access profile edit screen
- User can update display name
- Changes save successfully
- Changes persist after save

**Duration:** ~15 seconds

**Assertions:**
- ✅ Edit Profile screen opens
- ✅ Display name can be updated
- ✅ Save button works
- ✅ Success message displays
- ✅ Updated name persists

---

## Test Maintenance

### Updating Tests When UI Changes

If the app UI changes, you may need to update the test flows:

1. **Element not found errors:**
   - Update the text in `tapOn` or `assertVisible` commands
   - Use Maestro Studio to inspect element IDs: `maestro studio`

2. **Timing issues:**
   - Adjust `waitForAnimationToEnd` timeout values
   - Add explicit waits if needed

3. **New features:**
   - Create new test flow files
   - Follow the existing naming convention: `feature-flow.yaml`

### Adding New Test Flows

1. Create a new `.yaml` file in `.maestro/` directory
2. Start with the app ID: `appId: com.stepin.app`
3. Use `---` to separate test scenarios
4. Follow the pattern of existing flows

Example:

```yaml
appId: com.stepin.app
---
# Test: Description of what you're testing
- launchApp
- assertVisible: "Expected Element"
- tapOn: "Button Text"
- assertVisible: "Result"
```

## Troubleshooting

### Issue: "App not found"

**Solution:**
- Make sure the app is built and installed on the simulator
- Run `npx expo run:ios` first
- Verify the bundle ID matches: `com.stepin.app`

### Issue: "Element not found"

**Solution:**
- Check if the text has changed in the app
- Use Maestro Studio to inspect elements: `maestro studio`
- Update the test flow with the correct text

### Issue: "Timeout waiting for element"

**Solution:**
- Increase the timeout value in `waitForAnimationToEnd`
- Add explicit waits before assertions
- Check if the app is loading slowly

### Issue: "Simulator not responding"

**Solution:**
- Restart the iOS Simulator
- Run `xcrun simctl shutdown all` then restart
- Try a different simulator device

### Issue: "Java not found"

**Solution:**
- Install Java: `brew install openjdk@17`
- Add to PATH: `export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"`
- Reload shell: `source ~/.zshrc`

### Issue: "Tests pass locally but fail in CI"

**Solution:**
- Ensure CI has the same iOS Simulator version
- Add longer timeouts for CI environment
- Use `--headless` flag for CI: `maestro test --headless .maestro/`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS app
        run: npx expo run:ios --configuration Release
      
      - name: Run Maestro tests
        run: maestro test .maestro/
```

## Best Practices

1. **Keep tests independent:** Each test should be able to run standalone
2. **Use descriptive names:** Test file names should clearly indicate what they test
3. **Add comments:** Use `# Comment` to explain complex test steps
4. **Test happy paths first:** Focus on core user flows before edge cases
5. **Keep tests fast:** Aim for tests to complete in under 30 seconds each
6. **Clean up after tests:** Sign out or reset state at the end of flows
7. **Use realistic data:** Test with data that mimics real user behavior

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro CLI Reference](https://maestro.mobile.dev/cli/commands)
- [Maestro Cloud](https://maestro.mobile.dev/cloud) (for parallel device testing)
- [Maestro Studio](https://maestro.mobile.dev/cli/maestro-studio) (for inspecting elements)

## Support

For issues with Maestro tests:
1. Check this README's troubleshooting section
2. Review Maestro documentation
3. Use Maestro Studio to inspect elements
4. Ask in the team Slack channel

---

**Last Updated:** January 2025  
**Maestro Version:** 2.0.3  
**Test Coverage:** 4 core user flows (Auth, Walk, Navigation, Profile)

