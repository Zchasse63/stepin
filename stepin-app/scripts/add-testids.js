#!/usr/bin/env node
/**
 * Automated TestID Addition Script
 * Intelligently adds testIDs to React Native components that are missing them
 * 
 * Usage: node scripts/add-testids.js [--dry-run] [--component=ComponentName]
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const specificComponent = args.find(arg => arg.startsWith('--component='))?.split('=')[1];

// Naming convention patterns
const NAMING_PATTERNS = {
  Modal: (componentName) => `${componentName.toLowerCase().replace(/modal$/, '')}-modal`,
  TouchableOpacity: (componentName, props, children) => {
    // Try to infer from children text or props
    if (children.includes('Cancel')) return 'cancel-button';
    if (children.includes('Save')) return 'save-button';
    if (children.includes('Delete')) return 'delete-button';
    if (children.includes('Edit')) return 'edit-button';
    if (children.includes('Close')) return 'close-button';
    if (children.includes('Submit')) return 'submit-button';
    if (children.includes('Continue')) return 'continue-button';
    if (children.includes('Dismiss')) return 'dismiss-button';
    if (props.includes('onClose')) return 'close-button';
    if (props.includes('onSave')) return 'save-button';
    if (props.includes('onDelete')) return 'delete-button';
    if (props.includes('onEdit')) return 'edit-button';
    return 'action-button';
  },
  TextInput: (componentName, props) => {
    // Try to infer from placeholder or props
    if (props.includes('placeholder="Steps"') || props.includes('placeholder=\'Steps\'')) return 'steps-input';
    if (props.includes('placeholder="Duration"')) return 'duration-input';
    if (props.includes('placeholder="Distance"')) return 'distance-input';
    if (props.includes('placeholder="Email"')) return 'email-input';
    if (props.includes('placeholder="Password"')) return 'password-input';
    if (props.includes('placeholder="Name"')) return 'name-input';
    if (props.includes('placeholder="Search"')) return 'search-input';
    return 'text-input';
  },
  View: (componentName, props) => {
    if (props.includes('onPress')) return 'pressable-view';
    return null; // Don't add testID to regular Views
  },
  ScrollView: () => 'scroll-view',
  FlatList: () => 'list',
  SectionList: () => 'section-list',
};

// Elements that should have testIDs
const ELEMENTS_NEEDING_TESTIDS = [
  'Modal',
  'TouchableOpacity',
  'Pressable',
  'TextInput',
  'Button',
  'Switch',
  'Picker',
  'ScrollView',
  'FlatList',
  'SectionList',
];

/**
 * Extract component name from file path
 */
function getComponentName(filePath) {
  return path.basename(filePath, '.tsx');
}

/**
 * Check if a line already has a testID
 */
function hasTestID(line) {
  return /testID\s*=/.test(line);
}

/**
 * Find the element type from a JSX opening tag
 */
function getElementType(line) {
  const match = line.match(/<(\w+)/);
  return match ? match[1] : null;
}

/**
 * Check if this is a self-closing tag
 */
function isSelfClosing(line) {
  return line.trim().endsWith('/>');
}

/**
 * Get the closing tag position for a multi-line element
 */
function findClosingBracket(lines, startIndex) {
  let depth = 0;
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('<')) depth++;
    if (line.includes('>')) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return startIndex;
}

/**
 * Extract children text from JSX element
 */
function extractChildren(lines, startIndex, endIndex) {
  let children = '';
  for (let i = startIndex + 1; i < endIndex; i++) {
    const line = lines[i].trim();
    if (line.startsWith('<Text')) {
      // Extract text content
      const textMatch = line.match(/>([^<]+)</);
      if (textMatch) children += textMatch[1];
    }
  }
  return children;
}

/**
 * Generate testID for an element
 */
function generateTestID(elementType, componentName, props, children) {
  const generator = NAMING_PATTERNS[elementType];
  if (!generator) return null;
  
  if (typeof generator === 'function') {
    return generator(componentName, props, children);
  }
  return generator;
}

/**
 * Add testID to a JSX element
 */
