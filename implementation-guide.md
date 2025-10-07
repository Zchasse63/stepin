# Implementation Strategy for Augment Code

[← Back to README](README.md)

---

## Overview

This guide explains how to effectively use this development plan with Augment Code (or any AI coding assistant) to build the Stepin MVP systematically and efficiently.

---

## How to Use This Plan with Augment Code

### 1. Start with Foundation (Phase 1)

- Feed the project setup prompt first
- Then provide the database schema
- Then implement authentication
- **Test each piece before moving forward**

**Why this order matters**: Each subsequent phase builds on the foundation. Authentication must work before you can track user-specific data. The database schema must be in place before any data operations.

### 2. Build Incrementally (Phases 2-4)

- Implement one screen at a time
- Test thoroughly before moving to next
- Keep the mission in mind: simple, encouraging, non-competitive
- Review each component for grandmother-friendliness

**Key principle**: Don't move to the next phase until the current phase's acceptance criteria are met. This prevents cascading issues and makes debugging easier.

### 3. Iterate Based on Testing (Phase 5)

- Use the testing checklist systematically
- Fix bugs before adding polish
- Get real user feedback if possible
- Adjust based on actual usage patterns

**Testing strategy**: Manual testing is essential for this MVP. Automated tests can come later, but human testing ensures the "feel" is right for the target audience.

### 4. Prepare for Launch (Phase 6)

- Don't skip the store preparation
- Quality over speed at this stage
- Test on real devices, not just simulator
- Get beta testers (TestFlight/Internal Testing)

**Launch readiness**: The difference between a good MVP and a failed one is often in the polish and preparation, not the features.

---

## Prompting Strategy for AI Development

### For Each Feature, Provide Augment Code With:

1. **Context**: "We're building Stepin, a non-competitive wellness walking app for beginners"
2. **Specific requirement**: Copy the relevant prompt from this document
3. **Design principles**: Reference grandmother-friendly, encouraging, simple
4. **Technical constraints**: "Use Supabase, Zustand, Expo Router, React Native 0.81+"
5. **Acceptance criteria**: How to verify it works correctly

### Example Prompt Structure

```
Context: Building Stepin wellness walking app - non-competitive, beginner-friendly

Task: Create the Today screen showing step count and progress

Requirements:
[Copy relevant section from Phase 2.2]

Design principles:
- Grandmother-friendly: large text, clear hierarchy
- Encouraging: celebrate all progress
- Simple: no complexity or confusion

Technical stack:
- React Native 0.81 with Expo
- Fetch from Supabase
- Zustand for state
- Reanimated for animations

Acceptance criteria:
[List from Phase 2.2]

Please implement this component with all requirements.
```

### Tips for Effective Prompts

**Be Specific**: Instead of "make it look nice," say "use 80pt font for step count, SF Pro font, soft green color (#4CAF50)"

**Provide Examples**: Reference similar apps or UI patterns when describing desired behavior

**Iterate**: If the first implementation isn't quite right, provide specific feedback: "The animation is too fast, slow it to 300ms" rather than "make it smoother"

**Test Incrementally**: Ask for one component at a time, test it, then move to the next

---

## Key Reminders for AI Development

### 1. Stay Mission-Focused
Every feature should align with non-competitive, encouraging values. If a feature creates comparison or pressure, it doesn't belong in Stepin.

### 2. Simplicity First
When in doubt, make it simpler. The target user is someone who finds other fitness apps overwhelming. Less is more.

### 3. Test Incrementally
Don't build everything before testing anything. Build → Test → Fix → Next Feature.

### 4. Real Devices
Test on physical iOS and Android devices. Simulators miss important issues like:
- HealthKit/Health Connect behavior
- Performance on older devices
- Touch target sizes
- Battery usage
- Notification behavior

### 5. Accessibility
Every user should be able to use this, regardless of ability:
- VoiceOver/TalkBack support
- Dynamic Type support
- High contrast mode
- Reduced motion respect
- Minimum 44x44pt tap targets

### 6. Privacy
No user data leaves their control without explicit permission:
- All notifications are local
- No analytics without opt-in
- Data export available
- Account deletion works completely

### 7. Performance
Users should never wait:
- 60fps animations
- <2s load times
- <100ms interaction response
- Smooth scrolling with 100+ items

---

## Common Pitfalls to Avoid

### 1. Over-Engineering
**Problem**: Adding features "just in case" or building for scale before validation  
**Solution**: Stick to the MVP scope. PowerSync comes after validation, not before.

### 2. Ignoring Edge Cases
**Problem**: Only testing the happy path  
**Solution**: Use the testing checklist. Test offline, no permissions, large datasets, etc.

### 3. Skipping Real Device Testing
**Problem**: "It works in the simulator"  
**Solution**: Test on actual iOS and Android devices regularly.

### 4. Inconsistent Design
**Problem**: Each screen looks different  
**Solution**: Create reusable components. Use a consistent design system.

