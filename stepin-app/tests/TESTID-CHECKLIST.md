# TestID Implementation Checklist

This document lists ALL testIDs that need to be added to components for RNTL testing.

## ✅ Status Legend
- ✅ = TestIDs already added
- ❌ = TestIDs need to be added
- 🔄 = Partially complete

---

## 🔴 PHASE 1: Walk Logging & Management (CRITICAL - 4 components)

### 1. LogWalkModal.tsx ✅
**Status**: TestIDs already present
- `log-walk-modal`
- `steps-input`
- `duration-input`
- `save-button`
- `cancel-button`

### 2. StepCircle.tsx ❌
**File**: `components/StepCircle.tsx`
**TestIDs needed**:
```typescript
testID="step-circle"              // Main container
testID="step-count-text"          // Current steps display
testID="goal-text"                // Goal display
testID="percentage-text"          // Percentage complete
```

### 3. StepsBarChart.tsx ❌
**File**: `components/StepsBarChart.tsx`
**TestIDs needed**:
```typescript
testID="steps-bar-chart"          // Main container
testID={`bar-${index}`}           // Each bar (dynamic)
testID="chart-legend"             // Legend component
testID="no-data-message"          // Empty state
```

### 4. WalkListItem.tsx ❌
**File**: `components/WalkListItem.tsx`
**TestIDs needed**:
```typescript
testID={`walk-item-${walk.id}`}  // Main container (dynamic)
testID="walk-date"                // Date display
testID="walk-steps"               // Steps count
testID="walk-distance"            // Distance display
testID="walk-duration"            // Duration display
testID="edit-button"              // Edit action
testID="delete-button"            // Delete action
```

---

## 🔴 PHASE 2: Goal Management (CRITICAL - 3 components)

### 5. GoalSlider.tsx ❌
**File**: `components/GoalSlider.tsx`
**TestIDs needed**:
```typescript
testID="goal-slider"              // Slider component
testID="goal-value-display"       // Current value display
testID="decrease-button"          // Decrease button
testID="increase-button"          // Increase button
```

### 6. GoalAdjustmentModal.tsx ❌
**File**: `components/GoalAdjustmentModal.tsx`
**TestIDs needed**:
```typescript
testID="goal-adjustment-modal"    // Modal container
testID="goal-slider"              // Slider component
testID="current-goal-display"     // Current goal text
testID="save-button"              // Save button
testID="cancel-button"            // Cancel button
```

### 7. GoalCelebrationModal.tsx ❌
**File**: `components/GoalCelebrationModal.tsx`
**TestIDs needed**:
```typescript
testID="goal-celebration-modal"   // Modal container
testID="celebration-message"      // Congratulations text
testID="confetti"                 // Confetti animation
testID="close-button"             // Close button
testID="share-button"             // Share achievement button
```

---

## 🔴 PHASE 3: Social Features (CRITICAL - 4 components)

### 8. BuddyListItem.tsx ❌
**File**: `components/BuddyListItem.tsx`
**TestIDs needed**:
```typescript
testID={`buddy-item-${buddy.id}`} // Main container (dynamic)
testID="buddy-name"               // Name display
testID="buddy-avatar"             // Avatar image
testID="buddy-steps"              // Steps count
testID="kudos-button"             // Give kudos button
testID="remove-button"            // Remove buddy button
```

### 9. ActivityCard.tsx ❌
**File**: `components/ActivityCard.tsx`
**TestIDs needed**:
```typescript
testID={`activity-card-${activity.id}`} // Main container (dynamic)
testID="activity-user-name"       // User name
testID="activity-type"            // Activity type
testID="activity-message"         // Activity message
testID="activity-timestamp"       // Time ago
testID="kudos-button"             // Kudos button
```

### 10. KudosButton.tsx ❌
**File**: `components/KudosButton.tsx`
**TestIDs needed**:
```typescript
testID="kudos-button"             // Button component
testID="kudos-count"              // Count display
testID="kudos-icon"               // Icon
```

