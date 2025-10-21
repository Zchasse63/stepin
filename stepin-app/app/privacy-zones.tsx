/**
 * Privacy Zones Settings Screen
 * Manage geographic zones where GPS tracking is hidden
 * Phase 3: Privacy Features
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store/authStore';
import { useTheme } from '../lib/theme/themeManager';
import { PrivacyZones, PrivacyZone } from '../components/PrivacyZones';
import { ErrorBoundary } from '../components/ErrorBoundary';

function PrivacyZonesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [zones, setZones] = useState<PrivacyZone[]>([]);
  const [loading, setLoading] = useState(true);

  // Load privacy zones on mount
  useEffect(() => {
    if (user) {
      loadPrivacyZones();
    }
  }, [user]);

  const loadPrivacyZones = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('privacy_zones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setZones(data || []);
    } catch (error) {
      console.error('Error loading privacy zones:', error);
      Alert.alert('Error', 'Failed to load privacy zones. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async (
    zone: Omit<PrivacyZone, 'id' | 'user_id' | 'created_at'>
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('privacy_zones')
        .insert({
          user_id: user.id,
          name: zone.name,
          address: zone.address,
          latitude: zone.latitude,
          longitude: zone.longitude,
          radius_meters: zone.radius_meters,
        })
        .select()
        .single();

      if (error) throw error;

      setZones((prev) => [data, ...prev]);
      Alert.alert('Success', 'Privacy zone added successfully');

      // Apply retroactively to existing walks
      await applyPrivacyZoneRetroactively(data.id);
    } catch (error) {
      console.error('Error adding privacy zone:', error);
      throw error;
    }
  };

  const handleEditZone = async (
    zoneId: string,
    updates: Partial<PrivacyZone>
  ) => {
    try {
      const { data, error } = await supabase
        .from('privacy_zones')
        .update(updates)
        .eq('id', zoneId)
        .select()
        .single();

      if (error) throw error;

      setZones((prev) =>
        prev.map((zone) => (zone.id === zoneId ? data : zone))
      );
      Alert.alert('Success', 'Privacy zone updated successfully');

      // Reapply to existing walks
      await applyPrivacyZoneRetroactively(zoneId);
    } catch (error) {
      console.error('Error updating privacy zone:', error);
      throw error;
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      const { error } = await supabase
        .from('privacy_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
      Alert.alert('Success', 'Privacy zone deleted successfully');

      // Remove privacy filtering from walks
      await removePrivacyZoneFromWalks(zoneId);
    } catch (error) {
      console.error('Error deleting privacy zone:', error);
      Alert.alert('Error', 'Failed to delete privacy zone. Please try again.');
    }
  };

  /**
   * Apply privacy zone filtering to existing walks
   * This will filter route points that fall within the zone
   */
  const applyPrivacyZoneRetroactively = async (zoneId: string) => {
    if (!user) return;

    try {
      // Get the zone details
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;

      // Get all walks for this user
      const { data: walks, error: walksError } = await supabase
        .from('walks')
        .select('id, route')
        .eq('user_id', user.id);

      if (walksError) throw walksError;

      // Filter route points for each walk
      const updates = walks?.map((walk) => {
        const route = walk.route as any;
        if (!route || !route.coordinates) return null;

        const filteredRoute = {
          ...route,
          coordinates: route.coordinates.map((point: any) => {
            // Calculate distance from zone center
            const distance = calculateDistance(
              point.latitude,
              point.longitude,
              zone.latitude,
              zone.longitude
            );

            // If point is within privacy zone, mark as private
            if (distance <= zone.radius_meters) {
              return { ...point, private: true };
            }
            return point;
          }),
        };

        return {
          id: walk.id,
          route: filteredRoute,
        };
      }).filter(Boolean);

      // Batch update walks
      if (updates && updates.length > 0) {
        for (const update of updates) {
          await supabase
            .from('walks')
            .update({ route: update.route })
            .eq('id', update.id);
        }
      }
    } catch (error) {
      console.error('Error applying privacy zone retroactively:', error);
    }
  };

  /**
   * Remove privacy filtering from walks when zone is deleted
   */
  const removePrivacyZoneFromWalks = async (zoneId: string) => {
    if (!user) return;

    try {
      // Get all walks for this user
      const { data: walks, error: walksError } = await supabase
        .from('walks')
        .select('id, route')
        .eq('user_id', user.id);

      if (walksError) throw walksError;

      // Remove private flag from route points
      const updates = walks?.map((walk) => {
        const route = walk.route as any;
        if (!route || !route.coordinates) return null;

        const cleanedRoute = {
          ...route,
          coordinates: route.coordinates.map((point: any) => {
            const { private: _, ...cleanPoint } = point;
            return cleanPoint;
          }),
        };

        return {
          id: walk.id,
          route: cleanedRoute,
        };
      }).filter(Boolean);

      // Batch update walks
      if (updates && updates.length > 0) {
        for (const update of updates) {
          await supabase
            .from('walks')
            .update({ route: update.route })
            .eq('id', update.id);
        }
      }
    } catch (error) {
      console.error('Error removing privacy zone from walks:', error);
    }
  };

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in meters
   */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Stack.Screen
          options={{
            title: 'Privacy Zones',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Stack.Screen
        options={{
          title: 'Privacy Zones',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <PrivacyZones
        zones={zones}
        onAddZone={handleAddZone}
        onEditZone={handleEditZone}
        onDeleteZone={handleDeleteZone}
        loading={loading}
      />
    </SafeAreaView>
  );
}

export default function PrivacyZonesScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <PrivacyZonesScreen />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
