# Phase 10: Weather Integration & Audio Coaching (Week 12)

[← Previous: Phase 9 - Live GPS Tracking](phase-9-live-gps-tracking.md) | [Back to README](README.md) | [Next: Phase 11 - Social Features →](phase-11-social-features.md)

---

## Overview

This phase adds two independent features: weather integration for proactive walk planning and audio coaching for voice guidance during walks. Both enhance the walking experience without adding complexity.

**Timeline**: Week 12 (5-7 days)  
**Dependencies**: Phase 1-9 (Complete MVP with GPS tracking)

---

## Impact Analysis

### Existing Features Affected
- **Today Screen**: Add weather card above step progress
- **Profile Settings**: Add weather and audio preferences
- **Active Walk Store**: Add audio coaching lifecycle
- **Walk Records**: Save weather conditions at walk time

### Non-Breaking Integration Strategy
- Both features are optional and can be disabled
- Weather requires internet; graceful fallback if offline
- Audio coaching respects music/podcast playback (ducking)
- No changes to core step tracking or walk recording

---

## Acceptance Criteria

### Weather Integration
- [ ] **AC1**: Today screen displays current weather (temp, condition, icon)
- [ ] **AC2**: Weather updates every 30 minutes automatically
- [ ] **AC3**: Proactive notification if rain expected at usual walk time
- [ ] **AC4**: Weather conditions saved with each walk
- [ ] **AC5**: Settings allow enabling/disabling weather alerts
- [ ] **AC6**: Graceful fallback if API unavailable or offline

### Audio Coaching
- [ ] **AC7**: Voice announcements every 3-5 minutes during walk
- [ ] **AC8**: Announcements include elapsed time, steps, distance
- [ ] **AC9**: Music/podcasts duck to 20% during announcement, then restore
- [ ] **AC10**: Coaching can be toggled on/off in settings
- [ ] **AC11**: Announcement interval adjustable (3-10 minutes)
- [ ] **AC12**: Encouraging tone, never critical or aggressive

---

## Implementation Tasks

### Section 10.1: Weather Service

#### Task 10.1.1: Setup OpenWeatherMap API
**Manual Step**:
```
1. Create account at openweathermap.org
2. Get free API key (1,000 calls/day)
3. Add to .env file:
   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here

Free tier limits:
- 1,000 calls per day
- 60 calls per minute
- Sufficient for 10k users (1 call per user daily)
```

#### Task 10.1.2: Create Weather Service
**File**: `lib/weather/weatherService.ts`

**Augment Code Prompt**:
```
Create weather service for OpenWeatherMap API:

Install axios if not already:
```bash
npm install axios
```

Import dependencies:
```typescript
import axios from 'axios';
import type { WeatherConditions } from '@/types/database';
```

Define constants:
```typescript
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
```

Define interfaces:
```typescript
interface WeatherAlert {
  event: string;
  description: string;
  start: number;
  end: number;
}

interface WeatherForecast {
  dt: number;
  temperature: number;
  condition: string;
  rain_probability: number;
}
```

Class WeatherService:

Method: getCurrentWeather(lat, lng)
- GET request to /weather endpoint
- Params: lat, lon, appid, units: 'imperial'
- Parse response:
  * temperature: main.temp (rounded to integer)
  * feels_like: main.feels_like
  * condition: weather[0].main (lowercase)
  * description: weather[0].description
  * humidity: main.humidity
  * wind_speed: wind.speed
  * icon: weather[0].icon
- Return WeatherConditions object
- Return null on error (log error, don't throw)

Method: get5DayForecast(lat, lng)
- GET request to /forecast endpoint
- Map response.data.list to WeatherForecast array
- Return empty array on error

Method: getWeatherAlerts(lat, lng)
- GET request to /onecall endpoint
- Params: exclude: 'minutely,hourly,daily' (only want alerts)
- Return alerts array or empty array

Method: shouldSendWalkReminder(forecast, preferredTime)
- Determine target hour based on preferredTime:
  * 'morning': 8 AM
  * 'afternoon': 2 PM
  * 'evening': 6 PM
- Find forecast closest to target hour
- Check conditions:
  * Rain probability >60%
  * Temperature <20°F or >95°F
- Return {shouldSend: boolean, reason: string, suggestedTime: string}

Export singleton:
```typescript
export const weatherService = new WeatherService();
```

Verification:
- API calls succeed with valid key
- Weather data parses correctly
- Error handling works (invalid key, network error)
- Forecast logic identifies bad weather correctly
```

#### Task 10.1.3: Weather Notifications
**File**: `lib/weather/weatherNotifications.ts`

