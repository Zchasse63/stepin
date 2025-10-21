import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { StreakDisplay } from '../StreakDisplay';
import { useTheme } from '../../lib/theme/themeManager';
import { useAuthStore } from '../../lib/store/authStore';
import { supabase } from '../../lib/supabase/client';

jest.mock('../../lib/theme/themeManager');
jest.mock('../../lib/store/authStore');
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('StreakDisplay', () => {
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
    (useAuthStore as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });
  });

  it('should render streak display with data', async () => {
    const mockStreak = { current_streak: 7, longest_streak: 14 };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStreak, error: null }),
        }),
      }),
    });

    const { getByTestId } = render(<StreakDisplay />);
    
    await waitFor(() => {
      expect(getByTestId('streak-display')).toBeTruthy();
    });
  });

  it('should display current streak with correct pluralization', async () => {
    const mockStreak = { current_streak: 1, longest_streak: 5 };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStreak, error: null }),
        }),
      }),
    });

    const { getByTestId } = render(<StreakDisplay />);
    
    await waitFor(() => {
      expect(getByTestId('current-streak-value').props.children.join('')).toContain('1 day');
    });
  });

  it('should display longest streak with plural days', async () => {
    const mockStreak = { current_streak: 7, longest_streak: 14 };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockStreak, error: null }),
        }),
      }),
    });

    const { getByTestId } = render(<StreakDisplay />);
    
    await waitFor(() => {
      expect(getByTestId('longest-streak-value').props.children.join('')).toContain('14 days');
    });
  });
});

