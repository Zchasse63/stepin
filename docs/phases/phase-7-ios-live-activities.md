# Phase 7: iOS Live Activities (Week 9)

[← Previous: Phase 6 - Launch Prep](phase-6-launch-prep.md) | [Back to README](README.md) | [Next: Phase 8 - Maps Foundation →](phase-8-maps-foundation.md)

---

## Overview

This phase implements iOS Live Activities to display real-time walk data on the lock screen and Dynamic Island. This feature provides 3.7× higher session engagement by allowing users to track their walks without unlocking their phone—critical for elderly users and those who want minimal phone interaction during walks.

**Timeline**: Week 9 (5-7 days)  
**Dependencies**: Phase 1-6 (Complete MVP with active walk tracking)  
**Platform**: iOS only (requires iOS 16.1+)

---

## Impact Analysis

### Existing Features Affected
- **Active Walk Store**: Will integrate Live Activity lifecycle (start/update/end)
- **Today Screen**: No changes needed (Live Activity is independent)
- **Step Tracking**: No changes needed (HealthKit remains source of truth)

### Non-Breaking Integration Strategy
- Live Activities are iOS-only; Android users unaffected
- Graceful fallback if Live Activities unavailable (iOS <16.1)
- Optional feature—app works fully without it
- No changes to existing walk data structure

### Compatibility Considerations
- Requires Xcode for Widget Extension creation
- Requires `npx expo prebuild` to generate native iOS project
- Requires iOS 16.1+ for Live Activities support
- Dynamic Island requires iPhone 14 Pro+ (graceful fallback to lock screen only)

---

## Acceptance Criteria

### Core Functionality
- [ ] **AC1**: Starting a walk displays Live Activity on lock screen within 2 seconds
- [ ] **AC2**: Live Activity shows elapsed time, current steps, distance, and progress ring
- [ ] **AC3**: Live Activity updates every 15-30 seconds with current metrics
- [ ] **AC4**: Tapping "Pause" button in Live Activity pauses the walk
- [ ] **AC5**: Tapping "End" button in Live Activity ends walk and saves data
- [ ] **AC6**: Live Activity dismisses automatically when walk ends

### Dynamic Island (iPhone 14 Pro+)
- [ ] **AC7**: Compact view shows walk icon and elapsed time
- [ ] **AC8**: Expanded view shows full metrics with interactive buttons
- [ ] **AC9**: Tapping Live Activity opens app to Today screen

### Performance & Battery
- [ ] **AC10**: Battery drain <5% per hour during active walk with Live Activity
- [ ] **AC11**: Live Activity survives phone locking for 2+ hours
- [ ] **AC12**: No crashes or memory leaks during extended walks

---

## Implementation Tasks

### Section 7.1: Xcode Widget Extension Setup

**Prerequisites**: 
- Run `npx expo prebuild` to generate iOS project
- Open `ios/stepin.xcworkspace` in Xcode

#### Task 7.1.1: Create Widget Extension
**Augment Code Prompt**:
```
Create iOS Widget Extension for Live Activities:

1. In Xcode, create new target:
   - File → New → Target → Widget Extension
   - Name: "StepinLiveActivity"
   - Check "Include Live Activity"
   - Language: Swift
   - Uncheck "Include Configuration Intent"

2. This creates:
   - StepinLiveActivity folder in iOS project
   - StepinLiveActivity.swift (main widget file)
   - Assets.xcassets for widget assets
   - Info.plist for widget configuration

3. Update widget bundle identifier:
   - Set to: com.stepin.app.StepinLiveActivity
   - Ensure it matches main app bundle + .StepinLiveActivity

4. Add widget to main app target:
   - In project settings, add StepinLiveActivity to "Embedded Content"
   - This allows app to start/update Live Activities

Verification:
- Widget target builds successfully
- No compilation errors
- Widget appears in Xcode target list
```

#### Task 7.1.2: Define Activity Attributes
**File**: `ios/StepinLiveActivity/StepinWalkAttributes.swift`

**Augment Code Prompt**:
```
Create StepinWalkAttributes.swift in iOS/StepinLiveActivity folder:

Import required frameworks:
- ActivityKit
- Foundation

Define StepinWalkAttributes struct:
- Conforms to ActivityAttributes protocol
- Properties (immutable, set at activity start):
  * walkId: String (unique identifier for this walk)
  * goalSteps: Int (user's daily step goal)
  * startTime: Date (when walk started)

Define nested ContentState struct:
- Conforms to Codable and Hashable
- Properties (mutable, updated during walk):
  * elapsedSeconds: Int (time since walk started)
  * currentSteps: Int (steps taken during walk)
  * distanceMeters: Double (distance covered in meters)
  * goalProgress: Double (0.0 to 1.0, percentage toward goal)

Example structure:
```swift
import ActivityKit
import Foundation

struct StepinWalkAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var elapsedSeconds: Int
        var currentSteps: Int
        var distanceMeters: Double
        var goalProgress: Double
    }
    
    var walkId: String
    var goalSteps: Int
    var startTime: Date
}
```

Verification:
- File compiles without errors
- Attributes and ContentState are properly defined
- Types match expected data from React Native
```

#### Task 7.1.3: Design Lock Screen UI
**File**: `ios/StepinLiveActivity/StepinLiveActivity.swift`

**Augment Code Prompt**:
```
Create StepinLiveActivity.swift with lock screen UI:

Import frameworks:
- ActivityKit
- WidgetKit
- SwiftUI

Define StepinLiveActivity struct:
- Conforms to Widget protocol
- Uses ActivityConfiguration<StepinWalkAttributes>

Lock Screen Layout (using SwiftUI):

Left Side (48×48pt):
- ZStack with circular progress ring
- Background: Gray circle
- Foreground: Green progress arc (based on goalProgress)
- Center: SF Symbol "figure.walk" icon (white, 24pt)

Right Side (VStack):
- Elapsed Time (top, largest):
  * Format: "MM:SS" or "H:MM:SS"
  * Font: .system(size: 28, weight: .bold, design: .rounded)
  * Color: Primary text
- Steps Row (HStack):
  * SF Symbol "figure.walk" (14pt, gray)
  * Step count (e.g., "1,234")
  * Font: .system(size: 14, weight: .semibold)
- Distance Row (HStack):
  * SF Symbol "map" (14pt, gray)
  * Distance (e.g., "0.5 mi")
  * Font: .system(size: 14, weight: .semibold)

Styling:
- Background: White with subtle shadow
- Padding: 16pt all sides
- Corner radius: 12pt
- Spacing: 8pt between elements

Helper Functions:
- formatDuration(_ seconds: Int) -> String
  * Returns "MM:SS" for <1 hour
  * Returns "H:MM:SS" for ≥1 hour
- formatDistance(_ meters: Double) -> String
  * Converts to miles: meters * 0.000621371
  * Returns "X.X mi" with 1 decimal place

Colors:
- Progress ring: Color(red: 0.3, green: 0.69, blue: 0.31) // Green #4CAF50
- Background: Color.white
- Text primary: Color.primary
- Text secondary: Color.gray

Verification:
- Lock screen UI renders correctly
- Progress ring animates smoothly
- Text is readable outdoors (high contrast)
- Layout adapts to different content sizes
```

#### Task 7.1.4: Design Dynamic Island UI
**Augment Code Prompt**:
```
Add Dynamic Island support to StepinLiveActivity.swift:

Within ActivityConfiguration, add dynamicIsland closure:

Compact Leading:
- SF Symbol "figure.walk" (14pt, green)

Compact Trailing:
- Elapsed time text (14pt, bold)
- Format: "MM:SS"

Minimal:
- SF Symbol "figure.walk" (12pt, green)

Expanded:
- Leading Region:
  * Walk icon (20pt)
  * Elapsed time (20pt, bold)
  * Vertical stack
- Trailing Region:
  * Steps count with icon
  * Distance with icon
  * Vertical stack, right-aligned
- Bottom Region:
  * HStack with two buttons:
    1. Pause button (SF Symbol "pause.fill", yellow background)
    2. End button (SF Symbol "stop.fill", red background)
  * Buttons: 44pt height, rounded, full width split

Button Actions:
- Pause: Triggers PauseWalkIntent (defined in next task)
- End: Triggers EndWalkIntent (defined in next task)

Styling:
- Background: System material (blurred)
- Text: White for visibility
- Buttons: Prominent, easy to tap
- Spacing: 12pt between elements

Verification:
- Compact view shows on Dynamic Island
- Expanded view shows when tapped
- Buttons are tappable and trigger intents
- Layout works on iPhone 14 Pro and 15 Pro
```

