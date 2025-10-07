/**
 * Calendar Day Component
 * Individual day circle with color intensity based on step percentage
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { getProgressColor } from '../lib/utils/calculateStats';
import { getDayOfMonth, isDateToday } from '../lib/utils/dateUtils';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface CalendarDayProps {
  date: string; // ISO date string
  steps: number;
  stepGoal: number;
  isSelected?: boolean;
  onPress?: (date: string) => void;
}

export default function CalendarDay({
  date,
  steps,
  stepGoal,
  isSelected = false,
  onPress,
}: CalendarDayProps) {
  const { colors } = useTheme();
  const percentage = stepGoal > 0 ? (steps / stepGoal) * 100 : 0;
  const color = getProgressColor(percentage);
  const dayNumber = getDayOfMonth(date);
  const isToday = isDateToday(date);

  const handlePress = () => {
    onPress?.(date);
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${dayNumber}, ${steps} steps, ${Math.round(percentage)}% of goal`}
      accessibilityHint="Tap to view details for this day"
      accessibilityState={{ selected: isSelected }}
    >
      <View
        style={[
          styles.circle,
          { backgroundColor: color },
          isSelected && styles.circleSelected,
          isToday && styles.circleToday,
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            percentage >= 50 && styles.dayNumberLight,
          ]}
        >
          {dayNumber}
        </Text>
      </View>
      
      {/* Today indicator */}
      {isToday && (
        <View style={styles.todayDot} />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.tiny,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  circleSelected: {
    borderColor: colors.system.blue,
    borderWidth: 3,
  },
  circleToday: {
    shadowColor: colors.system.blue,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dayNumber: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dayNumberLight: {
    color: colors.text.inverse,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.system.blue,
    marginTop: Layout.spacing.tiny,
  },
});

