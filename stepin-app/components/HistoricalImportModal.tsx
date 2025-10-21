/**
 * Historical Import Modal Component
 * Shows progress of historical health data import
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import {
  importHistoricalData,
  hasCompletedHistoricalImport,
  type HistoricalImportProgress,
} from '../lib/health/historicalImport';
import { logger } from '../lib/utils/logger';

interface HistoricalImportModalProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onComplete?: (daysImported: number) => void;
}

export function HistoricalImportModal({
  visible,
  userId,
  onClose,
  onComplete,
}: HistoricalImportModalProps) {
  const { colors } = useTheme();
  const [progress, setProgress] = useState<HistoricalImportProgress>({
    totalDays: 90,
    completedDays: 0,
    currentDate: '',
    status: 'importing',
  });
  const [hasStarted, setHasStarted] = useState(false);
  const cancelSignal = useRef({ cancelled: false });

  useEffect(() => {
    if (visible && !hasStarted) {
      checkAndStartImport();
    }
  }, [visible, hasStarted]);

  const checkAndStartImport = async () => {
    try {
      // Check if already completed
      const completed = await hasCompletedHistoricalImport();
      if (completed) {
        setProgress({
          totalDays: 90,
          completedDays: 90,
          currentDate: '',
          status: 'complete',
        });
        return;
      }

      // Start import
      setHasStarted(true);
      cancelSignal.current.cancelled = false;

      const result = await importHistoricalData(
        userId,
        90,
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
        cancelSignal.current
      );

      if (result.success) {
        onComplete?.(result.daysImported);
      }
    } catch (error) {
      logger.error('Error in historical import:', error);
      setProgress({
        totalDays: 90,
        completedDays: 0,
        currentDate: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleCancel = () => {
    if (progress.status === 'importing') {
      cancelSignal.current.cancelled = true;
    }
    onClose();
  };

  const handleClose = () => {
    if (progress.status === 'complete' || progress.status === 'error' || progress.status === 'cancelled') {
      onClose();
    }
  };

  const progressPercentage = progress.totalDays > 0
    ? (progress.completedDays / progress.totalDays) * 100
    : 0;

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      testID="historical-import-modal"
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons
              name={
                progress.status === 'complete'
                  ? 'checkmark-circle'
                  : progress.status === 'error'
                  ? 'alert-circle'
                  : 'cloud-download-outline'
              }
              size={48}
              color={
                progress.status === 'complete'
                  ? colors.status.success
                  : progress.status === 'error'
                  ? colors.status.error
                  : colors.primary.main
              }
            />
            <Text style={styles.title}>
              {progress.status === 'complete'
                ? 'Import Complete!'
                : progress.status === 'error'
                ? 'Import Failed'
                : progress.status === 'cancelled'
                ? 'Import Cancelled'
                : 'Importing Historical Data'}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {progress.status === 'importing' && (
              <>
                <Text style={styles.description}>
                  Importing your step history from the last 90 days. This may take a few minutes.
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progressPercentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress.completedDays} of {progress.totalDays} days
                  </Text>
                </View>

                {progress.currentDate && (
                  <Text style={styles.currentDate}>
                    Processing: {new Date(progress.currentDate).toLocaleDateString()}
                  </Text>
                )}

                <ActivityIndicator
                  size="large"
                  color={colors.primary.main}
                  style={styles.spinner}
                />
              </>
            )}

            {progress.status === 'complete' && (
              <>
                <Text style={styles.description}>
                  Successfully imported {progress.completedDays} days of step data!
                </Text>
                <View style={styles.successStats}>
                  <View style={styles.successStat}>
                    <Text style={styles.successStatValue}>{progress.completedDays}</Text>
                    <Text style={styles.successStatLabel}>Days Imported</Text>
                  </View>
                </View>
              </>
            )}

            {progress.status === 'error' && (
              <>
                <Text style={styles.errorDescription}>
                  {progress.error || 'An error occurred during import. Please try again.'}
                </Text>
                {progress.completedDays > 0 && (
                  <Text style={styles.partialSuccess}>
                    Partial import: {progress.completedDays} days were imported before the error.
                  </Text>
                )}
              </>
            )}

            {progress.status === 'cancelled' && (
              <Text style={styles.description}>
                Import was cancelled. {progress.completedDays > 0 && `${progress.completedDays} days were imported.`}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {progress.status === 'importing' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                accessibilityLabel="Cancel import"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            {(progress.status === 'complete' || progress.status === 'error' || progress.status === 'cancelled') && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.large,
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: Layout.borderRadius.large,
    width: '100%',
    maxWidth: 400,
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
  content: {
    padding: Layout.spacing.xlarge,
  },
  description: {
    ...Typography.body,
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Layout.spacing.large,
  },
  progressContainer: {
    marginBottom: Layout.spacing.large,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Layout.spacing.small,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 4,
  },
  progressText: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  currentDate: {
    ...Typography.caption1,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.medium,
  },
  spinner: {
    marginTop: Layout.spacing.medium,
  },
  successStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Layout.spacing.large,
  },
  successStat: {
    alignItems: 'center',
  },
  successStatValue: {
    ...Typography.largeTitle,
    fontSize: 36,
    fontWeight: '700',
    color: colors.status.success,
    marginBottom: Layout.spacing.tiny,
  },
  successStatLabel: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
  },
  errorDescription: {
    ...Typography.body,
    fontSize: 15,
    color: colors.status.error,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Layout.spacing.medium,
  },
  partialSuccess: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actions: {
    padding: Layout.spacing.large,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTapTarget,
  },
  cancelButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  doneButton: {
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTapTarget,
  },
  doneButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

