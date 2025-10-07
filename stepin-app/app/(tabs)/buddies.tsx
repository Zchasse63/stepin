/**
 * Buddies Tab Screen
 * Phase 11: Non-Competitive Social Features
 * 
 * Displays buddy list, pending requests, and add buddy functionality
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/themeManager';
import { useSocialStore } from '../../lib/store/socialStore';
import { useAuthStore } from '../../lib/store/authStore';
import { BuddyListItem } from '../../components/BuddyListItem';
import { PendingRequestCard } from '../../components/PendingRequestCard';
import { AddBuddyModal } from '../../components/AddBuddyModal';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

export default function BuddiesScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const {
    buddies,
    pendingRequests,
    loading,
    error,
    loadBuddies,
    acceptBuddyRequest,
    declineBuddyRequest,
    removeBuddy,
    clearError,
  } = useSocialStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [addBuddyModalVisible, setAddBuddyModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load buddies on mount
  useEffect(() => {
    if (user) {
      loadBuddies(user.id);
    }
  }, [user]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await loadBuddies(user.id);
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Buddies</Text>
        <Text style={styles.headerSubtitle}>
          {buddies.length} {buddies.length === 1 ? 'buddy' : 'buddies'}
        </Text>
      </View>

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
        onPress={() => setAddBuddyModalVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="user-plus" size={24} color={colors.text.inverse} />
      </TouchableOpacity>

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
  });

