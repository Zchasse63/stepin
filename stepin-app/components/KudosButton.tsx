/**
 * Kudos Button Component
 * Phase 11: Non-Competitive Social Features
 * 
 * Heart button for giving kudos with animations
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface KudosButtonProps {
  kudosCount: number;
  userGaveKudos: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function KudosButton({
  kudosCount,
  userGaveKudos,
  onToggle,
  disabled = false,
}: KudosButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  // Animate when kudos state changes
  useEffect(() => {
    if (userGaveKudos) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [userGaveKudos]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    onToggle();
  };

  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Animated.View style={animatedStyle}>
        {userGaveKudos ? (
          <Feather name="heart" size={20} color={colors.status.error} fill={colors.status.error} />
        ) : (
          <Feather name="heart" size={20} color={colors.text.secondary} />
        )}
      </Animated.View>
      
      {kudosCount > 0 && (
        <Text style={[styles.count, userGaveKudos && styles.countActive]}>
          {kudosCount}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Layout.spacing.xs,
      paddingVertical: Layout.spacing.xs,
      paddingHorizontal: Layout.spacing.sm,
      borderRadius: Layout.borderRadius.md,
    },
    disabled: {
      opacity: 0.5,
    },
    count: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text.secondary,
    },
    countActive: {
      color: colors.status.error,
      fontWeight: Typography.fontWeight.semibold,
    },
  });

