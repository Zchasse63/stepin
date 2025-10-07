# Maestro E2E Testing - iOS Build Issues

## Issue Summary

**Problem:** iOS app build failures preventing Maestro E2E test execution

**Timeline:**
- **Started:** January 7, 2025 (during Maestro E2E implementation)
- **Duration:** 30+ minutes of troubleshooting
- **Status:** ❌ UNRESOLVED - Build still failing

**Impact:** Cannot proceed with Maestro E2E testing until the iOS app successfully builds and installs on the simulator.

---

## Attempted Build Commands

### 1. Initial Build Attempt
```bash
npx expo run:ios --device
```
- **Result:** Hung at "Planning build" stage, never progressed
- **Action:** Killed process and retried

### 2. Build with Explicit Device Selection
```bash
npx expo run:ios --device "iPhone 16 Plus"
```
- **Result:** Same issue - stuck at "Planning build"
- **Action:** Killed process

### 3. Development Server Approach
```bash
npx expo start --ios
```
- **Result:** Metro bundler started, but app incompatible with Expo Go
- **Error:** `Project is incompatible with this version of Expo Go`
- **Action:** Switched approach back to native build

### 4. Build with Device UUID
```bash
npx expo run:ios --device "79F4191C-277B-446E-B380-F23B0E68509E"
```
- **Result:** CocoaPods installation failures (see errors below)
- **Action:** Multiple retries with various fixes

### 5. Prebuild Attempt
```bash
npx expo prebuild --platform ios
```
- **Result:** No output, unclear if successful
- **Action:** Proceeded with run:ios command

---

## Specific Errors Encountered

### Error 1: CocoaPods Installation Failure (PrivacyInfo.xcprivacy)

**Error Message:**
```
⚠️  Something went wrong running `pod install` in the `ios` directory.
Command `pod install` failed.
└─ Cause: An error occurred while processing the post-install hook of the Podfile.

No such file or directory @ rb_sysopen - /Users/zach/Desktop/Steppin/stepin-app/ios/HelloWorld/PrivacyInfo.xcprivacy
```

**Full Stack Trace:**
```
/opt/homebrew/Cellar/cocoapods/1.16.2_1/libexec/gems/xcodeproj-1.27.0/lib/xcodeproj/plist.rb:53:in 'File#initialize'
/opt/homebrew/Cellar/cocoapods/1.16.2_1/libexec/gems/xcodeproj-1.27.0/lib/xcodeproj/plist.rb:53:in 'IO.open'
/opt/homebrew/Cellar/cocoapods/1.16.2_1/libexec/gems/xcodeproj-1.27.0/lib/xcodeproj/plist.rb:53:in 'Xcodeproj::Plist.write_to_path'
/Users/zach/Desktop/Steppin/stepin-app/node_modules/react-native/scripts/cocoapods/privacy_manifest_utils.rb:45:in 'PrivacyManifestUtils.add_aggregated_privacy_manifest'
/Users/zach/Desktop/Steppin/stepin-app/node_modules/react-native/scripts/react_native_pods.rb:510:in 'Object#react_native_post_install'
/Users/zach/Desktop/Steppin/stepin-app/ios/Podfile:53:in 'block (3 levels) in Pod::Podfile.from_ruby'
```

**Context:**
- CocoaPods was trying to create/update a PrivacyInfo.xcprivacy file
- The file path referenced `ios/HelloWorld/` directory
- This directory did not exist

---

### Error 2: Target Name Mismatch

**Error Message:**
```
⚠️  Something went wrong running `pod install` in the `ios` directory.
Command `pod install` failed.
└─ Cause: Unable to find a target named `Stepin` in project `Stepin.xcodeproj`, did find `HelloWorld`.
```

**Context:**
- Podfile was updated to use `target 'Stepin'` (line 23)
- Xcode project file (`Stepin.xcodeproj`) still had target named `HelloWorld`
- Mismatch between Podfile and Xcode project configuration

---

### Error 3: Expo Go Incompatibility

**Error Message:**
```
ERROR  Project is incompatible with this version of Expo Go

The project you requested requires a newer version of Expo Go.

How to fix this error:
Download the latest version of Expo Go from the App Store.
```

