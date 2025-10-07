/**
 * Pending Request Card Component
 * Phase 11: Non-Competitive Social Features
 * 
 * Displays a pending buddy request with Accept/Decline actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { BuddyWithProfile } from '../types/social';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface PendingRequestCardProps {
  request: BuddyWithProfile;
  onAccept: () => void;
  onDecline: () => void;
}

export function PendingRequestCard({
  request,
  onAccept,
  onDecline,
}: PendingRequestCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const displayName = request.buddy_profile?.display_name || 'Anonymous Walker';
  const avatarUrl = request.buddy_profile?.avatar_url;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={24} color={colors.text.disabled} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.message}>wants to be your buddy</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={colors.text.secondary} />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={onAccept}
          activeOpacity={0.7}
        >
          <Feather name="check" size={18} color={colors.text.inverse} />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.status.warning + '15', // 15% opacity
      borderLeftWidth: 4,
      borderLeftColor: colors.status.warning,
      marginHorizontal: Layout.spacing.lg,
      marginBottom: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Layout.spacing.md,
    },
    avatarContainer: {
      marginRight: Layout.spacing.md,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    avatarPlaceholder: {
      backgroundColor: colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs / 2,
    },
    message: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
    actions: {
      flexDirection: 'row',
      gap: Layout.spacing.sm,
      padding: Layout.spacing.md,
      paddingTop: 0,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Layout.spacing.sm,
      borderRadius: Layout.borderRadius.md,
      gap: Layout.spacing.xs,
    },
    declineButton: {
      backgroundColor: colors.background.secondary,
    },
    declineButtonText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.secondary,
    },
    acceptButton: {
      backgroundColor: colors.status.success,
    },
    acceptButtonText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.inverse,
    },
  });

