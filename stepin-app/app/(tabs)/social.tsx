/**
 * Social Tab Screen
 * Unified tab combining Buddies and Activity Feed with segmented control
 * Phase 2: UX/UI Polish
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import { useSocialStore } from '../../lib/store/socialStore';
import { useAuthStore } from '../../lib/store/authStore';
import { BuddyListItem } from '../../components/BuddyListItem';
import { PendingRequestCard } from '../../components/PendingRequestCard';
import { AddBuddyModal } from '../../components/AddBuddyModal';
import { ActivityCard } from '../../components/ActivityCard';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

type SegmentType = 'buddies' | 'feed';

function SocialScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const {
    buddies,
    pendingRequests,
    activityFeed,
    loading,
    error,
    loadBuddies,
    loadActivityFeed,
    acceptBuddyRequest,
    declineBuddyRequest,
    removeBuddy,
    giveKudos,
    removeKudos,
    deleteActivity,
    clearError,
  } = useSocialStore();

  const [selectedSegment, setSelectedSegment] = useState<SegmentType>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [addBuddyModalVisible, setAddBuddyModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadBuddies(user.id);
      loadActivityFeed(user.id);
    }
  }, [user]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    if (selectedSegment === 'buddies') {
      await loadBuddies(user.id);
    } else {
      await loadActivityFeed(user.id);
    }
    setRefreshing(false);
  };

  // Buddy handlers
  const handleAcceptRequest = async (requestId: string) => {
    await acceptBuddyRequest(requestId);
  };

  const handleDeclineRequest = async (requestId: string) => {
    Alert.alert(
      'Decline Buddy Request',
      'Are you sure you want to decline this buddy request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => declineBuddyRequest(requestId),
        },
      ]
    );
  };

  const handleRemoveBuddy = (buddyId: string, buddyName: string) => {
    Alert.alert(
      'Remove Buddy',
      `Are you sure you want to remove ${buddyName || 'this buddy'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeBuddy(buddyId),
        },
      ]
    );
  };

  // Feed handlers
  const handleKudosToggle = async (activityId: string, userGaveKudos: boolean) => {
    if (!user) return;

    if (userGaveKudos) {
      await removeKudos(activityId, user.id);
    } else {
      await giveKudos(activityId, user.id);
    }
  };

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

  // Filter buddies by search query
  const filteredBuddies = React.useMemo(() => {
    if (!searchQuery) return buddies;
    const query = searchQuery.toLowerCase();
    return buddies.filter(
      (buddy) =>
        buddy.display_name?.toLowerCase().includes(query) ||
        buddy.email?.toLowerCase().includes(query)
    );
  }, [buddies, searchQuery]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <Pressable
          style={[
            styles.segment,
            styles.segmentLeft,
            selectedSegment === 'feed' && styles.segmentActive,
          ]}
          onPress={() => setSelectedSegment('feed')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedSegment === 'feed' && styles.segmentTextActive,
            ]}
          >
            Feed
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.segment,
            styles.segmentRight,
            selectedSegment === 'buddies' && styles.segmentActive,
          ]}
          onPress={() => setSelectedSegment('buddies')}
        >
          <Text
            style={[
              styles.segmentText,
              selectedSegment === 'buddies' && styles.segmentTextActive,
            ]}
          >
            Buddies ({buddies.length})
          </Text>
        </Pressable>
      </View>

      {/* Buddies View */}
      {selectedSegment === 'buddies' && (
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={colors.text.disabled} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search buddies..."
              placeholderTextColor={colors.text.disabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={20} color={colors.text.disabled} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Add Buddy Button */}
          <TouchableOpacity
            style={styles.addBuddyButton}
            onPress={() => setAddBuddyModalVisible(true)}
          >
            <Feather name="user-plus" size={20} color={colors.text.inverse} />
            <Text style={styles.addBuddyButtonText}>Add Buddy</Text>
          </TouchableOpacity>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <View style={styles.pendingRequestsSection}>
              <Text style={styles.sectionTitle}>Pending Requests ({pendingRequests.length})</Text>
              {pendingRequests.map((request) => (
                <PendingRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ))}
            </View>
          )}

          {/* Buddies List */}
          <FlatList
            data={filteredBuddies}
            renderItem={({ item }) => (
              <BuddyListItem buddy={item} onRemove={handleRemoveBuddy} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary.main}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="users" size={64} color={colors.text.disabled} />
                <Text style={styles.emptyStateTitle}>No Buddies Yet</Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'No buddies match your search'
                    : 'Add friends to share your walking journey!'}
                </Text>
              </View>
            }
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={5}
          />
        </View>
      )}

      {/* Feed View */}
      {selectedSegment === 'feed' && (
        <FlatList
          data={activityFeed}
          renderItem={({ item }) => (
            <ActivityCard
              activity={item}
              currentUserId={user?.id || ''}
              onKudosToggle={handleKudosToggle}
              onDelete={handleDeleteActivity}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary.main}
            />
          }
          ListEmptyComponent={
            loading ? (
              <View>
                <SkeletonLoader width="100%" height={120} style={{ marginBottom: 16 }} />
                <SkeletonLoader width="100%" height={120} style={{ marginBottom: 16 }} />
                <SkeletonLoader width="100%" height={120} />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Feather name="activity" size={64} color={colors.text.disabled} />
                <Text style={styles.emptyStateTitle}>No Activities Yet</Text>
                <Text style={styles.emptyStateText}>
                  Your buddies' walking activities will appear here
                </Text>
              </View>
            )
          }
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={5}
        />
      )}

      {/* Add Buddy Modal */}
      <AddBuddyModal
        visible={addBuddyModalVisible}
        onClose={() => setAddBuddyModalVisible(false)}
      />
    </View>
  );
}

