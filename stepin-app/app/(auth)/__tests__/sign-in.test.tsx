/**
 * Unit tests for SignInScreen
 * Tests authentication form, validation, and navigation
 * CRITICAL PRIORITY - Authentication screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignInScreen from '../sign-in';
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

describe('SignInScreen', () => {
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

  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useAuthStore as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
    });
  });

  describe('Rendering', () => {
    it('should render sign in screen', () => {
      const { getByTestId } = render(<SignInScreen />);
      expect(getByTestId('sign-in-screen')).toBeTruthy();
    });

    it('should render email input', () => {
      const { getByTestId } = render(<SignInScreen />);
      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('should render password input', () => {
      const { getByTestId } = render(<SignInScreen />);
      expect(getByTestId('password-input')).toBeTruthy();
    });

    it('should render sign in button', () => {
      const { getByTestId } = render(<SignInScreen />);
      expect(getByTestId('sign-in-button')).toBeTruthy();
    });

    it('should render forgot password link', () => {
      const { getByTestId } = render(<SignInScreen />);
      expect(getByTestId('forgot-password-link')).toBeTruthy();
    });

    it('should render sign up link', () => {
      const { getByTestId } = render(<SignInScreen />);
      expect(getByTestId('sign-up-link')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update email input', () => {
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      
      expect(getByTestId('email-input').props.value).toBe('john@example.com');
    });

    it('should update password input', () => {
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      
      expect(getByTestId('password-input').props.value).toBe('password123');
    });

    it('should mask password input', () => {
      const { getByTestId } = render(<SignInScreen />);
      
      const passwordInput = getByTestId('password-input');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email', async () => {
      const { getByTestId, getByText } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
      fireEvent.press(getByTestId('sign-in-button'));
      
      await waitFor(() => {
        expect(getByText(/invalid email/i)).toBeTruthy();
      });
    });

    it('should show error for empty email', async () => {
      const { getByTestId, getByText } = render(<SignInScreen />);
      
      fireEvent.press(getByTestId('sign-in-button'));
      
      await waitFor(() => {
        expect(getByText(/email.*required/i)).toBeTruthy();
      });
    });

    it('should show error for empty password', async () => {
      const { getByTestId, getByText } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.press(getByTestId('sign-in-button'));
      
      await waitFor(() => {
        expect(getByText(/password.*required/i)).toBeTruthy();
      });
    });
  });

  describe('Sign In Submission', () => {
    it('should call signIn with email and password', async () => {
      mockSignIn.mockResolvedValue({ success: true });
      
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('sign-in-button'));
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('john@example.com', 'password123');
      });
    });

    it('should show loading state while signing in', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('sign-in-button'));
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should disable button while loading', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('sign-in-button'));
      
      const button = getByTestId('sign-in-button');
      expect(button.props.disabled).toBe(true);
    });

    it('should navigate to home on successful sign in', async () => {
      mockSignIn.mockResolvedValue({ success: true });
      const mockRouter = { replace: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('sign-in-button'));
      
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should show error on failed sign in', async () => {
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));
      
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.changeText(getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByTestId('sign-in-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('Invalid credentials')
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to forgot password screen', () => {
      const mockRouter = { push: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.press(getByTestId('forgot-password-link'));
      expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/forgot-password');
    });

    it('should navigate to sign up screen', () => {
      const mockRouter = { push: jest.fn() };
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      
      const { getByTestId } = render(<SignInScreen />);
      
      fireEvent.press(getByTestId('sign-up-link'));
      expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/sign-up');
    });
  });
});

