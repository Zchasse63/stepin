# RNTL Testing Execution Plan

## 🎯 Objective
Add testIDs to all 60 components and verify all 74 RNTL test files pass.

---

## ⚠️ Current Blocker

**Jest tests are hanging** - likely due to:
- Metro bundler running in background
- Watchman interference
- Expo dev server conflict

### **Solution: Clean Environment First**

```bash
# Stop all Expo/Metro processes
pkill -f "expo" || true
pkill -f "metro" || true  
pkill -f "watchman" || true

# Clear Jest cache
cd stepin-app
npx jest --clearCache

# Verify no processes running
ps aux | grep -E "expo|metro|watchman"
```

---

## 📋 Step-by-Step Execution Plan

### **STEP 1: Environment Validation** (5 min)

```bash
# Clean environment
./scripts/clean-test-env.sh  # Create this script with commands above

# Try running a single test
npm test -- --testNamePattern="should render" --maxWorkers=1 --no-coverage

# If successful, try full component test
npm test -- LogWalkModal.test.tsx --maxWorkers=1 --no-coverage
```

**Expected Output:**
- LogWalkModal should have PASSING tests (testIDs already present)
- Other components should FAIL with "Unable to find element with testID" errors

---

### **STEP 2: Phase 1 - Critical Walk Logging** (2-3 hours)

#### **2.1: Add TestIDs to StepCircle.tsx**

```typescript
// File: components/StepCircle.tsx
// Add these testIDs:

<View testID="step-circle" style={styles.container}>
  <Text testID="step-count-text" style={styles.stepCount}>
    {steps.toLocaleString()}
  </Text>
  <Text testID="goal-text" style={styles.goal}>
    of {goal.toLocaleString()}
  </Text>
  <Text testID="percentage-text" style={styles.percentage}>
    {percentage}%
  </Text>
</View>
```

**Test:**
```bash
npm test -- StepCircle.test.tsx --maxWorkers=1 --no-coverage
```

#### **2.2: Add TestIDs to StepsBarChart.tsx**

```typescript
// File: components/StepsBarChart.tsx

<View testID="steps-bar-chart" style={styles.container}>
  {data.length === 0 ? (
    <Text testID="no-data-message">No data available</Text>
  ) : (
    <>
      {data.map((item, index) => (
        <View key={index} testID={`bar-${index}`} style={styles.bar}>
          {/* bar content */}
        </View>
      ))}
      <View testID="chart-legend" style={styles.legend}>
        {/* legend content */}
      </View>
    </>
  )}
</View>
```

**Test:**
```bash
npm test -- StepsBarChart.test.tsx --maxWorkers=1 --no-coverage
```

#### **2.3: Add TestIDs to WalkListItem.tsx**

```typescript
// File: components/WalkListItem.tsx

<View testID={`walk-item-${walk.id}`} style={styles.container}>
  <Text testID="walk-date">{formatDate(walk.date)}</Text>
  <Text testID="walk-steps">{walk.steps.toLocaleString()} steps</Text>
  <Text testID="walk-distance">{walk.distance} km</Text>
  <Text testID="walk-duration">{walk.duration} min</Text>
  <TouchableOpacity testID="edit-button" onPress={onEdit}>
    <Text>Edit</Text>
  </TouchableOpacity>
  <TouchableOpacity testID="delete-button" onPress={onDelete}>
    <Text>Delete</Text>
  </TouchableOpacity>
</View>
```

**Test:**
```bash
npm test -- WalkListItem.test.tsx --maxWorkers=1 --no-coverage
```

#### **2.4: Run All Phase 1 Tests**

```bash
npm test -- --testPathPattern="(LogWalkModal|StepCircle|StepsBarChart|WalkListItem)" --maxWorkers=1 --no-coverage
```

**Success Criteria:** All 4 components pass all tests (~91 tests total)

---

### **STEP 3: Phase 2 - Goal Management** (1-2 hours)

Follow same pattern for:
1. GoalSlider.tsx
2. GoalAdjustmentModal.tsx
3. GoalCelebrationModal.tsx

