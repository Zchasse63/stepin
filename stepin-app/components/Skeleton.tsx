/**
 * Loading Skeleton Component
 * Provides placeholder UI during data loading
 * Phase 4: Visual Polish
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Basic skeleton loader with shimmer animation
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 1], [0.3, 0.7]);
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.background.tertiary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Card skeleton for grid items
 */
export function SkeletonCard() {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.background.tertiary }]}>
      <Skeleton width={32} height={32} borderRadius={16} style={styles.cardIcon} />
      <Skeleton width="60%" height={28} borderRadius={6} style={styles.cardValue} />
      <Skeleton width="80%" height={14} borderRadius={4} />
    </View>
  );
}

/**
 * List item skeleton
 */
export function SkeletonListItem() {
  const { colors } = useTheme();

  return (
    <View style={[styles.listItem, { backgroundColor: colors.background.tertiary }]}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={18} borderRadius={4} style={styles.listItemTitle} />
        <Skeleton width="50%" height={14} borderRadius={4} />
      </View>
    </View>
  );
}

/**
 * Profile header skeleton
 */
export function SkeletonProfileHeader() {
  const { colors } = useTheme();

  return (
    <View style={[styles.profileHeader, { backgroundColor: colors.background.secondary }]}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton width="60%" height={24} borderRadius={6} style={styles.profileName} />
      <Skeleton width="40%" height={16} borderRadius={4} />
    </View>
  );
}

/**
 * Map route skeleton
 */
export function SkeletonMapRoute() {
  const { colors } = useTheme();

  return (
    <View style={[styles.mapRoute, { backgroundColor: colors.background.tertiary }]}>
      <Skeleton width="100%" height={200} borderRadius={12} />
      <View style={styles.mapRouteDetails}>
        <Skeleton width="30%" height={16} borderRadius={4} />
        <Skeleton width="50%" height={20} borderRadius={6} style={styles.mapRouteTitle} />
        <View style={styles.mapRouteStats}>
          <Skeleton width="30%" height={14} borderRadius={4} />
          <Skeleton width="30%" height={14} borderRadius={4} />
          <Skeleton width="30%" height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

/**
 * Streak hero skeleton
 */
export function SkeletonStreakHero() {
  const { colors } = useTheme();

  return (
    <View style={[styles.streakHero, { backgroundColor: colors.background.tertiary }]}>
      <View style={styles.streakContent}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View>
          <Skeleton width={60} height={32} borderRadius={8} style={styles.streakNumber} />
          <Skeleton width={80} height={14} borderRadius={4} />
        </View>
      </View>
      <Skeleton width={100} height={36} borderRadius={18} />
    </View>
  );
}

/**
 * Grid of skeleton cards (2x2)
 */
export function SkeletonGrid() {
  return (
    <View style={styles.grid}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

/**
 * List of skeleton items
 */
interface SkeletonListProps {
  count?: number;
}

export function SkeletonList({ count = 5 }: SkeletonListProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    marginBottom: Layout.spacing.small,
  },
  cardValue: {
    marginBottom: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.small,
    minHeight: Layout.touchTarget.listItem,
  },
  listItemContent: {
    flex: 1,
    marginLeft: Layout.spacing.medium,
  },
  listItemTitle: {
    marginBottom: 4,
  },
  profileHeader: {
    alignItems: 'center',
    padding: Layout.spacing.large,
    borderRadius: Layout.borderRadius.large,
  },
  profileName: {
    marginTop: Layout.spacing.medium,
    marginBottom: Layout.spacing.small,
  },
  mapRoute: {
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
    marginBottom: Layout.spacing.medium,
  },
  mapRouteDetails: {
    padding: Layout.spacing.medium,
  },
  mapRouteTitle: {
    marginVertical: Layout.spacing.small,
  },
  mapRouteStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.small,
  },
  streakHero: {
    height: 88,
    borderRadius: Layout.borderRadius.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.large,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.medium,
  },
  streakNumber: {
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.medium,
  },
  list: {
    gap: Layout.spacing.small,
  },
});
