/**
 * Unit tests for HistoricalImportModal component
 * Tests auto-import functionality, progress display, and completion states
 * MEDIUM PRIORITY - Data import component
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { HistoricalImportModal } from '../HistoricalImportModal';
import { useTheme } from '../../lib/theme/themeManager';
import { mockTheme } from '../../tests/testUtils';
import {
  importHistoricalData,
  hasCompletedHistoricalImport,
} from '../../lib/health/historicalImport';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

// Mock historical import service
jest.mock('../../lib/health/historicalImport', () => ({
  importHistoricalData: jest.fn(),
  hasCompletedHistoricalImport: jest.fn(),
  markHistoricalImportComplete: jest.fn(),
}));

const mockImportHistoricalData = importHistoricalData as jest.MockedFunction<typeof importHistoricalData>;
const mockHasCompletedHistoricalImport = hasCompletedHistoricalImport as jest.MockedFunction<typeof hasCompletedHistoricalImport>;

describe('HistoricalImportModal', () => {
  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    mockHasCompletedHistoricalImport.mockResolvedValue(false);
    mockImportHistoricalData.mockResolvedValue({
      success: true,
      daysImported: 90,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render modal when visible is true', () => {
      const { getByTestId } = render(
        <HistoricalImportModal
          visible={true}
          userId={mockUserId}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(getByTestId('historical-import-modal')).toBeTruthy();
    });

    it('should not render modal when visible is false', () => {
      const { queryByTestId } = render(
        <HistoricalImportModal
          visible={false}
          userId={mockUserId}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      expect(queryByTestId('historical-import-modal')).toBeNull();
    });
  });

  describe('Auto-Import Behavior', () => {
    it('should automatically start import when modal opens', async () => {
      render(
        <HistoricalImportModal
          visible={true}
          userId={mockUserId}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      await waitFor(() => {
        expect(mockImportHistoricalData).toHaveBeenCalledWith(
          mockUserId,
          90,
          expect.any(Function),
          expect.any(Object)
        );
      });
    });

    it('should not start import if already completed', async () => {
      mockHasCompletedHistoricalImport.mockResolvedValue(true);

      render(
        <HistoricalImportModal
          visible={true}
          userId={mockUserId}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
        />
      );

      await waitFor(() => {
        expect(mockHasCompletedHistoricalImport).toHaveBeenCalled();
      });

      expect(mockImportHistoricalData).not.toHaveBeenCalled();
    });
  });
});
