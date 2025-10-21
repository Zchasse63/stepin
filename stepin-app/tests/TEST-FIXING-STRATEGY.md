# Test Fixing Strategy & Decision Criteria

**Core Principle:** Tests reveal what's broken in the application. When tests fail, fix the application code to match test expectations, NOT modify tests to lower expectations (unless tests are genuinely wrong about requirements).

---

## 🎯 Decision Flowchart

```
Test fails
    ↓
    ├─→ Is the test expecting a feature that SHOULD exist?
    │   ├─→ YES: Check if feature exists in component
    │   │   ├─→ Feature exists but missing testID
    │   │   │   └─→ ✅ FIX COMPONENT: Add testID
    │   │   ├─→ Feature exists but different API
    │   │   │   └─→ ⚠️ INVESTIGATE: Which API is correct?
    │   │   │       ├─→ Component API is correct
    │   │   │       │   └─→ ✅ FIX TEST: Update to match component
    │   │   │       └─→ Test API is correct
    │   │   │           └─→ ✅ FIX COMPONENT: Update API
    │   │   └─→ Feature doesn't exist
    │   │       └─→ ❓ DESIGN DECISION NEEDED
    │   │           ├─→ Feature should exist
    │   │           │   └─→ ✅ FIX COMPONENT: Implement feature
    │   │           └─→ Feature shouldn't exist
    │   │               └─→ ✅ FIX TEST: Remove assertion
    │   │
    │   └─→ NO: Test is wrong
    │       └─→ ✅ FIX TEST: Correct the test
    │
    └─→ Is the test data incomplete/incorrect?
        └─→ ✅ FIX TEST: Add missing data
```

---

## ✅ When to FIX COMPONENT

### 1. Missing testIDs
**Symptom:** Test expects `testID="foo"`, component doesn't have it

**Action:** Add testID to component
```typescript
// BEFORE (component)
<TouchableOpacity onPress={handlePress}>

// AFTER (component)
<TouchableOpacity testID="action-button" onPress={handlePress}>
```

**Examples:**
- StreakMilestoneModal - Added `testID="streak-milestone-modal"`
- ContactsSync - Added `testID="contacts-sync"`, `testID="sync-button"`

### 2. Feature exists but not exposed for testing
**Symptom:** Component has functionality but no way to test it

**Action:** Add testIDs or expose state for testing
```typescript
// Add testIDs to interactive elements
<TextInput testID="email-input" />
<Switch testID="toggle-switch" />
<Modal testID="modal-name" />
```

### 3. Missing required functionality
**Symptom:** Test expects feature that should exist but doesn't

**Action:** Implement the feature
```typescript
// Test expects onConfirm callback
// Component only has onPress
// → Add onConfirm to component
```

**⚠️ IMPORTANT:** Only implement if feature SHOULD exist. If unsure, STOP and ask user.

---

## ✅ When to FIX TEST

### 1. Test data incomplete
**Symptom:** Mock objects missing required properties

**Action:** Add missing properties to mocks
```typescript
// BEFORE (test)
const mockBadge = {
  id: 'badge-1',
  name: 'First Steps',
  // category missing - component needs it!
};

// AFTER (test)
const mockBadge = {
  id: 'badge-1',
  name: 'First Steps',
  category: 'steps' as const,  // ✅ ADDED
};
```

**Example:** BadgeCelebrationModal - Added missing `category` property

### 2. Test expects wrong API
**Symptom:** Component API changed, test not updated

**Action:** Update test to match current component API
```typescript
// BEFORE (test)
onSave={mockOnSave}  // Old API
expect.any(Date)     // Old format

// AFTER (test)
onConfirm={mockOnConfirm}  // ✅ Current API
expect.any(String)         // ✅ Current format
```

**Example:** TimePickerModal - Changed `onSave` → `onConfirm`, `Date` → `String`

### 3. Test missing required props
**Symptom:** Component requires prop, test doesn't provide it

**Action:** Add required prop to test
```typescript
// BEFORE (test)
<SettingRow label="Language" value="English" />
// Missing required 'variant' prop!

// AFTER (test)
<SettingRow label="Language" value="English" variant="disclosure" />
```

### 4. Test expects feature that shouldn't exist
**Symptom:** Test is over-specified or testing implementation details

**Action:** Remove incorrect assertions
```typescript
// BEFORE (test)
expect(component.state.internalCounter).toBe(5);  // Testing internal state

// AFTER (test)
expect(getByText('Count: 5')).toBeTruthy();  // Test visible behavior
```

**⚠️ RARE:** Only do this when certain the test is wrong. Default to fixing component.

---

## ❓ When to STOP and ASK USER

### Design Decisions Required

**Stop immediately if:**
1. Test expects feature that doesn't exist AND you're unsure if it should
2. Conflicting requirements between test and component design
3. Trade-off between testability and UX (e.g., native vs custom components)
4. Unclear whether test or component is "correct"

**Examples:**
- TimePickerModal: Custom picker (testable) vs Native picker (better UX)
- Complex state management: Should component expose internal state for testing?
- API design: Should callback return Date or string?

