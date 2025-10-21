#!/usr/bin/env node
/**
 * TestID Gap Analysis Script
 * Generates a detailed report of which components need testIDs and where
 * 
 * This is a semi-automated approach that identifies exactly what needs to be added
 * Output can be used to manually add testIDs or generate automated patches
 * 
 * Usage: node scripts/generate-testid-report.js [--component=ComponentName]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const specificComponent = args.find(arg => arg.startsWith('--component='))?.split('=')[1];

// Elements that should have testIDs
const INTERACTIVE_ELEMENTS = [
  'Modal',
  'TouchableOpacity',
  'Pressable',
  'TextInput',
  'Button',
  'Switch',
  'Picker',
];

/**
 * Smart testID naming based on context
 */
function suggestTestID(elementType, line, componentName, surroundingLines) {
  const lowerComponent = componentName.toLowerCase().replace(/modal$/, '');
  
  // Modal naming
  if (elementType === 'Modal') {
    return `${lowerComponent}-modal`;
  }
  
  // Button naming - look at children text
  if (elementType === 'TouchableOpacity' || elementType === 'Pressable' || elementType === 'Button') {
    const context = surroundingLines.join(' ').toLowerCase();
    
    if (context.includes('cancel')) return 'cancel-button';
    if (context.includes('save')) return 'save-button';
    if (context.includes('delete')) return 'delete-button';
    if (context.includes('edit')) return 'edit-button';
    if (context.includes('close')) return 'close-button';
    if (context.includes('submit')) return 'submit-button';
    if (context.includes('continue')) return 'continue-button';
    if (context.includes('dismiss')) return 'dismiss-button';
    if (context.includes('confirm')) return 'confirm-button';
    if (context.includes('add')) return 'add-button';
    if (context.includes('remove')) return 'remove-button';
    if (context.includes('send')) return 'send-button';
    if (context.includes('share')) return 'share-button';
    if (context.includes('next')) return 'next-button';
    if (context.includes('back')) return 'back-button';
    if (context.includes('skip')) return 'skip-button';
    
    // Check for onPress handlers
    if (line.includes('onClose')) return 'close-button';
    if (line.includes('onSave')) return 'save-button';
    if (line.includes('onDelete')) return 'delete-button';
    if (line.includes('onEdit')) return 'edit-button';
    if (line.includes('onSubmit')) return 'submit-button';
    if (line.includes('onDismiss')) return 'dismiss-button';
    
    return 'action-button';
  }
  
  // Input naming - look at placeholder
  if (elementType === 'TextInput') {
    if (line.includes('placeholder="Steps"') || line.includes("placeholder='Steps'")) return 'steps-input';
    if (line.includes('placeholder="Duration"')) return 'duration-input';
    if (line.includes('placeholder="Distance"')) return 'distance-input';
    if (line.includes('placeholder="Email"')) return 'email-input';
    if (line.includes('placeholder="Password"')) return 'password-input';
    if (line.includes('placeholder="Name"')) return 'name-input';
    if (line.includes('placeholder="Search"')) return 'search-input';
    if (line.includes('placeholder="Message"')) return 'message-input';
    if (line.includes('placeholder="Title"')) return 'title-input';
    if (line.includes('placeholder="Description"')) return 'description-input';
    
    return 'text-input';
  }
  
  // Switch naming
  if (elementType === 'Switch') {
    return 'toggle-switch';
  }
  
  return `${elementType.toLowerCase()}-element`;
}

/**
 * Check if component file has testIDs
 */
function analyzeComponent(filePath) {
  const componentName = path.basename(filePath, '.tsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const findings = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for interactive elements
    for (const elementType of INTERACTIVE_ELEMENTS) {
      const regex = new RegExp(`<${elementType}[\\s>]`);
      if (regex.test(line)) {
        // Check if this element or nearby lines have testID
        let hasTestID = false;
        
        // Check current line and next 10 lines for testID
        for (let j = i; j < Math.min(i + 10, lines.length); j++) {
          if (/testID\s*=/.test(lines[j])) {
            hasTestID = true;
            break;
          }
          // Stop if we hit a closing tag
          if (lines[j].includes(`</${elementType}>`)) break;
          // Stop if we hit another opening tag
          if (j > i && lines[j].includes('<' + elementType)) break;
        }
        
        if (!hasTestID) {
          // Get surrounding lines for context
          const surroundingLines = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 8));
          const suggestedID = suggestTestID(elementType, line, componentName, surroundingLines);
          
          findings.push({
            lineNumber: i + 1,
            line: line.trim(),
            elementType,
            suggestedTestID: suggestedID,
            context: surroundingLines.map((l, idx) => ({
              lineNum: i - 2 + idx + 1,
              content: l,
              isCurrent: idx === 2,
            })),
          });
        }
      }
    }
  }
  
  return {
    componentName,
    filePath: path.relative(process.cwd(), filePath),
    findings,
    needsTestIDs: findings.length > 0,
  };
}

