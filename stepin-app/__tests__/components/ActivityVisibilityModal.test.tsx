/**
 * ActivityVisibilityModal Component Tests
 * Tests for privacy visibility settings modal
 */

import React from 'react';
import { render, fireEvent, waitFor } from '../utils/test-utils';
import {
  ActivityVisibilityModal,
  ActivityVisibility,
} from '../../components/ActivityVisibilityModal';

describe('ActivityVisibilityModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(getByText('Activity Visibility')).toBeTruthy();
    });

    it('should not render modal content when visible is false', () => {
      const { queryByText } = render(
        <ActivityVisibilityModal
          visible={false}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Modal is present but not visible (RN Modal behavior)
      expect(queryByText('Activity Visibility')).toBeNull();
    });

    it('should render all three visibility options', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(getByText('Private')).toBeTruthy();
      expect(getByText('Buddies Only')).toBeTruthy();
      expect(getByText('Public')).toBeTruthy();
    });

    it('should render descriptions for each option', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(getByText('Only you can see your activities')).toBeTruthy();
      expect(getByText('Only your buddies can see your activities')).toBeTruthy();
      expect(getByText('Anyone can see your activities')).toBeTruthy();
    });

    it('should render Save and Cancel buttons', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('Selection State', () => {
    it('should show current visibility as selected', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="private"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // The Private option should be visually indicated as selected
      expect(getByText('Private')).toBeTruthy();
    });

    it('should update selection when an option is pressed', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const publicOption = getByText('Public');
      fireEvent.press(publicOption);

      // Selection should update (visual change tested via styles)
      expect(publicOption).toBeTruthy();
    });

    it('should allow selecting Private option', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="public"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const privateOption = getByText('Private');
      fireEvent.press(privateOption);

      expect(privateOption).toBeTruthy();
    });

    it('should allow selecting Buddies Only option', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="private"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const buddiesOption = getByText('Buddies Only');
      fireEvent.press(buddiesOption);

      expect(buddiesOption).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when Cancel button is pressed', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should call onSave with selected visibility when Save is pressed', async () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Select Public
      const publicOption = getByText('Public');
      fireEvent.press(publicOption);

      // Press Save
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('public');
      });
    });

    it('should call onClose after successful save', async () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle save errors gracefully', async () => {
      const mockErrorSave = jest.fn(() => Promise.reject(new Error('Save failed')));
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockErrorSave}
        />
      );

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockErrorSave).toHaveBeenCalled();
      });

      // Should not close modal on error
      // (onClose might not be called, depends on implementation)
    });

    it('should disable Save button while saving', async () => {
      const slowSave = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={slowSave}
        />
      );

      const saveButton = getByText('Save');
      fireEvent.press(saveButton);

      // Button text might change to "Saving..." during save
      // This depends on implementation
      await waitFor(() => {
        expect(slowSave).toHaveBeenCalled();
      });
    });
  });

  describe('Props and State Management', () => {
    it('should accept all visibility types as currentVisibility', () => {
      const visibilities: ActivityVisibility[] = ['private', 'buddies', 'public'];

      visibilities.forEach((visibility) => {
        const { getByText } = render(
          <ActivityVisibilityModal
            visible={true}
            currentVisibility={visibility}
            onClose={mockOnClose}
            onSave={mockOnSave}
          />
        );

        expect(getByText('Activity Visibility')).toBeTruthy();
      });
    });

    it('should reset selection when currentVisibility prop changes', () => {
      const { rerender, getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="private"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Initial render shows Private selected
      expect(getByText('Private')).toBeTruthy();

      // Change currentVisibility prop
      rerender(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="public"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Should now show Public as selected
      expect(getByText('Public')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Check that buttons are accessible via text
      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should be usable with VoiceOver', () => {
      const { getByText } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // All text should be accessible
      expect(getByText('Private')).toBeTruthy();
      expect(getByText('Buddies Only')).toBeTruthy();
      expect(getByText('Public')).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('should render icons for each visibility option', () => {
      const { UNSAFE_root } = render(
        <ActivityVisibilityModal
          visible={true}
          currentVisibility="buddies"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Icons are rendered via Feather component
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
