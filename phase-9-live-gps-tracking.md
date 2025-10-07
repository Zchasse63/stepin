# Phase 9: Live GPS Tracking & Route Recording (Week 11)

[← Previous: Phase 8 - Maps Foundation](phase-8-maps-foundation.md) | [Back to README](README.md) | [Next: Phase 10 - Weather & Audio →](phase-10-weather-audio.md)

---

## Overview

This phase implements live GPS tracking during walks using motion-detection to optimize battery life. Routes are recorded, simplified, and saved with elevation data and pace analytics.

**Timeline**: Week 11 (5-7 days)  
**Dependencies**: Phase 8 (Maps foundation must be complete)  
**Battery Target**: 3-5% drain per hour (vs 10-15% for naive implementations)

---

## Impact Analysis

### Existing Features Affected
- **Active Walk Store**: Add GPS tracking lifecycle
- **Walk Completion**: Save route data to database
- **Today Screen**: Show distance from GPS (optional override)

### Non-Breaking Integration Strategy
- GPS tracking is optional—users can decline location permissions
- Existing manual walk logging continues to work
- Step counting remains primary metric (GPS adds context)
- Graceful fallback if GPS unavailable (indoor walks)

---

## Acceptance Criteria

- [ ] **AC1**: Starting a walk begins GPS tracking automatically
- [ ] **AC2**: Route coordinates recorded every 10-50 meters (motion-based)
- [ ] **AC3**: GPS tracking continues in background with phone locked
- [ ] **AC4**: Route simplification reduces storage by 50-90%
- [ ] **AC5**: Elevation gain/loss calculated from altitude data
- [ ] **AC6**: Average pace calculated (minutes per mile/km)
- [ ] **AC7**: Battery drain <5% per hour during tracking
- [ ] **AC8**: Route saves to database on walk completion
- [ ] **AC9**: GPS works offline (no network required)
- [ ] **AC10**: Indoor walks work without GPS (steps only)

---

## Implementation Tasks

### Section 9.1: Background Geolocation Setup

#### Task 9.1.1: Install Background Geolocation
**Augment Code Prompt**:
```
Install react-native-background-geolocation for battery-optimized GPS tracking:

1. Install package:
```bash
npm install react-native-background-geolocation@^4.16.2
```

2. Update app.json to include plugin:
```json
{
  "expo": {
    "plugins": [
      "react-native-background-geolocation"
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["location"],
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Stepin tracks your walks in the background so you can keep your phone in your pocket. Your location data stays private and is never shared.",
        "NSLocationWhenInUseUsageDescription": "Stepin needs your location to map your walking routes and provide accurate distance tracking."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

3. Run prebuild:
```bash
npx expo prebuild --clean
```

Verification:
- Package installs without errors
- iOS Info.plist has location permissions
- Android manifest has location permissions
- Background location mode enabled
```

---

### Section 9.2: GPS Tracker Service

#### Task 9.2.1: Create GPS Tracker Class
**File**: `lib/gps/gpsTracker.ts`

**Augment Code Prompt**:
```
Create GPSTracker service for background GPS tracking:

Import BackgroundGeolocation:
```typescript
import BackgroundGeolocation from 'react-native-background-geolocation';
import type { GeoCoordinate } from '@/types/database';
```

Define GPSTracker class:

Properties:
- isConfigured: boolean
- currentRoute: GeoCoordinate[]
- onLocationUpdate: ((coord: GeoCoordinate) => void) | null

Method: configure()
- Call BackgroundGeolocation.ready() with config:
  * desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH
  * distanceFilter: 10 (meters - update every 10m, not time-based)
  * stopTimeout: 5 (minutes - stop after stationary)
  * stopOnStationary: false
  * preventSuspend: true
  * heartbeatInterval: 60 (seconds)
  * iOS specific:
    - locationAuthorizationRequest: 'WhenInUse'
    - pausesLocationUpdatesAutomatically: false
  * Android specific:
    - notification: {
        title: "Stepin is tracking your walk",
        text: "Tap to return to app",
        priority: "LOW",
        color: "#4CAF50"
      }
    - foregroundService: true
- Register BackgroundGeolocation.onLocation listener
- Register BackgroundGeolocation.onMotionChange listener
- Set isConfigured = true

Method: handleLocation(location)
- Convert to GeoCoordinate:
  * lat: location.coords.latitude
  * lng: location.coords.longitude
  * timestamp: new Date(location.timestamp).toISOString()
  * altitude: location.coords.altitude
  * accuracy: location.coords.accuracy
  * speed: location.coords.speed
- Push to currentRoute array
- Call onLocationUpdate callback if exists
- Log to console for debugging

Method: startTracking(onUpdate)
- Call configure() if not configured
- Clear currentRoute array
- Set onLocationUpdate callback
- Call BackgroundGeolocation.start()
- Return promise that resolves when tracking starts

Method: stopTracking()
- Call BackgroundGeolocation.stop()
- Copy currentRoute to return variable
- Clear currentRoute and callback
- Return copied route

Method: getCurrentPosition()
- Call BackgroundGeolocation.getCurrentPosition with:
  * timeout: 30 seconds
  * maximumAge: 5000
  * desiredAccuracy: 10
- Return GeoCoordinate or null on error

Method: simplifyRoute(route, tolerance = 0.00001)
- Implement Ramer-Douglas-Peucker algorithm
- Base case: if route.length <= 2, return route
- Find point with max perpendicular distance from line (first to last)
- If maxDistance > tolerance:
  * Recursively simplify left segment
  * Recursively simplify right segment
  * Concatenate results
- Else return [first, last]
- Helper: perpendicularDistance(point, lineStart, lineEnd)

Export singleton:
```typescript
export const gpsTracker = new GPSTracker();
```

Verification:
- GPS tracking starts without errors
- Location updates received every 10-50 meters
- Motion detection works (stops when stationary)
- Background tracking continues with phone locked
- Route simplification reduces points by 50-90%
```

---

### Section 9.3: Route Analytics Utilities

#### Task 9.3.1: Create Route Analytics
**File**: `lib/utils/routeAnalytics.ts`

**Augment Code Prompt**:
```
Create utilities for route analysis:

Import types:
```typescript
import type { GeoCoordinate } from '@/types/database';
```

Function: calculateDistance(coord1, coord2)
- Haversine formula for distance between two lat/lng points
- Earth radius: 6371e3 meters
- Convert lat/lng to radians
- Calculate Δφ and Δλ
- Apply formula: a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
- c = 2 × atan2(√a, √(1−a))
- distance = R × c
- Return distance in meters

Function: calculateElevationGain(route)
- Loop through route, compare consecutive altitudes
- Sum positive differences (altitude increases)
- Return total gain in meters, rounded to 1 decimal
- Handle missing altitude data gracefully

Function: calculateElevationLoss(route)
- Same as gain but sum negative differences
- Return absolute value

Function: calculateAveragePace(route, distanceMeters)
- Get duration from first and last timestamps
- Convert to minutes
- Calculate pace: minutes / (distanceMeters / 1609.34) for miles
- Or: minutes / (distanceMeters / 1000) for kilometers
- Return pace in minutes per mile/km

Function: calculatePaceSegments(route, segmentMeters = 1609.34)
- Track cumulative distance
- When segment distance reached:
  * Calculate time elapsed for segment
  * Calculate pace for that segment
  * Push to segments array
- Return array of {startIndex, endIndex, pace, distance}

Function: generateElevationProfile(route)
- Track cumulative distance
- For each point, return {distance, elevation}
- Return array for charting

Export all functions

Verification:
- Distance calculation accurate (compare to Google Maps)
- Elevation gain/loss reasonable for terrain
- Pace calculations match expected values
- No crashes with edge cases (0 points, 1 point, missing altitude)
```

---

### Section 9.4: Integration with Active Walk Store

#### Task 9.4.1: Add GPS to Active Walk
**File**: `lib/store/activeWalkStore.ts`

**Augment Code Prompt**:
```
Integrate GPS tracking with active walk store:

Import:
```typescript
import { gpsTracker } from '@/lib/gps/gpsTracker';
import { calculateDistance, calculateElevationGain, calculateElevationLoss, calculateAveragePace } from '@/lib/utils/routeAnalytics';
```

Add state fields:
- route: GeoCoordinate[]
- startLocation: Location | null
- endLocation: Location | null
- isTrackingGPS: boolean
- distanceMeters: number

In startWalk method:

1. Get starting location:
```typescript
const startLoc = await gpsTracker.getCurrentPosition();
if (startLoc) {
  set({ 
    startLocation: {
      lat: startLoc.lat,
      lng: startLoc.lng
    }
  });
}
```

2. Start GPS tracking:
```typescript
await gpsTracker.startTracking((coord) => {
  const state = get();
  const newRoute = [...state.route, coord];
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 1; i < newRoute.length; i++) {
    totalDistance += calculateDistance(newRoute[i-1], newRoute[i]);
  }
  
  set({ 
    route: newRoute,
    distanceMeters: totalDistance,
    isTrackingGPS: true
  });
});
```

In endWalk method:

1. Stop GPS tracking:
```typescript
const fullRoute = await gpsTracker.stopTracking();
```

2. Simplify route:
```typescript
const simplifiedRoute = gpsTracker.simplifyRoute(fullRoute, 0.00001);
```

3. Calculate analytics:
```typescript
const elevationGain = calculateElevationGain(simplifiedRoute);
const elevationLoss = calculateElevationLoss(simplifiedRoute);
const averagePace = calculateAveragePace(simplifiedRoute, get().distanceMeters);
```

4. Get end location:
```typescript
const endLocation = simplifiedRoute.length > 0 
  ? {
      lat: simplifiedRoute[simplifiedRoute.length - 1].lat,
      lng: simplifiedRoute[simplifiedRoute.length - 1].lng
    }
  : null;
```

5. Include in walk data:
```typescript
const walkData = {
  // ... existing fields
  route_coordinates: simplifiedRoute,
  start_location: get().startLocation,
  end_location: endLocation,
  elevation_gain: elevationGain,
  elevation_loss: elevationLoss,
  average_pace: averagePace,
  distance_meters: get().distanceMeters
};
```

6. Save to database:
```typescript
await supabase.from('walks').insert(walkData);
```

Verification:
- GPS starts when walk starts
- Route coordinates accumulate during walk
- Distance updates in real-time
- Route simplification works
- All analytics calculated correctly
- Data saves to database successfully
```

---

## Testing Checklist

### Manual Testing
- [ ] Start walk, verify GPS tracking begins
- [ ] Walk 0.25 miles, check route records coordinates
- [ ] Lock phone, verify tracking continues
- [ ] Walk indoors (no GPS), verify app doesn't crash
- [ ] End walk, verify route saves to database
- [ ] Check route appears on Map tab
- [ ] Verify elevation gain/loss reasonable
- [ ] Check average pace calculation
- [ ] Test battery drain: <5% per hour
- [ ] Walk for 1+ hour, verify no memory leaks

### Edge Cases
- [ ] Start walk with location permission denied (graceful fallback)
- [ ] Walk in airplane mode (GPS works, no network needed)
- [ ] Walk through tunnel (GPS loss, then reconnect)
- [ ] Very short walk (<1 minute, <10 points)
- [ ] Very long walk (2+ hours, 1000+ points)
- [ ] Walk with phone in pocket (screen off)

### Performance
- [ ] Route simplification reduces points by 50-90%
- [ ] Database storage <50KB per walk
- [ ] Map renders smoothly with simplified route
- [ ] No lag when recording coordinates

---

## Success Metrics

### Adoption
- **Target**: 40%+ of walks include GPS routes
- **Measurement**: Walks with route_coordinates vs total

### Battery
- **Target**: <5% drain per hour
- **Measurement**: User feedback, TestFlight reviews

### Accuracy
- **Target**: Distance within 5% of Google Maps
- **Measurement**: Compare sample walks to Google Maps

---

## Next Steps

After Phase 9 completion:
1. Test GPS tracking on multiple devices
2. Verify battery optimization works
3. Proceed to **Phase 10: Weather & Audio Coaching**

---

**Phase 9 Status**: Ready for implementation  
**Estimated Completion**: 5-7 days with AI assistance

