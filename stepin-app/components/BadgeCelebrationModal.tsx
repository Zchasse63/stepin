/**
 * Badge Celebration Modal
 * Shows when user earns a new badge
 * Includes confetti, haptic feedback, and badge details
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
  Share,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ConfettiCelebration } from './ConfettiCelebration';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';
import { hapticFeedback } from '../lib/animations/celebrationAnimations';
import type { Badge } from '../lib/gamification/badgeService';
import { logger } from '../lib/utils/logger';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BadgeCelebrationModalProps {
  visible: boolean;
  onDismiss: () => void;
  badge: Badge | null;
}

const CELEBRATION_MESSAGES = [
  "Badge Unlocked! 🏆",
  "Achievement Earned! ⭐",
  "New Badge! 🎖️",
  "Congratulations! 🌟",
  "You Did It! 🎉",
];

export function BadgeCelebrationModal({
  visible,
  onDismiss,
  badge,
}: BadgeCelebrationModalProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const badgeRotate = useSharedValue(0);
  
  // Random celebration message
  const [celebrationMessage] = useState(
    CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
  );

  // Check reduced motion on mount
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled || false);
    });
  }, []);

  // Animate in when visible
  useEffect(() => {
    if (visible && badge) {
      // Trigger haptic feedback
      hapticFeedback.success();
      
      // Show confetti
      setShowConfetti(true);
      
      // Animate modal in
      if (reduceMotion) {
        scale.value = withTiming(1, { duration: 100 });
        opacity.value = withTiming(1, { duration: 100 });
        badgeScale.value = withTiming(1, { duration: 100 });
      } else {
        // Modal fade in
        opacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
        
        // Modal scale in
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
        });
        
        // Badge pop in with rotation
        badgeScale.value = withSequence(
          withSpring(1.2, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 10, stiffness: 100 })
        );
        
        badgeRotate.value = withSequence(
          withTiming(10, { duration: 200 }),
          withTiming(-10, { duration: 200 }),
          withTiming(0, { duration: 200 })
        );
      }
    } else {
      // Reset animations
      scale.value = 0;
      opacity.value = 0;
      badgeScale.value = 0;
      badgeRotate.value = 0;
      setShowConfetti(false);
    }
  }, [visible, badge, reduceMotion]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotate.value}deg` },
    ],
  }));

  const handleShare = async () => {
    if (!badge) return;

    try {
      await Share.share({
        message: `I just earned the "${badge.name}" badge in Steppin! ${badge.description}`,
      });
      logger.info('Badge shared', { badgeId: badge.id });
    } catch (error) {
      logger.error('Error sharing badge:', error);
    }
  };

  if (!badge) return null;

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      testID="badge-celebration-modal"
    >
      {/* Confetti */}
      {showConfetti && !reduceMotion && (
        <ConfettiCelebration
          visible={showConfetti}
          onComplete={() => setShowConfetti(false)}
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, modalAnimatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.celebrationText}>{celebrationMessage}</Text>
          </View>

          {/* Badge Icon */}
          <Animated.View style={[styles.badgeContainer, badgeAnimatedStyle]}>
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
            </View>
          </Animated.View>

          {/* Badge Details */}
          <View style={styles.content}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {badge.category.charAt(0).toUpperCase() + badge.category.slice(1)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              accessibilityLabel="Share badge"
              accessibilityRole="button"
            >
              <Ionicons name="share-social-outline" size={20} color={colors.primary.main} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={onDismiss}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text style={styles.doneButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.large,
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: Layout.borderRadius.xlarge,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    padding: Layout.spacing.xlarge,
    paddingBottom: Layout.spacing.medium,
    alignItems: 'center',
  },
  celebrationText: {
    ...Typography.title1,
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary.main,
    textAlign: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.large,
  },
  badgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.main + '20',
    borderWidth: 4,
    borderColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 60,
  },
  content: {
    padding: Layout.spacing.xlarge,
    paddingTop: Layout.spacing.medium,
    alignItems: 'center',
  },
  badgeName: {
    ...Typography.title2,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.small,
  },
  badgeDescription: {
    ...Typography.body,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Layout.spacing.medium,
  },
  categoryBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryText: {
    ...Typography.caption1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    padding: Layout.spacing.large,
    gap: Layout.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.small,
    backgroundColor: colors.background.secondary,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    borderWidth: 1,
    borderColor: colors.border.medium,
    minHeight: Layout.minTapTarget,
  },
  shareButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.main,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTapTarget,
  },
  doneButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});

