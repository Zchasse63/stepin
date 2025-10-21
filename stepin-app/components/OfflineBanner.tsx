/**
 * Offline Banner Component
 * Shows when the device is offline with reconnection status
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../lib/utils/logger';
import { getQueueStats, type OfflineQueueStats } from '../lib/offline/offlineQueue';
import { syncOfflineQueue, subscribeSyncProgress, type SyncProgress } from '../lib/offline/syncManager';

const LAST_SYNC_KEY = 'last_sync_time';

export function OfflineBanner() {
  const { colors } = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [queueStats, setQueueStats] = useState<OfflineQueueStats>({ totalPending: 0, failedCount: 0 });
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected || !state.isInternetReachable;
      setIsOffline(offline);

      if (!offline) {
        // When back online, update last sync time
        updateLastSyncTime();
        // Auto-dismiss after 2 seconds when back online
        setTimeout(() => {
          setIsDismissed(true);
        }, 2000);
      } else {
        // Show banner when offline
        setIsDismissed(false);
      }
    });

    // Load last sync time
    loadLastSyncTime();
    // Load queue stats
    loadQueueStats();

    return () => unsubscribe();
  }, []);

  // Subscribe to sync progress
  useEffect(() => {
    const unsubscribe = subscribeSyncProgress((progress) => {
      setSyncProgress(progress);
      if (progress.status === 'complete') {
        loadQueueStats();
        updateLastSyncTime();
      }
    });

    return unsubscribe;
  }, []);

  // Refresh queue stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadQueueStats();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Animate banner in/out
  useEffect(() => {
    if (isOffline && !isDismissed) {
      // Slide in
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      // Slide out
      translateY.value = withTiming(-100, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      opacity.value = withTiming(0, {
        duration: 200,
      });
    }
  }, [isOffline, isDismissed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const loadLastSyncTime = async () => {
    try {
      const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (time) {
        setLastSyncTime(formatSyncTime(time));
      }
    } catch (error) {
      logger.error('Error loading last sync time:', error);
    }
  };

  const updateLastSyncTime = async () => {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);
      setLastSyncTime(formatSyncTime(now));
    } catch (error) {
      logger.error('Error updating last sync time:', error);
    }
  };

  const formatSyncTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const loadQueueStats = async () => {
    try {
      const stats = await getQueueStats();
      setQueueStats(stats);
    } catch (error) {
      logger.error('Error loading queue stats:', error);
    }
  };

  const handleSyncNow = async () => {
    try {
      logger.info('Manual sync triggered');
      await syncOfflineQueue();
      await loadQueueStats();
    } catch (error) {
      logger.error('Error syncing offline queue:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Show banner if offline OR if there are pending items
  const shouldShow = (isOffline || queueStats.totalPending > 0) && !isDismissed;

  if (!shouldShow) {
    return null;
  }

  const isSyncing = syncProgress?.status === 'syncing';
  const hasPendingItems = queueStats.totalPending > 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isOffline ? colors.status.warning : hasPendingItems ? colors.status.info : colors.status.success,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={isOffline ? 'cloud-offline' : hasPendingItems ? 'sync' : 'cloud-done'}
          size={20}
          color="#FFFFFF"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isOffline
              ? "You're offline"
              : isSyncing
              ? 'Syncing...'
              : hasPendingItems
              ? `${queueStats.totalPending} pending ${queueStats.totalPending === 1 ? 'item' : 'items'}`
              : 'Back online'}
          </Text>
          <Text style={styles.subtitle}>
            {isOffline
              ? lastSyncTime
                ? `Last synced ${lastSyncTime}`
                : 'Data will sync when connected'
              : isSyncing
              ? `${syncProgress.completed} of ${syncProgress.total} synced`
              : hasPendingItems
              ? 'Tap to sync now'
              : 'All data synced'}
          </Text>
        </View>

        {/* Sync Now button when online and has pending items */}
        {!isOffline && hasPendingItems && !isSyncing && (
          <TouchableOpacity
            onPress={handleSyncNow}
            style={styles.syncButton}
            accessibilityLabel="Sync now"
            accessibilityRole="button"
          >
            <Ionicons name="sync-outline" size={18} color="#FFFFFF" />
            <Text style={styles.syncButtonText}>Sync</Text>
          </TouchableOpacity>
        )}

        {/* Dismiss button */}
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Dismiss banner"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    paddingHorizontal: Layout.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
  },
  title: {
    ...Typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.caption1,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  dismissButton: {
    padding: Layout.spacing.xs,
    marginLeft: Layout.spacing.sm,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
    marginLeft: Layout.spacing.sm,
  },
  syncButtonText: {
    ...Typography.caption1,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

