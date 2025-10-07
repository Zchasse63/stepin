/**
 * Time Period Selector Component
 * iOS-styled segmented control for selecting Week/Month/Year
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import { TimePeriod } from '../types/history';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

export default function TimePeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodSelectorProps) {
  const { colors } = useTheme();
  const handlePeriodPress = (period: TimePeriod) => {
    onPeriodChange(period);
    
    // Announce change to screen readers
    AccessibilityInfo.announceForAccessibility(
      `Selected ${period} view`
    );
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        {PERIODS.map((period, index) => {
          const isSelected = selectedPeriod === period.value;
          const isFirst = index === 0;
          const isLast = index === PERIODS.length - 1;

          return (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.segment,
                isSelected && styles.segmentSelected,
                isFirst && styles.segmentFirst,
                isLast && styles.segmentLast,
              ]}
              onPress={() => handlePeriodPress(period.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${period.label} view`}
              accessibilityHint={`Shows your walking history for the past ${period.value}`}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.system.gray6,
    borderRadius: Layout.borderRadius.medium,
    padding: 2,
    height: Layout.minTapTarget,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.small,
    marginHorizontal: 1,
  },
  segmentFirst: {
    marginLeft: 0,
  },
  segmentLast: {
    marginRight: 0,
  },
  segmentSelected: {
    backgroundColor: colors.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '400',
    color: colors.text.primary,
  },
  segmentTextSelected: {
    fontWeight: '600',
    color: colors.text.primary,
  },
});

