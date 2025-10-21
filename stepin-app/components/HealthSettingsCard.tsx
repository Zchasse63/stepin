/**
 * Health Settings Card Component
 * Shows health tracking status and provides option to enable/configure
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { getHealthService } from '../lib/health';
import { hasCompletedHistoricalImport } from '../lib/health/historicalImport';
import { logger } from '../lib/utils/logger';

interface HealthSettingsCardProps {
  onPermissionGranted?: () => void;
  onShowHistoricalImport?: () => void;
}

export function HealthSettingsCard({ onPermissionGranted, onShowHistoricalImport }: HealthSettingsCardProps) {
  const { colors } = useTheme();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [hasImported, setHasImported] = useState(false);
  const healthServiceName = Platform.OS === 'ios' ? 'HealthKit' : 'Health Connect';

  useEffect(() => {
    checkPermissions();
    checkImportStatus();
  }, []);

  const checkPermissions = async () => {
    try {
      setChecking(true);
      const healthService = getHealthService();
      const granted = await healthService.checkPermissions();
      setPermissionsGranted(granted);
    } catch (error) {
      logger.error('Error checking health permissions:', error);
    } finally {
      setChecking(false);
    }
  };

  const checkImportStatus = async () => {
    try {
      const imported = await hasCompletedHistoricalImport();
      setHasImported(imported);
    } catch (error) {
      logger.error('Error checking import status:', error);
    }
  };

  const handleEnableTracking = async () => {
    try {
      setRequesting(true);
      const healthService = getHealthService();
      const result = await healthService.requestPermissions();

      if (result.granted) {
        setPermissionsGranted(true);
        onPermissionGranted?.();

        // Check if historical import needed
        const imported = await hasCompletedHistoricalImport();
        if (!imported) {
          // Trigger historical import modal
          onShowHistoricalImport?.();
        }
      } else {
        // Permissions denied, suggest opening settings
        handleOpenSettings();
      }
    } catch (error) {
      logger.error('Error requesting health permissions:', error);
    } finally {
      setRequesting(false);
    }
  };

  const handleOpenSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      logger.error('Failed to open settings:', error);
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary.main} />
        <Text style={styles.loadingText}>Checking health permissions...</Text>
      </View>
    );
  }

  return (
    <View testID="health-settings-card" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={permissionsGranted ? 'heart' : 'heart-outline'}
            size={24}
            color={permissionsGranted ? colors.status.success : colors.text.secondary}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Health Tracking</Text>
          <Text style={styles.subtitle}>
            {permissionsGranted
              ? `Connected to ${healthServiceName}`
              : `Connect to ${healthServiceName} for automatic step tracking`}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, permissionsGranted && styles.statusBadgeActive]}>
          <View style={[styles.statusDot, permissionsGranted && styles.statusDotActive]} />
          <Text testID="permission-status" style={[styles.statusText, permissionsGranted && styles.statusTextActive]}>
            {permissionsGranted ? 'Active' : 'Disabled'}
          </Text>
        </View>
      </View>

      {!permissionsGranted && (
        <View style={styles.actions}>
          <TouchableOpacity
            testID="request-permission-button"
            style={styles.primaryButton}
            onPress={handleEnableTracking}
            disabled={requesting}
            accessibilityLabel="Enable health tracking"
            accessibilityRole="button"
            accessibilityHint="Requests permission to access health data"
          >
            {requesting ? (
              <ActivityIndicator testID="syncing-indicator" size="small" color={colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
                <Text style={styles.primaryButtonText}>Enable Tracking</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="settings-link"
            style={styles.secondaryButton}
            onPress={handleOpenSettings}
            accessibilityLabel="Open device settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={18} color={colors.primary.main} />
            <Text style={styles.secondaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {permissionsGranted && !hasImported && (
        <View style={styles.actions}>
          <TouchableOpacity
            testID="sync-button"
            style={styles.importButton}
            onPress={onShowHistoricalImport}
            accessibilityLabel="Import historical data"
            accessibilityRole="button"
            accessibilityHint="Import your step history from the last 90 days"
          >
            <Ionicons name="cloud-download-outline" size={20} color={colors.primary.main} />
            <Text style={styles.importButtonText}>Import Historical Data</Text>
          </TouchableOpacity>
        </View>
      )}

      {permissionsGranted && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.infoText}>
            Your health data is synced automatically and stays private on your device.
            {hasImported && ' Historical data has been imported.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loadingText: {
    ...Typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: Layout.spacing.small,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.medium,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.small,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: Layout.spacing.tiny,
  },
  subtitle: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  statusRow: {
    marginBottom: Layout.spacing.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Layout.spacing.small,
    paddingVertical: Layout.spacing.tiny,
    borderRadius: Layout.borderRadius.small,
    backgroundColor: colors.background.tertiary,
    gap: Layout.spacing.tiny,
  },
  statusBadgeActive: {
    backgroundColor: colors.status.success + '20',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.secondary,
  },
  statusDotActive: {
    backgroundColor: colors.status.success,
  },
  statusText: {
    ...Typography.caption1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  statusTextActive: {
    color: colors.status.success,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.small,
    minHeight: Layout.minTapTarget,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  secondaryButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary.main,
  },
  importButton: {
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.small,
    minHeight: Layout.minTapTarget,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  importButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary.main,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.small,
    padding: Layout.spacing.small,
    gap: Layout.spacing.small,
  },
  infoText: {
    ...Typography.caption1,
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 16,
  },
});

