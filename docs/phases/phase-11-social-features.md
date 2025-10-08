# Phase 11: Non-Competitive Social Features (Week 13-14)

[← Previous: Phase 10 - Weather & Audio](phase-10-weather-audio.md) | [Back to README](README.md) | [Next: Phase 12 - Advanced Features →](phase-12-advanced-features.md)

---

## Overview

This phase implements non-competitive social features: buddy connections, activity feed, and kudos system. Focus is on support over competition, encouragement over comparison.

**Timeline**: Week 13-14 (10-12 days)  
**Dependencies**: Phase 1-10 (Complete MVP with all core features)  
**Philosophy**: NO leaderboards, NO rankings, NO performance comparison

---

## Impact Analysis

### Existing Features Affected
- **Database**: Add buddies, activity_feed, kudos tables
- **Navigation**: Add Buddies/Feed tab
- **Walk Completion**: Optional prompt to share walk
- **Profile**: Add social stats (buddy count)

### Non-Breaking Integration Strategy
- Social features are 100% optional
- App works fully without any social interaction
- Default visibility: Buddies only (not public)
- Can delete posts anytime
- Can remove buddies anytime

---

## Acceptance Criteria

### Buddy System
- [ ] **AC1**: Users can send buddy requests by email
- [ ] **AC2**: Pending requests appear with Accept/Decline buttons
- [ ] **AC3**: Accepted buddies appear in buddy list
- [ ] **AC4**: Can remove buddies anytime
- [ ] **AC5**: Buddy relationships are bidirectional

### Activity Feed
- [ ] **AC6**: Feed shows buddy activities (walks, milestones, streaks)
- [ ] **AC7**: Activities show feeling emoji, not performance metrics
- [ ] **AC8**: Can give kudos (positive-only reactions)
- [ ] **AC9**: Kudos count visible, but not who gave them
- [ ] **AC10**: Can delete own posts anytime

### Privacy
- [ ] **AC11**: Default visibility: Buddies only
- [ ] **AC12**: Can set per-post visibility (Private/Buddies/Public)
- [ ] **AC13**: Private posts never visible to anyone
- [ ] **AC14**: No leaderboards or rankings anywhere

---

## Implementation Tasks

### Section 11.1: Database Schema

#### Task 11.1.1: Create Social Tables
**Augment Code Prompt**:
```
Execute database migration for social features:

```sql
-- Buddies table (user connections)
CREATE TABLE public.buddies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buddy_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, buddy_id)
);

-- Activity feed table
CREATE TABLE public.activity_feed (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('walk_completed', 'streak_milestone', 'goal_achieved')),
  activity_data jsonb NOT NULL,
  visibility text NOT NULL DEFAULT 'buddies' CHECK (visibility IN ('private', 'buddies', 'public')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Kudos table (positive reactions)
CREATE TABLE public.kudos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id uuid REFERENCES public.activity_feed(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(activity_id, user_id)
);

-- Indexes
CREATE INDEX idx_buddies_user_id ON public.buddies(user_id);
CREATE INDEX idx_buddies_buddy_id ON public.buddies(buddy_id);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX idx_kudos_activity_id ON public.kudos(activity_id);

-- RLS Policies
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

-- Buddies policies
CREATE POLICY "Users can view own buddy connections"
  ON public.buddies FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

CREATE POLICY "Users can create buddy requests"
  ON public.buddies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own buddy requests"
  ON public.buddies FOR UPDATE
  USING (auth.uid() = buddy_id AND status = 'pending');

CREATE POLICY "Users can delete own buddy connections"
  ON public.buddies FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Activity feed policies
CREATE POLICY "Users can view buddy activities"
  ON public.activity_feed FOR SELECT
  USING (
    visibility = 'public' OR
    (visibility = 'buddies' AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.buddies
        WHERE (user_id = auth.uid() AND buddy_id = activity_feed.user_id AND status = 'accepted')
           OR (buddy_id = auth.uid() AND user_id = activity_feed.user_id AND status = 'accepted')
      )
    )) OR
    (visibility = 'private' AND user_id = auth.uid())
  );

CREATE POLICY "Users can create own activities"
  ON public.activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON public.activity_feed FOR DELETE
  USING (auth.uid() = user_id);

-- Kudos policies
CREATE POLICY "Users can view kudos"
  ON public.kudos FOR SELECT
  USING (true);

CREATE POLICY "Users can give kudos"
  ON public.kudos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own kudos"
  ON public.kudos FOR DELETE
  USING (auth.uid() = user_id);
