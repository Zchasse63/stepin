/**
 * Goal Celebration Modal
 * Shows when user reaches their daily step goal
 * Includes confetti, haptic feedback, and encouraging message
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ConfettiCelebration } from './ConfettiCelebration';
import { useTheme } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';
import { hapticFeedback, goalCelebrationAnimation } from '../lib/animations/celebrationAnimations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GoalCelebrationModalProps {
  visible: boolean;
  onDismiss: () => void;
  stepCount: number;
  goalCount: number;
}

const CELEBRATION_MESSAGES = [
  "Goal Complete! 🎉",
  "You Did It! ⭐",
  "Fantastic Work! 🌟",
  "Amazing Job! 🎊",
  "You're Unstoppable! 🔥",
];

const ENCOURAGEMENT_MESSAGES = [
  "Every step counts, and you've proven it today!",
  "Your dedication is inspiring. Keep it up!",
  "You set a goal and crushed it. Well done!",
  "This is what progress looks like. Celebrate it!",
  "You're building healthy habits, one step at a time!",
];

export function GoalCelebrationModal({
  visible,
  onDismiss,
  stepCount,
  goalCount,
}: GoalCelebrationModalProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  
  // Random messages
  const [celebrationMessage] = useState(
    CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
  );
  const [encouragementMessage] = useState(
    ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)]
  );

  // Check reduced motion on mount
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled || false);
    });
  }, []);

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      hapticFeedback.success();
      
      // Show confetti
      setShowConfetti(true);
      
      // Animate modal in
      if (reduceMotion) {
        scale.value = withTiming(1, { duration: 100 });
        opacity.value = withTiming(1, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
      } else {
        scale.value = goalCelebrationAnimation(scale, undefined, false);
        opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    } else {
      // Reset animation values
      scale.value = 0;
      opacity.value = 0;
      translateY.value = SCREEN_HEIGHT;
      setShowConfetti(false);
    }
  }, [visible, reduceMotion]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.5,
  }));

  const handleDismiss = () => {
    // Animate out
    if (reduceMotion) {
      scale.value = withTiming(0, { duration: 100 });
      opacity.value = withTiming(0, { duration: 100 });
    } else {
      scale.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(0, { duration: 200 });
    }
    
    // Dismiss after animation
    setTimeout(() => {
      onDismiss();
    }, reduceMotion ? 100 : 250);
  };

  const percentageOver = Math.round(((stepCount - goalCount) / goalCount) * 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            animatedBackdropStyle,
          ]}
        />
        
        {/* Confetti */}
        {showConfetti && !reduceMotion && (
          <ConfettiCelebration trigger={showConfetti} />
        )}
        
        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.background.primary },
            animatedModalStyle,
          ]}
        >
          {/* Celebration Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎉</Text>
          </View>
          
          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: colors.text.primary },
              Typography.largeTitle,
            ]}
          >
            {celebrationMessage}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <Text
              style={[
                styles.stepCount,
                { color: colors.primary.main },
                Typography.title1,
              ]}
            >
              {stepCount.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.stepLabel,
                { color: colors.text.secondary },
                Typography.body,
              ]}
            >
              steps today
            </Text>

            {percentageOver > 0 && (
              <Text
                style={[
                  styles.overGoal,
                  { color: colors.accent.gold },
                  Typography.caption1,
                ]}
              >
                {percentageOver}% over your goal!
              </Text>
            )}
          </View>
          
          {/* Encouragement */}
          <Text
            style={[
              styles.encouragement,
              { color: colors.text.secondary },
              Typography.body,
            ]}
          >
            {encouragementMessage}
          </Text>
          
          {/* Dismiss Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary.main },
            ]}
            onPress={handleDismiss}
            activeOpacity={0.8}
            accessibilityLabel="Dismiss celebration"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.buttonText,
                { color: colors.text.inverse },
                Typography.headline,
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: Layout.spacing.md,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  stepCount: {
    marginBottom: Layout.spacing.xs,
  },
  stepLabel: {
    marginBottom: Layout.spacing.xs,
  },
  overGoal: {
    fontWeight: '600',
  },
  encouragement: {
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    height: Layout.button.height,
    borderRadius: Layout.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});

