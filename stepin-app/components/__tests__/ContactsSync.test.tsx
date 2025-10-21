/**
 * Unit tests for ContactsSync component
 * Tests contacts permission, sync functionality, and contact selection
 * LOW PRIORITY - Contacts integration component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContactsSync } from '../ContactsSync';
import { useTheme } from '../../lib/theme/themeManager';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

jest.mock('../../lib/services/contactSyncService', () => ({
  syncContacts: jest.fn(() => Promise.resolve({ success: true, count: 0 })),
  findMatchingUsers: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-contacts', () => ({
  requestPermissionsAsync: jest.fn(),
  getContactsAsync: jest.fn(),
}));

describe('ContactsSync', () => {
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

  const mockContacts = [
    { id: '1', name: 'John Doe', phoneNumbers: [{ number: '+1234567890' }] },
    { id: '2', name: 'Jane Smith', phoneNumbers: [{ number: '+0987654321' }] },
  ];

  const mockOnSync = jest.fn();
  const mockOnSelect = jest.fn();

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
    it('should render contacts sync component', () => {
      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      expect(getByTestId('contacts-sync')).toBeTruthy();
    });

    it('should render sync button', () => {
      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      expect(getByTestId('sync-button')).toBeTruthy();
    });
  });

  describe('Permission Request', () => {
    it('should request contacts permission when sync button is pressed', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: mockContacts });

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(Contacts.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should show permission request UI when permission is denied', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByTestId('permission-request')).toBeTruthy();
      });
    });
  });

  describe('Contact Sync', () => {
    it('should sync contacts when permission is granted', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: mockContacts });

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(Contacts.getContactsAsync).toHaveBeenCalled();
      });
    });

    it('should call onSync after successful sync', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: mockContacts });

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(mockOnSync).toHaveBeenCalled();
      });
    });
  });

  describe('Contacts List Display', () => {
    it('should display contacts list after sync', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: mockContacts });

      const { getByTestId, getByText } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByTestId('contacts-list')).toBeTruthy();
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      });
    });

    it('should display matched contacts', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: mockContacts });

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByTestId('contacts-list')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should show syncing progress indicator', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: mockContacts }), 100)));

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      expect(getByTestId('sync-progress')).toBeTruthy();
    });

    it('should disable sync button while syncing', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: mockContacts }), 100)));

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      const syncButton = getByTestId('sync-button');
      expect(syncButton.props.disabled).toBe(true);
    });
  });

  describe('Contact Selection', () => {
    it('should call onSelect when contact is selected', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: mockContacts });

      const { getByTestId, getByText } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      fireEvent.press(getByText('John Doe'));
      expect(mockOnSelect).toHaveBeenCalledWith(mockContacts[0]);
    });
  });

  describe('Error Handling', () => {
    it('should handle sync error gracefully', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockRejectedValue(new Error('Sync failed'));

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });
    });

    it('should display error message', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockRejectedValue(new Error('Sync failed'));

      const { getByText } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByText(/error/i)).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty contacts list', async () => {
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: [] });

      const { getByTestId, getByText } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByText(/no contacts/i)).toBeTruthy();
      });
    });

    it('should handle contacts without phone numbers', async () => {
      const contactsWithoutPhone = [
        { id: '1', name: 'John Doe', phoneNumbers: [] },
      ];
      const Contacts = require('expo-contacts');
      Contacts.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Contacts.getContactsAsync.mockResolvedValue({ data: contactsWithoutPhone });

      const { getByTestId } = render(
        <ContactsSync onSync={mockOnSync} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByTestId('sync-button'));

      await waitFor(() => {
        expect(getByTestId('contacts-list')).toBeTruthy();
      });
    });
  });
});

