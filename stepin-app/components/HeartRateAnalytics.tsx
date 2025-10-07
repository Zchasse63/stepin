/**
 * Heart Rate Analytics Component
 * Displays post-walk heart rate analytics with average, max, and zone breakdown
 * Phase 12: Advanced Features
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';

interface HeartRateAnalyticsProps {
  averageHR?: number;
  maxHR?: number;
}

const ZONE_COLORS = {
  1: '#A8E6CF',
  2: '#FFD3B6',
  3: '#FFAAA5',
  4: '#FF8B94',
  5: '#FF6B6B',
};

const ZONE_NAMES = {
  1: 'Very Light',
  2: 'Light',
  3: 'Moderate',
  4: 'Hard',
  5: 'Maximum',
};

export function HeartRateAnalytics({ averageHR, maxHR }: HeartRateAnalyticsProps) {
  const { colors } = useTheme();

  if (!averageHR && !maxHR) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <View style={styles.header}>
          <Ionicons name="heart-outline" size={20} color={colors.text.secondary} />
          <Text style={[styles.title, { color: colors.text.primary }]}>Heart Rate</Text>
        </View>
        <Text style={[styles.noDataText, { color: colors.text.secondary }]}>
          No heart rate data available for this walk
        </Text>
      </View>
    );
  }

  // Calculate which zone the average HR falls into (assuming max HR = 190)
  const estimatedMaxHR = 190;
  const avgZone = averageHR ? calculateZone(averageHR, estimatedMaxHR) : null;
  const maxZone = maxHR ? calculateZone(maxHR, estimatedMaxHR) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <View style={styles.header}>
        <Ionicons name="heart" size={20} color={colors.system.red} />
        <Text style={[styles.title, { color: colors.text.primary }]}>Heart Rate</Text>
      </View>

      <View style={styles.statsRow}>
        {/* Average HR */}
        {averageHR && (
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Average</Text>
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {Math.round(averageHR)}
              </Text>
              <Text style={[styles.statUnit, { color: colors.text.secondary }]}>BPM</Text>
            </View>
            {avgZone && (
              <View style={[styles.zoneBadge, { backgroundColor: ZONE_COLORS[avgZone as keyof typeof ZONE_COLORS] }]}>
                <Text style={styles.zoneBadgeText}>
                  Zone {avgZone} - {ZONE_NAMES[avgZone as keyof typeof ZONE_NAMES]}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Max HR */}
        {maxHR && (
          <View style={styles.statCard}>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Maximum</Text>
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {Math.round(maxHR)}
              </Text>
              <Text style={[styles.statUnit, { color: colors.text.secondary }]}>BPM</Text>
            </View>
            {maxZone && (
              <View style={[styles.zoneBadge, { backgroundColor: ZONE_COLORS[maxZone as keyof typeof ZONE_COLORS] }]}>
                <Text style={styles.zoneBadgeText}>
                  Zone {maxZone} - {ZONE_NAMES[maxZone as keyof typeof ZONE_NAMES]}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Zone Legend */}
      <View style={styles.legendContainer}>
        <Text style={[styles.legendTitle, { color: colors.text.secondary }]}>Heart Rate Zones</Text>
        <View style={styles.legendGrid}>
          {Object.entries(ZONE_NAMES).map(([zone, name]) => (
            <View key={zone} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: ZONE_COLORS[parseInt(zone) as keyof typeof ZONE_COLORS] },
                ]}
              />
              <Text style={[styles.legendText, { color: colors.text.secondary }]}>
                Z{zone}: {name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function calculateZone(currentHR: number, maxHR: number): number {
  const percentage = (currentHR / maxHR) * 100;
  
  if (percentage < 60) return 1;
  if (percentage < 70) return 2;
  if (percentage < 80) return 3;
  if (percentage < 90) return 4;
  return 5;
}

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  noDataText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    paddingVertical: Layout.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Layout.spacing.xs,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  statUnit: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  zoneBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
  },
  zoneBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#000',
  },
  legendContainer: {
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  legendTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Layout.spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    width: '48%',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});

