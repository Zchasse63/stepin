/**
 * Empty Period State Component
 * Displayed when user has no walks in the selected time period
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface EmptyPeriodStateProps {
  period: 'week' | 'month' | 'year';
}

export default function EmptyPeriodState({ period }: EmptyPeriodStateProps) {
  const { colors } = useTheme();

  const getPeriodLabel = () => {
    switch (period) {
      case 'week':
        return 'this week';
      case 'month':
        return 'this month';
      case 'year':
        return 'this year';
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
      </View>
      <Text style={styles.title}>No Walks {getPeriodLabel()}</Text>
      <Text style={styles.description}>
        You haven't logged any walks {getPeriodLabel()}. Try selecting a different time period or start walking today!
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xxlarge,
    paddingVertical: Layout.spacing.xxlarge * 1.5,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.system.gray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.medium,
  },
  title: {
    ...Typography.title2,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.small,
  },
  description: {
    ...Typography.body,
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

