/**
 * Unit tests for QRCodeDisplay component
 * Tests QR code rendering with deep link generation
 * Component takes userId and optional userName props
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { QRCodeDisplay } from '../QRCodeDisplay';

// Mock dependencies
jest.mock('react-native-qrcode-svg', () => 'QRCode');

describe('QRCodeDisplay', () => {
  const mockUserId = 'user-123-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render QR code display component', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      expect(getByTestId('qr-code-display')).toBeTruthy();
    });

    it('should render QR code image', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      expect(getByTestId('qr-code-image')).toBeTruthy();
    });

    it('should render user code text', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      expect(getByTestId('user-code-text')).toBeTruthy();
    });

    it('should render title text', () => {
      const { getByText } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      expect(getByText('Scan to Connect')).toBeTruthy();
    });

    it('should render user name when provided', () => {
      const { getByText } = render(
        <QRCodeDisplay userId={mockUserId} userName="Test User" />
      );

      expect(getByText('Test User')).toBeTruthy();
    });

    it('should not render user name when not provided', () => {
      const { queryByText } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      // Should not have a name element since userName is not provided
      expect(queryByText('Test User')).toBeNull();
    });
  });

  describe('QR Code Generation', () => {
    it('should generate deep link QR code from user ID', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      const qrCode = getByTestId('qr-code-image');
      // QR code should contain deep link format: stepin://buddy/add/{userId}
      expect(qrCode.props.value).toBe(`stepin://buddy/add/${mockUserId}`);
    });

    it('should display user ID text below QR code', () => {
      const { getByText } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      expect(getByText(mockUserId)).toBeTruthy();
    });

    it('should use generateBuddyQRCode for QR value', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId="test-user-789" />
      );

      const qrCode = getByTestId('qr-code-image');
      expect(qrCode.props.value).toBe('stepin://buddy/add/test-user-789');
    });
  });

  describe('QR Code Properties', () => {
    it('should render QR code with fixed size of 250', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      const qrCode = getByTestId('qr-code-image');
      expect(qrCode.props.size).toBe(250);
    });

    it('should render QR code with green color (#4CAF50)', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      const qrCode = getByTestId('qr-code-image');
      expect(qrCode.props.color).toBe('#4CAF50');
    });

    it('should render QR code with white background', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId={mockUserId} />
      );

      const qrCode = getByTestId('qr-code-image');
      expect(qrCode.props.backgroundColor).toBe('white');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', () => {
      const { getByTestId } = render(
        <QRCodeDisplay userId="" />
      );

      expect(getByTestId('qr-code-display')).toBeTruthy();
    });

    it('should handle very long user ID', () => {
      const longUserId = 'user-' + 'a'.repeat(100);
      const { getByTestId } = render(
        <QRCodeDisplay userId={longUserId} />
      );

      expect(getByTestId('qr-code-image')).toBeTruthy();
    });

    it('should handle special characters in user ID', () => {
      const specialUserId = 'user-123!@#$%^&*()';
      const { getByTestId } = render(
        <QRCodeDisplay userId={specialUserId} />
      );

      expect(getByTestId('qr-code-image')).toBeTruthy();
    });
  });
});

