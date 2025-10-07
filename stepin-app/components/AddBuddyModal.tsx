/**
 * Add Buddy Modal Component
 * Phase 11: Non-Competitive Social Features
 * 
 * Modal for sending buddy requests by email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { useSocialStore } from '../lib/store/socialStore';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface AddBuddyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddBuddyModal({ visible, onClose }: AddBuddyModalProps) {
  const { colors } = useTheme();
  const { sendBuddyRequest, loading } = useSocialStore();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendRequest = async () => {
    // Validate email
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await sendBuddyRequest(trimmedEmail);
      
      // Success
      Alert.alert(
        'Buddy Request Sent!',
        'Your buddy request has been sent. You\'ll be notified when they accept.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('');
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      // Error is already handled by the store and shown in alert
      // Just reset submitting state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Buddy</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.description}>
              Enter the email address of the person you'd like to add as a buddy
            </Text>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={colors.text.secondary} />
              <TextInput
                style={styles.input}
                placeholder="friend@example.com"
                placeholderTextColor={colors.text.disabled}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.infoBox}>
              <Feather name="info" size={16} color={colors.primary.main} />
              <Text style={styles.infoText}>
                They'll receive a buddy request and can choose to accept or decline
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.sendButton,
                { backgroundColor: colors.primary.main },
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSendRequest}
              activeOpacity={0.7}
              disabled={isSubmitting || !email.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <>
                  <Feather name="send" size={18} color={colors.text.inverse} />
                  <Text style={styles.sendButtonText}>Send Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      backgroundColor: colors.background.primary,
      borderTopLeftRadius: Layout.borderRadius.xl,
      borderTopRightRadius: Layout.borderRadius.xl,
      paddingBottom: Platform.OS === 'ios' ? 34 : Layout.spacing.lg,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Layout.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    title: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
    },
    content: {
      padding: Layout.spacing.lg,
    },
    label: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs,
    },
    description: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: Layout.spacing.lg,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.md,
      paddingHorizontal: Layout.spacing.md,
      paddingVertical: Layout.spacing.sm,
      gap: Layout.spacing.sm,
      marginBottom: Layout.spacing.md,
    },
    input: {
      flex: 1,
      fontSize: Typography.fontSize.md,
      color: colors.text.primary,
      padding: 0,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.primary.light,
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      gap: Layout.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: Typography.fontSize.sm,
      color: colors.primary.main,
      lineHeight: 20,
    },
    actions: {
      flexDirection: 'row',
      gap: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      gap: Layout.spacing.sm,
    },
    cancelButton: {
      backgroundColor: colors.background.secondary,
    },
    cancelButtonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
    },
    sendButton: {
      // backgroundColor set dynamically
    },
    sendButtonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.inverse,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });

