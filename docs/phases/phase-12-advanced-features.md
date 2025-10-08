# Phase 12: Advanced Features - Auto-Detection & Heart Rate (Week 15)

[← Previous: Phase 11 - Social Features](phase-11-social-features.md) | [Back to README](README.md) | [Next: Phase 13 - Testing & Polish →](phase-13-testing-polish.md)

---

## Overview

This phase adds two advanced features: workout auto-detection (automatically detect when user starts walking) and heart rate zones (display HR data during walks with zone analysis).

**Timeline**: Week 15 (5-7 days)  
**Dependencies**: Phase 1-11 (Complete MVP with all features)  
**Platform**: iOS (HealthKit) and Android (Google Fit)

---

## Impact Analysis

### Existing Features Affected
- **Health Service**: Add workout detection and HR streaming
- **Active Walk Store**: Add HR tracking and auto-start capability
- **Walk Records**: Save HR zone data
- **Profile Settings**: Add auto-detection toggle

### Non-Breaking Integration Strategy
- Both features are optional
- Auto-detection requires user opt-in
- HR zones only show if Apple Watch/wearable connected
- Graceful fallback if features unavailable

---

## Acceptance Criteria

### Workout Auto-Detection
- [ ] **AC1**: Notification appears after 5-10 minutes of continuous walking
- [ ] **AC2**: User can accept (start tracking) or dismiss notification
- [ ] **AC3**: Accepting starts walk retroactively from detected start time
- [ ] **AC4**: Steps counted from detected start time
- [ ] **AC5**: Can be disabled in settings
- [ ] **AC6**: No false positives (driving, cycling)

### Heart Rate Zones
- [ ] **AC7**: HR displays in real-time during walk (if available)
- [ ] **AC8**: Zone indicator shows current zone (1-5) with color
- [ ] **AC9**: Zone description provides guidance
- [ ] **AC10**: Post-walk analytics show time in each zone
- [ ] **AC11**: Average and max HR saved with walk
- [ ] **AC12**: Works without wearable (graceful fallback)

---

## Implementation Tasks

### Section 12.1: Workout Auto-Detection

#### Task 12.1.1: Enable HealthKit Workout Detection (iOS)
**File**: `lib/health/HealthKitService.ts`

**Augment Code Prompt**:
```
Add workout auto-detection to HealthKit service:

Method: getAutoDetectedWorkouts(startDate, endDate)
- Query HKWorkoutType.walking with HKQueryAnchor
- Filter for workouts where metadata indicates auto-detection
- Return array of AutoDetectedWorkout objects:
  * id: workout UUID
  * startTime: Date
  * endTime: Date
  * type: 'walking' | 'running'
  * steps: from workout.totalSteps or estimate
  * distance: meters
  * duration: seconds
  * autoDetected: boolean
- Handle errors gracefully, return empty array

Method: startActivityRecognition()
- Set up HKObserverQuery for workout detection
- Listen for new walking workouts
- When detected, check if user already tracking
- If not, trigger notification

Method: stopActivityRecognition()
- Stop and remove observer query

Verification:
- Detects walking workouts automatically
- No false positives (driving, cycling filtered out)
- Notification triggers correctly
```

#### Task 12.1.2: Enable Activity Recognition (Android)
**Augment Code Prompt**:
```
Install Google Fit for Android:

```bash
npm install @react-native-community/google-fit
```

Update lib/health/HealthConnectService.ts:

Method: startActivityRecognition()
- Use Google Fit Activity Recognition API
- Subscribe to walking/running activities
- Filter for confidence > 0.7
- Trigger notification when walking detected

Method: onWalkingDetected(activity)
- Check if user already tracking (AsyncStorage flag)
- If not, schedule notification:
  * Title: "Looks like you're walking! 🚶"
  * Body: "Want to track this walk?"
  * Action buttons: "Start Tracking" | "Dismiss"
- Store detected activity startTime in notification data

Verification:
- Activity recognition works on Android
- Notification appears correctly
- Action buttons functional
```

#### Task 12.1.3: Handle Auto-Detection Notifications
**File**: `app/_layout.tsx`

**Augment Code Prompt**:
```
Add notification response listener in root layout:

useEffect:
- Listen for notification responses
- Check notification data type === 'auto_detect_walk'
- If action === 'start_tracking':
  * Extract startTime from notification data
  * Call activeWalkStore.startWalk with retroactive flag
  * Navigate to Today screen
- If dismissed, do nothing
- Remove listener on cleanup

Verification:
- Tapping "Start Tracking" starts walk retroactively
- Steps counted from detected start time
- Dismissing notification does nothing
```

#### Task 12.1.4: Retroactive Data Capture
**File**: `lib/store/activeWalkStore.ts`

