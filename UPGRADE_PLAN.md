# Comprehensive Upgrade Plan - Steppin App
## iOS Simulator & Dependency Upgrades

**Date:** October 10, 2025  
**Objective:** Upgrade to iOS 26.0 simulator and update dependencies to resolve network connectivity issues

---

## 📊 Current State Analysis

### Current Versions
| Component | Current Version | Latest Stable | Status |
|-----------|----------------|---------------|---------|
| **Xcode** | 26.0.1 (Build 17A400) | 26.0.1 | ✅ Latest |
| **iOS Simulator** | 18.4 (BROKEN) | 26.0 (Available) | ⚠️ Needs Upgrade |
| **Expo SDK** | 54.0.12 | 54.0.13 | 🔄 Minor Update |
| **React Native** | 0.81.4 | 0.82.0 | ⚠️ Major Update Available |
| **Supabase JS** | 2.58.0 (package.json) / 2.74.0 (installed) | 2.75.0 | 🔄 Minor Update |
| **React** | 19.1.0 | 19.2.0 | 🔄 Minor Update |

### Available iOS Simulator Runtimes
- ✅ **iOS 26.0** (Latest - RECOMMENDED)
- ✅ iOS 18.2 (Working - fallback option)
- ❌ iOS 18.4 (BROKEN - network bug)

### Key Findings
1. **iOS 18.4 Simulator Bug Confirmed**: HTTP/3 networking broken (Apple bug)
2. **iOS 26.0 Available**: Already installed with Xcode 26.0.1
3. **Expo SDK 54 is Latest Stable**: Released September 10, 2025
4. **React Native 0.81.4 is SDK 54 Default**: 0.82.0 available but not required by Expo SDK 54
5. **Dependencies Mostly Current**: Only minor updates available

---

## 🎯 Recommended Upgrade Strategy

### Phase 1: iOS Simulator Upgrade (IMMEDIATE - 5 minutes)
**Priority:** CRITICAL  
**Risk:** LOW  
**Justification:** Fixes network connectivity bug, no code changes required

### Phase 2: Dependency Updates (RECOMMENDED - 15 minutes)
**Priority:** HIGH  
**Risk:** LOW  
**Justification:** Security patches, bug fixes, maintain compatibility

### Phase 3: React Native 0.82 Upgrade (OPTIONAL - DEFER)
**Priority:** LOW  
**Risk:** MEDIUM  
**Justification:** Not required by Expo SDK 54, defer until SDK 55

---

## 📋 PHASE 1: iOS Simulator Upgrade

### Step 1.1: Verify iOS 26.0 Runtime is Installed
```bash
xcrun simctl list runtimes | grep "iOS 26.0"
```

**Expected Output:**
```
iOS 26.0 (26.0 - 23A343) - com.apple.CoreSimulator.SimRuntime.iOS-26-0
```

✅ **Status:** Already installed!

### Step 1.2: Create New iPhone 16 Plus Simulator with iOS 26.0
```bash
# Create new simulator
xcrun simctl create "iPhone 16 Plus (iOS 26.0)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Plus" \
  "com.apple.CoreSimulator.SimRuntime.iOS-26-0"
```

**Expected Output:**
```
<UUID-of-new-simulator>
```

### Step 1.3: Verify New Simulator
```bash
xcrun simctl list devices | grep "iPhone 16 Plus (iOS 26.0)"
```

### Step 1.4: Set as Default (Optional)
Open Xcode → Window → Devices and Simulators → Select new simulator

### Step 1.5: Delete Old iOS 18.4 Simulator (Optional)
```bash
# List all iPhone 16 Plus simulators
xcrun simctl list devices | grep "iPhone 16 Plus"

# Delete the iOS 18.4 one (use UUID from output)
xcrun simctl delete <UUID-of-18.4-simulator>
```

**Current iOS 18.4 Simulator UUID:** `79F4191C-277B-446E-B380-F23B0E68509E`

---

## 📋 PHASE 2: Dependency Updates