**Augment Code Prompt**:
```
Create weather notification system:

Import:
```typescript
import * as Notifications from 'expo-notifications';
import { weatherService } from './weatherService';
import { supabase } from '@/lib/supabase/client';
```

Function: scheduleWeatherNotifications(userId)
- Query profiles table for user's:
  * location_coordinates
  * preferred_walk_time
  * weather_alerts_enabled
- Return early if alerts disabled or no location
- Call weatherService.get5DayForecast()
- Call weatherService.shouldSendWalkReminder()
- If shouldSend is true:
  * Calculate notification time (1 hour before preferred time)
  * Schedule notification:
    - Title: "Weather update for your walk"
    - Body: reason + suggested time
    - Trigger: date (calculated notification time)

Function: checkWeatherForAllUsers()
- Get current user from supabase.auth.getUser()
- Call scheduleWeatherNotifications(user.id)

Export both functions

Verification:
- Notifications schedule correctly
- Trigger at correct time (1 hour before walk)
- Message is helpful and actionable
```

#### Task 10.1.4: Weather UI Integration
**File**: `app/(tabs)/index.tsx` (Today Screen)

**Augment Code Prompt**:
```
Add weather card to Today screen:

Import:
```typescript
import { weatherService } from '@/lib/weather/weatherService';
import type { WeatherConditions } from '@/types/database';
```

Add state:
- weather: WeatherConditions | null

Add useEffect to load weather:
- Get location_coordinates from profileStore
- If exists, call weatherService.getCurrentWeather()
- Set weather state
- Set up interval to refresh every 30 minutes
- Cleanup interval on unmount

Render weather card (above step progress):
- If weather exists:
  * Top row: Weather icon + temperature + description
  * Bottom row: Feels like, humidity
  * Icon mapping:
    - 'clear' → 'sun'
    - 'clouds' → 'cloud'
    - 'rain' → 'cloud-rain'
    - 'snow' → 'cloud-snow'
  * Card styling: White background, rounded, shadow, padding

Helper function: getWeatherIcon(condition)
- Map condition string to Feather icon name

Styling:
- Height: 80px
- Background: White card with subtle shadow
- Left: Large weather icon (32px) in green
- Center: Temperature (28pt bold) + description (14pt)
- Right: Additional info (12pt gray)

Verification:
- Weather card displays correctly
- Updates every 30 minutes
- Graceful fallback if no location or API error
- Icon matches weather condition
```

#### Task 10.1.5: Weather Settings
**File**: `app/(tabs)/profile.tsx`

**Augment Code Prompt**:
```
Add weather preferences to Profile settings:

Add "Weather" section with:

1. Toggle: "Weather alerts"
   - Bound to profile.weather_alerts_enabled
   - Description: "Get notified about weather that may affect your walks"
   - On change: Update profile in Supabase

2. Picker: "Preferred walk time"
   - Options: Morning / Afternoon / Evening
   - Bound to profile.preferred_walk_time
   - On change: Update profile, reschedule notifications

Verification:
- Toggle persists across app restarts
- Preferred time affects notification scheduling
- Disabling alerts stops notifications
```

---

### Section 10.2: Audio Coaching

#### Task 10.2.1: Create Audio Coach Service
**File**: `lib/audio/audioCoach.ts`

**Augment Code Prompt**:
```
Create audio coaching service using expo-speech:

Import:
```typescript
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
```

Define types:
```typescript
type CoachingMessage = 
  | { type: 'progress', data: { elapsed: number, steps: number, distance: number } }
  | { type: 'milestone', data: { milestone: string } }
  | { type: 'encouragement', data: { message: string } }
  | { type: 'heartRate', data: { hr: number, zone: string } };
```

Class AudioCoach:

Properties:
- enabled: boolean
- intervalSeconds: number
- lastAnnouncementTime: Date | null

Method: configure(enabled, intervalSeconds)
- Set properties
- Call Audio.setAudioModeAsync():
  * allowsRecordingIOS: false
  * playsInSilentModeIOS: true
  * staysActiveInBackground: true
  * shouldDuckAndroid: true (lower other audio)
  * playThroughEarpieceAndroid: false

Method: announce(message: CoachingMessage)
- Check if enabled
- Check time since last announcement (respect interval, except milestones)
- Format message using formatMessage()
- Check if currently speaking, stop if true
- Call Speech.speak() with:
  * language: 'en-US'
  * pitch: 1.0
  * rate: 0.9 (slightly slower for clarity)
  * voice: 'com.apple.ttsbundle.Samantha-compact' (iOS female voice)
  * onDone: update lastAnnouncementTime

Method: formatMessage(message)
- Switch on message.type:
  * 'progress': "[Encouragement] You've been walking for [X] minutes. [Y] steps so far, covering [Z] miles. Keep it up!"
  * 'milestone': "Great job! [milestone message]"
  * 'encouragement': "[message]"
  * 'heartRate': "Your heart rate is [X]. You're in the [zone] zone. [advice]"

Method: stop()
- Check if speaking
- Call Speech.stop()

Helper functions:
- getProgressEncouragement(minutes):
  * <5 min: "Nice start!"
  * 5-15 min: "You're doing great!"
  * 15-30 min: "Excellent progress!"
  * 30-45 min: "Wow, you're really going!"
  * 45+ min: "Amazing endurance!"

Export singleton:
```typescript
export const audioCoach = new AudioCoach();
```

Verification:
- TTS works on iOS and Android
- Music ducks during announcement
- Voice is clear and encouraging
- Interval respected
```