**Augment Code Prompt**:
```
Modify startWalk to accept retroactive option:

```typescript
startWalk: async (goalSteps: number, options?: { 
  retroactive?: boolean; 
  startTime?: Date 
}) => {
  const startTime = options?.startTime || new Date();
  
  set({ 
    isWalking: true, 
    startTime,
    autoDetected: options?.retroactive || false
  });
  
  if (options?.retroactive) {
    // Query HealthKit for steps between startTime and now
    const retroSteps = await healthService.getStepsForDateRange(
      startTime,
      new Date()
    );
    
    set({ currentSteps: retroSteps });
    
    // Start GPS from now (can't retroactively capture GPS)
    await gpsTracker.startTracking(/* ... */);
  } else {
    // Normal start (existing logic)
    await gpsTracker.startTracking(/* ... */);
  }
  
  // ... rest of existing code
}
```

When saving walk, include auto_detected flag in database

Verification:
- Retroactive walks start from detected time
- Steps counted correctly from start time
- GPS starts from current time (not retroactive)
- auto_detected flag saved to database
```

#### Task 12.1.5: Auto-Detection Settings
**File**: `app/(tabs)/profile.tsx`

**Augment Code Prompt**:
```
Add auto-detection toggle to Profile settings:

Add "Workout Auto-Detection" section:

Toggle: "Auto-detect walks"
- Bound to profile.auto_detect_enabled
- Description: "Get notified when you start walking"
- On toggle:
  * Update profile in Supabase
  * If enabled, call healthService.startActivityRecognition()
  * If disabled, call healthService.stopActivityRecognition()
- Default: enabled for new users

Database migration:
```sql
ALTER TABLE public.profiles
ADD COLUMN auto_detect_enabled boolean DEFAULT true;
```

Verification:
- Toggle persists across app restarts
- Enabling starts activity recognition
- Disabling stops notifications
```

---

### Section 12.2: Heart Rate Zones

#### Task 12.2.1: Query Heart Rate from HealthKit
**File**: `lib/health/HealthKitService.ts`

**Augment Code Prompt**:
```
Add heart rate querying to HealthKit service:

Method: getCurrentHeartRate()
- Query HKQuantityType.heartRate
- Return most recent sample (limit: 1, descending)
- Return BPM as number, or null if unavailable

Method: streamHeartRate(callback)
- Use HKObserverQuery for real-time updates
- Call callback with HR value (BPM) when new sample arrives
- Store observer reference for cleanup

Method: stopHeartRateStream()
- Stop and remove observer query

Similar implementation for HealthConnectService (Android):
- Use Health Connect heart rate data type
- Query and stream using same interface

Verification:
- HR queries work with Apple Watch connected
- Streaming provides real-time updates
- Graceful fallback if no wearable
```

#### Task 12.2.2: Calculate Heart Rate Zones
**File**: `lib/utils/heartRateZones.ts`

**Augment Code Prompt**:
```
Create heart rate zone utilities:

Function: calculateMaxHeartRate(age, customMax?)
- Return customMax if provided
- Else return 220 - age

Function: getHeartRateZone(currentHR, maxHR)
- Calculate percentage: (currentHR / maxHR) * 100
- Return zone object:
  * zone: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5'
  * percentage: number
  * label: string
  * color: string
- Zones:
  * <50%: Zone 1 (Very Light, Blue)
  * 50-60%: Zone 2 (Light, Green)
  * 60-70%: Zone 3 (Moderate, Yellow)
  * 70-80%: Zone 4 (Hard, Orange)
  * 80%+: Zone 5 (Maximum, Red)

Function: calculateZoneTime(heartRateSamples, maxHR)
- Loop through samples
- Calculate time spent in each zone
- Return HeartRateZones object:
  * zone1_seconds: number
  * zone2_seconds: number
  * zone3_seconds: number
  * zone4_seconds: number
  * zone5_seconds: number

Export all functions

Verification:
- Zone calculations accurate
- Colors appropriate for intensity
- Time calculations correct
```

#### Task 12.2.3: Display Heart Rate During Walk
**File**: `components/HeartRateDisplay.tsx`

**Augment Code Prompt**:
```
Create component to display HR during walk:

Props:
- currentHR: number
- maxHR: number

Layout:
- Heart icon + current HR in BPM
- Zone badge with background color matching zone
- Zone label (e.g., "Moderate")
- Zone description (supportive language)

Styling:
- zoneBadge: rounded pill, colored background, white text
- hrText: 18pt bold
- zoneLabel: 14pt, colored to match zone
- zoneDescription: 12pt gray, reassuring guidance

Zone descriptions:
- Zone 1: "Perfect for recovery and warm-up"
- Zone 2: "Great for building endurance"
- Zone 3: "Improving aerobic fitness"
- Zone 4: "Building strength and speed"
- Zone 5: "Maximum effort—be careful!"

Verification:
- HR displays correctly
- Zone indicator updates in real-time
- Colors match zone intensity
- Descriptions are encouraging, not aggressive
```

