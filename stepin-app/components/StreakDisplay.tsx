/**
 * Streak Display Component
 * Shows current and longest streaks with emojis
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { supabase } from '../lib/supabase/client';
import { useAuthStore } from '../lib/store/authStore';
import { Streak } from '../types/database';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { logger } from '../lib/utils/logger';

interface StreakDisplayProps {
  onStreakLoaded?: (streak: Streak) => void;
}

export function StreakDisplay({ onStreakLoaded }: StreakDisplayProps) {
  const { colors } = useTheme();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

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
        setStreak(data);
        onStreakLoaded?.(data);
      }
    } catch (error) {
      logger.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary.main} />
      </View>
    );
  }

  if (!streak) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.streakItem}>
        <Text style={styles.emoji}>🔥</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakValue}>
            {streak.current_streak} {streak.current_streak === 1 ? 'day' : 'days'}
          </Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.streakItem}>
        <Text style={styles.emoji}>🏆</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakValue}>
            {streak.longest_streak} {streak.longest_streak === 1 ? 'day' : 'days'}
          </Text>
          <Text style={styles.streakLabel}>Best Streak</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 80,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: Layout.spacing.medium,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    ...Typography.title3,
    color: colors.text.primary,
    marginBottom: Layout.spacing.tiny,
  },
  streakLabel: {
    ...Typography.caption1,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
    marginHorizontal: Layout.spacing.medium,
  },
});

