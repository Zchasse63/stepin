/**
 * Notification Permission Banner
 * Shows when notification permissions are denied
 * Provides option to open device settings
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';

interface NotificationPermissionBannerProps {
  onDismiss?: () => void;
}

export function NotificationPermissionBanner({ onDismiss }: NotificationPermissionBannerProps) {
  const { colors } = useTheme();

  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openSettings();
    } else {
      // Android - open app settings
      Linking.openSettings();
    }
  };

  return (
    <View testID="notification-permission-banner" style={[styles.container, { backgroundColor: colors.status.warning + '20', borderColor: colors.status.warning }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-off" size={24} color={colors.status.warning} />
      </View>

      <View style={styles.content}>
        <Text testID="banner-title" style={[styles.title, { color: colors.text.primary }]}>
          Notifications are disabled
        </Text>
        <Text testID="banner-message" style={[styles.message, { color: colors.text.secondary }]}>
          Enable notifications in Settings to receive daily reminders and streak alerts.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            testID="open-settings-button"
            style={[styles.button, { backgroundColor: colors.status.warning }]}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
            accessibilityLabel="Open Settings"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Open Settings</Text>
          </TouchableOpacity>

          {onDismiss && (
            <TouchableOpacity
              testID="dismiss-button"
              style={[styles.dismissButton]}
              onPress={onDismiss}
              activeOpacity={0.7}
              accessibilityLabel="Dismiss"
              accessibilityRole="button"
            >
              <Text style={[styles.dismissText, { color: colors.text.secondary }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: Layout.spacing.md,
  },
  iconContainer: {
    marginRight: Layout.spacing.md,
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Layout.spacing.xs,
  },
  message: {
    ...Typography.caption1,
    marginBottom: Layout.spacing.md,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  button: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  buttonText: {
    ...Typography.caption1,
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.semibold,
  },
  dismissButton: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.sm,
  },
  dismissText: {
    ...Typography.caption1,
    fontWeight: Typography.fontWeight.medium,
  },
});

