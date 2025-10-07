/**
 * ProfileHeader Component
 * Displays user avatar, name, email, and edit button
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { useRouter } from 'expo-router';

interface ProfileHeaderProps {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  loading?: boolean;
}

export function ProfileHeader({
  displayName,
  email,
  avatarUrl,
  loading = false,
}: ProfileHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  // Get initials from display name or email
  const getInitials = (): string => {
    if (displayName) {
      const names = displayName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleEditPress = () => {
    router.push('/modals/edit-profile');
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initials}>{getInitials()}</Text>
          </View>
        )}
      </View>

      {/* Name and Email */}
      <View style={styles.infoContainer}>
        <Text style={styles.displayName}>
          {displayName || 'Set your name'}
        </Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Edit Button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditPress}
        disabled={loading}
        accessibilityLabel="Edit profile"
        accessibilityHint="Opens profile editing screen"
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.system.blue} />
        ) : (
          <>
            <Ionicons name="pencil" size={16} color={colors.system.blue} />
            <Text style={styles.editButtonText}>Edit</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.system.gray6,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.system.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text.inverse,
    fontFamily: Typography.fontFamily.semibold,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.system.gray6,
    minHeight: 44, // iOS minimum tap target
    minWidth: 44,
  },
  editButtonText: {
    fontSize: 16,
    color: colors.system.blue,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 4,
  },
});