#### Task 12.2.4: Integrate HR with Active Walk
**File**: `lib/store/activeWalkStore.ts`

**Augment Code Prompt**:
```
Add heart rate streaming to active walk store:

Add state fields:
- heartRateSamples: Array<{hr: number, timestamp: Date}>
- currentHeartRate: number | null
- currentHeartRateZone: string | null
- userAge: number (from profile)
- customMaxHR?: number (from profile, optional)

In startWalk():
- Check if HR streaming available
- If yes, call healthService.streamHeartRate(callback)
- Callback:
  * Calculate zone using getHeartRateZone()
  * Update currentHeartRate and currentHeartRateZone state
  * Push sample to heartRateSamples array

In endWalk():
- Call healthService.stopHeartRateStream()
- Calculate zone time using calculateZoneTime()
- Calculate avg HR and max HR from samples
- Include in walk data:
  * max_heart_rate: number
  * avg_heart_rate: number
  * heart_rate_zones: HeartRateZones

Database migration:
```sql
ALTER TABLE public.walks
ADD COLUMN max_heart_rate integer,
ADD COLUMN avg_heart_rate integer,
ADD COLUMN heart_rate_zones jsonb;
```

Verification:
- HR streams during walk
- Zone updates in real-time
- Analytics calculated correctly
- Data saves to database
```

#### Task 12.2.5: Heart Rate Zone Chart
**File**: `components/HeartRateZoneChart.tsx`

**Augment Code Prompt**:
```
Create component for post-walk HR zone analysis:

Props:
- zones: HeartRateZones

Layout:
- Title: "Heart Rate Zones"
- Horizontal stacked bar chart:
  * Each zone is a colored segment
  * Width proportional to time in zone
- Zone breakdown list:
  * Colored dot indicator
  * Zone name
  * Time duration (MM:SS format)

Colors:
- Zone 1: Blue (#64B5F6)
- Zone 2: Green (#81C784)
- Zone 3: Yellow (#FFD54F)
- Zone 4: Orange (#FF8A65)
- Zone 5: Red (#E57373)

Verification:
- Chart displays correctly
- Proportions accurate
- Colors match zones
- Time formatting correct
```

---

## Testing Checklist

### Auto-Detection
- [ ] Walk for 8 minutes without starting tracking
- [ ] Verify notification appears
- [ ] Tap "Start Tracking", verify walk starts retroactively
- [ ] Check steps counted from detected start time
- [ ] Dismiss notification, verify no tracking starts
- [ ] Toggle off in settings, walk 10 min, verify no notification

### Heart Rate Zones
- [ ] Start walk with Apple Watch connected
- [ ] Verify HR displays in real-time
- [ ] Check zone indicator updates (color changes)
- [ ] End walk, view HR zone chart
- [ ] Verify zone time distribution accurate
- [ ] Walk without watch, verify graceful fallback

### Edge Cases
- [ ] Auto-detect while driving (should not trigger)
- [ ] Auto-detect while cycling (should not trigger)
- [ ] HR streaming with disconnected watch
- [ ] HR streaming with low battery watch
- [ ] Multiple auto-detect notifications (should not spam)

---

## Dependencies

### New Dependencies
```json
{
  "@react-native-community/google-fit": "^0.8.0"
}
```

### Database Migrations
```sql
-- Auto-detection
ALTER TABLE public.profiles
ADD COLUMN auto_detect_enabled boolean DEFAULT true;

-- Heart rate zones
ALTER TABLE public.walks
ADD COLUMN max_heart_rate integer,
ADD COLUMN avg_heart_rate integer,
ADD COLUMN heart_rate_zones jsonb;
```

---

## Success Metrics

### Auto-Detection
- **Target**: 50%+ of walks auto-detected
- **Measurement**: Walks with auto_detected = true

### Heart Rate
- **Target**: 20%+ of walks include HR data
- **Measurement**: Walks with max_heart_rate not null

### Accuracy
- **Target**: <5% false positive rate for auto-detection
- **Measurement**: User feedback, manual review

---

## Next Steps

After Phase 12 completion:
1. Test auto-detection accuracy
2. Verify HR zone calculations
3. Proceed to **Phase 13: Testing & Polish**

---

**Phase 12 Status**: Ready for implementation  
**Estimated Completion**: 5-7 days with AI assistance

