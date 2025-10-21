import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { KudosButton } from '../KudosButton';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager');
jest.mock('@expo/vector-icons', () => ({ Feather: 'Feather' }));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

describe('KudosButton', () => {
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
  });

  it('should render kudos button', () => {
    const { getByTestId } = render(
      <KudosButton kudosCount={5} userGaveKudos={false} onToggle={jest.fn()} />
    );
    expect(getByTestId('kudos-button')).toBeTruthy();
  });

  it('should display kudos count', () => {
    const { getByTestId } = render(
      <KudosButton kudosCount={5} userGaveKudos={false} onToggle={jest.fn()} />
    );
    expect(getByTestId('kudos-count').props.children).toBe(5);
  });

  it('should call onToggle when pressed', () => {
    const mockOnToggle = jest.fn();
    const { getByTestId } = render(
      <KudosButton kudosCount={5} userGaveKudos={false} onToggle={mockOnToggle} />
    );
    fireEvent.press(getByTestId('kudos-button'));
    expect(mockOnToggle).toHaveBeenCalled();
  });
});

