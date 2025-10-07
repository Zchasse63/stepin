# Phase 8: Maps Foundation & Display (Week 10)

[← Previous: Phase 7 - iOS Live Activities](phase-7-ios-live-activities.md) | [Back to README](README.md) | [Next: Phase 9 - Live GPS Tracking →](phase-9-live-gps-tracking.md)

---

## Overview

This phase establishes the maps foundation using Mapbox and creates the infrastructure for displaying past walk routes. Users will be able to view their walking history on an interactive map with route polylines, start/end markers, and route details.

**Timeline**: Week 10 (5-7 days)  
**Dependencies**: Phase 1-6 (Complete MVP), Phase 7 (Optional, can run in parallel)  
**Platform**: iOS and Android

---

## Impact Analysis

### Existing Features Affected
- **Database Schema**: Add route tracking fields to `walks` table
- **Walk Type**: Extend with GPS coordinate arrays and location data
- **History Screen**: Add map preview option for walks with routes
- **Navigation**: Add new Map tab to bottom navigation

### Non-Breaking Integration Strategy
- All new fields in `walks` table are optional (nullable)
- Existing walks without GPS data continue to work
- Map tab shows empty state if no GPS walks exist
- Graceful fallback if Mapbox token invalid or network unavailable

### Compatibility Considerations
- Mapbox requires API token (free tier: 50k loads/month)
- Works offline with cached map tiles
- Requires location permissions (optional, user can decline)
- Vector tiles reduce battery drain vs raster maps

---

## Acceptance Criteria

### Core Functionality
- [ ] **AC1**: Map tab displays in bottom navigation between History and Profile
- [ ] **AC2**: Map screen shows all walks with GPS routes from last 30 days
- [ ] **AC3**: Route polylines render in green color with 4px width
- [ ] **AC4**: Start markers (green) and end markers (red) display correctly
- [ ] **AC5**: Tapping a marker opens walk details sheet
- [ ] **AC6**: Map auto-fits bounds to show all routes
- [ ] **AC7**: Empty state displays when no GPS walks exist

### Database & Types
- [ ] **AC8**: Database migration adds route fields without breaking existing data
- [ ] **AC9**: TypeScript types updated for GPS coordinates and locations
- [ ] **AC10**: Walks query includes route data when available

### Performance
- [ ] **AC11**: Map renders smoothly at 60fps with 10+ routes
- [ ] **AC12**: Map loads within 2 seconds on 4G connection
- [ ] **AC13**: Offline cached tiles work without network

---

## Implementation Tasks

### Section 8.1: Database Schema Updates

#### Task 8.1.1: Add Route Tracking Fields
**Augment Code Prompt**:
```
Execute database migration to add GPS route tracking fields to walks table:

Run this SQL in Supabase SQL Editor:

```sql
-- Add route tracking columns to walks table
ALTER TABLE public.walks
ADD COLUMN route_coordinates jsonb,
ADD COLUMN start_location jsonb,
ADD COLUMN end_location jsonb,
ADD COLUMN elevation_gain numeric(10,2),
ADD COLUMN elevation_loss numeric(10,2),
ADD COLUMN average_pace numeric(10,2),
ADD COLUMN weather_conditions jsonb,
ADD COLUMN auto_detected boolean DEFAULT false;

-- Add indexes for performance
CREATE INDEX idx_walks_route_coordinates ON public.walks USING gin (route_coordinates);
CREATE INDEX idx_walks_date_user ON public.walks (user_id, date DESC);

-- Add check constraint for route_coordinates format
ALTER TABLE public.walks
ADD CONSTRAINT check_route_coordinates_format
CHECK (
  route_coordinates IS NULL OR
  jsonb_typeof(route_coordinates) = 'array'
);

