/**
 * Edit Walk Modal
 * Allows users to edit walk details (steps, distance, duration, date/time)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';
import { Layout } from '../constants/Layout';
import type { Walk } from '../types/walk';

interface EditWalkModalProps {
  visible: boolean;
  walk: Walk | null;
  onClose: () => void;
  onSave: (walkId: string, updates: Partial<Walk>) => Promise<void>;
}

export function EditWalkModal({ visible, walk, onClose, onSave }: EditWalkModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [steps, setSteps] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form when walk changes
  useEffect(() => {
    if (walk) {
      setSteps(walk.steps?.toString() || '');
      setDistance(walk.distance_meters ? (walk.distance_meters / 1000).toFixed(2) : '');
      setDuration(walk.duration_minutes?.toString() || '');
      setStartTime(new Date(walk.start_time));
    }
  }, [walk]);

  const handleSave = async () => {
    if (!walk) return;

    // Validation
    const stepsNum = parseInt(steps, 10);
    const distanceNum = parseFloat(distance);
    const durationNum = parseInt(duration, 10);

    if (isNaN(stepsNum) || stepsNum < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of steps.');
      return;
    }

    if (distance && (isNaN(distanceNum) || distanceNum < 0)) {
      Alert.alert('Invalid Input', 'Please enter a valid distance.');
      return;
    }

    if (duration && (isNaN(durationNum) || durationNum < 0)) {
      Alert.alert('Invalid Input', 'Please enter a valid duration.');
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<Walk> = {
        steps: stepsNum,
        distance_meters: distanceNum * 1000,
        duration_minutes: durationNum,
        start_time: startTime.toISOString(),
      };

      await onSave(walk.id, updates);
      setSaving(false);
      onClose();
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to update walk. Please try again.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(startTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartTime(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newTime = new Date(startTime);
      newTime.setHours(selectedTime.getHours());
      newTime.setMinutes(selectedTime.getMinutes());
      setStartTime(newTime);
    }
  };

  if (!walk) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      testID="edit-walk-modal"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity testID="cancel-button" onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="x" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Walk</Text>
          <TouchableOpacity
            testID="save-button"
            onPress={handleSave}
            disabled={saving}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Steps Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Steps *</Text>
            <TextInput
              testID="steps-input"
              style={styles.input}
              value={steps}
              onChangeText={setSteps}
              keyboardType="number-pad"
              placeholder="Enter steps"
              placeholderTextColor={colors.text.disabled}
              accessibilityLabel="Steps input"
            />
          </View>

          {/* Distance Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Distance (km)</Text>
            <TextInput
              testID="distance-input"
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
              placeholder="Enter distance"
              placeholderTextColor={colors.text.disabled}
              accessibilityLabel="Distance input"
            />
          </View>

          {/* Duration Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              testID="duration-input"
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="Enter duration"
              placeholderTextColor={colors.text.disabled}
              accessibilityLabel="Duration input"
            />
          </View>

          {/* Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              testID="date-picker-button"
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              accessibilityLabel="Select date"
              accessibilityRole="button"
            >
              <Feather name="calendar" size={20} color={colors.text.secondary} />
              <Text style={styles.dateText}>
                {startTime.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              testID="time-picker-button"
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
              accessibilityLabel="Select time"
              accessibilityRole="button"
            >
              <Feather name="clock" size={20} color={colors.text.secondary} />
              <Text style={styles.dateText}>
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            * Required field. Editing a walk will recalculate your daily stats and streak.
          </Text>
        </ScrollView>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={startTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Layout.spacing.lg,
      paddingVertical: Layout.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.primary,
    },
    headerTitle: {
      ...Typography.h3,
      color: colors.text.primary,
    },
    saveButton: {
      ...Typography.body,
      color: colors.primary.main,
      fontWeight: Typography.fontWeight.semibold,
    },
    saveButtonDisabled: {
      color: colors.text.disabled,
    },
    content: {
      flex: 1,
      padding: Layout.spacing.lg,
    },
    inputGroup: {
      marginBottom: Layout.spacing.lg,
    },
    label: {
      ...Typography.body,
      color: colors.text.primary,
      fontWeight: Typography.fontWeight.medium,
      marginBottom: Layout.spacing.sm,
    },
    input: {
      ...Typography.body,
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.primary,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      borderWidth: 1,
      borderColor: colors.border.primary,
      gap: Layout.spacing.sm,
    },
    dateText: {
      ...Typography.body,
      color: colors.text.primary,
    },
    infoText: {
      ...Typography.caption1,
      color: colors.text.secondary,
      marginTop: Layout.spacing.md,
      fontStyle: 'italic',
    },
  });