### 11. AddBuddyModal.tsx ❌
**File**: `components/AddBuddyModal.tsx`
**TestIDs needed**:
```typescript
testID="add-buddy-modal"          // Modal container
testID="search-input"             // Search input
testID="search-results"           // Results list
testID={`result-${user.id}`}     // Each result (dynamic)
testID="add-button"               // Add buddy button
testID="cancel-button"            // Cancel button
testID="qr-code-tab"              // QR code tab
testID="search-tab"               // Search tab
```

---

## 🟠 PHASE 4: Profile & Display (HIGH - 4 components)

### 12. ProfileHeader.tsx ❌
**File**: `components/ProfileHeader.tsx`
**TestIDs needed**:
```typescript
testID="profile-header"           // Main container
testID="profile-avatar"           // Avatar image
testID="profile-name"             // User name
testID="profile-email"            // Email display
testID="edit-button"              // Edit profile button
```

### 13. StatsCard.tsx ❌
**File**: `components/StatsCard.tsx`
**TestIDs needed**:
```typescript
testID={`stats-card-${type}`}    // Main container (dynamic)
testID="stat-value"               // Value display
testID="stat-label"               // Label text
testID="stat-icon"                // Icon
```

### 14. StatsGrid.tsx ❌
**File**: `components/StatsGrid.tsx`
**TestIDs needed**:
```typescript
testID="stats-grid"               // Main container
testID="total-steps-card"         // Total steps
testID="total-distance-card"      // Total distance
testID="total-duration-card"      // Total duration
testID="average-steps-card"       // Average steps
```

### 15. StreakDisplay.tsx ❌
**File**: `components/StreakDisplay.tsx`
**TestIDs needed**:
```typescript
testID="streak-display"           // Main container
testID="streak-count"             // Streak number
testID="streak-icon"              // Fire icon
testID="streak-label"             // "day streak" text
```

---

## 🟠 PHASE 5: History & Analytics (HIGH - 6 components)

### 16. CalendarHeatMap.tsx ❌
**File**: `components/CalendarHeatMap.tsx`
**TestIDs needed**:
```typescript
testID="calendar-heatmap"         // Main container
testID={`day-${date}`}            // Each day cell (dynamic)
testID="month-label"              // Month label
testID="legend"                   // Color legend
```

### 17. DayDetailsCard.tsx ❌
**File**: `components/DayDetailsCard.tsx`
**TestIDs needed**:
```typescript
testID="day-details-card"         // Main container
testID="selected-date"            // Date display
testID="day-steps"                // Steps for day
testID="day-distance"             // Distance for day
testID="day-duration"             // Duration for day
testID="walks-list"               // List of walks
```

### 18. TimePeriodSelector.tsx ❌
**File**: `components/TimePeriodSelector.tsx`
**TestIDs needed**:
```typescript
testID="time-period-selector"     // Main container
testID="week-button"              // Week option
testID="month-button"             // Month option
testID="year-button"              // Year option
testID="all-time-button"          // All time option
```

### 19. SummaryStatsGrid.tsx ❌
**File**: `components/SummaryStatsGrid.tsx`
**TestIDs needed**:
```typescript
testID="summary-stats-grid"       // Main container
testID="period-total-steps"       // Total steps for period
testID="period-total-distance"    // Total distance
testID="period-total-duration"    // Total duration
testID="period-average-steps"     // Average steps
```

### 20. EditWalkModal.tsx ❌
**File**: `components/EditWalkModal.tsx`
**TestIDs needed**:
```typescript
testID="edit-walk-modal"          // Modal container
testID="steps-input"              // Steps input
testID="duration-input"           // Duration input
testID="date-input"               // Date picker
testID="save-button"              // Save button
testID="cancel-button"            // Cancel button
testID="delete-button"            // Delete walk button
```