```

Verification:
- All tables created successfully
- RLS policies active
- Indexes improve query performance
- Unique constraints prevent duplicates
```

---

### Section 11.2: Social Store

#### Task 11.2.1: Create Social Store
**File**: `lib/store/socialStore.ts`

**Augment Code Prompt**:
```
Create Zustand store for social features:

Import:
```typescript
import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
```

Define types:
```typescript
interface Buddy {
  id: string;
  user_id: string;
  buddy_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  buddy_profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: 'walk_completed' | 'streak_milestone' | 'goal_achieved';
  activity_data: any;
  visibility: 'private' | 'buddies' | 'public';
  created_at: string;
  user_profile: {
    display_name: string;
    avatar_url: string | null;
  };
  kudos_count: number;
  user_gave_kudos: boolean;
}
```

Store interface:
```typescript
interface SocialStore {
  buddies: Buddy[];
  pendingRequests: Buddy[];
  activityFeed: ActivityFeedItem[];
  loading: boolean;
  error: string | null;
  
  loadBuddies: (userId: string) => Promise<void>;
  sendBuddyRequest: (buddyEmail: string) => Promise<void>;
  acceptBuddyRequest: (requestId: string) => Promise<void>;
  declineBuddyRequest: (requestId: string) => Promise<void>;
  removeBuddy: (buddyId: string) => Promise<void>;
  
  loadActivityFeed: (userId: string) => Promise<void>;
  postActivity: (activity: Omit<ActivityFeedItem, 'id' | 'created_at'>) => Promise<void>;
  deleteActivity: (activityId: string) => Promise<void>;
  
  giveKudos: (activityId: string) => Promise<void>;
  removeKudos: (activityId: string) => Promise<void>;
  
  clearError: () => void;
}
```

Implement methods:

loadBuddies:
- Query buddies table for user_id = userId, status = 'accepted'
- Join with profiles to get buddy details
- Query for buddy_id = userId, status = 'pending' (incoming requests)
- Set buddies and pendingRequests state

sendBuddyRequest:
- Query profiles for email
- If not found, throw error
- Insert into buddies table with status 'pending'

acceptBuddyRequest:
- Update buddies table, set status = 'accepted'
- Reload buddies

declineBuddyRequest:
- Delete from buddies table

removeBuddy:
- Delete from buddies table
- Reload buddies

loadActivityFeed:
- Query activity_feed with RLS (automatically filters by visibility)
- Join with profiles for user details
- Left join with kudos to get count and user's kudos
- Order by created_at DESC
- Limit 50

postActivity:
- Insert into activity_feed
- Reload feed

deleteActivity:
- Delete from activity_feed
- Reload feed

giveKudos:
- Insert into kudos table
- Reload feed (to update count)

removeKudos:
- Delete from kudos table
- Reload feed

Verification:
- All methods work without errors
- RLS policies enforced
- Buddy requests work bidirectionally
- Activity feed respects visibility
- Kudos count updates correctly
```

---

### Section 11.3: Social UI Components

#### Task 11.3.1: Create Buddy List Screen
**File**: `app/(tabs)/buddies.tsx`

**Augment Code Prompt**:
```
Create Buddies tab screen:

Layout:
1. Pending Requests section (if any):
   - Orange accent color
   - Swipeable Accept/Decline buttons
   - Show requester avatar and name

2. Buddy List:
   - FlatList of accepted buddies
   - 60px circular avatar
   - Display name (16pt)
   - "Last active" status (12pt gray)

3. FloatingActionButton:
   - "+" icon
   - Opens AddBuddyModal

4. Empty State:
   - Icon: Feather "users"
   - Message: "Walking is better with friends!"
   - Subtitle: "Invite someone to join you"
   - Button: "Add Buddy"

Features:
- Pull-to-refresh
- Search bar to filter buddies
- Tap buddy to view their profile (future)

Verification:
- Pending requests appear at top
- Accept/Decline buttons work
- Buddy list displays correctly
- Empty state shows when no buddies
- Add buddy modal opens
```

#### Task 11.3.2: Create Activity Feed Screen
**File**: `app/(tabs)/feed.tsx`

