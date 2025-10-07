/**
 * Day Details Card Component
 * Shows detailed statistics for a selected day
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyStats, Walk } from '../types/database';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { formatDateDisplay, getAbbreviatedDayName } from '../lib/utils/dateUtils';
import { formatDuration, formatDistance, calculateGoalPercentage } from '../lib/utils/calculateStats';

interface DayDetailsCardProps {
  date: string;
  dailyStats: DailyStats | null;
  walks: Walk[];
  stepGoal: number;
  onClose?: () => void;
}

export default function DayDetailsCard({
  date,
  dailyStats,
  walks,
  stepGoal,
  onClose,
}: DayDetailsCardProps) {
  const { colors } = useTheme();
  const steps = dailyStats?.total_steps || 0;
  const goalMet = dailyStats?.goal_met || false;
  const percentage = calculateGoalPercentage(steps, stepGoal);
  
  // Calculate totals from walks
  const totalDuration = walks.reduce((sum, walk) => sum + (walk.duration_minutes || 0), 0);
  const totalDistance = walks.reduce((sum, walk) => sum + (walk.distance_meters || 0), 0);

  const dayName = getAbbreviatedDayName(date);
  const formattedDate = formatDateDisplay(date, 'MMM d');

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close details"
          >
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Steps */}
      <View style={styles.stepsSection}>
        <View style={styles.stepsRow}>
          <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
          {goalMet && (
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={colors.status.success}
              style={styles.goalIcon}
            />
          )}
        </View>
        <Text style={styles.stepsLabel}>steps</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: goalMet ? colors.status.success : colors.primary.main,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {percentage}% of {stepGoal.toLocaleString()} goal
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="walk" size={20} color={colors.secondary.main} />
          <Text style={styles.statValue}>{walks.length}</Text>
          <Text style={styles.statLabel}>walks</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color={colors.system.purple} />
          <Text style={styles.statValue}>
            {totalDuration > 0 ? formatDuration(totalDuration) : '—'}
          </Text>
          <Text style={styles.statLabel}>duration</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="navigate" size={20} color={colors.system.orange} />
          <Text style={styles.statValue}>
            {totalDistance > 0 ? formatDistance(totalDistance) : '—'}
          </Text>
          <Text style={styles.statLabel}>distance</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginHorizontal: Layout.spacing.medium,
    marginVertical: Layout.spacing.small,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.medium,
  },
  dayName: {
    ...Typography.caption1,
    fontSize: 14,
    color: colors.text.secondary,
  },
  date: {
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
  stepsSection: {
    alignItems: 'center',
    marginBottom: Layout.spacing.large,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepsValue: {
    ...Typography.largeTitle,
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
  },
  goalIcon: {
    marginLeft: Layout.spacing.small,
  },
  stepsLabel: {
    ...Typography.body,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.small,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.system.gray5,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Layout.spacing.tiny,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Layout.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.headline,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: Layout.spacing.tiny,
  },
  statLabel: {
    ...Typography.caption2,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: Layout.spacing.tiny,
  },
});

