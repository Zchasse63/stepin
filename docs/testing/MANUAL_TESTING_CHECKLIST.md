# Stepin - Manual Testing Checklist

**Last Updated:** 2025-10-09
**Purpose:** Comprehensive manual testing checklist for all Stepin features
**Status:** Living document - update as features are tested

---

## 📋 How to Use This Checklist

- **Status Indicators:**
  - ⬜ Not Tested
  - 🔄 In Progress
  - ✅ Passed
  - ❌ Failed (see issues)
  - ⚠️ Partial (some tests passed)

- **Priority Levels:**
  - 🔴 Critical - Must work for release
  - 🟡 High - Important for user experience
  - 🟢 Medium - Nice to have
  - 🔵 Low - Polish/edge cases

---

## 1. Authentication & Onboarding

### Sign Up Flow
- ⬜ 🔴 User can create account with email/password
- ⬜ 🔴 Email validation works correctly
- ⬜ 🔴 Password strength requirements enforced
- ⬜ 🟡 Error messages are clear and helpful
- ⬜ 🟢 Sign up with invite code works (see Buddy Discovery)

### Sign In Flow
- ⬜ 🔴 User can sign in with valid credentials
- ⬜ 🔴 Invalid credentials show appropriate error
- ⬜ 🟡 "Remember me" functionality works
- ⬜ 🟢 Password reset flow works

### Onboarding
- ⬜ 🔴 All 6 onboarding steps display correctly
- ⬜ 🔴 User can set daily step goal
- ⬜ 🔴 HealthKit permissions requested (iOS)
- ⬜ 🔴 Location permissions requested
- ⬜ 🟡 Notification permissions requested
- ⬜ 🟢 User can skip optional steps

---

## 2. Today Screen (Home)

### Step Tracking
- ⬜ 🔴 Step count displays correctly
- ⬜ 🔴 Step circle animates smoothly
- ⬜ 🔴 Goal progress updates in real-time
- ⬜ 🟡 Step count syncs from HealthKit (iOS)
- ⬜ 🟢 Confetti celebration on goal completion

### Stats Cards
- ⬜ 🔴 Distance card shows correct miles/km
- ⬜ 🔴 Active time card shows correct duration
- ⬜ 🟡 Calories card shows correct estimate
- ⬜ 🟢 All stats update in real-time

### Streak Display
- ⬜ 🔴 Current streak displays correctly
- ⬜ 🟡 Streak milestone modal appears at milestones
- ⬜ 🟢 Streak resets correctly after missed day

### Weather Integration
- ⬜ 🟡 Weather card displays current conditions
- ⬜ 🟡 Temperature shows correctly
- ⬜ 🟡 Weather icon matches conditions
- ⬜ 🟢 Weather updates periodically

---

## 3. Walk Logging

### Manual Walk Logging
- ⬜ 🔴 User can open log walk modal
- ⬜ 🔴 Date/time picker works correctly
- ⬜ 🔴 Duration input accepts valid values
- ⬜ 🔴 Walk saves to database
- ⬜ 🟡 Validation prevents invalid entries
- ⬜ 🟢 User can cancel without saving

### Live Walk Tracking
- ⬜ 🔴 User can start a walk
- ⬜ 🔴 GPS tracking begins immediately
- ⬜ 🔴 Route displays on map
- ⬜ 🔴 Distance updates in real-time
- ⬜ 🔴 User can pause walk
- ⬜ 🔴 User can resume walk
- ⬜ 🔴 User can end walk
- ⬜ 🟡 Walk saves with correct data
- ⬜ 🟢 Battery usage is acceptable (<5%/hour)

### Auto-Detection
- ⬜ 🟡 Walk auto-detection triggers correctly
- ⬜ 🟡 Notification appears when walk detected
- ⬜ 🟡 User can confirm or dismiss detection
- ⬜ 🟢 False positives are minimal

---

## 4. History Screen

