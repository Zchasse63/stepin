/**
 * Progress Dots Component
 * Shows progress through onboarding steps
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme/themeManager';
import { Layout } from '../../constants/Layout';

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

export function ProgressDots({ totalSteps, currentStep }: ProgressDotsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;

        return (
          <Dot
            key={index}
            isActive={isActive}
            isPast={isPast}
            color={colors.primary.main}
            inactiveColor={colors.border.light}
          />
        );
      })}
    </View>
  );
}

interface DotProps {
  isActive: boolean;
  isPast: boolean;
  color: string;
  inactiveColor: string;
}

function Dot({ isActive, isPast, color, inactiveColor }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isActive ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ scale }],
      backgroundColor: isActive || isPast ? color : inactiveColor,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

