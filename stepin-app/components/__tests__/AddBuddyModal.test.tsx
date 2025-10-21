/**
 * Unit tests for AddBuddyModal
 * Tests buddy request sending with email validation
 * CRITICAL PRIORITY - Social features
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AddBuddyModal } from '../AddBuddyModal';
import { useTheme } from '../../lib/theme/themeManager';
import { useSocialStore } from '../../lib/store/socialStore';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/store/socialStore', () => ({
  useSocialStore: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('AddBuddyModal', () => {
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

  const mockSendBuddyRequest = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useSocialStore as jest.Mock).mockReturnValue({
      sendBuddyRequest: mockSendBuddyRequest,
      loading: false,
    });
    jest.spyOn(Alert, 'alert');
  });

  describe('Rendering', () => {
    it('should render modal when visible', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      expect(getByTestId('add-buddy-modal')).toBeTruthy();
    });

    it('should render email input field', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('should render send button', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      expect(getByTestId('send-button')).toBeTruthy();
    });

    it('should render cancel button', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      expect(getByTestId('cancel-button')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should disable send button when email is empty', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const sendButton = getByTestId('send-button');
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should enable send button when email is entered', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      const sendButton = getByTestId('send-button');
      expect(sendButton.props.accessibilityState.disabled).toBe(false);
    });

    it('should disable send button for whitespace-only email', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );

      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, '   '); // Whitespace only

      const sendButton = getByTestId('send-button');
      // Button should be disabled when email is only whitespace
      expect(sendButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should show error alert for invalid email format', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'notanemail');
      
      const sendButton = getByTestId('send-button');
      fireEvent.press(sendButton);
      
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    });

    it('should accept valid email format', async () => {
      mockSendBuddyRequest.mockResolvedValue(undefined);
      
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      const sendButton = getByTestId('send-button');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(mockSendBuddyRequest).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('User Interactions', () => {
    it('should update email input value', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'friend@example.com');
      
      expect(emailInput.props.value).toBe('friend@example.com');
    });

    it('should call onClose when cancel button is pressed', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      fireEvent.press(getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is pressed', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      fireEvent.press(getByTestId('close-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset email when modal is closed', () => {
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(getByTestId('cancel-button'));
      
      expect(emailInput.props.value).toBe('');
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when submitting', async () => {
      mockSendBuddyRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      const sendButton = getByTestId('send-button');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(getByTestId('loading-indicator')).toBeTruthy();
      });
    });

    it('should disable send button while submitting', async () => {
      mockSendBuddyRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      const sendButton = getByTestId('send-button');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(sendButton.props.accessibilityState.disabled).toBe(true);
      });
    });
  });

  describe('Success States', () => {
    it('should show success alert after sending request', async () => {
      mockSendBuddyRequest.mockResolvedValue(undefined);
      
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      
      fireEvent.press(getByTestId('send-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Buddy Request Sent!',
          expect.any(String),
          expect.any(Array)
        );
      });
    });

    it('should reset form after successful submission', async () => {
      mockSendBuddyRequest.mockResolvedValue(undefined);
      
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(getByTestId('send-button'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
      
      // Simulate pressing OK on success alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      okButton.onPress();
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    it('should handle send error gracefully', async () => {
      mockSendBuddyRequest.mockRejectedValue(new Error('User not found'));
      
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'notfound@example.com');
      
      fireEvent.press(getByTestId('send-button'));
      
      await waitFor(() => {
        expect(mockSendBuddyRequest).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should trim and lowercase email before sending', async () => {
      mockSendBuddyRequest.mockResolvedValue(undefined);
      
      const { getByTestId } = render(
        <AddBuddyModal visible={true} onClose={mockOnClose} />
      );
      
      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, '  TEST@EXAMPLE.COM  ');
      
      fireEvent.press(getByTestId('send-button'));
      
      await waitFor(() => {
        expect(mockSendBuddyRequest).toHaveBeenCalledWith('test@example.com');
      });
    });
  });
});

