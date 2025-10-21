#!/usr/bin/env node
/**
 * Apply TestIDs Script
 * Reads the testid-gaps.json report and applies the suggested testIDs to components
 * 
 * Usage: 
 *   node scripts/apply-testids.js [--dry-run] [--component=ComponentName]
 * 
 * Workflow:
 *   1. Run generate-testid-report.js to create testid-gaps.json
 *   2. Review the suggestions in TESTID-GAP-ANALYSIS.md
 *   3. Run this script to apply the changes
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const specificComponent = args.find(arg => arg.startsWith('--component='))?.split('=')[1];

/**
 * Add testID to a specific line in the file
 */
function addTestIDToLine(lines, lineIndex, testID, elementType) {
  const line = lines[lineIndex];
  const indent = line.match(/^(\s*)/)[1];
  
  // Check if it's a self-closing tag on the same line
  if (line.trim().endsWith('/>')) {
    // Add testID before />
    lines[lineIndex] = line.replace(/\s*\/>/, `\n${indent}  testID="${testID}"\n${indent}/>`);
    return { success: true, linesAdded: 2 };
  }
  
  // Check if opening tag closes on same line
  if (line.trim().endsWith('>') && !line.trim().endsWith('/>')) {
    // Add testID before >
    lines[lineIndex] = line.replace(/\s*>/, `\n${indent}  testID="${testID}"\n${indent}>`);
    return { success: true, linesAdded: 2 };
  }
  
  // Multi-line element - find where the opening tag closes
  for (let i = lineIndex + 1; i < Math.min(lineIndex + 15, lines.length); i++) {
    const nextLine = lines[i];
    
    // Found the closing > of the opening tag
    if (nextLine.trim() === '>' || nextLine.trim().endsWith('>')) {
      const nextIndent = nextLine.match(/^(\s*)/)[1];
      lines[i] = nextLine.replace(/\s*>/, `\n${nextIndent}  testID="${testID}"\n${nextIndent}>`);
      return { success: true, linesAdded: 2, atLine: i };
    }
    
    // Found self-closing
    if (nextLine.trim().endsWith('/>')) {
      const nextIndent = nextLine.match(/^(\s*)/)[1];
      lines[i] = nextLine.replace(/\s*\/>/, `\n${nextIndent}  testID="${testID}"\n${nextIndent}/>`);
      return { success: true, linesAdded: 2, atLine: i };
    }
  }
  
  return { success: false, error: 'Could not find closing bracket' };
}

/**
 * Apply testIDs to a single component
 */
function applyTestIDsToComponent(componentData) {
  const { componentName, filePath, findings } = componentData;
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    return {
      componentName,
      success: false,
      error: `File not found: ${filePath}`,
    };
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  
  // Sort findings by line number in reverse order
  // This way we add testIDs from bottom to top, avoiding line number shifts
  const sortedFindings = [...findings].sort((a, b) => b.lineNumber - a.lineNumber);
  
  const applied = [];
  const failed = [];
  let totalLinesAdded = 0;
  
  for (const finding of sortedFindings) {
    const lineIndex = finding.lineNumber - 1; // Convert to 0-based index
    const result = addTestIDToLine(
      lines,
      lineIndex,
      finding.suggestedTestID,
      finding.elementType
    );
    
    if (result.success) {
      applied.push({
        line: finding.lineNumber,
        testID: finding.suggestedTestID,
        elementType: finding.elementType,
      });
      totalLinesAdded += result.linesAdded || 0;
    } else {
      failed.push({
        line: finding.lineNumber,
        testID: finding.suggestedTestID,
        error: result.error,
      });
    }
  }
  
  // Write the modified content
  if (!isDryRun && applied.length > 0) {
    fs.writeFileSync(fullPath, lines.join('\n'), 'utf-8');
  }
  
  return {
    componentName,
    filePath,
    success: true,
    applied,
    failed,
    totalChanges: applied.length,
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Applying testIDs to components...\n');
  
  // Load the gaps report
  const jsonPath = path.join(__dirname, '..', 'tests', 'testid-gaps.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.log('❌ testid-gaps.json not found!');
    console.log('   Run: node scripts/generate-testid-report.js first\n');
    return;
  }
  
  let gapsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  // Filter to specific component if requested
  if (specificComponent) {
    gapsData = gapsData.filter(c => c.componentName === specificComponent);
    if (gapsData.length === 0) {
      console.log(`❌ Component "${specificComponent}" not found in gaps report`);
      return;
    }
  }
  
  console.log(`Processing ${gapsData.length} components...\n`);
  
  const results = [];
  let totalApplied = 0;
  let totalFailed = 0;
  
  for (const componentData of gapsData) {
    const result = applyTestIDsToComponent(componentData);
    results.push(result);
    
    if (result.success) {
      totalApplied += result.applied.length;
      totalFailed += result.failed.length;
      
      if (result.applied.length > 0) {
        console.log(`✓ ${result.componentName}`);
        result.applied.forEach(item => {
          console.log(`  Line ${item.line}: <${item.elementType}> → testID="${item.testID}"`);
        });
        if (result.failed.length > 0) {
          console.log(`  ⚠️  ${result.failed.length} failed to apply`);
        }
        console.log();
      }
    } else {
      console.log(`✗ ${result.componentName}: ${result.error}\n`);
    }
  }
  
  console.log('📊 Summary:');
  console.log(`   Components processed: ${gapsData.length}`);
  console.log(`   TestIDs applied: ${totalApplied}`);
  console.log(`   Failed: ${totalFailed}`);
  
  if (isDryRun) {
    console.log('\n⚠️  DRY RUN - No files were modified');
    console.log('   Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Changes applied successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Review the changes in your components');
    console.log('   2. Run tests to verify testIDs work correctly');
    console.log('   3. Run generate-testid-report.js again to check for remaining gaps');
  }
}

main();

