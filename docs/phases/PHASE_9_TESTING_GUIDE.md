# Phase 9: Live GPS Tracking - Testing Guide

## Overview
This document provides comprehensive testing procedures for Phase 9: Live GPS Tracking & Route Recording implementation.

**Testing Date**: To be completed on physical devices  
**Tester**: Development team  
**Platforms**: iOS and Android

---

## Pre-Testing Checklist

- [ ] Code compiled without TypeScript errors
- [ ] All dependencies installed (`react-native-background-geolocation@^4.16.2`)
- [ ] Expo prebuild completed successfully
- [ ] iOS Info.plist contains location permissions
- [ ] Android manifest contains location permissions
- [ ] Test devices fully charged (for battery testing)

---

## Section 1: Basic Functionality Testing

### Test 1.1: GPS Tracking Start
**Objective**: Verify GPS tracking begins when walk starts

**Steps**:
1. Open Stepin app
2. Navigate to Today screen
3. Tap "Start Walk" button
4. Grant location permissions when prompted
5. Observe console logs for GPS tracking start

**Expected Results**:
- [ ] Location permission dialog appears
- [ ] GPS tracking starts after permission granted
- [ ] Console shows "GPS tracking started" log
- [ ] Starting location captured
- [ ] No crashes or errors

**Actual Results**: _To be filled during testing_

---

### Test 1.2: Route Recording
**Objective**: Verify route coordinates are recorded during walk

**Steps**:
1. Start a walk (Test 1.1)
2. Walk outdoors for 0.25 miles (~400 meters)
3. Observe console logs for location updates
4. Check route accumulation in store

**Expected Results**:
- [ ] Location updates received every 10-50 meters
- [ ] Route array grows with each update
- [ ] Distance updates in real-time
- [ ] Accuracy within 10-20 meters
- [ ] Console shows coordinate logs

**Actual Results**: _To be filled during testing_

---

### Test 1.3: Background Tracking
**Objective**: Verify tracking continues with phone locked

**Steps**:
1. Start a walk
2. Lock phone screen
3. Walk for 2-3 minutes
4. Unlock phone
5. Check route data

**Expected Results**:
- [ ] Tracking continues while phone locked
- [ ] Route coordinates recorded during locked period
- [ ] No gaps in route data
- [ ] Distance continues to update
- [ ] No crashes

**Actual Results**: _To be filled during testing_

---

### Test 1.4: Walk Completion
**Objective**: Verify route saves to database on walk end

**Steps**:
1. Complete a walk (0.5+ miles)
2. Tap "End Walk" button
3. Check database for walk record
4. Verify route data saved

**Expected Results**:
- [ ] GPS tracking stops
- [ ] Route simplified (check point count reduction)
- [ ] Elevation gain/loss calculated
- [ ] Average pace calculated
- [ ] Data saved to database
- [ ] route_coordinates field populated
- [ ] start_location and end_location saved

**Actual Results**: _To be filled during testing_

---

## Section 2: Edge Case Testing

### Test 2.1: Location Permission Denied
**Objective**: Verify graceful fallback when permission denied

**Steps**:
1. Deny location permission
2. Start a walk
3. Complete walk with steps only

**Expected Results**:
- [ ] App doesn't crash
- [ ] Walk continues with step counting
- [ ] Walk saves without GPS data
- [ ] User can still complete walk
- [ ] Appropriate error logged

**Actual Results**: _To be filled during testing_

---

### Test 2.2: Airplane Mode
**Objective**: Verify GPS works without network

**Steps**:
1. Enable airplane mode
2. Start a walk
3. Walk outdoors for 0.25 miles
4. End walk

**Expected Results**:
- [ ] GPS tracking works (no network needed)
- [ ] Coordinates recorded
- [ ] Route saves successfully
- [ ] No crashes

**Actual Results**: _To be filled during testing_

---

### Test 2.3: GPS Signal Loss
**Objective**: Verify app handles GPS loss gracefully

**Steps**:
1. Start a walk outdoors
2. Walk through tunnel or building
3. Return to open area
4. End walk

**Expected Results**:
- [ ] App doesn't crash during GPS loss
- [ ] GPS reconnects after signal returns
- [ ] Route has gap during loss period
- [ ] Walk completes successfully

**Actual Results**: _To be filled during testing_

---

### Test 2.4: Very Short Walk
**Objective**: Verify handling of minimal GPS data

**Steps**:
1. Start a walk
2. Walk for <1 minute (<10 GPS points)
3. End walk immediately

**Expected Results**:
- [ ] No crashes
- [ ] Walk saves with minimal route data
- [ ] Analytics handle edge case (few points)
- [ ] Database accepts data

**Actual Results**: _To be filled during testing_

---

### Test 2.5: Very Long Walk
**Objective**: Verify no memory leaks or performance issues

**Steps**:
1. Start a walk
2. Walk for 2+ hours (1000+ GPS points)
3. Monitor memory usage
4. End walk