### Step 2.1: Update Expo SDK (54.0.12 → 54.0.13)
```bash
cd stepin-app
npm install expo@54.0.13
```

**Changes:** Patch release with bug fixes  
**Breaking Changes:** None  
**Risk:** Very Low

### Step 2.2: Update Supabase JS (2.58.0 → 2.75.0)
```bash
npm install @supabase/supabase-js@2.75.0
```

**Changes:**
- v2.59.0 - v2.75.0: Bug fixes, performance improvements
- No breaking changes in minor versions
- Improved error handling
- Better TypeScript types

**Breaking Changes:** None  
**Risk:** Very Low

### Step 2.3: Update Other Dependencies
```bash
# Update all compatible minor/patch versions
npm update

# Specific updates recommended:
npm install expo-dev-client@6.0.14
npm install expo-file-system@19.0.17
npm install expo-router@6.0.11
npm install @sentry/react-native@7.3.0
npm install react-native-reanimated@4.1.3
```

**Risk:** Very Low (all minor/patch updates)

### Step 2.4: Update package.json
Update the version constraint for Supabase:
```json
"@supabase/supabase-js": "^2.75.0"
```

---

## 📋 PHASE 3: React Native 0.82 Upgrade (OPTIONAL - DEFER)

### ⚠️ RECOMMENDATION: DEFER THIS UPGRADE

**Reasons to Defer:**
1. **Expo SDK 54 officially supports React Native 0.81.4** (current version)
2. **React Native 0.82 is not required** for Expo SDK 54
3. **Medium risk** of breaking changes with native modules
4. **Expo SDK 55 will likely support 0.82** as default
5. **Current version is stable** and working

**When to Upgrade:**
- When Expo SDK 55 is released (likely Q4 2025)
- If specific 0.82 features are needed
- After thorough testing in a separate branch

**If You Decide to Upgrade Now:**
```bash
# Create backup branch first
git checkout -b upgrade/react-native-0.82

# Update React Native
npm install react-native@0.82.0

# Rebuild native code
npx expo prebuild --clean
```

---

## 🧪 Testing Plan

### Test 1: iOS 26.0 Simulator Network Connectivity
```bash
cd stepin-app
npm start
# Press 'i' to open iOS simulator
# Select "iPhone 16 Plus (iOS 26.0)"
```

**Expected Results:**
- ✅ App launches successfully
- ✅ No "Network request failed" errors
- ✅ Supabase connection succeeds
- ✅ Auth check completes
- ✅ App loads to login/home screen

**Success Criteria:**
```
LOG  🔍 [AuthStore] Checking for existing session...
LOG  [INFO] Stopping background sync service (no user)
LOG  🔄 [RootLayout] Navigation effect triggered
```

**NO ERRORS like:**
```
ERROR  [TypeError: Network request failed]  ❌
ERROR  [AuthRetryableFetchError: Network request failed]  ❌
```

### Test 2: Supabase Authentication
```bash
# Test login flow
# 1. Launch app
# 2. Navigate to login screen
# 3. Enter test credentials
# 4. Verify successful login
```

**Expected Results:**
- ✅ Login request succeeds
- ✅ Session created
- ✅ User data loaded
- ✅ Navigation to home screen

### Test 3: Supabase Database Queries
```bash
# Test data fetching
# 1. Navigate to different screens
# 2. Verify data loads from Supabase
# 3. Check for any network errors
```

**Expected Results:**
- ✅ All database queries succeed
- ✅ Data displays correctly
- ✅ No timeout errors

### Test 4: Dependency Compatibility
```bash
# Run tests
npm test

# Check for TypeScript errors
npx tsc --noEmit

# Verify build
npx expo prebuild --clean
```

**Expected Results:**
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Build succeeds

---

## 🔄 Rollback Strategy

### If iOS 26.0 Simulator Has Issues

**Option 1: Use iOS 18.2 Simulator**
```bash
# Create iOS 18.2 simulator
xcrun simctl create "iPhone 16 Plus (iOS 18.2)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Plus" \
  "com.apple.CoreSimulator.SimRuntime.iOS-18-2"
```

