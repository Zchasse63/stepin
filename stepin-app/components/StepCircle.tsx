/**
 * Step Circle Component
 * Animated circular progress indicator for step count
 * Uses react-native-circular-progress for smooth SVG animations
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface StepCircleProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function StepCircle({
  steps,
  goal,
  size = 200,
  strokeWidth = 16
}: StepCircleProps) {
  const { colors } = useTheme();
  const progressRatio = steps / goal;

  // Cap visual progress at 100%, but use ratio for color
  const fill = Math.min(progressRatio * 100, 100);

  // Dynamic color based on progress
  const getProgressColor = () => {
    if (progressRatio >= 1) return colors.accent.gold;      // 100%+ Gold
    if (progressRatio >= 0.75) return colors.primary.dark;  // 75-100% Vibrant green
    if (progressRatio >= 0.5) return colors.primary.main;   // 50-75% Medium green
    if (progressRatio >= 0.25) return colors.primary.light; // 25-50% Light green
    return colors.accent.gray;                              // 0-25% Gray
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <AnimatedCircularProgress
        size={size}
        width={strokeWidth}
        fill={fill}
        tintColor={getProgressColor()}
        backgroundColor={colors.border.light}
        rotation={270}
        lineCap="round"
        duration={1000}
        arcSweepAngle={360}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
