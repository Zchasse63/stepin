# Buddy Discovery System - Testing Guide

**Last Updated:** 2025-10-09
**Quick Reference for Manual Testing**

**Main Checklist:** See `docs/testing/MANUAL_TESTING_CHECKLIST.md` for comprehensive testing status

---

## 🧪 Test Users

All test users have the same password: `TestPassword123!`

| Email                        | Username       | Display Name    |
|------------------------------|----------------|-----------------|
| sarah.johnson@example.com    | sarah_walker   | Sarah Johnson   |
| mike.chen@example.com        | mike_active    | Mike Chen       |
| emma.rodriguez@example.com   | emma_recovery  | Emma Rodriguez  |
| james.williams@example.com   | james_senior   | James Williams  |
| lisa.thompson@example.com    | lisa_busy      | Lisa Thompson   |

---

## 🚀 Quick Start

1. **Ensure Expo dev server is running:**
   ```bash
   cd stepin-app
   npx expo start
   ```

2. **Verify TEST database connection:**
   - Check `.env` file shows TEST Supabase URL (hwzyuugggdubeejfpele)

3. **Open app on device/simulator**

---

## ✅ Test Checklist

### 1. QR Code Connection (5 min)

**Setup:** 2 devices or 1 device + 1 simulator

**Steps:**
- [ ] Device A: Sign in as `sarah.johnson@example.com`
- [ ] Device A: Buddies tab → + button → "Show My QR Code"
- [ ] Verify QR code displays with Sarah's name
- [ ] Device B: Sign in as `mike.chen@example.com`
- [ ] Device B: Buddies tab → + button → "Scan QR Code"
- [ ] Grant camera permission if prompted
- [ ] Scan Device A's QR code
- [ ] Verify buddy preview shows Sarah's profile
- [ ] Tap "Send Buddy Request"
- [ ] Verify success message
- [ ] Device A: Check for pending buddy request

**Expected Results:**
- ✅ QR code displays correctly
- ✅ Camera permission handled gracefully
- ✅ Scan detects QR code instantly
- ✅ Preview shows correct user info
- ✅ Request is created in database

---

### 2. Username Search (3 min)

**Setup:** 1 device

**Steps:**
- [ ] Sign in as any test user
- [ ] Buddies tab → + button → "Search by Username"
- [ ] Type "sar" (less than 3 chars)
- [ ] Verify hint shows "Type at least 3 characters"
- [ ] Type "sarah"
- [ ] Verify `sarah_walker` appears in results
- [ ] Tap the result
- [ ] Verify buddy preview shows Sarah Johnson
- [ ] Tap "Send Buddy Request"
- [ ] Verify success message

**Test Variations:**
- [ ] Search by full username: "mike_active"
- [ ] Search by email: "emma.rodriguez@example.com"
- [ ] Search for non-existent user: "nonexistent123"
- [ ] Verify "No users found" message

**Expected Results:**
- ✅ Search is debounced (no lag)
- ✅ Results appear instantly
- ✅ Case-insensitive search works
- ✅ Empty state handled gracefully

---

### 3. Invite Links (5 min)

**Setup:** 1 device + ability to receive SMS/message

**Steps:**
- [ ] Sign in as `sarah.johnson@example.com`
- [ ] Buddies tab → + button → Scroll to "Invite to Stepin"
- [ ] Tap "Share Invite Link"
- [ ] Verify native share sheet appears
- [ ] Copy the invite link (should be `https://stepin.app/invite/XXXXXXXX`)
- [ ] Sign out
- [ ] Paste invite link in browser or notes
- [ ] Tap the link
- [ ] Verify app opens to sign-up screen
- [ ] Create new account with different email
- [ ] Complete sign-up
- [ ] Verify buddy request from Sarah is auto-created

