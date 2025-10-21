#!/usr/bin/env node
/**
 * Script to update all test files with the correct mockColors structure
 * This fixes the theme mock issue across all test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The correct mockColors structure
const CORRECT_MOCK_COLORS = `{
    primary: {
      light: '#A8E6CF',
      main: '#4CAF50',
      dark: '#2E7D32',
    },
    secondary: {
      light: '#B3E5FC',
      main: '#03A9F4',
      dark: '#0277BD',
    },
    accent: {
      gold: '#FFD700',
      gray: '#9E9E9E',
      warning: '#FF9800',
    },
    surface: {
      card: '#FFFFFF',
      elevated: '#F5F5F5',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#FAFAFA',
    },
    text: {
      primary: '#000000',
      secondary: '#757575',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF',
    },
    status: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
    },
    border: {
      light: '#E0E0E0',
      main: '#BDBDBD',
      dark: '#9E9E9E',
    },
    system: {
      blue: '#007AFF',
      green: '#34C759',
      indigo: '#5856D6',
      orange: '#FF9500',
      pink: '#FF2D55',
      purple: '#AF52DE',
      red: '#FF3B30',
      teal: '#5AC8FA',
      yellow: '#FFCC00',
      gray: '#8E8E93',
      gray2: '#AEAEB2',
      gray3: '#C7C7CC',
      gray4: '#D1D1D6',
      gray5: '#E5E5EA',
      gray6: '#F2F2F7',
    },
  }`;

// Find all test files with mockColors
const findTestFiles = () => {
  try {
    const output = execSync(
      'grep -l "const mockColors = {" components/__tests__/*.test.tsx app/**/__tests__/*.test.tsx 2>/dev/null',
      { encoding: 'utf-8', cwd: __dirname + '/..' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
};

// Update a single test file
const updateTestFile = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // Check if file already has the correct structure
  if (content.includes('primary: {') && content.includes('light: \'#A8E6CF\'')) {
    console.log(`✓ ${filePath} - Already updated`);
    return { updated: false, alreadyCorrect: true };
  }
  
  // Find the mockColors declaration
  const mockColorsRegex = /const mockColors = \{[\s\S]*?\n  \};/;
  const match = content.match(mockColorsRegex);
  
  if (!match) {
    console.log(`✗ ${filePath} - Could not find mockColors declaration`);
    return { updated: false, error: 'No mockColors found' };
  }
  
  // Replace with correct structure
  const newMockColors = `const mockColors = ${CORRECT_MOCK_COLORS};`;
  content = content.replace(mockColorsRegex, newMockColors);
  
  // Also update the useTheme mock to include all properties
  const useThemeMockRegex = /\(useTheme as jest\.Mock\)\.mockReturnValue\(\{ colors: mockColors \}\);/;
  if (content.match(useThemeMockRegex)) {
    content = content.replace(
      useThemeMockRegex,
      `(useTheme as jest.Mock).mockReturnValue({ 
      colors: mockColors,
      theme: 'light',
      themePreference: 'system',
      setThemePreference: jest.fn(),
    });`
    );
  }
  
  // Write the updated content
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✓ ${filePath} - Updated`);
  return { updated: true };
};

// Main execution
const main = () => {
  console.log('🔍 Finding test files with mockColors...\n');
  
  const testFiles = findTestFiles();
  console.log(`Found ${testFiles.length} test files\n`);
  
  let updated = 0;
  let alreadyCorrect = 0;
  let errors = 0;
  
  testFiles.forEach((file) => {
    const result = updateTestFile(file);
    if (result.updated) updated++;
    if (result.alreadyCorrect) alreadyCorrect++;
    if (result.error) errors++;
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Already correct: ${alreadyCorrect}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${testFiles.length}`);
};

main();

