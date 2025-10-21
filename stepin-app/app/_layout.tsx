import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router, useSegments } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../lib/store/authStore';
import { useProfileStore } from '../lib/store/profileStore';
import { useActiveWalkStore } from '../lib/store/activeWalkStore';
import { Colors } from '../constants/Colors';
import { ThemeProvider } from '../lib/theme/themeManager';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineBanner } from '../components/OfflineBanner';
import { logger } from '../lib/utils/logger';
import { handleBuddyDeepLink } from '../lib/qr/qrCodeManager';
import { parseInviteCode } from '../lib/services/inviteService';
import { startBackgroundSync, stopBackgroundSync } from '../lib/sync/backgroundSyncService';

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
      // Check session
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

  // Start background sync service when user is authenticated
  useEffect(() => {
    if (user) {
      logger.info('Starting background sync service for authenticated user');
      startBackgroundSync();
    } else {
      logger.info('Stopping background sync service (no user)');
      stopBackgroundSync();
    }

    // Cleanup on unmount
    return () => {
      stopBackgroundSync();
    };
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

  // Listen for deep links (buddy connections and invites)
  useEffect(() => {
    // Handle initial URL (app opened from deep link)
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    // Handle URL events (app already open)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    handleInitialURL();

    return () => subscription.remove();
  }, [user]);

  const handleDeepLink = (url: string) => {
    logger.info('Deep link received:', { url });

    // Handle buddy connection links: stepin://buddy/add/{userId}
    if (url.includes('buddy/add/')) {
      handleBuddyDeepLink(url);
      return;
    }

    // Handle invite links: stepin://invite/{code} or https://stepin.app/invite/{code}
    if (url.includes('invite/')) {
      const inviteCode = parseInviteCode(url);
      if (inviteCode) {
        // Store invite code for processing after sign-up
        if (!user) {
          // User not logged in - navigate to sign-up with invite code
          router.push({
            pathname: '/(auth)/sign-up',
            params: { inviteCode }
          });
        } else {
          // User already logged in - show message
          logger.info('Invite link opened by existing user', { inviteCode });
        }
      }
    }
  };

  // Handle navigation based on auth state
  useEffect(() => {
    console.log('🔄 [RootLayout] Navigation effect triggered');
    console.log('   isReady:', isReady);
    console.log('   loading:', loading);
    console.log('   user:', user ? `✅ ${user.id}` : '❌ None');
    console.log('   segments:', segments);

    if (!isReady || loading) {
      console.log('⏸️  [RootLayout] Skipping navigation - not ready or loading');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('   inAuthGroup:', inAuthGroup);
    console.log('   inTabsGroup:', inTabsGroup);

    if (!user && !inAuthGroup) {
      // User is not signed in and not in auth group, redirect to sign-in
      console.log('➡️  [RootLayout] Redirecting to sign-in (no user, not in auth)');
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // User is signed in but still in auth group, redirect to main app
      console.log('➡️  [RootLayout] Redirecting to tabs (user exists, in auth group)');
      router.replace('/(tabs)');
    } else {
      console.log('✅ [RootLayout] No navigation needed - user in correct location');
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

  // Ensure theme preference is valid
  const themePreference: 'light' | 'dark' | 'system' =
    profile?.theme_preference === 'light' ||
    profile?.theme_preference === 'dark' ||
    profile?.theme_preference === 'system'
      ? profile.theme_preference
      : 'system';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider
          initialPreference={themePreference}
          onPreferenceChange={handleThemeChange}
        >
          <StatusBar barStyle={profile?.theme_preference === 'dark' ? 'light-content' : 'dark-content'} />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile"
              options={{
                headerShown: true,
                title: 'Profile',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="modals/edit-profile"
              options={{
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="modals/show-qr"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'My QR Code',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="x" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="modals/qr-scan"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Scan QR Code',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="x" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="modals/buddy-search"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Search Buddies',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="x" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="modals/buddy-preview"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Buddy Profile',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="x" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="modals/contacts-sync"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: 'Find Friends',
                headerLeft: () => (
                  <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="x" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                ),
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