**Test after each:**
```bash
npm test -- GoalSlider.test.tsx --maxWorkers=1 --no-coverage
npm test -- GoalAdjustmentModal.test.tsx --maxWorkers=1 --no-coverage
npm test -- GoalCelebrationModal.test.tsx --maxWorkers=1 --no-coverage
```

**Success Criteria:** All 3 components pass (~60 tests total)

---

### **STEP 4: Phase 3 - Social Features** (2-3 hours)

Components:
1. BuddyListItem.tsx
2. ActivityCard.tsx
3. KudosButton.tsx
4. AddBuddyModal.tsx

**Batch test:**
```bash
npm test -- --testPathPattern="(BuddyListItem|ActivityCard|KudosButton|AddBuddyModal)" --maxWorkers=1 --no-coverage
```

**Success Criteria:** All 4 components pass (~57 tests total)

---

### **STEP 5: Phases 4-7 - HIGH Priority** (4-6 hours)

**19 components total** - Use TESTID-CHECKLIST.md as reference

**Batch testing by phase:**
```bash
# Phase 4: Profile & Display
npm test -- --testPathPattern="(ProfileHeader|StatsCard|StatsGrid|StreakDisplay)" --maxWorkers=1

# Phase 5: History & Analytics  
npm test -- --testPathPattern="(CalendarHeatMap|DayDetailsCard|TimePeriodSelector|SummaryStatsGrid|EditWalkModal|EmptyState)" --maxWorkers=1

# Phase 6: Gamification
npm test -- --testPathPattern="(BadgeCelebration|StreakMilestone|Confetti|PermissionBanner|NotificationPermission)" --maxWorkers=1

# Phase 7: Social Interactions
npm test -- --testPathPattern="(PendingRequestCard|BuddyPreview|PostActivityModal|InviteFriend)" --maxWorkers=1
```

**Success Criteria:** All 19 components pass (~196 tests total)

---

### **STEP 6: Phases 8-9 - MEDIUM Priority** (3-4 hours)

**12 components total**

```bash
# Phase 8: Settings
npm test -- --testPathPattern="(SettingsSection|SettingRow|HealthSettingsCard|TimePickerModal|HistoricalImportModal)" --maxWorkers=1

# Phase 9: Specialized
npm test -- --testPathPattern="(AnimatedButton|ProfileButton|HealthPermissionDenied|OfflineBanner|ConflictResolution|HeartRateZone|HeartRateAnalytics)" --maxWorkers=1
```

**Success Criteria:** All 12 components pass (~102 tests total)

---

### **STEP 7: Phase 10 - LOW Priority Screens** (4-6 hours)

**19 components total** - Screens require more testIDs

```bash
# Phase 10A: QR & Search
npm test -- --testPathPattern="(QRCodeDisplay|QRScanner|BuddySearch|BuddySearchResult|ContactsSync)" --maxWorkers=1

# Phase 10B: Map & Utility
npm test -- --testPathPattern="(MapView|SentryTestButton)" --maxWorkers=1

# Phase 10C: Onboarding
npm test -- --testPathPattern="onboarding/(OnboardingStep|ProgressDots)" --maxWorkers=1

# Phase 10D: Main Screens
npm test -- --testPathPattern="(tabs)/(index|buddies|history|insights)" --maxWorkers=1
npm test -- app/__tests__/profile.test.tsx --maxWorkers=1

# Phase 10E: Auth Screens
npm test -- --testPathPattern="(auth)/(sign-in|sign-up|forgot-password|onboarding)" --maxWorkers=1
npm test -- --testPathPattern="(tabs)/map" --maxWorkers=1
```

**Success Criteria:** All 19 components pass (~134 tests total)

---

### **STEP 8: Full Test Suite Validation** (10 min)

```bash
# Run ALL tests
npm test -- --maxWorkers=2 --no-coverage 2>&1 | tee full-test-results.txt

# Check results
grep -E "Tests:.*passed" full-test-results.txt
grep -E "PASS|FAIL" full-test-results.txt | wc -l
```

