/**
 * QR Scan Modal
 * Camera-based QR code scanner for buddy connections
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { QRScanner } from '@/components/QRScanner';

export default function QRScanModal() {
  const handleScan = () => {
    // Close scanner after successful scan
    router.back();
  };

  return (
    <View style={styles.container}>
      <QRScanner onScan={handleScan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

