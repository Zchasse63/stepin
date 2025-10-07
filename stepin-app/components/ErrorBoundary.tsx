/**
 * Error Boundary Component
 * Catches React errors and displays a friendly fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { Layout } from '../constants/Layout';
import { Typography } from '../constants/Typography';
import { logger } from '../lib/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for development
    logger.error('Error Boundary caught an error:', { error, errorInfo });

    // Report to Sentry in production
    if (!__DEV__) {
      Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          errorInfo,
        },
      });
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={80} color="#FF3B30" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Oops! Something went wrong</Text>

        {/* Message */}
        <Text style={styles.message}>
          We're sorry for the inconvenience. The app encountered an unexpected error.
        </Text>

        {/* Try Again Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={onReset}
          activeOpacity={0.8}
          accessibilityLabel="Try again"
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>

        {/* Show Details Toggle */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => setShowDetails(!showDetails)}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsToggleText}>
              {showDetails ? 'Hide' : 'Show'} Error Details
            </Text>
            <Ionicons
              name={showDetails ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#007AFF"
            />
          </TouchableOpacity>
        )}

        {/* Error Details (Development Only) */}
        {__DEV__ && showDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Error Details:</Text>
            <Text style={styles.detailsText}>
              {error?.toString()}
            </Text>
            {errorInfo && (
              <>
                <Text style={[styles.detailsTitle, { marginTop: 16 }]}>
                  Component Stack:
                </Text>
                <Text style={styles.detailsText}>
                  {errorInfo.componentStack}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Help Text */}
        <Text style={styles.helpText}>
          If this problem persists, please contact support.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  iconContainer: {
    marginBottom: Layout.spacing.xl,
  },
  title: {
    ...Typography.largeTitle,
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  message: {
    ...Typography.body,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 24,
    paddingHorizontal: Layout.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.medium,
    minWidth: 200,
    minHeight: Layout.button.height,
  },
  buttonIcon: {
    marginRight: Layout.spacing.sm,
  },
  buttonText: {
    ...Typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.xl,
    padding: Layout.spacing.sm,
  },
  detailsToggleText: {
    ...Typography.body,
    color: '#007AFF',
    marginRight: Layout.spacing.xs,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  detailsTitle: {
    ...Typography.headline,
    fontWeight: '600',
    color: '#000000',
    marginBottom: Layout.spacing.xs,
  },
  detailsText: {
    ...Typography.caption1,
    color: '#666666',
    fontFamily: 'Courier',
    lineHeight: 18,
  },
  helpText: {
    ...Typography.caption1,
    color: '#999999',
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
  },
});

