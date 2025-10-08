# Phase 6: MVP Launch Prep (Week 7-8)

[← Previous: Phase 5 - Polish & Testing](phase-5-polish-testing.md) | [Back to README](README.md)

---

## Overview

This phase prepares Stepin for public release on the App Store and Google Play. It covers app configuration, store assets, submission process, and post-launch monitoring setup.

**Timeline**: Weeks 7-8  
**Dependencies**: Phase 5 (All features complete and tested)

---

## 6.1 App Store Preparation

### Augment Code Prompt

```
Prepare Stepin for App Store and Google Play submission:

1. App Configuration:

Update app.json:
- Set final app name: "Stepin"
- Set bundle identifier: "com.stepin.app"
- Set version: "1.0.0"
- Set build number: "1"
- Configure app icon (1024x1024)
- Configure splash screen
- Set orientation: portrait only
- Set background modes: location (if needed)
- Set required permissions with descriptions

iOS Info.plist additions:
- NSHealthShareUsageDescription: "Stepin uses your step count to track your daily walking activity and celebrate your progress."
- NSHealthUpdateUsageDescription: "Stepin does not write any data to HealthKit."
- NSLocationWhenInUseUsageDescription: "Stepin uses your location to calculate distance walked (optional)."
- UIBackgroundModes: ["location"] (if using background tracking)

Android AndroidManifest.xml additions:
- ACTIVITY_RECOGNITION permission
- Health Connect permission
- Foreground service permission (if using)
- Clear permission rationales

2. App Store Assets:

Create /assets/store:
- App icon (1024x1024, no alpha)
- Screenshots (all required sizes):
  * 6.7" iPhone (1290x2796) - 3 screenshots minimum
  * 5.5" iPhone (1242x2208)
  * 12.9" iPad (2048x2732) - if supporting iPad
- Android screenshots:
  * Phone (1080x1920)
  * 7" tablet (1200x1920)
  * 10" tablet (1600x2560)

Screenshot content:
1. Today screen showing steps with progress ring
2. History screen with charts
3. Encouraging message and streak display
4. Profile/settings screen
5. Onboarding welcome screen

3. App Store Copy:

App Name: Stepin

Subtitle: Wellness walking, your way

Description:
```
The only walking app that celebrates 2,000 steps as much as 10,000 steps.

Stepin is different. No leaderboards. No competition. No pressure. Just you, your walks, and your progress.

GENTLE MOTIVATION
• Set your own daily step goal
• Track your walking streak
• Celebrate every milestone
• Encouraging messages, never guilt

PRIVACY FIRST
• Your data stays yours
• No social comparison
• Optional sharing only
• Secure and private

EASY TO USE
• Automatic step tracking via HealthKit/Health Connect
• Manual walk logging option
• Clean, simple interface
• Works offline

PERFECT FOR:
• Beginners starting their wellness journey
• Seniors looking for gentle encouragement
• Anyone recovering from injury
• People who find other fitness apps too intense

Your walking journey, your pace, your way. Download Stepin and start celebrating every step today.
```

Keywords (App Store):
walking, steps, wellness, fitness, health, tracker, pedometer, streak, beginner-friendly, gentle, non-competitive

Categories:
- Primary: Health & Fitness
- Secondary: Lifestyle

4. Privacy Policy & Terms:

Create simple, clear documents:
- What data is collected (steps, profile)
- How data is used (personal tracking only)
- Data storage (Supabase, encrypted)
- User rights (delete data, export)
- Contact information

Host at: https://stepin.app/privacy and https://stepin.app/terms
```

**Complete App Store copy available in**: [`store-assets/app-store-copy.md`](store-assets/app-store-copy.md)

---

## 6.2 Build and Submit

### Build Instructions

```bash
# Configure EAS (Expo Application Services)
npm install -g eas-cli
eas login
eas build:configure

# Create iOS build
eas build --platform ios --profile production

# Create Android build  
eas build --platform android --profile production

# Submit to stores (after builds complete)
eas submit --platform ios
eas submit --platform android
```

### Pre-submission Checklist

- [ ] All environment variables set in EAS
- [ ] Supabase project in production mode
- [ ] API keys secured
- [ ] Privacy policy and terms published
- [ ] Support email set up
- [ ] Screenshots generated
- [ ] App description finalized
- [ ] TestFlight beta tested (iOS)
- [ ] Internal testing track used (Android)
- [ ] No debug code in production
- [ ] Analytics configured (optional)
- [ ] Crash reporting configured (optional)

---

## 6.3 Post-Launch Monitoring

### Augment Code Prompt

```
Set up basic analytics and monitoring for Stepin MVP:

1. Optional: Configure Sentry for crash reporting:
   - Install @sentry/react-native
   - Initialize with DSN
   - Wrap app in Sentry error boundary
   - Track errors only, no user data

2. Basic usage metrics (privacy-respecting):
   - Track screen views (no personal data)
   - Track button clicks (no personal data)
   - Daily active users (anonymous count)
   - Store in Supabase analytics table

Create /lib/analytics/analyticsService.ts:
- trackEvent(eventName, properties): Logs event
- trackScreen(screenName): Logs screen view
- Privacy-respecting: no personal data, no tracking IDs
- User can opt-out in settings

3. Health checks:
   - Monitor Supabase connection status
   - Track sync success/failure rates
   - Log health data fetch success rates
   - Store in internal logs table

4. User feedback:
   - In-app feedback form in Settings
   - Email to support@stepin.app
   - Rate app prompt (after 7 days + 10 walks logged)
```

---

## Acceptance Criteria

- [ ] App configuration is complete and correct
- [ ] All required permissions are properly described
- [ ] App icon and splash screen are configured
- [ ] Screenshots are generated for all required sizes
- [ ] App Store copy is finalized
- [ ] Privacy policy and terms are published
- [ ] Support email is set up and monitored
- [ ] EAS build configuration is complete
- [ ] Production builds succeed for both platforms
- [ ] TestFlight beta testing completed (iOS)
- [ ] Internal testing completed (Android)
- [ ] All pre-submission checklist items complete
- [ ] Crash reporting is configured (if using)
- [ ] Analytics respect user privacy
- [ ] Rate app prompt is implemented
- [ ] Feedback mechanism is in place

---

## Launch Day Checklist

- [ ] Final production builds submitted
- [ ] App Store listing is live
- [ ] Google Play listing is live
- [ ] Support email is monitored
- [ ] Social media announcements ready
- [ ] Landing page is live (if applicable)
- [ ] Monitoring dashboards are set up
- [ ] Team is ready to respond to feedback
- [ ] Bug fix process is established
- [ ] Update plan is in place

---

[← Previous: Phase 5 - Polish & Testing](phase-5-polish-testing.md) | [Back to README](README.md) | [View Future Roadmap →](future-roadmap.md)

