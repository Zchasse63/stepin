# Upgrade Troubleshooting Guide

## 🔧 Common Issues & Solutions

---

## Issue 1: iOS 26.0 Simulator Not Found

### Symptoms
```bash
xcrun simctl list runtimes | grep "iOS 26.0"
# No output
```

### Solution
1. Open Xcode
2. Go to **Xcode > Settings > Platforms**
3. Click **+** button
4. Download **iOS 26.0** runtime
5. Wait for download to complete
6. Retry simulator creation

### Alternative
Use iOS 18.2 as fallback:
```bash
xcrun simctl create "iPhone 16 Plus (iOS 18.2)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Plus" \
  "com.apple.CoreSimulator.SimRuntime.iOS-18-2"
```

---

## Issue 2: Simulator Creation Fails

### Symptoms
```bash
xcrun simctl create ...
# Error: Unable to create device
```

### Solutions

**Solution A: Check device type exists**
```bash
xcrun simctl list devicetypes | grep "iPhone-16-Plus"
```

**Solution B: Use different device type**
```bash
# Try iPhone 16 instead
xcrun simctl create "iPhone 16 (iOS 26.0)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-16" \
  "com.apple.CoreSimulator.SimRuntime.iOS-26-0"
```

**Solution C: Reset simulator service**
```bash
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
xcrun simctl list devices
```

---

## Issue 3: npm install Fails

### Symptoms
```bash
npm install expo@54.0.13
# Error: ERESOLVE unable to resolve dependency tree
```

### Solutions

**Solution A: Clear npm cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution B: Use --legacy-peer-deps**
```bash
npm install expo@54.0.13 --legacy-peer-deps
```

**Solution C: Update npm**
```bash
npm install -g npm@latest
npm install
```

---

## Issue 4: Supabase Still Shows Network Errors

### Symptoms
```
ERROR  [TypeError: Network request failed]
ERROR  [AuthRetryableFetchError: Network request failed]
```

### Solutions

**Solution A: Verify correct simulator**
```bash
# Check which simulator is running
xcrun simctl list devices | grep Booted

# Should show iOS 26.0, not 18.4
```

**Solution B: Restart simulator**
```bash
# Kill all simulators
xcrun simctl shutdown all

# Start fresh
npm start
# Press 'i' and select iOS 26.0 simulator
```

**Solution C: Clear simulator data**
```bash
# Reset simulator
xcrun simctl erase all

# Restart app
npm start
```

**Solution D: Check .env file**
```bash
cd stepin-app
cat .env | grep SUPABASE

# Should show:
# EXPO_PUBLIC_SUPABASE_URL=https://hwzyuugggdubeejfpele.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Issue 5: TypeScript Errors After Update

### Symptoms
```bash
npx tsc --noEmit
# Error: Type 'X' is not assignable to type 'Y'
```

### Solutions

**Solution A: Update @types packages**
```bash
npm install --save-dev @types/react@latest @types/node@latest
```

**Solution B: Clear TypeScript cache**
```bash
rm -rf node_modules/.cache
npx tsc --noEmit
```

**Solution C: Restart TypeScript server**
In VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

---

## Issue 6: Metro Bundler Errors

### Symptoms
```
Error: Unable to resolve module ...
```

### Solutions

**Solution A: Clear Metro cache**
```bash
npm start -- --clear
```

**Solution B: Reset Metro**
```bash
rm -rf node_modules/.cache
rm -rf .expo
npm start
```

**Solution C: Reinstall dependencies**
```bash
rm -rf node_modules
npm install
npm start
```

---

## Issue 7: Build Fails After Update

### Symptoms
```bash
npx expo prebuild
# Error: ...
```

### Solutions

**Solution A: Clean rebuild**
```bash
rm -rf ios android
npx expo prebuild --clean
```

**Solution B: Clear Xcode derived data**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
npx expo prebuild --clean
```

**Solution C: Update CocoaPods**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

---

## Issue 8: App Crashes on Launch

### Symptoms
App opens then immediately crashes

### Solutions

**Solution A: Check logs**
```bash
# View simulator logs
xcrun simctl spawn booted log stream --level debug
```

**Solution B: Rebuild native code**
```bash
npx expo prebuild --clean
npm start
```

**Solution C: Check for missing dependencies**
```bash
npm install
cd ios && pod install && cd ..
```

---

## Issue 9: Supabase Version Mismatch

