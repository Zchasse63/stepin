/**
 * Key Insights Grid Component
 * Displays 4 key metrics in a 2x2 grid: This Week, Best Day, Consistency, Goal Rate
 * Provides at-a-glance performance insights
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { Shadow } from '../constants/Shadow';

interface KeyInsightsGridProps {
  thisWeekSteps: number;
  bestDaySteps: number;
  bestDayDate: string;
  consistencyPercentage: number; // % of days with steps in period
  goalRatePercentage: number; // % of days goal met
}

export default function KeyInsightsGrid({
  thisWeekSteps,
  bestDaySteps,
  bestDayDate,
  consistencyPercentage,
  goalRatePercentage,
}: KeyInsightsGridProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Format best day date (e.g., "Mon, Jan 15")
  const formatBestDayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Key Insights</Text>

      <View style={styles.grid}>
        {/* This Week */}
        <View style={[styles.card, styles.cardTopLeft]}>
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardValue}>{thisWeekSteps.toLocaleString()}</Text>
          <Text style={styles.cardLabel}>This Week</Text>
        </View>

        {/* Best Day */}
        <View style={[styles.card, styles.cardTopRight]}>
          <Text style={styles.cardIcon}>🏆</Text>
          <Text style={styles.cardValue}>{bestDaySteps.toLocaleString()}</Text>
          <Text style={styles.cardLabel}>Best Day</Text>
          <Text style={styles.cardSubLabel}>{formatBestDayDate(bestDayDate)}</Text>
        </View>

        {/* Consistency */}
        <View style={[styles.card, styles.cardBottomLeft]}>
          <Text style={styles.cardIcon}>🎯</Text>
          <Text style={styles.cardValue}>{consistencyPercentage}%</Text>
          <Text style={styles.cardLabel}>Consistency</Text>
          <Text style={styles.cardSubLabel}>Days Active</Text>
        </View>

        {/* Goal Rate */}
        <View style={[styles.card, styles.cardBottomRight]}>
          <Text style={styles.cardIcon}>⭐</Text>
          <Text style={styles.cardValue}>{goalRatePercentage}%</Text>
          <Text style={styles.cardLabel}>Goal Rate</Text>
          <Text style={styles.cardSubLabel}>Goals Met</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginHorizontal: Layout.spacing.large,
    marginTop: Layout.spacing.medium,
  },
  sectionTitle: {
    ...Typography.title3,
    color: colors.text.primary,
    marginBottom: Layout.spacing.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.medium,
  },
  card: {
    flex: 1,
    minWidth: '45%', // Ensures 2 columns
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.small,
  },
  cardTopLeft: {},
  cardTopRight: {},
  cardBottomLeft: {},
  cardBottomRight: {},
  cardIcon: {
    fontSize: 32,
    lineHeight: 32,
    marginBottom: Layout.spacing.small,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary.main,
    lineHeight: 34,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 18,
    textAlign: 'center',
  },
  cardSubLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.secondary,
    lineHeight: 16,
    marginTop: 2,
    textAlign: 'center',
  },
});
