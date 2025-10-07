/**
 * Insights Card Component
 * Displays individual insight with icon, title, and description
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Insight } from '../types/history';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { getInsightIconName } from '../lib/utils/generateInsights';

interface InsightsCardProps {
  insight: Insight;
}

export default function InsightsCard({ insight }: InsightsCardProps) {
  const { colors } = useTheme();
  // Get background color based on insight type
  const getBackgroundColor = () => {
    switch (insight.type) {
      case 'positive':
        return colors.primary.light + '30';
      case 'nudge':
        return colors.secondary.light + '30';
      case 'milestone':
        return colors.accent.gold + '20';
      default:
        return colors.system.gray6;
    }
  };

  // Get icon color based on insight type
  const getIconColor = () => {
    switch (insight.type) {
      case 'positive':
        return colors.primary.main;
      case 'nudge':
        return colors.secondary.main;
      case 'milestone':
        return colors.accent.gold;
      default:
        return colors.text.secondary;
    }
  };

  const iconName = getInsightIconName(insight.icon);
  const backgroundColor = getBackgroundColor();
  const iconColor = getIconColor();

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={28} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.small,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.medium,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.headline,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: Layout.spacing.tiny,
  },
  description: {
    ...Typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

