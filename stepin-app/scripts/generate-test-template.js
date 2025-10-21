#!/usr/bin/env node

/**
 * Test Template Generator
 * Generates RNTL test file templates based on component analysis
 * 
 * Usage: node scripts/generate-test-template.js <ComponentName> <testCount>
 * Example: node scripts/generate-test-template.js EditWalkModal 28
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const componentName = args[0];
const testCount = parseInt(args[1]) || 20;

if (!componentName) {
  console.error('Error: Component name is required');
  console.log('Usage: node scripts/generate-test-template.js <ComponentName> <testCount>');
  process.exit(1);
}

const template = `/**
 * Unit tests for ${componentName}
 * Tests ${componentName} component functionality
 * Generated: ${new Date().toISOString().split('T')[0]}
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ${componentName} } from '../${componentName}';
import { useTheme } from '../../lib/theme/themeManager';
import { useAuthStore } from '../../lib/store/authStore';

// Mock dependencies
jest.mock('../../lib/theme/themeManager', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../lib/store/authStore');
jest.mock('../../lib/supabase/client');
jest.spyOn(Alert, 'alert');

describe('${componentName}', () => {
  const mockColors = {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: { primary: '#000000', secondary: '#8E8E93', disabled: '#C7C7CC' },
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    secondaryBackground: '#F2F2F7',
  };

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ colors: mockColors });
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockUser);
  });

  describe('Rendering', () => {
    it('should render component when visible', () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      expect(getByTestId('${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByTestId } = render(
        <${componentName} visible={false} onClose={jest.fn()} />
      );
      expect(queryByTestId('${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}')).toBeNull();
    });

    it('should render all form fields', () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      // Add specific field checks based on component
      expect(getByTestId('${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle input changes', () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      // Add specific interaction tests
    });

    it('should call onClose when cancel button is pressed', () => {
      const mockOnClose = jest.fn();
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={mockOnClose} />
      );
      
      fireEvent.press(getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      
      fireEvent.press(getByTestId('save-button'));
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('required')
      );
    });

    it('should validate field formats', () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      // Add format validation tests
    });
  });

  describe('Success States', () => {
    it('should call callback on successful save', async () => {
      const mockCallback = jest.fn();
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} onSave={mockCallback} />
      );
      
      // Perform save action
      fireEvent.press(getByTestId('save-button'));
      
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled();
      });
    });

    it('should show success message', async () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      
      // Trigger success scenario
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('success')
        );
      });
    });
  });

  describe('Error States', () => {
    it('should handle errors gracefully', async () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      
      // Trigger error scenario
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining('error')
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null props', () => {
      const { queryByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} data={null} />
      );
      expect(queryByTestId('${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}')).toBeTruthy();
    });

    it('should handle empty values', () => {
      const { getByTestId } = render(
        <${componentName} visible={true} onClose={jest.fn()} />
      );
      // Add empty value tests
    });
  });
});
`;

// Determine output path
const outputPath = path.join(__dirname, '..', 'components', '__tests__', `${componentName}.test.tsx`);

// Check if file already exists
if (fs.existsSync(outputPath)) {
  console.log(`⚠️  Test file already exists: ${outputPath}`);
  console.log('Skipping generation to avoid overwriting existing tests.');
  process.exit(0);
}

// Write template to file
fs.writeFileSync(outputPath, template);
console.log(`✅ Generated test template: ${outputPath}`);
console.log(`📝 Test count target: ${testCount} tests`);
console.log(`\nNext steps:`);
console.log(`1. Add testIDs to ${componentName}.tsx component`);
console.log(`2. Customize the generated test file with specific test cases`);
console.log(`3. Run: npm test -- ${componentName}.test.tsx`);

