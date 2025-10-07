/**
 * Activity Card Component
 * Phase 11: Non-Competitive Social Features
 * 
 * Displays an activity with user info, description, and kudos
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { ActivityFeedItemWithDetails, WalkCompletedData } from '../types/social';
import { KudosButton } from './KudosButton';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface ActivityCardProps {
  activity: ActivityFeedItemWithDetails;
  currentUserId: string;
  onKudosToggle: () => void;
  onDelete: () => void;
}

export function ActivityCard({
  activity,
  currentUserId,
  onKudosToggle,
  onDelete,
}: ActivityCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const isOwnActivity = activity.user_id === currentUserId;
  const displayName = activity.user_profile?.display_name || 'Anonymous Walker';
  const avatarUrl = activity.user_profile?.avatar_url;

  // Format timestamp
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  // Get activity description
  const getActivityDescription = () => {
    switch (activity.activity_type) {
      case 'walk_completed': {
        const data = activity.activity_data as WalkCompletedData;
        const duration = Math.round(data.duration_minutes);
        return (
          <Text style={styles.description}>
            completed a walk {data.feeling}
            {data.note && (
              <Text style={styles.note}>{'\n'}{data.note}</Text>
            )}
            {'\n'}
            <Text style={styles.walkDetails}>
              {duration} {duration === 1 ? 'minute' : 'minutes'}
              {data.distance_meters && ` • ${(data.distance_meters / 1609.34).toFixed(2)} mi`}
            </Text>
          </Text>
        );
      }
      case 'streak_milestone': {
        const data = activity.activity_data as any;
        return (
          <Text style={styles.description}>
            reached a <Text style={styles.highlight}>{data.streak_days} day streak</Text> 🔥
          </Text>
        );
      }
      case 'goal_achieved': {
        const data = activity.activity_data as any;
        return (
          <Text style={styles.description}>
            achieved their <Text style={styles.highlight}>{data.goal_type} goal</Text> 🎯
          </Text>
        );
      }
      default:
        return <Text style={styles.description}>shared an activity</Text>;
    }
  };

  // Get visibility icon
  const getVisibilityIcon = () => {
    switch (activity.visibility) {
      case 'private':
        return <Feather name="lock" size={14} color={colors.text.disabled} />;
      case 'public':
        return <Feather name="globe" size={14} color={colors.text.disabled} />;
      case 'buddies':
      default:
        return <Feather name="users" size={14} color={colors.text.disabled} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={20} color={colors.text.disabled} />
            </View>
          )}
        </View>

        {/* User info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <View style={styles.metadata}>
            <Text style={styles.timestamp}>{getTimeAgo(activity.created_at)}</Text>
            <View style={styles.dot} />
            {getVisibilityIcon()}
          </View>
        </View>

        {/* Delete button (only for own activities) */}
        {isOwnActivity && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Activity description */}
      <View style={styles.content}>
        {getActivityDescription()}
      </View>

      {/* Footer with kudos */}
      <View style={styles.footer}>
        <KudosButton
          kudosCount={activity.kudos_count}
          userGaveKudos={activity.user_gave_kudos}
          onToggle={onKudosToggle}
          disabled={isOwnActivity} // Can't give kudos to own activities
        />
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
      marginHorizontal: Layout.spacing.lg,
      marginBottom: Layout.spacing.md,
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Layout.spacing.sm,
    },
    avatarContainer: {
      marginRight: Layout.spacing.sm,
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
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs / 2,
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Layout.spacing.xs,
    },
    timestamp: {
      fontSize: Typography.fontSize.xs,
      color: colors.text.secondary,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.text.disabled,
    },
    deleteButton: {
      padding: Layout.spacing.xs,
    },
    content: {
      marginBottom: Layout.spacing.sm,
    },
    description: {
      fontSize: Typography.fontSize.md,
      color: colors.text.primary,
      lineHeight: 22,
    },
    note: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      fontStyle: 'italic',
    },
    walkDetails: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
    highlight: {
      fontWeight: Typography.fontWeight.semibold,
      color: colors.primary.main,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: Layout.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
  });

