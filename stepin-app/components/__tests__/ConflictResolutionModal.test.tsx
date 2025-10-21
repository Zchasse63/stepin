/**
 * Unit tests for ConflictResolutionModal component
 * Tests conflict display, resolution options, and user choices
 * LOW PRIORITY - Data sync component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ConflictResolutionModal } from '../ConflictResolutionModal';
import { useTheme } from '../../lib/theme/themeManager';
import { mockTheme } from '../../tests/testUtils';
import type { SyncConflict } from '../../lib/offline/conflictResolver';

// Mock Supabase client BEFORE importing anything that uses it
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}));

// Mock conflict resolver
jest.mock('../../lib/offline/conflictResolver', () => ({
  resolveConflict: jest.fn(),
  autoResolveConflict: jest.fn(),
  detectConflicts: jest.fn(),
}));

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock logger
jest.mock('../../lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('ConflictResolutionModal', () => {
  const mockUserId = 'user-123';
  const mockOnClose = jest.fn();
  const mockOnResolved = jest.fn();

  // Get references to mocked functions
  const { resolveConflict, autoResolveConflict } = require('../../lib/offline/conflictResolver');

  const mockConflict: SyncConflict = {
    id: 'conflict-1',
    type: 'walk',
    localVersion: {
      steps: 5000,
      duration_minutes: 30,
      distance_meters: 4000,
    },
    serverVersion: {
      steps: 5500,
      duration_minutes: 35,
      distance_meters: 4500,
    },
    timestamp: Date.now(),
    resolved: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    (resolveConflict as jest.Mock).mockResolvedValue({ success: true });
    (autoResolveConflict as jest.Mock).mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('should render modal when visible is true and conflict exists', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText('Sync Conflict Detected')).toBeTruthy();
    });

    it('should not render when conflict is null', () => {
      const { queryByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={null}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(queryByText('Sync Conflict Detected')).toBeNull();
    });
  });

  describe('Walk Conflict Display', () => {
    it('should display local version data', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText('Your Changes (Local)')).toBeTruthy();
      expect(getByText(/Steps: 5,000/)).toBeTruthy();
      expect(getByText(/Duration: 30 min/)).toBeTruthy();
    });

    it('should display server version data', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText('Server Version')).toBeTruthy();
      expect(getByText(/Steps: 5,500/)).toBeTruthy();
      expect(getByText(/Duration: 35 min/)).toBeTruthy();
    });

    it('should show conflict description', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText(/modified both offline and online/i)).toBeTruthy();
    });
  });

  describe('Resolution Actions', () => {
    it('should render auto-resolve button', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText('Auto-Resolve (Merge)')).toBeTruthy();
    });

    it('should render keep local button', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText('Keep Local')).toBeTruthy();
    });

    it('should render keep server button', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText('Keep Server')).toBeTruthy();
    });

    it('should render cancel button', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call resolveConflict with keep_local when Keep Local is pressed', async () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      fireEvent.press(getByText('Keep Local'));

      await waitFor(() => {
        expect(resolveConflict).toHaveBeenCalledWith(mockConflict, 'keep_local', mockUserId);
      });
    });

    it('should call resolveConflict with keep_server when Keep Server is pressed', async () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      fireEvent.press(getByText('Keep Server'));

      await waitFor(() => {
        expect(resolveConflict).toHaveBeenCalledWith(mockConflict, 'keep_server', mockUserId);
      });
    });

    it('should call autoResolveConflict when Auto-Resolve is pressed', async () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      fireEvent.press(getByText('Auto-Resolve (Merge)'));

      await waitFor(() => {
        expect(autoResolveConflict).toHaveBeenCalledWith(mockConflict, mockUserId);
      });
    });

    it('should call onClose when Cancel is pressed', () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      fireEvent.press(getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onResolved and onClose after successful resolution', async () => {
      const { getByText } = render(
        <ConflictResolutionModal
          visible={true}
          conflict={mockConflict}
          userId={mockUserId}
          onClose={mockOnClose}
          onResolved={mockOnResolved}
        />
      );

      fireEvent.press(getByText('Keep Local'));

      await waitFor(() => {
        expect(mockOnResolved).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
