/**
 * Buddy Preview Component
 * Shows buddy profile preview before sending request
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/authStore';

interface BuddyPreviewProps {
  buddyId: string;
  onRequestSent?: () => void;
}

interface BuddyProfile {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  location_city: string | null;
  daily_step_goal: number;
}

export function BuddyPreview({ buddyId, onRequestSent }: BuddyPreviewProps) {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<BuddyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [alreadyConnected, setAlreadyConnected] = useState(false);
  
  useEffect(() => {
    loadProfile();
    checkExistingConnection();
  }, [buddyId]);
  
  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, location_city, daily_step_goal')
        .eq('id', buddyId)
        .single();
      
      if (error) {
        console.error('[BuddyPreview] Error loading profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('[BuddyPreview] Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkExistingConnection = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('buddies')
        .select('id')
        .or(`and(user_id.eq.${user.id},buddy_id.eq.${buddyId}),and(user_id.eq.${buddyId},buddy_id.eq.${user.id})`)
        .limit(1);
      
      if (data && data.length > 0) {
        setAlreadyConnected(true);
      }
    } catch (error) {
      console.error('[BuddyPreview] Error checking connection:', error);
    }
  };
  
  const handleSendRequest = async () => {
    if (!user || !profile) return;
    
    setSending(true);
    
    try {
      const { error } = await supabase
        .from('buddies')
        .insert({
          user_id: user.id,
          buddy_id: buddyId,
          status: 'pending'
        });
      
      if (error) {
        console.error('[BuddyPreview] Error sending request:', error);
        Alert.alert('Error', 'Failed to send buddy request. Please try again.');
        return;
      }
      
      Alert.alert('Success!', `Buddy request sent to ${profile.display_name}`);
      onRequestSent?.();
    } catch (error) {
      console.error('[BuddyPreview] Unexpected error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer} testID="loading-indicator">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer} testID="error-container">
        <Feather name="user-x" size={48} color="#ccc" />
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="buddy-preview">
      <View style={styles.header}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} testID="buddy-avatar" />
        ) : (
          <View style={styles.avatarPlaceholder} testID="buddy-avatar-placeholder">
            <Feather name="user" size={48} color="#999" />
          </View>
        )}

        <Text style={styles.displayName} testID="buddy-display-name">{profile.display_name}</Text>
        {profile.username && (
          <Text style={styles.username} testID="buddy-username">@{profile.username}</Text>
        )}
        {profile.location_city && (
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={14} color="#666" />
            <Text style={styles.location} testID="buddy-location">{profile.location_city}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Feather name="target" size={24} color="#4CAF50" />
          <Text style={styles.statValue} testID="buddy-step-goal">{profile.daily_step_goal.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Daily Goal</Text>
        </View>
      </View>

      {alreadyConnected ? (
        <View style={styles.connectedContainer} testID="already-connected">
          <Feather name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.connectedText}>Already connected</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={handleSendRequest}
          disabled={sending}
          testID="send-request-button"
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" testID="sending-indicator" />
          ) : (
            <>
              <Feather name="user-plus" size={20} color="white" />
              <Text style={styles.buttonText}>Send Buddy Request</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'white',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 16,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    gap: 8,
  },
  connectedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});

