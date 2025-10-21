import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PendingRequestCard } from '../PendingRequestCard';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('PendingRequestCard', () => {
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

  const mockRequest = {
    id: 'request-1',
    buddy_profile: {
      display_name: 'Jane Smith',
      email: 'jane@example.com',
      avatar_url: 'https://example.com/jane.jpg',
    },
  };

  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();

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
    it('should render pending request card', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      expect(getByTestId('pending-request-card')).toBeTruthy();
    });

    it('should render requester name', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      const name = getByTestId('requester-name');
      expect(name.props.children).toBe('Jane Smith');
    });

    it('should render request message', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      const message = getByTestId('request-message');
      expect(message.props.children).toBe('wants to be your buddy');
    });

    it('should render accept button', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      expect(getByTestId('accept-button')).toBeTruthy();
    });

    it('should render decline button', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      expect(getByTestId('decline-button')).toBeTruthy();
    });

    it('should render avatar image when avatar_url provided', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should render avatar placeholder when no avatar_url', () => {
      const requestWithoutAvatar = {
        ...mockRequest,
        buddy_profile: { ...mockRequest.buddy_profile, avatar_url: undefined },
      };
      const { getByTestId } = render(
        <PendingRequestCard request={requestWithoutAvatar} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      expect(getByTestId('avatar-placeholder')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onAccept when accept button pressed', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      fireEvent.press(getByTestId('accept-button'));
      expect(mockOnAccept).toHaveBeenCalled();
    });

    it('should call onDecline when decline button pressed', () => {
      const { getByTestId } = render(
        <PendingRequestCard request={mockRequest} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      fireEvent.press(getByTestId('decline-button'));
      expect(mockOnDecline).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should show Anonymous Walker when no display_name', () => {
      const requestWithoutName = {
        ...mockRequest,
        buddy_profile: null,
      };
      const { getByTestId } = render(
        <PendingRequestCard request={requestWithoutName} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      const name = getByTestId('requester-name');
      expect(name.props.children).toBe('Anonymous Walker');
    });

    it('should handle missing buddy_profile gracefully', () => {
      const requestWithoutProfile = { id: 'request-2', buddy_profile: null };
      const { getByTestId } = render(
        <PendingRequestCard request={requestWithoutProfile} onAccept={mockOnAccept} onDecline={mockOnDecline} />
      );
      expect(getByTestId('pending-request-card')).toBeTruthy();
    });
  });
});

