/**
 * Insights Tab Screen
 * Displays walking insights, analytics, and trends
 */

import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import { useProfileStore } from '../../lib/store/profileStore';
import { useHistoryStore } from '../../lib/store/historyStore';
import { useAuthStore } from '../../lib/store/authStore';
import { fetchHistoryData } from '../../lib/utils/fetchHistoryData';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

export default function InsightsScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { profile, stats } = useProfileStore();
  const { historyData, setHistoryData, isLoading, setLoading, dateRange } = useHistoryStore();

  // Get daily stats from history data
  const dailyStats = historyData?.dailyStats || [];

  // Load history data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const stepGoal = profile?.daily_step_goal || 7000;
        const data = await fetchHistoryData(user.id, dateRange, stepGoal);
        setHistoryData(data);
      } catch (error) {
        console.error('[Insights] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, dateRange, profile?.daily_step_goal]);

  // Calculate weekly average
  const weeklyAverage = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) return 0;
    const last7Days = dailyStats.slice(-7);
    const total = last7Days.reduce((sum, day) => sum + day.total_steps, 0);
    return Math.round(total / last7Days.length);
  }, [dailyStats]);

  // Calculate previous week average for comparison
  const previousWeekAverage = useMemo(() => {
    if (!dailyStats || dailyStats.length < 14) return 0;
    const previousWeek = dailyStats.slice(-14, -7);
    const total = previousWeek.reduce((sum, day) => sum + day.total_steps, 0);
    return Math.round(total / previousWeek.length);
  }, [dailyStats]);

  // Find best day of week
  const bestDay = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) {
      return { dayName: 'N/A', averageSteps: 0 };
    }

    const dayTotals: { [key: string]: { total: number; count: number } } = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    dailyStats.forEach((stat) => {
      const date = new Date(stat.date);
      const dayIndex = date.getDay();
      const dayName = dayNames[dayIndex];

      if (!dayTotals[dayName]) {
        dayTotals[dayName] = { total: 0, count: 0 };
      }
      dayTotals[dayName].total += stat.total_steps;
      dayTotals[dayName].count += 1;
    });

    let bestDayName = 'N/A';
    let highestAverage = 0;

    Object.entries(dayTotals).forEach(([dayName, data]) => {
      const average = data.total / data.count;
      if (average > highestAverage) {
        highestAverage = average;
        bestDayName = dayName;
      }
    });

    return { dayName: bestDayName, averageSteps: Math.round(highestAverage) };
  }, [dailyStats]);

  // Calculate consistency (days walked in last 30 days)
  const consistency = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) return 0;
    const last30Days = dailyStats.slice(-30);
    const daysWalked = last30Days.filter((day) => day.total_steps > 0).length;
    return Math.round((daysWalked / last30Days.length) * 100);
  }, [dailyStats]);

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Walking Insights</Text>

      {/* Weekly Average Card */}
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Feather name="trending-up" size={24} color={colors.primary.main} />
        </View>
        <Text style={styles.cardTitle}>Weekly Average</Text>
        <Text style={styles.cardValue}>{weeklyAverage.toLocaleString()} steps</Text>
        {previousWeekAverage > 0 && (
          <Text style={styles.cardSubtitle}>
            {weeklyAverage > previousWeekAverage
              ? `↑ ${Math.abs(weeklyAverage - previousWeekAverage).toLocaleString()} more than last week!`
              : weeklyAverage < previousWeekAverage
              ? `↓ ${Math.abs(weeklyAverage - previousWeekAverage).toLocaleString()} less than last week`
              : 'Same as last week'}
          </Text>
        )}
        {previousWeekAverage === 0 && (
          <Text style={styles.cardSubtitle}>Keep going! Every step counts.</Text>
        )}
      </View>

      {/* Best Day Card */}
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Feather name="star" size={24} color={colors.accent.gold} />
        </View>
        <Text style={styles.cardTitle}>Your Best Day</Text>
        <Text style={styles.cardValue}>{bestDay.dayName}</Text>
        {bestDay.averageSteps > 0 && (
          <Text style={styles.cardSubtitle}>
            You average {bestDay.averageSteps.toLocaleString()} steps on {bestDay.dayName}s
          </Text>
        )}
      </View>

      {/* Consistency Card */}
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Feather name="check-circle" size={24} color={colors.status.success} />
        </View>
        <Text style={styles.cardTitle}>Walking Consistency</Text>
        <Text style={styles.cardValue}>{consistency}%</Text>
        {dailyStats && dailyStats.length > 0 && (
          <Text style={styles.cardSubtitle}>
            You walked {Math.round((consistency / 100) * Math.min(dailyStats.slice(-30).length, 30))} out of{' '}
            {Math.min(dailyStats.slice(-30).length, 30)} days
          </Text>
        )}
      </View>

      {/* Total Stats Card */}
      {stats && (
        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <Feather name="activity" size={24} color={colors.secondary.main} />
          </View>
          <Text style={styles.cardTitle}>All-Time Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalSteps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Steps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalWalks.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Walks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      )}

      {/* Coming Soon */}
      <View style={styles.comingSoon}>
        <Feather name="zap" size={32} color={colors.text.disabled} />
        <Text style={styles.comingSoonText}>More insights coming soon!</Text>
        <Text style={styles.comingSoonSubtext}>
          We're working on personalized recommendations and trends
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    content: {
      padding: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xxl,
    },
    title: {
      fontSize: Typography.fontSize['3xl'],
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xl,
      fontFamily: Typography.fontFamily.bold,
    },
    card: {
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.lg,
      padding: Layout.spacing.xl,
      marginBottom: Layout.spacing.lg,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Layout.spacing.md,
    },
    cardTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.secondary,
      marginBottom: Layout.spacing.sm,
      fontFamily: Typography.fontFamily.semibold,
    },
    cardValue: {
      fontSize: Typography.fontSize['3xl'],
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs,
      fontFamily: Typography.fontFamily.bold,
    },
    cardSubtitle: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Layout.spacing.md,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs,
      fontFamily: Typography.fontFamily.bold,
    },
    statLabel: {
      fontSize: Typography.fontSize.xs,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    comingSoon: {
      alignItems: 'center',
      paddingVertical: Layout.spacing.xxl,
      paddingHorizontal: Layout.spacing.xl,
    },
    comingSoonText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.secondary,
      marginTop: Layout.spacing.md,
      marginBottom: Layout.spacing.xs,
      fontFamily: Typography.fontFamily.semibold,
    },
    comingSoonSubtext: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.tertiary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
    },
    loadingText: {
      marginTop: Layout.spacing.md,
      fontSize: Typography.fontSize.md,
      color: colors.text.secondary,
    },
  });