**Context:**
- Attempted to use `npx expo start --ios` with Expo Go
- Stepin app uses Expo SDK 54.0.0
- Simulator had Expo Go 2.33.13 (incompatible)
- Expo Go 54.0.6 is required

---

## Root Causes Identified

### 1. Missing `ios/` Directory (Initial State)
- **Issue:** The `ios/` directory did not exist when first attempting to build
- **Cause:** Expo projects don't generate native directories by default
- **Expected Behavior:** `npx expo run:ios` should auto-generate the ios/ directory
- **Actual Behavior:** Build hung at "Planning build" stage

### 2. Podfile Target Name Mismatch
- **Issue:** Podfile referenced `target 'HelloWorld'` but should reference `target 'Stepin'`
- **Cause:** Template/boilerplate code not updated during project initialization
- **Location:** `ios/Podfile` line 23
- **Impact:** CocoaPods couldn't find the correct Xcode target

### 3. Missing PrivacyInfo.xcprivacy File
- **Issue:** React Native's post-install hook expected `ios/HelloWorld/PrivacyInfo.xcprivacy` to exist
- **Cause:** Directory `ios/HelloWorld/` was never created
- **Impact:** CocoaPods installation failed during post-install hook

### 4. Xcode Project Configuration Inconsistency
- **Issue:** Xcode project (`Stepin.xcodeproj`) has target named `HelloWorld`, not `Stepin`
- **Cause:** Project was likely initialized with "HelloWorld" template and never fully renamed
- **Impact:** Mismatch between Podfile target name and actual Xcode target

---

## Attempted Solutions

### Solution 1: Clean Xcode Build Cache
```bash
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/stepin*
```
- **Result:** ❌ Did not resolve issue
- **Reason:** Build never progressed far enough to use cached data

### Solution 2: Update Podfile Target Name (First Attempt)
```diff
- target 'HelloWorld' do
+ target 'Stepin' do
```
- **Result:** ❌ Created new error - target not found in Xcode project
- **Reason:** Xcode project still had `HelloWorld` target, not `Stepin`

### Solution 3: Create Missing Directory and PrivacyInfo.xcprivacy
```bash
mkdir -p ios/HelloWorld
```

Created `ios/HelloWorld/PrivacyInfo.xcprivacy`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSPrivacyTracking</key>
	<false/>
	<key>NSPrivacyTrackingDomains</key>
	<array/>
	<key>NSPrivacyCollectedDataTypes</key>
	<array/>
	<key>NSPrivacyAccessedAPITypes</key>
	<array/>
