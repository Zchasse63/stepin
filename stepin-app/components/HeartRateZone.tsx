/**
 * Heart Rate Zone Component
 * Displays current heart rate with zone indicator and color coding
 * Phase 12: Advanced Features
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';

interface HeartRateZoneProps {
  currentHR: number | null;
  zone?: number | null; // 1-4, optional - will be calculated if not provided
  maxHeartRate?: number; // Optional custom max HR for zone calculation
  compact?: boolean; // Compact mode for smaller displays
}

// User-friendly zone definitions for beginner wellness app
const ZONE_INFO = {
  1: { name: 'Resting', color: '#9E9E9E', description: 'Recovery', range: '< 100 BPM' },
  2: { name: 'Fat Burn', color: '#03A9F4', description: 'Light Activity', range: '100-130 BPM' },
  3: { name: 'Cardio', color: '#4CAF50', description: 'Moderate Activity', range: '131-160 BPM' },
  4: { name: 'Peak', color: '#FF3B30', description: 'High Intensity', range: '> 160 BPM' },
};

/**
 * Calculate heart rate zone based on BPM
 * Uses simplified fixed ranges for beginner-friendly UX
 */
function calculateZone(hr: number, maxHR?: number): number {
  // If custom max HR provided, use percentage-based calculation
  if (maxHR) {
    const percentage = (hr / maxHR) * 100;
    if (percentage < 60) return 1;
    if (percentage < 70) return 2;
    if (percentage < 85) return 3;
    return 4;
  }

  // Default: Use fixed BPM ranges (simpler for beginners)
  if (hr < 100) return 1; // Resting
  if (hr <= 130) return 2; // Fat Burn
  if (hr <= 160) return 3; // Cardio
  return 4; // Peak
}

export function HeartRateZone({ currentHR, zone, maxHeartRate, compact = false }: HeartRateZoneProps) {
  const { colors } = useTheme();

  if (currentHR === null || currentHR === undefined) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart-outline" size={compact ? 20 : 24} color={colors.text.secondary} />
        </View>
        <Text style={[styles.noDataText, { color: colors.text.secondary }]}>
          {compact ? 'No HR' : 'No Heart Rate Data'}
        </Text>
      </View>
    );
  }

  // Calculate zone if not provided
  const calculatedZone = zone ?? calculateZone(currentHR, maxHeartRate);
  const zoneInfo = ZONE_INFO[calculatedZone as keyof typeof ZONE_INFO];

  return (
    <View testID="heart-rate-zone" style={[styles.container, compact && styles.containerCompact]}>
      {/* Heart Rate Display */}
      <View testID="zone-indicator" style={styles.hrContainer}>
        <Ionicons 
          name="heart" 
          size={compact ? 20 : 28} 
          color={zoneInfo.color} 
          style={styles.heartIcon}
        />
        <View>
          <Text style={[styles.hrValue, compact && styles.hrValueCompact]}>
            {currentHR}
          </Text>
          <Text style={[styles.hrLabel, { color: colors.text.secondary }]}>
            BPM
          </Text>
        </View>
      </View>

      {/* Zone Indicator */}
      {!compact && (
        <View style={styles.zoneContainer}>
          <View style={[styles.zoneBadge, { backgroundColor: zoneInfo.color }]}>
            <Text testID="zone-label" style={styles.zoneName}>{zoneInfo.name}</Text>
          </View>
          <Text testID="zone-range" style={[styles.zoneDescription, { color: colors.text.secondary }]}>
            {zoneInfo.range}
          </Text>
        </View>
      )}

      {/* Compact Zone Indicator */}
      {compact && (
        <View style={[styles.zoneIndicatorCompact, { backgroundColor: zoneInfo.color }]}>
          <Text style={styles.zoneNumberCompact}>Z{calculatedZone}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  containerCompact: {
    padding: Layout.spacing.sm,
    justifyContent: 'flex-start',
    gap: Layout.spacing.sm,
  },
  iconContainer: {
    marginRight: Layout.spacing.sm,
  },
  noDataText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  hrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  heartIcon: {
    marginRight: Layout.spacing.xs,
  },
  hrValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.fontSize.xxl * 1.2,
  },
  hrValueCompact: {
    fontSize: Typography.fontSize.lg,
    lineHeight: Typography.fontSize.lg * 1.2,
  },
  hrLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: -4,
  },
  zoneContainer: {
    alignItems: 'flex-end',
  },
  zoneBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xs,
  },
  zoneName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#000',
  },
  zoneDescription: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  zoneIndicatorCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneNumberCompact: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#000',
  },
});