/**
 * Find all component files
 */
function findComponentFiles() {
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
 * Generate markdown report
 */
function generateMarkdownReport(results) {
  let md = '# TestID Gap Analysis Report\n\n';
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  const componentsNeedingTestIDs = results.filter(r => r.needsTestIDs);
  const totalMissingTestIDs = componentsNeedingTestIDs.reduce((sum, r) => sum + r.findings.length, 0);
  
  md += '## Summary\n\n';
  md += `- **Total Components Analyzed:** ${results.length}\n`;
  md += `- **Components Needing TestIDs:** ${componentsNeedingTestIDs.length}\n`;
  md += `- **Total Missing TestIDs:** ${totalMissingTestIDs}\n\n`;
  
  md += '---\n\n';
  
  for (const result of componentsNeedingTestIDs) {
    md += `## ${result.componentName}\n\n`;
    md += `**File:** \`${result.filePath}\`\n\n`;
    md += `**Missing TestIDs:** ${result.findings.length}\n\n`;
    
    for (const finding of result.findings) {
      md += `### Line ${finding.lineNumber}: \`<${finding.elementType}>\`\n\n`;
      md += `**Suggested TestID:** \`${finding.suggestedTestID}\`\n\n`;
      md += '```tsx\n';
      md += `// Add this to line ${finding.lineNumber}:\n`;
      md += `testID="${finding.suggestedTestID}"\n\n`;
      md += '// Context:\n';
      for (const ctx of finding.context) {
        const marker = ctx.isCurrent ? '→ ' : '  ';
        md += `${marker}${ctx.lineNum}: ${ctx.content}\n`;
      }
      md += '```\n\n';
    }
    
    md += '---\n\n';
  }
  
  return md;
}

/**
 * Generate JSON report for programmatic use
 */
function generateJSONReport(results) {
  return JSON.stringify(results.filter(r => r.needsTestIDs), null, 2);
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Analyzing components for missing testIDs...\n');
  
  let componentFiles = findComponentFiles();
  
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
  
  console.log(`Analyzing ${componentFiles.length} components...\n`);
  
  const results = componentFiles.map(analyzeComponent);
  const componentsNeedingTestIDs = results.filter(r => r.needsTestIDs);
  const totalMissingTestIDs = componentsNeedingTestIDs.reduce((sum, r) => sum + r.findings.length, 0);
  
  // Console output
  console.log('📊 Analysis Complete!\n');
  console.log(`Components needing testIDs: ${componentsNeedingTestIDs.length}/${results.length}`);
  console.log(`Total missing testIDs: ${totalMissingTestIDs}\n`);
  
  if (componentsNeedingTestIDs.length > 0) {
    console.log('Components with missing testIDs:');
    for (const result of componentsNeedingTestIDs) {
      console.log(`  • ${result.componentName} (${result.findings.length} missing)`);
    }
    console.log();
  }
  
  // Generate reports
  const mdReport = generateMarkdownReport(results);
  const jsonReport = generateJSONReport(results);
  
  const reportsDir = path.join(__dirname, '..', 'tests');
  const mdPath = path.join(reportsDir, 'TESTID-GAP-ANALYSIS.md');
  const jsonPath = path.join(reportsDir, 'testid-gaps.json');
  
  fs.writeFileSync(mdPath, mdReport);
  fs.writeFileSync(jsonPath, jsonReport);
  
  console.log('📝 Reports generated:');
  console.log(`   Markdown: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`   JSON: ${path.relative(process.cwd(), jsonPath)}`);
  console.log();
  console.log('💡 Next steps:');
  console.log('   1. Review TESTID-GAP-ANALYSIS.md for detailed findings');
  console.log('   2. Use the suggested testIDs to update components');
  console.log('   3. Run tests to verify testIDs work correctly');
}

main();

