#!/usr/bin/env node

/**
 * Script to add missing 'variant' prop to SettingRow test cases
 * 
 * Logic:
 * - If has showSwitch or toggleValue → variant="toggle"
 * - If has onPress or showChevron → variant="disclosure"
 * - If has value but no onPress → variant="disclosure"
 * - Otherwise → variant="action"
 */

const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, '../components/__tests__/SettingRow.test.tsx');
let content = fs.readFileSync(testFile, 'utf8');
const lines = content.split('\n');

let modified = false;
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this line starts a SettingRow component
  if (line.trim().startsWith('<SettingRow')) {
    // Collect the full component (might span multiple lines)
    let componentLines = [line];
    let j = i + 1;
    
    // Find the closing /> or >
    while (j < lines.length && !lines[j].includes('/>') && !lines[j].includes('>')) {
      componentLines.push(lines[j]);
      j++;
    }
    if (j < lines.length) {
      componentLines.push(lines[j]);
    }
    
    const fullComponent = componentLines.join('\n');
    
    // Check if variant already exists
    if (fullComponent.includes('variant=')) {
      // Already has variant, keep as is
      newLines.push(...componentLines);
      i = j;
      continue;
    }
    
    // Determine which variant to add
    let variant = 'disclosure'; // default
    
    if (fullComponent.includes('showSwitch') || fullComponent.includes('toggleValue') || fullComponent.includes('onToggle')) {
      variant = 'toggle';
    } else if (fullComponent.includes('onPress')) {
      variant = 'disclosure';
    } else if (fullComponent.includes('value=')) {
      variant = 'disclosure';
    } else {
      variant = 'action';
    }
    
    // Add variant prop
    // Find the best place to insert it (after label prop if possible)
    let modifiedComponent = fullComponent;
    
    if (fullComponent.includes('label=')) {
      // Insert after label prop
      modifiedComponent = fullComponent.replace(
        /(label="[^"]*")/,
        `$1 variant="${variant}"`
      );
    } else {
      // Insert before the first prop
      modifiedComponent = fullComponent.replace(
        /<SettingRow\s+/,
        `<SettingRow variant="${variant}" `
      );
    }
    
    // Split back into lines and add to newLines
    const modifiedLines = modifiedComponent.split('\n');
    newLines.push(...modifiedLines);
    modified = true;
    i = j;
  } else {
    newLines.push(line);
  }
}

if (modified) {
  fs.writeFileSync(testFile, newLines.join('\n'), 'utf8');
  console.log('✅ Added variant props to SettingRow test cases');
  console.log(`   Modified: ${testFile}`);
} else {
  console.log('ℹ️  No changes needed - all SettingRow components already have variant prop');
}

