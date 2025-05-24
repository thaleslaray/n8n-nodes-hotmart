#!/usr/bin/env node

/**
 * Build Verification Script
 * Ensures the build output contains all required files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REQUIRED_FILES = [
  'dist/nodes/Hotmart/Hotmart.node.js',
  'dist/nodes/Hotmart/HotmartTrigger.node.js',
  'dist/nodes/Hotmart/v1/HotmartV1.node.js',
  'dist/credentials/HotmartOAuth2Api.credentials.js',
  'dist/nodes/Hotmart/hotmart.svg',
];

const REQUIRED_DIRS = [
  'dist/nodes/Hotmart/v1/actions',
  'dist/nodes/Hotmart/v1/helpers',
  'dist/nodes/Hotmart/v1/transport',
];

console.log('🔍 Verifying build output...\n');

let hasErrors = false;

// Check required files
console.log('📁 Checking required files:');
REQUIRED_FILES.forEach(file => {
  const exists = fs.existsSync(file);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${file}`);
  if (!exists) hasErrors = true;
});

console.log('\n📂 Checking required directories:');
REQUIRED_DIRS.forEach(dir => {
  const exists = fs.existsSync(dir);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${dir}`);
  if (!exists) hasErrors = true;
});

// Check for .js.map files
console.log('\n🗺️  Checking source maps:');
const jsFiles = execSync('find dist -name "*.js" -type f', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const missingMaps = jsFiles.filter(file => !fs.existsSync(`${file}.map`));
if (missingMaps.length > 0) {
  console.log(`⚠️  ${missingMaps.length} source maps missing`);
}

// Check for TypeScript files in dist (shouldn't exist, except .d.ts)
console.log('\n🚫 Checking for TypeScript source files in dist:');
try {
  const tsInDist = execSync('find dist -name "*.ts" -type f ! -name "*.d.ts"', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  if (tsInDist.length > 0) {
    console.log(`❌ Found ${tsInDist.length} .ts source files in dist/`);
    hasErrors = true;
  } else {
    console.log('✅ No .ts source files in dist/');
  }
} catch (e) {
  console.log('✅ No .ts source files in dist/');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Build verification FAILED');
  console.log('\nPlease run "pnpm build" and check for errors.');
  process.exit(1);
} else {
  console.log('✅ Build verification PASSED');
  console.log(`\n📊 Total files: ${jsFiles.length}`);
  console.log(`📦 Build size: ${execSync('du -sh dist', { encoding: 'utf-8' }).trim()}`);
}