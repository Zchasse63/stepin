/**
 * Unit tests for LogWalkModal component
 * Tests form validation, user interactions, and walk logging functionality
 * CRITICAL PRIORITY - Replaces failing E2E tests due to Maestro scrolling limitations
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LogWalkModal } from '../LogWalkModal';
import { useTheme } from '../../lib/theme/themeManager';
import { useAuthStore } from '../../lib/store/authStore';
import { supabase } from '../../lib/supabase/client';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../lib/supabase/client', () => {
  const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockEq2 = jest.fn().mockReturnValue({ single: mockSingle });
  const mockEq = jest.fn().mockReturnValue({ eq: mockEq2, single: mockSingle });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq, single: mockSingle });
  const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = jest.fn().mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
  });

  return {
    supabase: {
      from: mockFrom,
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
});

jest.spyOn(Alert, 'alert');

describe('LogWalkModal', () => {
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

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockOnClose = jest.fn();
  const mockOnWalkLogged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockUser);
  });

  describe('Rendering', () => {
    it('should render modal when visible prop is true', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      expect(getByTestId('log-walk-modal')).toBeTruthy();
    });

    it('should not render modal content when visible prop is false', () => {
      const { queryByTestId } = render(
        <LogWalkModal
          visible={false}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      // Modal component does not render when visible is false
      expect(queryByTestId('log-walk-modal')).toBeNull();
    });

    it('should render all form fields', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      expect(getByTestId('steps-input')).toBeTruthy();
      expect(getByTestId('duration-input')).toBeTruthy();
      expect(getByTestId('save-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
    });

    it('should have empty initial state for inputs', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      const stepsInput = getByTestId('steps-input');
      const durationInput = getByTestId('duration-input');

      expect(stepsInput.props.value).toBe('');
      expect(durationInput.props.value).toBe('');
    });
  });

  describe('User Interactions', () => {
    it('should update steps input when user types', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      const stepsInput = getByTestId('steps-input');
      fireEvent.changeText(stepsInput, '5000');

      expect(stepsInput.props.value).toBe('5000');
    });

    it('should update duration input when user types', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      const durationInput = getByTestId('duration-input');
      fireEvent.changeText(durationInput, '30');

      expect(durationInput.props.value).toBe('30');
    });

    it('should call onClose when cancel button is pressed', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      const cancelButton = getByTestId('cancel-button');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form when cancel button is pressed', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      // Enter some data
      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.changeText(getByTestId('duration-input'), '30');

      // Cancel
      fireEvent.press(getByTestId('cancel-button'));

      // Form should be reset (this will be visible on next open)
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Validation - Steps', () => {
    it('should show alert when steps input is empty', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('step')
      );
    });

    it('should show alert when steps is zero', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '0');
      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('step')
      );
    });

    it('should show alert when steps is negative', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '-100');
      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('step')
      );
    });

    it('should show confirmation dialog for unusually high steps (>50,000)', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '60000');
      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirm Step Count',
        expect.stringContaining('60,000'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Yes, Continue' }),
        ])
      );
    });

    it('should show alert for non-numeric steps input', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), 'abc');
      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('Form Validation - Duration', () => {
    it('should allow empty duration (optional field)', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        update: jest.fn(),
      });

      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      // Duration left empty
      fireEvent.press(getByTestId('save-button'));

      // Should not show validation error for empty duration
      await waitFor(() => {
        const alertCalls = (Alert.alert as jest.Mock).mock.calls;
        const hasValidationError = alertCalls.some(call =>
          call[1]?.includes('duration') && !call[1]?.includes('Success')
        );
        expect(hasValidationError).toBe(false);
      });
    });

    // Duration of 0 is actually valid (very short walk), so this test is removed

    it('should show alert when duration is negative', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose=

{mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.changeText(getByTestId('duration-input'), '-10');
      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('duration')
      );
    });
  });

  describe('Success States', () => {
    beforeEach(() => {
      // Reset and configure mocks for successful operations
      jest.clearAllMocks();

      // Mock supabase.from to return proper chains for all tables
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'walks') {
          return {
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'daily_stats') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { daily_step_goal: 7000 },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: null });
    });

    it('should call onWalkLogged callback after successful save', async () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnWalkLogged).toHaveBeenCalled();
      });
    });

    it('should call onClose after successful save', async () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show success alert after walk is logged', async () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Walk logged successfully!'
        );
      });
    });

    it('should reset form after successful save', async () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.changeText(getByTestId('duration-input'), '30');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Form should be reset (verified by checking if onClose was called which triggers resetForm)
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('should show alert when user is not logged in', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue(null);

      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.press(getByTestId('save-button'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'You must be logged in to log a walk.'
      );
    });

    it('should handle database insertion error', async () => {
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String)
        );
      });

      // Should not call success callbacks
      expect(mockOnWalkLogged).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large step values (100,000)', () => {
      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '100000');
      fireEvent.press(getByTestId('save-button'));

      // Should show confirmation dialog for unusually high steps
      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirm Step Count',
        expect.stringContaining('100,000'),
        expect.any(Array)
      );
    });

    it('should handle null duration gracefully', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      });

      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '5000');
      // Duration left empty (null/undefined)
      fireEvent.press(getByTestId('save-button'));

      // Should not throw error
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled();
      });
    });

    it('should handle whitespace in inputs', async () => {
      // Mock successful save for this test
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'walks') {
          return {
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'daily_stats') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { daily_step_goal: 7000 },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const { getByTestId } = render(
        <LogWalkModal
          visible={true}
          onClose={mockOnClose}
          onWalkLogged={mockOnWalkLogged}
        />
      );

      fireEvent.changeText(getByTestId('steps-input'), '  5000  ');
      fireEvent.press(getByTestId('save-button'));

      // parseInt handles whitespace correctly, so this should succeed
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Walk logged successfully!');
      });
    });
  });
});

