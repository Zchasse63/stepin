/**
 * Buddy Search Result Component
 * Individual search result card for buddy search
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BuddySearchResult as BuddySearchResultType } from '@/lib/services/buddySearchService';

interface BuddySearchResultProps {
  buddy: BuddySearchResultType;
  onPress: () => void;
}

export function BuddySearchResult({ buddy, onPress }: BuddySearchResultProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}
      testID="search-result"
    >
      <View style={styles.avatarContainer}>
        {buddy.avatar_url ? (
          <Image testID="avatar-image" source={{ uri: buddy.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} testID="avatar-placeholder">
            <Feather name="user" size={24} color="#999" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.displayName} testID="display-name">{buddy.display_name}</Text>
        {buddy.username && (
          <Text style={styles.username} testID="username">@{buddy.username}</Text>
        )}
      </View>

      <Feather name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
});

