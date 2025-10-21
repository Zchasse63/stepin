/**
 * Activity Visibility Modal Component
 * Allows users to control who can see their activities
 * Phase 3: Privacy Features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

export type ActivityVisibility = 'private' | 'buddies' | 'public';

interface ActivityVisibilityModalProps {
  visible: boolean;
  currentVisibility: ActivityVisibility;
  onClose: () => void;
  onSave: (visibility: ActivityVisibility) => Promise<void>;
}

interface VisibilityOption {
  value: ActivityVisibility;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
}

export function ActivityVisibilityModal({
  visible,
  currentVisibility,
  onClose,
  onSave,
}: ActivityVisibilityModalProps) {
  const { colors } = useTheme();
  const [selectedVisibility, setSelectedVisibility] = useState<ActivityVisibility>(currentVisibility);
  const [saving, setSaving] = useState(false);

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Update selected visibility when current visibility changes
  useEffect(() => {
    setSelectedVisibility(currentVisibility);
  }, [currentVisibility]);

  const visibilityOptions: VisibilityOption[] = [
    {
      value: 'private',
      label: 'Private',
      description: 'Only you can see your activities',
      icon: 'lock',
      iconColor: colors.status.error,
    },
    {
      value: 'buddies',
      label: 'Buddies Only',
      description: 'Only your buddies can see your activities',
      icon: 'users',
      iconColor: colors.primary.main,
    },
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can see your activities',
      icon: 'globe',
      iconColor: colors.status.success,
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedVisibility);
      onClose();
    } catch (error) {
      console.error('Error saving visibility:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderOption = (option: VisibilityOption) => {
    const isSelected = selectedVisibility === option.value;

    return (
      <Pressable
        key={option.value}
        style={[styles.option, isSelected && styles.optionSelected]}
        onPress={() => setSelectedVisibility(option.value)}
      >
        <View style={[styles.iconContainer, { backgroundColor: option.iconColor + '20' }]}>
          <Feather name={option.icon} size={24} color={option.iconColor} />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionLabel}>{option.label}</Text>
          <Text style={styles.optionDescription}>{option.description}</Text>
        </View>
        {isSelected && (
          <Feather name="check-circle" size={24} color={colors.primary.main} />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Activity Visibility</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text
              style={[
                styles.saveButton,
                saving && { color: colors.text.disabled },
              ]}
            >
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Control who can see your walks, routes, and activity feed posts
          </Text>

          {/* Visibility Options */}
          <View style={styles.options}>
            {visibilityOptions.map(renderOption)}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Feather name="info" size={16} color={colors.primary.main} />
            <Text style={styles.infoText}>
              This setting applies to all your activities. Your profile information
              will always be visible to your buddies.
            </Text>
          </View>

          {/* Recommendation */}
          <View style={styles.recommendationBox}>
            <View style={styles.recommendationHeader}>
              <Feather name="shield" size={16} color={colors.status.success} />
              <Text style={styles.recommendationTitle}>Recommended</Text>
            </View>
            <Text style={styles.recommendationText}>
              "Buddies Only" provides a good balance between privacy and social
              engagement. Your activities will only be shared with people you trust.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: Layout.safeArea.top + Layout.spacing.medium,
      paddingHorizontal: Layout.spacing.large,
      paddingBottom: Layout.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    title: {
      ...Typography.headline,
      color: colors.text.primary,
      fontWeight: '600',
      fontSize: Typography.fontSize.lg,
    },
    cancelButton: {
      ...Typography.body,
      color: colors.primary.main,
      fontSize: Typography.fontSize.md,
    },
    saveButton: {
      ...Typography.body,
      color: colors.primary.main,
      fontSize: Typography.fontSize.md,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: Layout.spacing.large,
    },
    subtitle: {
      ...Typography.body,
      color: colors.text.secondary,
      marginBottom: Layout.spacing.large,
    },
    options: {
      gap: Layout.spacing.medium,
      marginBottom: Layout.spacing.large,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.medium,
      padding: Layout.spacing.medium,
      borderWidth: 2,
      borderColor: 'transparent',
      minHeight: Layout.touchTarget.listItem,
    },
    optionSelected: {
      borderColor: colors.primary.main,
      backgroundColor: colors.primary.light + '10',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Layout.spacing.medium,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      ...Typography.headline,
      color: colors.text.primary,
      marginBottom: 2,
      fontWeight: '600',
    },
    optionDescription: {
      ...Typography.body,
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.primary.light + '20',
      borderRadius: Layout.borderRadius.medium,
      padding: Layout.spacing.medium,
      gap: Layout.spacing.small,
      marginBottom: Layout.spacing.large,
    },
    infoText: {
      ...Typography.body,
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      flex: 1,
    },
    recommendationBox: {
      backgroundColor: colors.status.success + '10',
      borderRadius: Layout.borderRadius.medium,
      padding: Layout.spacing.medium,
      borderWidth: 1,
      borderColor: colors.status.success + '30',
    },
    recommendationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Layout.spacing.xs,
      marginBottom: Layout.spacing.small,
    },
    recommendationTitle: {
      ...Typography.headline,
      color: colors.status.success,
      fontWeight: '600',
    },
    recommendationText: {
      ...Typography.body,
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
  });
