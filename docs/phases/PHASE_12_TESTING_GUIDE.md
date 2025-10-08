# Phase 12: Advanced Features - Testing Guide

## Overview
This guide provides comprehensive testing procedures for Phase 12 features:
- **Workout Auto-Detection**: Automatically detect when users start walking
- **Heart Rate Zones**: Real-time HR monitoring with 5-zone analysis

---

## Pre-Testing Setup

### 1. Database Migration
**⚠️ IMPORTANT: Execute before testing**

```sql
-- Run in Supabase SQL Editor
-- File: supabase_migrations/phase_12_advanced_features.sql
```

**Verification:**
```sql
-- Verify new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'walks')
AND column_name IN ('auto_detect_enabled', 'auto_detected', 'average_heart_rate', 'max_heart_rate');
```

### 2. Health Permissions
- **iOS**: Ensure HealthKit permissions include:
  - Workouts (Read)
  - Heart Rate (Read)
  - Steps (Read)
- **Android**: Ensure Health Connect permissions include:
  - Exercise Sessions (Read)
  - Heart Rate (Read)
  - Steps (Read)

### 3. Notification Permissions
- Enable notifications in device settings
- Grant notification permissions when prompted

---

## Section 1: Workout Auto-Detection Testing

### Test 1.1: Enable Auto-Detection
**Steps:**
1. Navigate to Profile → Advanced Features
2. Toggle "Workout Auto-Detection" ON
3. Verify toggle state persists after app restart

**Expected:**
- ✅ Toggle switches to ON state
- ✅ Success alert: "Workout auto-detection enabled!"
- ✅ Setting persists in database (`profiles.auto_detect_enabled = true`)

### Test 1.2: Auto-Detection Notification (iOS)
**Steps:**
1. Ensure auto-detection is enabled
2. Start walking for 5-10 minutes (actual physical activity)
3. Keep app in background
4. Wait for notification

**Expected:**
- ✅ Notification appears: "Looks like you're walking! 🚶"
- ✅ Body text: "Want to track this walk?"
- ✅ Notification includes start time in data payload

**Timing:**
- Should appear within 2-4 minutes of starting walk
- Polling interval: 2 minutes

### Test 1.3: Auto-Detection Notification (Android)
**Steps:**
1. Ensure auto-detection is enabled
2. Start walking for 5-10 minutes (actual physical activity)
3. Keep app in background
4. Wait for notification

**Expected:**
- ✅ Same as iOS test
- ✅ Uses Health Connect Exercise Sessions API

### Test 1.4: Accept Auto-Detection
**Steps:**
1. Receive auto-detection notification
2. Tap notification
3. Verify walk starts retroactively

**Expected:**
- ✅ App opens to Today screen
- ✅ Active walk UI appears
- ✅ Steps counted from detected start time (not zero)
- ✅ `auto_detected` flag set to `true` in database
- ✅ GPS tracking starts from current time (not retroactive)

### Test 1.5: Dismiss Auto-Detection
**Steps:**
1. Receive auto-detection notification
2. Dismiss notification without tapping
3. Verify no walk is started

**Expected:**
- ✅ No walk session created
- ✅ App remains in current state
- ✅ No database changes

### Test 1.6: Disable Auto-Detection
**Steps:**
1. Navigate to Profile → Advanced Features
2. Toggle "Workout Auto-Detection" OFF
3. Start walking for 10 minutes
4. Verify no notification appears

**Expected:**
- ✅ Toggle switches to OFF state
- ✅ Success alert: "Workout auto-detection disabled!"
- ✅ No notifications during walk
- ✅ Activity recognition stopped

### Test 1.7: Auto-Detection While Already Tracking
**Steps:**
1. Manually start a walk
2. Trigger auto-detection (should not happen)
3. Verify no notification appears

**Expected:**
- ✅ No notification while walk is active
- ✅ Auto-detection logic checks `is_walking` flag

---

## Section 2: Heart Rate Zones Testing

### Test 2.1: Heart Rate Display During Walk
**Steps:**
1. Start a walk (manual or auto-detected)
2. Observe heart rate display in active walk UI
3. Verify real-time updates

