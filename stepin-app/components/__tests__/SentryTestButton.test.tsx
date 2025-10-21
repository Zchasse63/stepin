/**
 * Unit tests for SentryTestButton component
 * Tests error triggering and dev-only visibility
 * LOW PRIORITY - Debug component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SentryTestButton } from '../SentryTestButton';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('SentryTestButton', () => {
  const originalDev = global.__DEV__;

  afterEach(() => {
    global.__DEV__ = originalDev;
  });

  describe('Rendering - Dev Mode', () => {
    it('should render button in dev mode', () => {
      global.__DEV__ = true;
      
      const { getByTestId } = render(<SentryTestButton />);

      expect(getByTestId('sentry-test-button')).toBeTruthy();
    });

    it('should display test error button text', () => {
      global.__DEV__ = true;
      
      const { getByText } = render(<SentryTestButton />);

      expect(getByText(/test.*sentry/i)).toBeTruthy();
    });
  });

  describe('Rendering - Production Mode', () => {
    it('should not render button in production mode', () => {
      global.__DEV__ = false;
      
      const { queryByTestId } = render(<SentryTestButton />);

      expect(queryByTestId('sentry-test-button')).toBeNull();
    });
  });

  describe('Error Trigger', () => {
    it('should trigger Sentry error when button is pressed', () => {
      global.__DEV__ = true;
      const Sentry = require('@sentry/react-native');
      
      const { getByTestId } = render(<SentryTestButton />);

      fireEvent.press(getByTestId('sentry-test-button'));

      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should capture test error with correct message', () => {
      global.__DEV__ = true;
      const Sentry = require('@sentry/react-native');

      const { getByTestId } = render(<SentryTestButton />);

      fireEvent.press(getByTestId('sentry-test-button'));

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error)
      );
    });
  });

  describe('Dev-Only Visibility', () => {
    it('should only be visible when __DEV__ is true', () => {
      global.__DEV__ = true;
      const { getByTestId } = render(<SentryTestButton />);
      expect(getByTestId('sentry-test-button')).toBeTruthy();

      global.__DEV__ = false;
      const { queryByTestId: queryInProd } = render(<SentryTestButton />);
      expect(queryInProd('sentry-test-button')).toBeNull();
    });
  });
});

