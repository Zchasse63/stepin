import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useHistoryStore } from '../../lib/store/historyStore';
import { useAuthStore } from '../../lib/store/authStore';
import { useProfileStore } from '../../lib/store/profileStore';
import { fetchHistoryData } from '../../lib/utils/fetchHistoryData';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import TimePeriodSelector from '../../components/TimePeriodSelector';
import SummaryStatsGrid from '../../components/SummaryStatsGrid';
import CalendarHeatMap from '../../components/CalendarHeatMap';
import DayDetailsCard from '../../components/DayDetailsCard';
import StepsBarChart from '../../components/StepsBarChart';
import WalksList from '../../components/WalksList';
import WalkDetailsSheet from '../../components/WalkDetailsSheet';
import InsightsSection from '../../components/InsightsSection';
import EmptyHistoryState from '../../components/EmptyHistoryState';
import EmptyPeriodState from '../../components/EmptyPeriodState';
import { TimePeriod, Insight } from '../../types/history';
import { Walk } from '../../types/database';
import { logger } from '../../lib/utils/logger';
import { fetchWalksForDate, fetchDailyStatsForDate, fetchStreak } from '../../lib/utils/fetchHistoryData';
import { deleteWalk } from '../../lib/utils/deleteWalk';
import { generateInsights } from '../../lib/utils/generateInsights';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { profile, loadProfile } = useProfileStore();
  const {
    selectedPeriod,
    dateRange,
    historyData,
    isLoading,
    error,
    selectedDate,
    setSelectedPeriod,
    setHistoryData,
    setLoading,
    setError,
    setSelectedDate,
  } = useHistoryStore();

  // State for selected day details
  const [selectedDayStats, setSelectedDayStats] = React.useState<any>(null);
  const [selectedDayWalks, setSelectedDayWalks] = React.useState<any[]>([]);

  // State for walk details sheet
  const [selectedWalk, setSelectedWalk] = React.useState<Walk | null>(null);
  const [isWalkDetailsVisible, setIsWalkDetailsVisible] = React.useState(false);

  // State for insights
  const [insights, setInsights] = React.useState<Insight[]>([]);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Handle period change
  const handlePeriodChange = useCallback((period: TimePeriod) => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setSelectedPeriod(period);
    });
  }, [setSelectedPeriod, fadeAnim]);

  // Handle day selection
  const handleDayPress = useCallback(async (date: string) => {
    if (!user?.id) return;

    setSelectedDate(date);

    // Fetch details for selected day
    try {
      const [stats, walks] = await Promise.all([
        fetchDailyStatsForDate(user.id, date),
        fetchWalksForDate(user.id, date),
      ]);
      setSelectedDayStats(stats);
      setSelectedDayWalks(walks);
    } catch (err) {
      logger.error('Error fetching day details:', err);
    }
  }, [user?.id, setSelectedDate]);

  // Handle closing day details
  const handleCloseDayDetails = useCallback(() => {
    setSelectedDate(null);
    setSelectedDayStats(null);
    setSelectedDayWalks([]);
  }, [setSelectedDate]);

  // Handle walk press
  const handleWalkPress = useCallback((walk: Walk) => {
    setSelectedWalk(walk);
    setIsWalkDetailsVisible(true);
  }, []);

  // Fetch history data
  const loadHistoryData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Get user's step goal from profile (default to 7000)
      const stepGoal = profile?.daily_step_goal || 7000;

      const [data, streak] = await Promise.all([
        fetchHistoryData(user.id, dateRange, stepGoal),
        fetchStreak(user.id),
      ]);

      setHistoryData(data);

      // Generate insights
      const generatedInsights = generateInsights(
        data.walks,
        data.dailyStats,
        streak,
        selectedPeriod
      );
      setInsights(generatedInsights);

      // Animate content in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      setError(err.message || 'Failed to load history data');
      logger.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, dateRange, selectedPeriod, fadeAnim, profile?.daily_step_goal]);

  // Handle walk delete
  const handleWalkDelete = useCallback(async (walk: Walk) => {
    if (!user?.id) return;

    try {
      await deleteWalk(walk.id, user.id);
      // Reload history data
      await loadHistoryData();
      // Close details sheet if open
      setIsWalkDetailsVisible(false);
      setSelectedWalk(null);
    } catch (error) {
      logger.error('Error deleting walk:', error);
      Alert.alert('Error', 'Failed to delete walk. Please try again.');
    }
  }, [user?.id, loadHistoryData]);

  // Handle closing walk details sheet
  const handleCloseWalkDetails = useCallback(() => {
    setIsWalkDetailsVisible(false);
    setSelectedWalk(null);
  }, []);

  // Load profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Load data on mount and when period changes
  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  // Dynamic styles based on theme
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Walking Journey</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Time Period Selector */}
        <TimePeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && !historyData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Loading your history...</Text>
          </View>
        )}

        {/* Empty State - No walks at all */}
        {!isLoading && !error && historyData && historyData.walks.length === 0 && (
          <EmptyHistoryState />
        )}

        {/* Empty State - No walks in period */}
        {!isLoading && !error && historyData && historyData.walks.length > 0 && historyData.dailyStats.length === 0 && (
          <EmptyPeriodState period={selectedPeriod} />
        )}

        {/* Summary Statistics */}
        {historyData && !isLoading && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <SummaryStatsGrid
              stats={{
                totalSteps: historyData.totalSteps,
                totalWalks: historyData.totalWalks,
                averageSteps: historyData.averageSteps,
                daysGoalMet: historyData.daysGoalMet,
                goalMetPercentage: historyData.goalMetPercentage,
              }}
            />
          </Animated.View>
        )}

        {/* Calendar Heat Map (Week view only) */}
        {historyData && !isLoading && selectedPeriod === 'week' && (
          <CalendarHeatMap
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            dailyStats={historyData.dailyStats}
            stepGoal={profile?.daily_step_goal || 7000}
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
          />
        )}

        {/* Selected Day Details */}
        {selectedDate && selectedDayStats && (
          <DayDetailsCard
            date={selectedDate}
            dailyStats={selectedDayStats}
            walks={selectedDayWalks}
            stepGoal={profile?.daily_step_goal || 7000}
            onClose={handleCloseDayDetails}
          />
        )}

        {/* Bar Chart (Month/Year views) */}
        {historyData && !isLoading && (selectedPeriod === 'month' || selectedPeriod === 'year') && (
          <StepsBarChart
            dailyStats={historyData.dailyStats}
            stepGoal={profile?.daily_step_goal || 7000}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        )}

        {/* Insights */}
        {historyData && !isLoading && insights.length > 0 && (
          <InsightsSection insights={insights} />
        )}

        {/* Walks List */}
        {historyData && !isLoading && historyData.walks.length > 0 && (
          <WalksList
            walks={historyData.walks}
            dailyStats={historyData.dailyStats}
            stepGoal={profile?.daily_step_goal || 7000}
            units={profile?.units_preference || 'miles'}
            onWalkPress={handleWalkPress}
            onWalkDelete={handleWalkDelete}
          />
        )}

        {/* Walk Details Sheet */}
        <WalkDetailsSheet
          walk={selectedWalk}
          visible={isWalkDetailsVisible}
          units={profile?.units_preference || 'miles'}
          onClose={handleCloseWalkDetails}
          onDelete={handleWalkDelete}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingTop: Layout.safeArea.top + Layout.spacing.medium,
    paddingBottom: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...Typography.title1,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Layout.spacing.xxlarge,
  },
  placeholderText: {
    ...Typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: colors.status.error + '20',
    padding: Layout.spacing.medium,
    margin: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  errorText: {
    ...Typography.body,
    color: colors.status.error,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: Layout.spacing.xxlarge,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: colors.text.secondary,
    marginTop: Layout.spacing.medium,
  },
  content: {
    padding: Layout.spacing.medium,
  },
});