### Symptoms
```bash
npm list @supabase/supabase-js
# Shows different version than expected
```

### Solutions

**Solution A: Force update**
```bash
npm install @supabase/supabase-js@2.75.0 --force
```

**Solution B: Remove and reinstall**
```bash
npm uninstall @supabase/supabase-js
npm install @supabase/supabase-js@2.75.0
```

**Solution C: Check package-lock.json**
```bash
# Verify version in lock file
grep -A 5 '"@supabase/supabase-js"' package-lock.json
```

---

## Issue 10: Expo Dev Client Not Working

### Symptoms
```
Error: No development build found
```

### Solutions

**Solution A: Rebuild dev client**
```bash
npx expo prebuild --clean
npx expo run:ios
```

**Solution B: Use Expo Go instead**
```bash
npm start
# Press 's' to switch to Expo Go
# Press 'i' to open iOS simulator
```

**Solution C: Check dev client version**
```bash
npm list expo-dev-client
# Should be 6.0.14
```

---

## Issue 11: Tests Fail After Update

### Symptoms
```bash
npm test
# Tests fail with errors
```

### Solutions

**Solution A: Update Jest**
```bash
npm install --save-dev jest@latest jest-expo@latest
```

**Solution B: Clear Jest cache**
```bash
npm test -- --clearCache
npm test
```

**Solution C: Update test snapshots**
```bash
npm test -- -u
```

---

## Issue 12: Rollback Needed

### When to Rollback
- Critical functionality broken
- Unable to resolve errors
- Need to revert to working state

### Rollback Steps

**Step 1: Rollback dependencies**
```bash
cd stepin-app
git checkout package.json package-lock.json
npm ci
```

**Step 2: Use iOS 18.2 simulator**
```bash
xcrun simctl create "iPhone 16 Plus (iOS 18.2)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Plus" \
  "com.apple.CoreSimulator.SimRuntime.iOS-18-2"
```

**Step 3: Verify rollback**
```bash
npm start
# Test app functionality
```

**Step 4: Document issues**
Create GitHub issue or note what went wrong for future reference

---

## 🆘 Emergency Contacts

### If Nothing Works

1. **Check Expo Status**
   - https://status.expo.dev

2. **Check Supabase Status**
   - https://status.supabase.com

3. **Community Support**
   - Expo Discord: https://chat.expo.dev
   - Supabase Discord: https://discord.supabase.com
   - Stack Overflow: Tag `expo` or `supabase`

4. **Create Issue**
   - Expo: https://github.com/expo/expo/issues
   - Supabase: https://github.com/supabase/supabase/issues

---

## 📊 Diagnostic Commands

### Check Current State
```bash
# Xcode version
xcodebuild -version

# Available simulators
xcrun simctl list devices available

# Node/npm versions
node --version
npm --version

# Expo version
npx expo --version

# Package versions
npm list expo react-native @supabase/supabase-js
```

### Check Running Processes
```bash
# Check for running simulators
xcrun simctl list devices | grep Booted

# Check Metro bundler
lsof -i :8081

# Check Expo dev server
lsof -i :19000
```

### Clean Everything
```bash
# Nuclear option - clean everything
cd stepin-app
rm -rf node_modules
rm -rf ios android
rm -rf .expo
rm package-lock.json
npm cache clean --force
npm install
npx expo prebuild --clean
```

---

## 🔍 Verification Checklist

After resolving issues, verify:

- [ ] Correct simulator running (iOS 26.0 or 18.2)
- [ ] Dependencies installed correctly
- [ ] No TypeScript errors
- [ ] Metro bundler starts
- [ ] App launches in simulator
- [ ] No network errors in console
- [ ] Supabase connection works
- [ ] Authentication works
- [ ] Database queries work
- [ ] Navigation works
- [ ] Tests pass

---

## 📝 Reporting Issues

If you encounter a new issue:

1. **Document the error**
   - Full error message
   - Stack trace
   - Steps to reproduce

2. **Gather environment info**
   ```bash
   npx expo-env-info
   ```

3. **Check if it's known**
   - Search GitHub issues
   - Check Discord channels
   - Search Stack Overflow

4. **Create minimal reproduction**
   - Isolate the issue
   - Create simple test case
   - Share code if possible

---

**Remember:** Most issues can be resolved by:
1. Clearing caches
2. Reinstalling dependencies
3. Using correct simulator version
4. Checking environment variables

