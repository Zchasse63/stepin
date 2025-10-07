/**
 * Confetti Celebration Component
 * Triggers confetti animation when step goal is reached
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../lib/theme/themeManager';

interface ConfettiCelebrationProps {
  trigger: boolean;
  onAnimationEnd?: () => void;
}

export function ConfettiCelebration({ trigger, onAnimationEnd }: ConfettiCelebrationProps) {
  const { colors } = useTheme();
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (trigger && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [trigger]);

  if (!trigger) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: 0, y: 0 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={2500}
        explosionSpeed={350}
        colors={[
          colors.accent.gold,
          colors.primary.main,
          colors.primary.light,
          colors.secondary.main,
          colors.system.orange,
          colors.system.pink,
        ]}
        onAnimationEnd={onAnimationEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});