**Expected:**
- ✅ Heart rate value displays (e.g., "125 BPM")
- ✅ Heart icon pulses/animates
- ✅ Zone indicator shows (e.g., "Zone 3")
- ✅ Updates every 5 seconds
- ✅ Color-coded by zone:
  - Zone 1: Green (#A8E6CF)
  - Zone 2: Light Orange (#FFD3B6)
  - Zone 3: Orange (#FFAAA5)
  - Zone 4: Red-Orange (#FF8B94)
  - Zone 5: Red (#FF6B6B)

### Test 2.2: No Heart Rate Data (Graceful Fallback)
**Steps:**
1. Start walk on device without HR sensor
2. Observe heart rate display

**Expected:**
- ✅ Shows "No Heart Rate Data" message
- ✅ Heart icon is outline (not filled)
- ✅ No zone indicator
- ✅ Walk continues normally
- ✅ No errors or crashes

### Test 2.3: Heart Rate Zone Calculations
**Test Data:**
- Assumed max HR: 190 BPM (220 - 30 years)

| Current HR | Expected Zone | Percentage |
|------------|---------------|------------|
| 100 BPM    | Zone 1        | 52%        |
| 120 BPM    | Zone 2        | 63%        |
| 140 BPM    | Zone 3        | 74%        |
| 160 BPM    | Zone 4        | 84%        |
| 180 BPM    | Zone 5        | 95%        |

**Steps:**
1. During walk, observe HR and zone
2. Verify zone matches expected calculation

**Expected:**
- ✅ Zone calculation is accurate
- ✅ Zone updates in real-time as HR changes

### Test 2.4: Post-Walk Heart Rate Analytics
**Steps:**
1. Complete a walk with heart rate data
2. View walk in History
3. Tap walk to open details sheet
4. Verify HR analytics display

**Expected:**
- ✅ Average HR displayed (e.g., "135 BPM")
- ✅ Max HR displayed (e.g., "165 BPM")
- ✅ Zone badges show for avg and max
- ✅ Zone legend displays all 5 zones
- ✅ Data saved to database (`average_heart_rate`, `max_heart_rate`)

### Test 2.5: Heart Rate Badge in Walk List
**Steps:**
1. Complete walk with HR data
2. View History screen
3. Observe walk list item

**Expected:**
- ✅ Heart icon badge appears
- ✅ Shows average HR (e.g., "135 BPM")
- ✅ Red heart icon color
- ✅ Badge appears next to "Goal Met" badge (if applicable)

### Test 2.6: Walk Without Heart Rate Data
**Steps:**
1. Complete walk without HR data
2. View walk details

**Expected:**
- ✅ No HR badge in list
- ✅ Walk details show "No heart rate data available"
- ✅ No errors or missing UI elements

---

## Section 3: Integration Testing

### Test 3.1: Auto-Detection + Heart Rate
**Steps:**
1. Enable auto-detection
2. Start walking (trigger auto-detection)
3. Accept notification
4. Verify HR tracking starts

**Expected:**
- ✅ Walk starts retroactively with steps
- ✅ HR streaming starts from current time
- ✅ Both features work together seamlessly

### Test 3.2: Database Integrity
**Steps:**
1. Complete walk with auto-detection and HR
2. Query database

```sql
SELECT 
  id, 
  steps, 
  auto_detected, 
  average_heart_rate, 
  max_heart_rate 
FROM walks 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:**
- ✅ `auto_detected = true`
- ✅ `average_heart_rate` is populated
- ✅ `max_heart_rate` is populated
- ✅ HR values are within valid range (30-250 BPM)

### Test 3.3: Offline Behavior
**Steps:**
1. Enable airplane mode
2. Start walk
3. Observe HR tracking

**Expected:**
- ✅ HR data streams from local HealthKit/Health Connect
- ✅ Walk saves to local queue
- ✅ Syncs when connection restored

---

## Section 4: Edge Cases & Error Handling

### Test 4.1: Rapid Toggle Auto-Detection
**Steps:**
1. Toggle auto-detection ON/OFF rapidly 5 times
2. Verify final state

**Expected:**
- ✅ No crashes
- ✅ Final state matches toggle position
- ✅ Activity recognition starts/stops correctly

### Test 4.2: HR Sensor Disconnects Mid-Walk
**Steps:**
1. Start walk with HR tracking
2. Remove/disconnect HR sensor (if applicable)
3. Observe behavior

**Expected:**
- ✅ HR display shows "No HR" or last known value
- ✅ Walk continues normally
- ✅ Average calculated from available samples

### Test 4.3: Multiple Auto-Detection Notifications
**Steps:**
1. Start/stop walking multiple times
2. Verify only one notification per walk session

**Expected:**
- ✅ No duplicate notifications
- ✅ Notifications respect 15-minute window

### Test 4.4: Invalid Heart Rate Values
**Steps:**
1. Simulate invalid HR data (if possible)
2. Verify constraints

**Expected:**
- ✅ HR values < 30 or > 250 are rejected
- ✅ Database constraints prevent invalid data
- ✅ App handles gracefully (no crashes)

---

## Acceptance Criteria Checklist

### Auto-Detection (6 criteria)
- [ ] Notification appears after 5-10 min of walking
- [ ] Accept/dismiss options work correctly
- [ ] Retroactive step counting is accurate
- [ ] No false positives (< 5% error rate)
- [ ] Settings toggle works and persists
- [ ] Data stored correctly in database

### Heart Rate Zones (6 criteria)
- [ ] Real-time HR display during walk
- [ ] Zone indicator with correct colors
- [ ] Zone descriptions are accurate
- [ ] Post-walk analytics display correctly
- [ ] Avg/max HR saved to database
- [ ] Graceful fallback when no HR data

---

## Performance Benchmarks

### Auto-Detection
- **Detection Time**: 2-10 minutes after walk starts
- **False Positive Rate**: < 5%
- **Notification Delivery**: < 5 seconds after detection

### Heart Rate
- **Update Frequency**: Every 5 seconds
- **Zone Calculation**: < 100ms
- **Data Accuracy**: ±2 BPM from source

---

## Troubleshooting

### Auto-Detection Not Working
1. Check health permissions (Workouts)
2. Verify `auto_detect_enabled = true` in database
3. Check notification permissions
4. Ensure walk duration > 5 minutes

### Heart Rate Not Displaying
1. Check health permissions (Heart Rate)
2. Verify device has HR sensor or connected device
3. Check HealthKit/Health Connect data availability
4. Restart app and retry

### Database Migration Issues
1. Verify migration SQL executed successfully
2. Check for constraint violations
3. Review Supabase logs for errors
4. Re-run migration if needed

---

## Success Metrics

**Target Goals:**
- **Auto-Detection Rate**: 50%+ of walks auto-detected
- **HR Data Coverage**: 20%+ of walks include HR data
- **User Satisfaction**: 4.5+ star rating for new features
- **Error Rate**: < 1% crashes related to Phase 12 features

---

## Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Build Version:** _______________  
**Platform:** iOS / Android  
**All Tests Passed:** ☐ Yes ☐ No  

**Notes:**

