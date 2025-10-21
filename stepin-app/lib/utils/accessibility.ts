/**
 * Accessibility Utilities
 * Helper functions for improving app accessibility
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { logger } from './logger';

/**
 * Check if screen reader is enabled
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    logger.error('Error checking screen reader status:', error);
    return false;
  }
}

/**
 * Check if reduce motion is enabled
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    logger.error('Error checking reduce motion status:', error);
    return false;
  }
}

/**
 * Announce message to screen reader
 */
export function announceForAccessibility(message: string): void {
  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch (error) {
    logger.error('Error announcing for accessibility:', error);
  }
}

/**
 * Format number for screen reader announcement
 * Adds commas and proper pronunciation
 */
export function formatNumberForScreenReader(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format date for screen reader announcement
 */
export function formatDateForScreenReader(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for screen reader announcement
 */
export function formatTimeForScreenReader(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format duration for screen reader announcement
 */
export function formatDurationForScreenReader(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
}

/**
 * Format distance for screen reader announcement
 */
export function formatDistanceForScreenReader(meters: number, units: 'miles' | 'kilometers'): string {
  if (units === 'miles') {
    const miles = meters / 1609.34;
    return `${miles.toFixed(2)} ${miles === 1 ? 'mile' : 'miles'}`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(2)} ${km === 1 ? 'kilometer' : 'kilometers'}`;
  }
}

/**
 * Format percentage for screen reader announcement
 */
export function formatPercentageForScreenReader(value: number, total: number): string {
  const percentage = Math.round((value / total) * 100);
  return `${percentage} percent`;
}

/**
 * Create accessible label for step count
 */
export function createStepCountLabel(steps: number, goal: number): string {
  const percentage = Math.round((steps / goal) * 100);
  return `${formatNumberForScreenReader(steps)} steps, ${percentage} percent of your ${formatNumberForScreenReader(goal)} step goal`;
}

/**
 * Create accessible label for streak
 */
export function createStreakLabel(days: number): string {
  return `${days} day ${days === 1 ? 'streak' : 'streak'}. You've met your goal ${days} ${days === 1 ? 'day' : 'days'} in a row`;
}

/**
 * Create accessible label for walk item
 */
export function createWalkLabel(
  steps: number,
  distance: number,
  duration: number,
  date: Date | string,
  units: 'miles' | 'kilometers'
): string {
  return `Walk on ${formatDateForScreenReader(date)}. ${formatNumberForScreenReader(steps)} steps, ${formatDistanceForScreenReader(distance, units)}, ${formatDurationForScreenReader(duration)}`;
}

/**
 * Create accessible label for buddy
 */
export function createBuddyLabel(
  name: string,
  steps: number,
  streak: number
): string {
  return `${name}. ${formatNumberForScreenReader(steps)} steps today, ${streak} day streak`;
}

/**
 * Create accessible label for badge
 */
export function createBadgeLabel(
  name: string,
  description: string,
  earned: boolean
): string {
  if (earned) {
    return `${name} badge earned. ${description}`;
  }
  return `${name} badge not yet earned. ${description}`;
}

/**
 * Create accessible label for notification toggle
 */
export function createToggleLabel(
  label: string,
  enabled: boolean
): string {
  return `${label}, ${enabled ? 'enabled' : 'disabled'}`;
}

/**
 * Create accessible label for slider
 */
export function createSliderLabel(
  label: string,
  value: number,
  min: number,
  max: number,
  unit?: string
): string {
  const unitStr = unit ? ` ${unit}` : '';
  return `${label}, ${value}${unitStr}, minimum ${min}, maximum ${max}`;
}

/**
 * Create accessible hint for button
 */
export function createButtonHint(action: string): string {
  return `Double tap to ${action}`;
}

/**
 * Create accessible label for loading state
 */
export function createLoadingLabel(context: string): string {
  return `Loading ${context}`;
}

/**
 * Create accessible label for error state
 */
export function createErrorLabel(context: string, error?: string): string {
  if (error) {
    return `Error loading ${context}: ${error}`;
  }
  return `Error loading ${context}`;
}

/**
 * Create accessible label for empty state
 */
export function createEmptyStateLabel(context: string): string {
  return `No ${context} to display`;
}

/**
 * Create accessible label for progress indicator
 */
export function createProgressLabel(
  current: number,
  total: number,
  context: string
): string {
  const percentage = Math.round((current / total) * 100);
  return `${context} progress: ${current} of ${total}, ${percentage} percent complete`;
}

/**
 * Get accessibility props for touchable elements
 */
export function getTouchableAccessibilityProps(
  label: string,
  hint?: string,
  role: 'button' | 'link' | 'imagebutton' = 'button'
) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
  };
}

/**
 * Get accessibility props for text input
 */
export function getTextInputAccessibilityProps(
  label: string,
  value?: string,
  hint?: string
) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityValue: value ? { text: value } : undefined,
    accessibilityHint: hint,
  };
}

/**
 * Get accessibility props for image
 */
export function getImageAccessibilityProps(
  alt: string,
  isDecorative: boolean = false
) {
  if (isDecorative) {
    return {
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants' as const,
    };
  }
  
  return {
    accessible: true,
    accessibilityLabel: alt,
    accessibilityRole: 'image' as const,
  };
}

/**
 * Get accessibility props for header
 */
export function getHeaderAccessibilityProps(text: string, level: number = 1) {
  return {
    accessible: true,
    accessibilityLabel: text,
    accessibilityRole: 'header' as const,
    accessibilityLevel: level,
  };
}

/**
 * Subscribe to screen reader state changes
 */
export function subscribeToScreenReaderChanges(
  callback: (enabled: boolean) => void
): () => void {
  const subscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    callback
  );
  
  return () => subscription.remove();
}

/**
 * Subscribe to reduce motion state changes
 */
export function subscribeToReduceMotionChanges(
  callback: (enabled: boolean) => void
): () => void {
  const subscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    callback
  );
  
  return () => subscription.remove();
}

