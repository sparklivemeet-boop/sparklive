// Start Next.js dev server
const { execSync } = require('child_process');
const path = require('path');

const nextDir = path.resolve(__dirname, 'node_modules/next');
const pkg = require(path.join(nextDir, 'package.json'));

console.log('Next.js version:', pkg.version);
console.log('Starting Next.js dev server...');

// Find the entry point
const bin = typeof pkg.bin === 'string' ? pkg.bin : (pkg.bin?.next || 'dist/bin/next');
console.log('Bin path:', bin);

const entryPoint = path.resolve(nextDir, bin);
console.log('Entry point:', entryPoint);

require(entryPoint);