**Option 2: Downgrade to iOS 18.3 Runtime**
1. Xcode → Settings → Platforms
2. Download iOS 18.3 runtime
3. Create new simulator with 18.3

### If Dependency Updates Cause Issues

**Rollback Dependencies:**
```bash
# Restore from package-lock.json
git checkout package-lock.json
npm ci

# Or manually downgrade
npm install expo@54.0.12
npm install @supabase/supabase-js@2.58.0
```

### If React Native 0.82 Causes Issues (if upgraded)

**Rollback to 0.81.4:**
```bash
npm install react-native@0.81.4
npx expo prebuild --clean
git checkout ios/ android/
```

---

## ⚠️ Potential Risks & Mitigation

### Risk 1: iOS 26.0 Simulator Compatibility
**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:** iOS 18.2 simulator available as fallback

### Risk 2: Supabase 2.75.0 Breaking Changes
**Likelihood:** Very Low  
**Impact:** Low  
**Mitigation:** Minor version update, no breaking changes documented

### Risk 3: Expo 54.0.13 Patch Issues
**Likelihood:** Very Low  
**Impact:** Low  
**Mitigation:** Patch release, thoroughly tested by Expo team

### Risk 4: Native Module Compatibility
**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:** Only updating minor/patch versions, no native changes expected

---

## 📝 Execution Checklist

### Pre-Upgrade
- [ ] Commit all current changes
- [ ] Create backup branch: `git checkout -b backup/pre-upgrade`
- [ ] Document current simulator setup
- [ ] Verify app works on iOS 18.2 simulator (fallback test)

### Phase 1: iOS Simulator
- [ ] Verify iOS 26.0 runtime installed
- [ ] Create iPhone 16 Plus (iOS 26.0) simulator
- [ ] Test app launch on new simulator
- [ ] Verify network connectivity works
- [ ] Delete iOS 18.4 simulator (optional)

### Phase 2: Dependencies
- [ ] Update Expo to 54.0.13
- [ ] Update Supabase to 2.75.0
- [ ] Run `npm update` for other packages
- [ ] Update package.json version constraints
- [ ] Run `npm install` to update lock file
- [ ] Commit dependency updates

### Phase 3: Testing
- [ ] Test Supabase authentication
- [ ] Test database queries
- [ ] Run unit tests
- [ ] Run E2E tests (if applicable)
- [ ] Test on physical device (optional)
- [ ] Verify no console errors

### Post-Upgrade
- [ ] Document any issues encountered
- [ ] Update team on changes
- [ ] Monitor for any runtime errors
- [ ] Create PR with changes (if applicable)

---

## 🎯 Expected Outcomes

### Immediate Benefits
1. ✅ **Network connectivity restored** in iOS simulator
2. ✅ **Supabase connections work** without errors
3. ✅ **Development workflow unblocked**
4. ✅ **Latest bug fixes** from Expo and Supabase

### Long-term Benefits
1. ✅ **Future-proof setup** with iOS 26.0
2. ✅ **Improved stability** with latest patches
3. ✅ **Better developer experience**
4. ✅ **Maintained compatibility** with ecosystem

---

## 📞 Support & Resources

### Documentation
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
- [Supabase JS Releases](https://github.com/supabase/supabase-js/releases)
- [React Native 0.81 Release](https://reactnative.dev/blog/2025/08/12/react-native-0.81)

### Known Issues
- [iOS 18.4 Simulator Bug - Apple Forums](https://developer.apple.com/forums/thread/777999)
- [Supabase Network Issues - GitHub](https://github.com/orgs/supabase/discussions/35943)

### Emergency Contacts
- Expo Discord: https://chat.expo.dev
- Supabase Discord: https://discord.supabase.com
- React Native Community: https://reactnative.dev/community/overview

---

**Next Steps:** Proceed with Phase 1 (iOS Simulator Upgrade) immediately to unblock development.

