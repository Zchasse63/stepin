# RNTL Test Implementation Guide

This guide provides templates, patterns, and automation strategies for implementing all 74 RNTL component tests.

---

## 📋 Implementation Status

**Current Status**: 1/74 tests complete (LogWalkModal)  
**Remaining**: 73 tests  
**Estimated Effort**: 40-60 hours for complete implementation  

---

## 🎯 Recommended Implementation Strategy

### Option 1: Manual Implementation (Highest Quality)
- **Time**: 40-60 hours
- **Approach**: Write each test file individually following the prompts
- **Pros**: Highest test quality, catches edge cases, deep understanding
- **Cons**: Time-intensive

### Option 2: Template-Based Implementation (Balanced)
- **Time**: 20-30 hours
- **Approach**: Use templates for similar components, customize for specific needs
- **Pros**: Faster, consistent patterns, good coverage
- **Cons**: May miss component-specific edge cases

### Option 3: AI-Assisted Batch Generation (Fastest)
- **Time**: 10-15 hours
- **Approach**: Generate test files in batches, review and refine
- **Pros**: Very fast, covers basics quickly
- **Cons**: Requires careful review, may need significant refinement

---

## 🔧 Step-by-Step Process

### Step 1: Add testIDs to Components (Required First)

Before writing any test, add testIDs to the component. Use this pattern:

```typescript
// Example: EditWalkModal.tsx
<Modal testID="edit-walk-modal" visible={visible}>
  <TextInput testID="steps-input" value={steps} />
  <TextInput testID="distance-input" value={distance} />
  <TextInput testID="duration-input" value={duration} />
  <TouchableOpacity testID="date-picker-button" onPress={showDatePicker}>
  <TouchableOpacity testID="time-picker-button" onPress={showTimePicker}>
  <TouchableOpacity testID="save-button" onPress={handleSave}>
  <TouchableOpacity testID="cancel-button" onPress={onClose}>
</Modal>
```

**TestID Naming Convention**:
- Inputs: `{field-name}-input` (e.g., `steps-input`, `email-input`)
- Buttons: `{action}-button` (e.g., `save-button`, `cancel-button`, `submit-button`)
- Modals: `{component-name}-modal` (e.g., `edit-walk-modal`, `add-buddy-modal`)
- Lists: `{item-type}-list` (e.g., `walks-list`, `buddies-list`)
- Cards: `{card-type}-card` (e.g., `activity-card`, `stats-card`)

### Step 2: Create Test File Structure

Use this template for all test files:

```typescript
/**
 * Unit tests for {ComponentName}
 * Tests {brief description}
 * {PRIORITY} PRIORITY - {reason}
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ComponentName } from '../ComponentName';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

// Add other mocks as needed
jest.mock('../../lib/store/authStore');
jest.spyOn(Alert, 'alert');

describe('ComponentName', () => {
  const mockColors = {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    secondaryBackground: '#F2F2F7',
    secondaryText: '#8E8E93',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ colors: mockColors });
  });

  describe('Rendering', () => {
    it('should render component when visible', () => {
      const { getByTestId } = render(<ComponentName visible={true} />);
      expect(getByTestId('component-testid')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle button press', () => {
      const mockCallback = jest.fn();
      const { getByTestId } = render(<ComponentName onPress={mockCallback} />);
      
      fireEvent.press(getByTestId('button-testid'));
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const { getByTestId } = render(<ComponentName />);
      
      fireEvent.press(getByTestId('submit-button'));
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('required')
      );
    });
  });

  describe('Success States', () => {
    it('should call callback on success', async () => {
      const mockCallback = jest.fn();
      const { getByTestId } = render(<ComponentName onSuccess={mockCallback} />);
      
      // Perform action
      fireEvent.press(getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled();
      });
    });
  });

  describe('Error States', () => {
    it('should handle errors gracefully', async () => {
      // Mock error scenario
      const { getByTestId } = render(<ComponentName />);
      
      fireEvent.press(getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('error')
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null props', () => {
      const { queryByTestId } = render(<ComponentName data={null} />);
      expect(queryByTestId('component-testid')).toBeTruthy();
    });
  });
});
```

### Step 3: Component-Specific Test Scenarios

Refer to the prompts file for specific test scenarios for each component. Key patterns:

**Modal Components** (LogWalkModal, EditWalkModal, AddBuddyModal, etc.):
- Visibility based on `visible` prop
- Form field rendering
- Input validation (required, format, range)
- Save/cancel actions
- Loading states
- Success/error alerts

**Display Components** (StatsCard, ProfileHeader, StreakDisplay, etc.):
- Data rendering
- Conditional rendering (with/without data)
- Loading states
- Formatting (numbers, dates, etc.)

