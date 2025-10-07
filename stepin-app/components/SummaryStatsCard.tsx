/**
 * Summary Stats Card Component
 * Displays individual statistic with label, value, and optional icon
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface SummaryStatsCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subtitle?: string;
}

export default function SummaryStatsCard({
  label,
  value,
  icon,
  iconColor,
  subtitle,
}: SummaryStatsCardProps) {
  const { colors } = useTheme();
  const finalIconColor = iconColor || colors.primary.main;
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      {/* Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={finalIconColor} />
        </View>
      )}

      {/* Value */}
      <Text style={styles.value} numberOfLines={1}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>

      {/* Label */}
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: Layout.spacing.small,
  },
  value: {
    ...Typography.title1,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: Layout.spacing.tiny,
  },
  label: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption2,
    fontSize: 11,
    color: colors.text.disabled,
    marginTop: Layout.spacing.tiny,
    textAlign: 'center',
  },
});