#### Task 10.2.2: Integrate with Active Walk
**File**: `lib/store/activeWalkStore.ts`

**Augment Code Prompt**:
```
Add audio coaching to active walk store:

Import:
```typescript
import { audioCoach } from '@/lib/audio/audioCoach';
```

Add state:
- coachingInterval: NodeJS.Timeout | null

In startWalk method:
- Get audio preferences from profileStore
- Call audioCoach.configure(enabled, interval)
- Set up coaching interval:
  * Get current state
  * Calculate elapsed seconds
  * Call audioCoach.announce() with progress message
  * Interval: audio_coaching_interval from profile (default 300000ms)
- Store interval ID in state

In endWalk method:
- Call audioCoach.stop()
- Clear coaching interval

Add pauseWalk method:
- Call audioCoach.stop()
- Don't clear interval

Add resumeWalk method:
- Resume announcements

Verification:
- Announcements start after first interval
- Timing is accurate
- Music playback unaffected
- Announcements stop when walk ends
```

#### Task 10.2.3: Audio Settings
**File**: `app/(tabs)/profile.tsx`

**Augment Code Prompt**:
```
Add audio coaching settings:

Add "Audio Coaching" section with:

1. Toggle: "Audio coaching"
   - Bound to profile.audio_coaching_enabled
   - Description: "Get voice updates during your walks"

2. Slider: "Announcement interval"
   - Range: 180-600 seconds (3-10 minutes)
   - Steps: 60 seconds
   - Display as "X minutes"
   - Default: 300 seconds (5 minutes)
   - Bound to profile.audio_coaching_interval

3. Button: "Test announcement"
   - Calls audioCoach.announce() with sample message
   - Lets user hear coaching before walk

Verification:
- Toggle persists
- Interval adjusts correctly
- Test button works
- Settings apply to next walk
```

---

## Testing Checklist

### Weather Testing
- [ ] Weather card displays on Today screen
- [ ] Temperature and condition accurate
- [ ] Icon matches weather condition
- [ ] Updates every 30 minutes
- [ ] Notification sent 1 hour before walk time if rain expected
- [ ] Toggle disables notifications
- [ ] Works offline with cached data
- [ ] Graceful error if API key invalid

### Audio Coaching Testing
- [ ] Voice announcements start after first interval
- [ ] Announcements include time, steps, distance
- [ ] Music ducks during announcement
- [ ] Music restores after announcement
- [ ] Interval adjustable in settings
- [ ] Toggle disables coaching
- [ ] Test button works
- [ ] Voice is clear and encouraging
- [ ] Works with Bluetooth headphones
- [ ] Works with phone speaker

### Edge Cases
- [ ] Weather with no location permission
- [ ] Audio with music playing (Spotify, Apple Music)
- [ ] Audio during phone call (should pause)
- [ ] Weather API rate limit exceeded
- [ ] Offline mode (weather unavailable)

---

## Dependencies

### New Dependencies
```json
{
  "axios": "^1.6.0"
}
```

### Environment Variables
```
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_key_here
```

---

## Success Metrics

### Weather
- **Target**: 70%+ users enable weather alerts
- **Measurement**: Profile setting analytics

### Audio Coaching
- **Target**: 30%+ users enable audio coaching
- **Measurement**: Profile setting analytics

### Engagement
- **Target**: Weather alerts increase walk frequency by 10%
- **Measurement**: Compare walk frequency with/without alerts

---

## Next Steps

After Phase 10 completion:
1. Test weather notifications at different times
2. Verify audio coaching tone is encouraging
3. Proceed to **Phase 11: Social Features**

---

**Phase 10 Status**: Ready for implementation  
**Estimated Completion**: 5-7 days with AI assistance

