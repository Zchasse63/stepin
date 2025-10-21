/**
 * Unit tests for SignUpScreen
 * Tests registration form, validation, and account creation
 * CRITICAL PRIORITY - Registration screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignUpScreen from '../sign-up';
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
    replace: jest.fn(),
  })),
}));

jest.spyOn(Alert, 'alert');

describe('SignUpScreen', () => {
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

  const mockSignUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useAuthStore as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
    });
  });

  describe('Rendering', () => {
    it('should render sign up screen', () => {
      const { getByTestId } = render(<SignUpScreen />);
      expect(getByTestId('sign-up-screen')).toBeTruthy();
    });

    it('should render email input', () => {
      const { getByTestId } = render(<SignUpScreen />);
      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('should render password input', () => {
      const { getByTestId } = render(<SignUpScreen />);
      expect(getByTestId('password-input')).toBeTruthy();
    });

    it('should render confirm password input', () => {
      const { getByTestId } = render(<SignUpScreen />);
      expect(getByTestId('confirm-password-input')).toBeTruthy();
    });

    it('should render sign up button', () => {
      const { getByTestId } = render(<SignUpScreen />);
      expect(getByTestId('sign-up-button')).toBeTruthy();
    });

    it('should render sign in link', () => {
      const { getByTestId } = render(<SignUpScreen />);
      expect(getByTestId('sign-in-link')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update email input', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      
      expect(getByTestId('email-input').props.value).toBe('john@example.com');
    });

    it('should update password input', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      
      expect(getByTestId('password-input').props.value).toBe('password123');
    });

    it('should update confirm password input', () => {
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      
      expect(getByTestId('confirm-password-input').props.value).toBe('password123');
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email', async () => {
      const { getByTestId, getByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByTestId('sign-up-button'));
      
      await waitFor(() => {
        expect(getByText(/invalid email/i)).toBeTruthy();
      });
    });

    it('should show error for short password', async () => {
      const { getByTestId, getByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), '123');
      fireEvent.press(getByTestId('sign-up-button'));
      
      await waitFor(() => {
        expect(getByText(/password.*6 characters/i)).toBeTruthy();
      });
    });

    it('should show error when passwords do not match', async () => {
      const { getByTestId, getByText } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password456');
      fireEvent.press(getByTestId('sign-up-button'));
      
      await waitFor(() => {
        expect(getByText(/passwords.*match/i)).toBeTruthy();
      });
    });
  });

  describe('Sign Up Submission', () => {
    it('should call signUp with email and password', async () => {
      mockSignUp.mockResolvedValue({ success: true });
      
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('sign-up-button'));
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'password123');
      });
    });

    it('should show loading state while signing up', async () => {
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('sign-up-button'));
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should navigate to onboarding on successful sign up', async () => {
      mockSignUp.mockResolvedValue({ success: true });
      const mockRouter = { replace: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('sign-up-button'));
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(auth)/onboarding');
      });
    });

    it('should show error on failed sign up', async () => {
      mockSignUp.mockRejectedValue(new Error('Email already exists'));
      
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      fireEvent.press(getByTestId('sign-up-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('Email already exists')
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to sign in screen', () => {
      const mockRouter = { push: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<SignUpScreen />);
      
      fireEvent.press(getByTestId('sign-in-link'));
      expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/sign-in');
    });
  });
});