export default function SocialScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <SocialScreen />
    </ErrorBoundary>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: Layout.safeArea.top + Layout.spacing.medium,
    paddingHorizontal: Layout.spacing.large,
    paddingBottom: Layout.spacing.medium,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...Typography.largeTitle,
    color: colors.text.primary,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: Layout.spacing.large,
    marginTop: Layout.spacing.medium,
    marginBottom: Layout.spacing.medium,
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.medium,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: Layout.spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLeft: {
    borderTopLeftRadius: Layout.borderRadius.medium - 2,
    borderBottomLeftRadius: Layout.borderRadius.medium - 2,
  },
  segmentRight: {
    borderTopRightRadius: Layout.borderRadius.medium - 2,
    borderBottomRightRadius: Layout.borderRadius.medium - 2,
  },
  segmentActive: {
    backgroundColor: colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Layout.spacing.medium,
  },
  searchInput: {
    flex: 1,
    marginLeft: Layout.spacing.small,
    fontSize: 16,
    color: colors.text.primary,
  },
  addBuddyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Layout.spacing.medium,
    gap: Layout.spacing.small,
  },
  addBuddyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  pendingRequestsSection: {
    marginBottom: Layout.spacing.medium,
  },
  sectionTitle: {
    ...Typography.headline,
    color: colors.text.primary,
    marginHorizontal: Layout.spacing.large,
    marginBottom: Layout.spacing.small,
  },
  listContent: {
    paddingHorizontal: Layout.spacing.large,
    paddingBottom: Layout.spacing.xlarge,
  },
  feedContent: {
    paddingHorizontal: Layout.spacing.large,
    paddingTop: Layout.spacing.small,
    paddingBottom: Layout.spacing.xlarge,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxlarge * 2,
    paddingHorizontal: Layout.spacing.large,
  },
  emptyStateTitle: {
    ...Typography.title2,
    color: colors.text.primary,
    marginTop: Layout.spacing.large,
    marginBottom: Layout.spacing.small,
  },
  emptyStateText: {
    ...Typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
