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
  Keyboard,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import { Layout } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp, error, clearError } = useAuthStore();

  const validateForm = () => {
    console.log('🔍 [Sign-Up] Validating form...');
    console.log('   Display Name:', displayName.trim() ? '✅' : '❌', `"${displayName}"`);
    console.log('   Email:', email.trim() ? '✅' : '❌', `"${email}"`);
    console.log('   Password length:', password.length, password.length >= 8 ? '✅' : '❌');
    console.log('   Passwords match:', password === confirmPassword ? '✅' : '❌');

    if (!displayName.trim()) {
      console.log('❌ [Sign-Up] Validation failed: Name is empty');
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }

    if (!email.trim()) {
      console.log('❌ [Sign-Up] Validation failed: Email is empty');
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }

    if (!email.includes('@')) {
      console.log('❌ [Sign-Up] Validation failed: Email invalid (no @)');
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      console.log('❌ [Sign-Up] Validation failed: Password is empty');
      Alert.alert('Validation Error', 'Please enter a password');
      return false;
    }

    if (password.length < 8) {
      console.log('❌ [Sign-Up] Validation failed: Password too short');
      Alert.alert('Validation Error', 'Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      console.log('❌ [Sign-Up] Validation failed: Passwords do not match');
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }

    console.log('✅ [Sign-Up] Form validation passed!');
    return true;
  };

  const handleSignUp = async () => {
    console.log('🚀 [Sign-Up] handleSignUp called - button was pressed!');

    // Dismiss keyboard first to ensure button is fully accessible
    Keyboard.dismiss();

    if (!validateForm()) {
      console.log('❌ [Sign-Up] Form validation failed - stopping sign-up');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();

      console.log('🔄 [Sign-Up] Starting sign-up process...');
      console.log('   Email:', email.trim().toLowerCase());
      console.log('   Display Name:', displayName.trim());
      console.log('   Password length:', password.length);

      await signUp(email.trim().toLowerCase(), password, displayName.trim());

      console.log('✅ [Sign-Up] Sign-up successful! Navigating to onboarding...');

      // Navigate to onboarding after successful sign up
      router.replace('/(auth)/onboarding');
    } catch (err: any) {
      console.error('❌ [Sign-Up] Sign-up failed:', err);
      console.error('   Error message:', err.message);
      console.error('   Error code:', err.code);
      console.error('   Error details:', JSON.stringify(err, null, 2));

      Alert.alert(
        'Sign Up Failed',
        err.message || 'Unable to create account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your walking journey today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Display Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.text.disabled}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                testID="name-input"
                accessibilityLabel="Name"
                editable={!isSubmitting}
              />
            </View>

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
                testID="email-input"
                accessibilityLabel="Email"
                editable={!isSubmitting}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.text.disabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                testID="password-input"
                accessibilityLabel="Password"
                editable={!isSubmitting}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.text.disabled}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                testID="confirm-password-input"
                accessibilityLabel="Confirm Password"
                editable={!isSubmitting}
              />
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              activeOpacity={0.7}
              onPress={handleSignUp}
              disabled={isSubmitting}
              testID="sign-up-button"
              accessibilityLabel="Create Account"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Sign In Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
});

