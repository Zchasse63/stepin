/**
 * Calendar Heat Map Component
 * 7-day horizontal scrollable calendar with color legend
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CalendarDay from './CalendarDay';
import { DailyStats } from '../types/database';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { getDatesInRange, formatDateForAPI, getAbbreviatedDayName } from '../lib/utils/dateUtils';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface CalendarHeatMapProps {
  startDate: Date;
  endDate: Date;
  dailyStats: DailyStats[];
  stepGoal: number;
  selectedDate?: string | null;
  onDayPress?: (date: string) => void;
}

interface LegendItem {
  color: string;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { color: '#9E9E9E', label: '0-25%' },
  { color: '#A8E6CF', label: '25-50%' },
  { color: '#4CAF50', label: '50-75%' },
  { color: '#2E7D32', label: '75-100%' },
  { color: '#FFD700', label: '100%+' },
];

export default function CalendarHeatMap({
  startDate,
  endDate,
  dailyStats,
  stepGoal,
  selectedDate,
  onDayPress,
}: CalendarHeatMapProps) {
  const { colors } = useTheme();

  // Generate all dates in range
  const dates = useMemo(() => {
    return getDatesInRange(startDate, endDate);
  }, [startDate, endDate]);

  // Create a map of date -> stats for quick lookup
  const statsMap = useMemo(() => {
    const map = new Map<string, DailyStats>();
    dailyStats.forEach(stat => {
      map.set(stat.date, stat);
    });
    return map;
  }, [dailyStats]);

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>This Week</Text>

      {/* Calendar Days */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {dates.map(date => {
          const dateStr = formatDateForAPI(date);
          const stat = statsMap.get(dateStr);
          const steps = stat?.total_steps || 0;
          const dayName = getAbbreviatedDayName(date);

          return (
            <View key={dateStr} style={styles.dayWrapper}>
              <Text style={styles.dayName}>{dayName}</Text>
              <CalendarDay
                date={dateStr}
                steps={steps}
                stepGoal={stepGoal}
                isSelected={selectedDate === dateStr}
                onPress={onDayPress}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Progress:</Text>
        <View style={styles.legendItems}>
          {LEGEND_ITEMS.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color },
                ]}
              />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginHorizontal: Layout.spacing.medium,
    marginVertical: Layout.spacing.small,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    ...Typography.headline,
    color: colors.text.primary,
    marginBottom: Layout.spacing.small,
  },
  daysContainer: {
    paddingVertical: Layout.spacing.small,
  },
  dayWrapper: {
    alignItems: 'center',
    marginHorizontal: Layout.spacing.tiny,
  },
  dayName: {
    ...Typography.caption1,
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.tiny,
  },
  legendContainer: {
    marginTop: Layout.spacing.medium,
    paddingTop: Layout.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  legendTitle: {
    ...Typography.caption1,
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.small,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.small,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.small,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: Layout.spacing.tiny,
  },
  legendLabel: {
    ...Typography.caption2,
    fontSize: 11,
    color: colors.text.secondary,
  },
});

