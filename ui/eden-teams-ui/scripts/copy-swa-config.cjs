#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'staticwebapp.config.json');
const targetDir = path.join(root, 'dist');
const target = path.join(targetDir, 'staticwebapp.config.json');

if (!fs.existsSync(source)) {
  console.error('staticwebapp.config.json not found at project root; skipping copy.');
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  console.error('dist/ not found. Run the build before copying config.');
  process.exit(1);
}

fs.copyFileSync(source, target);
console.log('Copied staticwebapp.config.json to dist/.');
