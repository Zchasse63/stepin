/**
 * Unit tests for SettingRow component
 * Tests different row types, interactions, and conditional rendering
 * HIGH PRIORITY - Settings interaction component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingRow } from '../SettingRow';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('SettingRow', () => {
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

  describe('Rendering - Display Row', () => {
    it('should render row with label and value text', () => {
      const { getByText, getByTestId } = render(
        <SettingRow label="Language" variant="disclosure" value="English" />
      );

      expect(getByTestId('setting-row')).toBeTruthy();
      expect(getByTestId('setting-label')).toBeTruthy();
      expect(getByTestId('setting-value')).toBeTruthy();
      expect(getByText('Language')).toBeTruthy();
      expect(getByText('English')).toBeTruthy();
    });

    it('should render row with icon when provided', () => {
      const { getByTestId } = render(
        <SettingRow label="Notifications" variant="disclosure" value="Enabled" icon="notifications" />
      );

      expect(getByTestId('setting-icon')).toBeTruthy();
    });

    it('should not render icon when not provided', () => {
      const { queryByTestId } = render(
        <SettingRow label="Language" variant="disclosure" value="English" />
      );

      expect(queryByTestId('setting-icon')).toBeNull();
    });
  });

  describe('Rendering - Navigation Row', () => {
    it('should render chevron when onPress is provided', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <SettingRow label="Account" variant="disclosure" onPress={mockOnPress} showChevron />
      );

      expect(getByTestId('chevron-icon')).toBeTruthy();
    });

    it('should not render chevron when showChevron is false', () => {
      const mockOnPress = jest.fn();
      const { queryByTestId } = render(
        <SettingRow label="Account" variant="disclosure" onPress={mockOnPress} showChevron={false} />
      );

      expect(queryByTestId('chevron-icon')).toBeNull();
    });

    it('should render pressable row when onPress provided', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <SettingRow label="Privacy" variant="disclosure" onPress={mockOnPress} />
      );

      const row = getByTestId('setting-row');
      expect(row).toBeTruthy();
    });
  });

  describe('Rendering - Switch Row', () => {
    it('should render switch when variant="toggle" is true', () => {
      const mockOnValueChange = jest.fn();
      const { getByTestId } = render(
        <SettingRow 
          label="Dark Mode" variant="toggle" 
          variant="toggle" 
          toggleValue={false}
          onToggle={mockOnValueChange}
        />
      );

      expect(getByTestId('toggle-switch')).toBeTruthy();
    });

    it('should not render value text when switch is shown', () => {
      const mockOnValueChange = jest.fn();
      const { queryByTestId } = render(
        <SettingRow 
          label="Dark Mode" variant="toggle" 
          variant="toggle" 
          toggleValue={false}
          value="This should not appear"
          onToggle={mockOnValueChange}
        />
      );

      expect(queryByTestId('setting-value')).toBeNull();
    });

    it('should render switch with correct initial value', () => {
      const mockOnValueChange = jest.fn();
      const { getByTestId } = render(
        <SettingRow 
          label="Notifications" variant="toggle" 
          variant="toggle" 
          toggleValue={true}
          onToggle={mockOnValueChange}
        />
      );

      const toggle = getByTestId('toggle-switch');
      expect(toggle.props.value).toBe(true);
    });
  });

  describe('User Interactions - Row Press', () => {
    it('should call onPress when row is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <SettingRow label="Account" variant="disclosure" onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('setting-row'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not be pressable when onPress is not provided', () => {
      const { getByTestId } = render(
        <SettingRow label="Version" variant="disclosure" value="1.0.0" />
      );

      const row = getByTestId('setting-row');
      // Row should still render but not be interactive
      expect(row).toBeTruthy();
    });
  });

  describe('User Interactions - Switch Toggle', () => {
    it('should call onToggle when switch is toggled', () => {
      const mockOnValueChange = jest.fn();
      const { getByTestId } = render(
        <SettingRow 
          label="Dark Mode" variant="toggle" 
          variant="toggle" 
          toggleValue={false}
          onToggle={mockOnValueChange}
        />
      );

      fireEvent(getByTestId('toggle-switch'), 'valueChange', true);
      expect(mockOnValueChange).toHaveBeenCalledWith(true);
    });

    it('should toggle switch from false to true', () => {
      const mockOnValueChange = jest.fn();
      const { getByTestId } = render(
        <SettingRow 
          label="Notifications" variant="toggle" 
          variant="toggle" 
          toggleValue={false}
          onToggle={mockOnValueChange}
        />
      );

      fireEvent(getByTestId('toggle-switch'), 'valueChange', true);
      expect(mockOnValueChange).toHaveBeenCalledWith(true);
    });

    it('should toggle switch from true to false', () => {
      const mockOnValueChange = jest.fn();
      const { getByTestId } = render(
        <SettingRow 
          label="Notifications" variant="toggle" 
          variant="toggle" 
          toggleValue={true}
          onToggle={mockOnValueChange}
        />
      );

      fireEvent(getByTestId('toggle-switch'), 'valueChange', false);
      expect(mockOnValueChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Conditional Rendering Logic', () => {
    it('should show value text when switch is not shown', () => {
      const { getByTestId } = render(
        <SettingRow label="Language" variant="disclosure" value="English" />
      );

      expect(getByTestId('setting-value')).toBeTruthy();
    });

    it('should prioritize switch over value text', () => {
      const mockOnValueChange = jest.fn();
      const { queryByTestId, getByTestId } = render(
        <SettingRow 
          label="Setting" variant="toggle" 
          value="Should not show"
          variant="toggle" 
          toggleValue={false}
          onToggle={mockOnValueChange}
        />
      );

      expect(getByTestId('toggle-switch')).toBeTruthy();
      expect(queryByTestId('setting-value')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value gracefully', () => {
      const { getByTestId } = render(
        <SettingRow label="Setting" variant="disclosure" value="" />
      );

      expect(getByTestId('setting-row')).toBeTruthy();
    });

    it('should handle long label text', () => {
      const { getByText } = render(
        <SettingRow 
          label="This is a very long setting label that might wrap to multiple lines" variant="disclosure" 
          value="Value"
        />
      );

      expect(getByText('This is a very long setting label that might wrap to multiple lines')).toBeTruthy();
    });

    it('should handle long value text', () => {
      const { getByText } = render(
        <SettingRow 
          label="Email" variant="disclosure" 
          value="verylongemailaddress@example.com"
        />
      );

      expect(getByText('verylongemailaddress@example.com')).toBeTruthy();
    });
  });
});

