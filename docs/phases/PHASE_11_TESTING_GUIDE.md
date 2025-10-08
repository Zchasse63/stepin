# Phase 11: Non-Competitive Social Features - Testing Guide

## Overview
This guide provides comprehensive testing procedures for Phase 11 social features including buddy connections, activity feed, and kudos system.

## Prerequisites
- Two test accounts with different email addresses
- Access to Supabase dashboard for database verification
- Test device or simulator with network connectivity

---

## 1. Buddy System Testing

### 1.1 Send Buddy Request
**Test Case**: Send a buddy request by email

**Steps**:
1. Navigate to Buddies tab
2. Tap the floating "+" button
3. Enter a valid email address of another user
4. Tap "Send Request"

**Expected Results**:
- ✅ Success alert: "Buddy Request Sent!"
- ✅ Modal closes automatically
- ✅ Request appears in recipient's "Pending Requests" section
- ✅ Database: New row in `buddies` table with `status = 'pending'`

**Edge Cases to Test**:
- Invalid email format → Error: "Please enter a valid email address"
- Non-existent email → Error: "User not found"
- Self-buddy request → Error: "You cannot send a buddy request to yourself"
- Duplicate request → Error: "Buddy request already sent"

### 1.2 Receive and Accept Buddy Request
**Test Case**: Accept an incoming buddy request

**Steps**:
1. Log in as recipient account
2. Navigate to Buddies tab
3. View pending request in orange card
4. Tap "Accept" button

**Expected Results**:
- ✅ Request moves from "Pending Requests" to "Your Buddies" list
- ✅ Buddy appears in sender's buddy list
- ✅ Database: `status` updated to `'accepted'`
- ✅ Bidirectional relationship works (both users see each other)

### 1.3 Decline Buddy Request
**Test Case**: Decline an incoming buddy request

**Steps**:
1. Log in as recipient account
2. Navigate to Buddies tab
3. View pending request
4. Tap "Decline" button

**Expected Results**:
- ✅ Request disappears from pending list
- ✅ Database: Row deleted from `buddies` table
- ✅ Sender does not see recipient in buddy list

### 1.4 Remove Buddy
**Test Case**: Remove an existing buddy

**Steps**:
1. Navigate to Buddies tab
2. Find an accepted buddy in the list
3. Tap the remove button (user-minus icon)
4. Confirm removal in alert

**Expected Results**:
- ✅ Buddy removed from list
- ✅ Database: Row deleted from `buddies` table
- ✅ Bidirectional removal (both users no longer see each other)
- ✅ Previous shared activities remain visible if set to "Public"

### 1.5 Search Functionality
**Test Case**: Search for buddies

**Steps**:
1. Navigate to Buddies tab with multiple buddies
2. Enter search term in search bar
3. Verify filtering works

**Expected Results**:
- ✅ List filters to matching buddies
- ✅ Search is case-insensitive
- ✅ Empty state shows if no matches

---

## 2. Activity Feed Testing

### 2.1 Post Walk Activity
**Test Case**: Share a completed walk

**Steps**:
1. Complete a walk (or use manual log)
2. PostActivityModal appears automatically
3. Select a feeling emoji (required)
4. Add optional note (max 200 characters)
5. Select visibility (Private/Buddies/Public)
6. Tap "Share Walk"

**Expected Results**:
- ✅ Success alert: "Walk Shared!"
- ✅ Activity appears in feed
- ✅ Walk summary shows duration and distance (NO step count)
- ✅ Feeling emoji displays correctly
- ✅ Note displays if provided
- ✅ Visibility icon shows correct setting
- ✅ Database: New row in `activity_feed` table

**Validation**:
- Cannot share without selecting feeling → Button disabled
- Character counter shows remaining characters
- Default visibility is "Buddies"

### 2.2 View Buddy Activities
**Test Case**: View activities from buddies

**Steps**:
1. Navigate to Feed tab
2. Pull to refresh
3. View activities from buddies

**Expected Results**:
- ✅ Activities from accepted buddies appear
- ✅ Activities sorted by most recent first
- ✅ User avatar and display name shown
- ✅ Timestamp shows relative time ("2h ago", "1d ago")
- ✅ Activity description formatted correctly
- ✅ Kudos count displays

