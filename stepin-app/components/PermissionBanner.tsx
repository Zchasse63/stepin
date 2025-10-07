/**
 * Permission Banner Component
 * Displays a friendly banner explaining why health permissions are needed
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface PermissionBannerProps {
  onRequestPermissions: () => void;
  loading?: boolean;
}

export function PermissionBanner({ onRequestPermissions, loading = false }: PermissionBannerProps) {
  const { colors } = useTheme();
  const healthServiceName = Platform.OS === 'ios' ? 'HealthKit' : 'Health Connect';

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="heart-outline" size={32} color={colors.primary.main} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Track Your Steps Automatically</Text>
        <Text style={styles.description}>
          Connect to {healthServiceName} to automatically track your daily steps. Your health data
          stays private and secure on your device.
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onRequestPermissions}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Requesting...' : `Connect ${healthServiceName}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsButton} onPress={openSettings} activeOpacity={0.7}>
          <Text style={styles.settingsButtonText}>Open Settings</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Don't worry! You can always log walks manually if you prefer.
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.large,
    marginHorizontal: Layout.spacing.medium,
    marginVertical: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    marginRight: Layout.spacing.medium,
    marginTop: Layout.spacing.small,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.title3,
    color: colors.text.primary,
    marginBottom: Layout.spacing.small,
  },
  description: {
    ...Typography.body,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.medium,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    alignItems: 'center',
    minHeight: Layout.touchTarget.minimum,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  buttonText: {
    ...Typography.headline,
    color: colors.text.inverse,
  },
  settingsButton: {
    marginTop: Layout.spacing.small,
    paddingVertical: Layout.spacing.small,
    alignItems: 'center',
  },
  settingsButtonText: {
    ...Typography.body,
    color: colors.system.blue,
  },
  footnote: {
    ...Typography.footnote,
    color: colors.text.secondary,
    marginTop: Layout.spacing.medium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