### 21. EmptyState.tsx ❌
**File**: `components/EmptyState.tsx`
**TestIDs needed**:
```typescript
testID="empty-state"              // Main container
testID="empty-icon"               // Icon
testID="empty-title"              // Title text
testID="empty-message"            // Message text
testID="action-button"            // Optional action button
```

---

## 🟠 PHASE 6: Gamification & Permissions (HIGH - 5 components)

### 22. BadgeCelebrationModal.tsx ❌
**File**: `components/BadgeCelebrationModal.tsx`
**TestIDs needed**:
```typescript
testID="badge-celebration-modal"  // Modal container
testID="badge-icon"               // Badge icon
testID="badge-title"              // Badge name
testID="badge-description"        // Description
testID="close-button"             // Close button
testID="share-button"             // Share button
```

### 23. StreakMilestoneModal.tsx ❌
**File**: `components/StreakMilestoneModal.tsx`
**TestIDs needed**:
```typescript
testID="streak-milestone-modal"   // Modal container
testID="milestone-count"          // Streak number
testID="milestone-message"        // Congratulations message
testID="close-button"             // Close button
```

### 24. ConfettiCelebration.tsx ❌
**File**: `components/ConfettiCelebration.tsx`
**TestIDs needed**:
```typescript
testID="confetti-celebration"     // Main container
testID="confetti-canvas"          // Confetti animation
```

### 25. PermissionBanner.tsx ❌
**File**: `components/PermissionBanner.tsx`
**TestIDs needed**:
```typescript
testID="permission-banner"        // Main container
testID="permission-message"       // Message text
testID="grant-permission-button"  // Action button
testID="dismiss-button"           // Dismiss button
```

### 26. NotificationPermissionBanner.tsx ❌
**File**: `components/NotificationPermissionBanner.tsx`
**TestIDs needed**:
```typescript
testID="notification-permission-banner" // Main container
testID="permission-message"       // Message text
testID="enable-button"            // Enable button
testID="dismiss-button"           // Dismiss button
```

---

## 🟠 PHASE 7: Social Interactions (HIGH - 4 components)

### 27. PendingRequestCard.tsx ❌
**File**: `components/PendingRequestCard.tsx`
**TestIDs needed**:
```typescript
testID={`pending-request-${request.id}`} // Main container (dynamic)
testID="requester-name"           // Name display
testID="requester-avatar"         // Avatar
testID="accept-button"            // Accept button
testID="decline-button"           // Decline button
```

### 28. BuddyPreview.tsx ❌
**File**: `components/BuddyPreview.tsx`
**TestIDs needed**:
```typescript
testID={`buddy-preview-${buddy.id}`} // Main container (dynamic)
testID="buddy-avatar"             // Avatar
testID="buddy-name"               // Name
testID="buddy-steps-today"        // Today's steps
```

### 29. PostActivityModal.tsx ❌
**File**: `components/PostActivityModal.tsx`
**TestIDs needed**:
```typescript
testID="post-activity-modal"      // Modal container
testID="message-input"            // Message input
testID="post-button"              // Post button
testID="cancel-button"            // Cancel button
```

### 30. InviteFriend.tsx ❌
**File**: `components/InviteFriend.tsx`
**TestIDs needed**:
```typescript
testID="invite-friend"            // Main container
testID="invite-message"           // Message text
testID="share-button"             // Share invite button
testID="copy-link-button"         // Copy link button
```

---

## 🟡 PHASE 8: Settings & Configuration (MEDIUM - 5 components)

### 31. SettingsSection.tsx ❌
**File**: `components/SettingsSection.tsx`
**TestIDs needed**:
```typescript
testID={`settings-section-${title}`} // Main container (dynamic)
testID="section-title"            // Title text
testID="section-content"          // Content container
```

### 32. SettingRow.tsx ❌
**File**: `components/SettingRow.tsx`
**TestIDs needed**:
```typescript
testID={`setting-row-${label}`}  // Main container (dynamic)
testID="setting-label"            // Label text
testID="setting-value"            // Value display
testID="setting-action"           // Action button/switch
```

