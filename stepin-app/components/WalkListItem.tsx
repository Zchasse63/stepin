/**
 * Walk List Item Component
 * List item showing walk details with swipe-to-delete and entrance animation
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Walk } from '../types/database';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { formatDateDisplay, formatDuration } from '../lib/utils/calculateStats';
import { formatDistance } from '../lib/utils/formatDistance';
import { getStaggerDelay, ANIMATION_CONFIG } from '../lib/animations/celebrationAnimations';
import type { UnitsPreference } from '../types/profile';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface WalkListItemProps {
  walk: Walk;
  goalMet?: boolean;
  units?: UnitsPreference;
  index?: number;
  onPress?: (walk: Walk) => void;
  onDelete?: (walk: Walk) => void;
}

export default function WalkListItem({
  walk,
  goalMet = false,
  units = 'miles',
  index = 0,
  onPress,
  onDelete,
}: WalkListItemProps) {
  const { colors } = useTheme();

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  // Entrance animation with stagger
  useEffect(() => {
    const delay = getStaggerDelay(index, 50);

    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(ANIMATION_CONFIG.scale.press, ANIMATION_CONFIG.springGentle);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATION_CONFIG.spring);
  };

  const handlePress = () => {
    onPress?.(walk);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Walk',
      'Are you sure you want to delete this walk? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(walk),
        },
      ]
    );
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={handleDelete}
      accessibilityRole="button"
      accessibilityLabel="Delete walk"
    >
      <Ionicons name="trash" size={24} color={colors.text.inverse} />
    </TouchableOpacity>
  );

  const formattedDate = formatDateDisplay(walk.date, 'MMM d, yyyy');
  const duration = walk.duration_minutes ? formatDuration(walk.duration_minutes) : null;
  const distance = walk.distance_meters ? formatDistance(walk.distance_meters, units) : null;

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <Swipeable
      renderRightActions={onDelete ? renderRightActions : undefined}
      overshootRight={false}
    >
      <AnimatedTouchable
        style={[styles.container, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Walk on ${formattedDate}, ${walk.steps} steps`}
        accessibilityHint="Tap to view details, swipe left to delete"
      >
        {/* Date Circle */}
        <View style={styles.dateCircle}>
          <Text style={styles.dateDay}>
            {new Date(walk.date).getDate()}
          </Text>
          <Text style={styles.dateMonth}>
            {formatDateDisplay(walk.date, 'MMM')}
          </Text>
        </View>

        {/* Walk Details */}
        <View style={styles.details}>
          <View style={styles.detailsHeader}>
            <Text style={styles.steps}>
              {walk.steps.toLocaleString()} steps
            </Text>
            <View style={styles.badges}>
              {goalMet && (
                <View style={styles.badge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.status.success}
                  />
                  <Text style={styles.badgeText}>Goal Met</Text>
                </View>
              )}
              {/* Phase 12: Heart Rate Badge */}
              {walk.average_heart_rate && (
                <View style={[styles.badge, styles.hrBadge]}>
                  <Ionicons
                    name="heart"
                    size={14}
                    color={colors.system.red}
                  />
                  <Text style={styles.badgeText}>{Math.round(walk.average_heart_rate)} BPM</Text>
                </View>
              )}
            </View>
          </View>
          
          {(duration || distance) && (
            <View style={styles.metadata}>
              {duration && (
                <View style={styles.metadataItem}>
                  <Ionicons name="time" size={14} color={colors.text.secondary} />
                  <Text style={styles.metadataText}>{duration}</Text>
                </View>
              )}
              {distance && (
                <View style={styles.metadataItem}>
                  <Ionicons name="navigate" size={14} color={colors.text.secondary} />
                  <Text style={styles.metadataText}>{distance}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.disabled}
        />
      </AnimatedTouchable>
    </Swipeable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingVertical: Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    minHeight: Layout.minTapTarget,
  },
  dateCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.light + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.medium,
  },
  dateDay: {
    ...Typography.headline,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dateMonth: {
    ...Typography.caption2,
    fontSize: 11,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  details: {
    flex: 1,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.tiny,
  },
  steps: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: Layout.spacing.small,
  },
  badges: {
    flexDirection: 'row',
    gap: Layout.spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success + '20',
    paddingHorizontal: Layout.spacing.small,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.small,
  },
  hrBadge: {
    backgroundColor: colors.system.red + '20',
  },
  badgeText: {
    ...Typography.caption2,
    fontSize: 11,
    color: colors.status.success,
    marginLeft: 2,
    fontWeight: '600',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.medium,
  },
  metadataText: {
    ...Typography.caption1,
    fontSize: 13,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});

