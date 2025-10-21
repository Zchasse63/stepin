/**
 * Map Tab Screen
 * Displays all GPS-tracked walks on an interactive map or list
 * Phase 2: Enhanced with Map/List toggle and date filters
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import MapView from '@/components/MapView';
import { useAuthStore } from '@/lib/store/authStore';
import type { AuthStore } from '@/lib/store/authStore';
import { fetchWalks } from '@/lib/utils/fetchHistoryData';
import type { Walk } from '@/types/database';
import { useTheme, ThemeColors } from '@/lib/theme/themeManager';
import { Layout } from '@/constants/Layout';
import { Typography } from '@/constants/Typography';
import { formatDistance } from '@/lib/utils/formatDistance';
import { useProfileStore } from '@/lib/store/profileStore';

type ViewMode = 'map' | 'list';
type DateFilter = '7days' | '30days' | '90days' | 'all';

function MapScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state: AuthStore) => state.user);
  const { profile } = useProfileStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walksWithRoutes, setWalksWithRoutes] = useState<Walk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate date range based on filter
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (dateFilter) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(2020, 0, 1); // Start from 2020
        break;
    }

    return { startDate, endDate };
  };

  const loadWalks = async () => {
    if (!user?.id) return;

    try {
      setError(null);

      // Get date range based on filter
      const { startDate, endDate } = getDateRange();

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
  }, [user?.id, dateFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalks();
  };

  const handleStartWalk = () => {
    router.push('/(tabs)/');
  };

  // Get date filter label
  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      case 'all':
        return 'All Time';
    }
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

  // Format walk for list view
  const formatWalkDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatWalkTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleTimeString('en-US', options);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

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

  // Map/List content with routes
  return (
    <View style={styles.container}>
      {/* Header with controls */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Routes</Text>

        {/* View toggle and date filter */}
        <View style={styles.controls}>
          {/* Map/List Toggle */}
          <View style={styles.viewToggle}>
            <Pressable
              style={[
                styles.toggleButton,
                styles.toggleButtonLeft,
                viewMode === 'map' && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('map')}
            >
              <Feather
                name="map"
                size={16}
                color={viewMode === 'map' ? colors.text.inverse : colors.text.secondary}
              />
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                styles.toggleButtonRight,
                viewMode === 'list' && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('list')}
            >
              <Feather
                name="list"
                size={16}
                color={viewMode === 'list' ? colors.text.inverse : colors.text.secondary}
              />
            </Pressable>
          </View>

          {/* Date Filter */}
          <TouchableOpacity
            style={styles.dateFilterButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Text style={styles.dateFilterText}>{getDateFilterLabel()}</Text>
            <Feather
              name={showDatePicker ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Filter Dropdown */}
      {showDatePicker && (
        <View style={styles.datePickerDropdown}>
          {['7days', '30days', '90days', 'all'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.dateOption,
                dateFilter === filter && styles.dateOptionActive,
              ]}
              onPress={() => {
                setDateFilter(filter as DateFilter);
                setShowDatePicker(false);
              }}
            >
              <Text
                style={[
                  styles.dateOptionText,
                  dateFilter === filter && styles.dateOptionTextActive,
                ]}
              >
                {filter === '7days' && 'Last 7 Days'}
                {filter === '30days' && 'Last 30 Days'}
                {filter === '90days' && 'Last 90 Days'}
                {filter === 'all' && 'All Time'}
              </Text>
              {dateFilter === filter && (
                <Feather name="check" size={16} color={colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <>
          <MapView
            routes={routes}
            startLocations={startLocations}
            endLocations={endLocations}
            showUserLocation={true}
            style={styles.map}
          />

          {/* Route count badge */}
          <View style={styles.badge}>
            <Feather name="map-pin" size={16} color={colors.primary.main} />
            <Text style={styles.badgeText}>
              {walksWithRoutes.length} {walksWithRoutes.length === 1 ? 'route' : 'routes'}
            </Text>
          </View>
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <FlatList
          data={walksWithRoutes}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem}>
              <View style={styles.listItemIcon}>
                <Feather name="map-pin" size={20} color={colors.primary.main} />
              </View>
              <View style={styles.listItemContent}>
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemDate}>{formatWalkDate(item.date)}</Text>
                  <Text style={styles.listItemTime}>{formatWalkTime(item.date)}</Text>
                </View>
                <View style={styles.listItemStats}>
                  <View style={styles.listItemStat}>
                    <Feather name="navigation" size={14} color={colors.text.secondary} />
                    <Text style={styles.listItemStatText}>
                      {formatDistance(item.distance_meters || 0, profile?.units_preference || 'miles')}
                    </Text>
                  </View>
                  <View style={styles.listItemStat}>
                    <Feather name="clock" size={14} color={colors.text.secondary} />
                    <Text style={styles.listItemStatText}>{item.duration_minutes} min</Text>
                  </View>
                  {item.route_coordinates && (
                    <View style={styles.listItemStat}>
                      <Feather name="map" size={14} color={colors.text.secondary} />
                      <Text style={styles.listItemStatText}>
                        {item.route_coordinates.length} points
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.text.disabled} />
            </TouchableOpacity>
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
            <View style={styles.emptyListState}>
              <Feather name="map" size={48} color={colors.text.disabled} />
              <Text style={styles.emptyListTitle}>No routes in this period</Text>
              <Text style={styles.emptyListText}>
                Try selecting a different time range
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
      )}
    </View>
  );
}

export default function MapScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <MapScreen />
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
    marginBottom: Layout.spacing.medium,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.small,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.medium,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  toggleButtonLeft: {
    borderTopLeftRadius: Layout.borderRadius.medium - 2,
    borderBottomLeftRadius: Layout.borderRadius.medium - 2,
  },
  toggleButtonRight: {
    borderTopRightRadius: Layout.borderRadius.medium - 2,
    borderBottomRightRadius: Layout.borderRadius.medium - 2,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary.main,
  },
  dateFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small + 2,
    borderRadius: Layout.borderRadius.medium,
  },
  dateFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  datePickerDropdown: {
    backgroundColor: colors.background.tertiary,
    marginHorizontal: Layout.spacing.large,
    marginTop: Layout.spacing.small,
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dateOptionActive: {
    backgroundColor: colors.background.primary,
  },
  dateOptionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  dateOptionTextActive: {
    fontWeight: '600',
    color: colors.primary.main,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.large,
  },
  loadingText: {
    ...Typography.body,
    color: colors.text.secondary,
    marginTop: Layout.spacing.medium,
  },
  errorTitle: {
    ...Typography.title1,
    color: colors.text.primary,
    marginTop: Layout.spacing.medium,
  },
  errorMessage: {
    ...Typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: Layout.spacing.small,
    marginBottom: Layout.spacing.large,
  },
  retryButton: {
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: colors.primary.main,
  },
  retryButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.large,
  },
  emptyTitle: {
    ...Typography.title1,
    color: colors.text.primary,
    marginTop: Layout.spacing.medium,
  },
  emptyMessage: {
    ...Typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: Layout.spacing.small,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Layout.spacing.large,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.medium,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: colors.primary.main,
    gap: Layout.spacing.small,
  },
  startButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  map: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: Layout.spacing.medium,
    right: Layout.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.medium,
    paddingVertical: Layout.spacing.small,
    borderRadius: 20,
    gap: 6,
    backgroundColor: colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: Layout.spacing.large,
    paddingVertical: Layout.spacing.medium,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.large,
    padding: Layout.spacing.medium,
    marginBottom: Layout.spacing.medium,
    minHeight: Layout.touchTarget.listItem,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.medium,
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  listItemDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  listItemTime: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  listItemStats: {
    flexDirection: 'row',
    gap: Layout.spacing.medium,
  },
  listItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listItemStatText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  emptyListState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxlarge * 2,
  },
  emptyListTitle: {
    ...Typography.title3,
    color: colors.text.primary,
    marginTop: Layout.spacing.medium,
  },
  emptyListText: {
    ...Typography.body,
    color: colors.text.secondary,
    marginTop: Layout.spacing.small,
  },
});

