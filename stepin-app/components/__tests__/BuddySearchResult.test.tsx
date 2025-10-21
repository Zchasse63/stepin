/**
 * Unit tests for BuddySearchResult component
 * Tests user data display, avatar rendering, and add buddy action
 * LOW PRIORITY - Search result display component
 */

// Mock dependencies BEFORE imports
jest.mock('@expo/vector-icons', () => ({ Feather: 'Feather' }));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BuddySearchResult } from '../BuddySearchResult';

describe('BuddySearchResult', () => {
  const mockBuddy = {
    id: 'user-123',
    display_name: 'John Doe',
    username: 'johndoe',
    avatar_url: 'https://example.com/avatar.jpg',
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search result component', () => {
      const { getByTestId } = render(
        <BuddySearchResult buddy={mockBuddy} onPress={mockOnPress} />
      );

      expect(getByTestId('search-result')).toBeTruthy();
    });

    it('should render display name', () => {
      const { getByTestId } = render(
        <BuddySearchResult buddy={mockBuddy} onPress={mockOnPress} />
      );

      expect(getByTestId('display-name')).toBeTruthy();
    });

    it('should render username', () => {
      const { getByTestId } = render(
        <BuddySearchResult buddy={mockBuddy} onPress={mockOnPress} />
      );

      expect(getByTestId('username')).toBeTruthy();
    });
  });

  describe('Avatar Display', () => {
    it('should display avatar image when avatar_url is provided', () => {
      const { getByTestId } = render(
        <BuddySearchResult buddy={mockBuddy} onPress={mockOnPress} />
      );

      expect(getByTestId('avatar-image')).toBeTruthy();
    });

    it('should display placeholder when avatar_url is not provided', () => {
      const buddyWithoutAvatar = { ...mockBuddy, avatar_url: null };
      const { getByTestId } = render(
        <BuddySearchResult buddy={buddyWithoutAvatar} onPress={mockOnPress} />
      );

      expect(getByTestId('avatar-placeholder')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onPress when result is pressed', () => {
      const { getByTestId } = render(
        <BuddySearchResult buddy={mockBuddy} onPress={mockOnPress} />
      );

      fireEvent.press(getByTestId('search-result'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing username', () => {
      const buddyWithoutUsername = { ...mockBuddy, username: null };
      const { getByTestId, queryByTestId } = render(
        <BuddySearchResult buddy={buddyWithoutUsername} onPress={mockOnPress} />
      );

      expect(getByTestId('search-result')).toBeTruthy();
      expect(queryByTestId('username')).toBeNull();
    });
  });
});
