/**
 * Edit Profile Modal Screen
 * Allows users to edit their display name and avatar
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '../../lib/store/profileStore';
import { uploadAvatar, deleteAvatar } from '../../lib/utils/profileUtils';
import { useTheme, ThemeColors } from '../../lib/theme/themeManager';
import { Typography } from '../../constants/Typography';

export default function EditProfileModal() {
  const { colors } = useTheme();
  const { profile, updateProfile, loadProfile } = useProfileStore();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Get initials from display name or email
  const getInitials = (): string => {
    if (displayName) {
      const names = displayName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Handle avatar picker
  const handlePickAvatar = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to change your avatar.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);

        // Delete old avatar if exists
        if (avatarUrl) {
          await deleteAvatar(avatarUrl);
        }

        // Upload new avatar
        const newAvatarUrl = await uploadAvatar(result.assets[0].uri, profile!.id);
        setAvatarUrl(newAvatarUrl);
        setUploadingAvatar(false);
      }
    } catch (error: any) {
      setUploadingAvatar(false);
      Alert.alert('Error', error.message || 'Failed to upload avatar');
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      // Validate name
      if (!displayName.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }

      if (displayName.trim().length > 50) {
        Alert.alert('Error', 'Name must be 50 characters or less');
        return;
      }

      setLoading(true);

      // Update profile
      await updateProfile({
        display_name: displayName.trim(),
        avatar_url: avatarUrl,
      });

      // Reload profile to get fresh data
      await loadProfile();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            disabled={loading}
            style={styles.headerButton}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || uploadingAvatar}
            style={styles.headerButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.system.blue} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploadingAvatar || loading}
            style={styles.avatarContainer}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initials}>{getInitials()}</Text>
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="large" color={colors.text.inverse} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploadingAvatar || loading}
          >
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={colors.text.disabled}
            maxLength={50}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />
          <Text style={styles.inputHint}>
            This is how your name will appear in the app
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  headerButton: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: Typography.fontFamily.semibold,
  },
  cancelButton: {
    fontSize: 17,
    color: colors.system.blue,
    fontFamily: Typography.fontFamily.regular,
  },
  saveButton: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.system.blue,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'right',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.system.gray6,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.system.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 48,
    fontWeight: '600',
    color: colors.text.inverse,
    fontFamily: Typography.fontFamily.semibold,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarText: {
    fontSize: 17,
    color: colors.system.blue,
    fontFamily: Typography.fontFamily.regular,
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: colors.text.primary,
    fontFamily: Typography.fontFamily.regular,
    backgroundColor: colors.background.primary,
  },
  inputHint: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 8,
  },
});