-- Add comments for documentation
COMMENT ON COLUMN public.walks.route_coordinates IS 'Array of GPS coordinates with timestamps: [{lat, lng, timestamp, altitude}]';
COMMENT ON COLUMN public.walks.start_location IS 'Starting location: {lat, lng, address}';
COMMENT ON COLUMN public.walks.end_location IS 'Ending location: {lat, lng, address}';
COMMENT ON COLUMN public.walks.elevation_gain IS 'Total elevation gained in meters';
COMMENT ON COLUMN public.walks.elevation_loss IS 'Total elevation lost in meters';
COMMENT ON COLUMN public.walks.average_pace IS 'Average pace in minutes per mile/km';
COMMENT ON COLUMN public.walks.weather_conditions IS 'Weather snapshot: {temperature, condition, humidity, wind_speed}';
COMMENT ON COLUMN public.walks.auto_detected IS 'True if walk was auto-detected, false if manually started';
```

Verification:
- All columns added successfully
- Indexes created without errors
- Existing walks remain intact (new fields are NULL)
- Check constraint validates route_coordinates format
```

#### Task 8.1.2: Update TypeScript Types
**File**: `types/database.ts`

**Augment Code Prompt**:
```
Update TypeScript types for GPS route tracking:

Add new interfaces:

```typescript
export interface GeoCoordinate {
  lat: number;
  lng: number;
  timestamp: string; // ISO 8601 format
  altitude?: number; // meters
  accuracy?: number; // meters
  speed?: number; // meters per second
}

export interface Location {
  lat: number;
  lng: number;
  address?: string; // reverse geocoded address
}

export interface WeatherConditions {
  temperature: number; // Fahrenheit
  feels_like: number;
  condition: string; // 'clear', 'rain', 'clouds', 'snow', etc.
  description: string; // human-readable description
  humidity: number; // percentage
  wind_speed: number; // mph
  icon: string; // OpenWeather icon code
}
```

Update Walk interface:

```typescript
export interface Walk {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  duration_minutes?: number;
  distance_meters?: number;
  
  // New GPS route fields
  route_coordinates?: GeoCoordinate[];
  start_location?: Location;
  end_location?: Location;
  elevation_gain?: number;
  elevation_loss?: number;
  average_pace?: number; // minutes per mile/km
  weather_conditions?: WeatherConditions;
  auto_detected: boolean;
  
  created_at: string;
  updated_at: string;
}
```

Verification:
- TypeScript compiles without errors
- All new fields are optional (except auto_detected with default)
- Types match database schema exactly
- Existing code using Walk interface still works
```

---

### Section 8.2: Mapbox Installation & Configuration

#### Task 8.2.1: Install Mapbox SDK
**Augment Code Prompt**:
```
Install and configure Mapbox for React Native:

1. Install Mapbox package:
```bash
npm install @rnmapbox/maps@^10.1.30
```

2. Update app.json to include Mapbox plugin:
```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": "YOUR_MAPBOX_TOKEN_HERE"
        }
      ]
    ]
  }
}
```

3. Create .env file (if not exists) and add:
```
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Update app.json to use environment variable:
```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": "${EXPO_PUBLIC_MAPBOX_TOKEN}"
        }
      ]
    ]
  }
}
```

5. Run prebuild to generate native configuration:
```bash
npx expo prebuild --clean
```

6. For iOS, update Info.plist (if not already present):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Stepin needs your location to map your walking routes and provide accurate distance tracking.</string>
```

7. For Android, update AndroidManifest.xml (if not already present):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Verification:
- Package installs without errors
- Prebuild completes successfully
- iOS and Android projects build without errors
- Mapbox token is properly configured
```

#### Task 8.2.2: Get Mapbox Token
**Manual Step**:
```
1. Create account at mapbox.com
2. Navigate to Account → Tokens
3. Create new token with default scopes:
   - Public scopes: All checked
   - Secret scopes: None needed for mobile
4. Copy token to .env file as EXPO_PUBLIC_MAPBOX_TOKEN
5. Keep token secure (add .env to .gitignore)

Free tier limits:
- 50,000 map loads per month
- Unlimited offline map downloads
- Vector tiles included

Cost after free tier:
- $0.05 per 1,000 map loads (very affordable)
```

---

### Section 8.3: Map Components

#### Task 8.3.1: Create MapView Component
**File**: `components/MapView.tsx`

