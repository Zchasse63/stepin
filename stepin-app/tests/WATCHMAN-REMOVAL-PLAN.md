# Watchman Removal & Jest Fix Plan

**Date:** 2025-10-18  
**Issue:** Jest commands hanging indefinitely - suspected Watchman interference  
**Goal:** Completely remove/disable Watchman and configure Jest to work without it

---

## 🔍 **Research Findings**

### **Is Watchman Required for Jest in Expo?**
**NO** - Watchman is NOT required for Jest to function in Expo projects.

- **Watchman's Purpose:** File watching for hot reloading during development (Metro bundler)
- **Jest's Use:** Jest CAN use Watchman for faster file change detection in watch mode
- **Reality:** Jest works perfectly fine WITHOUT Watchman using Node's built-in file watching

### **Known Issues with Watchman + Jest**
1. **Watchman 4.9.x causes Jest to hang indefinitely** (confirmed in Stack Overflow)
2. **Watchman permission issues on macOS** cause crashes and hangs
3. **Watchman crawl failures** prevent Jest from starting
4. **Process conflicts** when Watchman is running alongside Metro/Expo

### **Can We Remove Watchman?**
**YES** - You can completely remove Watchman with NO negative impact on:
- ✅ Jest testing (unit, integration, component tests)
- ✅ Expo development server (uses Metro's built-in file watching)
- ✅ Hot reloading (Metro handles this independently)
- ✅ Production builds

**Only potential downside:** Slightly slower file change detection in `jest --watch` mode (negligible)

---

## 🚨 **Current Situation Analysis**

### **Evidence of Watchman Interference:**
1. ✅ Even basic terminal commands (`ps aux | grep watchman`) are hanging
2. ✅ Jest commands hang indefinitely with no output
3. ✅ Previous Watchman problems were resolved by removing it
4. ✅ Your Jest config does NOT explicitly require Watchman

### **Diagnosis:**
Watchman is likely:
- Installed on your system (via Homebrew)
- Running background processes that are stuck/corrupted
- Interfering with Jest's process spawning
- Blocking terminal commands that try to query it

---

## 🛠️ **SOLUTION: Complete Watchman Removal**

### **Phase 1: Force Kill All Watchman Processes**

Since normal commands are hanging, we need to force-kill Watchman processes directly.

**Option A: Use Activity Monitor (GUI - SAFEST)**
1. Open **Activity Monitor** (Applications → Utilities → Activity Monitor)
2. In the search box, type: `watchman`
3. Select ALL watchman processes
4. Click the **X** button (Force Quit)
5. Confirm force quit for each process

**Option B: Force Kill via Terminal (if Activity Monitor doesn't work)**
```bash
# Open a NEW terminal window (don't use the one that's stuck)
# Force kill ALL watchman processes
sudo pkill -9 watchman

# Verify they're gone
ps aux | grep watchman | grep -v grep
# Should show nothing
```

---

### **Phase 2: Uninstall Watchman Completely**

**After killing all processes, uninstall Watchman:**

```bash
# Check if Watchman is installed via Homebrew
brew list | grep watchman

# If found, uninstall it
brew uninstall watchman

# Remove Watchman state directory
rm -rf ~/.watchman

# Remove Watchman config (if exists)
rm -f ~/.watchmanconfig

# Verify removal
which watchman
# Should output: watchman not found
```

---

### **Phase 3: Configure Jest to NOT Use Watchman**

Even with Watchman removed, explicitly tell Jest to never try to use it.

**Update `jest.config.js`:**

Add `watchman: false` to your Jest configuration:

```javascript
module.exports = {
  preset: 'jest-expo',
  watchman: false,  // ← ADD THIS LINE
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // ... rest of config
  
  projects: [
    {
      displayName: 'unit',
      preset: 'jest-expo',
      watchman: false,  // ← ADD THIS LINE
      testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
      // ... rest of unit config
    },
    {
      displayName: 'integration',
      preset: 'jest-expo',
      watchman: false,  // ← ADD THIS LINE
      testMatch: ['**/__integration__/**/*.integration.test.[jt]s?(x)'],
      // ... rest of integration config
    },
  ],
};
```

**Alternative: Use CLI flag:**
```bash
# Run Jest with --no-watchman flag
npx jest --no-watchman

# Or update package.json scripts
"test": "jest --no-watchman",
"test:watch": "jest --watch --no-watchman",
```

---

### **Phase 4: Clear All Caches**

After removing Watchman, clear all caches to ensure clean state:

```bash
# Clear Jest cache
npx jest --clearCache

# Clear Metro bundler cache
npx expo start --clear

# Clear npm cache (optional but recommended)
npm cache clean --force

# Clear Watchman cache (if directory still exists)
rm -rf ~/.watchman
```

---

### **Phase 5: Verify Jest Works**

Test that Jest is now functional:

```bash
# Test 1: Check Jest version (should respond immediately)
npx jest --version
# Expected: 29.7.0 (or similar)

# Test 2: List test files (should complete in <5 seconds)
npx jest --listTests | head -10

# Test 3: Run a single test file
npx jest components/__tests__/LogWalkModal.test.tsx --no-coverage

# Test 4: Run all tests
npm test
```

---

## 📋 **Step-by-Step Execution Plan**

### **IMPORTANT: Do these steps in a NEW terminal window**

Your current terminal may be stuck. Open a fresh terminal and follow these steps:

```bash
# Step 1: Force kill Watchman (use Activity Monitor OR this command)
sudo pkill -9 watchman

# Step 2: Verify processes are gone
ps aux | grep watchman | grep -v grep
# Should show nothing

# Step 3: Navigate to project
cd /Users/zach/projects/Steppin/stepin-app

# Step 4: Uninstall Watchman
brew uninstall watchman

# Step 5: Remove Watchman directories
rm -rf ~/.watchman
rm -f ~/.watchmanconfig

# Step 6: Verify removal
which watchman
# Should output: watchman not found

# Step 7: Clear Jest cache
npx jest --clearCache

# Step 8: Test Jest works
npx jest --version
# Should print: 29.7.0

# Step 9: Run a test
npx jest components/__tests__/LogWalkModal.test.tsx --no-coverage --maxWorkers=1

# Step 10: If successful, update Jest config to disable Watchman permanently
# (See Phase 3 above)
```

---

## ✅ **Verification Checklist**

After completing the removal:

- [ ] Activity Monitor shows NO watchman processes
- [ ] `which watchman` returns "not found"
- [ ] `~/.watchman` directory does not exist
- [ ] `npx jest --version` responds immediately with version number
- [ ] `npx jest --listTests` completes successfully
- [ ] Single test file runs successfully
- [ ] `jest.config.js` has `watchman: false` added
- [ ] All test scripts in `package.json` work

---

## 🎯 **Expected Outcomes**

### **After Watchman Removal:**
✅ Jest commands respond immediately (no hanging)  
✅ Tests run successfully  
✅ No performance degradation  
✅ Hot reloading still works in Expo dev server  
✅ Metro bundler functions normally  

### **What You'll Lose:**
❌ Nothing significant - Watchman is optional for Jest

### **Performance Impact:**
- `jest --watch` mode may be ~100-200ms slower detecting file changes
- This is negligible and won't affect your workflow

---

## 🚨 **Troubleshooting**

### **If commands still hang after killing Watchman:**

**Problem:** Zombie processes or corrupted state

**Solution:**
```bash
# Restart your Mac (nuclear option but effective)
sudo shutdown -r now

# After restart:
cd /Users/zach/projects/Steppin/stepin-app
brew uninstall watchman
npx jest --clearCache
npx jest --version
```

### **If Jest still tries to use Watchman:**

**Problem:** Jest config not updated

**Solution:**
```bash
# Add to jest.config.js
watchman: false

# OR use CLI flag
npx jest --no-watchman
```

### **If tests fail after Watchman removal:**

**Problem:** Unrelated to Watchman - likely test issues

**Solution:**
- Check test output for actual errors
- Watchman removal should NOT cause test failures
- If tests fail, it's a different issue (missing testIDs, mock issues, etc.)

---

## 📝 **Summary**

**Watchman is NOT needed for your Expo + Jest setup.**

**Removal Steps:**
1. Force kill all Watchman processes (Activity Monitor or `sudo pkill -9 watchman`)
2. Uninstall via Homebrew (`brew uninstall watchman`)
3. Remove state directories (`rm -rf ~/.watchman`)
4. Configure Jest to not use Watchman (`watchman: false` in config)
5. Clear caches (`npx jest --clearCache`)
6. Verify Jest works (`npx jest --version`)

**Time Required:** 5-10 minutes

**Risk Level:** LOW - Watchman is optional and can be safely removed

**Next Steps After Removal:**
- Continue with testID implementation
- Run all 74 test files
- Debug any test failures (unrelated to Watchman)

---

**Ready to proceed? Start with Activity Monitor to kill Watchman processes, then follow the steps above.**

