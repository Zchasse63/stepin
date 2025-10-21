# Accessibility Guidelines - Stepin Walking App
## Elderly-Friendly Design (60+ Demographic)

**Phase 4: Final Polish - Accessibility Testing & Compliance**

---

## Overview

This document provides comprehensive accessibility guidelines and testing procedures for the Stepin walking app, specifically optimized for users aged 60+.

---

## Design Principles

### 1. **Visual Accessibility**

#### Typography
- ✅ **Implemented**: 18pt body text (up from 17pt)
- ✅ **Implemented**: 140% line height for readability
- ✅ **Implemented**: SF Pro font system (iOS HIG compliant)
- ⚠️ **To Test**: Dynamic Type support (text scaling)

**Testing Checklist:**
- [ ] Enable largest text size in iOS Settings
- [ ] Verify all text scales appropriately
- [ ] Check that no text is truncated
- [ ] Ensure buttons don't break with larger text
- [ ] Test labels remain readable at all sizes

#### Color Contrast
- ✅ **Implemented**: Sage green (#7BA884) primary
- ✅ **Implemented**: Warm coral (#E8956F) accents
- ⚠️ **To Test**: WCAG AA compliance (4.5:1 for text, 3:1 for UI)

**Testing Checklist:**
- [ ] Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] Verify text/background contrast ratios
- [ ] Check button/background contrast
- [ ] Test icon visibility against backgrounds
- [ ] Verify status colors (success, error, warning)

**Minimum Contrast Ratios:**
- Normal text (18pt): 4.5:1
- Large text (24pt+): 3:0:1
- UI components: 3:1

---

### 2. **Touch Targets**

#### Size Standards
- ✅ **Implemented**: 60px primary buttons
- ✅ **Implemented**: 48px secondary buttons
- ✅ **Implemented**: 60px list items
- ✅ **Implemented**: 44px minimum (iOS HIG)

**Testing Checklist:**
- [ ] Test all buttons with finger (not stylus)
- [ ] Verify 8px spacing between adjacent targets
- [ ] Check that small icons have expanded tap areas
- [ ] Test slider handles (minimum 44x44)
- [ ] Verify toggle switches are easy to tap

**Component-Specific:**
```typescript
// Good: Expanded hit area for small icons
<Pressable hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
  <Icon size={20} />
</Pressable>

// Good: Minimum button size
const buttonStyle = {
  minHeight: 60, // Primary
  minWidth: 60,
  paddingHorizontal: 24,
};
```

---

### 3. **Screen Reader Support (VoiceOver)**

#### Current Implementation Status
- ⚠️ **Partial**: Basic accessibility labels exist
- ⚠️ **To Implement**: Comprehensive hints and states

**Testing Checklist:**
- [ ] Enable VoiceOver (Settings > Accessibility > VoiceOver)
- [ ] Navigate through each screen
- [ ] Verify all interactive elements are announced
- [ ] Check button purpose is clear
- [ ] Test form input labels
- [ ] Verify custom components have proper traits

#### Component Guidelines

**Buttons:**
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Start Walk"
  accessibilityHint="Begin tracking your walk"
  accessibilityRole="button"
>
  <Text>Start</Text>
</TouchableOpacity>
```

**Images:**
```typescript
<Image
  source={avatar}
  accessible={true}
  accessibilityLabel="Profile picture"
  accessibilityRole="image"
/>
```

**Interactive List Items:**
```typescript
<Pressable
  accessible={true}
  accessibilityLabel={`Walk on ${date}, ${distance} kilometers, ${duration} minutes`}
  accessibilityHint="Double tap to view details"
  accessibilityRole="button"
>
  {/* Content */}
</Pressable>
```

**Custom Components:**
```typescript
// Streak Hero Component
<View
  accessible={true}
  accessibilityLabel={`Current streak: ${streak} days`}
  accessibilityHint="Your walking streak shows consecutive days with activity"
  accessibilityRole="summary"
>
  {/* Streak display */}
</View>
```

**Form Inputs:**
```typescript
<TextInput
  accessible={true}
  accessibilityLabel="Daily step goal"
  accessibilityHint="Enter your target number of steps per day"
  accessibilityValue={{ text: `${value} steps` }}
/>
```

---

### 4. **Keyboard Navigation**

**Requirements for iPad/External Keyboard Users:**

- [ ] All interactive elements focusable
- [ ] Clear focus indicators (visual highlight)
- [ ] Logical tab order (top to bottom, left to right)
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate lists

**Testing:**
- [ ] Connect Bluetooth keyboard to iPad
- [ ] Navigate entire app using Tab/Shift+Tab
- [ ] Verify focus order makes sense
- [ ] Test modal focus trapping
- [ ] Check focus returns after modal close

---

### 5. **Motion & Animation**

#### Reduce Motion Support
- ⚠️ **To Implement**: Respect `AccessibilityInfo.isReduceMotionEnabled()`

**Testing Checklist:**
- [ ] Enable Reduce Motion (Settings > Accessibility > Motion)
- [ ] Verify animations are disabled/reduced
- [ ] Check transitions are instant or fade-only
- [ ] Test that functionality remains intact
- [ ] Verify critical feedback still visible

**Implementation:**
```typescript
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => subscription?.remove();
  }, []);

  return reduceMotion;
}