### 33. HealthSettingsCard.tsx ❌
**File**: `components/HealthSettingsCard.tsx`
**TestIDs needed**:
```typescript
testID="health-settings-card"     // Main container
testID="health-permission-status" // Permission status
testID="connect-health-button"    // Connect button
testID="sync-status"              // Sync status display
```

### 34. TimePickerModal.tsx ❌
**File**: `components/TimePickerModal.tsx`
**TestIDs needed**:
```typescript
testID="time-picker-modal"        // Modal container
testID="time-picker"              // Picker component
testID="confirm-button"           // Confirm button
testID="cancel-button"            // Cancel button
```

### 35. HistoricalImportModal.tsx ❌
**File**: `components/HistoricalImportModal.tsx`
**TestIDs needed**:
```typescript
testID="historical-import-modal"  // Modal container
testID="date-range-selector"      // Date range picker
testID="import-button"            // Import button
testID="cancel-button"            // Cancel button
testID="progress-indicator"       // Import progress
```

---

## 🟡 PHASE 9: Specialized Components (MEDIUM - 7 components)

### 36. AnimatedButton.tsx ❌
**File**: `components/AnimatedButton.tsx`
**TestIDs needed**:
```typescript
testID={`animated-button-${label}`} // Main container (dynamic)
testID="button-label"             // Button text
testID="button-icon"              // Optional icon
```

### 37. ProfileButton.tsx ❌
**File**: `components/ProfileButton.tsx`
**TestIDs needed**:
```typescript
testID="profile-button"           // Main button
testID="profile-avatar"           // Avatar image
```

### 38. HealthPermissionDeniedBanner.tsx ❌
**File**: `components/HealthPermissionDeniedBanner.tsx`
**TestIDs needed**:
```typescript
testID="health-permission-denied-banner" // Main container
testID="denied-message"           // Message text
testID="open-settings-button"     // Settings button
testID="dismiss-button"           // Dismiss button
```

### 39. OfflineBanner.tsx ❌
**File**: `components/OfflineBanner.tsx`
**TestIDs needed**:
```typescript
testID="offline-banner"           // Main container
testID="offline-message"          // Message text
testID="retry-button"             // Retry button
```

### 40. ConflictResolutionModal.tsx ❌
**File**: `components/ConflictResolutionModal.tsx`
**TestIDs needed**:
```typescript
testID="conflict-resolution-modal" // Modal container
testID="local-data-option"        // Keep local button
testID="server-data-option"       // Keep server button
testID="merge-option"             // Merge button
testID="conflict-details"         // Details display
```

### 41. HeartRateZone.tsx ❌
**File**: `components/HeartRateZone.tsx`
**TestIDs needed**:
```typescript
testID={`heart-rate-zone-${zone}`} // Main container (dynamic)
testID="zone-label"               // Zone name
testID="zone-range"               // BPM range
testID="zone-indicator"           // Visual indicator
```

### 42. HeartRateAnalytics.tsx ❌
**File**: `components/HeartRateAnalytics.tsx`
**TestIDs needed**:
```typescript
testID="heart-rate-analytics"     // Main container
testID="average-hr"               // Average HR
testID="max-hr"                   // Max HR
testID="min-hr"                   // Min HR
testID="hr-chart"                 // Chart component
testID="zone-distribution"        // Zone breakdown
```

---

## 🟢 PHASE 10A: QR Code & Search (LOW - 5 components)

### 43. QRCodeDisplay.tsx ❌
**File**: `components/QRCodeDisplay.tsx`
**TestIDs needed**:
```typescript
testID="qr-code-display"          // Main container
testID="qr-code"                  // QR code image
testID="user-code"                // User code text
testID="share-button"             // Share button
```

### 44. QRScanner.tsx ❌
**File**: `components/QRScanner.tsx`
**TestIDs needed**:
```typescript
testID="qr-scanner"               // Main container
testID="camera-view"              // Camera component
testID="scan-overlay"             // Scan frame overlay
testID="cancel-button"            // Cancel button
testID="torch-button"             // Flashlight toggle
```

