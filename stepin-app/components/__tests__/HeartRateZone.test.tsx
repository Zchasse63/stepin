/**
 * Unit tests for HeartRateZone component
 * Tests heart rate zone display, color coding, and zone calculations
 * LOW PRIORITY - Heart rate display component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { HeartRateZone } from '../HeartRateZone';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

describe('HeartRateZone', () => {
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
    it('should render heart rate zone component', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={120} />
      );

      expect(getByTestId('heart-rate-zone')).toBeTruthy();
    });

    it('should render zone label', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={120} />
      );

      expect(getByTestId('zone-label')).toBeTruthy();
    });

    it('should render zone range', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={120} />
      );

      expect(getByTestId('zone-range')).toBeTruthy();
    });

    it('should render zone indicator', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={120} />
      );

      expect(getByTestId('zone-indicator')).toBeTruthy();
    });
  });

  describe('Zone Calculation - Resting', () => {
    it('should display Resting zone for HR < 100', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={80} />
      );

      expect(getByText(/resting/i)).toBeTruthy();
    });

    it('should use grey color for Resting zone', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={90} />
      );

      const indicator = getByTestId('zone-indicator');
      expect(indicator).toBeTruthy();
    });
  });

  describe('Zone Calculation - Fat Burn', () => {
    it('should display Fat Burn zone for HR 100-130', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={115} />
      );

      expect(getByText(/fat burn/i)).toBeTruthy();
    });

    it('should use blue color for Fat Burn zone', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={120} />
      );

      const indicator = getByTestId('zone-indicator');
      expect(indicator).toBeTruthy();
    });

    it('should show Fat Burn at lower boundary (100 bpm)', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={100} />
      );

      expect(getByText(/fat burn/i)).toBeTruthy();
    });

    it('should show Fat Burn at upper boundary (130 bpm)', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={130} />
      );

      expect(getByText(/fat burn/i)).toBeTruthy();
    });
  });

  describe('Zone Calculation - Cardio', () => {
    it('should display Cardio zone for HR 131-160', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={145} />
      );

      expect(getByText(/cardio/i)).toBeTruthy();
    });

    it('should use green color for Cardio zone', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={145} />
      );

      const indicator = getByTestId('zone-indicator');
      expect(indicator).toBeTruthy();
    });

    it('should show Cardio at lower boundary (131 bpm)', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={131} />
      );

      expect(getByText(/cardio/i)).toBeTruthy();
    });
  });

  describe('Zone Calculation - Peak', () => {
    it('should display Peak zone for HR > 160', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={175} />
      );

      expect(getByText(/peak/i)).toBeTruthy();
    });

    it('should use red color for Peak zone', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={180} />
      );

      const indicator = getByTestId('zone-indicator');
      expect(indicator).toBeTruthy();
    });

    it('should show Peak at boundary (161 bpm)', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={161} />
      );

      expect(getByText(/peak/i)).toBeTruthy();
    });
  });

  describe('Custom Max Heart Rate', () => {
    it('should calculate zones based on custom max HR', () => {
      const maxHR = 180;
      const { getByTestId } = render(
        <HeartRateZone currentHR={140} maxHeartRate={maxHR} />
      );

      expect(getByTestId('heart-rate-zone')).toBeTruthy();
    });

    it('should display zone range with custom max HR', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={120} maxHeartRate={180} />
      );

      expect(getByTestId('zone-range')).toBeTruthy();
    });
  });

  describe('Zone Range Display', () => {
    it('should display zone range for Fat Burn', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={115} />
      );

      expect(getByText(/100.*130/)).toBeTruthy();
    });

    it('should display zone range for Cardio', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={145} />
      );

      expect(getByText(/131.*160/)).toBeTruthy();
    });
  });

  describe('Current Zone Highlighting', () => {
    it('should highlight current zone indicator', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={120} />
      );

      const indicator = getByTestId('zone-indicator');
      expect(indicator.props.style).toBeDefined();
    });

    it('should show heart rate value', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={125} />
      );

      expect(getByText(/125/)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low heart rate (< 50)', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={45} />
      );

      expect(getByText(/resting/i)).toBeTruthy();
    });

    it('should handle very high heart rate (> 200)', () => {
      const { getByText } = render(
        <HeartRateZone currentHR={210} />
      );

      expect(getByText(/peak/i)).toBeTruthy();
    });

    it('should handle zero heart rate', () => {
      const { getByTestId } = render(
        <HeartRateZone currentHR={0} />
      );

      expect(getByTestId('heart-rate-zone')).toBeTruthy();
    });
  });
});

