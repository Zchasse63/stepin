/**
 * Unit tests for WalkListItem component
 * Tests data rendering, action buttons, and accessibility
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import WalkListItem from '../WalkListItem';
import { useTheme } from '../../lib/theme/themeManager';
import type { Walk } from '../../types/database';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-gesture-handler/Swipeable', () => 'Swipeable');

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('../../lib/animations/celebrationAnimations', () => ({
  getStaggerDelay: jest.fn((index: number, delay: number) => index * delay),
  ANIMATION_CONFIG: {
    scale: { press: 0.95 },
    spring: { damping: 15, stiffness: 150 },
    springGentle: { damping: 20, stiffness: 100 },
  },
}));

jest.mock('../../lib/utils/calculateStats', () => ({
  formatDateDisplay: jest.fn((date: string, format: string) => {
    if (format === 'MMM d, yyyy') return 'Oct 9, 2025';
    if (format === 'MMM') return 'Oct';
    return date;
  }),
  formatDuration: jest.fn((minutes: number) => `${minutes}m`),
}));

jest.mock('../../lib/utils/formatDistance', () => ({
  formatDistance: jest.fn((meters: number, units: string) => {
    if (units === 'miles') return `${(meters / 1609.34).toFixed(2)} mi`;
    return `${(meters / 1000).toFixed(2)} km`;
  }),
}));

describe('WalkListItem', () => {
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
    id: 'walk-1',
    user_id: 'user-1',
    date: '2025-10-09',
    steps: 10000,
    duration_minutes: 60,
    distance_meters: 8000,
    created_at: '2025-10-09T12:00:00Z',
    updated_at: '2025-10-09T12:00:00Z',
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Rendering', () => {
    it('should render walk steps', () => {
      const { getByText } = render(
        <WalkListItem walk={mockWalk} />
      );

      expect(getByText('10,000 steps')).toBeTruthy();
    });

    it('should render formatted date', () => {
      const { getByText } = render(
        <WalkListItem walk={mockWalk} />
      );

      // Date might be 8 or 9 depending on timezone
      const dayText = getByText(/^[89]$/);
      expect(dayText).toBeTruthy();
      expect(getByText('Oct')).toBeTruthy(); // Month
    });

    it('should render duration when provided', () => {
      const { getByText } = render(
        <WalkListItem walk={mockWalk} />
      );

      expect(getByText('60m')).toBeTruthy();
    });

    it('should render distance when provided', () => {
      const { getByText } = render(
        <WalkListItem walk={mockWalk} units="miles" />
      );

      expect(getByText('4.97 mi')).toBeTruthy();
    });

    it('should render distance in kilometers when units is km', () => {
      const { getByText } = render(
        <WalkListItem walk={mockWalk} units="kilometers" />
      );

      expect(getByText('8.00 km')).toBeTruthy();
    });

    it('should not render duration when not provided', () => {
      const walkWithoutDuration = { ...mockWalk, duration_minutes: null };
      const { queryByText } = render(
        <WalkListItem walk={walkWithoutDuration} />
      );

      expect(queryByText('60m')).toBeNull();
    });

    it('should not render distance when not provided', () => {
      const walkWithoutDistance = { ...mockWalk, distance_meters: null };
      const { queryByText } = render(
        <WalkListItem walk={walkWithoutDistance} />
      );

      expect(queryByText('4.97 mi')).toBeNull();
    });

    it('should show goal met badge when goalMet is true', () => {
      const { getByText } = render(
        <WalkListItem walk={mockWalk} goalMet={true} />
      );

      expect(getByText('Goal Met')).toBeTruthy();
    });

    it('should not show goal met badge when goalMet is false', () => {
      const { queryByText } = render(
        <WalkListItem walk={mockWalk} goalMet={false} />
      );

      expect(queryByText('Goal Met')).toBeNull();
    });

    it('should show heart rate badge when average_heart_rate is provided', () => {
      const walkWithHR = { ...mockWalk, average_heart_rate: 145.7 };
      const { getByText } = render(
        <WalkListItem walk={walkWithHR} />
      );

      expect(getByText('146 BPM')).toBeTruthy(); // Rounded
    });

    it('should not show heart rate badge when average_heart_rate is not provided', () => {
      const { queryByText } = render(
        <WalkListItem walk={mockWalk} />
      );

      expect(queryByText(/BPM/)).toBeNull();
    });
  });

  describe('Action Buttons', () => {
    it('should call onPress when item is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <WalkListItem walk={mockWalk} onPress={onPress} />
      );

      fireEvent.press(getByText('10,000 steps'));
      expect(onPress).toHaveBeenCalledWith(mockWalk);
    });

    it('should not call onPress when onPress is not provided', () => {
      const { getByText } = render(
        <WalkListItem walk={mockWalk} />
      );

      // Should not throw error
      fireEvent.press(getByText('10,000 steps'));
    });

    // Note: Delete button tests are skipped because Swipeable is mocked
    // and doesn't render the right actions in the test environment
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      const { UNSAFE_getByProps } = render(
        <WalkListItem walk={mockWalk} />
      );

      const touchable = UNSAFE_getByProps({
        accessibilityLabel: 'Walk on Oct 9, 2025, 10000 steps',
      });
      expect(touchable).toBeTruthy();
    });

    it('should have correct accessibility hint', () => {
      const { UNSAFE_getByProps } = render(
        <WalkListItem walk={mockWalk} />
      );

      const touchable = UNSAFE_getByProps({
        accessibilityHint: 'Tap to view details, swipe left to delete',
      });
      expect(touchable).toBeTruthy();
    });

    it('should have button role for main touchable', () => {
      const { UNSAFE_getByProps } = render(
        <WalkListItem walk={mockWalk} />
      );

      const touchable = UNSAFE_getByProps({
        accessibilityRole: 'button',
        accessibilityLabel: 'Walk on Oct 9, 2025, 10000 steps',
      });
      expect(touchable).toBeTruthy();
    });

    // Note: Delete button accessibility test skipped because Swipeable is mocked
  });
});

