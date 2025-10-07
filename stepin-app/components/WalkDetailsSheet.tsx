/**
 * Walk Details Sheet Component
 * Bottom sheet modal showing full walk details
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Walk } from '../types/database';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { formatDateDisplay, formatDuration } from '../lib/utils/calculateStats';
import { formatDistance } from '../lib/utils/formatDistance';
import type { UnitsPreference } from '../types/profile';
import { HeartRateAnalytics } from './HeartRateAnalytics';

interface WalkDetailsSheetProps {
  walk: Walk | null;
  visible: boolean;
  units?: UnitsPreference;
  onClose: () => void;
  onDelete?: (walk: Walk) => void;
}

export default function WalkDetailsSheet({
  walk,
  visible,
  units = 'miles',
  onClose,
  onDelete,
}: WalkDetailsSheetProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (!walk) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Walk',
      'Are you sure you want to delete this walk? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.(walk);
            onClose();
          },
        },
      ]
    );
  };

  const formattedDate = formatDateDisplay(walk.date, 'EEEE, MMMM d, yyyy');
  const duration = walk.duration_minutes ? formatDuration(walk.duration_minutes) : 'Not recorded';
  const distance = walk.distance_meters ? formatDistance(walk.distance_meters, units) : 'Not recorded';


  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Walk Details</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={28} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Date */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Date</Text>
              <Text style={styles.sectionValue}>{formattedDate}</Text>
            </View>

            {/* Steps */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Steps</Text>
              <View style={styles.stepsRow}>
                <Ionicons name="footsteps" size={32} color={colors.primary.main} />
                <Text style={styles.stepsValue}>
                  {walk.steps.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Duration</Text>
              <View style={styles.metadataRow}>
                <Ionicons name="time" size={24} color={colors.system.purple} />
                <Text style={styles.metadataValue}>{duration}</Text>
              </View>
            </View>

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Distance</Text>
              <View style={styles.metadataRow}>
                <Ionicons name="navigate" size={24} color={colors.system.orange} />
                <Text style={styles.metadataValue}>{distance}</Text>
              </View>
            </View>

            {/* Phase 12: Heart Rate Analytics */}
            {(walk.average_heart_rate || walk.max_heart_rate) && (
              <View style={styles.section}>
                <HeartRateAnalytics
                  averageHR={walk.average_heart_rate}
                  maxHR={walk.max_heart_rate}
                />
              </View>
            )}

            {/* Logged Date */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Logged</Text>
              <Text style={styles.sectionValue}>
                {formatDateDisplay(walk.created_at, 'MMM d, yyyy h:mm a')}
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          {onDelete && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                accessibilityRole="button"
                accessibilityLabel="Delete walk"
              >
                <Ionicons name="trash" size={20} color={colors.text.inverse} />
                <Text style={styles.deleteButtonText}>Delete Walk</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: Layout.borderRadius.xlarge,
    borderTopRightRadius: Layout.borderRadius.xlarge,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.system.gray4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Layout.spacing.small,
    marginBottom: Layout.spacing.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...Typography.title2,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: Layout.spacing.tiny,
    minWidth: Layout.minTapTarget,
    minHeight: Layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.medium,
  },
  section: {
    marginBottom: Layout.spacing.large,
  },
  sectionLabel: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    ...Typography.body,
    fontSize: 17,
    color: colors.text.primary,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepsValue: {
    ...Typography.largeTitle,
    fontSize: 40,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: Layout.spacing.medium,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataValue: {
    ...Typography.body,
    fontSize: 17,
    color: colors.text.primary,
    marginLeft: Layout.spacing.medium,
  },
  actions: {
    padding: Layout.spacing.large,
    paddingBottom: Layout.spacing.large + Layout.safeArea.bottom,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.error,
    paddingVertical: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.large,
    minHeight: Layout.minTapTarget,
  },
  deleteButtonText: {
    ...Typography.body,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.inverse,
    marginLeft: Layout.spacing.small,
  },
});