### 2.3 Give and Remove Kudos
**Test Case**: Give kudos to buddy's activity

**Steps**:
1. Navigate to Feed tab
2. Find a buddy's activity
3. Tap the heart icon
4. Tap again to remove kudos

**Expected Results**:
- ✅ Heart fills with red color
- ✅ Kudos count increments by 1
- ✅ Optimistic update (instant UI feedback)
- ✅ Heart animation plays
- ✅ Tapping again removes kudos
- ✅ Count decrements by 1
- ✅ Database: Row added/removed from `kudos` table

**Validation**:
- Cannot give kudos to own activities → Button disabled
- Kudos are anonymous (no user attribution shown)

### 2.4 Delete Own Activity
**Test Case**: Delete a posted activity

**Steps**:
1. Navigate to Feed tab
2. Find your own activity
3. Tap trash icon
4. Confirm deletion

**Expected Results**:
- ✅ Activity removed from feed
- ✅ Database: Row deleted from `activity_feed` table
- ✅ Associated kudos also deleted (cascade)
- ✅ Only own activities show delete button

### 2.5 Empty State
**Test Case**: View feed with no activities

**Steps**:
1. Navigate to Feed tab with no buddy activities
2. View empty state

**Expected Results**:
- ✅ Activity icon displayed
- ✅ Message: "Your buddies haven't shared any walks yet"
- ✅ No error or loading state

---

## 3. Privacy Controls Testing

### 3.1 Private Visibility
**Test Case**: Post with private visibility

**Steps**:
1. Share a walk with visibility set to "Private"
2. Log in as buddy account
3. Check feed

**Expected Results**:
- ✅ Activity does NOT appear in buddy's feed
- ✅ Activity visible only to poster
- ✅ Lock icon shows on activity card

### 3.2 Buddies-Only Visibility
**Test Case**: Post with buddies-only visibility

**Steps**:
1. Share a walk with visibility set to "Buddies"
2. Log in as accepted buddy account
3. Check feed
4. Log in as non-buddy account
5. Check feed

**Expected Results**:
- ✅ Activity appears in accepted buddy's feed
- ✅ Activity does NOT appear in non-buddy's feed
- ✅ Users icon shows on activity card

### 3.3 Public Visibility
**Test Case**: Post with public visibility

**Steps**:
1. Share a walk with visibility set to "Public"
2. Log in as any user account
3. Check feed

**Expected Results**:
- ✅ Activity appears in all users' feeds
- ✅ Globe icon shows on activity card

### 3.4 RLS Policy Verification
**Test Case**: Verify Row Level Security policies

**Database Checks**:
1. Open Supabase SQL Editor
2. Run test queries as different users

```sql
-- Test 1: User can only see their own buddy connections
SELECT * FROM buddies WHERE user_id = auth.uid() OR buddy_id = auth.uid();

-- Test 2: Activity feed respects visibility
SELECT * FROM activity_feed WHERE 
  user_id = auth.uid() OR
  visibility = 'public' OR
  (visibility = 'buddies' AND user_id IN (
    SELECT buddy_id FROM buddies WHERE user_id = auth.uid() AND status = 'accepted'
    UNION
    SELECT user_id FROM buddies WHERE buddy_id = auth.uid() AND status = 'accepted'
  ));

-- Test 3: Kudos are viewable by all (for counting)
SELECT * FROM kudos WHERE activity_id = '<activity_id>';
```

**Expected Results**:
- ✅ Users cannot see other users' buddy connections
- ✅ Private activities only visible to owner
- ✅ Buddies-only activities only visible to accepted buddies
- ✅ Public activities visible to all
- ✅ Kudos counts are accurate but anonymous

---

## 4. Edge Cases and Error Handling

### 4.1 Offline Behavior
**Test Case**: Use app offline

**Steps**:
1. Enable airplane mode
2. Try to send buddy request
3. Try to post activity
4. Try to give kudos

**Expected Results**:
- ✅ Error alerts display: "Network error. Please check your connection."
- ✅ No data corruption
- ✅ Graceful degradation
- ✅ Sentry logs errors

