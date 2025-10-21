/**
 * Buddy Preview Modal
 * Shows buddy profile preview before sending request
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BuddyPreview } from '@/components/BuddyPreview';

export default function BuddyPreviewModal() {
  const params = useLocalSearchParams<{ buddyId: string }>();

  const handleRequestSent = () => {
    // Close modal after request sent
    router.back();
  };

  if (!params.buddyId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BuddyPreview buddyId={params.buddyId} onRequestSent={handleRequestSent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

