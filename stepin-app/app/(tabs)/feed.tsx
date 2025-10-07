/**
 * Activity Feed Tab Screen
 * Phase 11: Non-Competitive Social Features
 * 
 * Displays buddy activities with kudos interactions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/themeManager';
import { useSocialStore } from '../../lib/store/socialStore';
import { useAuthStore } from '../../lib/store/authStore';
import { ActivityCard } from '../../components/ActivityCard';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

export default function FeedScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const {
    activityFeed,
    loading,
    error,
    loadActivityFeed,
    giveKudos,
    removeKudos,
    deleteActivity,
    clearError,
  } = useSocialStore();

  const [refreshing, setRefreshing] = useState(false);

  // Load activity feed on mount
  useEffect(() => {
    if (user) {
      loadActivityFeed(user.id);
    }
  }, [user]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await loadActivityFeed(user.id);
    setRefreshing(false);
  };

  // Handle kudos toggle
  const handleKudosToggle = async (activityId: string, userGaveKudos: boolean) => {
    if (!user) return;
    
    if (userGaveKudos) {
      await removeKudos(activityId, user.id);
    } else {
      await giveKudos(activityId, user.id);
    }
  };

  // Handle delete activity
  const handleDeleteActivity = (activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteActivity(activityId),
        },
      ]
    );
  };

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const styles = createStyles(colors);

  // Loading state
  if (loading && activityFeed.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Feed</Text>
        </View>
        <View style={styles.loadingContainer}>
          <SkeletonLoader height={120} style={styles.skeleton} />
          <SkeletonLoader height={120} style={styles.skeleton} />
          <SkeletonLoader height={120} style={styles.skeleton} />
        </View>
      </View>
    );
  }

  // Empty state
  if (!loading && activityFeed.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Feed</Text>
        </View>
        <View style={styles.emptyState}>
          <Feather name="activity" size={64} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>No Activities Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your buddies haven't shared any walks yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Feed</Text>
        <Text style={styles.headerSubtitle}>
          {activityFeed.length} {activityFeed.length === 1 ? 'activity' : 'activities'}
        </Text>
      </View>

      <FlatList
        data={activityFeed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            currentUserId={user?.id || ''}
            onKudosToggle={() => handleKudosToggle(item.id, item.user_gave_kudos)}
            onDelete={() => handleDeleteActivity(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      padding: Layout.spacing.lg,
      paddingTop: Layout.spacing.xl + 44, // Account for status bar
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: Typography.fontSize['2xl'],
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs,
    },
    headerSubtitle: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
    loadingContainer: {
      padding: Layout.spacing.lg,
    },
    skeleton: {
      marginBottom: Layout.spacing.md,
    },
    listContent: {
      paddingVertical: Layout.spacing.md,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Layout.spacing.xl,
    },
    emptyTitle: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
      marginTop: Layout.spacing.lg,
      marginBottom: Layout.spacing.sm,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: Typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
    },
  });

