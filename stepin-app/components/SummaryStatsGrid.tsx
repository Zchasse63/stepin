/**
 * Summary Stats Grid Component
 * Grid layout displaying 4 summary statistics
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import SummaryStatsCard from './SummaryStatsCard';
import { SummaryStats } from '../types/history';
import { Layout } from '../constants/Layout';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface SummaryStatsGridProps {
  stats: SummaryStats;
}

export default function SummaryStatsGrid({ stats }: SummaryStatsGridProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <View style={styles.cardWrapper}>
          <SummaryStatsCard
            label="Total Steps"
            value={stats.totalSteps}
            icon="footsteps"
            iconColor={colors.primary.main}
          />
        </View>
        <View style={styles.cardWrapper}>
          <SummaryStatsCard
            label="Walks Logged"
            value={stats.totalWalks}
            icon="walk"
            iconColor={colors.secondary.main}
          />
        </View>
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <View style={styles.cardWrapper}>
          <SummaryStatsCard
            label="Average Steps"
            value={stats.averageSteps}
            icon="trending-up"
            iconColor={colors.system.purple}
            subtitle="per day"
          />
        </View>
        <View style={styles.cardWrapper}>
          <SummaryStatsCard
            label="Days Goal Met"
            value={`${stats.daysGoalMet}`}
            icon="checkmark-circle"
            iconColor={colors.status.success}
            subtitle={`${stats.goalMetPercentage}% of days`}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
  },
  row: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.small,
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: Layout.spacing.tiny,
  },
});