### Calendar View
- ⬜ 🔴 Calendar displays current month
- ⬜ 🔴 Days with walks show indicators
- ⬜ 🔴 User can navigate between months
- ⬜ 🟡 Tapping day shows day details
- ⬜ 🟢 Calendar heatmap shows activity levels

### Walk List
- ⬜ 🔴 All walks display in list
- ⬜ 🔴 Walk details are accurate
- ⬜ 🟡 User can tap walk for details
- ⬜ 🟡 User can delete walks
- ⬜ 🟢 List scrolls smoothly

### Time Period Selector
- ⬜ 🟡 User can switch between Week/Month/Year
- ⬜ 🟡 Stats update when period changes
- ⬜ 🟢 Charts display correctly for each period

---

## 5. Profile & Settings

### Profile Display
- ⬜ 🔴 User name displays correctly
- ⬜ 🔴 Avatar displays (if set)
- ⬜ 🟡 Username displays (if set)
- ⬜ 🟢 Profile stats are accurate

### Edit Profile
- ⬜ 🔴 User can edit display name
- ⬜ 🔴 User can set username
- ⬜ 🔴 Username uniqueness is enforced
- ⬜ 🟡 User can upload avatar
- ⬜ 🟡 User can remove avatar
- ⬜ 🟢 Changes save correctly

### Settings
- ⬜ 🔴 User can change daily step goal
- ⬜ 🟡 User can change theme (light/dark/system)
- ⬜ 🟡 User can toggle notifications
- ⬜ 🟡 User can toggle audio coaching
- ⬜ 🟢 User can sign out

---

## 6. Buddy Discovery System

**Detailed Guide:** See `docs/testing/BUDDY-DISCOVERY-TESTING-GUIDE.md`

### QR Code Connection
- ⬜ 🔴 User can view their QR code
- ⬜ 🔴 QR code displays with user name
- ⬜ 🔴 User can open QR scanner
- ⬜ 🔴 Camera permission requested correctly
- ⬜ 🔴 QR scanner detects codes
- ⬜ 🔴 Scanning navigates to buddy preview
- ⬜ 🟡 Close button works on QR modals
- ⬜ 🟢 QR code is scannable by other devices

### Username Search
- ⬜ 🔴 User can open search modal
- ⬜ 🔴 Search input accepts text
- ⬜ 🔴 Search results display correctly
- ⬜ 🔴 Minimum 3 characters enforced
- ⬜ 🔴 Tapping result shows buddy preview
- ⬜ 🟡 Search debouncing works (no lag)
- ⬜ 🟡 Empty results show helpful message
- ⬜ 🟢 Special characters handled correctly

### Buddy Preview & Requests
- ⬜ 🔴 Buddy preview shows correct info
- ⬜ 🔴 User can send buddy request
- ⬜ 🔴 Request saves to database
- ⬜ 🔴 Modal closes after request sent
- ⬜ 🟡 Loading state shows during request
- ⬜ 🟡 Error handling works correctly
- ⬜ 🟢 Duplicate requests prevented

### Invite Links
- ⬜ 🔴 User can generate invite link
- ⬜ 🔴 Invite link can be shared
- ⬜ 🔴 Share sheet appears correctly
- ⬜ 🔴 Invite code saves to database
- ⬜ 🟡 Invite link format is correct
- ⬜ 🟡 30-day expiration enforced
- ⬜ 🟢 One-time use enforced

### Invite Link Processing
- ⬜ 🔴 New user can sign up with invite code
- ⬜ 🔴 Invite code validates correctly
- ⬜ 🔴 Buddy connection created automatically
- ⬜ 🟡 Expired invites rejected
- ⬜ 🟡 Used invites rejected
- ⬜ 🟢 Invalid codes show helpful error

### Contact Sync
- ⬜ 🔴 User can open contact sync modal
- ⬜ 🔴 Contacts permission requested
- ⬜ 🔴 Privacy notice displays clearly
- ⬜ 🔴 User can grant permission
- ⬜ 🔴 Sync completes without errors
- ⬜ 🔴 Matches display correctly
- ⬜ 🟡 Permission denial handled gracefully
- ⬜ 🟡 No raw phone numbers in logs
- ⬜ 🟢 SHA-256 hashing verified

### Deep Linking
- ⬜ 🔴 QR code deep links work (stepin://buddy/add/{id})
- ⬜ 🔴 Invite deep links work (stepin://invite/{code})
- ⬜ 🟡 HTTPS invite links work (https://stepin.app/invite/{code})
- ⬜ 🟡 Deep links navigate correctly
- ⬜ 🟢 Invalid deep links handled gracefully

### Navigation & UI
- ⬜ 🔴 Discovery modal opens from buddies screen
- ⬜ 🔴 All 5 discovery options visible
- ⬜ 🔴 Close buttons work on all modals
- ⬜ 🔴 Back navigation works correctly
- ⬜ 🟡 Modal transitions are smooth
- ⬜ 🟢 No navigation bugs or crashes

---

## 7. Buddies & Social

### Buddy List
- ⬜ 🔴 All buddies display in list
- ⬜ 🔴 Buddy stats show correctly
- ⬜ 🟡 User can view buddy details
- ⬜ 🟢 List updates in real-time

### Buddy Requests
- ⬜ 🔴 Pending requests display correctly
- ⬜ 🔴 User can accept requests
- ⬜ 🔴 User can decline requests
- ⬜ 🟡 Request notifications work
- ⬜ 🟢 Request count badge updates

### Activity Feed (Phase 11)
- ⬜ 🟡 Activity feed displays posts
- ⬜ 🟡 User can create posts
- ⬜ 🟡 User can give kudos
- ⬜ 🟢 Feed updates in real-time

---

## 8. Live Activities (iOS Only)

- ⬜ 🟡 Live Activity appears on lock screen
- ⬜ 🟡 Stats update in real-time
- ⬜ 🟡 Live Activity dismisses when walk ends
- ⬜ 🟢 Dynamic Island integration works

---

## 9. Audio Coaching

- ⬜ 🟡 Audio coaching can be enabled
- ⬜ 🟡 Coaching announcements play correctly
- ⬜ 🟡 Volume is appropriate
- ⬜ 🟢 User can disable coaching

---

## 10. Performance & Polish

### Performance
- ⬜ 🔴 App launches in <3 seconds
- ⬜ 🔴 No crashes during normal use
- ⬜ 🟡 Smooth animations (60fps)
- ⬜ 🟡 Battery usage acceptable
- ⬜ 🟢 Memory usage reasonable

### Error Handling
- ⬜ 🔴 Network errors handled gracefully
- ⬜ 🔴 Offline mode works correctly
- ⬜ 🟡 Error messages are helpful
- ⬜ 🟢 No unhandled exceptions

### Accessibility
- ⬜ 🟡 VoiceOver works correctly (iOS)
- ⬜ 🟡 Text scales with system settings
- ⬜ 🟢 Color contrast meets standards

---

## 📊 Testing Summary

**Total Tests:** TBD  
**Passed:** 0  
**Failed:** 0  
**Not Tested:** TBD  

**Critical Issues:** None  
**High Priority Issues:** None  
**Medium Priority Issues:** None  

---

## 📝 Notes

- Test on both iOS and Android when possible
- Test on physical devices for GPS, camera, and contacts features
- Test with different network conditions (WiFi, cellular, offline)
- Test with different user states (new user, existing user, premium user)
- Document any bugs or issues in GitHub Issues

---

## 🔗 Related Documentation

- **Buddy Discovery Testing:** `docs/testing/BUDDY-DISCOVERY-TESTING-GUIDE.md`
- **E2E Testing:** `docs/testing/TESTING_QUICK_START.md`
- **Phase-Specific Testing:** `docs/phases/PHASE_*_TESTING_GUIDE.md`

