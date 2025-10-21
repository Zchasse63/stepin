/**
 * Buddies Tab Screen
 * Phase 11: Non-Competitive Social Features
 *
 * Displays buddy list, pending requests, activity feed with tabbed interface
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
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../lib/theme/themeManager';
import { useSocialStore } from '../../lib/store/socialStore';
import { useAuthStore } from '../../lib/store/authStore';
import { BuddyListItem } from '../../components/BuddyListItem';
import { PendingRequestCard } from '../../components/PendingRequestCard';
import { AddBuddyModal } from '../../components/AddBuddyModal';
import { InviteFriend } from '../../components/InviteFriend';
import { ActivityCard } from '../../components/ActivityCard';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

export default function BuddiesScreen() {
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
    blockBuddy,
    giveKudos,
    removeKudos,
    deleteActivity,
    clearError,
  } = useSocialStore();

  const [activeTab, setActiveTab] = useState<'activity' | 'buddies'>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [addBuddyModalVisible, setAddBuddyModalVisible] = useState(false);
  const [discoveryModalVisible, setDiscoveryModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load buddies and activity feed on mount
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
    if (activeTab === 'activity') {
      await loadActivityFeed(user.id);
    } else {
      await loadBuddies(user.id);
    }
    setRefreshing(false);
  };

  // Handle accept buddy request
  const handleAcceptRequest = async (requestId: string) => {
    await acceptBuddyRequest(requestId);
  };

  // Handle decline buddy request
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

  // Handle remove buddy
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

  // Handle block buddy
  const handleBlockBuddy = (buddyId: string, buddyName: string) => {
    Alert.alert(
      'Block Buddy',
      `Are you sure you want to block ${buddyName || 'this buddy'}? They won't be able to send you requests or see your activity.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockBuddy(buddyId);
              Alert.alert('Blocked', `${buddyName || 'Buddy'} has been blocked.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to block buddy. Please try again.');
            }
          },
        },
      ]
    );
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

  // Filter buddies by search query
  const filteredBuddies = buddies.filter((buddy) => {
    if (!searchQuery) return true;
    const name = buddy.buddy_profile?.display_name || '';
    const email = buddy.buddy_profile?.email || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const styles = createStyles(colors);

  // Empty state
  if (!loading && buddies.length === 0 && pendingRequests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Feather name="users" size={64} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>Walking is better with friends!</Text>
          <Text style={styles.emptySubtitle}>Invite someone to join you</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setAddBuddyModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyButtonText}>Add Buddy</Text>
          </TouchableOpacity>
        </View>

        <AddBuddyModal
          visible={addBuddyModalVisible}
          onClose={() => setAddBuddyModalVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'buddies' && styles.activeTab]}
          onPress={() => setActiveTab('buddies')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'buddies' && styles.activeTabText]}>
            My Buddies
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activity Feed Tab */}
      {activeTab === 'activity' && (
        <>
          {loading && activityFeed.length === 0 ? (
            <View style={styles.loadingContainer}>
              <SkeletonLoader height={120} style={styles.skeleton} />
              <SkeletonLoader height={120} style={styles.skeleton} />
              <SkeletonLoader height={120} style={styles.skeleton} />
            </View>
          ) : activityFeed.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="activity" size={64} color={colors.text.disabled} />
              <Text style={styles.emptyTitle}>No Activities Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your buddies haven't shared any walks yet
              </Text>
            </View>
          ) : (
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
          )}
        </>
      )}

      {/* My Buddies Tab */}
      {activeTab === 'buddies' && (
        <>
          {/* Search Bar */}
          {buddies.length > 0 && (
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color={colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search buddies..."
                placeholderTextColor={colors.text.disabled}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={filteredBuddies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BuddyListItem
                buddy={item}
                onRemove={() =>
                  handleRemoveBuddy(item.id, item.buddy_profile?.display_name || 'this buddy')
                }
                onBlock={() =>
                  handleBlockBuddy(item.buddy_id, item.buddy_profile?.display_name || 'this buddy')
                }
              />
            )}
            ListHeaderComponent={
              pendingRequests.length > 0 ? (
                <View style={styles.pendingSection}>
                  <Text style={styles.sectionTitle}>
                    Pending Requests ({pendingRequests.length})
                  </Text>
                  {pendingRequests.map((request) => (
                    <PendingRequestCard
                      key={request.id}
                      request={request}
                      onAccept={() => handleAcceptRequest(request.id)}
                      onDecline={() => handleDeclineRequest(request.id)}
                    />
                  ))}
                </View>
              ) : null
            }
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

          {/* Floating Action Button */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary.main }]}
            onPress={() => setDiscoveryModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        </>
      )}

      {/* Buddy Discovery Modal */}
      <Modal
        visible={discoveryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDiscoveryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Buddies</Text>
            <TouchableOpacity onPress={() => setDiscoveryModalVisible(false)}>
              <Feather name="x" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* QR Code Options */}
            <View style={styles.discoverySection}>
              <Text style={styles.sectionTitle}>Quick Connect</Text>

              <TouchableOpacity
                style={styles.discoveryOption}
                onPress={() => {
                  setDiscoveryModalVisible(false);
                  router.push('/modals/show-qr');
                }}
              >
                <View style={styles.optionIcon}>
                  <Feather name="maximize" size={24} color={colors.primary.main} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Show My QR Code</Text>
                  <Text style={styles.optionDescription}>
                    Let someone scan your code to connect
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.disabled} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.discoveryOption}
                onPress={() => {
                  setDiscoveryModalVisible(false);
                  router.push('/modals/qr-scan');
                }}
              >
                <View style={styles.optionIcon}>
                  <Feather name="camera" size={24} color={colors.primary.main} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Scan QR Code</Text>
                  <Text style={styles.optionDescription}>
                    Scan someone's code to connect
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.disabled} />
              </TouchableOpacity>
            </View>

            {/* Search Options */}
            <View style={styles.discoverySection}>
              <Text style={styles.sectionTitle}>Find Friends</Text>

              <TouchableOpacity
                style={styles.discoveryOption}
                onPress={() => {
                  setDiscoveryModalVisible(false);
                  router.push('/modals/buddy-search');
                }}
              >
                <View style={styles.optionIcon}>
                  <Feather name="search" size={24} color={colors.primary.main} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Search by Username</Text>
                  <Text style={styles.optionDescription}>
                    Find friends by their username or email
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.disabled} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.discoveryOption}
                onPress={() => {
                  setDiscoveryModalVisible(false);
                  router.push('/modals/contacts-sync');
                }}
              >
                <View style={styles.optionIcon}>
                  <Feather name="users" size={24} color={colors.primary.main} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Sync Contacts</Text>
                  <Text style={styles.optionDescription}>
                    Find friends from your contacts (privacy-first)
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.disabled} />
              </TouchableOpacity>
            </View>

            {/* Invite Friends */}
            <View style={styles.discoverySection}>
              <Text style={styles.sectionTitle}>Invite to Stepin</Text>
              <InviteFriend />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <AddBuddyModal
        visible={addBuddyModalVisible}
        onClose={() => setAddBuddyModalVisible(false)}
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
    tabSelector: {
      flexDirection: 'row',
      paddingHorizontal: Layout.spacing.lg,
      paddingTop: Layout.spacing.md,
      paddingBottom: 0,
      backgroundColor: colors.background.primary,
    },
    tab: {
      flex: 1,
      paddingVertical: Layout.spacing.md,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary.main,
    },
    tabText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text.secondary,
    },
    activeTabText: {
      fontWeight: Typography.fontWeight.semibold,
      color: colors.primary.main,
    },
    loadingContainer: {
      padding: Layout.spacing.lg,
    },
    skeleton: {
      marginBottom: Layout.spacing.md,
    },
    header: {
      padding: Layout.spacing.lg,
      paddingTop: Layout.spacing.xl + 44, // Account for status bar
      backgroundColor: colors.background.primary,
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      marginHorizontal: Layout.spacing.lg,
      marginBottom: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.md,
      paddingVertical: Layout.spacing.sm,
      borderRadius: Layout.borderRadius.md,
      gap: Layout.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: Typography.fontSize.md,
      color: colors.text.primary,
      padding: 0,
    },
    pendingSection: {
      marginBottom: Layout.spacing.lg,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.status.warning,
      marginBottom: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
    },
    listContent: {
      paddingBottom: 100, // Space for FAB
    },
    fab: {
      position: 'absolute',
      right: Layout.spacing.lg,
      bottom: Layout.spacing.xl + 34, // Account for tab bar
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
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
      marginBottom: Layout.spacing.xl,
      textAlign: 'center',
    },
    emptyButton: {
      backgroundColor: colors.primary.main,
      paddingHorizontal: Layout.spacing.xl,
      paddingVertical: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
    },
    emptyButtonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.inverse,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Layout.spacing.lg,
      paddingTop: Layout.spacing.xl + 44,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    modalTitle: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
    },
    modalContent: {
      flex: 1,
    },
    discoverySection: {
      marginTop: Layout.spacing.lg,
      paddingHorizontal: Layout.spacing.lg,
    },
    discoveryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      marginBottom: Layout.spacing.sm,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Layout.spacing.md,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
  });

