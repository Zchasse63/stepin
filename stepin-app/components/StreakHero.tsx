/**
 * Streak Hero Component
 * Prominent streak display with gradient background, flame animation, and freeze day feature
 * Designed to increase retention by making streaks highly visible
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { useAuthStore } from '../lib/store/authStore';
import { supabase } from '../lib/supabase/client';
import { Streak } from '../types/database';
import { logger } from '../lib/utils/logger';

interface StreakHeroProps {
  hasStreakFreeze?: boolean;
  onFreezePress?: () => void;
  onStreakLoaded?: (streak: Streak) => void;
}

export default function StreakHero({
  hasStreakFreeze = false,
  onFreezePress,
  onStreakLoaded,
}: StreakHeroProps) {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const flameScale = useSharedValue(1);
  const flameRotate = useSharedValue(0);

  // Fetch streak data
  useEffect(() => {
    fetchStreak();
  }, [user]);

  const fetchStreak = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        logger.error('Error fetching streak:', error);
      } else if (data) {
        setCurrentStreak(data.current_streak);
        onStreakLoaded?.(data);
      }
    } catch (error) {
      logger.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animate flame with gentle pulsing and rotation
  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    flameRotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotate.value}deg` },
    ],
  }));

  // Calculate progress toward 10-day milestone
  const progressDots = Math.min(currentStreak, 10);
  const showFreezeButton = currentStreak >= 3 && !hasStreakFreeze;

  // Don't render if loading or no streak
  if (loading || currentStreak === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.streak.gradientStart, colors.streak.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Left side: Flame and streak count */}
          <View style={styles.leftSection}>
            <Animated.Text style={[styles.flame, animatedFlameStyle]}>
              🔥
            </Animated.Text>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakNumber, { color: colors.text.primary }]}>
                {currentStreak}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>
                day streak
              </Text>
            </View>
          </View>

          {/* Right side: Progress dots or freeze button */}
          <View style={styles.rightSection}>
            {showFreezeButton ? (
              <Pressable
                onPress={onFreezePress}
                style={({ pressed }) => [
                  styles.freezeButton,
                  {
                    backgroundColor: colors.primary.main,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text style={styles.freezeIcon}>❄️</Text>
                <Text style={styles.freezeText}>Freeze Day</Text>
              </Pressable>
            ) : (
              <View style={styles.progressContainer}>
                <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>
                  Progress to 10 days
                </Text>
                <View style={styles.dotsContainer}>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index < progressDots
                              ? colors.streak.flame
                              : colors.border.light,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 88,
    marginHorizontal: Layout.spacing.large,
    marginTop: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.large,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.medium,
  },
  flame: {
    fontSize: 48,
    lineHeight: 48,
  },
  streakInfo: {
    gap: 2,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  freezeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.small,
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
    borderRadius: Layout.borderRadius.medium,
  },
  freezeIcon: {
    fontSize: 20,
    lineHeight: 20,
  },
  freezeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  progressContainer: {
    gap: Layout.spacing.small,
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