**Expected Results**:
- [ ] No memory leaks
- [ ] App remains responsive
- [ ] Route simplification works
- [ ] Database storage reasonable (<50KB)
- [ ] No crashes

**Actual Results**: _To be filled during testing_

---

### Test 2.6: Indoor Walk
**Objective**: Verify handling of no GPS signal

**Steps**:
1. Start a walk indoors
2. Walk for 10 minutes
3. End walk

**Expected Results**:
- [ ] App doesn't crash
- [ ] Walk saves with steps only
- [ ] No GPS data recorded (expected)
- [ ] User experience smooth

**Actual Results**: _To be filled during testing_

---

## Section 3: Performance Testing

### Test 3.1: Route Simplification
**Objective**: Verify 50-90% storage reduction

**Steps**:
1. Complete a 1-mile walk
2. Check original route point count
3. Check simplified route point count
4. Calculate reduction percentage

**Expected Results**:
- [ ] Original route: 100-200 points
- [ ] Simplified route: 10-50 points
- [ ] Reduction: 50-90%
- [ ] Route shape preserved

**Actual Results**:
- Original points: _____
- Simplified points: _____
- Reduction: _____%

---

### Test 3.2: Database Storage
**Objective**: Verify storage efficiency

**Steps**:
1. Complete a 1-mile walk
2. Query database for walk record
3. Check route_coordinates field size

**Expected Results**:
- [ ] Walk record size <50KB
- [ ] JSON storage efficient
- [ ] Query performance good

**Actual Results**:
- Record size: _____ KB

---

### Test 3.3: Battery Drain
**Objective**: Verify <5% drain per hour

**Steps**:
1. Fully charge device
2. Note battery percentage
3. Start a walk
4. Walk for 1 hour
5. Note battery percentage

**Expected Results**:
- [ ] Battery drain <5% per hour
- [ ] Motion-based tracking efficient
- [ ] Background tracking optimized

**Actual Results**:
- Starting battery: _____%
- Ending battery: _____%
- Drain: _____%

---

### Test 3.4: Map Rendering
**Objective**: Verify smooth map performance

**Steps**:
1. Complete 3-5 walks with GPS
2. Navigate to Map tab
3. Observe map rendering
4. Pan and zoom map

**Expected Results**:
- [ ] Map loads within 2 seconds
- [ ] Routes render smoothly (60fps)
- [ ] No lag when panning/zooming
- [ ] Multiple routes display correctly

**Actual Results**: _To be filled during testing_

---

## Section 4: Cross-Platform Testing

### Test 4.1: iOS Testing
**Device**: _____  
**iOS Version**: _____

**Tests to Complete**:
- [ ] All basic functionality tests
- [ ] All edge case tests
- [ ] All performance tests
- [ ] Background tracking with phone locked
- [ ] Location permission flow

**Notes**: _____

---

### Test 4.2: Android Testing
**Device**: _____  
**Android Version**: _____

**Tests to Complete**:
- [ ] All basic functionality tests
- [ ] All edge case tests
- [ ] All performance tests
- [ ] Background tracking with phone locked
- [ ] Location permission flow
- [ ] Foreground service notification

**Notes**: _____

---

## Section 5: Integration Testing

### Test 5.1: Happy Path
**Objective**: Complete end-to-end user flow

**Steps**:
1. New user signs up
2. Grants location permission
3. Starts first walk
4. Walks 1 mile outdoors
5. Ends walk
6. Views walk on Map tab
7. Checks elevation and pace data

**Expected Results**:
- [ ] All steps complete without errors
- [ ] GPS data captured correctly
- [ ] Route displays on map
- [ ] Analytics calculated
- [ ] User experience smooth

**Actual Results**: _To be filled during testing_

---

### Test 5.2: Multi-Walk Scenario
**Objective**: Verify multiple walks in one day

**Steps**:
1. Complete 3 walks in one day
2. Each walk 0.5+ miles
3. Check database for all walks
4. View all routes on map

**Expected Results**:
- [ ] All walks save correctly
- [ ] All routes display on map
- [ ] Daily stats updated
- [ ] No data conflicts

**Actual Results**: _To be filled during testing_

---

## Test Results Summary

### Overall Status
- [ ] All tests passed
- [ ] Some tests failed (see notes)
- [ ] Testing incomplete

### Critical Issues Found
_List any critical issues that block release_

### Non-Critical Issues Found
_List any minor issues or improvements_

### Performance Metrics
- Battery drain: ____% per hour
- Route simplification: ____%
- Database storage: ____ KB per walk
- Map rendering: ____ seconds

### Recommendations
_Any recommendations for improvements or follow-up work_

---

## Sign-Off

**Tested By**: _____________________  
**Date**: _____________________  
**Status**: [ ] Approved [ ] Needs Work  
**Notes**: _____________________

