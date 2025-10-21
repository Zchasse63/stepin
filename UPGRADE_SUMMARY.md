# Steppin App Upgrade Summary
## Quick Reference Guide

---

## 🎯 What We're Doing

**Problem:** iOS 18.4 Simulator has a networking bug causing "Network request failed" errors with Supabase

**Solution:** Upgrade to iOS 26.0 simulator + update dependencies

**Time Required:** ~20 minutes

**Risk Level:** LOW ✅

---

## 📊 Version Changes

| Component | Current | Target | Change Type |
|-----------|---------|--------|-------------|
| iOS Simulator | 18.4 (broken) | 26.0 | Major (fixes bug) |
| Expo SDK | 54.0.12 | 54.0.13 | Patch |
| Supabase JS | 2.58.0 | 2.75.0 | Minor |
| React Native | 0.81.4 | 0.81.4 | No change |
| React | 19.1.0 | 19.2.0 | Minor |

---

## 🚀 Quick Start (Automated)

### Option 1: Run Automated Script
```bash
cd /Users/zach/projects/Steppin
./upgrade-execute.sh
```

The script will:
1. ✅ Create iOS 26.0 simulator
2. ✅ Update all dependencies
3. ✅ Run tests
4. ✅ Start dev server for manual testing

---

## 🔧 Quick Start (Manual)

### Step 1: Create iOS 26.0 Simulator (2 minutes)
```bash
# Create simulator
xcrun simctl create "iPhone 16 Plus (iOS 26.0)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Plus" \
  "com.apple.CoreSimulator.SimRuntime.iOS-26-0"

# Verify
xcrun simctl list devices | grep "iPhone 16 Plus (iOS 26.0)"
```

### Step 2: Update Dependencies (5 minutes)
```bash
cd stepin-app

# Update Expo
npm install expo@54.0.13

# Update Supabase
npm install @supabase/supabase-js@2.75.0

# Update other packages
npm update
```

### Step 3: Test (10 minutes)
```bash
# Start dev server
npm start

# Press 'i' for iOS simulator
# Select "iPhone 16 Plus (iOS 26.0)"
# Verify no network errors
```

---

## ✅ Success Criteria

### You'll know it worked when:
1. ✅ App launches in iOS 26.0 simulator
2. ✅ No "Network request failed" errors in console
3. ✅ Supabase authentication works
4. ✅ Database queries succeed
5. ✅ App navigates normally

### Expected Console Output:
```
LOG  🔍 [AuthStore] Checking for existing session...
LOG  [INFO] Stopping background sync service (no user)
LOG  🔄 [RootLayout] Navigation effect triggered
```

### NO errors like:
```
ERROR  [TypeError: Network request failed]  ❌
ERROR  [AuthRetryableFetchError: Network request failed]  ❌
```

---

## 🔄 Rollback Plan

### If iOS 26.0 has issues:
```bash
# Use iOS 18.2 instead (confirmed working)
xcrun simctl create "iPhone 16 Plus (iOS 18.2)" \
  "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Plus" \
  "com.apple.CoreSimulator.SimRuntime.iOS-18-2"
```

### If dependencies cause issues:
```bash
cd stepin-app
git checkout package-lock.json
npm ci
```

---

## 📝 Pre-Flight Checklist

Before starting:
- [ ] All changes committed to git
- [ ] Created backup branch: `git checkout -b backup/pre-upgrade`
- [ ] Read UPGRADE_PLAN.md for full details
- [ ] Have 20 minutes available
- [ ] iOS 26.0 runtime installed (verify with `xcrun simctl list runtimes`)

---

## 🎓 Why These Changes?

### iOS 26.0 Simulator
- **Why:** iOS 18.4 has confirmed HTTP/3 networking bug
- **Risk:** Low - iOS 26.0 is latest stable
- **Benefit:** Fixes all network connectivity issues

### Expo SDK 54.0.13
- **Why:** Patch release with bug fixes
- **Risk:** Very low - patch version
- **Benefit:** Latest bug fixes and improvements

### Supabase JS 2.75.0
- **Why:** 17 minor versions behind (2.58 → 2.75)
- **Risk:** Low - no breaking changes in minor versions
- **Benefit:** Bug fixes, performance improvements, better error handling

### React Native 0.81.4 (NO CHANGE)
- **Why:** Expo SDK 54 officially supports 0.81.4
- **Risk:** N/A - not upgrading
- **Benefit:** Stability, avoid unnecessary changes

---

## 📞 Need Help?

### Documentation
- Full details: `UPGRADE_PLAN.md`
- Execution script: `upgrade-execute.sh`

### Known Issues
- [iOS 18.4 Bug - Apple Forums](https://developer.apple.com/forums/thread/777999)
- [Supabase Network Issues](https://github.com/orgs/supabase/discussions/35943)

### Community Support
- Expo Discord: https://chat.expo.dev
- Supabase Discord: https://discord.supabase.com

---

## 🎯 Next Steps After Upgrade

1. **Test thoroughly** - Auth, database, navigation
2. **Run E2E tests** - `npm run test:e2e`
3. **Test on physical device** - Verify production behavior
4. **Commit changes** - If everything works
5. **Update team** - Share results

---

## 📈 Expected Timeline

| Phase | Duration | Can Skip? |
|-------|----------|-----------|
| iOS Simulator Setup | 2 min | No |
| Dependency Updates | 5 min | No |
| Testing | 10 min | No |
| E2E Tests | 15 min | Yes (optional) |
| **Total** | **17-32 min** | - |

---

## 🔒 Safety Notes

1. ✅ **All changes are reversible** - Git + npm make rollback easy
2. ✅ **No breaking changes** - Only minor/patch updates
3. ✅ **Tested by community** - Thousands using these versions
4. ✅ **Fallback available** - iOS 18.2 works if 26.0 has issues
5. ✅ **Production unaffected** - Only affects local development

---

**Ready to proceed?** Run `./upgrade-execute.sh` or follow manual steps above.

**Questions?** Check `UPGRADE_PLAN.md` for comprehensive details.

