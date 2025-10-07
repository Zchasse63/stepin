/**
 * Stats Card Component
 * Reusable card for displaying statistics
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface StatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
}

export function StatsCard({ icon, label, value, subtitle, loading = false }: StatsCardProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary.main} />
      </View>

      <Text style={styles.label}>{label}</Text>

      {loading ? (
        <View style={styles.loadingPlaceholder} />
      ) : (
        <>
          <Text style={styles.value}>{value}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    marginBottom: Layout.spacing.small,
  },
  label: {
    ...Typography.caption1,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.small,
    textAlign: 'center',
  },
  value: {
    ...Typography.title2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption2,
    color: colors.text.secondary,
    marginTop: Layout.spacing.tiny,
    textAlign: 'center',
  },
  loadingPlaceholder: {
    width: 60,
    height: 28,
    backgroundColor: colors.border.light,
    borderRadius: Layout.borderRadius.small,
    marginTop: Layout.spacing.small,
  },
});

