/**
 * Unit tests for EditWalkModal
 * Tests edit walk functionality with date/time pickers and form validation
 * CRITICAL PRIORITY - Complex modal with date/time interactions
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { EditWalkModal } from '../EditWalkModal';
import { useTheme } from '../../lib/theme/themeManager';
import type { Walk } from '../../types/walk';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.spyOn(Alert, 'alert');

describe('EditWalkModal', () => {
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

  const mockWalk: Walk = {
    id: 'walk-123',
    user_id: 'user-123',
    steps: 5000,
    distance_meters: 3500,
    duration_minutes: 45,
    start_time: '2024-01-15T10:30:00Z',
    end_time: '2024-01-15T11:15:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    mockOnSave.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render modal when visible with walk data', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      expect(getByTestId('edit-walk-modal')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByTestId } = render(
        <EditWalkModal visible={false} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      expect(queryByTestId('edit-walk-modal')).toBeNull();
    });

    it('should not render when walk is null', () => {
      const { queryByTestId } = render(
        <EditWalkModal visible={true} walk={null} onClose={mockOnClose} onSave={mockOnSave} />
      );
      expect(queryByTestId('edit-walk-modal')).toBeNull();
    });

    it('should render all form fields', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      expect(getByTestId('steps-input')).toBeTruthy();
      expect(getByTestId('distance-input')).toBeTruthy();
      expect(getByTestId('duration-input')).toBeTruthy();
      expect(getByTestId('date-picker-button')).toBeTruthy();
      expect(getByTestId('time-picker-button')).toBeTruthy();
    });

    it('should pre-populate form with walk data', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      const stepsInput = getByTestId('steps-input');
      const distanceInput = getByTestId('distance-input');
      const durationInput = getByTestId('duration-input');
      
      expect(stepsInput.props.value).toBe('5000');
      expect(distanceInput.props.value).toBe('3.50');
      expect(durationInput.props.value).toBe('45');
    });

    it('should render save and cancel buttons', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      expect(getByTestId('save-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should update steps input when user types', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      const stepsInput = getByTestId('steps-input');
      fireEvent.changeText(stepsInput, '7500');
      
      expect(stepsInput.props.value).toBe('7500');
    });

    it('should update distance input when user types', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      const distanceInput = getByTestId('distance-input');
      fireEvent.changeText(distanceInput, '5.25');
      
      expect(distanceInput.props.value).toBe('5.25');
    });

    it('should update duration input when user types', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      const durationInput = getByTestId('duration-input');
      fireEvent.changeText(durationInput, '60');
      
      expect(durationInput.props.value).toBe('60');
    });

    it('should call onClose when cancel button is pressed', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      fireEvent.press(getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Validation - Steps', () => {
    it('should show alert when steps is empty', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      fireEvent.changeText(getByTestId('steps-input'), '');
      fireEvent.press(getByTestId('save-button'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid number of steps.'
      );
    });

    it('should show alert when steps is negative', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      fireEvent.changeText(getByTestId('steps-input'), '-100');
      fireEvent.press(getByTestId('save-button'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid number of steps.'
      );
    });

    it('should show alert when steps is not a number', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      fireEvent.changeText(getByTestId('steps-input'), 'abc');
      fireEvent.press(getByTestId('save-button'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid number of steps.'
      );
    });
  });

  describe('Form Validation - Distance', () => {
    it('should allow empty distance (optional field)', async () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      fireEvent.changeText(getByTestId('distance-input'), '');
      fireEvent.press(getByTestId('save-button'));
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should show alert when distance is negative', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      fireEvent.changeText(getByTestId('distance-input'), '-5.5');
      fireEvent.press(getByTestId('save-button'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid distance.'
      );
    });

    it('should show alert when distance is not a number', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );
      
      fireEvent.changeText(getByTestId('distance-input'), 'abc');
      fireEvent.press(getByTestId('save-button'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid distance.'
      );
    });
  });

  describe('Form Validation - Duration', () => {
    it('should allow empty duration (optional field)', async () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.changeText(getByTestId('duration-input'), '');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should show alert when duration is negative', () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.changeText(getByTestId('duration-input'), '-30');
      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid duration.'
      );
    });
  });

  describe('Success States', () => {
    it('should call onSave with updated walk data', async () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.changeText(getByTestId('steps-input'), '8000');
      fireEvent.changeText(getByTestId('distance-input'), '6.0');
      fireEvent.changeText(getByTestId('duration-input'), '60');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          'walk-123',
          expect.objectContaining({
            steps: 8000,
            distance_meters: 6000,
            duration_minutes: 60,
          })
        );
      });
    });

    it('should call onClose after successful save', async () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should disable save button while saving', async () => {
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);

      expect(saveButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Error States', () => {
    it('should show error alert when save fails', async () => {
      mockOnSave.mockRejectedValue(new Error('Network error'));

      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to update walk. Please try again.'
        );
      });
    });

    it('should not call onClose when save fails', async () => {
      mockOnSave.mockRejectedValue(new Error('Network error'));
      const onCloseSpy = jest.fn();

      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={onCloseSpy} onSave={mockOnSave} />
      );

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      expect(onCloseSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle walk with missing optional fields', () => {
      const walkWithoutOptionals: Walk = {
        ...mockWalk,
        distance_meters: undefined,
        duration_minutes: undefined,
      };

      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={walkWithoutOptionals} onClose={mockOnClose} onSave={mockOnSave} />
      );

      const distanceInput = getByTestId('distance-input');
      const durationInput = getByTestId('duration-input');

      expect(distanceInput.props.value).toBe('');
      expect(durationInput.props.value).toBe('');
    });

    it('should handle very large step values', async () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.changeText(getByTestId('steps-input'), '999999');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          'walk-123',
          expect.objectContaining({ steps: 999999 })
        );
      });
    });

    it('should convert distance from km to meters correctly', async () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.changeText(getByTestId('distance-input'), '2.5');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          'walk-123',
          expect.objectContaining({ distance_meters: 2500 })
        );
      });
    });

    it('should handle decimal distance values', async () => {
      const { getByTestId } = render(
        <EditWalkModal visible={true} walk={mockWalk} onClose={mockOnClose} onSave={mockOnSave} />
      );

      fireEvent.changeText(getByTestId('distance-input'), '3.75');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          'walk-123',
          expect.objectContaining({ distance_meters: 3750 })
        );
      });
    });
  });
});

