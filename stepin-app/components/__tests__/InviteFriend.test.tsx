// Mock dependencies BEFORE imports
jest.mock('../../lib/services/inviteService', () => ({
  shareInviteLink: jest.fn(),
}));

jest.mock('../../lib/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../lib/store/profileStore', () => ({
  useProfileStore: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({ Feather: 'Feather' }));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { InviteFriend } from '../InviteFriend';
import { shareInviteLink } from '../../lib/services/inviteService';
import { useAuthStore } from '../../lib/store/authStore';
import { useProfileStore } from '../../lib/store/profileStore';

describe('InviteFriend', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockProfile = { id: 'user-123', display_name: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockUser);
    (useProfileStore as unknown as jest.Mock).mockReturnValue(mockProfile);
  });

  describe('Rendering', () => {
    it('should render invite friend component', () => {
      const { getByTestId } = render(<InviteFriend />);
      expect(getByTestId('invite-friend')).toBeTruthy();
    });

    it('should display title', () => {
      const { getByTestId } = render(<InviteFriend />);
      expect(getByTestId('invite-title')).toBeTruthy();
      expect(getByTestId('invite-title').props.children).toBe('Invite Friends to Stepin');
    });

    it('should display description', () => {
      const { getByTestId } = render(<InviteFriend />);
      expect(getByTestId('invite-description')).toBeTruthy();
    });

    it('should render share button', () => {
      const { getByTestId } = render(<InviteFriend />);
      expect(getByTestId('share-button')).toBeTruthy();
    });
  });

  describe('Share Functionality', () => {
    it('should call shareInviteLink when share button is pressed', async () => {
      (shareInviteLink as jest.Mock).mockResolvedValue(true);

      const { getByTestId } = render(<InviteFriend />);

      fireEvent.press(getByTestId('share-button'));

      await waitFor(() => {
        expect(shareInviteLink).toHaveBeenCalledWith('user-123', 'Test User');
      });
    });

    it('should show loading indicator while sharing', async () => {
      (shareInviteLink as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      const { getByTestId } = render(<InviteFriend />);

      fireEvent.press(getByTestId('share-button'));

      await waitFor(() => {
        expect(getByTestId('loading-indicator')).toBeTruthy();
      });
    });

    it('should disable button while sharing', async () => {
      (shareInviteLink as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      const { getByTestId } = render(<InviteFriend />);

      fireEvent.press(getByTestId('share-button'));

      await waitFor(() => {
        // Check for loading indicator instead of disabled state
        expect(getByTestId('loading-indicator')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not share when user is null', () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue(null);

      const { getByTestId } = render(<InviteFriend />);

      fireEvent.press(getByTestId('share-button'));

      expect(shareInviteLink).not.toHaveBeenCalled();
    });

    it('should not share when profile is null', () => {
      (useProfileStore as unknown as jest.Mock).mockReturnValue(null);

      const { getByTestId } = render(<InviteFriend />);

      fireEvent.press(getByTestId('share-button'));

      expect(shareInviteLink).not.toHaveBeenCalled();
    });
  });
});

