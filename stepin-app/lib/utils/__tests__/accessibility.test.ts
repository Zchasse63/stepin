/**
 * Unit tests for accessibility utility functions
 * Tests screen reader checks, announcements, formatting, and label generation
 */

import { AccessibilityInfo } from 'react-native';
import {
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  announceForAccessibility,
  formatNumberForScreenReader,
  formatDateForScreenReader,
  formatTimeForScreenReader,
  formatDurationForScreenReader,
  formatDistanceForScreenReader,
  formatPercentageForScreenReader,
  createStepCountLabel,
  createStreakLabel,
  createWalkLabel,
  createBuddyLabel,
  createBadgeLabel,
  createToggleLabel,
  createSliderLabel,
  createButtonHint,
  createLoadingLabel,
  createErrorLabel,
  createEmptyStateLabel,
  createProgressLabel,
  getTouchableAccessibilityProps,
  getTextInputAccessibilityProps,
  getImageAccessibilityProps,
  getHeaderAccessibilityProps,
  subscribeToScreenReaderChanges,
  subscribeToReduceMotionChanges,
} from '../accessibility';
import { logger } from '../logger';

// Mock React Native AccessibilityInfo
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isScreenReaderEnabled', () => {
    it('should return true when screen reader is enabled', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);

      const result = await isScreenReaderEnabled();

      expect(result).toBe(true);
      expect(AccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalledTimes(1);
    });

    it('should return false when screen reader is disabled', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(false);

      const result = await isScreenReaderEnabled();

      expect(result).toBe(false);
      expect(AccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalledTimes(1);
    });

    it('should return false and log error when check fails', async () => {
      const error = new Error('AccessibilityInfo error');
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockRejectedValue(error);

      const result = await isScreenReaderEnabled();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error checking screen reader status:', error);
    });
  });

  describe('isReduceMotionEnabled', () => {
    it('should return true when reduce motion is enabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

      const result = await isReduceMotionEnabled();

      expect(result).toBe(true);
      expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    });

    it('should return false when reduce motion is disabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

      const result = await isReduceMotionEnabled();

      expect(result).toBe(false);
      expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    });

    it('should return false and log error when check fails', async () => {
      const error = new Error('AccessibilityInfo error');
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockRejectedValue(error);

      const result = await isReduceMotionEnabled();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Error checking reduce motion status:', error);
    });
  });

  describe('announceForAccessibility', () => {
    it('should announce message to screen reader', () => {
      const message = 'Test announcement';

      announceForAccessibility(message);

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(message);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(1);
    });

    it('should log error when announcement fails', () => {
      const error = new Error('Announcement error');
      (AccessibilityInfo.announceForAccessibility as jest.Mock).mockImplementation(() => {
        throw error;
      });

      announceForAccessibility('Test');

      expect(logger.error).toHaveBeenCalledWith('Error announcing for accessibility:', error);
    });
  });

  describe('formatNumberForScreenReader', () => {
    it('should format number with commas', () => {
      expect(formatNumberForScreenReader(1000)).toBe('1,000');
      expect(formatNumberForScreenReader(1234567)).toBe('1,234,567');
    });

    it('should format small numbers without commas', () => {
      expect(formatNumberForScreenReader(100)).toBe('100');
      expect(formatNumberForScreenReader(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumberForScreenReader(-1000)).toBe('-1,000');
    });
  });

  describe('formatDateForScreenReader', () => {
    it('should format Date object with full date', () => {
      const date = new Date('2025-10-10T12:00:00Z');
      const result = formatDateForScreenReader(date);
      
      expect(result).toContain('2025');
      expect(result).toContain('October');
      expect(result).toContain('10');
    });

    it('should format date string with full date', () => {
      const result = formatDateForScreenReader('2025-10-10');
      
      expect(result).toContain('2025');
      expect(result).toContain('October');
    });

    it('should include weekday in formatted date', () => {
      const date = new Date('2025-10-10T12:00:00Z');
      const result = formatDateForScreenReader(date);
      
      expect(result).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });
  });

  describe('formatTimeForScreenReader', () => {
    it('should format time with AM/PM', () => {
      const date = new Date('2025-10-10T09:30:00Z');
      const result = formatTimeForScreenReader(date);
      
      expect(result).toMatch(/AM|PM/);
      expect(result).toContain(':30');
    });

    it('should format time from string', () => {
      const result = formatTimeForScreenReader('2025-10-10T14:45:00Z');
      
      expect(result).toMatch(/AM|PM/);
    });
  });

  describe('formatDurationForScreenReader', () => {
    it('should format minutes only', () => {
      expect(formatDurationForScreenReader(30)).toBe('30 minutes');
      expect(formatDurationForScreenReader(1)).toBe('1 minute');
      expect(formatDurationForScreenReader(45)).toBe('45 minutes');
    });

    it('should format hours only', () => {
      expect(formatDurationForScreenReader(60)).toBe('1 hour');
      expect(formatDurationForScreenReader(120)).toBe('2 hours');
    });

    it('should format hours and minutes', () => {
      expect(formatDurationForScreenReader(90)).toBe('1 hour and 30 minutes');
      expect(formatDurationForScreenReader(125)).toBe('2 hours and 5 minutes');
      expect(formatDurationForScreenReader(61)).toBe('1 hour and 1 minute');
    });
  });

  describe('formatDistanceForScreenReader', () => {
    it('should format distance in miles', () => {
      expect(formatDistanceForScreenReader(1609.34, 'miles')).toBe('1.00 mile');
      expect(formatDistanceForScreenReader(3218.68, 'miles')).toBe('2.00 miles');
      expect(formatDistanceForScreenReader(804.67, 'miles')).toBe('0.50 miles');
    });

    it('should format distance in kilometers', () => {
      expect(formatDistanceForScreenReader(1000, 'kilometers')).toBe('1.00 kilometer');
      expect(formatDistanceForScreenReader(2000, 'kilometers')).toBe('2.00 kilometers');
      expect(formatDistanceForScreenReader(500, 'kilometers')).toBe('0.50 kilometers');
    });
  });

  describe('formatPercentageForScreenReader', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentageForScreenReader(50, 100)).toBe('50 percent');
      expect(formatPercentageForScreenReader(75, 100)).toBe('75 percent');
      expect(formatPercentageForScreenReader(100, 100)).toBe('100 percent');
    });

    it('should round percentage to nearest integer', () => {
      expect(formatPercentageForScreenReader(33, 100)).toBe('33 percent');
      expect(formatPercentageForScreenReader(66, 100)).toBe('66 percent');
    });

    it('should handle values exceeding total', () => {
      expect(formatPercentageForScreenReader(150, 100)).toBe('150 percent');
    });
  });

  describe('createStepCountLabel', () => {
    it('should create label with steps and percentage', () => {
      const label = createStepCountLabel(5000, 10000);
      
      expect(label).toContain('5,000 steps');
      expect(label).toContain('50 percent');
      expect(label).toContain('10,000 step goal');
    });

    it('should handle goal exceeded', () => {
      const label = createStepCountLabel(12000, 10000);
      
      expect(label).toContain('12,000 steps');
      expect(label).toContain('120 percent');
    });
  });

  describe('createStreakLabel', () => {
    it('should create label for single day streak', () => {
      const label = createStreakLabel(1);

      expect(label).toContain('1 day');
      expect(label).toContain('streak');
    });

    it('should create label for multi-day streak', () => {
      const label = createStreakLabel(7);

      expect(label).toContain('7 day');
      expect(label).toContain('7 days in a row');
    });
  });

  describe('createWalkLabel', () => {
    it('should create comprehensive walk label with miles', () => {
      const date = new Date('2025-10-10T12:00:00Z');
      const label = createWalkLabel(5000, 1609.34, 30, date, 'miles');

      expect(label).toContain('Walk on');
      expect(label).toContain('5,000 steps');
      expect(label).toContain('1.00 mile');
      expect(label).toContain('30 minutes');
    });

    it('should create comprehensive walk label with kilometers', () => {
      const label = createWalkLabel(8000, 2000, 45, '2025-10-10', 'kilometers');

      expect(label).toContain('8,000 steps');
      expect(label).toContain('2.00 kilometer');
      expect(label).toContain('45 minutes');
    });
  });

  describe('createBuddyLabel', () => {
    it('should create buddy label with stats', () => {
      const label = createBuddyLabel('John Doe', 8000, 5);

      expect(label).toContain('John Doe');
      expect(label).toContain('8,000 steps today');
      expect(label).toContain('5 day streak');
    });
  });

  describe('createBadgeLabel', () => {
    it('should create label for earned badge', () => {
      const label = createBadgeLabel('First Steps', 'Complete your first walk', true);

      expect(label).toContain('First Steps badge earned');
      expect(label).toContain('Complete your first walk');
    });

    it('should create label for unearned badge', () => {
      const label = createBadgeLabel('Marathon', 'Walk 26.2 miles', false);

      expect(label).toContain('Marathon badge not yet earned');
      expect(label).toContain('Walk 26.2 miles');
    });
  });

  describe('createToggleLabel', () => {
    it('should create label for enabled toggle', () => {
      const label = createToggleLabel('Daily Reminder', true);

      expect(label).toBe('Daily Reminder, enabled');
    });

    it('should create label for disabled toggle', () => {
      const label = createToggleLabel('Streak Reminder', false);

      expect(label).toBe('Streak Reminder, disabled');
    });
  });

  describe('createSliderLabel', () => {
    it('should create slider label with unit', () => {
      const label = createSliderLabel('Daily Step Goal', 10000, 1000, 20000, 'steps');

      expect(label).toContain('Daily Step Goal');
      expect(label).toContain('10000 steps');
      expect(label).toContain('minimum 1000');
      expect(label).toContain('maximum 20000');
    });

    it('should create slider label without unit', () => {
      const label = createSliderLabel('Volume', 50, 0, 100);

      expect(label).toContain('Volume');
      expect(label).toContain('50');
      expect(label).toContain('minimum 0');
      expect(label).toContain('maximum 100');
    });
  });

  describe('createButtonHint', () => {
    it('should create button hint with action', () => {
      expect(createButtonHint('start walk')).toBe('Double tap to start walk');
      expect(createButtonHint('save')).toBe('Double tap to save');
    });
  });

  describe('createLoadingLabel', () => {
    it('should create loading label with context', () => {
      expect(createLoadingLabel('walks')).toBe('Loading walks');
      expect(createLoadingLabel('profile')).toBe('Loading profile');
    });
  });

  describe('createErrorLabel', () => {
    it('should create error label with error message', () => {
      const label = createErrorLabel('walks', 'Network error');

      expect(label).toBe('Error loading walks: Network error');
    });

    it('should create error label without error message', () => {
      const label = createErrorLabel('profile');

      expect(label).toBe('Error loading profile');
    });
  });

  describe('createEmptyStateLabel', () => {
    it('should create empty state label', () => {
      expect(createEmptyStateLabel('walks')).toBe('No walks to display');
      expect(createEmptyStateLabel('buddies')).toBe('No buddies to display');
    });
  });

  describe('createProgressLabel', () => {
    it('should create progress label with percentage', () => {
      const label = createProgressLabel(5, 10, 'Upload');

      expect(label).toContain('Upload progress');
      expect(label).toContain('5 of 10');
      expect(label).toContain('50 percent complete');
    });

    it('should handle complete progress', () => {
      const label = createProgressLabel(10, 10, 'Sync');

      expect(label).toContain('10 of 10');
      expect(label).toContain('100 percent complete');
    });
  });

  describe('getTouchableAccessibilityProps', () => {
    it('should return props for button with label and hint', () => {
      const props = getTouchableAccessibilityProps('Start Walk', 'Begin tracking your walk');

      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'Start Walk',
        accessibilityHint: 'Begin tracking your walk',
        accessibilityRole: 'button',
      });
    });

    it('should return props for button without hint', () => {
      const props = getTouchableAccessibilityProps('Save');

      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'Save',
        accessibilityHint: undefined,
        accessibilityRole: 'button',
      });
    });

    it('should support different roles', () => {
      const props = getTouchableAccessibilityProps('Learn More', undefined, 'link');

      expect(props.accessibilityRole).toBe('link');
    });
  });

  describe('getTextInputAccessibilityProps', () => {
    it('should return props with value', () => {
      const props = getTextInputAccessibilityProps('Email', 'test@example.com', 'Enter your email');

      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'Email',
        accessibilityValue: { text: 'test@example.com' },
        accessibilityHint: 'Enter your email',
      });
    });

    it('should return props without value', () => {
      const props = getTextInputAccessibilityProps('Password', undefined, 'Enter your password');

      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'Password',
        accessibilityValue: undefined,
        accessibilityHint: 'Enter your password',
      });
    });
  });

  describe('getImageAccessibilityProps', () => {
    it('should return props for decorative image', () => {
      const props = getImageAccessibilityProps('Background pattern', true);

      expect(props).toEqual({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      });
    });

    it('should return props for meaningful image', () => {
      const props = getImageAccessibilityProps('User avatar', false);

      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'User avatar',
        accessibilityRole: 'image',
      });
    });

    it('should default to meaningful image', () => {
      const props = getImageAccessibilityProps('Profile photo');

      expect(props.accessible).toBe(true);
      expect(props.accessibilityRole).toBe('image');
    });
  });

  describe('getHeaderAccessibilityProps', () => {
    it('should return props with default level', () => {
      const props = getHeaderAccessibilityProps('Welcome');

      expect(props).toEqual({
        accessible: true,
        accessibilityLabel: 'Welcome',
        accessibilityRole: 'header',
        accessibilityLevel: 1,
      });
    });

    it('should return props with custom level', () => {
      const props = getHeaderAccessibilityProps('Section Title', 2);

      expect(props.accessibilityLevel).toBe(2);
    });
  });

  describe('subscribeToScreenReaderChanges', () => {
    it('should subscribe to screen reader changes', () => {
      const callback = jest.fn();
      const mockRemove = jest.fn();
      (AccessibilityInfo.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });

      const unsubscribe = subscribeToScreenReaderChanges(callback);

      expect(AccessibilityInfo.addEventListener).toHaveBeenCalledWith('screenReaderChanged', callback);

      unsubscribe();
      expect(mockRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeToReduceMotionChanges', () => {
    it('should subscribe to reduce motion changes', () => {
      const callback = jest.fn();
      const mockRemove = jest.fn();
      (AccessibilityInfo.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });

      const unsubscribe = subscribeToReduceMotionChanges(callback);

      expect(AccessibilityInfo.addEventListener).toHaveBeenCalledWith('reduceMotionChanged', callback);

      unsubscribe();
      expect(mockRemove).toHaveBeenCalledTimes(1);
    });
  });
});