**Test Variations:**
- [ ] Try using same invite link twice (should fail)
- [ ] Try invite link after 30 days (should fail - can't test now)

**Expected Results:**
- ✅ Share sheet works on iOS/Android
- ✅ Link format is correct
- ✅ Deep link opens app
- ✅ Sign-up processes invite code
- ✅ Buddy request auto-created

---

### 4. Contact Sync (3 min)

**Setup:** 1 device with contacts

**Steps:**
- [ ] Sign in as any test user
- [ ] Buddies tab → + button → "Sync Contacts"
- [ ] Read privacy notice
- [ ] Verify privacy features listed:
  - [ ] Phone numbers are hashed
  - [ ] No contact names stored
  - [ ] Opt-in only
- [ ] Tap "Sync Contacts"
- [ ] Grant contacts permission if prompted
- [ ] Wait for sync to complete
- [ ] If matches found, verify they display correctly
- [ ] If no matches, verify "No Matches Found" message
- [ ] Tap a match (if any)
- [ ] Verify buddy preview appears

**Expected Results:**
- ✅ Permission request is clear
- ✅ Privacy notice is prominent
- ✅ Sync completes without errors
- ✅ Matches display correctly
- ✅ No raw phone data visible in logs

---

### 5. Navigation & UI (2 min)

**Steps:**
- [ ] Buddies tab → + button
- [ ] Verify discovery modal appears
- [ ] Verify all 5 options visible:
  - [ ] Show My QR Code
  - [ ] Scan QR Code
  - [ ] Search by Username
  - [ ] Sync Contacts
  - [ ] Invite to Stepin (with component)
- [ ] Tap each option and verify modal opens
- [ ] Tap X or back to close each modal
- [ ] Verify smooth transitions
- [ ] Verify no navigation bugs

**Expected Results:**
- ✅ All modals open correctly
- ✅ Back navigation works
- ✅ Modal dismissal works
- ✅ No crashes or freezes

---

### 6. Profile Settings (2 min)

**Steps:**
- [ ] Go to Profile tab
- [ ] Tap "Edit Profile"
- [ ] Verify username field is visible
- [ ] Try entering username with spaces (should be removed)
- [ ] Try entering username with special chars (should be removed)
- [ ] Enter valid username (letters, numbers, underscores only)
- [ ] Tap "Save"
- [ ] Verify profile updates
- [ ] Go back to Buddies → + → Search
- [ ] Search for your new username
- [ ] Verify you appear in results

**Expected Results:**
- ✅ Username field validates input
- ✅ Only lowercase alphanumeric + underscore allowed
- ✅ Save updates database
- ✅ Search finds updated username

---

## 🐛 Edge Cases to Test

### QR Code
- [ ] Scan invalid QR code (non-Stepin)
- [ ] Scan own QR code (should handle gracefully)
- [ ] Deny camera permission
- [ ] Scan in low light

### Search
- [ ] Search with special characters
- [ ] Search with very long string
- [ ] Search while offline
- [ ] Rapid typing (debounce test)

### Invite Links
- [ ] Click invite link while already logged in
- [ ] Click expired invite link
- [ ] Click already-used invite link
- [ ] Click malformed invite link

### Contact Sync
- [ ] Deny contacts permission
- [ ] Device with no contacts
- [ ] Device with 1000+ contacts
- [ ] Sync while offline

---

## 📊 Success Criteria

**All features should:**
- ✅ Work without crashes
- ✅ Handle permissions gracefully
- ✅ Show appropriate loading states
- ✅ Display clear error messages
- ✅ Work offline where applicable
- ✅ Respect user privacy
- ✅ Have smooth animations
- ✅ Be accessible and intuitive

---

## 🔍 What to Look For

### Performance
- Search results appear in <500ms
- QR code scans in <2 seconds
- Contact sync completes in <10 seconds (for 100 contacts)
- No UI freezing or lag

### Privacy
- No raw phone numbers in logs
- No contact names in database
- Clear privacy notices before permissions
- User can opt-out at any time

### UX
- Clear instructions on each screen
- Helpful error messages
- Smooth transitions
- Consistent design with rest of app

---

## 🚨 Report Issues

If you find bugs, please note:
1. **What you were doing** (exact steps)
2. **What happened** (actual behavior)
3. **What you expected** (expected behavior)
4. **Device/OS** (iOS 17, Android 14, etc.)
5. **Screenshots** (if applicable)

---

## 🧪 Edge Case Testing

### Username Validation
- [ ] Test duplicate username prevention
- [ ] Test username with special characters
- [ ] Test username length limits (max 30 chars)
- [ ] Test username case sensitivity
- [ ] Test changing username multiple times

### Search Edge Cases
- [ ] Search with <3 characters (should show no results)
- [ ] Search with special characters
- [ ] Search with emoji
- [ ] Search with very long string
- [ ] Search with no results
- [ ] Search with exact match
- [ ] Search with partial match

### Permission Edge Cases
- [ ] Deny camera permission, then try to scan QR
- [ ] Deny contacts permission, then try to sync
- [ ] Grant permission after initial denial
- [ ] Revoke permission in system settings
- [ ] Test permission re-request flow

### Network Edge Cases
- [ ] Test QR scan with no internet
- [ ] Test search with no internet
- [ ] Test invite generation with no internet
- [ ] Test contact sync with no internet
- [ ] Test offline → online transition
- [ ] Test slow network (3G simulation)

### Invite Link Edge Cases
- [ ] Test expired invite link (>30 days)
- [ ] Test already-used invite link
- [ ] Test invalid invite code format
- [ ] Test invite link with non-existent inviter
- [ ] Test multiple people using same invite
- [ ] Test invite link after inviter deleted account

### Deep Link Edge Cases
- [ ] Test malformed QR code deep link
- [ ] Test malformed invite deep link
- [ ] Test deep link with invalid user ID
- [ ] Test deep link when not signed in
- [ ] Test deep link when already buddies
- [ ] Test deep link to self (should prevent)

### UI/UX Edge Cases
- [ ] Test rapid modal opening/closing
- [ ] Test back button spam
- [ ] Test rotating device during scan
- [ ] Test app backgrounding during sync
- [ ] Test low battery mode
- [ ] Test dark mode vs light mode
- [ ] Test accessibility features (VoiceOver)

---

## ✅ Sign-Off

After testing all features, confirm:
- [ ] All 4 discovery methods work
- [ ] No crashes or major bugs
- [ ] Privacy features verified
- [ ] Performance is acceptable
- [ ] UI/UX is polished
- [ ] Edge cases handled gracefully
- [ ] Error messages are helpful

**Tested by:** _______________
**Date:** _______________
**Status:** ⬜ Pass  ⬜ Fail  ⬜ Needs Work

**Update Main Checklist:** Mark tests as complete in `docs/testing/MANUAL_TESTING_CHECKLIST.md`

