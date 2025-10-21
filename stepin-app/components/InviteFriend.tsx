/**
 * Invite Friend Component
 * Generate and share invite links
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { shareInviteLink } from '@/lib/services/inviteService';
import { useAuthStore } from '@/lib/store/authStore';
import { useProfileStore } from '@/lib/store/profileStore';

export function InviteFriend() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const [sharing, setSharing] = useState(false);
  
  const handleShare = async () => {
    if (!user || !profile) return;
    
    setSharing(true);
    
    try {
      const success = await shareInviteLink(user.id, profile.display_name);
      
      if (!success) {
        Alert.alert('Error', 'Failed to generate invite link. Please try again.');
      }
    } catch (error) {
      console.error('[InviteFriend] Error sharing:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSharing(false);
    }
  };
  
  return (
    <View testID="invite-friend" style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="gift" size={48} color="#4CAF50" />
      </View>

      <Text testID="invite-title" style={styles.title}>Invite Friends to Stepin</Text>
      <Text testID="invite-description" style={styles.description}>
        Share a personalized invite link with friends. When they sign up, you'll automatically become buddies!
      </Text>

      <TouchableOpacity
        testID="share-button"
        style={[styles.button, sharing && styles.buttonDisabled]}
        onPress={handleShare}
        disabled={sharing}
      >
        {sharing ? (
          <ActivityIndicator testID="loading-indicator" size="small" color="white" />
        ) : (
          <>
            <Feather name="share-2" size={20} color="white" />
            <Text style={styles.buttonText}>Share Invite Link</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <Feather name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Automatic buddy connection</Text>
        </View>
        <View style={styles.benefitItem}>
          <Feather name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Link expires in 30 days</Text>
        </View>
        <View style={styles.benefitItem}>
          <Feather name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>One-time use per person</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
  },
});

