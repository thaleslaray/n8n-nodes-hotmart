const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'dist/nodes/Hotmart/Hotmart.node.js',
  'dist/nodes/Hotmart/HotmartTrigger.node.js',
  'dist/credentials/HotmartOAuth2Api.credentials.js',
];

const errors = [];

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    errors.push(`Missing required file: ${file}`);
  }
});

if (errors.length > 0) {
  console.error('Build verification failed:');
  errors.forEach(err => console.error(`  ❌ ${err}`));
  process.exit(1);
} else {
  console.log('✅ Build verification passed');
}