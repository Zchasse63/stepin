# Phase 3: History & Progress Tracking (Week 3)

[← Previous: Phase 2 - Core Step Tracking](phase-2-step-tracking.md) | [Back to README](README.md) | [Next: Phase 4 - Profile & Settings →](phase-4-profile-settings.md)

---

## Overview

This phase adds the ability for users to view their walking history, track progress over time, and receive encouraging insights about their journey. The History screen provides visual feedback through charts and statistics.

**Timeline**: Week 3  
**Dependencies**: Phase 2 (Step tracking and data storage must be working)

---

## 3.1 History Screen

### Augment Code Prompt

```
Create the History screen (/app/(tabs)/history.tsx) for viewing past walks and progress:

Layout:

1. Header:
   - Title: "Your Walking Journey"
   - Time period selector: Week / Month / Year tabs

2. Summary Stats (top section):
   - Total steps this period
   - Total walks logged
   - Average steps per day
   - Days goal was met (count + percentage)
   - Display as clean card grid

3. Calendar Heat Map (Week view):
   - 7 days showing as circles with color intensity based on steps
   - Today highlighted
   - Tap date to see details

4. Bar Chart (Month/Year view):
   - Daily step counts as bars
   - Horizontal line showing goal
   - Bars colored based on goal achievement
   - Interactive: tap bar to see day details

5. Walks List (scrollable):
   - Chronological list of logged walks
   - Each item shows:
     * Date and time
     * Step count
     * Duration and distance
     * Small badge if goal was met that day
   - Swipe to delete walk
   - Tap to see full walk details

Components to create:

/components/CalendarHeatMap.tsx:
- 7-day scrollable calendar
- Each day is a circle with color intensity
- Legend: light gray (0%), light green (25%), medium green (50%), dark green (75%), gold (100%+)
- Tap handler for date selection

/components/StepsBarChart.tsx:
- Bar chart using react-native-svg
- Bars for each day in period
- Y-axis: steps (auto-scaled)
- X-axis: dates (abbreviated)
- Goal line overlay
- Touch handler for bar selection

/components/WalkListItem.tsx:
- List item component for walk display
- Left: Date circle indicator
- Center: Steps, duration, distance
- Right: Badge if goal met
- Swipeable using react-native-gesture-handler

/components/WalkDetailsSheet.tsx:
- Bottom sheet showing walk details
- All walk metadata
- Edit button (navigate to edit screen)
- Delete button with confirmation

Data fetching:
- On mount: fetch walks from Supabase for selected period
- Use React Query for caching and efficient fetching
- Paginate walks list (20 per page)
- Refresh on pull-to-refresh

Calculations:
- Aggregate stats from walks array
- Calculate streaks from daily_stats
- Cache calculations for performance

Empty states:
- No walks yet: Friendly illustration + "Start your first walk today!"
- No walks this period: "No walks this [week/month/year]. Check another time period."

Loading states:
- Skeleton screens for charts while loading
- Shimmer effect on list items

Accessibility:
- Chart data announced by screen reader
- Alternative text descriptions for visual data
```

---

## 3.2 Progress Insights

### Augment Code Prompt

```
Add insights section to History screen that provides encouraging analysis:

Create /components/InsightsCard.tsx:
- Container for insight
- Icon (checkmark, trend-up, flame, etc.)
- Title (bold, concise)
- Description (1-2 sentences)
- Appears above walks list

Generate insights based on data:

1. Positive reinforcement (always show at least one):
   - "You've walked [X] days this week!"
   - "Your longest streak was [X] days!"
   - "You've taken over [X] steps this month!"
   - "You're [X]% more active than last week!"

2. Gentle nudges (optional, only if supportive):
   - "You're close to a [X] day streak. Keep it up!"
   - "Just [X] more steps to beat your record!"
   - Never negative: no "You missed X days" or "You're behind"

3. Milestones:
   - "🎉 You've logged 10 walks!"
   - "🏆 You reached your goal 7 days in a row!"
   - "⭐ You've walked 100,000 total steps!"

Logic:
- Calculate insights from walks and stats data
- Prioritize most encouraging insights
- Limit to 2-3 insights at a time
- Rotate insights weekly to stay fresh

Design:
- Cards with subtle background colors
- Icons from @expo/vector-icons
- Tap insight to see more details (optional)
```

---

## Acceptance Criteria

- [ ] History screen shows accurate walk data
- [ ] Charts render correctly for week/month/year
- [ ] Calendar heat map is interactive and accurate
- [ ] Walks list is performant with 100+ walks
- [ ] Insights are encouraging and never negative
- [ ] Swipe to delete works smoothly
- [ ] All data comes from Supabase
- [ ] Time period selector switches views correctly
- [ ] Summary stats calculate accurately
- [ ] Empty states display appropriately
- [ ] Loading states show while fetching data
- [ ] Pull to refresh updates the data
- [ ] Walk details sheet displays all information
- [ ] Pagination works for long walk lists

---

[← Previous: Phase 2 - Core Step Tracking](phase-2-step-tracking.md) | [Back to README](README.md) | [Next: Phase 4 - Profile & Settings →](phase-4-profile-settings.md)