**Augment Code Prompt**:
```
Create Activity Feed screen:

Layout:
- FlatList of activity cards
- Each card:
  * User avatar (48px)
  * Display name + activity description
  * Timestamp (e.g., "2 hours ago")
  * Kudos button (heart icon)
  * Kudos count
  * Visibility icon (lock/globe)

Activity descriptions:
- walk_completed: "completed a walk" + feeling emoji
- streak_milestone: "reached a [X] day streak"
- goal_achieved: "achieved their weekly goal"

Kudos button:
- Heart icon (filled if user gave kudos)
- Tap to toggle kudos
- Show count next to icon

Empty state:
- Icon: Feather "activity"
- Message: "Your buddies haven't shared any walks yet"

Features:
- Pull-to-refresh
- Infinite scroll (load more)
- Skeleton loaders while loading

Verification:
- Feed loads buddy activities
- Kudos button toggles correctly
- Count updates immediately
- Empty state shows when no activities
- Visibility respected (only see allowed posts)
```

#### Task 11.3.3: Create Post Activity Modal
**File**: `components/PostActivityModal.tsx`

**Augment Code Prompt**:
```
Create modal for sharing walks:

Form fields:

1. Feeling Selector (required):
   - 5 emoji buttons: 😣 😐 🙂 😊 🤩
   - Labels: Tough / OK / Good / Great / Amazing
   - Selected state: larger, colored background

2. Optional Note:
   - TextInput, 200 character limit
   - Placeholder: "How was your walk? (optional)"
   - Character counter

3. Visibility Toggle:
   - Segmented control: Private / Buddies / Public
   - Default: Buddies
   - Icons: lock / people / globe

4. Walk Summary (read-only):
   - Duration: "45 minutes"
   - Distance (if GPS tracked)
   - NO step count (reduces comparison)

Buttons:
- "Share Walk" (primary)
- "Cancel" (secondary)

Verification:
- Feeling selector required
- Note optional
- Visibility defaults to Buddies
- Share button posts to activity feed
- Modal dismisses after posting
```

---

### Section 11.4: Integration Points

#### Task 11.4.1: Add Social Tab to Navigation
**File**: `app/(tabs)/_layout.tsx`

**Augment Code Prompt**:
```
Add Buddies tab to navigation:

Position: Between Map and Profile

```typescript
<Tab.Screen
  name="buddies"
  options={{
    title: 'Buddies',
    headerTitle: 'Your Buddies',
    tabBarIcon: ({ focused, color, size }) => (
      <Feather 
        name="users" 
        size={size} 
        color={focused ? Colors.primary : color} 
      />
    ),
  }}
/>
```

Tab order:
1. Today
2. History
3. Map
4. Buddies (new)
5. Profile

Verification:
- Tab appears in correct position
- Icon displays correctly
- Navigation works
```

#### Task 11.4.2: Integrate with Walk Completion
**File**: `app/(tabs)/index.tsx`

**Augment Code Prompt**:
```
Add optional share prompt after walk completion:

After GoalCelebrationModal closes:

1. Check AsyncStorage for 'prompt_share_walks' preference
2. If enabled (default), show PostActivityModal
3. Pass walk data: duration, distance, date
4. Add checkbox: "Don't ask me again"
   - Updates AsyncStorage if checked

User can always manually share from Profile later

Verification:
- Prompt appears after goal met
- Can be dismissed
- "Don't ask again" persists
- Walk data pre-filled in modal
```

---

## Testing Checklist

### Buddy System
- [ ] Send buddy request by email
- [ ] Receive buddy request (pending)
- [ ] Accept buddy request
- [ ] Decline buddy request
- [ ] Remove buddy
- [ ] Search for non-existent email (error handling)

### Activity Feed
- [ ] Post walk with feeling emoji
- [ ] View buddy activities in feed
- [ ] Give kudos to activity
- [ ] Remove kudos
- [ ] Delete own post
- [ ] Verify visibility (private not visible to buddies)

### Privacy
- [ ] Private posts not visible to anyone
- [ ] Buddies-only posts visible to buddies
- [ ] Public posts visible to all
- [ ] Can't see non-buddy activities
- [ ] Kudos anonymous (don't show who gave them)

---

## Success Metrics

### Adoption
- **Target**: 30%+ users add at least 1 buddy
- **Measurement**: Users with buddy_count > 0

### Engagement
- **Target**: 20%+ users post at least 1 activity per week
- **Measurement**: Activity feed posts per user

### Retention
- **Target**: Users with buddies have 20% higher retention
- **Measurement**: Compare retention with/without buddies

---

## Next Steps

After Phase 11 completion:
1. Test social features with beta users
2. Collect feedback on non-competitive approach
3. Proceed to **Phase 12: Advanced Features**

---

**Phase 11 Status**: Ready for implementation  
**Estimated Completion**: 10-12 days with AI assistance

