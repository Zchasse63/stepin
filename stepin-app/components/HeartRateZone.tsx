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
  zone: number | null; // 1-5
  compact?: boolean; // Compact mode for smaller displays
}

const ZONE_INFO = {
  1: { name: 'Very Light', color: '#A8E6CF', description: 'Warm-up' },
  2: { name: 'Light', color: '#FFD3B6', description: 'Fat Burn' },
  3: { name: 'Moderate', color: '#FFAAA5', description: 'Cardio' },
  4: { name: 'Hard', color: '#FF8B94', description: 'Performance' },
  5: { name: 'Maximum', color: '#FF6B6B', description: 'Peak Effort' },
};

export function HeartRateZone({ currentHR, zone, compact = false }: HeartRateZoneProps) {
  const { colors } = useTheme();

  if (!currentHR || !zone) {
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

  const zoneInfo = ZONE_INFO[zone as keyof typeof ZONE_INFO];

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Heart Rate Display */}
      <View style={styles.hrContainer}>
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
            <Text style={styles.zoneName}>Zone {zone}</Text>
          </View>
          <Text style={[styles.zoneDescription, { color: colors.text.secondary }]}>
            {zoneInfo.description}
          </Text>
        </View>
      )}

      {/* Compact Zone Indicator */}
      {compact && (
        <View style={[styles.zoneIndicatorCompact, { backgroundColor: zoneInfo.color }]}>
          <Text style={styles.zoneNumberCompact}>Z{zone}</Text>
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

