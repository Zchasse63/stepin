import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase/client';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

export default function ForgotPasswordScreen() {
  const colors = Colors;
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('🔄 [Forgot Password] Sending password reset email...');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'stepin://reset-password',
      });

      if (error) throw error;

      console.log('✅ [Forgot Password] Password reset email sent');
      setEmailSent(true);
    } catch (err: any) {
      console.error('❌ [Forgot Password] Failed to send reset email:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to send password reset email. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (emailSent) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Success Message */}
            <View style={styles.header}>
              <Text style={styles.successIcon}>✉️</Text>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent password reset instructions to {email}
              </Text>
              <Text style={[styles.subtitle, { marginTop: Layout.spacing.md }]}>
                Please check your email and follow the link to reset your password.
              </Text>
            </View>

            {/* Back to Sign In Button */}
            <TouchableOpacity
              style={styles.button}
              testID="back-to-signin-button"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.text.disabled}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel="Email input field"
                testID="email-input"
              />
            </View>

            {/* Send Reset Email Button */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              activeOpacity={0.7}
              onPress={handleResetPassword}
              disabled={isSubmitting}
              testID="send-reset-email-button"
              accessibilityLabel="Send Reset Email"
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Send Reset Email</Text>
              )}
            </TouchableOpacity>

            {/* Back to Sign In Link */}
            <View style={styles.footer}>
              <TouchableOpacity testID="cancel-button" onPress={() => router.push('/(auth)/sign-in')}>
                <Text style={styles.link}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Layout.spacing.xl,
      paddingVertical: Layout.spacing.xxl,
    },
    header: {
      marginBottom: Layout.spacing.xxl,
      alignItems: 'center',
    },
    successIcon: {
      fontSize: 64,
      marginBottom: Layout.spacing.lg,
    },
    title: {
      ...Typography.styles.h1,
      color: colors.text.primary,
      marginBottom: Layout.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      ...Typography.styles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      marginBottom: Layout.spacing.lg,
    },
    label: {
      ...Typography.styles.subheadline,
      color: colors.text.primary,
      marginBottom: Layout.spacing.xs,
      fontWeight: Typography.fontWeight.semibold,
    },
    input: {
      ...Typography.styles.body,
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.primary,
    },
    button: {
      backgroundColor: colors.primary.main,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      alignItems: 'center',
      marginTop: Layout.spacing.md,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      ...Typography.styles.button,
      color: colors.text.inverse,
    },
    footer: {
      alignItems: 'center',
      marginTop: Layout.spacing.lg,
    },
    link: {
      ...Typography.styles.body,
      color: colors.primary.main,
      fontWeight: Typography.fontWeight.semibold,
    },
  });