---

### Section 7.2: App Intents for Interactive Buttons

#### Task 7.2.1: Create Pause Walk Intent
**File**: `ios/StepinLiveActivity/PauseWalkIntent.swift`

**Augment Code Prompt**:
```
Create PauseWalkIntent.swift for pause button:

Import AppIntents framework

Define PauseWalkIntent struct:
- Conforms to AppIntent protocol
- Static var title: LocalizedStringResource = "Pause Walk"
- Static var description: IntentDescription? = "Pauses the current walk"

Implement perform() method:
- Post NotificationCenter notification
- Notification name: Notification.Name("pauseWalk")
- No user info needed
- Return .result()

Example:
```swift
import AppIntents
import Foundation

struct PauseWalkIntent: AppIntent {
    static var title: LocalizedStringResource = "Pause Walk"
    static var description: IntentDescription? = "Pauses the current walk"
    
    func perform() async throws -> some IntentResult {
        NotificationCenter.default.post(
            name: Notification.Name("pauseWalk"),
            object: nil
        )
        return .result()
    }
}
```

Verification:
- Intent compiles without errors
- Can be referenced from Live Activity buttons
- Notification posts successfully when triggered
```

#### Task 7.2.2: Create End Walk Intent
**File**: `ios/StepinLiveActivity/EndWalkIntent.swift`

**Augment Code Prompt**:
```
Create EndWalkIntent.swift for end button:

Same structure as PauseWalkIntent but:
- Title: "End Walk"
- Description: "Ends the current walk and saves data"
- Notification name: Notification.Name("endWalk")

Verification:
- Intent compiles without errors
- Notification name is unique from pause
- Can be triggered from Live Activity
```

---

### Section 7.3: Native Bridge Module

#### Task 7.3.1: Create Swift Bridge Module
**File**: `ios/StepinLiveActivityModule.swift`

**Augment Code Prompt**:
```
Create StepinLiveActivityModule.swift in ios/ folder:

Import frameworks:
- Foundation
- ActivityKit
- React (from React Native)

Define LiveActivityModule class:
- Extends NSObject
- Conforms to RCTBridgeModule protocol
- Add @objc(LiveActivityModule) annotation

Property:
- currentActivity: Activity<StepinWalkAttributes>? (stores active Live Activity)

Method: startActivity
- Parameters: attributes (NSDictionary), initialState (NSDictionary), resolver, rejecter
- Parse attributes into StepinWalkAttributes
- Parse initialState into ContentState
- Call Activity.request(attributes:content:pushType:) with .token
- Store in currentActivity property
- Resolve with activity.id string
- Handle errors: reject with error code and message

Method: updateActivity
- Parameters: activityId (String), state (NSDictionary), resolver, rejecter
- Parse state into ContentState
- Call currentActivity.update(using: contentState) in Task
- Resolve with true
- Handle errors gracefully

Method: endActivity
- Parameters: activityId (String), resolver, rejecter
- Call currentActivity.end(dismissalPolicy: .immediate) in Task
- Clear currentActivity property
- Resolve with true
- Handle errors gracefully

Static method: requiresMainQueueSetup
- Return false (module can be initialized on background thread)

Verification:
- Module compiles without errors
- Methods are properly exposed to React Native
- Activity lifecycle works (start/update/end)
- No memory leaks
```

#### Task 7.3.2: Create Objective-C Bridge Header
**File**: `ios/StepinLiveActivityModule.m`

**Augment Code Prompt**:
```
Create StepinLiveActivityModule.m for Objective-C bridge:

Import React/RCTBridgeModule.h

Use RCT_EXTERN_MODULE to expose module:
- Module name: LiveActivityModule
- No initializer needed

Use RCT_EXTERN_METHOD for each method:

1. startActivity:
   - Signature: startActivity:(NSDictionary *)attributes initialState:(NSDictionary *)state resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject

2. updateActivity:
   - Signature: updateActivity:(NSString *)activityId state:(NSDictionary *)state resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject

3. endActivity:
   - Signature: endActivity:(NSString *)activityId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject

Example:
```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivityModule, NSObject)

