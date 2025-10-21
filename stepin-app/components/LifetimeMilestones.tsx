/**
 * Lifetime Milestones Component
 * Displays lifetime achievements with motivational "only X more!" messaging
 * Shows Total Steps and Total Walks with progress toward next milestone
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { StepMilestones } from '../constants/App';

interface LifetimeMilestonesProps {
  totalSteps: number;
  totalWalks: number;
}

export default function LifetimeMilestones({
  totalSteps,
  totalWalks,
}: LifetimeMilestonesProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Calculate next milestone for steps
  const getNextStepMilestone = () => {
    const milestones = [
      StepMilestones.BRONZE, // 100,000
      StepMilestones.SILVER, // 250,000
      StepMilestones.GOLD, // 500,000
      StepMilestones.PLATINUM, // 1,000,000
    ];

    for (const milestone of milestones) {
      if (totalSteps < milestone) {
        return milestone;
      }
    }
    return null; // Already achieved all milestones
  };

  // Calculate next milestone for walks (every 100 walks)
  const getNextWalkMilestone = () => {
    return Math.ceil(totalWalks / 100) * 100;
  };

  const nextStepMilestone = getNextStepMilestone();
  const nextWalkMilestone = getNextWalkMilestone();
  const stepsToGo = nextStepMilestone ? nextStepMilestone - totalSteps : 0;
  const walksToGo = nextWalkMilestone - totalWalks;

  // Get milestone name
  const getMilestoneName = (milestone: number | null) => {
    if (!milestone) return 'Platinum';
    switch (milestone) {
      case StepMilestones.BRONZE:
        return 'Bronze';
      case StepMilestones.SILVER:
        return 'Silver';
      case StepMilestones.GOLD:
        return 'Gold';
      case StepMilestones.PLATINUM:
        return 'Platinum';
      default:
        return '';
    }
  };

  // Show "only X more!" if within threshold
  const showStepsMotivation = stepsToGo > 0 && stepsToGo <= StepMilestones.MILESTONE_THRESHOLD;
  const showWalksMotivation = walksToGo > 0 && walksToGo <= 10;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Lifetime Achievements</Text>

      <View style={styles.milestonesContainer}>
        {/* Total Steps Card */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneIcon}>👣</Text>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneValue}>{totalSteps.toLocaleString()}</Text>
              <Text style={styles.milestoneLabel}>Total Steps</Text>
            </View>
          </View>

          {showStepsMotivation && nextStepMilestone && (
            <View style={styles.motivationBanner}>
              <Text style={styles.motivationText}>
                Only {stepsToGo.toLocaleString()} more to {getMilestoneName(nextStepMilestone)}! 🎯
              </Text>
            </View>
          )}
        </View>

        {/* Total Walks Card */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneIcon}>🚶</Text>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneValue}>{totalWalks.toLocaleString()}</Text>
              <Text style={styles.milestoneLabel}>Total Walks</Text>
            </View>
          </View>

          {showWalksMotivation && (
            <View style={styles.motivationBanner}>
              <Text style={styles.motivationText}>
                Only {walksToGo} more to {nextWalkMilestone}! 🎉
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginHorizontal: Layout.spacing.large,
    marginTop: Layout.spacing.xlarge,
  },
  sectionTitle: {
    ...Typography.title3,
    color: colors.text.primary,
    marginBottom: Layout.spacing.medium,
  },
  milestonesContainer: {
    gap: Layout.spacing.medium,
  },
  milestoneCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.large,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.medium,
  },
  milestoneIcon: {
    fontSize: 48,
    lineHeight: 48,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary.main,
    lineHeight: 38,
  },
  milestoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 22,
    marginTop: 2,
  },
  motivationBanner: {
    marginTop: Layout.spacing.medium,
    paddingTop: Layout.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary.main,
    lineHeight: 20,
    textAlign: 'center',
  },
});
