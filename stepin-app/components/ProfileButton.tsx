/**
 * ProfileButton Component
 * Avatar button for navigation bar that opens profile screen
 * Displays user avatar or initials, accessible from all tab screens
 */

import React from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { useProfileStore } from '../lib/store/profileStore';
import { Typography } from '../constants/Typography';

export function ProfileButton() {
  const { colors } = useTheme();
  const { profile } = useProfileStore();

  // Get initials from display name or email
  const getInitials = (): string => {
    if (profile?.display_name) {
      const names = profile.display_name.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handlePress = () => {
    router.push('/profile');
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
      testID="profile-button"
      accessibilityLabel="Open profile"
      accessibilityHint="Opens your profile and settings"
      accessibilityRole="button"
    >
      {profile?.avatar_url ? (
        <Image
          source={{ uri: profile.avatar_url }}
          style={styles.avatar}
          testID="avatar-image"
        />
      ) : (
        <View style={styles.avatarPlaceholder} testID="avatar-placeholder">
          {profile ? (
            <Text style={styles.initials} testID="avatar-initials">{getInitials()}</Text>
          ) : (
            <Feather name="user" size={20} color={colors.primary.main} testID="avatar-icon" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
    fontFamily: Typography.fontFamily.semibold,
  },
});

