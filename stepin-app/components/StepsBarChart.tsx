/**
 * Steps Bar Chart Component
 * Bar chart for Month/Year views showing daily step counts
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { DailyStats } from '../types/database';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { formatDateForAPI, getDayOfMonth, getMonthAbbreviation } from '../lib/utils/dateUtils';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface StepsBarChartProps {
  dailyStats: DailyStats[];
  stepGoal: number;
  startDate: Date;
  endDate: Date;
  onBarPress?: (date: string) => void;
}

const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 10, bottom: 30, left: 40 };
const BAR_MIN_WIDTH = 8;
const BAR_MAX_WIDTH = 24;

/**
 * Calculate Y-axis range with 10% padding above/below data range
 * Rounds to nearest 1000 for clean axis labels
 */
function calculateYAxisRange(data: number[]): { min: number; max: number } {
  if (data.length === 0 || Math.max(...data) === 0) {
    return { min: 0, max: 10000 }; // Default range for empty data
  }

  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data);
  const range = dataMax - dataMin;

  // Add 10% padding
  const padding = range * 0.1;
  let min = Math.max(0, dataMin - padding); // Don't go below 0
  let max = dataMax + padding;

  // Round to nearest 1000
  min = Math.floor(min / 1000) * 1000;
  max = Math.ceil(max / 1000) * 1000;

  // Ensure minimum range of 1000
  if (max - min < 1000) {
    max = min + 1000;
  }

  return { min, max };
}

export default function StepsBarChart({
  dailyStats,
  stepGoal,
  startDate,
  endDate,
}: StepsBarChartProps) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (Layout.spacing.medium * 2);
  const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  // Create a map of date -> stats
  const statsMap = useMemo(() => {
    const map = new Map<string, DailyStats>();
    dailyStats.forEach(stat => {
      map.set(stat.date, stat);
    });
    return map;
  }, [dailyStats]);

  // Calculate Y-axis range with auto-scaling
  const { minSteps, maxSteps } = useMemo(() => {
    const stepValues = dailyStats.map(s => s.total_steps);
    const { min, max } = calculateYAxisRange(stepValues);
    return { minSteps: min, maxSteps: max };
  }, [dailyStats]);

  // Generate dates for the period
  const dates = useMemo(() => {
    const result: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [startDate, endDate]);

  // Calculate bar width based on number of days
  const barWidth = useMemo(() => {
    const calculatedWidth = innerWidth / dates.length - 4;
    return Math.max(BAR_MIN_WIDTH, Math.min(calculatedWidth, BAR_MAX_WIDTH));
  }, [innerWidth, dates.length]);

  const barSpacing = (innerWidth - (barWidth * dates.length)) / (dates.length + 1);

  // Scale functions
  const scaleY = (steps: number) => {
    const range = maxSteps - minSteps;
    const normalizedSteps = steps - minSteps;
    return innerHeight - (normalizedSteps / range) * innerHeight;
  };

  const goalY = scaleY(stepGoal);

  // Y-axis labels
  const yAxisLabels = useMemo(() => {
    const range = maxSteps - minSteps;
    const step = range / 4;
    return [minSteps, minSteps + step, minSteps + step * 2, minSteps + step * 3, maxSteps].map(value => ({
      value,
      y: scaleY(value),
    }));
  }, [minSteps, maxSteps]);

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View testID="steps-bar-chart" style={styles.container}>
      <Text testID="chart-title" style={styles.title}>Daily Steps</Text>
      
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <G x={CHART_PADDING.left} y={CHART_PADDING.top}>
          {/* Y-axis grid lines */}
          {yAxisLabels.map((label, index) => (
            <G key={`grid-${index}`}>
              <Line
                x1={0}
                y1={label.y}
                x2={innerWidth}
                y2={label.y}
                stroke={colors.border.light}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText
                x={-8}
                y={label.y + 4}
                fontSize={10}
                fill={colors.text.secondary}
                textAnchor="end"
              >
                {label.value >= 1000
                  ? `${(label.value / 1000).toFixed(0)}k`
                  : label.value.toString()}
              </SvgText>
            </G>
          ))}

          {/* Goal line */}
          <Line
            x1={0}
            y1={goalY}
            x2={innerWidth}
            y2={goalY}
            stroke={colors.primary.main}
            strokeWidth={2}
            strokeDasharray="6,3"
          />

          {/* Bars */}
          {dates.map((date, index) => {
            const dateStr = formatDateForAPI(date);
            const stat = statsMap.get(dateStr);
            const steps = stat?.total_steps || 0;
            const goalMet = stat?.goal_met || false;
            
            const x = barSpacing + index * (barWidth + barSpacing);
            const barHeight = steps > 0 ? innerHeight - scaleY(steps) : 0;
            const y = scaleY(steps);

            const barColor = goalMet ? colors.status.success : colors.system.gray3;

            return (
              <G key={dateStr}>
                {/* Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  rx={2}
                />

                {/* X-axis label (show every nth day based on space) */}
                {(dates.length <= 14 || index % Math.ceil(dates.length / 14) === 0) && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={innerHeight + 15}
                    fontSize={9}
                    fill={colors.text.secondary}
                    textAnchor="middle"
                  >
                    {getDayOfMonth(date)}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.status.success }]} />
          <Text style={styles.legendText}>Goal Met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.system.gray3 }]} />
          <Text style={styles.legendText}>Below Goal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: colors.primary.main }]} />
          <Text style={styles.legendText}>Goal Line</Text>
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Layout.spacing.small,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Layout.spacing.small,
    marginVertical: Layout.spacing.tiny,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.tiny,
  },
  legendLine: {
    width: 16,
    height: 2,
    marginRight: Layout.spacing.tiny,
  },
  legendText: {
    ...Typography.caption2,
    fontSize: 11,
    color: colors.text.secondary,
  },
});

