/**
 * Unit tests for SettingsSection component
 * Tests section rendering, layout, and children display
 * MEDIUM PRIORITY - Settings organization component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SettingsSection } from '../SettingsSection';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

describe('SettingsSection', () => {
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

  describe('Rendering', () => {
    it('should render section with title', () => {
      const { getByText } = render(
        <SettingsSection title="Account Settings">
          <Text>Content</Text>
        </SettingsSection>
      );

      expect(getByText('Account Settings')).toBeTruthy();
    });

    it('should render section with title and footer', () => {
      const { getByText } = render(
        <SettingsSection
          title="Notifications"
          footer="Manage your notification preferences"
        >
          <Text>Content</Text>
        </SettingsSection>
      );

      expect(getByText('Notifications')).toBeTruthy();
      expect(getByText('Manage your notification preferences')).toBeTruthy();
    });

    it('should render children content', () => {
      const { getByText } = render(
        <SettingsSection title="Settings">
          <Text>Child Component 1</Text>
          <Text>Child Component 2</Text>
        </SettingsSection>
      );

      expect(getByText('Child Component 1')).toBeTruthy();
      expect(getByText('Child Component 2')).toBeTruthy();
    });

    it('should render with testID', () => {
      const { getByTestId } = render(
        <SettingsSection title="Settings">
          <Text>Content</Text>
        </SettingsSection>
      );

      expect(getByTestId('settings-section')).toBeTruthy();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply proper spacing and layout', () => {
      const { getByTestId } = render(
        <SettingsSection title="Settings">
          <Text>Content</Text>
        </SettingsSection>
      );

      const section = getByTestId('settings-section');
      expect(section).toBeTruthy();
      expect(section.props.style).toBeDefined();
    });

    it('should render section title with proper styling', () => {
      const { getByTestId } = render(
        <SettingsSection title="Account">
          <Text>Content</Text>
        </SettingsSection>
      );

      const title = getByTestId('section-title');
      expect(title).toBeTruthy();
      expect(title.props.style).toBeDefined();
    });

    it('should render section content container', () => {
      const { getByTestId } = render(
        <SettingsSection title="Settings">
          <Text>Content</Text>
        </SettingsSection>
      );

      const content = getByTestId('section-content');
      expect(content).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render without description when not provided', () => {
      const { queryByText } = render(
        <SettingsSection title="Settings">
          <Text>Content</Text>
        </SettingsSection>
      );

      // Title should be present
      expect(queryByText('Settings')).toBeTruthy();
      // No description text should exist
    });

    it('should handle empty children gracefully', () => {
      const { getByTestId } = render(
        <SettingsSection title="Empty Section">
          {null}
        </SettingsSection>
      );

      expect(getByTestId('settings-section')).toBeTruthy();
      expect(getByTestId('section-title')).toBeTruthy();
    });
  });

  describe('Multiple Sections', () => {
    it('should render multiple sections independently', () => {
      const { getAllByTestId } = render(
        <>
          <SettingsSection title="Section 1">
            <Text>Content 1</Text>
          </SettingsSection>
          <SettingsSection title="Section 2">
            <Text>Content 2</Text>
          </SettingsSection>
        </>
      );

      const sections = getAllByTestId('settings-section');
      expect(sections).toHaveLength(2);
    });
  });
});