**Augment Code Prompt**:
```
Create reusable MapView component for displaying routes:

Import Mapbox:
```typescript
import MapboxGL from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { GeoCoordinate, Location } from '@/types/database';
```

Set Mapbox access token at module level:
```typescript
MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');
```

Define props interface:
```typescript
interface MapViewProps {
  routes?: GeoCoordinate[][]; // Multiple routes
  startLocations?: Location[];
  endLocations?: Location[];
  centerOn?: Location; // Center map on specific location
  showUserLocation?: boolean;
  onMapPress?: (coordinates: [number, number]) => void;
  style?: any;
}
```

Component structure:

1. MapboxGL.MapView:
   - Style: Outdoors (good for walking)
   - styleURL: MapboxGL.StyleURL.Outdoors
   - Zoom controls enabled
   - Compass enabled
   - Attribution position: bottom-right

2. MapboxGL.Camera:
   - Use ref for programmatic control
   - Default zoom: 14
   - Pitch: 0 (top-down view)
   - Animate camera movements

3. For each route in routes:
   - MapboxGL.ShapeSource with LineString geometry
   - MapboxGL.LineLayer:
     * lineColor: '#4CAF50' (green)
     * lineWidth: 4
     * lineCap: 'round'
     * lineJoin: 'round'

4. For each start location:
   - MapboxGL.PointAnnotation
   - Custom marker view:
     * Green circle (24px diameter)
     * White border (2px)
     * White center dot (8px)

5. For each end location:
   - MapboxGL.PointAnnotation
   - Custom marker view:
     * Red circle (24px diameter)
     * White border (2px)
     * White center dot (8px)

6. If showUserLocation:
   - MapboxGL.UserLocation component
   - Show heading indicator
   - Pulse animation

7. useEffect to fit bounds:
   - Calculate bounding box from all coordinates
   - Call camera.fitBounds() with 50px padding
   - Animate transition (duration: 1000ms)

Helper functions:
- calculateBounds(routes): Returns [[minLng, minLat], [maxLng, maxLat]]
- convertToLineString(coordinates): Converts GeoCoordinate[] to GeoJSON LineString

Styling:
- Map fills parent container
- Markers have drop shadow for visibility
- Attribution text small and unobtrusive

Verification:
- Map renders without errors
- Routes display as green polylines
- Markers appear at correct locations
- Camera fits all routes in view
- User location shows if enabled
- Smooth 60fps rendering
```

---

### Section 8.4: Map Screen

#### Task 8.4.1: Create Map Tab Screen
**File**: `app/(tabs)/map.tsx`

**Augment Code Prompt**:
```
Create Map tab screen to display all GPS walks:

Import dependencies:
```typescript
import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView from '@/components/MapView';
import { useHistoryStore } from '@/lib/store/historyStore';
import { useAuthStore } from '@/lib/store/authStore';
import type { Walk } from '@/types/database';
import { Colors } from '@/constants/Colors';
```

Component structure:

1. State:
   - loading: boolean
   - walksWithRoutes: Walk[]
   - error: string | null

2. useEffect on mount:
   - Get user.id from authStore
   - Calculate date range (last 30 days)
   - Call historyStore.loadWalks(userId, startDate, endDate)
   - Filter walks where route_coordinates exists and length > 0
   - Set walksWithRoutes state
   - Handle errors

3. Extract data for MapView:
   - routes: walksWithRoutes.map(w => w.route_coordinates)
   - startLocations: walksWithRoutes.map(w => w.start_location).filter(Boolean)
   - endLocations: walksWithRoutes.map(w => w.end_location).filter(Boolean)

4. Render logic:
   - If loading: Show centered ActivityIndicator with "Loading routes..."
   - If error: Show error message with retry button
   - If walksWithRoutes.length === 0: Show EmptyState
   - Else: Show MapView with routes

5. EmptyState component:
   - Icon: Feather "map" (64px, gray)
   - Title: "No routes yet"
   - Message: "Start a walk to see your routes here"
   - Subtitle: "Your walking paths will appear on this map"
   - Button: "Start a Walk" → Navigate to Today tab

6. Pull-to-refresh:
   - Add RefreshControl to ScrollView wrapper
   - Reload walks on pull

Styling:
- Full screen layout (no padding)
- Map fills entire screen
- Empty state centered vertically and horizontally
- Loading indicator centered
- Error message with red accent

Verification:
- Map tab appears in navigation
- Loads walks with routes on mount
- Displays routes correctly on map
- Empty state shows when no GPS walks
- Pull-to-refresh works
- No crashes with 0 or 100+ walks
```

