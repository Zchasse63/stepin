/**
 * Unit tests for BuddiesScreen (Social Features)
 * Tests buddy list, activity feed, and social interactions
 * CRITICAL PRIORITY - Social feature screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BuddiesScreen from '../buddies';
import { useTheme } from '../../../lib/theme/themeManager';
import { useSocialStore } from '../../../lib/store/socialStore';
import { useAuthStore } from '../../../lib/store/authStore';

// Mock dependencies
jest.mock('../../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../lib/store/socialStore');
jest.mock('../../../lib/store/authStore');

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock child components
jest.mock('../../../components/BuddyListItem', () => ({
  BuddyListItem: 'BuddyListItem',
}));

jest.mock('../../../components/ActivityCard', () => ({
  ActivityCard: 'ActivityCard',
}));

jest.mock('../../../components/PendingRequestCard', () => ({
  PendingRequestCard: 'PendingRequestCard',
}));

jest.mock('../../../components/AddBuddyModal', () => ({
  AddBuddyModal: 'AddBuddyModal',
}));

describe('BuddiesScreen', () => {
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

  const mockBuddies = [
    { id: '1', display_name: 'John Doe', avatar_url: null },
    { id: '2', display_name: 'Jane Smith', avatar_url: 'https://example.com/avatar.jpg' },
  ];

  const mockActivityFeed = [
    { id: '1', type: 'walk', user_id: '1', steps: 5000, created_at: '2024-01-15' },
    { id: '2', type: 'kudos', user_id: '2', created_at: '2024-01-14' },
  ];

  const mockPendingRequests = [
    { id: '1', from_user_id: '3', from_user_name: 'Bob Johnson', created_at: '2024-01-15' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });
    (useSocialStore as jest.Mock).mockReturnValue({
      buddies: mockBuddies,
      activityFeed: mockActivityFeed,
      pendingRequests: mockPendingRequests,
      fetchBuddies: jest.fn(),
      fetchActivityFeed: jest.fn(),
      fetchPendingRequests: jest.fn(),
      acceptRequest: jest.fn(),
      declineRequest: jest.fn(),
      removeBuddy: jest.fn(),
      giveKudos: jest.fn(),
    });
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-123' },
    });
  });

  describe('Rendering - Core Components', () => {
    it('should render buddies screen', () => {
      const { getByTestId } = render(<BuddiesScreen />);
      expect(getByTestId('buddies-screen')).toBeTruthy();
    });

    it('should render tab selector', () => {
      const { getByTestId } = render(<BuddiesScreen />);
      expect(getByTestId('tab-selector')).toBeTruthy();
    });

    it('should render add buddy button', () => {
      const { getByTestId } = render(<BuddiesScreen />);
      expect(getByTestId('add-buddy-button')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('should show Activity tab by default', () => {
      const { getByTestId } = render(<BuddiesScreen />);
      expect(getByTestId('activity-feed')).toBeTruthy();
    });

    it('should switch to Buddies tab when clicked', () => {
      const { getByTestId, getByText } = render(<BuddiesScreen />);
      
      fireEvent.press(getByText('Buddies'));
      
      expect(getByTestId('buddies-list')).toBeTruthy();
    });

    it('should switch back to Activity tab', () => {
      const { getByTestId, getByText } = render(<BuddiesScreen />);
      
      fireEvent.press(getByText('Buddies'));
      fireEvent.press(getByText('Activity'));
      
      expect(getByTestId('activity-feed')).toBeTruthy();
    });
  });

  describe('Buddies List Display', () => {
    it('should display buddies list', () => {
      const { getByTestId, getByText } = render(<BuddiesScreen />);
      
      fireEvent.press(getByText('Buddies'));
      
      expect(getByTestId('buddies-list')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
    });

    it('should render buddy list items', () => {
      const { getByText, getAllByTestId } = render(<BuddiesScreen />);
      
      fireEvent.press(getByText('Buddies'));
      
      const buddyItems = getAllByTestId(/buddy-item-/);
      expect(buddyItems).toHaveLength(2);
    });
  });

  describe('Activity Feed Display', () => {
    it('should display activity feed', () => {
      const { getByTestId } = render(<BuddiesScreen />);
      expect(getByTestId('activity-feed')).toBeTruthy();
    });

    it('should render activity cards', () => {
      const { getAllByTestId } = render(<BuddiesScreen />);
      const activityCards = getAllByTestId(/activity-card-/);
      expect(activityCards).toHaveLength(2);
    });

    it('should display walk activities', () => {
      const { getByText } = render(<BuddiesScreen />);
      expect(getByText(/5,?000.*steps/i)).toBeTruthy();
    });

    it('should display kudos activities', () => {
      const { getByText } = render(<BuddiesScreen />);
      expect(getByText(/kudos/i)).toBeTruthy();
    });
  });

  describe('Pending Requests', () => {
    it('should display pending requests section', () => {
      const { getByTestId } = render(<BuddiesScreen />);
      expect(getByTestId('pending-requests')).toBeTruthy();
    });

    it('should show pending request count', () => {
      const { getByText } = render(<BuddiesScreen />);
      expect(getByText(/1.*request/i)).toBeTruthy();
    });

    it('should render pending request cards', () => {
      const { getByText } = render(<BuddiesScreen />);
      expect(getByText('Bob Johnson')).toBeTruthy();
    });

    it('should accept buddy request', async () => {
      const mockAcceptRequest = jest.fn();
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: mockBuddies,
        activityFeed: mockActivityFeed,
        pendingRequests: mockPendingRequests,
        acceptRequest: mockAcceptRequest,
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { getByTestId } = render(<BuddiesScreen />);
      
      fireEvent.press(getByTestId('accept-request-1'));
      
      await waitFor(() => {
        expect(mockAcceptRequest).toHaveBeenCalledWith('1');
      });
    });

    it('should decline buddy request', async () => {
      const mockDeclineRequest = jest.fn();
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: mockBuddies,
        activityFeed: mockActivityFeed,
        pendingRequests: mockPendingRequests,
        declineRequest: mockDeclineRequest,
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { getByTestId } = render(<BuddiesScreen />);
      
      fireEvent.press(getByTestId('decline-request-1'));
      
      await waitFor(() => {
        expect(mockDeclineRequest).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Add Buddy Modal', () => {
    it('should open add buddy modal when button is pressed', () => {
      const { getByTestId } = render(<BuddiesScreen />);
      
      fireEvent.press(getByTestId('add-buddy-button'));
      
      expect(getByTestId('add-buddy-modal')).toBeTruthy();
    });

    it('should close modal when cancel is pressed', () => {
      const { getByTestId, queryByTestId } = render(<BuddiesScreen />);
      
      fireEvent.press(getByTestId('add-buddy-button'));
      fireEvent.press(getByTestId('modal-cancel-button'));
      
      expect(queryByTestId('add-buddy-modal')).toBeNull();
    });
  });

  describe('Buddy Actions', () => {
    it('should give kudos to buddy', async () => {
      const mockGiveKudos = jest.fn();
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: mockBuddies,
        activityFeed: mockActivityFeed,
        pendingRequests: mockPendingRequests,
        giveKudos: mockGiveKudos,
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { getByTestId } = render(<BuddiesScreen />);
      
      fireEvent.press(getByTestId('kudos-button-1'));
      
      await waitFor(() => {
        expect(mockGiveKudos).toHaveBeenCalledWith('1');
      });
    });

    it('should remove buddy with confirmation', async () => {
      const mockRemoveBuddy = jest.fn();
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: mockBuddies,
        activityFeed: mockActivityFeed,
        pendingRequests: mockPendingRequests,
        removeBuddy: mockRemoveBuddy,
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { getByTestId } = render(<BuddiesScreen />);
      
      fireEvent.press(getByTestId('remove-buddy-1'));
      fireEvent.press(getByTestId('confirm-remove'));
      
      await waitFor(() => {
        expect(mockRemoveBuddy).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should refresh data on pull down', async () => {
      const mockFetchBuddies = jest.fn();
      const mockFetchActivityFeed = jest.fn();
      const mockFetchPendingRequests = jest.fn();
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: mockBuddies,
        activityFeed: mockActivityFeed,
        pendingRequests: mockPendingRequests,
        fetchBuddies: mockFetchBuddies,
        fetchActivityFeed: mockFetchActivityFeed,
        fetchPendingRequests: mockFetchPendingRequests,
      });

      const { getByTestId } = render(<BuddiesScreen />);
      
      fireEvent(getByTestId('buddies-screen'), 'refresh');
      
      await waitFor(() => {
        expect(mockFetchBuddies).toHaveBeenCalled();
        expect(mockFetchActivityFeed).toHaveBeenCalled();
        expect(mockFetchPendingRequests).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator while fetching', () => {
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: [],
        activityFeed: [],
        pendingRequests: [],
        loading: true,
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { getByTestId } = render(<BuddiesScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no buddies', () => {
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: [],
        activityFeed: [],
        pendingRequests: [],
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { getByText } = render(<BuddiesScreen />);
      
      fireEvent.press(getByText('Buddies'));
      
      expect(getByText(/add.*first buddy/i)).toBeTruthy();
    });

    it('should show empty state when no activity', () => {
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: mockBuddies,
        activityFeed: [],
        pendingRequests: [],
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { getByText } = render(<BuddiesScreen />);
      expect(getByText(/no activity/i)).toBeTruthy();
    });

    it('should show empty state when no pending requests', () => {
      (useSocialStore as jest.Mock).mockReturnValue({
        buddies: mockBuddies,
        activityFeed: mockActivityFeed,
        pendingRequests: [],
        fetchBuddies: jest.fn(),
        fetchActivityFeed: jest.fn(),
        fetchPendingRequests: jest.fn(),
      });

      const { queryByTestId } = render(<BuddiesScreen />);
      expect(queryByTestId('pending-requests')).toBeNull();
    });
  });
});