### 45. BuddySearch.tsx ❌
**File**: `components/BuddySearch.tsx`
**TestIDs needed**:
```typescript
testID="buddy-search"             // Main container
testID="search-input"             // Search input
testID="search-results"           // Results list
testID="no-results-message"       // Empty state
```

### 46. BuddySearchResult.tsx ❌
**File**: `components/BuddySearchResult.tsx`
**TestIDs needed**:
```typescript
testID={`search-result-${user.id}`} // Main container (dynamic)
testID="result-avatar"            // Avatar
testID="result-name"              // Name
testID="result-email"             // Email
testID="add-button"               // Add buddy button
```

### 47. ContactsSync.tsx ❌
**File**: `components/ContactsSync.tsx`
**TestIDs needed**:
```typescript
testID="contacts-sync"            // Main container
testID="sync-button"              // Sync contacts button
testID="contacts-list"            // Contacts list
testID={`contact-${id}`}          // Each contact (dynamic)
testID="permission-prompt"        // Permission request
```

---

## 🟢 PHASE 10B: Map & Utility (LOW - 2 components)

### 48. MapView.tsx ❌
**File**: `components/MapView.tsx`
**TestIDs needed**:
```typescript
testID="map-view"                 // Main container
testID="map-container"            // Map component
testID="user-location-marker"     // User marker
testID={`walk-route-${id}`}      // Walk routes (dynamic)
testID="center-button"            // Center on user button
```

### 49. SentryTestButton.tsx ❌
**File**: `components/SentryTestButton.tsx`
**TestIDs needed**:
```typescript
testID="sentry-test-button"       // Main button
testID="test-error-button"        // Trigger error button
testID="test-message-button"      // Send message button
```

---

## 🟢 PHASE 10C: Onboarding (LOW - 2 components)

### 50. OnboardingStep.tsx ❌
**File**: `components/onboarding/OnboardingStep.tsx`
**TestIDs needed**:
```typescript
testID={`onboarding-step-${index}`} // Main container (dynamic)
testID="step-title"               // Title text
testID="step-description"         // Description text
testID="step-image"               // Illustration
```

### 51. ProgressDots.tsx ❌
**File**: `components/onboarding/ProgressDots.tsx`
**TestIDs needed**:
```typescript
testID="progress-dots"            // Main container
testID={`dot-${index}`}           // Each dot (dynamic)
testID="current-step-indicator"   // Current step highlight
```

---

## 🟢 PHASE 10D: Main Screen Tests (LOW - 5 screens)

### 52. TodayScreen (index.tsx) ❌
**File**: `app/(tabs)/index.tsx`
**TestIDs needed**:
```typescript
testID="today-screen"             // Main container
testID="step-progress"            // Step progress circle
testID="stats-grid"               // Stats grid
testID="streak-display"           // Streak display
testID="log-walk-button"          // Log walk button
testID="active-walk-banner"       // Active walk indicator
```

### 53. BuddiesScreen ❌
**File**: `app/(tabs)/buddies.tsx`
**TestIDs needed**:
```typescript
testID="buddies-screen"           // Main container
testID="activity-tab"             // Activity feed tab
testID="buddies-tab"              // Buddies list tab
testID="activity-feed"            // Activity feed list
testID="buddies-list"             // Buddies list
testID="add-buddy-button"         // Add buddy button
testID="pending-requests"         // Pending requests section
```

### 54. ProfileScreen ❌
**File**: `app/profile.tsx`
**TestIDs needed**:
```typescript
testID="profile-screen"           // Main container
testID="profile-header"           // Header component
testID="stats-grid"               // Stats grid
testID="settings-section"         // Settings section
testID="sign-out-button"          // Sign out button
testID="delete-account-button"    // Delete account button
```

