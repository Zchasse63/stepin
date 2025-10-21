/**
 * QR Code Display Component
 * Shows user's QR code for buddy connections
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { generateBuddyQRCode } from '@/lib/qr/qrCodeManager';

interface QRCodeDisplayProps {
  userId: string;
  userName?: string;
}

export function QRCodeDisplay({ userId, userName }: QRCodeDisplayProps) {
  const qrValue = generateBuddyQRCode(userId);

  return (
    <View style={styles.container} testID="qr-code-display">
      <Text style={styles.title}>Scan to Connect</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={qrValue}
          size={250}
          backgroundColor="white"
          color="#4CAF50"
          logoSize={50}
          logoBackgroundColor="white"
          testID="qr-code-image"
        />
      </View>

      {userName && <Text style={styles.name}>{userName}</Text>}
      <Text style={styles.subtitle} testID="user-code-text">
        {userId}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 32,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

