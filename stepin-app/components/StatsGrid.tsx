/**
 * StatsGrid Component
 * Displays user stats in a 2x2 grid: total steps, total walks, member since, current streak
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Typography } from '../constants/Typography';
import { format } from 'date-fns';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface StatsGridProps {
  totalSteps: number;
  totalWalks: number;
  memberSince: string;
  currentStreak: number;
  buddyCount?: number; // Phase 11: Optional buddy count
}

export function StatsGrid({
  totalSteps,
  totalWalks,
  memberSince,
  currentStreak,
  buddyCount = 0,
}: StatsGridProps) {
  const { colors } = useTheme();

  // Format large numbers (e.g., 12500 -> "12.5K")
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Format member since date
  const formatMemberSince = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM yyyy');
    } catch {
      return 'Recently';
    }
  };

  const stats = [
    {
      icon: 'footsteps' as const,
      iconSet: 'ionicons' as const,
      label: 'Total Steps',
      value: formatNumber(totalSteps),
      color: colors.primary.main,
    },
    {
      icon: 'walk' as const,
      iconSet: 'ionicons' as const,
      label: 'Total Walks',
      value: totalWalks.toString(),
      color: colors.secondary.main,
    },
    {
      icon: 'calendar' as const,
      iconSet: 'ionicons' as const,
      label: 'Member Since',
      value: formatMemberSince(memberSince),
      color: colors.system.purple,
    },
    {
      icon: 'flame' as const,
      iconSet: 'ionicons' as const,
      label: 'Current Streak',
      value: `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`,
      color: colors.system.orange,
    },
    {
      icon: 'users' as const,
      iconSet: 'feather' as const,
      label: 'Buddies',
      value: buddyCount.toString(),
      color: colors.system.teal,
    },
  ];

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.grid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
              {stat.iconSet === 'feather' ? (
                <Feather name={stat.icon as any} size={24} color={stat.color} />
              ) : (
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              )}
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.background.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
});

