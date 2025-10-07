/**
 * Animated Button Component
 * Button with press animation and haptic feedback
 */

import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  AccessibilityInfo,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { hapticFeedback, ANIMATION_CONFIG } from '../lib/animations/celebrationAnimations';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  haptic?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedButton({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  haptic = true,
  accessibilityLabel,
  accessibilityHint,
}: AnimatedButtonProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled || false);
    });
  }, []);

  const handlePressIn = () => {
    if (reduceMotion) {
      scale.value = withTiming(ANIMATION_CONFIG.scale.press, { duration: 50 });
    } else {
      scale.value = withSpring(ANIMATION_CONFIG.scale.press, ANIMATION_CONFIG.springGentle);
    }
  };

  const handlePressOut = () => {
    if (reduceMotion) {
      scale.value = withTiming(1, { duration: 50 });
    } else {
      scale.value = withSpring(1, ANIMATION_CONFIG.spring);
    }
  };

  const handlePress = () => {
    if (haptic && !disabled) {
      hapticFeedback.light();
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    if (disabled) return colors.text.disabled;
    
    switch (variant) {
      case 'primary':
        return colors.primary.main;
      case 'secondary':
        return colors.secondary.main;
      case 'outline':
        return 'transparent';
      case 'danger':
        return colors.status.error;
      default:
        return colors.primary.main;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.text.secondary;
    
    switch (variant) {
      case 'outline':
        return colors.primary.main;
      default:
        return colors.text.inverse;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return Layout.button.height;
      case 'large':
        return 56;
      default:
        return Layout.button.height;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.sm;
      case 'medium':
        return Typography.fontSize.md;
      case 'large':
        return Typography.fontSize.lg;
      default:
        return Typography.fontSize.md;
    }
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: variant === 'outline' ? colors.primary.main : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
            marginLeft: icon ? Layout.spacing.sm : 0,
          },
          textStyle,
        ]}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Layout.spacing.lg,
    minWidth: Layout.button.minWidth,
  },
  text: {
    fontWeight: '600',
  },
});

