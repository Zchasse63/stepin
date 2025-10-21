/**
 * Unit tests for StatsCard component
 * Tests data display, loading states, and formatting
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { StatsCard } from '../StatsCard';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('StatsCard', () => {
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
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Display', () => {
    it('should render icon, label, and value', () => {
      const { getByText, UNSAFE_getByType } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
        />
      );

      expect(getByText('Total Steps')).toBeTruthy();
      expect(getByText('10,000')).toBeTruthy();
      
      const icon = UNSAFE_getByType('Ionicons' as any);
      expect(icon.props.name).toBe('walk');
      expect(icon.props.size).toBe(24);
      expect(icon.props.color).toBe(mockColors.primary.main);
    });

    it('should render subtitle when provided', () => {
      const { getByText } = render(
        <StatsCard
          icon="flame"
          label="Streak"
          value="7 days"
          subtitle="+2 from last week"
        />
      );

      expect(getByText('Streak')).toBeTruthy();
      expect(getByText('7 days')).toBeTruthy();
      expect(getByText('+2 from last week')).toBeTruthy();
    });

    it('should not render subtitle when not provided', () => {
      const { queryByText } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
        />
      );

      expect(queryByText('+2 from last week')).toBeNull();
    });

    it('should render with different icon types', () => {
      const { UNSAFE_getByType } = render(
        <StatsCard
          icon="trophy"
          label="Achievements"
          value="5"
        />
      );

      const icon = UNSAFE_getByType('Ionicons' as any);
      expect(icon.props.name).toBe('trophy');
    });
  });

  describe('Loading State', () => {
    it('should show loading placeholder when loading is true', () => {
      const { queryByText, getByTestId } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
          loading={true}
        />
      );

      // Label should still be visible
      expect(queryByText('Total Steps')).toBeTruthy();

      // Value should not be visible
      expect(queryByText('10,000')).toBeNull();
    });

    it('should show value when loading is false', () => {
      const { getByText } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
          loading={false}
        />
      );

      expect(getByText('10,000')).toBeTruthy();
    });

    it('should hide subtitle when loading', () => {
      const { queryByText } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
          subtitle="+500 from yesterday"
          loading={true}
        />
      );

      expect(queryByText('+500 from yesterday')).toBeNull();
    });

    it('should default to loading=false when not specified', () => {
      const { getByText } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
        />
      );

      expect(getByText('10,000')).toBeTruthy();
    });
  });

  describe('Formatting and Display', () => {
    it('should handle large numbers in value', () => {
      const { getByText } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="1,234,567"
        />
      );

      expect(getByText('1,234,567')).toBeTruthy();
    });

    it('should handle text values', () => {
      const { getByText } = render(
        <StatsCard
          icon="time"
          label="Duration"
          value="2h 30m"
        />
      );

      expect(getByText('2h 30m')).toBeTruthy();
    });

    it('should handle empty string value', () => {
      const { getByText } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value=""
        />
      );

      expect(getByText('')).toBeTruthy();
    });

    it('should handle long label text', () => {
      const { getByText } = render(
        <StatsCard
          icon="walk"
          label="Average Steps Per Day This Week"
          value="8,500"
        />
      );

      expect(getByText('Average Steps Per Day This Week')).toBeTruthy();
    });

    it('should handle long subtitle text', () => {
      const { getByText } = render(
        <StatsCard
          icon="walk"
          label="Steps"
          value="10,000"
          subtitle="This is a very long subtitle that might wrap to multiple lines"
        />
      );

      expect(getByText('This is a very long subtitle that might wrap to multiple lines')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render all text elements for screen readers', () => {
      const { getByText } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
          subtitle="+500 from yesterday"
        />
      );

      expect(getByText('Total Steps')).toBeTruthy();
      expect(getByText('10,000')).toBeTruthy();
      expect(getByText('+500 from yesterday')).toBeTruthy();
    });

    it('should render icon with correct color for visibility', () => {
      const { UNSAFE_getByType } = render(
        <StatsCard
          icon="walk"
          label="Total Steps"
          value="10,000"
        />
      );

      const icon = UNSAFE_getByType('Ionicons' as any);
      expect(icon.props.color).toBe(mockColors.primary.main);
    });
  });
});