### 5. Poor Error Messages
**Problem**: Technical errors shown to users  
**Solution**: Map all errors to friendly, actionable messages.

### 6. Forgetting the Target User
**Problem**: Building for tech-savvy users  
**Solution**: Regularly ask "Would my grandmother understand this?"

---

## Working with Augment Code: Best Practices

### Start Each Session with Context
```
We're working on Stepin, a non-competitive wellness walking app.
Currently on Phase [X], implementing [feature].
Tech stack: React Native, Expo, Supabase, Zustand.
Target user: Beginners, seniors, people who find fitness apps intimidating.
```

### Break Large Tasks into Smaller Ones
Instead of "Build the History screen," break it down:
1. Create the layout structure
2. Implement the time period selector
3. Add the summary stats cards
4. Build the calendar heat map component
5. Implement the bar chart
6. Add the walks list
7. Connect to Supabase data
8. Add loading and empty states

### Provide Feedback Clearly
**Good**: "The step count animation should use spring physics with damping: 15, stiffness: 150"  
**Bad**: "Make the animation feel more natural"

**Good**: "The encouraging message should change when steps > 5000 to 'Look at you go! 🎉'"  
**Bad**: "The messages aren't motivating enough"

### Ask for Explanations
When Augment Code suggests an approach you don't understand, ask:
- "Why did you choose this approach over [alternative]?"
- "What are the tradeoffs of this implementation?"
- "How does this handle [edge case]?"

### Verify Against Acceptance Criteria
After each implementation, go through the acceptance criteria:
```
Let's verify the acceptance criteria for Phase 2:
- [ ] Today screen displays current step count from HealthKit/Health Connect
- [ ] Progress ring animates smoothly
...
```

---

## Debugging Strategy

### When Something Doesn't Work

1. **Isolate the Issue**: Is it the UI, data fetching, state management, or platform-specific?

2. **Check the Basics**:
   - Are environment variables set?
   - Is Supabase connection working?
   - Are permissions granted?
   - Is the device online?

3. **Use Logging Strategically**:
   ```typescript
   console.log('[HealthService] Fetching steps for date:', date);
   console.log('[HealthService] Result:', steps);
   ```

4. **Test on Both Platforms**: iOS and Android often behave differently

5. **Simplify**: Remove complexity until it works, then add back piece by piece

### When Performance is Poor

1. **Profile First**: Use React DevTools Profiler to find bottlenecks
2. **Check Re-renders**: Are components re-rendering unnecessarily?
3. **Optimize Images**: Are images properly sized and compressed?
4. **Lazy Load**: Are you loading data that's not visible?
5. **Memoize**: Are expensive calculations being repeated?

---

## Phase-by-Phase Tips

### Phase 1: Foundation
- Get Supabase working first before building UI
- Test authentication thoroughly - it's the foundation
- Don't skip RLS policies - security matters from day one

### Phase 2: Step Tracking
- Test health permissions on real devices immediately
- Build the manual entry fallback first - it's easier to test
- The Today screen is the most important screen - spend time on it

### Phase 3: History
- Start with mock data to build the UI
- Charts are complex - use a library (react-native-svg)
- Performance matters here - test with 100+ walks

### Phase 4: Profile
- Settings are straightforward but numerous - be systematic
- Test notification scheduling thoroughly
- Data export is important for user trust

### Phase 5: Polish
- Animations should enhance, not distract
- Test reduced motion settings
- Error handling is not optional

### Phase 6: Launch
- Screenshots matter - make them beautiful
- App Store copy is marketing - get feedback
- Beta test with real users before public launch

---

## Success Metrics Tracking

### During Development
- [ ] Each phase completed within estimated time
- [ ] All acceptance criteria met before moving forward
- [ ] No critical bugs in completed phases
- [ ] Performance targets met (load time, fps, etc.)

### After Launch
- [ ] 100+ active users within 8 weeks
- [ ] 60%+ day-7 retention
- [ ] 4.5+ star rating
- [ ] <1% crash rate
- [ ] Positive feedback about non-competitive approach

---

## Getting Help

### When Stuck
1. Review the original specification in the master document
2. Check if similar functionality exists elsewhere in the app
3. Look for examples in the React Native/Expo documentation
4. Ask Augment Code for alternative approaches
5. Simplify the requirement if possible

### When Unsure About Design
1. Reference the design principles (grandmother-friendly, encouraging, simple)
2. Look at iOS Human Interface Guidelines
3. Test with someone from the target demographic
4. When in doubt, choose the simpler option

---

## Next Steps After MVP

Once the MVP is validated (see [Future Roadmap](future-roadmap.md)):

1. **Integrate PowerSync** for offline-first architecture
2. **Add buddy system** for gentle accountability
3. **Implement achievements** (non-competitive)
4. **Build community features** (beginner-only spaces)
5. **Add GPS route tracking**

But remember: **Validate first, scale second.**

---

[← Back to README](README.md) | [View Database Schema →](database-schema.sql)

