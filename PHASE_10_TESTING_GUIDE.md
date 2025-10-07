# Phase 10 Testing Guide
## Weather Integration & Audio Coaching

This document provides comprehensive testing procedures for Phase 10 features.

---

## ✅ Pre-Testing Checklist

### 1. **Environment Setup**
- [ ] OpenWeatherMap API key added to `.env` file
- [ ] Database migration executed successfully in Supabase
- [ ] All dependencies installed (`axios`, `expo-speech`, `expo-av`)
- [ ] App rebuilt after adding new dependencies

### 2. **Permissions Required**
- [ ] Location permission (for weather features)
- [ ] Notification permission (for weather alerts)
- [ ] Microphone permission (for audio coaching - iOS only)

---

## 🌤️ Weather Feature Testing

### **Test 1: Weather Card Display**
**Steps:**
1. Open the app and navigate to Today screen
2. Observe weather card above step progress

**Expected Results:**
- ✅ Weather card displays with current temperature
- ✅ Weather icon matches condition (sunny, cloudy, rainy, etc.)
- ✅ Description text is readable and accurate
- ✅ "Feels like" and humidity values are present
- ✅ Card has proper styling and spacing

**Edge Cases:**
- No location permission → Card should not appear
- API error → Card should not appear (graceful degradation)
- No internet → Should use cached data if available

---

### **Test 2: Weather Auto-Refresh**
**Steps:**
1. Note the weather data displayed
2. Wait 30 minutes
3. Observe if weather data updates

**Expected Results:**
- ✅ Weather data refreshes automatically every 30 minutes
- ✅ No user interaction required
- ✅ Refresh happens in background without UI disruption

**Verification:**
- Check Sentry breadcrumbs for "Weather data fetched" events
- Verify timestamps are 30 minutes apart

---

### **Test 3: Weather Settings - Enable Location**
**Steps:**
1. Navigate to Profile screen
2. Scroll to Weather section
3. Tap "Enable Location" button
4. Grant location permission when prompted
5. Verify location is saved

**Expected Results:**
- ✅ Location permission dialog appears
- ✅ Success alert shows "Location saved!"
- ✅ Weather settings (alerts, preferred time) become visible
- ✅ Weather card appears on Today screen

**Edge Cases:**
- Permission denied → Alert shows "Permission Denied" message
- Location unavailable → Error alert with helpful message

---

### **Test 4: Weather Alerts Toggle**
**Steps:**
1. Navigate to Profile > Weather section
2. Toggle "Weather Alerts" on
3. Verify toggle state persists after app restart
4. Toggle off and verify

**Expected Results:**
- ✅ Toggle switches smoothly
- ✅ Success alert confirms change
- ✅ Setting persists in Supabase
- ✅ Notifications are scheduled/cancelled accordingly

---

### **Test 5: Preferred Walk Time Selection**
**Steps:**
1. Navigate to Profile > Weather section
2. Tap "Preferred Walk Time"
3. Select "Morning (8 AM)"
4. Verify selection is saved
5. Repeat for Afternoon and Evening

**Expected Results:**
- ✅ Modal displays three time options
- ✅ Selection updates immediately
- ✅ Success alert confirms change
- ✅ Notifications are rescheduled for new time

---

### **Test 6: Weather Notifications**
**Steps:**
1. Enable weather alerts
2. Set preferred walk time to 1 hour from now
3. Wait for notification (if bad weather is forecasted)

**Expected Results:**
- ✅ Notification appears 1 hour before preferred time
- ✅ Notification includes weather condition and alternative time
- ✅ Notification only sent if rain >60% or extreme temps

**Manual Testing:**
- Check notification scheduling in Supabase (scheduled_notifications table)
- Verify notification content is helpful and actionable

---

### **Test 7: Weather Saving with Walk Records**
**Steps:**
1. Start a walk
2. Complete the walk
3. Check Supabase walks table for weather_conditions field

**Expected Results:**
- ✅ Weather conditions saved to walk record
- ✅ Includes temperature, condition, description, feels_like, humidity
- ✅ If weather unavailable, field is null (graceful degradation)

---

## 🎙️ Audio Coaching Feature Testing

### **Test 8: Audio Coaching Settings**
**Steps:**
1. Navigate to Profile > Audio Coaching section
2. Toggle "Voice Guidance" on
3. Verify toggle state persists
4. Tap "Announcement Interval"
5. Select different intervals (3, 5, 7, 10 minutes)

**Expected Results:**
- ✅ Toggle switches smoothly
- ✅ Interval modal displays four options
- ✅ Selection updates and persists
- ✅ Success alerts confirm changes

---

### **Test 9: Audio Coaching During Walk**
**Steps:**
1. Enable audio coaching with 3-minute interval
2. Start a walk
3. Wait for first announcement (should occur at 3 minutes)
4. Continue walking and verify subsequent announcements

**Expected Results:**
- ✅ First announcement at configured interval
- ✅ Announcement includes elapsed time, steps, and distance
- ✅ Voice is clear and understandable
- ✅ Announcements repeat at configured interval

**Content Verification:**
- "Nice start! You've been walking for 3 minutes. X steps so far, covering Y miles. Keep it up!"
- Encouragement phrases change based on elapsed time

---

### **Test 10: Music Ducking**
**Steps:**
1. Play music (Spotify, Apple Music, or any app)
2. Enable audio coaching
3. Start a walk
4. Wait for announcement