**Success Criteria:**
- ✅ All 74 test files pass
- ✅ ~580-600 total tests passing
- ✅ 0 failures
- ✅ 100% pass rate

---

### **STEP 9: Generate Coverage Report** (5 min)

```bash
npm test -- --coverage --coverageReporters=text --coverageReporters=html

# View coverage
open coverage/index.html
```

**Target Coverage:**
- Statements: 70%+
- Branches: 60%+
- Functions: 70%+
- Lines: 70%+

---

## 🔧 Troubleshooting Guide

### **Problem: Tests Still Hanging**

```bash
# Nuclear option - kill everything
killall -9 node
killall -9 watchman

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear all caches
npx jest --clearCache
watchman watch-del-all
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
```

### **Problem: Import Errors**

Check test file imports match actual component exports:
```typescript
// If component uses default export:
import LogWalkModal from '../LogWalkModal';

// If component uses named export:
import { LogWalkModal } from '../LogWalkModal';
```

### **Problem: Mock Errors**

Verify store mocks in test files match actual store structure:
```typescript
// Check actual store file
cat lib/store/authStore.ts

// Update mock to match
(useAuthStore as jest.Mock).mockReturnValue({
  user: mockUser,
  signIn: mockSignIn,
  // ... all actual store properties
});
```

### **Problem: TestID Not Found**

1. Verify testID was added to component
2. Check testID spelling matches test file exactly
3. Ensure component is actually rendering (check conditional logic)
4. Use `debug()` in test to see rendered output:

```typescript
const { debug } = render(<Component />);
debug(); // Prints entire component tree
```

---

## 📊 Progress Tracking

Create a simple tracking file:

```bash
# tests/progress-tracker.txt
Phase 1: [✅] 4/4 components - 91/91 tests passing
Phase 2: [🔄] 2/3 components - 40/60 tests passing  
Phase 3: [  ] 0/4 components - 0/57 tests passing
...
```

Update after each phase completion.

---

## ⏱️ Time Estimates

| Phase | Components | Est. Time | Tests |
|-------|-----------|-----------|-------|
| Setup & Validation | - | 30 min | - |
| Phase 1 | 4 | 2-3 hrs | 91 |
| Phase 2 | 3 | 1-2 hrs | 60 |
| Phase 3 | 4 | 2-3 hrs | 57 |
| Phases 4-7 | 19 | 4-6 hrs | 196 |
| Phases 8-9 | 12 | 3-4 hrs | 102 |
| Phase 10 | 19 | 4-6 hrs | 134 |
| Final Validation | - | 30 min | - |
| **TOTAL** | **61** | **17-25 hrs** | **~640** |

**Realistic Timeline:** 3-4 full working days

---

## 🎯 Success Metrics

- [ ] All 74 test files created ✅ (DONE)
- [ ] All 60 components have testIDs added
- [ ] All ~640 tests passing
- [ ] 0 test failures
- [ ] Coverage thresholds met (70%+ statements)
- [ ] No console errors during test runs
- [ ] Documentation updated (RNTL-TEST-PROGRESS.md)

---

## 📝 Next Steps After Completion

1. **Update Documentation**
   - Mark RNTL-TEST-PROGRESS.md as 100% complete
   - Update FINAL-SESSION-REPORT.md with completion date
   - Document any known issues or limitations

2. **CI/CD Integration**
   - Add RNTL tests to CI pipeline
   - Set up automated test runs on PR
   - Configure coverage reporting

3. **Maintenance**
   - Add testIDs to new components as they're created
   - Update tests when component behavior changes
   - Keep test patterns consistent

---

## 🚀 Ready to Start?

**Recommended First Command:**

```bash
# Clean environment and run validation
pkill -f "expo|metro|watchman" || true
cd stepin-app
npx jest --clearCache
npm test -- LogWalkModal.test.tsx --maxWorkers=1 --no-coverage --verbose
```

If LogWalkModal tests pass, you're ready to proceed with Phase 1!

If tests still hang, review the Troubleshooting Guide above.

Good luck! 🎉

