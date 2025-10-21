/**
 * Contacts Sync Component
 * Privacy-first contact matching with opt-in
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { requestContactsPermission, syncContacts, ContactMatch } from '@/lib/services/contactSyncService';
import { useAuthStore } from '@/lib/store/authStore';
import { router } from 'expo-router';

export function ContactsSync() {
  const user = useAuthStore((state) => state.user);
  const [syncing, setSyncing] = useState(false);
  const [matches, setMatches] = useState<ContactMatch[]>([]);
  const [synced, setSynced] = useState(false);
  
  const handleSync = async () => {
    if (!user) return;
    
    setSyncing(true);
    
    try {
      // Request permission
      const permission = await requestContactsPermission();
      
      if (permission === 'denied') {
        Alert.alert(
          'Permission Denied',
          'Please enable contacts access in your device settings to find friends on Stepin.',
          [{ text: 'OK' }]
        );
        setSyncing(false);
        return;
      }
      
      if (permission === 'undetermined') {
        setSyncing(false);
        return;
      }
      
      // Sync contacts
      const foundMatches = await syncContacts(user.id);
      setMatches(foundMatches);
      setSynced(true);
      
      if (foundMatches.length === 0) {
        Alert.alert(
          'No Matches Found',
          'None of your contacts are on Stepin yet. Invite them to join!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[ContactsSync] Error syncing:', error);
      Alert.alert('Error', 'Failed to sync contacts. Please try again.');
    } finally {
      setSyncing(false);
    }
  };
  
  const handleViewMatch = (match: ContactMatch) => {
    router.push({
      pathname: '/modals/buddy-preview',
      params: { buddyId: match.id }
    });
  };
  
  return (
    <ScrollView style={styles.container} testID="contacts-sync">
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="users" size={48} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Find Friends from Contacts</Text>
        <Text style={styles.description}>
          We'll securely match your contacts with Stepin users. Your privacy is protected:
        </Text>
      </View>
      
      <View style={styles.privacyContainer}>
        <View style={styles.privacyItem}>
          <Feather name="shield" size={20} color="#4CAF50" />
          <Text style={styles.privacyText}>Phone numbers are hashed (encrypted)</Text>
        </View>
        <View style={styles.privacyItem}>
          <Feather name="lock" size={20} color="#4CAF50" />
          <Text style={styles.privacyText}>No contact names are stored</Text>
        </View>
        <View style={styles.privacyItem}>
          <Feather name="eye-off" size={20} color="#4CAF50" />
          <Text style={styles.privacyText}>Opt-in only, disable anytime</Text>
        </View>
      </View>
      
      {!synced ? (
        <TouchableOpacity
          testID="sync-button"
          style={[styles.button, syncing && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Feather name="refresh-cw" size={20} color="white" />
              <Text style={styles.buttonText}>Sync Contacts</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {matches.length === 0 ? 'No Matches Found' : `Found ${matches.length} ${matches.length === 1 ? 'Match' : 'Matches'}`}
          </Text>
          
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              testID={`match-item-${match.id}`}
              style={styles.matchItem}
              onPress={() => handleViewMatch(match)}
            >
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.display_name}</Text>
                {match.username && (
                  <Text style={styles.matchUsername}>@{match.username}</Text>
                )}
              </View>
              <Feather name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            testID="resync-button"
            style={styles.resyncButton}
            onPress={() => {
              setSynced(false);
              setMatches([]);
            }}
          >
            <Feather name="refresh-cw" size={16} color="#4CAF50" />
            <Text style={styles.resyncText}>Sync Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  iconContainer: {
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
  },
  privacyContainer: {
    backgroundColor: 'white',
    padding: 24,
    marginTop: 8,
    gap: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
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
  resultsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  matchUsername: {
    fontSize: 14,
    color: '#666',
  },
  resyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  resyncText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

