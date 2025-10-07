import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../lib/store/authStore';
import { useProfileStore } from '../lib/store/profileStore';
import { useActiveWalkStore } from '../lib/store/activeWalkStore';
import { Colors } from '../constants/Colors';
import { ThemeProvider } from '../lib/theme/themeManager';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineBanner } from '../components/OfflineBanner';
import { logger } from '../lib/utils/logger';

// Initialize Sentry for error reporting
Sentry.init({
  dsn: 'https://ec7f63ab72881c2922b092a8ada1d0d6@o4510142225121280.ingest.us.sentry.io/4510142227283968',
  debug: __DEV__,
  tracesSampleRate: 1.0,
  environment: __DEV__ ? 'development' : 'production',
  enabled: true, // Enable in all environments for testing
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const { user, loading, checkSession } = useAuthStore();
  const { profile, loadProfile, updateTheme } = useProfileStore();
  const { startWalk } = useActiveWalkStore();

  // Check for existing session and load profile on mount
  useEffect(() => {
    const initAuth = async () => {
      await checkSession();
      setIsReady(true);
    };

    initAuth();
  }, []);

  // Load profile when user is authenticated
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Listen for notification responses (auto-detection)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        try {
          const { data } = response.notification.request.content;

          if (data?.type === 'auto_detect_walk') {
            const startTime = data.startTime ? new Date(data.startTime as string) : new Date();

            logger.info('Auto-detection notification tapped', {
              startTime: startTime.toISOString(),
              actionIdentifier: response.actionIdentifier,
            });

            Sentry.addBreadcrumb({
              category: 'auto-detection',
              message: 'User tapped auto-detection notification',
              level: 'info',
              data: {
                startTime: startTime.toISOString(),
              },
            });

            // Start walk retroactively
            if (profile?.daily_step_goal) {
              await startWalk(profile.daily_step_goal, {
                retroactive: true,
                startTime,
              });

              // Navigate to Today screen
              router.push('/(tabs)/');
            }
          }
        } catch (error) {
          logger.error('Error handling auto-detection notification:', error);
          Sentry.captureException(error, {
            tags: { feature: 'auto-detection' },
          });
        }
      }
    );

    return () => subscription.remove();
  }, [profile]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      // User is not signed in and not in auth group, redirect to sign-in
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // User is signed in but still in auth group, redirect to main app
      router.replace('/(tabs)');
    }
  }, [user, segments, isReady, loading]);

  // Show splash screen while checking auth
  if (!isReady || loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  const handleThemeChange = (preference: 'light' | 'dark' | 'system') => {
    updateTheme(preference);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider
          initialPreference={profile?.theme_preference || 'system'}
          onPreferenceChange={handleThemeChange}
        >
          <StatusBar barStyle={profile?.theme_preference === 'dark' ? 'light-content' : 'dark-content'} />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modals/edit-profile"
              options={{
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
});

