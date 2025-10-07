/**
 * Today Screen
 * Main interface showing step count, progress, and encouraging messages
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
  AccessibilityInfo,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import { useHealthStore } from '../../lib/store/healthStore';
import { useAuthStore } from '../../lib/store/authStore';
import { useProfileStore } from '../../lib/store/profileStore';
import { useActiveWalkStore } from '../../lib/store/activeWalkStore';
import { formatDistance } from '../../lib/utils/formatDistance';
import { StepCircle } from '../../components/StepCircle';
import { StatsCard } from '../../components/StatsCard';
import { StreakDisplay } from '../../components/StreakDisplay';
import { LogWalkModal } from '../../components/LogWalkModal';
import { PermissionBanner } from '../../components/PermissionBanner';
import { ConfettiCelebration } from '../../components/ConfettiCelebration';
import { GoalCelebrationModal } from '../../components/GoalCelebrationModal';
import { StreakMilestoneModal } from '../../components/StreakMilestoneModal';
import { PostActivityModal } from '../../components/PostActivityModal';
import { HeartRateZone } from '../../components/HeartRateZone';
import { supabase } from '../../lib/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Streak, WeatherConditions } from '../../types/database';
import { logger } from '../../lib/utils/logger';
import { weatherService } from '../../lib/weather/weatherService';

const CELEBRATION_KEY = 'last_celebration_date';
const STREAK_MILESTONE_KEY = 'last_streak_milestone';
const PROMPT_SHARE_WALKS_KEY = 'prompt_share_walks';

export default function TodayScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showStreakMilestoneModal, setShowStreakMilestoneModal] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousGoalMet, setPreviousGoalMet] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Phase 10: Weather state
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Phase 11: Post activity modal state
  const [showPostActivityModal, setShowPostActivityModal] = useState(false);
  const [completedWalkData, setCompletedWalkData] = useState<{
    duration_minutes: number;
    distance_meters?: number;
    date: string;
  } | null>(null);

  // Get user profile for step goal
  const { profile, loadProfile } = useProfileStore();
  const stepGoal = profile?.daily_step_goal || 7000;

  // Animation values
  const pulseScale = useSharedValue(1);

  const user = useAuthStore((state) => state.user);
  const {
    todaySteps,
    permissionsGranted,
    permissionsChecked,
    syncing,
    loading,
    error,
    requestPermissions,
    checkPermissions,
    syncTodaySteps,
    clearError,
  } = useHealthStore();

  // Active walk state
  const {
    isWalking,
    isPaused,
    startTime,
    currentSteps: walkSteps,
    distanceMeters: walkDistance,
    currentHeartRate,
    currentZone,
    startWalk,
    pauseWalk,
    resumeWalk,
    endWalk,
  } = useActiveWalkStore();

  // Check for reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled || false);
    });
  }, []);

  // Load user profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Check permissions on mount
  useEffect(() => {
    if (!permissionsChecked) {
      checkPermissions();
    }
  }, [permissionsChecked]);

  // Pulse animation for encouraging message
  useEffect(() => {
    if (!reduceMotion) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [reduceMotion]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [permissionsGranted]);

  // Trigger celebration when goal is reached (once per day)
  useEffect(() => {
    const checkAndTriggerCelebration = async () => {
      const goalMet = todaySteps >= stepGoal;

      if (goalMet && !previousGoalMet && todaySteps > 0) {
        // Check if we've already celebrated today
        const today = new Date().toISOString().split('T')[0];
        const lastCelebration = await AsyncStorage.getItem(CELEBRATION_KEY);

        if (lastCelebration !== today) {
          // Show celebration modal
          setShowCelebrationModal(true);

          // Save today's date
          await AsyncStorage.setItem(CELEBRATION_KEY, today);
        }
      }
      setPreviousGoalMet(goalMet);
    };

    checkAndTriggerCelebration();
  }, [todaySteps, stepGoal, previousGoalMet]);



  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && permissionsGranted && user) {
      syncTodaySteps(user.id, stepGoal);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (permissionsGranted && user) {
      await syncTodaySteps(user.id, stepGoal);
    }
  }, [permissionsGranted, syncTodaySteps, user, stepGoal]);

  const handleWalkLogged = useCallback(() => {
    // Refresh data after logging a walk
    if (user) {
      syncTodaySteps(user.id, stepGoal);
    }
  }, [user, stepGoal, syncTodaySteps]);

  const handleStreakLoaded = useCallback(async (streak: Streak) => {
    setCurrentStreak(streak.current_streak);

    // Check if we've reached a milestone (every 7 days)
    if (streak.current_streak > 0 && streak.current_streak % 7 === 0) {
      const lastMilestone = await AsyncStorage.getItem(STREAK_MILESTONE_KEY);
      const lastMilestoneValue = lastMilestone ? parseInt(lastMilestone, 10) : 0;

      // Only show if this is a new milestone
      if (streak.current_streak > lastMilestoneValue) {
        setShowStreakMilestoneModal(true);
        await AsyncStorage.setItem(STREAK_MILESTONE_KEY, streak.current_streak.toString());
      }
    }
  }, []);

  const handleRequestPermissions = useCallback(async () => {
    await requestPermissions();
  }, [requestPermissions]);

  // Phase 10: Load weather data
  const loadWeather = useCallback(async () => {
    if (!profile?.location_coordinates) {
      return;
    }

    try {
      setWeatherLoading(true);
      const weatherData = await weatherService.getCurrentWeather(
        profile.location_coordinates.lat,
        profile.location_coordinates.lng
      );
      setWeather(weatherData);
    } catch (error) {
      logger.error('Failed to load weather:', error);
    } finally {
      setWeatherLoading(false);
    }
  }, [profile?.location_coordinates]);

  // Load weather on mount and set up refresh interval
  useEffect(() => {
    loadWeather();

    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(() => {
      loadWeather();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(weatherInterval);
  }, [loadWeather]);

  // Walk control handlers
  const handleStartWalk = useCallback(async () => {
    try {
      await startWalk(stepGoal);
    } catch (error) {
      logger.error('Failed to start walk:', error);
    }
  }, [startWalk, stepGoal]);

  const handlePauseWalk = useCallback(() => {
    pauseWalk();
  }, [pauseWalk]);

  const handleResumeWalk = useCallback(() => {
    resumeWalk();
  }, [resumeWalk]);

  const handleEndWalk = useCallback(async () => {
    if (!user) return;
    try {
      // Capture walk data before ending
      const walkStartTime = startTime ? startTime.valueOf() : Date.now();
      const walkDuration = Math.floor((Date.now() - walkStartTime) / 60000);
      const finalWalkDistance = walkDistance;

      await endWalk(user.id);
      // Refresh today's steps after ending walk
      await syncTodaySteps(user.id, stepGoal);

      // Check if user wants to be prompted to share walks
      const promptShareWalks = await AsyncStorage.getItem(PROMPT_SHARE_WALKS_KEY);
      const shouldPrompt = promptShareWalks !== 'false'; // Default to true

      if (shouldPrompt && walkDuration > 0) {
        // Set walk data and show post activity modal
        setCompletedWalkData({
          duration_minutes: walkDuration,
          distance_meters: walkDistance,
          date: new Date().toISOString(),
        });
        setShowPostActivityModal(true);
      }
    } catch (error) {
      logger.error('Failed to end walk:', error);
    }
  }, [endWalk, user, syncTodaySteps, stepGoal]);

  // Animated style for message card
  const animatedMessageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  // Get greeting based on time of day (memoized)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  }, []);

  // Get formatted date (memoized)
  const formattedDate = useMemo(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }, []);

  // Get encouraging message based on progress (memoized)
  const encouragingMessage = useMemo(() => {
    if (todaySteps === 0) {
      return 'Ready for a walk?';
    } else if (todaySteps < 1000) {
      return 'Every step counts! 🌱';
    } else if (todaySteps < 3000) {
      return "You're off to a great start!";
    } else if (todaySteps < 5000) {
      return 'Look at you go! 🎉';
    } else if (todaySteps < stepGoal - 500) {
      return "You're so close!";
    } else if (todaySteps >= stepGoal && todaySteps < stepGoal * 1.5) {
      return 'Goal complete! Fantastic! ⭐';
    } else {
      return "You're unstoppable today! 🔥";
    }
  }, [todaySteps, stepGoal]);

  // Calculate stats (memoized)
  const duration = useMemo(() => {
    // Rough estimate: 100 steps per minute
    const minutes = Math.round(todaySteps / 100);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }, [todaySteps]);

  const distance = useMemo(() => {
    // Rough estimate: 0.762 meters per step
    const meters = todaySteps * 0.762;
    const units = profile?.units_preference || 'miles';
    return formatDistance(meters, units);
  }, [todaySteps, profile?.units_preference]);

  // Dynamic styles based on theme
  const styles = useMemo(() => createStyles(colors), [colors]);

  const calories = useMemo(() => {
    // Rough estimate: 0.04 calories per step
    return Math.round(todaySteps * 0.04);
  }, [todaySteps]);

  // Phase 10: Get weather icon based on condition
  const getWeatherIcon = useCallback((condition: string): keyof typeof Ionicons.glyphMap => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'cloudy';
      case 'rain':
      case 'drizzle':
        return 'rainy';
      case 'snow':
        return 'snow';
      case 'thunderstorm':
        return 'thunderstorm';
      case 'mist':
      case 'fog':
        return 'cloud';
      default:
        return 'partly-sunny';
    }
  }, []);

  // Calculate elapsed walk time
  const elapsedWalkTime = useMemo(() => {
    if (!isWalking || !startTime) return '0:00';

    const now = Date.now();
    const elapsed = Math.floor((now - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [isWalking, startTime]);

  // Format walk distance
  const walkDistanceFormatted = useMemo(() => {
    const units = profile?.units_preference || 'miles';
    return formatDistance(walkDistance, units);
  }, [walkDistance, profile?.units_preference]);

  return (
    <View style={styles.container}>
      <ConfettiCelebration trigger={showConfetti} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>

        {/* Phase 10: Weather Card */}
        {weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherLeft}>
              <Ionicons
                name={getWeatherIcon(weather.condition)}
                size={40}
                color={colors.primary.main}
              />
            </View>
            <View style={styles.weatherCenter}>
              <Text style={styles.weatherTemp}>{weather.temperature}°F</Text>
              <Text style={styles.weatherDescription}>{weather.description}</Text>
            </View>
            <View style={styles.weatherRight}>
              <Text style={styles.weatherDetail}>Feels like {weather.feels_like}°</Text>
              <Text style={styles.weatherDetail}>Humidity {weather.humidity}%</Text>
            </View>
          </View>
        )}

        {weatherLoading && !weather && (
          <View style={styles.weatherCard}>
            <ActivityIndicator size="small" color={colors.primary.main} />
            <Text style={styles.weatherLoadingText}>Loading weather...</Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.status.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Permission Banner */}
        {permissionsChecked && !permissionsGranted && !error && (
          <PermissionBanner onRequestPermissions={handleRequestPermissions} loading={loading} />
        )}

        {/* Step Count Card */}
        <View
          style={styles.stepCard}
          accessible={true}
          accessibilityLabel={`You have taken ${todaySteps} steps today out of your ${stepGoal} step goal. That's ${Math.round((todaySteps / stepGoal) * 100)} percent complete.`}
          accessibilityRole="text"
        >
          <View style={styles.stepCircleContainer}>
            <StepCircle steps={todaySteps} goal={stepGoal} size={220} strokeWidth={18} />
            <View style={styles.stepCountOverlay}>
              <Text style={styles.stepCount}>{todaySteps.toLocaleString()}</Text>
              <Text style={styles.stepLabel}>steps</Text>
              <Text style={styles.stepGoal}>of {stepGoal.toLocaleString()}</Text>
            </View>
          </View>

          {/* Sync Button */}
          {permissionsGranted && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleRefresh}
              disabled={syncing}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Refresh step count"
              accessibilityHint="Double tap to sync your latest step data"
              accessibilityRole="button"
            >
              <Ionicons
                name="refresh"
                size={20}
                color={syncing ? colors.text.disabled : colors.primary.main}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Encouraging Message */}
        <Animated.View style={[styles.messageCard, animatedMessageStyle]}>
          <Text style={styles.message}>{encouragingMessage}</Text>
        </Animated.View>

        {/* Start Walk Button or Active Walk UI */}
        {!isWalking ? (
          <TouchableOpacity
            style={styles.startWalkButton}
            onPress={handleStartWalk}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Start a walk"
            accessibilityHint="Double tap to begin tracking your walk with Live Activity"
            accessibilityRole="button"
          >
            <Ionicons name="walk" size={28} color={colors.text.inverse} />
            <Text style={styles.startWalkButtonText}>Start Walk</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeWalkCard}>
            <View style={styles.activeWalkHeader}>
              <View style={styles.activeWalkIndicator}>
                <View style={styles.activeWalkPulse} />
                <Text style={styles.activeWalkLabel}>
                  {isPaused ? 'Walk Paused' : 'Walk in Progress'}
                </Text>
              </View>
            </View>

            <View style={styles.activeWalkStats}>
              <View style={styles.activeWalkStat}>
                <Ionicons name="time-outline" size={24} color={colors.primary.main} />
                <Text style={styles.activeWalkStatValue}>{elapsedWalkTime}</Text>
                <Text style={styles.activeWalkStatLabel}>Time</Text>
              </View>

              <View style={styles.activeWalkStat}>
                <Ionicons name="footsteps-outline" size={24} color={colors.primary.main} />
                <Text style={styles.activeWalkStatValue}>{walkSteps}</Text>
                <Text style={styles.activeWalkStatLabel}>Steps</Text>
              </View>

              <View style={styles.activeWalkStat}>
                <Ionicons name="navigate-outline" size={24} color={colors.primary.main} />
                <Text style={styles.activeWalkStatValue}>{walkDistanceFormatted}</Text>
                <Text style={styles.activeWalkStatLabel}>Distance</Text>
              </View>
            </View>

            {/* Phase 12: Heart Rate Zone Display */}
            <View style={styles.heartRateContainer}>
              <HeartRateZone currentHR={currentHeartRate} zone={currentZone} />
            </View>

            <View style={styles.activeWalkButtons}>
              {!isPaused ? (
                <TouchableOpacity
                  style={[styles.walkControlButton, styles.pauseButton]}
                  onPress={handlePauseWalk}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel="Pause walk"
                  accessibilityRole="button"
                >
                  <Ionicons name="pause" size={20} color={colors.text.inverse} />
                  <Text style={styles.walkControlButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.walkControlButton, styles.resumeButton]}
                  onPress={handleResumeWalk}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel="Resume walk"
                  accessibilityRole="button"
                >
                  <Ionicons name="play" size={20} color={colors.text.inverse} />
                  <Text style={styles.walkControlButtonText}>Resume</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.walkControlButton, styles.endButton]}
                onPress={handleEndWalk}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="End walk"
                accessibilityRole="button"
              >
                <Ionicons name="stop" size={20} color={colors.text.inverse} />
                <Text style={styles.walkControlButtonText}>End Walk</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <StatsCard icon="time-outline" label="Duration" value={duration} loading={syncing} />
          <View style={styles.statsGap} />
          <StatsCard
            icon="walk-outline"
            label="Distance"
            value={distance}
            loading={syncing}
          />
          <View style={styles.statsGap} />
          <StatsCard icon="flame-outline" label="Calories" value={`~${calories}`} loading={syncing} />
        </View>

        {/* Streak Card */}
        <StreakDisplay onStreakLoaded={handleStreakLoaded} />

        {/* Log Walk Button */}
        <TouchableOpacity
          style={styles.logWalkButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Log a walk manually"
          accessibilityHint="Double tap to open the manual walk entry form"
          accessibilityRole="button"
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.text.inverse} />
          <Text style={styles.logWalkButtonText}>Log a Walk</Text>
        </TouchableOpacity>

        <Text style={styles.logWalkSubtext}>Didn't wear your phone? Add it manually</Text>
      </ScrollView>

      {/* Goal Celebration Modal */}
      <GoalCelebrationModal
        visible={showCelebrationModal}
        onDismiss={() => setShowCelebrationModal(false)}
        stepCount={todaySteps}
        goalCount={stepGoal}
      />

      {/* Streak Milestone Modal */}
      <StreakMilestoneModal
        visible={showStreakMilestoneModal}
        onDismiss={() => setShowStreakMilestoneModal(false)}
        streakDays={currentStreak}
      />

      {/* Log Walk Modal */}
      <LogWalkModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onWalkLogged={handleWalkLogged}
      />

      {/* Post Activity Modal (Phase 11) */}
      {completedWalkData && user && (
        <PostActivityModal
          visible={showPostActivityModal}
          onClose={() => {
            setShowPostActivityModal(false);
            setCompletedWalkData(null);
          }}
          walkData={completedWalkData}
          userId={user.id}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.large,
    paddingBottom: Layout.spacing.xlarge,
  },
  header: {
    marginTop: Layout.spacing.large,
    marginBottom: Layout.spacing.large,
  },
  date: {
    ...Typography.title2,
    color: colors.text.primary,
    marginBottom: Layout.spacing.tiny,
  },
  greeting: {
    ...Typography.title1,
    color: colors.text.primary,
  },
  stepCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.xlarge,
    alignItems: 'center',
    marginBottom: Layout.spacing.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  stepCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCountOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: Layout.spacing.tiny,
  },
  stepLabel: {
    ...Typography.body,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.tiny,
  },
  stepGoal: {
    ...Typography.caption1,
    color: colors.text.secondary,
  },
  syncButton: {
    position: 'absolute',
    top: Layout.spacing.medium,
    right: Layout.spacing.medium,
    padding: Layout.spacing.small,
    backgroundColor: colors.background.primary,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  messageCard: {
    backgroundColor: colors.primary.light,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.large,
    marginBottom: Layout.spacing.large,
    alignItems: 'center',
  },
  message: {
    ...Typography.title3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.large,
  },
  statsGap: {
    width: Layout.spacing.small,
  },
  logWalkButton: {
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Layout.spacing.large,
    minHeight: Layout.touchTarget.minimum,
  },
  logWalkButtonText: {
    ...Typography.headline,
    color: colors.text.inverse,
    marginLeft: Layout.spacing.small,
  },
  logWalkSubtext: {
    ...Typography.caption1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: Layout.spacing.small,
    fontStyle: 'italic',
  },
  errorBanner: {
    backgroundColor: colors.status.error + '15',
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.medium,
    marginHorizontal: Layout.spacing.medium,
    marginBottom: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.status.error + '40',
  },
  errorText: {
    ...Typography.body,
    color: colors.status.error,
    flex: 1,
    marginLeft: Layout.spacing.small,
  },
  errorCloseButton: {
    padding: Layout.spacing.small,
    marginLeft: Layout.spacing.small,
  },
  startWalkButton: {
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.large,
    paddingVertical: Layout.spacing.large,
    paddingHorizontal: Layout.spacing.xlarge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.large,
    minHeight: Layout.touchTarget.minimum,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startWalkButtonText: {
    ...Typography.title3,
    color: colors.text.inverse,
    marginLeft: Layout.spacing.medium,
    fontWeight: '600',
  },
  activeWalkCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.large,
    marginBottom: Layout.spacing.large,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  activeWalkHeader: {
    marginBottom: Layout.spacing.medium,
  },
  activeWalkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeWalkPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.status.success,
    marginRight: Layout.spacing.small,
  },
  activeWalkLabel: {
    ...Typography.headline,
    color: colors.text.primary,
    fontWeight: '600',
  },
  activeWalkStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.large,
    paddingVertical: Layout.spacing.medium,
  },
  activeWalkStat: {
    alignItems: 'center',
  },
  activeWalkStatValue: {
    ...Typography.title2,
    color: colors.text.primary,
    fontWeight: '700',
    marginTop: Layout.spacing.tiny,
  },
  activeWalkStatLabel: {
    ...Typography.caption1,
    color: colors.text.secondary,
    marginTop: Layout.spacing.tiny,
  },
  heartRateContainer: {
    marginBottom: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.small,
  },
  activeWalkButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.medium,
  },
  walkControlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    minHeight: Layout.touchTarget.minimum,
  },
  pauseButton: {
    backgroundColor: colors.accent.warning,
  },
  resumeButton: {
    backgroundColor: colors.status.success,
  },
  endButton: {
    backgroundColor: colors.status.error,
  },
  walkControlButtonText: {
    ...Typography.headline,
    color: colors.text.inverse,
    marginLeft: Layout.spacing.small,
    fontWeight: '600',
  },
  // Phase 10: Weather card styles
  weatherCard: {
    backgroundColor: colors.surface.card,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
    marginHorizontal: Layout.spacing.medium,
    marginBottom: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    ...Layout.shadows.small,
    minHeight: 80,
  },
  weatherLeft: {
    marginRight: Layout.spacing.medium,
  },
  weatherCenter: {
    flex: 1,
  },
  weatherTemp: {
    ...Typography.title1,
    color: colors.text.primary,
    fontWeight: '700',
  },
  weatherDescription: {
    ...Typography.body,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  weatherDetail: {
    ...Typography.caption1,
    color: colors.text.secondary,
    marginTop: 2,
  },
  weatherLoadingText: {
    ...Typography.body,
    color: colors.text.secondary,
    marginLeft: Layout.spacing.small,
  },
});

