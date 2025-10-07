/**
 * Insights Section Component
 * Container displaying 2-3 prioritized insights
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InsightsCard from './InsightsCard';
import { Insight } from '../types/history';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

interface InsightsSectionProps {
  insights: Insight[];
}

export default function InsightsSection({ insights }: InsightsSectionProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      <View style={styles.insightsContainer}>
        {insights.map((insight) => (
          <InsightsCard key={insight.id} insight={insight} />
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
  },
  title: {
    ...Typography.headline,
    color: colors.text.primary,
    marginBottom: Layout.spacing.small,
  },
  insightsContainer: {
    // Insights cards have their own margin-bottom
  },
});

