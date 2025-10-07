/**
 * Walks List Component
 * FlatList with pagination for displaying walks
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import WalkListItem from './WalkListItem';
import { Walk, DailyStats } from '../types/database';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import type { UnitsPreference } from '../types/profile';

interface WalksListProps {
  walks: Walk[];
  dailyStats: DailyStats[];
  stepGoal: number;
  units?: UnitsPreference;
  onWalkPress?: (walk: Walk) => void;
  onWalkDelete?: (walk: Walk) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export default function WalksList({
  walks,
  dailyStats,
  stepGoal,
  units = 'miles',
  onWalkPress,
  onWalkDelete,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: WalksListProps) {
  const { colors } = useTheme();
  // Create a map of date -> goal met status
  const goalMetMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    dailyStats.forEach(stat => {
      map.set(stat.date, stat.goal_met);
    });
    return map;
  }, [dailyStats]);

  const renderItem = useCallback(
    ({ item }: { item: Walk }) => {
      const goalMet = goalMetMap.get(item.date) || false;
      return (
        <WalkListItem
          walk={item}
          goalMet={goalMet}
          units={units}
          onPress={onWalkPress}
          onDelete={onWalkDelete}
        />
      );
    },
    [goalMetMap, units, onWalkPress, onWalkDelete]
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary.main} />
        <Text style={styles.footerText}>Loading more walks...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No walks logged yet</Text>
      <Text style={styles.emptySubtext}>
        Start walking and log your first walk!
      </Text>
    </View>
  );

  const handleEndReached = () => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Walks</Text>
      <FlatList
        data={walks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        scrollEnabled={false} // Disable scroll since it's inside a ScrollView
        style={styles.list}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginHorizontal: Layout.spacing.medium,
    marginVertical: Layout.spacing.small,
    borderRadius: Layout.borderRadius.large,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    ...Typography.headline,
    color: colors.text.primary,
    padding: Layout.spacing.medium,
    paddingBottom: Layout.spacing.small,
  },
  list: {
    flexGrow: 0,
  },
  footer: {
    padding: Layout.spacing.medium,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.caption1,
    color: colors.text.secondary,
    marginTop: Layout.spacing.small,
  },
  emptyContainer: {
    padding: Layout.spacing.xxlarge,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: Layout.spacing.small,
  },
  emptySubtext: {
    ...Typography.caption1,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});

