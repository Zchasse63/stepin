/**
 * Streak Milestone Modal
 * Shows when user reaches a streak milestone (every 7 days)
 * Includes flame icon pulse animation and encouraging message
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
import { useTheme } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';
import { hapticFeedback, streakMilestoneAnimation } from '../lib/animations/celebrationAnimations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StreakMilestoneModalProps {
  visible: boolean;
  onDismiss: () => void;
  streakDays: number;
  totalSteps?: number;
  totalDistance?: number; // in meters
}

const MILESTONE_MESSAGES: { [key: number]: string } = {
  7: "7 Day Streak! 🔥",
  14: "2 Week Streak! 🔥🔥",
  21: "3 Week Streak! 🔥🔥🔥",
  30: "30 Day Streak! 🌟",
  60: "60 Day Streak! ⭐",
  90: "90 Day Streak! 🏆",
  100: "100 Day Streak! 👑",
};

const ENCOURAGEMENT_MESSAGES: { [key: number]: string } = {
  7: "One week of consistency! You're building a powerful habit.",
  14: "Two weeks strong! Your dedication is truly inspiring.",
  21: "Three weeks! You're proving that consistency creates results.",
  30: "A full month! This is what commitment looks like.",
  60: "Two months of dedication! You're unstoppable.",
  90: "Three months! You've built a lifestyle, not just a habit.",
  100: "100 days! You're a walking inspiration to everyone around you.",
};

export function StreakMilestoneModal({
  visible,
  onDismiss,
  streakDays,
  totalSteps,
  totalDistance,
}: StreakMilestoneModalProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check for total steps milestones (100k, 250k, 500k, 1M, etc.)
  const getStepsMilestone = () => {
    if (!totalSteps) return null;
    const milestones = [100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000];
    return milestones.find(m => totalSteps >= m && totalSteps < m + 10000); // Within 10k of milestone
  };

  // Check for distance milestones (100km, 250km, 500km, 1000km, etc.)
  const getDistanceMilestone = () => {
    if (!totalDistance) return null;
    const distanceKm = totalDistance / 1000;
    const milestones = [100, 250, 500, 1000, 2500, 5000];
    return milestones.find(m => distanceKm >= m && distanceKm < m + 5); // Within 5km of milestone
  };

  const stepsMilestone = getStepsMilestone();
  const distanceMilestone = getDistanceMilestone();
  const hasExtraMilestone = stepsMilestone || distanceMilestone;
  
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const flameScale = useSharedValue(1);
  
  // Get milestone message
  const getMilestoneMessage = () => {
    // Find the closest milestone
    const milestones = Object.keys(MILESTONE_MESSAGES).map(Number).sort((a, b) => b - a);
    const milestone = milestones.find(m => streakDays >= m) || 7;
    return MILESTONE_MESSAGES[milestone] || `${streakDays} Day Streak! 🔥`;
  };
  
  const getEncouragementMessage = () => {
    const milestones = Object.keys(ENCOURAGEMENT_MESSAGES).map(Number).sort((a, b) => b - a);
    const milestone = milestones.find(m => streakDays >= m) || 7;
    return ENCOURAGEMENT_MESSAGES[milestone] || "Keep up the amazing work!";
  };

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
      
      // Animate modal in
      if (reduceMotion) {
        scale.value = withTiming(1, { duration: 100 });
        opacity.value = withTiming(1, { duration: 100 });
        translateY.value = withTiming(0, { duration: 100 });
        flameScale.value = withTiming(1, { duration: 100 });
      } else {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        flameScale.value = streakMilestoneAnimation(flameScale, false);
      }
    } else {
      // Reset animation values
      scale.value = 0;
      opacity.value = 0;
      translateY.value = SCREEN_HEIGHT;
      flameScale.value = 1;
    }
  }, [visible, reduceMotion]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.5,
  }));
  
  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
      testID="streak-milestone-modal"
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

        {/* Modal Content */}
        <Animated.View
          testID="modal-content"
          style={[
            styles.modal,
            { backgroundColor: colors.background.primary },
            animatedModalStyle,
          ]}
        >
          {/* Flame Icon */}
          <Animated.View style={[styles.iconContainer, animatedFlameStyle]}>
            <Text style={styles.icon}>🔥</Text>
          </Animated.View>
          
          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: colors.text.primary },
              Typography.largeTitle,
            ]}
          >
            {getMilestoneMessage()}
          </Text>
          
          {/* Streak Count */}
          <View style={styles.statsContainer}>
            <Text
              style={[
                styles.streakCount,
                { color: colors.system.orange },
                Typography.title1,
              ]}
            >
              {streakDays}
            </Text>
            <Text
              style={[
                styles.streakLabel,
                { color: colors.text.secondary },
                Typography.body,
              ]}
            >
              days in a row
            </Text>
          </View>
          
          {/* Encouragement */}
          <Text
            style={[
              styles.encouragement,
              { color: colors.text.secondary },
              Typography.body,
            ]}
          >
            {getEncouragementMessage()}
          </Text>

          {/* Additional Milestones */}
          {hasExtraMilestone && (
            <View style={styles.extraMilestonesContainer}>
              <Text style={[styles.extraMilestonesTitle, { color: colors.text.secondary }]}>
                🎉 Bonus Milestones!
              </Text>

              {stepsMilestone && (
                <View style={[styles.milestoneChip, { backgroundColor: colors.primary.main + '20' }]}>
                  <Text style={styles.milestoneIcon}>👟</Text>
                  <Text style={[styles.milestoneText, { color: colors.text.primary }]}>
                    {(stepsMilestone / 1000).toFixed(0)}K Total Steps!
                  </Text>
                </View>
              )}

              {distanceMilestone && (
                <View style={[styles.milestoneChip, { backgroundColor: colors.status.success + '20' }]}>
                  <Text style={styles.milestoneIcon}>🏃</Text>
                  <Text style={[styles.milestoneText, { color: colors.text.primary }]}>
                    {distanceMilestone}km Total Distance!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            testID="dismiss-button"
            style={[
              styles.button,
              { backgroundColor: colors.system.orange },
            ]}
            onPress={handleDismiss}
            activeOpacity={0.8}
            accessibilityLabel="Continue"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.buttonText,
                { color: colors.text.inverse },
                Typography.headline,
              ]}
            >
              Keep It Going!
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
    fontSize: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  streakCount: {
    marginBottom: Layout.spacing.xs,
    fontWeight: '700',
  },
  streakLabel: {
    marginBottom: Layout.spacing.xs,
  },
  encouragement: {
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 22,
  },
  extraMilestonesContainer: {
    width: '100%',
    marginBottom: Layout.spacing.large,
    alignItems: 'center',
  },
  extraMilestonesTitle: {
    ...Typography.caption1,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Layout.spacing.small,
    textAlign: 'center',
  },
  milestoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
    borderRadius: Layout.borderRadius.medium,
    marginVertical: 4,
  },
  milestoneIcon: {
    fontSize: 20,
    marginRight: Layout.spacing.small,
  },
  milestoneText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
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

