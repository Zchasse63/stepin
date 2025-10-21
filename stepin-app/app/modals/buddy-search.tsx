/**
 * Buddy Search Modal
 * Search for buddies by username or email
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { BuddySearch } from '@/components/BuddySearch';
import { BuddySearchResult } from '@/lib/services/buddySearchService';

export default function BuddySearchModal() {
  const handleSelectBuddy = (buddy: BuddySearchResult) => {
    // Navigate to buddy preview
    router.push({
      pathname: '/modals/buddy-preview',
      params: { buddyId: buddy.id }
    });
  };

  return (
    <View style={styles.container}>
      <BuddySearch onSelectBuddy={handleSelectBuddy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

