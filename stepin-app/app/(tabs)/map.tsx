/**
 * Map Tab Screen
 * Displays all GPS-tracked walks on an interactive map
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MapView from '@/components/MapView';
import { useAuthStore } from '@/lib/store/authStore';
import type { AuthStore } from '@/lib/store/authStore';
import { fetchWalks } from '@/lib/utils/fetchHistoryData';
import type { Walk } from '@/types/database';
import { useTheme } from '@/lib/theme/themeManager';

export default function MapScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state: AuthStore) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walksWithRoutes, setWalksWithRoutes] = useState<Walk[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadWalks = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      
      // Calculate date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // Fetch walks
      const walks = await fetchWalks(user.id, { startDate, endDate });

      // Filter walks that have GPS routes
      const walksWithGPS = walks.filter(
        (walk: Walk) => walk.route_coordinates && walk.route_coordinates.length > 0
      );
      
      setWalksWithRoutes(walksWithGPS);
    } catch (err) {
      console.error('Error loading walks:', err);
      setError('Failed to load routes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalks();
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalks();
  };

  const handleStartWalk = () => {
    router.push('/(tabs)/');
  };

  // Extract data for MapView
  const routes = walksWithRoutes
    .map((walk) => walk.route_coordinates)
    .filter((coords): coords is NonNullable<typeof coords> => coords !== undefined);
  
  const startLocations = walksWithRoutes
    .map((walk) => walk.start_location)
    .filter((loc): loc is NonNullable<typeof loc> => loc !== undefined);
  
  const endLocations = walksWithRoutes
    .map((walk) => walk.end_location)
    .filter((loc): loc is NonNullable<typeof loc> => loc !== undefined);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading routes...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.primary }]}>
        <Feather name="alert-circle" size={64} color={colors.status.error} />
        <Text style={[styles.errorTitle, { color: colors.text.primary }]}>
          Oops!
        </Text>
        <Text style={[styles.errorMessage, { color: colors.text.secondary }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
          onPress={loadWalks}
        >
          <Text style={[styles.retryButtonText, { color: colors.text.inverse }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (walksWithRoutes.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        <View style={styles.emptyState}>
          <Feather name="map" size={64} color={colors.text.disabled} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            No routes yet
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.text.secondary }]}>
            Start a walk to see your routes here
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
            Your walking paths will appear on this map
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary.main }]}
            onPress={handleStartWalk}
          >
            <Feather name="play" size={20} color={colors.text.inverse} />
            <Text style={[styles.startButtonText, { color: colors.text.inverse }]}>
              Start a Walk
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Map with routes
  return (
    <View style={styles.container}>
      <MapView
        routes={routes}
        startLocations={startLocations}
        endLocations={endLocations}
        showUserLocation={true}
        style={styles.map}
      />
      
      {/* Route count badge */}
      <View style={[styles.badge, { backgroundColor: colors.background.primary }]}>
        <Feather name="map-pin" size={16} color={colors.primary.main} />
        <Text style={[styles.badgeText, { color: colors.text.primary }]}>
          {walksWithRoutes.length} {walksWithRoutes.length === 1 ? 'route' : 'routes'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

