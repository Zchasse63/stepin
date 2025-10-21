/**
 * Unit tests for BuddySearch component
 * Tests search functionality, results display, and user selection
 * LOW PRIORITY - Buddy discovery component
 */

// Mock dependencies BEFORE imports
jest.mock('../../lib/services/buddySearchService', () => ({
  searchBuddies: jest.fn(),
}));

jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/store/socialStore', () => ({
  useSocialStore: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({ Feather: 'Feather' }));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BuddySearch } from '../BuddySearch';
import { useTheme } from '../../lib/theme/themeManager';
import { useSocialStore } from '../../lib/store/socialStore';
import { searchBuddies } from '../../lib/services/buddySearchService';

describe('BuddySearch', () => {
  const mockOnSelectBuddy = jest.fn();
  const mockSearchResults = [
    { id: '1', display_name: 'John Doe', username: 'johndoe', email: 'john@example.com', avatar_url: null },
    { id: '2', display_name: 'Jane Smith', username: 'janesmith', email: 'jane@example.com', avatar_url: null },
  ];

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
    (searchBuddies as jest.Mock).mockResolvedValue([]);
  });

  describe('Rendering', () => {
    it('should render search component', () => {
      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      expect(getByTestId('buddy-search')).toBeTruthy();
    });

    it('should render search input', () => {
      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      expect(getByTestId('search-input')).toBeTruthy();
    });
  });

  describe('Search Input', () => {
    it('should update search input on text change', () => {
      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'John');

      expect(searchInput.props.value).toBe('John');
    });

    it('should show hint for short search terms', () => {
      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'Jo');

      expect(getByTestId('search-hint')).toBeTruthy();
    });

    it('should trigger search when input has 3+ characters', async () => {
      (searchBuddies as jest.Mock).mockResolvedValue(mockSearchResults);

      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'John');

      await waitFor(() => {
        expect(searchBuddies).toHaveBeenCalledWith('John');
      }, { timeout: 500 });
    });
  });

  describe('Search Results Display', () => {
    it('should display results list', () => {
      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      expect(getByTestId('results-list')).toBeTruthy();
    });

    it('should show empty state when no results found', async () => {
      (searchBuddies as jest.Mock).mockResolvedValue([]);

      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'xyz');

      await waitFor(() => {
        expect(getByTestId('empty-state')).toBeTruthy();
      }, { timeout: 500 });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while searching', async () => {
      (searchBuddies as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 500)));

      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'John');

      await waitFor(() => {
        expect(getByTestId('loading-indicator')).toBeTruthy();
      }, { timeout: 400 });
    });

    it('should hide loading indicator after search completes', async () => {
      (searchBuddies as jest.Mock).mockResolvedValue(mockSearchResults);

      const { getByTestId, queryByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'John');

      await waitFor(() => {
        expect(queryByTestId('loading-indicator')).toBeNull();
      }, { timeout: 500 });
    });
  });

  describe('Empty State', () => {
    it('should display "No users found" message', async () => {
      (searchBuddies as jest.Mock).mockResolvedValue([]);

      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'xyz');

      await waitFor(() => {
        expect(getByTestId('empty-message')).toBeTruthy();
      }, { timeout: 500 });
    });
  });

  describe('Edge Cases', () => {
    it('should not search for queries less than 3 characters', () => {
      const { getByTestId } = render(
        <BuddySearch onSelectBuddy={mockOnSelectBuddy} />
      );

      fireEvent.changeText(getByTestId('search-input'), 'Jo');

      expect(searchBuddies).not.toHaveBeenCalled();
    });
  });
});
