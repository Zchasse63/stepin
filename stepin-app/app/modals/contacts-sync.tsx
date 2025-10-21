/**
 * Contacts Sync Modal
 * Privacy-first contact matching
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ContactsSync } from '@/components/ContactsSync';

export default function ContactsSyncModal() {
  return (
    <View style={styles.container}>
      <ContactsSync />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

