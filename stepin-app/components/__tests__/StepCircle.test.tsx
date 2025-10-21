/**
 * Unit tests for StepCircle component
 * Tests progress calculation, color changes, and rendering
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { StepCircle } from '../StepCircle';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('react-native-circular-progress', () => ({
  AnimatedCircularProgress: 'AnimatedCircularProgress',
}));

describe('StepCircle', () => {
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

  describe('Progress Calculation', () => {
    it('should calculate correct progress ratio for partial completion', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={5000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(50); // 5000/10000 * 100
    });

    it('should cap visual progress at 100% when steps exceed goal', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={15000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(100); // Capped at 100
    });

    it('should show 0% progress when no steps', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={0} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(0);
    });

    it('should handle exact goal completion', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={10000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(100);
    });
  });

  describe('Color Changes Based on Progress', () => {
    it('should use gray color for 0-25% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={2000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.tintColor).toBe(mockColors.accent.gray);
    });

    it('should use light green for 25-50% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={4000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.tintColor).toBe(mockColors.primary.light);
    });

    it('should use medium green for 50-75% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={6000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.tintColor).toBe(mockColors.primary.main);
    });

    it('should use dark green for 75-100% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={8000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.tintColor).toBe(mockColors.primary.dark);
    });

    it('should use gold color for 100%+ progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={12000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.tintColor).toBe(mockColors.accent.gold);
    });

    it('should use gold color at exact 100% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={10000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.tintColor).toBe(mockColors.accent.gold);
    });
  });

  describe('Component Props', () => {
    it('should use default size and strokeWidth when not provided', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={5000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.size).toBe(200);
      expect(circularProgress.props.width).toBe(16);
    });

    it('should use custom size when provided', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={5000} goal={10000} size={150} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.size).toBe(150);
    });

    it('should use custom strokeWidth when provided', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={5000} goal={10000} strokeWidth={20} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.width).toBe(20);
    });

    it('should set correct animation properties', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={5000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.rotation).toBe(270);
      expect(circularProgress.props.lineCap).toBe('round');
      expect(circularProgress.props.duration).toBe(1000);
      expect(circularProgress.props.arcSweepAngle).toBe(360);
    });

    it('should use theme border color for background', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={5000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.backgroundColor).toBe(mockColors.border.light);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small progress percentages', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={10} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(0.1);
      expect(circularProgress.props.tintColor).toBe(mockColors.accent.gray);
    });

    it('should handle very large step counts', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={50000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(100); // Capped
      expect(circularProgress.props.tintColor).toBe(mockColors.accent.gold);
    });

    it('should handle boundary at 25% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={2500} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(25);
      expect(circularProgress.props.tintColor).toBe(mockColors.primary.light);
    });

    it('should handle boundary at 50% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={5000} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(50);
      expect(circularProgress.props.tintColor).toBe(mockColors.primary.main);
    });

    it('should handle boundary at 75% progress', () => {
      const { UNSAFE_getByType } = render(
        <StepCircle steps={7500} goal={10000} />
      );

      const circularProgress = UNSAFE_getByType('AnimatedCircularProgress' as any);
      expect(circularProgress.props.fill).toBe(75);
      expect(circularProgress.props.tintColor).toBe(mockColors.primary.dark);
    });
  });
});

