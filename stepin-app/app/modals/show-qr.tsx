/**
 * Show QR Code Modal
 * Displays user's QR code for buddy connections
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { useAuthStore } from '@/lib/store/authStore';
import { useProfileStore } from '@/lib/store/profileStore';

export default function ShowQRModal() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);

  if (!user || !profile) {
    return null;
  }

  return (
    <View style={styles.container}>
      <QRCodeDisplay userId={user.id} userName={profile.display_name} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
});