// In component:
const reduceMotion = useReduceMotion();
const animationDuration = reduceMotion ? 0 : 300;
```

---

## Testing Procedures

### **VoiceOver Testing Protocol**

#### 1. **Home Screen (Today Tab)**
- [ ] Screen title announced correctly
- [ ] StreakHero streak count and description
- [ ] Step circle progress announced with current/goal
- [ ] "Start Walk" button clear and actionable
- [ ] Quick actions swipe menu works
- [ ] All stats cards have descriptive labels

#### 2. **Progress Tab**
- [ ] Tab title "Progress" announced
- [ ] Key insights cards have full context
  - "This Week: 42,000 steps"
  - "Best Day: 8,500 steps on October 15th"
  - "Consistency: 85 percent"
  - "Goal Rate: 70 percent"
- [ ] Lifetime milestones announced with progress
- [ ] Charts have text alternatives

#### 3. **Map Tab**
- [ ] Map/List toggle states announced
- [ ] Date filter selection announced
- [ ] Route count announced
- [ ] In list view, each walk has full details
- [ ] Map markers have meaningful labels

#### 4. **Social Tab**
- [ ] Segmented control (Feed/Buddies) announced
- [ ] Buddy count in tab label
- [ ] Each feed item has full context
- [ ] "Send kudos" button clearly labeled
- [ ] Search field has proper label and hint

#### 5. **You Tab (Profile)**
- [ ] Profile picture announced
- [ ] Settings sections properly grouped
- [ ] Sliders announce current value
- [ ] Toggles announce on/off state
- [ ] Modal screens have proper titles
- [ ] Back navigation clear

---

### **Dynamic Type Testing**

**Text Size Variations to Test:**
1. Extra Small (xSmall)
2. Small
3. Medium (Default)
4. Large
5. Extra Large (xLarge)
6. Extra Extra Large (xxLarge)
7. Extra Extra Extra Large (xxxLarge) - Accessibility

**Components to Verify:**
- [ ] StreakHero (flame emoji and text)
- [ ] Step circle (numbers don't overflow)
- [ ] Buttons (text doesn't truncate)
- [ ] Cards (layout adapts)
- [ ] List items (multi-line if needed)
- [ ] Tab bar labels
- [ ] Modal headers
- [ ] Form labels and inputs

---

### **Color Blindness Testing**

**Test with simulators for:**
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Monochromacy (total color blindness)

**Tools:**
- [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/) (macOS)
- Color Oracle (cross-platform)
- iOS Accessibility Display Accommodations

**Verification:**
- [ ] Success/error states distinguishable without color
- [ ] Charts use patterns in addition to color
- [ ] Icons supplement color-coded information
- [ ] Status indicators have text labels

---

### **Elderly-Specific Usability Testing**

#### Target Users: Ages 60-75+

**Recruitment:**
- Recruit 5-10 participants aged 60+
- Mix of tech comfort levels (beginner to advanced)
- Include users with vision/motor impairments
- Include both iPhone and Android users

**Test Scenarios:**

1. **Onboarding**
   - [ ] Create account
   - [ ] Set daily goal
   - [ ] Grant permissions
   - [ ] Complete first walk

2. **Daily Use**
   - [ ] Start a walk
   - [ ] Check progress toward goal
   - [ ] View streak status
   - [ ] Compare with previous week

3. **Social Features**
   - [ ] Find and add a buddy
   - [ ] View buddy's recent walk
   - [ ] Send kudos
   - [ ] Post to activity feed

4. **Privacy**
   - [ ] Add a privacy zone
   - [ ] Change activity visibility
   - [ ] Verify zone on map

5. **Settings**
   - [ ] Change step goal
   - [ ] Enable weather alerts
   - [ ] Adjust notification time
   - [ ] Change theme preference

**Metrics to Track:**
- Task completion rate
- Time to complete
- Errors made
- Help requests
- User satisfaction (1-10 scale)
- Perceived difficulty (1-5 scale)

**Questions to Ask:**
- "Was the text easy to read?"
- "Were the buttons easy to tap?"
- "Did you understand what each button does?"
- "Was anything confusing or unclear?"
- "Would you use this daily?"

---

## Implementation Checklist

### **Critical (Must Fix)**
- [ ] Add accessibility labels to all interactive elements
- [ ] Ensure 60px+ touch targets for all primary actions
- [ ] Verify WCAG AA color contrast
- [ ] Support Dynamic Type scaling
- [ ] Test with VoiceOver on all screens

### **Important (Should Fix)**
- [ ] Respect Reduce Motion preference
- [ ] Add keyboard navigation support
- [ ] Provide text alternatives for charts
- [ ] Group related settings with headings
- [ ] Add accessibility hints for complex actions

### **Nice to Have (Enhancement)**
- [ ] Add voice commands for starting walks
- [ ] Provide audio feedback for milestones
- [ ] Offer high-contrast theme option
- [ ] Add haptic feedback patterns
- [ ] Support external switches

---

## Resources

### **Apple Guidelines**
- [iOS Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [UIAccessibility Documentation](https://developer.apple.com/documentation/uikit/uiaccessibility)

### **WCAG Standards**
- [WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### **Testing Tools**
- iOS VoiceOver (built-in)
- Accessibility Inspector (Xcode)
- Color Oracle (color blindness simulator)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### **React Native Resources**
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Expo Accessibility](https://docs.expo.dev/guides/accessibility/)

---

## Maintenance

**Ongoing Responsibilities:**

1. **Every New Feature**
   - Add accessibility labels
   - Test with VoiceOver
   - Verify touch targets
   - Check color contrast

2. **Monthly Review**
   - Test with latest iOS accessibility features
   - Review user feedback on usability
   - Update guidelines based on learnings

3. **Major Updates**
   - Conduct full accessibility audit
   - Test with real elderly users
   - Update documentation

---

## Contact & Support

For accessibility questions or to report issues:
- **Email**: accessibility@stepin.app
- **GitHub Issues**: Tag with `accessibility` label
- **Testing Volunteers**: Always welcome!

---

**Document Version**: 1.0
**Last Updated**: October 21, 2025
**Next Review**: January 2026
