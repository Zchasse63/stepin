/**
 * Health Permission Denied Banner Component
 * Shows when health permissions are denied, with option to open settings
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

const HEALTH_PERMISSION_DISMISSED_KEY = 'health_permission_banner_dismissed';

interface HealthPermissionDeniedBannerProps {
  onDismiss?: () => void;
}

export function HealthPermissionDeniedBanner({ onDismiss }: HealthPermissionDeniedBannerProps) {
  const { colors } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const healthServiceName = Platform.OS === 'ios' ? 'HealthKit' : 'Health Connect';

  const handleOpenSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(HEALTH_PERMISSION_DISMISSED_KEY, 'true');
      setDismissed(true);
      onDismiss?.();
    } catch (error) {
      console.error('Failed to save dismissal:', error);
    }
  };

  if (dismissed) return null;

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View testID="health-permission-banner" style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons testID="warning-icon" name="heart-dislike-outline" size={24} color={colors.status.warning} />
          <Text style={styles.title}>Health Tracking Disabled</Text>
          <TouchableOpacity
            testID="dismiss-button"
            onPress={handleDismiss}
            style={styles.dismissButton}
            accessibilityLabel="Dismiss banner"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <Text testID="banner-message" style={styles.description}>
          {healthServiceName} permissions are required for automatic step tracking. You can still log walks manually.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            testID="settings-button"
            style={styles.primaryButton}
            onPress={handleOpenSettings}
            accessibilityLabel="Open device settings"
            accessibilityRole="button"
            accessibilityHint="Opens device settings to enable health permissions"
          >
            <Ionicons name="settings-outline" size={18} color={colors.text.inverse} />
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDismiss}
            accessibilityLabel="Continue with manual logging"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Continue Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/**
 * Check if the banner has been dismissed
 */
export async function isHealthPermissionBannerDismissed(): Promise<boolean> {
  try {
    const dismissed = await AsyncStorage.getItem(HEALTH_PERMISSION_DISMISSED_KEY);
    return dismissed === 'true';
  } catch (error) {
    console.error('Failed to check banner dismissal:', error);
    return false;
  }
}

/**
 * Reset the banner dismissal (for testing or when permissions change)
 */
export async function resetHealthPermissionBannerDismissal(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HEALTH_PERMISSION_DISMISSED_KEY);
  } catch (error) {
    console.error('Failed to reset banner dismissal:', error);
  }
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.status.warning + '15',
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.status.warning + '40',
    marginHorizontal: Layout.spacing.medium,
    marginVertical: Layout.spacing.small,
    overflow: 'hidden',
  },
  content: {
    padding: Layout.spacing.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.small,
    gap: Layout.spacing.small,
  },
  title: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  dismissButton: {
    padding: Layout.spacing.tiny,
    minWidth: Layout.minTapTarget,
    minHeight: Layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    ...Typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.medium,
    lineHeight: 20,
  },
  actions: {
    gap: Layout.spacing.small,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.small,
    minHeight: Layout.minTapTarget,
  },
  primaryButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  orText: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: Layout.spacing.tiny,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTapTarget,
  },
  secondaryButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary.main,
  },
});

