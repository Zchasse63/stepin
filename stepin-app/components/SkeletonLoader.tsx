/**
 * Skeleton Loader Component
 * Provides shimmer loading effect for various content types
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = Layout.borderRadius.small,
  style,
}: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const shimmerTranslate = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border.light,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colors.background.primary,
          },
          animatedShimmerStyle,
        ]}
      />
    </View>
  );
}

// Skeleton for step circle
export function SkeletonStepCircle() {
  const { colors } = useTheme();
  
  return (
    <View style={styles.stepCircleContainer}>
      <SkeletonLoader width={220} height={220} borderRadius={110} />
    </View>
  );
}

// Skeleton for stats card
export function SkeletonStatsCard() {
  return (
    <View style={styles.statsCard}>
      <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
      <SkeletonLoader width={60} height={16} style={{ marginBottom: 4 }} />
      <SkeletonLoader width={80} height={14} />
    </View>
  );
}

// Skeleton for walk list item
export function SkeletonWalkItem() {
  const { colors } = useTheme();
  
  return (
    <View
      style={[
        styles.walkItem,
        {
          backgroundColor: colors.background.tertiary,
          borderColor: colors.border.light,
        },
      ]}
    >
      <View style={styles.walkItemLeft}>
        <SkeletonLoader width={50} height={50} borderRadius={25} />
      </View>
      <View style={styles.walkItemContent}>
        <SkeletonLoader width="60%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={14} style={{ marginBottom: 4 }} />
        <SkeletonLoader width="80%" height={14} />
      </View>
    </View>
  );
}

// Skeleton for profile header
export function SkeletonProfileHeader() {
  const { colors } = useTheme();
  
  return (
    <View style={styles.profileHeader}>
      <SkeletonLoader width={80} height={80} borderRadius={40} style={{ marginBottom: 12 }} />
      <SkeletonLoader width={150} height={20} style={{ marginBottom: 8 }} />
      <SkeletonLoader width={200} height={16} />
    </View>
  );
}

// Skeleton for chart
export function SkeletonChart() {
  const { colors } = useTheme();
  
  return (
    <View
      style={[
        styles.chart,
        {
          backgroundColor: colors.background.tertiary,
          borderColor: colors.border.light,
        },
      ]}
    >
      <SkeletonLoader width="100%" height={200} borderRadius={Layout.borderRadius.medium} />
    </View>
  );
}

// Skeleton for Today screen
export function SkeletonTodayScreen() {
  return (
    <View style={styles.todayScreen}>
      <SkeletonLoader width="60%" height={24} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="40%" height={20} style={{ marginBottom: 32 }} />
      
      <SkeletonStepCircle />
      
      <View style={styles.statsRow}>
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </View>
    </View>
  );
}

// Skeleton for History screen
export function SkeletonHistoryScreen() {
  return (
    <View style={styles.historyScreen}>
      <SkeletonLoader width="50%" height={24} style={{ marginBottom: 16 }} />
      <SkeletonChart />
      <View style={{ marginTop: 16 }}>
        <SkeletonWalkItem />
        <SkeletonWalkItem />
        <SkeletonWalkItem />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '30%',
    height: '100%',
    opacity: 0.3,
  },
  stepCircleContainer: {
    alignItems: 'center',
    marginVertical: Layout.spacing.xl,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    padding: Layout.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.lg,
  },
  walkItem: {
    flexDirection: 'row',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    marginBottom: Layout.spacing.sm,
  },
  walkItemLeft: {
    marginRight: Layout.spacing.md,
  },
  walkItemContent: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  chart: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.large,
    borderWidth: 1,
  },
  todayScreen: {
    padding: Layout.spacing.md,
  },
  historyScreen: {
    padding: Layout.spacing.md,
  },
});

