# Stepin Testing Documentation

**Overview of all testing resources and guides**

---

## 📚 Testing Documentation Index

### 🎯 **Main Testing Checklist**
**File:** `MANUAL_TESTING_CHECKLIST.md`  
**Purpose:** Comprehensive manual testing checklist for all Stepin features  
**Use When:** Performing manual QA testing before releases

**Covers:**
- Authentication & Onboarding
- Today Screen (Home)
- Walk Logging (Manual & Live)
- History Screen
- Profile & Settings
- **Buddy Discovery System** (all 4 methods)
- Buddies & Social Features
- Live Activities (iOS)
- Audio Coaching
- Performance & Polish

---

### 🤝 **Buddy Discovery Testing Guide**
**File:** `BUDDY-DISCOVERY-TESTING-GUIDE.md`  
**Purpose:** Detailed testing guide for Buddy Discovery System  
**Use When:** Testing QR codes, search, invites, or contact sync

**Covers:**
- QR Code Connection (generation & scanning)
- Username Search (search & preview)
- Invite Links (generation & processing)
- Contact Sync (privacy-first matching)
- Deep Linking (QR & invite links)
- Edge Cases (permissions, network, validation)

**Test Users:**
- sarah.johnson@example.com (sarah_walker)
- mike.chen@example.com (mike_active)
- emma.rodriguez@example.com (emma_recovery)
- james.williams@example.com (james_senior)
- lisa.thompson@example.com (lisa_busy)

**Password:** `TestPassword123!`

---

### 🚀 **E2E Testing Quick Start**
**File:** `TESTING_QUICK_START.md`  
**Purpose:** Get started with Maestro E2E testing  
**Use When:** Setting up automated testing infrastructure

**Covers:**
- Maestro CLI installation
- Test database setup
- Test directory structure
- Building test app
- Writing first test
- Running tests

---

## 🎯 Testing Priorities

### **Critical (Must Test Before Release)**
1. ✅ Authentication flows (sign up, sign in, sign out)
2. ✅ Step tracking and goal progress
3. ✅ Walk logging (manual and live)
4. ✅ Buddy Discovery System (all 4 methods)
5. ✅ Data persistence and sync
6. ✅ No crashes during normal use

### **High Priority (Important for UX)**
1. ⬜ History screen and calendar
2. ⬜ Profile editing and settings
3. ⬜ Buddy requests and social features
4. ⬜ Weather integration
5. ⬜ Notifications
6. ⬜ Performance (app launch, animations)

### **Medium Priority (Nice to Have)**
1. ⬜ Live Activities (iOS)
2. ⬜ Audio coaching
3. ⬜ Activity feed and kudos
4. ⬜ Accessibility features
5. ⬜ Dark mode

### **Low Priority (Polish)**
1. ⬜ Edge cases and error handling
2. ⬜ Offline mode
3. ⬜ Advanced settings
4. ⬜ Analytics and tracking

---

## 📋 Testing Workflow

### **1. Before Testing**
- [ ] Ensure TEST database is configured (`.env` file)
- [ ] Verify Expo dev server is running
- [ ] Have test devices/simulators ready
- [ ] Review relevant testing guide

### **2. During Testing**
- [ ] Follow test steps in order
- [ ] Document any issues immediately
- [ ] Take screenshots of bugs
- [ ] Note device/OS information
- [ ] Test on multiple devices if possible

### **3. After Testing**
- [ ] Update checklist with test results
- [ ] Create GitHub issues for bugs
- [ ] Update testing documentation if needed
- [ ] Sign off on completed sections

---

## 🐛 Bug Reporting

When you find a bug, create a GitHub issue with:

**Title:** `[Component] Brief description`  
**Example:** `[Buddy Discovery] QR scanner crashes on iOS 17`

**Template:**
```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Device: iPhone 15 Pro
- OS: iOS 17.2
- App Version: 1.0.0
- Database: TEST (hwzyuugggdubeejfpele)

## Screenshots
[Attach screenshots if applicable]

## Additional Context
Any other relevant information
```

---

## 📊 Testing Status Dashboard

**Last Updated:** 2025-10-09

| Feature Category | Tests | Passed | Failed | Not Tested |
|-----------------|-------|--------|--------|------------|
| Authentication | 10 | 0 | 0 | 10 |
| Today Screen | 15 | 0 | 0 | 15 |
| Walk Logging | 12 | 0 | 0 | 12 |
| History | 10 | 0 | 0 | 10 |
| Profile | 12 | 0 | 0 | 12 |
| **Buddy Discovery** | **35** | **0** | **0** | **35** |
| Buddies & Social | 8 | 0 | 0 | 8 |
| Live Activities | 4 | 0 | 0 | 4 |
| Audio Coaching | 4 | 0 | 0 | 4 |
| Performance | 8 | 0 | 0 | 8 |
| **TOTAL** | **118** | **0** | **0** | **118** |

**Overall Progress:** 0% (0/118 tests completed)

---

## 🔗 Related Documentation

### **Implementation Docs**
- `docs/implementation/BUDDY-DISCOVERY-IMPLEMENTATION-SUMMARY.md` - Implementation details
- `docs/setup/Stepin_buddy_discover.md` - Original specification

### **Database Docs**
- `database/database-migrations/PHASE-14-MIGRATION-GUIDE.md` - Migration guide
- `docs/setup/SUPABASE_TEST_SETUP.md` - Test database setup

### **Phase Docs**
- `docs/phases/PHASE_*_TESTING_GUIDE.md` - Phase-specific testing guides

---

## 🎯 Quick Links

**Start Testing Now:**
1. Open `MANUAL_TESTING_CHECKLIST.md`
2. Pick a feature category
3. Follow the test steps
4. Mark tests as ✅ Passed or ❌ Failed
5. Report any bugs

**Test Buddy Discovery:**
1. Open `BUDDY-DISCOVERY-TESTING-GUIDE.md`
2. Use test users (password: `TestPassword123!`)
3. Test all 4 discovery methods
4. Test edge cases
5. Update main checklist

**Set Up E2E Testing:**
1. Open `TESTING_QUICK_START.md`
2. Install Maestro CLI
3. Set up test database
4. Write your first test
5. Run tests

---

## 📝 Notes

- **Always use TEST database** (hwzyuugggdubeejfpele) for testing
- **Never test on PRODUCTION** (mvvndpuwrbsrahytxtjf)
- Test on physical devices for GPS, camera, and contacts features
- Test with different network conditions (WiFi, cellular, offline)
- Document everything - if it's not documented, it didn't happen

---

## ✅ Testing Sign-Off

**Release Version:** _____________  
**Tested By:** _____________  
**Date:** _____________  

**Critical Tests:** ⬜ All Passed  
**High Priority Tests:** ⬜ All Passed  
**Known Issues:** _____________  

**Approved for Release:** ⬜ Yes  ⬜ No  ⬜ Conditional

**Conditions (if applicable):**
- _____________
- _____________
- _____________

---

**Questions?** Contact the development team or review the documentation in `docs/`.

