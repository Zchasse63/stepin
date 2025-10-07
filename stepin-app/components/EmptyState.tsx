/**
 * Empty State Component
 * Shows friendly empty states with illustrations and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

export type EmptyStateType =
  | 'no-walks'
  | 'no-history'
  | 'no-search-results'
  | 'no-connection'
  | 'permission-required';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const EMPTY_STATE_CONFIG: Record<
  EmptyStateType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    actionLabel?: string;
  }
> = {
  'no-walks': {
    icon: 'walk',
    title: 'No Walks Yet',
    message: "You haven't logged any walks today. Get moving and start your streak!",
    actionLabel: 'Log a Walk',
  },
  'no-history': {
    icon: 'calendar-outline',
    title: 'No Walk History',
    message: "You haven't logged any walks yet. Start walking to build your history!",
    actionLabel: 'Log Your First Walk',
  },
  'no-search-results': {
    icon: 'search-outline',
    title: 'No Results Found',
    message: 'Try adjusting your search or filters.',
  },
  'no-connection': {
    icon: 'cloud-offline-outline',
    title: 'No Connection',
    message: "You're offline. Some features may be limited.",
    actionLabel: 'Retry',
  },
  'permission-required': {
    icon: 'lock-closed-outline',
    title: 'Permission Required',
    message: 'Stepin needs permission to access your health data to track steps automatically.',
    actionLabel: 'Grant Permission',
  },
};

export function EmptyState({
  type,
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const { colors } = useTheme();
  
  const config = EMPTY_STATE_CONFIG[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayIcon = icon || config.icon;

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.background.tertiary },
        ]}
      >
        <Ionicons
          name={displayIcon}
          size={64}
          color={colors.text.disabled}
        />
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          { color: colors.text.primary },
          Typography.title1,
        ]}
      >
        {displayTitle}
      </Text>

      {/* Message */}
      <Text
        style={[
          styles.message,
          { color: colors.text.secondary },
          Typography.body,
        ]}
      >
        {displayMessage}
      </Text>

      {/* Action Button */}
      {displayActionLabel && onAction && (
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary.main },
          ]}
          onPress={onAction}
          activeOpacity={0.8}
          accessibilityLabel={displayActionLabel}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.buttonText,
              { color: colors.text.inverse },
              Typography.headline,
            ]}
          >
            {displayActionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.medium,
    minWidth: 200,
    minHeight: Layout.button.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});

