/**
 * Goal Adjustment Modal
 * Shows adaptive goal suggestions based on user performance
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';
import type { GoalSuggestion } from '../lib/utils/goalAdjustment';

interface GoalAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  suggestion: GoalSuggestion | null;
  onAccept: (newGoal: number) => void;
  onDecline: () => void;
}

export function GoalAdjustmentModal({
  visible,
  onClose,
  suggestion,
  onAccept,
  onDecline,
}: GoalAdjustmentModalProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (!suggestion) return null;

  const isIncrease = suggestion.suggestedGoal > suggestion.currentGoal;
  const isDecrease = suggestion.suggestedGoal < suggestion.currentGoal;
  const isOptimal = suggestion.reason === 'optimal';

  const getIconName = () => {
    if (isIncrease) return 'trending-up';
    if (isDecrease) return 'trending-down';
    return 'checkmark-circle';
  };

  const getIconColor = () => {
    if (isIncrease) return colors.status.success;
    if (isDecrease) return colors.status.warning;
    return colors.primary.main;
  };

  const getTitle = () => {
    if (isOptimal) return 'Your Goal is Perfect!';
    if (isIncrease) return 'Ready for a Challenge?';
    return 'Let\'s Adjust Your Goal';
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <Modal
      testID="goal-adjustment-modal"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View testID="suggestion-icon" style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
              <Ionicons name={getIconName()} size={32} color={getIconColor()} />
            </View>
            <Text testID="modal-title" style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity
              testID="close-button"
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Message */}
            <Text testID="suggestion-message" style={styles.message}>{suggestion.message}</Text>

            {/* Goal Comparison */}
            {!isOptimal && (
              <View style={styles.comparisonContainer}>
                <View style={styles.goalBox}>
                  <Text style={styles.goalLabel}>Current Goal</Text>
                  <Text testID="current-goal-display" style={styles.goalValue}>{formatNumber(suggestion.currentGoal)}</Text>
                  <Text style={styles.goalUnit}>steps/day</Text>
                </View>

                <Ionicons
                  name="arrow-forward"
                  size={24}
                  color={colors.text.secondary}
                  style={styles.arrow}
                />

                <View style={[styles.goalBox, styles.suggestedGoalBox]}>
                  <Text style={styles.goalLabel}>Suggested Goal</Text>
                  <Text testID="suggested-goal-display" style={[styles.goalValue, styles.suggestedGoalValue]}>
                    {formatNumber(suggestion.suggestedGoal)}
                  </Text>
                  <Text style={styles.goalUnit}>steps/day</Text>
                </View>
              </View>
            )}

            {/* Analysis Details */}
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Based on Your Performance</Text>
              
              <View style={styles.statRow}>
                <Ionicons name="calendar" size={16} color={colors.text.secondary} />
                <Text style={styles.statLabel}>Days Analyzed:</Text>
                <Text style={styles.statValue}>{suggestion.analysis.daysAnalyzed}</Text>
              </View>

              <View style={styles.statRow}>
                <Ionicons name="footsteps" size={16} color={colors.text.secondary} />
                <Text style={styles.statLabel}>Average Steps:</Text>
                <Text style={styles.statValue}>
                  {formatNumber(suggestion.analysis.averageSteps)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Ionicons name="trophy" size={16} color={colors.text.secondary} />
                <Text style={styles.statLabel}>Goal Met:</Text>
                <Text style={styles.statValue}>
                  {Math.round(suggestion.analysis.goalMetPercentage * 100)}%
                </Text>
              </View>

              <View style={styles.statRow}>
                <Ionicons
                  name={
                    suggestion.analysis.trend === 'increasing'
                      ? 'trending-up'
                      : suggestion.analysis.trend === 'decreasing'
                      ? 'trending-down'
                      : 'remove'
                  }
                  size={16}
                  color={colors.text.secondary}
                />
                <Text style={styles.statLabel}>Trend:</Text>
                <Text style={styles.statValue}>
                  {suggestion.analysis.trend.charAt(0).toUpperCase() +
                    suggestion.analysis.trend.slice(1)}
                </Text>
              </View>

              <View style={styles.confidenceBadge}>
                <Text testID="confidence-display" style={styles.confidenceText}>
                  {suggestion.confidence.toUpperCase()} CONFIDENCE
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {!isOptimal ? (
              <>
                <TouchableOpacity
                  testID="decline-button"
                  style={styles.declineButton}
                  onPress={() => {
                    onDecline();
                    onClose();
                  }}
                  accessibilityLabel="Keep current goal"
                  accessibilityRole="button"
                >
                  <Text style={styles.declineButtonText}>Keep Current</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="accept-button"
                  style={styles.acceptButton}
                  onPress={() => {
                    onAccept(suggestion.suggestedGoal);
                    onClose();
                  }}
                  accessibilityLabel="Accept suggested goal"
                  accessibilityRole="button"
                >
                  <Text style={styles.acceptButtonText}>
                    {isIncrease ? 'Level Up!' : 'Adjust Goal'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                testID="accept-button"
                style={styles.acceptButton}
                onPress={onClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={styles.acceptButtonText}>Got It!</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.background.primary,
      borderTopLeftRadius: Layout.borderRadius.xlarge,
      borderTopRightRadius: Layout.borderRadius.xlarge,
      maxHeight: '85%',
    },
    header: {
      padding: Layout.spacing.large,
      paddingBottom: Layout.spacing.medium,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Layout.spacing.medium,
    },
    title: {
      ...Typography.title2,
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: Layout.spacing.medium,
      right: Layout.spacing.medium,
      padding: Layout.spacing.small,
    },
    content: {
      padding: Layout.spacing.large,
    },
    message: {
      ...Typography.body,
      fontSize: 16,
      color: colors.text.secondary,
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: Layout.spacing.large,
    },
    comparisonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Layout.spacing.large,
    },
    goalBox: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.medium,
      padding: Layout.spacing.medium,
      alignItems: 'center',
    },
    suggestedGoalBox: {
      backgroundColor: colors.primary.main + '15',
      borderWidth: 2,
      borderColor: colors.primary.main,
    },
    goalLabel: {
      ...Typography.caption1,
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    goalValue: {
      ...Typography.title1,
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
    },
    suggestedGoalValue: {
      color: colors.primary.main,
    },
    goalUnit: {
      ...Typography.caption2,
      fontSize: 11,
      color: colors.text.tertiary,
      marginTop: 2,
    },
    arrow: {
      marginHorizontal: Layout.spacing.small,
    },
    analysisContainer: {
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.medium,
      padding: Layout.spacing.medium,
    },
    analysisTitle: {
      ...Typography.headline,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: Layout.spacing.medium,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Layout.spacing.small,
      gap: Layout.spacing.small,
    },
    statLabel: {
      ...Typography.body,
      fontSize: 14,
      color: colors.text.secondary,
      flex: 1,
    },
    statValue: {
      ...Typography.body,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    confidenceBadge: {
      backgroundColor: colors.background.tertiary,
      borderRadius: Layout.borderRadius.small,
      paddingVertical: Layout.spacing.small,
      paddingHorizontal: Layout.spacing.medium,
      alignSelf: 'center',
      marginTop: Layout.spacing.medium,
    },
    confidenceText: {
      ...Typography.caption1,
      fontSize: 11,
      fontWeight: '700',
      color: colors.text.secondary,
      letterSpacing: 0.5,
    },
    actions: {
      flexDirection: 'row',
      padding: Layout.spacing.large,
      gap: Layout.spacing.medium,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    declineButton: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.medium,
      paddingVertical: Layout.spacing.medium,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.medium,
      minHeight: Layout.minTapTarget,
    },
    declineButtonText: {
      ...Typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    acceptButton: {
      flex: 1,
      backgroundColor: colors.primary.main,
      borderRadius: Layout.borderRadius.medium,
      paddingVertical: Layout.spacing.medium,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: Layout.minTapTarget,
    },
    acceptButtonText: {
      ...Typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.inverse,
    },
  });