function addTestIDToElement(lines, elementIndex, testID, indent) {
  const line = lines[elementIndex];
  
  // Check if it's a self-closing tag
  if (isSelfClosing(line)) {
    // Add testID before the closing />
    const updated = line.replace(/\s*\/>/, `\n${indent}  testID="${testID}"\n${indent}/>`);
    return { lines: [updated], linesAdded: 2 };
  } else {
    // Multi-line element - add testID after opening tag
    const closingIndex = findClosingBracket(lines, elementIndex);
    const openingLine = lines[closingIndex];
    
    if (openingLine.trim().endsWith('>')) {
      // Add testID before the closing >
      const updated = openingLine.replace(/\s*>/, `\n${indent}  testID="${testID}"\n${indent}>`);
      return { lines: [updated], index: closingIndex, linesAdded: 2 };
    }
  }
  
  return null;
}

/**
 * Process a single component file
 */
function processComponent(filePath) {
  const componentName = getComponentName(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const changes = [];
  let modifiedLines = [...lines];
  let offset = 0; // Track line number changes
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const elementType = getElementType(line);
    
    // Skip if not an element we care about
    if (!elementType || !ELEMENTS_NEEDING_TESTIDS.includes(elementType)) continue;
    
    // Skip if already has testID
    if (hasTestID(line)) continue;
    
    // Check next few lines for testID (multi-line props)
    let hasTestIDInProps = false;
    const closingIndex = findClosingBracket(lines, i);
    for (let j = i; j <= closingIndex; j++) {
      if (hasTestID(lines[j])) {
        hasTestIDInProps = true;
        break;
      }
    }
    if (hasTestIDInProps) continue;
    
    // Extract props and children for context
    let props = '';
    let children = '';
    for (let j = i; j <= closingIndex; j++) {
      props += lines[j];
    }
    
    // Try to extract children for better naming
    const childEndIndex = findClosingTag(lines, closingIndex, elementType);
    if (childEndIndex > closingIndex) {
      children = extractChildren(lines, closingIndex, childEndIndex);
    }
    
    // Generate testID
    const testID = generateTestID(elementType, componentName, props, children);
    if (!testID) continue;
    
    // Get indentation
    const indent = line.match(/^(\s*)/)[1];
    
    // Add testID
    const result = addTestIDToElement(modifiedLines, i + offset, testID, indent);
    if (result) {
      if (result.lines) {
        modifiedLines[i + offset] = result.lines[0];
      } else if (result.index !== undefined) {
        modifiedLines[result.index + offset] = result.lines[0];
      }
      
      changes.push({
        line: i + 1,
        elementType,
        testID,
      });
      
      offset += (result.linesAdded || 0) - 1;
    }
  }
  
  return {
    componentName,
    filePath,
    changes,
    modifiedContent: modifiedLines.join('\n'),
    hasChanges: changes.length > 0,
  };
}

/**
 * Find closing tag for an element
 */
function findClosingTag(lines, startIndex, elementType) {
  const closingTag = `</${elementType}>`;
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes(closingTag)) return i;
  }
  return startIndex;
}

/**
 * Find all component files that need testIDs
 */
function findComponentsNeedingTestIDs() {
  const componentsDir = path.join(__dirname, '..', 'components');
  const files = [];
  
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('__')) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(componentsDir);
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Finding components that need testIDs...\n');
  
  let componentFiles = findComponentsNeedingTestIDs();
  
  // Filter to specific component if requested
  if (specificComponent) {
    componentFiles = componentFiles.filter(f => 
      path.basename(f, '.tsx') === specificComponent
    );
    if (componentFiles.length === 0) {
      console.log(`❌ Component "${specificComponent}" not found`);
      return;
    }
  }
  
  console.log(`Found ${componentFiles.length} component files\n`);
  
  let totalChanges = 0;
  let filesModified = 0;
  const results = [];
  
  for (const filePath of componentFiles) {
    const result = processComponent(filePath);
    results.push(result);
    
    if (result.hasChanges) {
      filesModified++;
      totalChanges += result.changes.length;
      
      console.log(`✓ ${result.componentName}`);
      result.changes.forEach(change => {
        console.log(`  Line ${change.line}: <${change.elementType}> → testID="${change.testID}"`);
      });
      console.log();
      
      // Write changes if not dry run
      if (!isDryRun) {
        fs.writeFileSync(filePath, result.modifiedContent, 'utf-8');
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files processed: ${componentFiles.length}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   TestIDs added: ${totalChanges}`);
  
  if (isDryRun) {
    console.log('\n⚠️  DRY RUN - No files were modified');
    console.log('   Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Changes applied successfully!');
  }
}

main();

