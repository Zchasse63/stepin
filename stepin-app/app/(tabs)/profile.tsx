/**
 * Profile Screen
 * User profile management, settings, and preferences
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useProfileStore } from '../../lib/store/profileStore';
import { useSocialStore } from '../../lib/store/socialStore';
import { ProfileHeader } from '../../components/ProfileHeader';
import { StatsGrid } from '../../components/StatsGrid';
import { SettingsSection } from '../../components/SettingsSection';
import { SettingRow } from '../../components/SettingRow';
import { GoalSlider } from '../../components/GoalSlider';
import { TimePickerModal } from '../../components/TimePickerModal';
import { SentryTestButton } from '../../components/SentryTestButton';
import { Typography } from '../../constants/Typography';
import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import { exportUserData, deleteUserAccount } from '../../lib/utils/profileUtils';
import {
  requestNotificationPermissions,
  updateNotificationSchedule,
  cancelAllNotifications,
} from '../../lib/notifications/notificationService';
import type { UnitsPreference, ThemePreference, PreferredWalkTime } from '../../types/profile';
import { rescheduleWeatherNotifications } from '../../lib/weather/weatherNotifications';
import * as Location from 'expo-location';
import { getHealthService } from '../../lib/health';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut: authSignOut } = useAuthStore();
  const {
    profile,
    stats,
    loading,
    loadProfile,
    loadStats,
    updateGoal,
    updateUnits,
    updateTheme,
    updateNotificationSettings,
    updateProfile,
    notificationIds,
    setNotificationId,
    clearProfile,
  } = useProfileStore();

  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showWalkTimeModal, setShowWalkTimeModal] = useState(false);
  const [showIntervalModal, setShowIntervalModal] = useState(false); // Phase 10
  const [locationLoading, setLocationLoading] = useState(false);

  // Phase 11: Social store
  const { buddies, loadBuddies } = useSocialStore();

  // Load profile and stats on mount
  useEffect(() => {
    loadProfile();
    loadStats();
    if (user) {
      loadBuddies(user.id);
    }
  }, [user]);

  // Handle goal slider change
  const handleGoalChange = async (newGoal: number) => {
    try {
      await updateGoal(newGoal);
      Alert.alert('Success', 'Daily step goal updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update goal');
    }
  };

  // Handle notification toggles
  const handleNotificationToggle = async (
    type: 'dailyReminder' | 'streakReminder' | 'goalCelebration',
    value: boolean
  ) => {
    if (!profile) return;

    try {
      // Request permissions if enabling for the first time
      if (value) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive reminders.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }

      const newSettings = {
        ...profile.notification_settings,
        [type]: value,
      };

      // Update notification schedule
      const newIds = await updateNotificationSchedule(
        newSettings,
        {
          dailyReminder: notificationIds.dailyReminder,
          streakReminder: notificationIds.streakReminder,
        }
      );

      // Update stored notification IDs
      setNotificationId('dailyReminder', newIds.dailyReminder);
      setNotificationId('streakReminder', newIds.streakReminder);

      // Update settings in database
      await updateNotificationSettings(newSettings);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update notification settings');
    }
  };

  // Handle reminder time change
  const handleReminderTimeChange = async (time: string) => {
    if (!profile) return;

    try {
      const newSettings = {
        ...profile.notification_settings,
        reminderTime: time,
      };

      // Update notification schedule with new time
      const newIds = await updateNotificationSchedule(
        newSettings,
        {
          dailyReminder: notificationIds.dailyReminder,
          streakReminder: notificationIds.streakReminder,
        }
      );

      // Update stored notification IDs
      setNotificationId('dailyReminder', newIds.dailyReminder);
      setNotificationId('streakReminder', newIds.streakReminder);

      // Update settings in database
      await updateNotificationSettings(newSettings);
      setShowTimePickerModal(false);
      Alert.alert('Success', 'Reminder time updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update reminder time');
    }
  };

  // Handle units preference change
  const handleUnitsChange = async (units: UnitsPreference) => {
    try {
      await updateUnits(units);
      setShowUnitsModal(false);
      Alert.alert('Success', 'Units preference updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update units');
    }
  };

  // Handle theme preference change
  const handleThemeChange = async (theme: ThemePreference) => {
    try {
      await updateTheme(theme);
      setShowThemeModal(false);
      Alert.alert('Success', 'Theme preference updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update theme');
    }
  };

  // Phase 10: Handle weather alerts toggle
  const handleWeatherAlertsToggle = async (value: boolean) => {
    if (!profile || !user) return;

    try {
      await updateProfile({ weather_alerts_enabled: value });

      if (value && user.id) {
        // Reschedule notifications when enabled
        await rescheduleWeatherNotifications(user.id);
      }

      Alert.alert('Success', value ? 'Weather alerts enabled!' : 'Weather alerts disabled!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update weather alerts');
    }
  };

  // Phase 10: Handle preferred walk time change
  const handleWalkTimeChange = async (time: PreferredWalkTime) => {
    if (!profile || !user) return;

    try {
      await updateProfile({ preferred_walk_time: time });
      setShowWalkTimeModal(false);

      // Reschedule notifications with new time
      if (profile.weather_alerts_enabled && user.id) {
        await rescheduleWeatherNotifications(user.id);
      }

      Alert.alert('Success', 'Preferred walk time updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update walk time');
    }
  };

  // Phase 10: Request location permission and save coordinates
  const handleEnableLocation = async () => {
    if (!profile) return;

    try {
      setLocationLoading(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for weather features.');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      // Save to profile
      await updateProfile({
        location_coordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      });

      Alert.alert('Success', 'Location saved! Weather features are now available.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get location');
    } finally {
      setLocationLoading(false);
    }
  };

  // Phase 10: Handle audio coaching toggle
  const handleAudioCoachingToggle = async (value: boolean) => {
    if (!profile) return;

    try {
      await updateProfile({ audio_coaching_enabled: value });
      Alert.alert('Success', value ? 'Audio coaching enabled!' : 'Audio coaching disabled!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update audio coaching');
    }
  };

  // Phase 10: Handle coaching interval change
  const handleIntervalChange = async (intervalSeconds: number) => {
    if (!profile) return;

    try {
      await updateProfile({ audio_coaching_interval: intervalSeconds });
      setShowIntervalModal(false);
      Alert.alert('Success', 'Announcement interval updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update interval');
    }
  };

  // Phase 12: Handle auto-detection toggle
  const handleAutoDetectionToggle = async (value: boolean) => {
    if (!profile) return;

    try {
      const healthService = getHealthService();

      if (value) {
        // Start activity recognition
        await healthService.startActivityRecognition((startTime) => {
          // Callback is handled by notification listener in _layout.tsx
        });
      } else {
        // Stop activity recognition
        await healthService.stopActivityRecognition();
      }

      await updateProfile({ auto_detect_enabled: value });
      Alert.alert(
        'Success',
        value ? 'Workout auto-detection enabled!' : 'Workout auto-detection disabled!'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update auto-detection');
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      await exportUserData();
      Alert.alert('Success', 'Your data has been exported!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export data');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Deletion',
              'Type DELETE to confirm',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async (text?: string) => {
                    if (text === 'DELETE') {
                      try {
                        await deleteUserAccount();
                        clearProfile();
                        router.replace('/(auth)/sign-in');
                      } catch (error: any) {
                        Alert.alert('Error', error.message || 'Failed to delete account');
                      }
                    } else {
                      Alert.alert('Error', 'You must type DELETE to confirm');
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel all notifications
              await cancelAllNotifications();

              // Sign out and clear profile
              await authSignOut();
              clearProfile();
              router.replace('/(auth)/sign-in');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  // Dynamic styles based on theme
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (loading || !profile || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <ProfileHeader
        displayName={profile.display_name}
        email={profile.email}
        avatarUrl={profile.avatar_url}
        loading={loading}
      />

      {/* Stats Grid */}
      <StatsGrid
        totalSteps={stats.totalSteps}
        totalWalks={stats.totalWalks}
        memberSince={stats.memberSince}
        currentStreak={stats.currentStreak}
        buddyCount={buddies.length}
      />

      {/* Goals Section */}
      <SettingsSection title="Goals">
        <GoalSlider
          initialValue={profile.daily_step_goal}
          onValueChange={() => {}}
          onSlidingComplete={handleGoalChange}
        />
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection title="Preferences">
        <SettingRow
          icon="resize"
          iconColor={colors.system.purple}
          label="Units"
          value={profile.units_preference === 'miles' ? 'Miles' : 'Kilometers'}
          variant="disclosure"
          onPress={() => setShowUnitsModal(true)}
        />
        <SettingRow
          icon="color-palette"
          iconColor={colors.system.indigo}
          label="Theme"
          value={
            profile.theme_preference === 'light'
              ? 'Light'
              : profile.theme_preference === 'dark'
              ? 'Dark'
              : 'System'
          }
          variant="disclosure"
          onPress={() => setShowThemeModal(true)}
        />
        <SettingRow
          icon="sunny"
          iconColor={colors.system.orange}
          label="Daily Reminder"
          variant="toggle"
          toggleValue={profile.notification_settings.dailyReminder}
          onToggle={(value) => handleNotificationToggle('dailyReminder', value)}
        />
        <SettingRow
          icon="flame"
          iconColor={colors.system.red}
          label="Streak Reminder"
          variant="toggle"
          toggleValue={profile.notification_settings.streakReminder}
          onToggle={(value) => handleNotificationToggle('streakReminder', value)}
        />
        <SettingRow
          icon="trophy"
          iconColor={colors.accent.gold}
          label="Goal Celebration"
          variant="toggle"
          toggleValue={profile.notification_settings.goalCelebration}
          onToggle={(value) => handleNotificationToggle('goalCelebration', value)}
        />
        {profile.notification_settings.dailyReminder && (
          <SettingRow
            icon="time"
            iconColor={colors.system.blue}
            label="Reminder Time"
            value={profile.notification_settings.reminderTime}
            variant="disclosure"
            onPress={() => setShowTimePickerModal(true)}
            showDivider={false}
          />
        )}
      </SettingsSection>

      {/* Phase 10: Weather Section */}
      <SettingsSection title="Weather">
        {!profile.location_coordinates ? (
          <SettingRow
            icon="location"
            iconColor={colors.system.blue}
            label="Enable Location"
            variant="disclosure"
            onPress={handleEnableLocation}
            showDivider={false}
          />
        ) : (
          <>
            <SettingRow
              icon="rainy"
              iconColor={colors.system.blue}
              label="Weather Alerts"
              variant="toggle"
              toggleValue={profile.weather_alerts_enabled}
              onToggle={handleWeatherAlertsToggle}
            />
            <SettingRow
              icon="time"
              iconColor={colors.system.orange}
              label="Preferred Walk Time"
              value={
                profile.preferred_walk_time === 'morning'
                  ? 'Morning (8 AM)'
                  : profile.preferred_walk_time === 'afternoon'
                  ? 'Afternoon (2 PM)'
                  : 'Evening (6 PM)'
              }
              variant="disclosure"
              onPress={() => setShowWalkTimeModal(true)}
              showDivider={false}
            />
          </>
        )}
      </SettingsSection>

      {/* Phase 10: Audio Coaching Section */}
      <SettingsSection title="Audio Coaching">
        <SettingRow
          icon="volume-high"
          iconColor={colors.primary.main}
          label="Voice Guidance"
          variant="toggle"
          toggleValue={profile.audio_coaching_enabled}
          onToggle={handleAudioCoachingToggle}
        />
        {profile.audio_coaching_enabled && (
          <SettingRow
            icon="timer"
            iconColor={colors.system.orange}
            label="Announcement Interval"
            value={`${Math.floor(profile.audio_coaching_interval / 60)} minutes`}
            variant="disclosure"
            onPress={() => setShowIntervalModal(true)}
            showDivider={false}
          />
        )}
      </SettingsSection>

      {/* Phase 12: Advanced Features Section */}
      <SettingsSection title="Advanced Features">
        <SettingRow
          icon="fitness"
          iconColor={colors.primary.main}
          label="Workout Auto-Detection"
          variant="toggle"
          toggleValue={profile.auto_detect_enabled}
          onToggle={handleAutoDetectionToggle}
          showDivider={false}
        />
      </SettingsSection>

      {/* Privacy Section */}
      <SettingsSection title="Privacy">
        <SettingRow
          icon="shield-checkmark"
          iconColor={colors.system.green}
          label="Health Permissions"
          value="Granted"
          variant="disclosure"
          onPress={() => Linking.openSettings()}
        />
        <SettingRow
          icon="download"
          iconColor={colors.system.blue}
          label="Export Data"
          variant="disclosure"
          onPress={handleExportData}
        />
        <SettingRow
          icon="trash"
          iconColor={colors.status.error}
          label="Delete Account"
          variant="disclosure"
          onPress={handleDeleteAccount}
          destructive
          showDivider={false}
        />
      </SettingsSection>

      {/* Support Section */}
      <SettingsSection title="Support">
        <SettingRow
          icon="help-circle"
          iconColor={colors.system.blue}
          label="FAQs"
          variant="disclosure"
          onPress={() => Linking.openURL('https://stepin.app/faq')}
        />
        <SettingRow
          icon="mail"
          iconColor={colors.system.blue}
          label="Contact Support"
          variant="disclosure"
          onPress={() => Linking.openURL('mailto:support@stepin.app')}
        />
        <SettingRow
          icon="document-text"
          iconColor={colors.system.gray}
          label="Privacy Policy"
          variant="disclosure"
          onPress={() => Linking.openURL('https://stepin.app/privacy')}
        />
        <SettingRow
          icon="document-text"
          iconColor={colors.system.gray}
          label="Terms of Service"
          variant="disclosure"
          onPress={() => Linking.openURL('https://stepin.app/terms')}
          showDivider={false}
        />
      </SettingsSection>

      {/* About Section */}
      <SettingsSection title="About">
        <SettingRow
          icon="information-circle"
          iconColor={colors.system.blue}
          label="App Version"
          value="1.0.0"
          variant="disclosure"
        />
        <SettingRow
          icon="heart"
          iconColor={colors.system.pink}
          label="Credits"
          variant="disclosure"
          onPress={() => Alert.alert('Credits', 'Made with ❤️ for walkers everywhere')}
          showDivider={false}
        />
      </SettingsSection>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePickerModal}
        initialTime={profile.notification_settings.reminderTime}
        onConfirm={handleReminderTimeChange}
        onCancel={() => setShowTimePickerModal(false)}
      />

      {/* Units Selection Modal */}
      {showUnitsModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Units</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleUnitsChange('miles')}
            >
              <Text style={styles.modalOptionText}>Miles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleUnitsChange('kilometers')}
            >
              <Text style={styles.modalOptionText}>Kilometers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowUnitsModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Theme</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleThemeChange('light')}
            >
              <Text style={styles.modalOptionText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleThemeChange('dark')}
            >
              <Text style={styles.modalOptionText}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleThemeChange('system')}
            >
              <Text style={styles.modalOptionText}>System</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Phase 10: Walk Time Selection Modal */}
      {showWalkTimeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Preferred Walk Time</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleWalkTimeChange('morning')}
            >
              <Text style={styles.modalOptionText}>Morning (8 AM)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleWalkTimeChange('afternoon')}
            >
              <Text style={styles.modalOptionText}>Afternoon (2 PM)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleWalkTimeChange('evening')}
            >
              <Text style={styles.modalOptionText}>Evening (6 PM)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowWalkTimeModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Phase 10: Coaching Interval Selection Modal */}
      {showIntervalModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Announcement Interval</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleIntervalChange(180)}
            >
              <Text style={styles.modalOptionText}>3 minutes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleIntervalChange(300)}
            >
              <Text style={styles.modalOptionText}>5 minutes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleIntervalChange(420)}
            >
              <Text style={styles.modalOptionText}>7 minutes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleIntervalChange(600)}
            >
              <Text style={styles.modalOptionText}>10 minutes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowIntervalModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sentry Test Buttons - REMOVE AFTER TESTING */}
      {__DEV__ && (
        <SettingsSection title="🧪 Sentry Testing (Dev Only)">
          <View style={{ padding: 16 }}>
            <SentryTestButton />
          </View>
        </SettingsSection>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.system.gray6,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  signOutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  signOutButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.inverse,
    fontFamily: Typography.fontFamily.semibold,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  modalOptionText: {
    fontSize: 17,
    color: colors.system.blue,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  modalCancelButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 17,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
});