### 55. HistoryScreen ❌
**File**: `app/(tabs)/history.tsx`
**TestIDs needed**:
```typescript
testID="history-screen"           // Main container
testID="time-period-selector"     // Period selector
testID="calendar-heatmap"         // Calendar component
testID="stats-summary"            // Summary stats
testID="walks-list"               // Walks list
testID={`calendar-day-${date}`}  // Calendar days (dynamic)
testID="selected-day-walks"       // Selected day walks
testID={`edit-walk-${id}`}       // Edit buttons (dynamic)
testID={`delete-walk-${id}`}     // Delete buttons (dynamic)
```

### 56. InsightsScreen ❌
**File**: `app/(tabs)/insights.tsx`
**TestIDs needed**:
```typescript
testID="insights-screen"          // Main container
testID="time-period-selector"     // Period selector
testID="insights-list"            // Insights list
testID={`insight-card-${id}`}    // Insight cards (dynamic)
testID={`insight-icon-${id}`}    // Insight icons (dynamic)
```

---

## 🟢 PHASE 10E: Auth & Misc Screens (LOW - 5 screens)

### 57. SignInScreen ❌
**File**: `app/(auth)/sign-in.tsx`
**TestIDs needed**:
```typescript
testID="sign-in-screen"           // Main container
testID="email-input"              // Email input
testID="password-input"           // Password input
testID="sign-in-button"           // Sign in button
testID="forgot-password-link"     // Forgot password link
testID="sign-up-link"             // Sign up link
testID="loading-indicator"        // Loading state
```

### 58. SignUpScreen ❌
**File**: `app/(auth)/sign-up.tsx`
**TestIDs needed**:
```typescript
testID="sign-up-screen"           // Main container
testID="email-input"              // Email input
testID="password-input"           // Password input
testID="confirm-password-input"   // Confirm password input
testID="sign-up-button"           // Sign up button
testID="sign-in-link"             // Sign in link
testID="loading-indicator"        // Loading state
```

### 59. ForgotPasswordScreen ❌
**File**: `app/(auth)/forgot-password.tsx`
**TestIDs needed**:
```typescript
testID="forgot-password-screen"   // Main container
testID="email-input"              // Email input
testID="reset-button"             // Reset password button
testID="back-button"              // Back button
testID="loading-indicator"        // Loading state
```

### 60. OnboardingScreen ❌
**File**: `app/(auth)/onboarding.tsx`
**TestIDs needed**:
```typescript
testID="onboarding-screen"        // Main container
testID="onboarding-step"          // Current step
testID="progress-dots"            // Progress indicator
testID="next-button"              // Next button
testID="skip-button"              // Skip button
testID="get-started-button"       // Final button
```

### 61. MapScreen ❌
**File**: `app/(tabs)/map.tsx`
**TestIDs needed**:
```typescript
testID="map-screen"               // Main container
testID="map-view"                 // Map component
testID="location-button"          // Center on location
testID={`walk-marker-${id}`}     // Walk markers (dynamic)
testID="user-location-marker"     // User location
```

---

## 📊 Summary Statistics

- **Total Components**: 61
- **Components with TestIDs**: 1 (LogWalkModal)
- **Components needing TestIDs**: 60
- **Estimated TestIDs to add**: ~250-300

## 🎯 Priority Order for Implementation

1. **Phase 1** (4 components) - Walk logging core functionality
2. **Phase 2** (3 components) - Goal management
3. **Phase 3** (4 components) - Social features
4. **Phase 4-7** (19 components) - HIGH priority features
5. **Phase 8-9** (12 components) - MEDIUM priority features
6. **Phase 10** (19 components) - LOW priority screens and misc

## 📝 Notes

- Dynamic testIDs use template literals with unique identifiers (e.g., `testID={`walk-item-${walk.id}`}`)
- All testIDs follow kebab-case naming convention
- Modal components always have `-modal` suffix
- Button components always have `-button` suffix
- Input components always have `-input` suffix
- List items use the pattern `{type}-item-{id}`

