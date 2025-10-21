/**
 * Unit tests for TimePickerModal component
 * Tests time selection, modal interactions, and callbacks
 * MEDIUM PRIORITY - Time selection component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimePickerModal } from '../TimePickerModal';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('TimePickerModal', () => {
  const mockColors = {
    primary: {
      light: '#A8E6CF',
      main: '#4CAF50',
      dark: '#2E7D32',
    },
    secondary: {
      light: '#B3E5FC',
      main: '#03A9F4',
      dark: '#0277BD',
    },
    accent: {
      gold: '#FFD700',
      gray: '#9E9E9E',
      warning: '#FF9800',
    },
    surface: {
      card: '#FFFFFF',
      elevated: '#F5F5F5',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#FAFAFA',
    },
    text: {
      primary: '#000000',
      secondary: '#757575',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
    },
    border: {
      light: '#E0E0E0',
      main: '#BDBDBD',
      dark: '#9E9E9E',
    },
    system: {
      blue: '#007AFF',
      green: '#34C759',
      indigo: '#5856D6',
      orange: '#FF9500',
      pink: '#FF2D55',
      purple: '#AF52DE',
      red: '#FF3B30',
      teal: '#5AC8FA',
      yellow: '#FFCC00',
      gray: '#8E8E93',
      gray2: '#AEAEB2',
      gray3: '#C7C7CC',
      gray4: '#D1D1D6',
      gray5: '#E5E5EA',
      gray6: '#F2F2F7',
    },
  };

  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const initialTime = "09:30"; // 9:30 AM in HH:mm format

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render modal when visible is true', () => {
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId('timepicker-modal')).toBeTruthy();
    });

    it('should not render modal when visible is false', () => {
      const { queryByTestId } = render(
        <TimePickerModal
          visible={false}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(queryByTestId('timepicker-modal')).toBeNull();
    });

    it('should render confirm button', () => {
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId('confirm-button')).toBeTruthy();
    });

    it('should render cancel button', () => {
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId('cancel-button')).toBeTruthy();
    });
  });

  describe('Initial Time Handling', () => {
    it('should accept initial time in HH:mm format', () => {
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Component should render without errors when given valid time string
      // Note: We cannot test the DateTimePicker's internal state (native component)
      expect(getByTestId('timepicker-modal')).toBeTruthy();
    });

    it('should handle different initial times', () => {
      const afternoonTime = "14:45"; // 2:45 PM
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={afternoonTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Component should render without errors
      expect(getByTestId('timepicker-modal')).toBeTruthy();
    });
  });

  describe('User Interactions - Confirm', () => {
    it('should call onConfirm with time string when confirm button is pressed', () => {
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.press(getByTestId('confirm-button'));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('User Interactions - Cancel', () => {
    it('should call onCancel when cancel button is pressed', () => {
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.press(getByTestId('cancel-button'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onConfirm when cancel is pressed', () => {
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={initialTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.press(getByTestId('cancel-button'));
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle midnight time (12:00 AM)', () => {
      const midnight = "00:00";
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={midnight}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId('timepicker-modal')).toBeTruthy();
    });

    it('should handle noon time (12:00 PM)', () => {
      const noon = "12:00";
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={noon}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId('timepicker-modal')).toBeTruthy();
    });

    it('should handle time with zero minutes', () => {
      const hourTime = "09:00";
      const { getByTestId } = render(
        <TimePickerModal
          visible={true}
          initialTime={hourTime}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      expect(getByTestId('timepicker-modal')).toBeTruthy();
    });
  });
});

