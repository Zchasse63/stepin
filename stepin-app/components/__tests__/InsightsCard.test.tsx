import React from 'react';
import { render } from '@testing-library/react-native';
import InsightsCard from '../InsightsCard';
import { useTheme } from '../../lib/theme/themeManager';

jest.mock('../../lib/theme/themeManager');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('../../lib/utils/generateInsights', () => ({
  getInsightIconName: jest.fn(() => 'trophy'),
}));

describe('InsightsCard', () => {
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

  const mockInsight = {
    type: 'positive' as const,
    title: 'Great Progress!',
    description: 'You walked 5 times this week',
    icon: 'trophy',
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

  it('should render insights card', () => {
    const { getByTestId } = render(<InsightsCard insight={mockInsight} />);
    expect(getByTestId('insights-card')).toBeTruthy();
  });

  it('should display insight title', () => {
    const { getByTestId } = render(<InsightsCard insight={mockInsight} />);
    expect(getByTestId('insight-title').props.children).toBe('Great Progress!');
  });

  it('should display insight description', () => {
    const { getByTestId } = render(<InsightsCard insight={mockInsight} />);
    expect(getByTestId('insight-description').props.children).toBe('You walked 5 times this week');
  });

  it('should render insight icon', () => {
    const { getByTestId } = render(<InsightsCard insight={mockInsight} />);
    expect(getByTestId('insight-icon')).toBeTruthy();
  });
});

