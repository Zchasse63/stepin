/**
 * Celebration Animations Utility
 * Reusable animation functions for goal celebrations, streak milestones, and micro-interactions
 * Respects reduced motion accessibility settings
 */

import { withSpring, withTiming, withSequence, withRepeat, Easing, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AccessibilityInfo } from 'react-native';
import { logger } from '../utils/logger';

// Animation configuration constants
export const ANIMATION_CONFIG = {
  // Spring animations
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 10,
    stiffness: 100,
    mass: 0.8,
  },
  springGentle: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  },
  
  // Timing animations
  timing: {
    fast: { duration: 200, easing: Easing.out(Easing.ease) },
    medium: { duration: 300, easing: Easing.inOut(Easing.ease) },
    slow: { duration: 500, easing: Easing.inOut(Easing.ease) },
  },
  
  // Scale values
  scale: {
    press: 0.95,
    hover: 1.05,
    celebration: 1.2,
  },
};

/**
 * Check if reduced motion is enabled
 */
export async function isReducedMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    logger.error('Error checking reduced motion:', error);
    return false;
  }
}

/**
 * Button press animation
 * Scales down slightly when pressed
 */
export function buttonPressAnimation(scale: any, reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(ANIMATION_CONFIG.scale.press, { duration: 50 });
  }
  return withSpring(ANIMATION_CONFIG.scale.press, ANIMATION_CONFIG.springGentle);
}

/**
 * Button release animation
 * Returns to normal scale
 */
export function buttonReleaseAnimation(scale: any, reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(1, { duration: 50 });
  }
  return withSpring(1, ANIMATION_CONFIG.spring);
}

/**
 * Celebration scale animation
 * Bounces up and down for celebration effect
 */
export function celebrationScaleAnimation(reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(1, { duration: 100 });
  }
  
  return withSequence(
    withSpring(ANIMATION_CONFIG.scale.celebration, ANIMATION_CONFIG.springBouncy),
    withSpring(1, ANIMATION_CONFIG.spring)
  );
}

/**
 * Pulse animation
 * Gentle pulse effect for emphasis
 */
export function pulseAnimation(reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(1, { duration: 100 });
  }
  
  return withRepeat(
    withSequence(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    false
  );
}

/**
 * Fade in animation
 */
export function fadeInAnimation(reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(1, { duration: 100 });
  }
  
  return withTiming(1, ANIMATION_CONFIG.timing.medium);
}

/**
 * Fade out animation
 */
export function fadeOutAnimation(reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(0, { duration: 100 });
  }
  
  return withTiming(0, ANIMATION_CONFIG.timing.medium);
}

/**
 * Slide in from bottom animation
 */
export function slideInFromBottomAnimation(reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(0, { duration: 100 });
  }
  
  return withSpring(0, ANIMATION_CONFIG.spring);
}

/**
 * Slide out to bottom animation
 */
export function slideOutToBottomAnimation(height: number, reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(height, { duration: 100 });
  }
  
  return withTiming(height, ANIMATION_CONFIG.timing.medium);
}

/**
 * Stagger animation for list items
 * Returns delay for each item based on index
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * List item entrance animation
 */
export function listItemEntranceAnimation(index: number, reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(0, { duration: 100 });
  }
  
  const delay = getStaggerDelay(index);
  return withTiming(0, {
    duration: 300,
    easing: Easing.out(Easing.ease),
  });
}

/**
 * Shake animation for errors
 */
export function shakeAnimation(reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(0, { duration: 50 });
  }
  
  return withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
}

/**
 * Haptic feedback helpers
 */
export const hapticFeedback = {
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      logger.error('Haptic feedback error:', error);
    }
  },

  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      logger.error('Haptic feedback error:', error);
    }
  },

  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      logger.error('Haptic feedback error:', error);
    }
  },

  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Haptic feedback error:', error);
    }
  },

  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      logger.error('Haptic feedback error:', error);
    }
  },

  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      logger.error('Haptic feedback error:', error);
    }
  },
};

/**
 * Goal celebration animation sequence
 */
export function goalCelebrationAnimation(
  scale: any,
  onComplete?: () => void,
  reduceMotion: boolean = false
) {
  'worklet';
  if (reduceMotion) {
    if (onComplete) {
      runOnJS(onComplete)();
    }
    return withTiming(1, { duration: 100 });
  }
  
  return withSequence(
    withSpring(1.3, { damping: 8, stiffness: 100 }),
    withSpring(0.95, { damping: 10, stiffness: 150 }),
    withSpring(1, { damping: 12, stiffness: 180 }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    })
  );
}

/**
 * Streak milestone animation sequence
 */
export function streakMilestoneAnimation(
  scale: any,
  reduceMotion: boolean = false
) {
  'worklet';
  if (reduceMotion) {
    return withTiming(1, { duration: 100 });
  }
  
  return withRepeat(
    withSequence(
      withSpring(1.2, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    ),
    3,
    false
  );
}

/**
 * Tab bar icon animation
 */
export function tabBarIconAnimation(isActive: boolean, reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return withTiming(isActive ? 1 : 1, { duration: 50 });
  }
  
  return withSpring(isActive ? 1.1 : 1, ANIMATION_CONFIG.spring);
}

/**
 * Modal entrance animation
 */
export function modalEntranceAnimation(reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return {
      opacity: withTiming(1, { duration: 100 }),
      translateY: withTiming(0, { duration: 100 }),
    };
  }
  
  return {
    opacity: withTiming(1, ANIMATION_CONFIG.timing.medium),
    translateY: withSpring(0, ANIMATION_CONFIG.spring),
  };
}

/**
 * Modal exit animation
 */
export function modalExitAnimation(height: number, reduceMotion: boolean = false) {
  'worklet';
  if (reduceMotion) {
    return {
      opacity: withTiming(0, { duration: 100 }),
      translateY: withTiming(height, { duration: 100 }),
    };
  }
  
  return {
    opacity: withTiming(0, ANIMATION_CONFIG.timing.fast),
    translateY: withTiming(height, ANIMATION_CONFIG.timing.medium),
  };
}

