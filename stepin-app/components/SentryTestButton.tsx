/**
 * Sentry Test Button
 * Component to test Sentry error reporting
 * REMOVE THIS FILE AFTER TESTING
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { logger } from '../lib/utils/logger';

export function SentryTestButton() {
  const testSentryError = () => {
    try {
      // Test 1: Throw an error that will be caught and logged
      throw new Error('Test error from Sentry Test Button');
    } catch (error) {
      logger.error('Testing Sentry error reporting', error);
    }
  };

  const testSentryMessage = () => {
    // Test 2: Send a test message directly to Sentry
    Sentry.captureMessage('Test message from Sentry Test Button', {
      level: 'info',
      extra: {
        testType: 'manual',
        timestamp: new Date().toISOString(),
      },
    });
    console.log('Test message sent to Sentry');
  };

  const testUncaughtError = () => {
    // Test 3: Throw an uncaught error (will be caught by ErrorBoundary)
    throw new Error('Uncaught test error - should be caught by ErrorBoundary');
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={testSentryError}>
        <Text style={styles.buttonText}>Test Logger Error</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={testSentryMessage}>
        <Text style={styles.buttonText}>Test Sentry Message</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={testUncaughtError}>
        <Text style={styles.buttonText}>Test Uncaught Error</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

