/**
 * Unit tests for ErrorBoundary component
 * Tests error catching, fallback UI rendering, and error reporting
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { logger } from '../../lib/utils/logger';
import * as Sentry from '@sentry/react-native';

// Mock dependencies
jest.mock('../../lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock __DEV__ to false for production behavior
    (global as any).__DEV__ = false;
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Test content</Text>
        </ErrorBoundary>
      );

      expect(getByText('Test content')).toBeTruthy();
    });

    it('should catch errors and display fallback UI', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });

    it('should log error to logger when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Error Boundary caught an error:',
        expect.objectContaining({
          error: expect.any(Error),
          errorInfo: expect.any(Object),
        })
      );
    });

    it('should report error to Sentry in production', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          extra: expect.objectContaining({
            componentStack: expect.any(String),
          }),
        })
      );
    });

    it('should not report to Sentry in development', () => {
      (global as any).__DEV__ = true;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should call onError callback when provided', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Fallback UI Rendering', () => {
    it('should display error title', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });

    it('should display error message', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(/We're sorry for the inconvenience/)).toBeTruthy();
    });

    it('should display Try Again button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Try Again')).toBeTruthy();
    });

    it('should display help text', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(/If this problem persists/)).toBeTruthy();
    });

    it('should use custom fallback when provided', () => {
      const customFallback = <Text>Custom error UI</Text>;

      const { getByText, queryByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Custom error UI')).toBeTruthy();
      expect(queryByText('Oops! Something went wrong')).toBeNull();
    });
  });

  describe('Error Recovery', () => {
    it('should have Try Again button that can be pressed', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error UI should be visible
      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Try Again button should be pressable (doesn't throw)
      const tryAgainButton = getByText('Try Again');
      expect(() => fireEvent.press(tryAgainButton)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible Try Again button', () => {
      const { UNSAFE_getByProps } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const button = UNSAFE_getByProps({
        accessibilityLabel: 'Try again',
        accessibilityRole: 'button',
      });
      expect(button).toBeTruthy();
    });
  });

  describe('Development Mode', () => {
    it('should show error details toggle in development mode', () => {
      (global as any).__DEV__ = true;

      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Show Error Details')).toBeTruthy();
    });

    it('should not show error details toggle in production mode', () => {
      (global as any).__DEV__ = false;

      const { queryByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(queryByText('Show Error Details')).toBeNull();
    });

    it('should toggle error details when clicked in development', () => {
      (global as any).__DEV__ = true;

      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Initially hidden
      expect(queryByText('Error Details:')).toBeNull();

      // Click to show
      fireEvent.press(getByText('Show Error Details'));
      expect(getByText('Error Details:')).toBeTruthy();
      expect(getByText('Hide Error Details')).toBeTruthy();

      // Click to hide
      fireEvent.press(getByText('Hide Error Details'));
      expect(queryByText('Error Details:')).toBeNull();
      expect(getByText('Show Error Details')).toBeTruthy();
    });
  });
});

