// Direct test runner that avoids npm hoisting issues
const jest = require('jest-cli');

async function run() {
  try {
    const result = await jest.run(['--config', 'jest.config.ts', '--no-coverage']);
    console.log('Tests completed:', result);
  } catch (e) {
    console.error('Error running tests:', e.message);
    process.exit(1);
  }
}

run();