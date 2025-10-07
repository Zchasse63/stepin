/**
 * Log Walk Modal Component
 * Bottom sheet modal for manually logging walks
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { supabase } from '../lib/supabase/client';
import { useAuthStore } from '../lib/store/authStore';
import { validation, getErrorMessage, getUserFriendlyError } from '../lib/utils/errorMessages';
import { logger } from '../lib/utils/logger';

interface LogWalkModalProps {
  visible: boolean;
  onClose: () => void;
  onWalkLogged?: () => void;
}

export function LogWalkModal({ visible, onClose, onWalkLogged }: LogWalkModalProps) {
  const { colors } = useTheme();
  const [steps, setSteps] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const resetForm = () => {
    setSteps('');
    setDuration('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    // Validate inputs
    const stepsNum = parseInt(steps, 10);
    const durationNum = duration ? parseInt(duration, 10) : undefined;

    if (!stepsNum || stepsNum <= 0) {
      const error = getErrorMessage('INVALID_STEPS');
      Alert.alert(error.title, error.message);
      return;
    }

    // Validate step count
    const stepsValidation = validation.steps(stepsNum);
    if (!stepsValidation.valid && stepsValidation.error) {
      const error = getErrorMessage(stepsValidation.error);
      Alert.alert(error.title, error.message);
      return;
    }

    // Warn if unusually high
    if (validation.isUnusuallyHigh(stepsNum)) {
      Alert.alert(
        'Confirm Step Count',
        `${stepsNum.toLocaleString()} steps is quite high. Are you sure this is correct?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Continue', onPress: () => proceedWithSave(stepsNum, durationNum) },
        ]
      );
      return;
    }

    // Validate duration
    if (durationNum !== undefined) {
      const durationValidation = validation.duration(durationNum);
      if (!durationValidation.valid && durationValidation.error) {
        const error = getErrorMessage(durationValidation.error);
        Alert.alert(error.title, error.message);
        return;
      }
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to log a walk.');
      return;
    }

    await proceedWithSave(stepsNum, durationNum);
  };

  const proceedWithSave = async (stepsNum: number, durationNum: number | undefined) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to log a walk.');
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Calculate estimated distance (rough estimate: 0.762 meters per step)
      const distanceMeters = stepsNum * 0.762;

      // Insert walk record
      const { error: walkError } = await supabase.from('walks').insert({
        user_id: user.id,
        date: today,
        steps: stepsNum,
        duration_minutes: durationNum,
        distance_meters: distanceMeters,
      });

      if (walkError) {
        throw walkError;
      }

      // Update or insert daily stats
      const { data: existingStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const newTotalSteps = (existingStats?.total_steps || 0) + stepsNum;

      // Get user's step goal
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_step_goal')
        .eq('id', user.id)
        .single();

      const goalMet = newTotalSteps >= (profile?.daily_step_goal || 7000);

      if (existingStats) {
        // Update existing stats
        const { error: updateError } = await supabase
          .from('daily_stats')
          .update({
            total_steps: newTotalSteps,
            goal_met: goalMet,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingStats.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new stats
        const { error: insertError } = await supabase.from('daily_stats').insert({
          user_id: user.id,
          date: today,
          total_steps: newTotalSteps,
          goal_met: goalMet,
        });

        if (insertError) {
          throw insertError;
        }
      }

      // Update streak if goal met
      if (goalMet) {
        await supabase.rpc('update_streak', {
          user_uuid: user.id,
          activity_date: today,
        });
      }

      Alert.alert('Success', 'Walk logged successfully!');
      resetForm();
      onWalkLogged?.();
      onClose();
    } catch (error) {
      logger.error('Error logging walk:', error);
      const friendlyError = getUserFriendlyError(error);
      Alert.alert(friendlyError.title, friendlyError.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.modalContent}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Log a Walk</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>Didn't wear your phone? Add your walk manually.</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Steps *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 5000"
                placeholderTextColor={colors.text.disabled}
                keyboardType="number-pad"
                value={steps}
                onChangeText={setSteps}
                maxLength={6}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 45"
                placeholderTextColor={colors.text.disabled}
                keyboardType="number-pad"
                value={duration}
                onChangeText={setDuration}
                maxLength={4}
              />
            </View>

            <Text style={styles.footnote}>* Required field</Text>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Walk'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleClose} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: Layout.borderRadius.large,
    borderTopRightRadius: Layout.borderRadius.large,
    paddingHorizontal: Layout.spacing.large,
    paddingBottom: Layout.spacing.xlarge,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.main,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Layout.spacing.medium,
    marginBottom: Layout.spacing.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.small,
  },
  title: {
    ...Typography.largeTitle,
    color: colors.text.primary,
  },
  closeButton: {
    padding: Layout.spacing.small,
  },
  subtitle: {
    ...Typography.body,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.large,
  },
  inputContainer: {
    marginBottom: Layout.spacing.large,
  },
  label: {
    ...Typography.headline,
    color: colors.text.primary,
    marginBottom: Layout.spacing.small,
  },
  input: {
    ...Typography.body,
    backgroundColor: colors.background.tertiary,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.medium,
    borderWidth: 1,
    borderColor: colors.border.light,
    color: colors.text.primary,
    minHeight: Layout.touchTarget.minimum,
  },
  footnote: {
    ...Typography.caption2,
    color: colors.text.secondary,
    marginBottom: Layout.spacing.large,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    borderRadius: Layout.borderRadius.medium,
    paddingVertical: Layout.spacing.medium,
    alignItems: 'center',
    minHeight: Layout.touchTarget.minimum,
    justifyContent: 'center',
    marginBottom: Layout.spacing.small,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  saveButtonText: {
    ...Typography.headline,
    color: colors.text.inverse,
  },
  cancelButton: {
    paddingVertical: Layout.spacing.medium,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: colors.system.blue,
  },
});

