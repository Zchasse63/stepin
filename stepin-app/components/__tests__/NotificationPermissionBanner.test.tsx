import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationPermissionBanner } from '../NotificationPermissionBanner';
import { useTheme } from '../../lib/theme/themeManager';
import { Linking } from 'react-native';

jest.mock('../../lib/theme/themeManager');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

describe('NotificationPermissionBanner', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  });

  it('should render banner', () => {
    const { getByTestId } = render(<NotificationPermissionBanner />);
    expect(getByTestId('notification-permission-banner')).toBeTruthy();
  });

  it('should display title and message', () => {
    const { getByTestId } = render(<NotificationPermissionBanner />);
    expect(getByTestId('banner-title').props.children).toBe('Notifications are disabled');
  });

  it('should open settings when button pressed', () => {
    const { getByTestId } = render(<NotificationPermissionBanner />);
    fireEvent.press(getByTestId('open-settings-button'));
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  it('should call onDismiss when dismiss button pressed', () => {
    const mockOnDismiss = jest.fn();
    const { getByTestId } = render(<NotificationPermissionBanner onDismiss={mockOnDismiss} />);
    fireEvent.press(getByTestId('dismiss-button'));
    expect(mockOnDismiss).toHaveBeenCalled();
  });
});