**List Components** (WalksList, BuddyListItem, ActivityCard, etc.):
- Empty states
- Item rendering
- User interactions (press, swipe, delete)
- Sorting/filtering

**Interactive Components** (GoalSlider, TimePeriodSelector, KudosButton, etc.):
- Value changes
- Callbacks
- Visual states (active/inactive)
- Animations

---

## 🚀 Batch Implementation Approach

### Batch 1: Critical Modals (Prompts 2-4, 5, 8)
**Components**: EditWalkModal, WalkDetailsSheet, WalksList, GoalAdjustmentModal, AddBuddyModal  
**Estimated Time**: 6-8 hours  
**Pattern**: Form validation + modal interactions

### Batch 2: Goal & Celebration (Prompts 6-7, 22-23)
**Components**: GoalSlider, GoalCelebrationModal, StreakMilestoneModal, BadgeCelebrationModal  
**Estimated Time**: 4-6 hours  
**Pattern**: User engagement + animations

### Batch 3: Social Features (Prompts 9-11, 27-30)
**Components**: BuddyListItem, PendingRequestCard, ActivityCard, PostActivityModal, KudosButton, BuddyPreview, InviteFriend  
**Estimated Time**: 6-8 hours  
**Pattern**: Social interactions + list items

### Batch 4: Display Components (Prompts 12-15)
**Components**: ProfileHeader, StreakDisplay, StatsGrid, InsightsCard  
**Estimated Time**: 4-5 hours  
**Pattern**: Data display + conditional rendering

### Batch 5: Analytics & Charts (Prompts 16-21)
**Components**: CalendarHeatMap, DayDetailsCard, StepsBarChart, SummaryStatsGrid, InsightsSection, TimePeriodSelector  
**Estimated Time**: 6-8 hours  
**Pattern**: Data visualization + complex rendering

### Batch 6: Settings & Config (Prompts 31-35)
**Components**: SettingsSection, SettingRow, HealthSettingsCard, TimePickerModal, HistoricalImportModal  
**Estimated Time**: 5-6 hours  
**Pattern**: Settings UI + toggles

### Batch 7: Utility Components (Prompts 24-26, 36-42)
**Components**: ConfettiCelebration, NotificationPermissionBanner, PermissionBanner, AnimatedButton, ProfileButton, HealthPermissionDeniedBanner, OfflineBanner, ConflictResolutionModal, HeartRateZone, HeartRateAnalytics  
**Estimated Time**: 6-8 hours  
**Pattern**: Utility + edge cases

### Batch 8: Specialized Components (Prompts 43-51)
**Components**: QRCodeDisplay, QRScanner, BuddySearch, BuddySearchResult, ContactsSync, MapView, SentryTestButton, OnboardingStep, ProgressDots  
**Estimated Time**: 5-6 hours  
**Pattern**: Specialized features

### Batch 9: Screens (Prompts 52-61)
**Components**: TodayScreen, BuddiesScreen, ProfileScreen, HistoryScreen, InsightsScreen, SignInScreen, SignUpScreen, ForgotPasswordScreen, OnboardingScreen, MapScreen  
**Estimated Time**: 10-12 hours  
**Pattern**: Integration tests + complex state

---

## 📊 Progress Tracking

Update `RNTL-TEST-PROGRESS.md` after each test file:

```markdown
| 2 | EditWalkModal | `components/__tests__/EditWalkModal.test.tsx` | 28 | ✅ Complete - All tests passing |
```

Status options:
- 📋 Not Started
- ⏳ In Progress
- ✅ Complete - All tests passing
- ⚠️ Complete - Some tests failing
- ❌ Blocked - Missing dependencies

---

## 🐛 Common Issues & Solutions

### Issue 1: Component doesn't have testIDs
**Solution**: Add testIDs to component first before writing tests

### Issue 2: Mock not working
**Solution**: Check jest.setup.js for existing mocks, ensure mock path is correct

### Issue 3: Async tests timing out
**Solution**: Increase waitFor timeout, ensure promises are properly mocked

### Issue 4: Component not rendering
**Solution**: Check if component requires specific props, mock all dependencies

---

## 📝 Next Steps

1. **Review this guide** and choose implementation strategy
2. **Start with Batch 1** (Critical Modals) - highest ROI
3. **Add testIDs systematically** before writing tests
4. **Run tests frequently** to catch issues early
5. **Update progress tracker** after each component
6. **Document blockers** in progress tracker

---

## 🎯 Success Criteria

- [ ] All 74 test files created
- [ ] All components have testIDs
- [ ] Minimum 80% of tests passing
- [ ] Progress tracker updated
- [ ] Known issues documented
- [ ] Test coverage report generated


