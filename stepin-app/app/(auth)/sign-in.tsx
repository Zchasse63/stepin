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
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

export default function SignInScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, error, clearError, devBypassAuth } = useAuthStore();

  const validateForm = () => {
    console.log('🔍 [Sign-In] Validating form...');
    console.log('   Email:', email);
    console.log('   Password length:', password.length);

    if (!email.trim()) {
      console.log('❌ [Sign-In] Validation failed: Email is empty');
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }

    if (!email.includes('@')) {
      console.log('❌ [Sign-In] Validation failed: Email missing @');
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      console.log('❌ [Sign-In] Validation failed: Password is empty');
      Alert.alert('Validation Error', 'Please enter your password');
      return false;
    }

    if (password.length < 8) {
      console.log('❌ [Sign-In] Validation failed: Password too short');
      Alert.alert('Validation Error', 'Password must be at least 8 characters');
      return false;
    }

    console.log('✅ [Sign-In] Validation passed');
    return true;
  };

  const handleSignIn = async () => {
    console.log('🚀 [Sign-In] handleSignIn called - button was pressed!');
    console.log('   Email:', email);
    console.log('   Password length:', password.length);

    if (!validateForm()) {
      console.log('❌ [Sign-In] Validation failed');
      return;
    }

    console.log('✅ [Sign-In] Validation passed, proceeding with sign-in');

    try {
      setIsSubmitting(true);
      clearError();

      console.log('🔄 [Sign-In] Calling authStore.signIn...');
      await signIn(email.trim().toLowerCase(), password);

      console.log('✅ [Sign-In] Sign-in successful! Waiting for navigation...');
      // Navigation will be handled automatically by the root layout based on auth state
      // Do NOT manually navigate here - it creates a race condition with _layout.tsx
    } catch (err: any) {
      console.error('❌ [Sign-In] Sign-in failed:', err);
      Alert.alert(
        'Sign In Failed',
        err.message || 'Unable to sign in. Please check your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevBypass = () => {
    if (__DEV__) {
      devBypassAuth();
      // Navigation will be handled automatically by the root layout
    }
  };

  const handleResetAuth = async () => {
    if (__DEV__) {
      try {
        console.log('🔄 [Sign-In] Resetting auth state...');

        // Clear auth state in the store (this will call supabase.auth.signOut())
        // which properly clears the session from secure store
        const { signOut } = useAuthStore.getState();
        await signOut();
        console.log('✅ [Sign-In] Auth state reset complete');

        // Don't show alert during E2E tests to avoid blocking
        // Alert.alert('Success', 'Auth state has been reset');
      } catch (error: any) {
        console.error('❌ [Sign-In] Failed to reset auth:', error);
        // Don't show alert during E2E tests
        // Alert.alert('Error', error.message || 'Failed to reset auth state');
      }
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
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

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.disabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                // Use oneTimeCode in dev mode to disable iOS password autofill for E2E testing
                // This prevents the "Strong Password" suggestion overlay from blocking Maestro input
                textContentType={__DEV__ ? 'oneTimeCode' : 'password'}
                accessibilityLabel="Password input field"
                testID="password-input"
                // Disable password autofill in dev mode for E2E testing
                autoComplete={__DEV__ ? 'off' : 'password'}
              />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              activeOpacity={0.7}
              onPress={handleSignIn}
              disabled={isSubmitting}
              testID="sign-in-button"
              accessibilityLabel="Sign In"
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity testID="forgot-password-link">
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Development Bypass Button - Only visible in dev mode */}
            {__DEV__ && (
              <>
                <TouchableOpacity
                  style={[styles.devButton, { backgroundColor: colors.accent.warning }]}
                  onPress={handleDevBypass}
                >
                  <Text style={styles.devButtonText}>🔧 Dev Bypass (Skip Auth)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.devButton, { backgroundColor: colors.status.error, marginTop: 8 }]}
                  onPress={handleResetAuth}
                  testID="reset-auth-button"
                  accessibilityLabel="Reset Auth State"
                >
                  <Text style={styles.devButtonText}>🔄 Reset Auth State</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xxl * 2,
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    marginBottom: Layout.spacing.xxl,
  },
  title: {
    ...Typography.styles.largeTitle,
    color: colors.text.primary,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    ...Typography.styles.body,
    color: colors.text.secondary,
  },
  form: {
    gap: Layout.spacing.lg,
  },
  inputContainer: {
    gap: Layout.spacing.sm,
  },
  label: {
    ...Typography.styles.subheadline,
    color: colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  input: {
    height: Layout.input.height,
    borderRadius: Layout.input.borderRadius,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: Layout.spacing.md,
    ...Typography.styles.body,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  button: {
    height: Layout.button.height,
    borderRadius: Layout.button.borderRadius,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...Typography.styles.headline,
    color: colors.text.inverse,
    fontWeight: Typography.fontWeight.semibold,
  },
  errorContainer: {
    padding: Layout.spacing.md,
    backgroundColor: colors.status.error + '15',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.status.error + '30',
  },
  errorText: {
    ...Typography.styles.subheadline,
    color: colors.status.error,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
  },
  forgotPasswordText: {
    ...Typography.styles.body,
    color: colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  footerText: {
    ...Typography.styles.body,
    color: colors.text.secondary,
  },
  link: {
    ...Typography.styles.body,
    color: colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
  devButton: {
    marginTop: Layout.spacing.xl,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderStyle: 'dashed',
  },
  devButtonText: {
    ...Typography.styles.body,
    color: '#000',
    fontWeight: Typography.fontWeight.bold,
  },
});