#### Task 8.4.2: Add Map Tab to Navigation
**File**: `app/(tabs)/_layout.tsx`

**Augment Code Prompt**:
```
Add Map tab to bottom navigation:

Import Feather icons if not already:
```typescript
import { Feather } from '@expo/vector-icons';
```

Add new Tab.Screen between "history" and "profile":

```typescript
<Tab.Screen
  name="map"
  options={{
    title: 'Map',
    headerTitle: 'Your Routes',
    tabBarIcon: ({ focused, color, size }) => (
      <Feather 
        name="map" 
        size={size} 
        color={focused ? Colors.primary : color} 
      />
    ),
    tabBarLabel: 'Map',
  }}
/>
```

Tab order should be:
1. Today (index)
2. History
3. Map (new)
4. Profile

Verification:
- Map tab appears in correct position
- Icon displays correctly
- Tab is tappable and navigates to map screen
- Active state shows green color
- Header title is "Your Routes"
```

---

## Testing Checklist

### Manual Testing
- [ ] Map tab appears in bottom navigation
- [ ] Tapping Map tab navigates to map screen
- [ ] Map loads and displays Mapbox tiles
- [ ] Empty state shows when no GPS walks exist
- [ ] Create a walk with GPS data (Phase 9), verify it appears on map
- [ ] Route polyline renders in green color
- [ ] Start marker (green) and end marker (red) display correctly
- [ ] Map auto-fits to show all routes
- [ ] Zoom in/out works smoothly
- [ ] Pan around map works smoothly
- [ ] User location shows if permission granted
- [ ] Map works offline with cached tiles

### Edge Cases
- [ ] Test with 0 walks (empty state)
- [ ] Test with 1 walk (single route)
- [ ] Test with 50+ walks (performance)
- [ ] Test with invalid Mapbox token (error handling)
- [ ] Test with no internet connection (offline tiles)
- [ ] Test with location permission denied (map still works)

### Performance
- [ ] Map renders at 60fps with 10+ routes
- [ ] Map loads within 2 seconds on 4G
- [ ] Memory usage <200MB with 50+ routes
- [ ] No memory leaks when navigating away from map

---

## Dependencies

### New Dependencies
```json
{
  "@rnmapbox/maps": "^10.1.30"
}
```

### Environment Variables
```
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

---

## Rollback Plan

If Mapbox causes issues:

1. **Disable Map Tab**:
   - Comment out Map tab in `_layout.tsx`
   - Users won't see map tab, but app continues to work

2. **Remove Mapbox**:
   - Uninstall package: `npm uninstall @rnmapbox/maps`
   - Remove plugin from `app.json`
   - Run `npx expo prebuild --clean`

3. **Fallback**:
   - Show static map image using Google Maps Static API
   - Or show list of walks with addresses instead of map

---

## Success Metrics

### Adoption
- **Target**: 40%+ of walks include GPS routes
- **Measurement**: Count walks with route_coordinates vs total walks

### Performance
- **Target**: <2 second map load time
- **Measurement**: Track time from mount to first render

### Engagement
- **Target**: Users view Map tab 2+ times per week
- **Measurement**: Analytics event tracking

---

## Next Steps

After Phase 8 completion:
1. Test map display with sample GPS data
2. Verify performance with multiple routes
3. Proceed to **Phase 9: Live GPS Tracking**

---

**Phase 8 Status**: Ready for implementation  
**Estimated Completion**: 5-7 days with AI assistance