**What to do:**
1. Document the situation
2. Present options with pros/cons
3. Ask user for decision
4. DO NOT proceed with "best guess"

---

## 🚨 RED FLAGS: You're Lowering Expectations

**STOP if you find yourself doing any of these:**

❌ Removing test assertions for UI elements
```typescript
// BAD
// expect(getByTestId('hour-picker')).toBeTruthy();  // Commented out
```

❌ Commenting out tests that "don't work"
```typescript
// BAD
// it('should toggle AM/PM', () => { ... });  // Skipped
```

❌ Changing testIDs in tests instead of adding them to components
```typescript
// BAD - Changed test to match missing testID
expect(getByTestId('button')).toBeTruthy();  // Was 'save-button'
```

❌ Removing feature tests because "component doesn't have it"
```typescript
// BAD - Removed entire test suite
// describe('Time Selection', () => { ... });  // Deleted
```

❌ Simplifying tests to make them pass
```typescript
// BAD - Lowered expectations
expect(mockOnConfirm).toHaveBeenCalled();  // Was: toHaveBeenCalledWith('09:30')
```

**If you catch yourself doing any of these → STOP and reconsider!**

---

## ✅ GREEN FLAGS: You're Fixing Correctly

**Good signs you're on the right track:**

✅ Adding testIDs to components
```typescript
// GOOD - Component updated
<Modal testID="timepicker-modal">
```

✅ Fixing mock data to include required properties
```typescript
// GOOD - Test data completed
const mockBadge = { ...existingProps, category: 'steps' };
```

✅ Updating test API to match component API (when component is correct)
```typescript
// GOOD - Test updated to match component
onConfirm={mockOnConfirm}  // Component uses onConfirm
```

✅ Adding missing props to test cases
```typescript
// GOOD - Test now provides required prop
<SettingRow variant="disclosure" label="Language" />
```

✅ Fixing async timing issues
```typescript
// GOOD - Proper async handling
await waitFor(() => expect(getByText('Loaded')).toBeTruthy());
```

---

## 📋 Step-by-Step Process

### Before Fixing Any Test:

1. **Read the test failure carefully**
   - What is the test expecting?
   - What is actually happening?
   - What's the error message?

2. **Understand the intent**
   - Why does this test exist?
   - What user behavior is it verifying?
   - Is this a critical feature?

3. **Check the component**
   - Does the component have this feature?
   - Is it just missing a testID?
   - Is the API different?

4. **Apply the decision flowchart**
   - Follow the flowchart above
   - Default to fixing component
   - Stop if unsure

5. **Make the fix**
   - Fix component OR fix test (not both arbitrarily)
   - Document why you chose that approach
   - Verify the fix works

6. **Verify no regression**
   - Run the test again
   - Check related tests
   - Ensure fix doesn't break other things

---

## 🎓 Case Studies

### Case Study 1: StreakMilestoneModal ✅ CORRECT

**Failure:** `Unable to find element with testID: streak-milestone-modal`

**Analysis:**
- Test expects testID
- Component has Modal but no testID
- Feature exists, just needs testID

**Fix:** Added testID to component
```typescript
<Modal testID="streak-milestone-modal">
```

**Result:** ✅ 3/3 tests passing

**Lesson:** Missing testIDs → Fix component

---

### Case Study 2: BadgeCelebrationModal ✅ CORRECT

**Failure:** `Cannot read properties of undefined (reading 'charAt')`

**Analysis:**
- Component code: `badge.category.charAt(0)`
- Test mock missing `category` property
- Test data incomplete

**Fix:** Added missing property to test mock
```typescript
const mockBadge = { ...props, category: 'steps' as const };
```

**Result:** ✅ 2/2 tests passing

**Lesson:** Incomplete test data → Fix test

---

### Case Study 3: TimePickerModal ⚠️ DESIGN DECISION

**Failure:** `Unable to find element with testID: hour-picker`

**Analysis:**
- Test expects custom time picker with individual controls
- Component uses native DateTimePicker
- Trade-off: Testability vs UX

**Decision Required:**
- Custom picker (testable) OR
- Native picker (better UX)

**Resolution:** User chose native picker

**Fix:** Rewrite tests to match native picker capabilities
- Test modal visibility ✅
- Test callbacks ✅
- Don't test time selection (native component) ✅

**Lesson:** Design conflicts → Stop and ask user

---

## 📊 Success Metrics

**Track these metrics to ensure quality:**

- **Component fixes:** Number of testIDs added, features implemented
- **Test fixes:** Number of incomplete mocks fixed, API updates
- **Design decisions:** Number of times we stopped to ask (good!)
- **Regressions:** Number of tests that broke after fixes (should be 0)

**Red flag metrics:**
- Tests removed or commented out (should be 0)
- Assertions removed (should be minimal, well-justified)
- Tests simplified without user approval (should be 0)

---

## 🔄 Continuous Improvement

**After each batch of test fixes:**

1. Review what types of issues were found
2. Update this strategy if new patterns emerge
3. Document new case studies
4. Refine decision criteria based on experience

**This document is living and should evolve with the project.**

---

**Last Updated:** 2025-10-18
**Version:** 1.0
**Status:** Active - Use for all test fixing work

