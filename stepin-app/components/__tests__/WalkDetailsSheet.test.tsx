/**
 * Unit tests for WalkDetailsSheet
 * Tests walk details bottom sheet display and interactions
 * CRITICAL PRIORITY - Bottom sheet modal with walk data display
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import WalkDetailsSheet from '../WalkDetailsSheet';
import { useTheme } from '../../lib/theme/themeManager';
import type { Walk } from '../../types/database';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/utils/calculateStats', () => ({
  formatDateDisplay: jest.fn((date: string, format: string) => {
    if (format === 'EEEE, MMMM d, yyyy') return 'Monday, January 15, 2024';
    if (format === 'MMM d, yyyy h:mm a') return 'Jan 15, 2024 10:30 AM';
    return date;
  }),
  formatDuration: jest.fn((minutes: number) => `${minutes} min`),
}));

jest.mock('../../lib/utils/formatDistance', () => ({
  formatDistance: jest.fn((meters: number, units: string) => {
    if (units === 'miles') return `${(meters / 1609.34).toFixed(2)} mi`;
    return `${(meters / 1000).toFixed(2)} km`;
  }),
}));

jest.mock('../HeartRateAnalytics', () => ({
  HeartRateAnalytics: () => null,
}));

jest.spyOn(Alert, 'alert');

describe('WalkDetailsSheet', () => {
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
    date: '2024-01-15',
    start_time: '2024-01-15T10:30:00Z',
    end_time: '2024-01-15T11:15:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  };

  const mockOnClose = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

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
    it('should render sheet when visible with walk data', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('walk-details-sheet')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByTestId } = render(
        <WalkDetailsSheet
          visible={false}
          walk={mockWalk}
          onClose={mockOnClose}
        />
      );
      expect(queryByTestId('walk-details-sheet')).toBeNull();
    });

    it('should not render when walk is null', () => {
      const { queryByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={null}
          onClose={mockOnClose}
        />
      );
      expect(queryByTestId('walk-details-sheet')).toBeNull();
    });

    it('should display all walk data fields', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
        />
      );
      
      expect(getByTestId('steps-display')).toBeTruthy();
      expect(getByTestId('duration-display')).toBeTruthy();
      expect(getByTestId('distance-display')).toBeTruthy();
      expect(getByTestId('date-display')).toBeTruthy();
    });

    it('should format steps with thousands separator', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
        />
      );
      
      const stepsDisplay = getByTestId('steps-display');
      expect(stepsDisplay.props.children).toBe('5,000');
    });

    it('should render close button', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
        />
      );
      
      expect(getByTestId('close-button')).toBeTruthy();
    });

    it('should render edit button when onEdit provided', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
          onEdit={mockOnEdit}
        />
      );
      
      expect(getByTestId('edit-button')).toBeTruthy();
    });

    it('should render delete button when onDelete provided', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      
      expect(getByTestId('delete-button')).toBeTruthy();
    });

    it('should not render edit button when onEdit not provided', () => {
      const { queryByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
        />
      );
      
      expect(queryByTestId('edit-button')).toBeNull();
    });

    it('should not render delete button when onDelete not provided', () => {
      const { queryByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
        />
      );
      
      expect(queryByTestId('delete-button')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is pressed', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
        />
      );
      
      fireEvent.press(getByTestId('close-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onEdit and onClose when edit button is pressed', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
          onEdit={mockOnEdit}
        />
      );
      
      fireEvent.press(getByTestId('edit-button'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockWalk);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show confirmation alert when delete button is pressed', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      
      fireEvent.press(getByTestId('delete-button'));
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Walk',
        'Are you sure you want to delete this walk? This action cannot be undone.',
        expect.any(Array)
      );
    });

    it('should call onDelete and onClose when delete is confirmed', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      
      fireEvent.press(getByTestId('delete-button'));
      
      // Get the alert buttons and trigger the delete action
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deleteButton = alertCall[2].find((btn: any) => btn.text === 'Delete');
      deleteButton.onPress();
      
      expect(mockOnDelete).toHaveBeenCalledWith(mockWalk);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onDelete when delete is cancelled', () => {
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={mockWalk}
          onClose={mockOnClose}
          onDelete={mockOnDelete}
        />
      );
      
      fireEvent.press(getByTestId('delete-button'));
      
      // Get the alert buttons and trigger the cancel action
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const cancelButton = alertCall[2].find((btn: any) => btn.text === 'Cancel');
      if (cancelButton.onPress) cancelButton.onPress();
      
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('Conditional Rendering', () => {
    it('should show "Not recorded" when duration is missing', () => {
      const walkWithoutDuration = { ...mockWalk, duration_minutes: undefined };
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={walkWithoutDuration}
          onClose={mockOnClose}
        />
      );
      
      const durationDisplay = getByTestId('duration-display');
      expect(durationDisplay.props.children).toBe('Not recorded');
    });

    it('should show "Not recorded" when distance is missing', () => {
      const walkWithoutDistance = { ...mockWalk, distance_meters: undefined };
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={walkWithoutDistance}
          onClose={mockOnClose}
        />
      );
      
      const distanceDisplay = getByTestId('distance-display');
      expect(distanceDisplay.props.children).toBe('Not recorded');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large step counts', () => {
      const walkWithLargeSteps = { ...mockWalk, steps: 999999 };
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={walkWithLargeSteps}
          onClose={mockOnClose}
        />
      );
      
      const stepsDisplay = getByTestId('steps-display');
      expect(stepsDisplay.props.children).toBe('999,999');
    });

    it('should handle zero steps', () => {
      const walkWithZeroSteps = { ...mockWalk, steps: 0 };
      const { getByTestId } = render(
        <WalkDetailsSheet
          visible={true}
          walk={walkWithZeroSteps}
          onClose={mockOnClose}
        />
      );
      
      const stepsDisplay = getByTestId('steps-display');
      expect(stepsDisplay.props.children).toBe('0');
    });
  });
});

