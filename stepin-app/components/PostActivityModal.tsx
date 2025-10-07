/**
 * Post Activity Modal Component
 * Phase 11: Non-Competitive Social Features
 * 
 * Modal for sharing walks with feeling selector, note, and visibility
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
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { useSocialStore } from '../lib/store/socialStore';
import {
  FeelingEmoji,
  Visibility,
  FEELING_OPTIONS,
  VISIBILITY_OPTIONS,
  MAX_NOTE_LENGTH,
  WalkCompletedData,
} from '../types/social';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';

interface PostActivityModalProps {
  visible: boolean;
  onClose: () => void;
  walkData: {
    duration_minutes: number;
    distance_meters?: number;
    date: string;
  };
  userId: string;
}

export function PostActivityModal({
  visible,
  onClose,
  walkData,
  userId,
}: PostActivityModalProps) {
  const { colors } = useTheme();
  const { postActivity, loading } = useSocialStore();

  const [selectedFeeling, setSelectedFeeling] = useState<FeelingEmoji | null>(null);
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('buddies');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    // Validate feeling is selected
    if (!selectedFeeling) {
      Alert.alert('Select a Feeling', 'Please select how your walk felt');
      return;
    }

    try {
      setIsSubmitting(true);

      const activityData: WalkCompletedData = {
        feeling: selectedFeeling,
        note: note.trim() || undefined,
        duration_minutes: walkData.duration_minutes,
        distance_meters: walkData.distance_meters,
        date: walkData.date,
      };

      await postActivity(userId, {
        activity_type: 'walk_completed',
        activity_data: activityData,
        visibility,
      });

      // Success
      Alert.alert(
        'Walk Shared!',
        'Your walk has been shared with your buddies',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      // Error is already handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFeeling(null);
    setNote('');
    setVisibility('buddies');
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
            <Text style={styles.title}>Share Your Walk</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Walk Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Walk Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Feather name="clock" size={18} color={colors.text.secondary} />
                  <Text style={styles.summaryText}>
                    {Math.round(walkData.duration_minutes)} minutes
                  </Text>
                </View>
                {walkData.distance_meters && (
                  <View style={styles.summaryRow}>
                    <Feather name="map-pin" size={18} color={colors.text.secondary} />
                    <Text style={styles.summaryText}>
                      {(walkData.distance_meters / 1609.34).toFixed(2)} miles
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Feeling Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                How was your walk? <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.feelingGrid}>
                {FEELING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.feelingButton,
                      selectedFeeling === option.emoji && styles.feelingButtonSelected,
                    ]}
                    onPress={() => setSelectedFeeling(option.emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.feelingEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.feelingLabel,
                        selectedFeeling === option.emoji && styles.feelingLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Optional Note */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add a note (optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="How was your walk? (optional)"
                placeholderTextColor={colors.text.disabled}
                value={note}
                onChangeText={setNote}
                maxLength={MAX_NOTE_LENGTH}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {note.length}/{MAX_NOTE_LENGTH}
              </Text>
            </View>

            {/* Visibility Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who can see this?</Text>
              <View style={styles.visibilityGrid}>
                {VISIBILITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.visibilityButton,
                      visibility === option.value && styles.visibilityButtonSelected,
                    ]}
                    onPress={() => setVisibility(option.value)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={option.icon as any}
                      size={20}
                      color={
                        visibility === option.value
                          ? colors.primary.main
                          : colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.visibilityLabel,
                        visibility === option.value && styles.visibilityLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

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
                styles.shareButton,
                { backgroundColor: colors.primary.main },
                (isSubmitting || !selectedFeeling) && styles.buttonDisabled,
              ]}
              onPress={handleShare}
              activeOpacity={0.7}
              disabled={isSubmitting || !selectedFeeling}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <>
                  <Feather name="share-2" size={18} color={colors.text.inverse} />
                  <Text style={styles.shareButtonText}>Share Walk</Text>
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
      maxHeight: '90%',
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
    scrollView: {
      maxHeight: 500,
    },
    content: {
      padding: Layout.spacing.lg,
    },
    section: {
      marginBottom: Layout.spacing.lg,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Layout.spacing.sm,
    },
    required: {
      color: colors.status.error,
    },
    summaryCard: {
      backgroundColor: colors.background.secondary,
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      gap: Layout.spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Layout.spacing.sm,
    },
    summaryText: {
      fontSize: Typography.fontSize.md,
      color: colors.text.primary,
    },
    feelingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Layout.spacing.sm,
    },
    feelingButton: {
      flex: 1,
      minWidth: '30%',
      alignItems: 'center',
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      borderWidth: 2,
      borderColor: colors.border.light,
      backgroundColor: colors.background.secondary,
    },
    feelingButtonSelected: {
      borderColor: colors.primary.main,
      backgroundColor: colors.primary.light,
    },
    feelingEmoji: {
      fontSize: 32,
      marginBottom: Layout.spacing.xs,
    },
    feelingLabel: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
    feelingLabelSelected: {
      color: colors.primary.main,
      fontWeight: Typography.fontWeight.semibold,
    },
    noteInput: {
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      fontSize: Typography.fontSize.md,
      color: colors.text.primary,
      minHeight: 80,
    },
    characterCount: {
      fontSize: Typography.fontSize.xs,
      color: colors.text.disabled,
      textAlign: 'right',
      marginTop: Layout.spacing.xs,
    },
    visibilityGrid: {
      flexDirection: 'row',
      gap: Layout.spacing.sm,
    },
    visibilityButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      borderWidth: 2,
      borderColor: colors.border.light,
      backgroundColor: colors.background.secondary,
      gap: Layout.spacing.xs,
    },
    visibilityButtonSelected: {
      borderColor: colors.primary.main,
      backgroundColor: colors.primary.light,
    },
    visibilityLabel: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
    },
    visibilityLabelSelected: {
      color: colors.primary.main,
      fontWeight: Typography.fontWeight.semibold,
    },
    actions: {
      flexDirection: 'row',
      gap: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
      paddingTop: Layout.spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
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
    shareButton: {
      // backgroundColor set dynamically
    },
    shareButtonText: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.inverse,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });

