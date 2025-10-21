/**
 * Unit tests for ForgotPasswordScreen
 * Tests password reset flow and email validation
 * MEDIUM PRIORITY - Password recovery screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ForgotPasswordScreen from '../forgot-password';
import { useTheme } from '../../../lib/theme/themeManager';
import { useAuthStore } from '../../../lib/store/authStore';

// Mock dependencies
jest.mock('../../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../lib/store/authStore');

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.spyOn(Alert, 'alert');

describe('ForgotPasswordScreen', () => {
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

  const mockResetPassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useAuthStore as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
    });
  });

  describe('Rendering', () => {
    it('should render forgot password screen', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);
      expect(getByTestId('forgot-password-screen')).toBeTruthy();
    });

    it('should render email input', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);
      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('should render reset button', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);
      expect(getByTestId('reset-button')).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);
      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('Email Input', () => {
    it('should update email input', () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      
      expect(getByTestId('email-input').props.value).toBe('john@example.com');
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email', async () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByTestId('reset-button'));
      
      await waitFor(() => {
        expect(getByText(/invalid email/i)).toBeTruthy();
      });
    });

    it('should show error for empty email', async () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);
      
      fireEvent.press(getByTestId('reset-button'));
      
      await waitFor(() => {
        expect(getByText(/email.*required/i)).toBeTruthy();
      });
    });
  });

  describe('Password Reset Submission', () => {
    it('should call resetPassword with email', async () => {
      mockResetPassword.mockResolvedValue({ success: true });
      
      const { getByTestId } = render(<ForgotPasswordScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.press(getByTestId('reset-button'));
      
      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('john@example.com');
      });
    });

    it('should show loading state while resetting', async () => {
      mockResetPassword.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      const { getByTestId } = render(<ForgotPasswordScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.press(getByTestId('reset-button'));
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should show success message on successful reset', async () => {
      mockResetPassword.mockResolvedValue({ success: true });
      
      const { getByTestId } = render(<ForgotPasswordScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.press(getByTestId('reset-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('check your email')
        );
      });
    });

    it('should show error on failed reset', async () => {
      mockResetPassword.mockRejectedValue(new Error('Email not found'));
      
      const { getByTestId } = render(<ForgotPasswordScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.press(getByTestId('reset-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('Email not found')
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', () => {
      const mockRouter = { back: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<ForgotPasswordScreen />);
      
      fireEvent.press(getByTestId('back-button'));
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});

