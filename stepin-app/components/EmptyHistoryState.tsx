/**
 * Empty History State Component
 * Displayed when user has no walks logged yet
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';

export default function EmptyHistoryState() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="walk" size={64} color={colors.primary.main} />
      </View>
      <Text style={styles.title}>Start Your Walking Journey</Text>
      <Text style={styles.description}>
        You haven't logged any walks yet. Head to the Today screen to start tracking your steps!
      </Text>
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Getting Started:</Text>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary.main} />
          <Text style={styles.tipText}>Grant health permissions to track steps automatically</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary.main} />
          <Text style={styles.tipText}>Or manually log your walks anytime</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary.main} />
          <Text style={styles.tipText}>Every step counts - no goal is too small!</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xxlarge,
    paddingTop: Layout.spacing.xxlarge * 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.light + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.large,
  },
  title: {
    ...Typography.title1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.small,
  },
  description: {
    ...Typography.body,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Layout.spacing.large,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: colors.background.primary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
  },
  tipsTitle: {
    ...Typography.headline,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: Layout.spacing.small,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.small,
  },
  tipText: {
    ...Typography.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: Layout.spacing.small,
    flex: 1,
  },
});

