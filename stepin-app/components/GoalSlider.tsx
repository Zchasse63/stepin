/**
 * GoalSlider Component
 * Slider for setting daily step goal (2,000 - 20,000 steps)
 * Shows current value prominently with recommendation text
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';

interface GoalSliderProps {
  initialValue: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
}

export function GoalSlider({
  initialValue,
  onValueChange,
  onSlidingComplete,
}: GoalSliderProps) {
  const { colors } = useTheme();
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [lastHapticValue, setLastHapticValue] = useState(initialValue);

  const MIN_STEPS = 2000;
  const MAX_STEPS = 20000;
  const STEP_INCREMENT = 500;

  const handleValueChange = (value: number) => {
    // Round to nearest 500
    const roundedValue = Math.round(value / STEP_INCREMENT) * STEP_INCREMENT;
    setCurrentValue(roundedValue);
    onValueChange(roundedValue);

    // Haptic feedback on every 1000 step change
    if (Platform.OS === 'ios' && Math.abs(roundedValue - lastHapticValue) >= 1000) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLastHapticValue(roundedValue);
    }
  };

  const handleSlidingComplete = (value: number) => {
    const roundedValue = Math.round(value / STEP_INCREMENT) * STEP_INCREMENT;
    setCurrentValue(roundedValue);
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (onSlidingComplete) {
      onSlidingComplete(roundedValue);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={styles.container}>
      {/* Current Value Display */}
      <View style={styles.valueContainer}>
        <Text style={styles.valueLabel}>Daily Step Goal</Text>
        <Text style={styles.value}>{formatNumber(currentValue)}</Text>
        <Text style={styles.valueUnit}>steps</Text>
      </View>

      {/* Slider */}
      <Slider
        style={styles.slider}
        minimumValue={MIN_STEPS}
        maximumValue={MAX_STEPS}
        step={STEP_INCREMENT}
        value={currentValue}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor={colors.primary.main}
        maximumTrackTintColor={colors.system.gray5}
        thumbTintColor={colors.primary.main}
        accessibilityLabel="Daily step goal slider"
        accessibilityHint={`Set your daily step goal between ${MIN_STEPS} and ${MAX_STEPS} steps`}
      />

      {/* Range Labels */}
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatNumber(MIN_STEPS)}</Text>
        <Text style={styles.rangeLabel}>{formatNumber(MAX_STEPS)}</Text>
      </View>

      {/* Recommendation */}
      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendation}>
          💡 Most people start with 5,000-7,000 steps
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  valueLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 8,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary.main,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 4,
  },
  valueUnit: {
    fontSize: 17,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  rangeLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  recommendationContainer: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.system.gray6,
    borderRadius: 12,
  },
  recommendation: {
    fontSize: 15,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});

