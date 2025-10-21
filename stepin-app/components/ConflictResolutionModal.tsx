/**
 * Conflict Resolution Modal
 * Shows when sync conflicts are detected and allows user to choose resolution
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import {
  resolveConflict,
  autoResolveConflict,
  type SyncConflict,
  type ConflictResolutionStrategy,
} from '../lib/offline/conflictResolver';
import { logger } from '../lib/utils/logger';
import type { Walk } from '../types/database';

interface ConflictResolutionModalProps {
  visible: boolean;
  conflict: SyncConflict | null;
  userId: string;
  onClose: () => void;
  onResolved?: () => void;
}

export function ConflictResolutionModal({
  visible,
  conflict,
  userId,
  onClose,
  onResolved,
}: ConflictResolutionModalProps) {
  const { colors } = useTheme();
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async (strategy: ConflictResolutionStrategy) => {
    if (!conflict) return;

    try {
      setResolving(true);
      setError(null);

      const result = await resolveConflict(conflict, strategy, userId);

      if (result.success) {
        logger.info('Conflict resolved successfully', { strategy });
        onResolved?.();
        onClose();
      } else {
        setError(result.error || 'Failed to resolve conflict');
      }
    } catch (err) {
      logger.error('Error resolving conflict:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setResolving(false);
    }
  };

  const handleAutoResolve = async () => {
    if (!conflict) return;

    try {
      setResolving(true);
      setError(null);

      const result = await autoResolveConflict(conflict, userId);

      if (result.success) {
        logger.info('Conflict auto-resolved successfully');
        onResolved?.();
        onClose();
      } else {
        setError(result.error || 'Failed to auto-resolve conflict');
      }
    } catch (err) {
      logger.error('Error auto-resolving conflict:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setResolving(false);
    }
  };

  if (!conflict) return null;

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const renderWalkConflict = () => {
    const local = conflict.localVersion as Partial<Walk>;
    const server = conflict.serverVersion as Walk;

    return (
      <View style={styles.conflictContent}>
        <Text style={styles.description}>
          This walk was modified both offline and online. Choose which version to keep:
        </Text>

        {/* Local Version */}
        <View style={styles.versionCard}>
          <View style={styles.versionHeader}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.primary.main} />
            <Text style={styles.versionTitle}>Your Changes (Local)</Text>
          </View>
          <View style={styles.versionDetails}>
            <Text style={styles.detailText}>Steps: {local.steps?.toLocaleString() || 'N/A'}</Text>
            <Text style={styles.detailText}>
              Duration: {local.duration_minutes || 'N/A'} min
            </Text>
            <Text style={styles.detailText}>
              Distance: {local.distance_meters ? `${(local.distance_meters / 1000).toFixed(2)} km` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Server Version */}
        <View style={styles.versionCard}>
          <View style={styles.versionHeader}>
            <Ionicons name="cloud-outline" size={20} color={colors.status.info} />
            <Text style={styles.versionTitle}>Server Version</Text>
          </View>
          <View style={styles.versionDetails}>
            <Text style={styles.detailText}>Steps: {server.steps.toLocaleString()}</Text>
            <Text style={styles.detailText}>
              Duration: {server.duration_minutes || 'N/A'} min
            </Text>
            <Text style={styles.detailText}>
              Distance: {server.distance_meters ? `${(server.distance_meters / 1000).toFixed(2)} km` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="git-merge-outline" size={32} color={colors.status.warning} />
            <Text style={styles.title}>Sync Conflict Detected</Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollContent}>
            {conflict.type === 'walk' && renderWalkConflict()}

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.autoResolveButton}
              onPress={handleAutoResolve}
              disabled={resolving}
              accessibilityLabel="Auto-resolve conflict"
              accessibilityRole="button"
            >
              {resolving ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="flash-outline" size={18} color={colors.text.inverse} />
                  <Text style={styles.autoResolveButtonText}>Auto-Resolve (Merge)</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.manualActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleResolve('keep_local')}
                disabled={resolving}
                accessibilityLabel="Keep local version"
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>Keep Local</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleResolve('keep_server')}
                disabled={resolving}
                accessibilityLabel="Keep server version"
                accessibilityRole="button"
              >
                <Text style={styles.secondaryButtonText}>Keep Server</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={resolving}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: Layout.borderRadius.xlarge,
    borderTopRightRadius: Layout.borderRadius.xlarge,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: Layout.spacing.xlarge,
    paddingBottom: Layout.spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...Typography.title2,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: Layout.spacing.medium,
    textAlign: 'center',
  },
  scrollContent: {
    maxHeight: 400,
  },
  conflictContent: {
    padding: Layout.spacing.large,
  },
  description: {
    ...Typography.body,
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.large,
    lineHeight: 22,
  },
  versionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.medium,
    marginBottom: Layout.spacing.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.small,
    marginBottom: Layout.spacing.small,
  },
  versionTitle: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  versionDetails: {
    gap: Layout.spacing.tiny,
  },
  detailText: {
    ...Typography.body,
    fontSize: 14,
    color: colors.text.secondary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.small,
    backgroundColor: colors.status.error + '15',
    padding: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Layout.spacing.medium,
  },
  errorText: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.status.error,
    flex: 1,
  },
  actions: {
    padding: Layout.spacing.large,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: Layout.spacing.medium,
  },
  autoResolveButton: {
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.small,
    minHeight: Layout.minTapTarget,
  },
  autoResolveButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  manualActions: {
    flexDirection: 'row',
    gap: Layout.spacing.medium,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTapTarget,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  secondaryButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTapTarget,
  },
  cancelButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
});

