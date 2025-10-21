/**
 * Unit tests for EmptyState component
 * Tests message display and action buttons
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('EmptyState', () => {
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

  describe('Message Display', () => {
    it('should display default title and message for no-walks type', () => {
      const { getByText } = render(
        <EmptyState type="no-walks" />
      );

      expect(getByText('No Walks Yet')).toBeTruthy();
      expect(getByText(/haven't logged any walks today/)).toBeTruthy();
    });

    it('should display default title and message for no-history type', () => {
      const { getByText } = render(
        <EmptyState type="no-history" />
      );

      expect(getByText('No Walk History')).toBeTruthy();
      expect(getByText(/haven't logged any walks yet/)).toBeTruthy();
    });

    it('should display default title and message for no-search-results type', () => {
      const { getByText } = render(
        <EmptyState type="no-search-results" />
      );

      expect(getByText('No Results Found')).toBeTruthy();
      expect(getByText(/Try adjusting your search/)).toBeTruthy();
    });

    it('should display default title and message for no-connection type', () => {
      const { getByText } = render(
        <EmptyState type="no-connection" />
      );

      expect(getByText('No Connection')).toBeTruthy();
      expect(getByText(/You're offline/)).toBeTruthy();
    });

    it('should display default title and message for permission-required type', () => {
      const { getByText } = render(
        <EmptyState type="permission-required" />
      );

      expect(getByText('Permission Required')).toBeTruthy();
      expect(getByText(/needs permission to access/)).toBeTruthy();
    });

    it('should use custom title when provided', () => {
      const { getByText, queryByText } = render(
        <EmptyState type="no-walks" title="Custom Title" />
      );

      expect(getByText('Custom Title')).toBeTruthy();
      expect(queryByText('No Walks Yet')).toBeNull();
    });

    it('should use custom message when provided', () => {
      const { getByText, queryByText } = render(
        <EmptyState type="no-walks" message="Custom message here" />
      );

      expect(getByText('Custom message here')).toBeTruthy();
      expect(queryByText(/haven't logged any walks today/)).toBeNull();
    });

    it('should use custom icon when provided', () => {
      const { UNSAFE_getByType } = render(
        <EmptyState type="no-walks" icon="alert-circle" />
      );

      const icon = UNSAFE_getByType('Ionicons' as any);
      expect(icon.props.name).toBe('alert-circle');
    });

    it('should use default icon when not provided', () => {
      const { UNSAFE_getByType } = render(
        <EmptyState type="no-walks" />
      );

      const icon = UNSAFE_getByType('Ionicons' as any);
      expect(icon.props.name).toBe('walk');
    });
  });

  describe('Action Buttons', () => {
    it('should display default action button for no-walks type', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState type="no-walks" onAction={onAction} />
      );

      expect(getByText('Log a Walk')).toBeTruthy();
    });

    it('should display default action button for no-history type', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState type="no-history" onAction={onAction} />
      );

      expect(getByText('Log Your First Walk')).toBeTruthy();
    });

    it('should display default action button for no-connection type', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState type="no-connection" onAction={onAction} />
      );

      expect(getByText('Retry')).toBeTruthy();
    });

    it('should display default action button for permission-required type', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState type="permission-required" onAction={onAction} />
      );

      expect(getByText('Grant Permission')).toBeTruthy();
    });

    it('should not display action button for no-search-results type by default', () => {
      const { queryByText } = render(
        <EmptyState type="no-search-results" />
      );

      // no-search-results doesn't have a default action
      expect(queryByText('Log a Walk')).toBeNull();
    });

    it('should use custom action label when provided', () => {
      const onAction = jest.fn();
      const { getByText, queryByText } = render(
        <EmptyState
          type="no-walks"
          actionLabel="Custom Action"
          onAction={onAction}
        />
      );

      expect(getByText('Custom Action')).toBeTruthy();
      expect(queryByText('Log a Walk')).toBeNull();
    });

    it('should call onAction when action button is pressed', () => {
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState type="no-walks" onAction={onAction} />
      );

      const button = getByText('Log a Walk');
      fireEvent.press(button);

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should not display action button when onAction is not provided', () => {
      const { queryByText } = render(
        <EmptyState type="no-walks" />
      );

      expect(queryByText('Log a Walk')).toBeNull();
    });

    it('should not display action button when actionLabel is provided but onAction is not', () => {
      const { queryByText } = render(
        <EmptyState type="no-walks" actionLabel="Custom Action" />
      );

      expect(queryByText('Custom Action')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible action button', () => {
      const onAction = jest.fn();
      const { UNSAFE_getByProps } = render(
        <EmptyState type="no-walks" onAction={onAction} />
      );

      const button = UNSAFE_getByProps({
        accessibilityLabel: 'Log a Walk',
        accessibilityRole: 'button',
      });
      expect(button).toBeTruthy();
    });

    it('should use custom action label for accessibility', () => {
      const onAction = jest.fn();
      const { UNSAFE_getByProps } = render(
        <EmptyState
          type="no-walks"
          actionLabel="Custom Action"
          onAction={onAction}
        />
      );

      const button = UNSAFE_getByProps({
        accessibilityLabel: 'Custom Action',
        accessibilityRole: 'button',
      });
      expect(button).toBeTruthy();
    });

    it('should render icon with appropriate size for visibility', () => {
      const { UNSAFE_getByType } = render(
        <EmptyState type="no-walks" />
      );

      const icon = UNSAFE_getByType('Ionicons' as any);
      expect(icon.props.size).toBe(64);
    });
  });
});