</dict>
</plist>
```
- **Result:** ⏳ In progress - build currently running
- **Reason:** Addressed the missing file error

### Solution 4: Revert Podfile Target Name
```diff
- target 'Stepin' do
+ target 'HelloWorld' do
```
- **Result:** ⏳ In progress - aligns Podfile with Xcode project
- **Reason:** Xcode project expects `HelloWorld` target

### Solution 5: Clean CocoaPods Cache
```bash
cd ios
rm -rf Pods Podfile.lock
cd ..
```
- **Result:** ⏳ In progress - forces fresh Pod installation
- **Reason:** Ensures no cached/corrupted Pod data

---

## Current Status

### Files Modified
1. ✅ `ios/Podfile` - Line 23: `target 'HelloWorld' do` (reverted to match Xcode project)
2. ✅ `ios/HelloWorld/PrivacyInfo.xcprivacy` - Created with basic privacy manifest
3. ✅ `ios/Pods/` - Deleted (will be regenerated)
4. ✅ `ios/Podfile.lock` - Deleted (will be regenerated)

### Current Build Process
- **Command Running:** `npx expo run:ios --device "79F4191C-277B-446E-B380-F23B0E68509E"`
- **Terminal ID:** 9
- **Status:** Running (CocoaPods installation in progress)
- **Expected Duration:** 5-10 minutes for full build

### Blocking Issues
1. ⚠️ **Xcode Project Naming Inconsistency:** Project uses `HelloWorld` internally but should be `Stepin`
2. ⚠️ **Unknown CocoaPods Errors:** May encounter additional errors during installation
3. ⚠️ **Build Configuration:** Unclear if all native modules are properly configured

---

## Next Steps & Recommendations

### Immediate Actions (In Progress)
1. ✅ Monitor current build process (Terminal ID 9)
2. ⏳ Wait for CocoaPods installation to complete
3. ⏳ Check for any new errors during Xcode compilation
4. ⏳ Verify app installs successfully on iPhone 16 Plus simulator

### If Current Build Fails

#### Option A: Manual Xcode Build
1. Open `ios/Stepin.xcworkspace` in Xcode (NOT .xcodeproj)
2. Select iPhone 16 Plus simulator as target
3. Click Product → Build (⌘B)
4. Click Product → Run (⌘R)
5. Once app launches, proceed with Maestro tests

#### Option B: Rename Xcode Target to Match App Name
1. Open `ios/Stepin.xcworkspace` in Xcode
2. Select `HelloWorld` target
3. Rename to `Stepin` in target settings
4. Update all references in project.pbxproj
5. Update Podfile to use `target 'Stepin'`
6. Run `pod install` again

#### Option C: Accept HelloWorld Naming
1. Keep Podfile as `target 'HelloWorld'`
2. Keep Xcode project with `HelloWorld` target
3. Update app.json if needed to match
4. Proceed with build using HelloWorld naming

### Long-term Solutions

1. **Regenerate iOS Project from Scratch**
   ```bash
   rm -rf ios/
   npx expo prebuild --platform ios --clean
   ```
   - Ensures clean, properly configured iOS project
   - May require reconfiguring native modules

2. **Use EAS Build Instead**
   ```bash
   eas build --platform ios --profile development --local
   ```
   - Expo's managed build service
   - Handles all native configuration automatically
   - Requires EAS CLI setup

3. **Document Proper Project Initialization**
   - Create setup guide for future developers
   - Include steps to properly rename from template
   - Add validation checks for naming consistency

---

## Additional Context

### System Information
- **macOS Version:** 15.6.1 (Sequoia)
- **Xcode Version:** 2410
- **CocoaPods Version:** 1.16.2
- **Node Version:** (from package manager)
- **Expo SDK:** 54.0.12
- **React Native:** 0.81.4

### Simulator Information
- **Device:** iPhone 16 Plus
- **iOS Version:** 18.4
- **UUID:** 79F4191C-277B-446E-B380-F23B0E68509E
- **Status:** Booted

### Related Files
- `ios/Podfile` - CocoaPods dependency configuration
- `ios/Stepin.xcodeproj/project.pbxproj` - Xcode project configuration
- `ios/Stepin.xcworkspace` - Xcode workspace (use this to open in Xcode)
- `app.json` - Expo configuration (bundle ID: `com.stepin.app`)
- `package.json` - Node dependencies

---

## Lessons Learned

1. **Expo Project Naming:** Template projects may retain default names like "HelloWorld" - always verify and rename consistently
2. **CocoaPods Dependencies:** React Native's privacy manifest utilities expect specific directory structures
3. **Build Process:** `npx expo run:ios` can hang indefinitely - set timeouts and monitor progress
4. **Expo Go Limitations:** Not suitable for apps with custom native modules or newer SDK versions
5. **Native Directory Generation:** Expo doesn't always auto-generate ios/ directory reliably

---

## Resolution Update

### Build Success! ✅

**Date:** January 7, 2025
**Final Solution:** Created missing `ios/HelloWorld/PrivacyInfo.xcprivacy` file and kept Podfile target as `HelloWorld`

**Build Result:**
- ✅ CocoaPods installation successful
- ✅ Xcode compilation successful
- ✅ App installed on iPhone 16 Plus simulator
- ✅ App bundle ID: `com.stepin.app`
- ✅ App launches successfully

**Maestro Test Status:**
- ✅ Maestro can launch the app
- ❌ First test failed: "Welcome to Stepin" text not found
- **Likely Cause:** User already signed in (app shows home screen instead of welcome screen)
- **Next Step:** Sign out user or update test to handle signed-in state

---

**Last Updated:** January 7, 2025
**Status:** ✅ BUILD RESOLVED - Maestro testing in progress
**Next Review:** After Maestro test debugging