RCT_EXTERN_METHOD(startActivity:(NSDictionary *)attributes 
                  initialState:(NSDictionary *)state 
                  resolver:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateActivity:(NSString *)activityId 
                  state:(NSDictionary *)state 
                  resolver:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endActivity:(NSString *)activityId 
                  resolver:(RCTPromiseResolveBlock)resolve 
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

Verification:
- File compiles without errors
- Methods are accessible from JavaScript
- Promise-based API works correctly
```

---

### Section 7.4: TypeScript Integration

#### Task 7.4.1: Create Live Activity Manager
**File**: `lib/liveActivities/liveActivityManager.ts`

**Augment Code Prompt**:
```
Create TypeScript wrapper for Live Activity native module:

Import:
- NativeModules, NativeEventEmitter, Platform from 'react-native'

Define interfaces:
```typescript
interface LiveActivityState {
  elapsedSeconds: number;
  currentSteps: number;
  distanceMeters: number;
  goalProgress: number; // 0.0 - 1.0
}

interface LiveActivityAttributes {
  walkId: string;
  goalSteps: number;
  startTime: Date;
}
```

Create LiveActivityManager class:

Properties:
- activityId: string | null
- updateInterval: NodeJS.Timeout | null
- eventEmitter: NativeEventEmitter | null

Method: startActivity(attributes, initialState)
- Check Platform.OS === 'ios', return null if not
- Check iOS version ≥16.1, return null if not
- Convert Date to ISO string for native
- Call LiveActivityModule.startActivity()
- Store returned activityId
- Return activityId

Method: updateActivity(state)
- Check activityId exists, return early if not
- Call LiveActivityModule.updateActivity(activityId, state)
- Handle errors silently (log to console)

Method: endActivity()
- Check activityId exists
- Call LiveActivityModule.endActivity(activityId)
- Clear activityId and updateInterval
- Remove event listeners

Method: startAutoUpdate(getStateCallback, intervalMs = 15000)
- Clear existing interval if any
- Set interval to:
  * Call getStateCallback() to get current state
  * Call updateActivity(state)
- Store interval reference
- Return cleanup function

Method: onPauseTapped(callback)
- Create NativeEventEmitter if not exists
- Listen for 'pauseWalk' event
- Call callback when event received
- Return subscription for cleanup

Method: onEndTapped(callback)
- Same as onPauseTapped but for 'endWalk' event

Export singleton instance:
```typescript
export const liveActivityManager = new LiveActivityManager();
```

Verification:
- TypeScript compiles without errors
- Platform checks prevent crashes on Android
- Auto-update interval works correctly
- Event listeners clean up properly
```

---

### Section 7.5: Integration with Active Walk Store

#### Task 7.5.1: Update Active Walk Store
**File**: `lib/store/activeWalkStore.ts`

**Augment Code Prompt**:
```
Integrate Live Activities with active walk store:

Import liveActivityManager:
```typescript
import { liveActivityManager } from '@/lib/liveActivities/liveActivityManager';
```

In startWalk method, after setting isWalking state:

1. Start Live Activity:
```typescript
// Start Live Activity (iOS only)
const activityId = await liveActivityManager.startActivity(
  {
    walkId: `walk_${Date.now()}`,
    goalSteps: goalSteps,
    startTime: new Date()
  },
  {
    elapsedSeconds: 0,
    currentSteps: 0,
    distanceMeters: 0,
    goalProgress: 0
  }
);
```

2. Start auto-update:
```typescript
// Auto-update Live Activity every 15 seconds
liveActivityManager.startAutoUpdate(() => {
  const state = get();
  const elapsed = Math.floor((Date.now() - state.startTime.getTime()) / 1000);
  const progress = Math.min(state.currentSteps / goalSteps, 1.0);

  return {
    elapsedSeconds: elapsed,
    currentSteps: state.currentSteps,
    distanceMeters: state.distanceMeters || 0,
    goalProgress: progress
  };
}, 15000);
```

3. Add event listeners:
```typescript
// Listen for pause button tap from Live Activity
const pauseSubscription = liveActivityManager.onPauseTapped(() => {
  get().pauseWalk();
});

// Listen for end button tap from Live Activity
const endSubscription = liveActivityManager.onEndTapped(() => {
  get().endWalk();
});

// Store subscriptions for cleanup
set({
  liveActivitySubscriptions: [pauseSubscription, endSubscription]
});
```

In endWalk method, before clearing state:

```typescript
// End Live Activity
await liveActivityManager.endActivity();

// Clean up subscriptions
const subs = get().liveActivitySubscriptions || [];
subs.forEach(sub => sub.remove());
```

Add pauseWalk method if not exists:
```typescript
pauseWalk: () => {
  set({ isPaused: true });
  // Stop GPS tracking temporarily
  // Stop audio coaching
  // Keep Live Activity running but update state
},

resumeWalk: () => {
  set({ isPaused: false });
  // Resume GPS tracking
  // Resume audio coaching
}
```

Verification:
- Live Activity starts when walk starts
- Updates every 15 seconds with current metrics
- Pause button works from Live Activity
- End button works from Live Activity
- Live Activity dismisses when walk ends
- No memory leaks from subscriptions
```

---

## Testing Checklist

### Manual Testing (iOS Device Required)
- [ ] Start walk, verify Live Activity appears on lock screen within 2 seconds
- [ ] Lock phone, verify Live Activity persists
- [ ] Check elapsed time updates every 15-30 seconds
- [ ] Verify step count updates (may lag slightly, expected)
- [ ] Test Dynamic Island on iPhone 15 Pro (compact and expanded views)
- [ ] Tap pause button in Live Activity, verify walk pauses in app
- [ ] Tap end button in Live Activity, verify walk ends and data saves
- [ ] Test battery drain: <5% per hour during active walk
- [ ] Walk for 30+ minutes, verify no crashes or memory leaks
- [ ] Test with phone in pocket (screen off), verify updates continue

### Edge Cases
- [ ] Start walk, force quit app, verify Live Activity dismisses gracefully
- [ ] Start walk, airplane mode, verify Live Activity continues (no network needed)
- [ ] Start walk on iOS 15, verify graceful fallback (no Live Activity)
- [ ] Start walk on Android, verify no crashes (feature skipped)

### Performance
- [ ] Monitor memory usage during 1-hour walk (should stay <150MB)
- [ ] Check CPU usage (should be <5% average)
- [ ] Verify no battery drain complaints in TestFlight feedback

---

## Dependencies & Configuration

### Required Dependencies
```bash
# No new npm packages needed
# Live Activities use native iOS frameworks only
```

### iOS Configuration
**File**: `app.json`
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSSupportsLiveActivities": true
      }
    }
  }
}
```

### Build Configuration
```bash
# After creating Widget Extension in Xcode:
npx expo prebuild --clean

# This regenerates iOS project with new widget target
```

---

## Rollback Plan

If Live Activities cause issues:

1. **Disable Feature**:
   - Add feature flag in `lib/store/profileStore.ts`
   - Check flag before calling `liveActivityManager.startActivity()`
   - Default to `false` until stable

2. **Remove Native Code**:
   - Delete `ios/StepinLiveActivity` folder
   - Remove widget target from Xcode project
   - Remove `NSSupportsLiveActivities` from Info.plist

3. **Fallback Behavior**:
   - App continues to work normally
   - Walk tracking unaffected
   - Users see standard iOS notifications instead

---

## Success Metrics

### Adoption
- **Target**: 60%+ of iOS 16.1+ users enable Live Activities
- **Measurement**: Track `liveActivityManager.startActivity()` calls vs total walks

### Engagement
- **Target**: 3.7× higher session engagement (industry benchmark)
- **Measurement**: Compare walk completion rate with/without Live Activity

### Performance
- **Target**: <1% crash rate related to Live Activities
- **Measurement**: Monitor Sentry for Live Activity-related crashes

### Battery
- **Target**: <5% battery drain per hour during active walk
- **Measurement**: User feedback surveys, TestFlight reviews

---

## Next Steps

After Phase 7 completion:
1. Conduct internal testing with 5-10 iOS users
2. Collect feedback on UI/UX and battery usage
3. Fix any bugs discovered
4. Proceed to **Phase 8: Maps Foundation**

---

**Phase 7 Status**: Ready for implementation  
**Estimated Completion**: 5-7 days with AI assistance

