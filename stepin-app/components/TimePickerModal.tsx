/**
 * TimePickerModal Component
 * iOS-style bottom sheet for selecting notification reminder time
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, ThemeColors } from '../lib/theme/themeManager';
import { Typography } from '../constants/Typography';

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string; // Format: "HH:mm" (e.g., "09:00")
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

export function TimePickerModal({
  visible,
  initialTime,
  onConfirm,
  onCancel,
}: TimePickerModalProps) {
  const { colors } = useTheme();
  // Parse initial time to Date object
  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Format Date object to "HH:mm" string
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [selectedTime, setSelectedTime] = useState<Date>(parseTime(initialTime));

  const handleConfirm = () => {
    onConfirm(formatTime(selectedTime));
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
  };

  const styles = React.useMemo(() => createStyles(colors), [colors]);


  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.button}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Reminder Time</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.button}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              textColor={colors.text.primary}
              style={styles.picker}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for home indicator
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
  button: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
  },
  title: {
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
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.system.blue,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'right',
  },
  pickerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 200,
  },
});

