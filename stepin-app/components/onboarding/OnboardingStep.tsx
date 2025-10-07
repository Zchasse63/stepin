/**
 * Onboarding Step Component
 * Reusable component for each onboarding step
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../lib/theme/themeManager';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStepProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  content?: React.ReactNode;
}

export function OnboardingStep({
  title,
  description,
  illustration,
  content,
}: OnboardingStepProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      {/* Illustration */}
      {illustration && (
        <View style={styles.illustrationContainer}>
          {illustration}
        </View>
      )}

      {/* Title */}
      <Text
        style={[
          styles.title,
          { color: colors.text.primary },
          Typography.largeTitle,
        ]}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        style={[
          styles.description,
          { color: colors.text.secondary },
          Typography.body,
        ]}
      >
        {description}
      </Text>

      {/* Custom Content */}
      {content && (
        <View style={styles.contentContainer}>
          {content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  illustrationContainer: {
    marginBottom: Layout.spacing.xl,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
    fontWeight: '700',
  },
  description: {
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 24,
    maxWidth: 320,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
});