**Expected Results:**
- ✅ Music volume lowers during announcement
- ✅ Announcement is clearly audible
- ✅ Music volume restores after announcement
- ✅ Music playback continues without interruption

**Test with:**
- Spotify
- Apple Music
- Podcasts
- YouTube Music

---

### **Test 11: Audio Coaching Pause/Resume**
**Steps:**
1. Start a walk with audio coaching enabled
2. Wait for first announcement
3. Pause the walk
4. Verify audio stops
5. Resume the walk
6. Verify announcements continue

**Expected Results:**
- ✅ Audio stops immediately when walk is paused
- ✅ No announcements during pause
- ✅ Announcements resume when walk resumes
- ✅ Interval timer continues correctly

---

### **Test 12: Audio Coaching End Walk**
**Steps:**
1. Start a walk with audio coaching enabled
2. Wait for at least one announcement
3. End the walk
4. Verify audio stops

**Expected Results:**
- ✅ Audio stops immediately when walk ends
- ✅ No announcements after walk ends
- ✅ Coaching interval is cleared

---

## 🔍 Edge Case Testing

### **Test 13: Offline Mode**
**Steps:**
1. Enable airplane mode
2. Open app and navigate to Today screen
3. Observe weather card behavior
4. Start a walk with audio coaching

**Expected Results:**
- ✅ Weather card shows cached data (if available)
- ✅ If no cache, weather card doesn't appear
- ✅ Audio coaching works normally (no network required)
- ✅ No crashes or errors

---

### **Test 14: API Rate Limits**
**Steps:**
1. Make multiple rapid weather requests (refresh app repeatedly)
2. Observe behavior when approaching 1,000 calls/day limit

**Expected Results:**
- ✅ Caching prevents excessive API calls
- ✅ 30-minute cache reduces API usage
- ✅ Graceful error handling if rate limit exceeded
- ✅ User sees cached data or no weather card

---

### **Test 15: Phone Calls During Walk**
**Steps:**
1. Start a walk with audio coaching enabled
2. Receive or make a phone call
3. Observe audio coaching behavior

**Expected Results:**
- ✅ Audio coaching pauses during phone call
- ✅ No announcements interrupt the call
- ✅ Audio coaching resumes after call ends

---

### **Test 16: Bluetooth Audio**
**Steps:**
1. Connect Bluetooth headphones or speaker
2. Enable audio coaching
3. Start a walk
4. Verify announcements play through Bluetooth device

**Expected Results:**
- ✅ Announcements play through Bluetooth device
- ✅ Audio quality is good
- ✅ Music ducking works with Bluetooth
- ✅ No audio routing issues

---

## 🔗 Integration Testing

### **Test 17: End-to-End Walk with All Features**
**Steps:**
1. Enable weather alerts and audio coaching
2. Start a walk
3. Walk for at least 10 minutes
4. Observe weather card, audio announcements
5. End walk
6. Verify weather saved to walk record

**Expected Results:**
- ✅ Weather card displays throughout walk
- ✅ Audio announcements occur at intervals
- ✅ Walk record includes weather conditions
- ✅ All features work together without conflicts

---

### **Test 18: Settings Persistence**
**Steps:**
1. Configure all weather and audio settings
2. Close app completely
3. Reopen app
4. Verify all settings are preserved

**Expected Results:**
- ✅ Weather alerts toggle state preserved
- ✅ Preferred walk time preserved
- ✅ Audio coaching toggle state preserved
- ✅ Announcement interval preserved

---

## 📊 Testing Checklist Summary

### Weather Features
- [ ] Weather card displays correctly
- [ ] Auto-refresh works (30 minutes)
- [ ] Location enable flow works
- [ ] Weather alerts toggle works
- [ ] Preferred walk time selection works
- [ ] Notifications scheduled correctly
- [ ] Weather saved with walk records
- [ ] Graceful degradation (no location, API errors)

### Audio Coaching Features
- [ ] Audio coaching toggle works
- [ ] Interval selection works
- [ ] Announcements occur at correct intervals
- [ ] Content is accurate and encouraging
- [ ] Music ducking works
- [ ] Pause/resume works correctly
- [ ] End walk stops audio
- [ ] Works with Bluetooth devices

### Edge Cases
- [ ] Offline mode handled gracefully
- [ ] API rate limits handled
- [ ] Phone calls don't interrupt
- [ ] Cross-platform compatibility (iOS/Android)

### Integration
- [ ] All features work together
- [ ] Settings persist across restarts
- [ ] No performance issues
- [ ] No crashes or errors

---

## 🐛 Known Issues & Limitations

1. **Weather API Free Tier**: Limited to 1,000 calls/day. Caching mitigates this.
2. **Audio Coaching iOS**: Requires microphone permission for TTS.
3. **Bluetooth Latency**: Minor delay possible with some Bluetooth devices.
4. **Background Notifications**: May be delayed on Android with battery optimization.

---

## 📝 Testing Notes

- Use Sentry breadcrumbs to verify feature execution
- Check Supabase tables for data persistence
- Test on both iOS and Android if possible
- Test with different device configurations (iPhone, iPad, various Android devices)
- Test with different iOS/Android versions

---

## ✅ Sign-Off

**Tester Name:** _________________  
**Date:** _________________  
**Platform:** iOS / Android  
**Device:** _________________  
**OS Version:** _________________  

**Overall Status:** Pass / Fail / Needs Review

**Notes:**