### 4.2 Network Errors
**Test Case**: Simulate network failures

**Steps**:
1. Interrupt network during operations
2. Verify error handling

**Expected Results**:
- ✅ User-friendly error messages
- ✅ No app crashes
- ✅ Retry mechanisms work
- ✅ Optimistic updates rollback on failure

### 4.3 Duplicate Requests
**Test Case**: Send duplicate buddy request

**Steps**:
1. Send buddy request to user
2. Try to send another request to same user

**Expected Results**:
- ✅ Error: "Buddy request already sent"
- ✅ No duplicate rows in database

### 4.4 Invalid Email
**Test Case**: Enter invalid email

**Steps**:
1. Open Add Buddy modal
2. Enter invalid email (e.g., "notanemail")
3. Tap Send Request

**Expected Results**:
- ✅ Error: "Please enter a valid email address"
- ✅ No API call made

### 4.5 Long Notes
**Test Case**: Enter note exceeding character limit

**Steps**:
1. Open Post Activity modal
2. Type more than 200 characters in note field

**Expected Results**:
- ✅ Input stops at 200 characters
- ✅ Character counter shows "200/200"
- ✅ No overflow or truncation issues

---

## 5. Integration Testing

### 5.1 Navigation Integration
**Test Case**: Verify Buddies tab in navigation

**Steps**:
1. Check tab bar
2. Tap Buddies tab
3. Verify icon and label

**Expected Results**:
- ✅ Buddies tab appears between Map and Profile
- ✅ Users icon (Feather) displays
- ✅ Tab label reads "Buddies"
- ✅ Tab animation works on selection

### 5.2 Post-Walk Integration
**Test Case**: Post activity after walk

**Steps**:
1. Start a walk
2. End the walk
3. Verify PostActivityModal appears

**Expected Results**:
- ✅ Modal appears automatically after walk ends
- ✅ Walk data pre-populated (duration, distance)
- ✅ Can dismiss without sharing
- ✅ AsyncStorage preference respected

### 5.3 Profile Stats Integration
**Test Case**: Verify buddy count in profile

**Steps**:
1. Navigate to Profile tab
2. View stats grid
3. Check buddy count

**Expected Results**:
- ✅ Buddy count displays correctly
- ✅ Updates when buddies added/removed
- ✅ Users icon (Feather) displays
- ✅ Teal color applied

---

## 6. Acceptance Criteria Verification

### ✅ Core Features
- [ ] Buddy system: send, accept, decline, remove
- [ ] Activity feed: post, view, delete
- [ ] Kudos: give, remove, count display
- [ ] Privacy: private, buddies, public visibility

### ✅ Non-Competitive Design
- [ ] NO step counts in shared activities
- [ ] NO leaderboards or rankings
- [ ] NO performance comparisons
- [ ] Only feelings and encouragement

### ✅ Optional & Non-Breaking
- [ ] All features are 100% optional
- [ ] App works without social features
- [ ] No breaking changes to existing functionality
- [ ] Graceful degradation on errors

### ✅ Security & Privacy
- [ ] RLS policies enforce data isolation
- [ ] Users can only see appropriate data
- [ ] Kudos are anonymous
- [ ] Visibility settings respected

### ✅ User Experience
- [ ] Intuitive UI/UX
- [ ] Clear error messages
- [ ] Loading states
- [ ] Empty states
- [ ] Animations and feedback

---

## 7. Performance Testing

### 7.1 Load Testing
- Test with 50+ buddies
- Test with 100+ activities in feed
- Verify pagination/infinite scroll
- Check memory usage

### 7.2 Database Performance
- Verify indexes are used
- Check query execution times
- Monitor RLS policy overhead

---

## Sign-Off Checklist

- [ ] All buddy system tests pass
- [ ] All activity feed tests pass
- [ ] All privacy controls verified
- [ ] All edge cases handled
- [ ] Integration tests pass
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] No console errors or warnings
- [ ] Sentry integration working
- [ ] Ready for production

---

**Testing Completed By**: _________________  
**Date**: _________________  
**Sign-Off**: _________________

