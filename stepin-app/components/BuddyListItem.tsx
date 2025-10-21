/**
 * Buddy List Item Component
 * Phase 11: Non-Competitive Social Features
 * 
 * Displays a buddy with avatar, name, and swipe-to-remove action
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

interface BuddyListItemProps {
  buddy: BuddyWithProfile;
  onRemove: () => void;
  onBlock?: () => void;
}

export function BuddyListItem({ buddy, onRemove, onBlock }: BuddyListItemProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const displayName = buddy.buddy_profile?.display_name || 'Anonymous Walker';
  const avatarUrl = buddy.buddy_profile?.avatar_url;

  // Calculate "last active" status (placeholder - would need real data)
  const lastActiveText = 'Active recently';

  return (
    <View testID="buddy-list-item" style={styles.container}>
      <TouchableOpacity style={styles.content} activeOpacity={0.7}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image testID="avatar-image" source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View testID="avatar-placeholder" style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={28} color={colors.text.disabled} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text testID="display-name" style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text testID="status-text" style={styles.status} numberOfLines={1}>
            {lastActiveText}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Block Button */}
          {onBlock && (
            <TouchableOpacity
              testID="block-button"
              style={styles.actionButton}
              onPress={onBlock}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              accessibilityLabel="Block buddy"
              accessibilityRole="button"
            >
              <Feather name="slash" size={20} color={colors.status.warning} />
            </TouchableOpacity>
          )}

          {/* Remove Button */}
          <TouchableOpacity
            testID="remove-button"
            style={styles.actionButton}
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            accessibilityLabel="Remove buddy"
            accessibilityRole="button"
          >
            <Feather name="user-minus" size={20} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
      marginBottom: 1,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
      backgroundColor: colors.background.primary,
    },
    avatarContainer: {
      marginRight: Layout.spacing.md,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    avatarPlaceholder: {
      backgroundColor: colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs / 2,
    },
    status: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
    actions: {
      flexDirection: 'row',
      gap: Layout.spacing.sm,
    },
    actionButton: {
      padding: Layout.spacing.sm,
    },
  });

