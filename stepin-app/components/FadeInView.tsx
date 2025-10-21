/**
 * FadeInView Component
 * Provides smooth fade-in animation for content
 * Phase 4: Visual Polish
 */

import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

/**
 * Fade in animation for smooth content appearance
 * @param duration - Animation duration in ms (default: 300)
 * @param delay - Delay before animation starts in ms (default: 0)
 */
export function FadeInView({
  children,
  duration = 300,
  delay = 0,
  style,
}: FadeInViewProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration })
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * Fade in with slide up animation
 */
export function FadeInUpView({
  children,
  duration = 300,
  delay = 0,
  distance = 20,
  style,
}: FadeInViewProps & { distance?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(distance);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withTiming(0, { duration }));
  }, [delay, duration, distance]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * Scale in animation (pop effect)
 */
export function ScaleInView({
  children,
  duration = 300,
  delay = 0,
  fromScale = 0.9,
  style,
}: FadeInViewProps & { fromScale?: number }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(fromScale);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    scale.value = withDelay(delay, withTiming(1, { duration }));
  }, [delay, duration, fromScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * Stagger children animation
 * Each child fades in with incremental delay
 */
interface StaggeredFadeInProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: number;
  style?: ViewStyle;
}

export function StaggeredFadeIn({
  children,
  staggerDelay = 100,
  duration = 300,
  style,
}: StaggeredFadeInProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeInUpView
          key={index}
          duration={duration}
          delay={index * staggerDelay}
          style={style}
        >
          {child}
        </FadeInUpView>
      ))}
    </>
  );
}
