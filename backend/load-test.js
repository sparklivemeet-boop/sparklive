/**
 * SparkLive Load Testing Script
 * 
 * Simulates realistic production traffic for performance validation.
 * Tests various scenarios: concurrent users, live streams, chat, etc.
 * 
 * Usage: node load-test.js
 * 
 * Prerequisites: npm install -g autocannon or artillery
 */

const http = require('http');

const TARGET = process.env.TARGET || 'http://localhost:5000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '100', 10);
const DURATION = parseInt(process.env.DURATION || '30', 10);

// Test scenarios
const scenarios = [
  { name: 'Health Check', path: '/health', method: 'GET' },
  { name: 'API Version', path: '/api/version', method: 'GET' },
  { name: 'Login', path: '/api/auth/login', method: 'POST', body: { email: 'test@sparkliveapp.xyz', password: 'Test1234!' } },
  { name: 'Register', path: '/api/auth/register', method: 'POST', body: { email: 'loadtest@sparkliveapp.xyz', username: 'load_tester', password: 'Test1234!' } },
  { name: 'Get Profiles', path: '/api/profiles/public/testuser', method: 'GET' },
  { name: 'Get Feed', path: '/api/feed', method: 'GET' },
  { name: 'Get Active Streams', path: '/api/live/active', method: 'GET' },
  { name: 'Get Gifts', path: '/api/gifts', method: 'GET' },
  { name: 'Get Notifications', path: '/api/notifications', method: 'GET' },
  { name: 'Search Users', path: '/api/search/users?q=test', method: 'GET' },
];

const results = {};

function makeRequest(scenario) {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(scenario.path, TARGET);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: scenario.method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          status: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 500,
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, duration: Date.now() - start, success: false, error: err.message });
    });

    if (scenario.body) {
      req.write(JSON.stringify(scenario.body));
    }

    req.end();
  });
}

async function runScenario(scenario, concurrentUsers) {
  const scenarioResults = [];
  const promises = [];

  for (let i = 0; i < concurrentUsers; i++) {
    promises.push(makeRequest(scenario));
  }

  const responses = await Promise.allSettled(promises);
  
  responses.forEach(r => {
    if (r.status === 'fulfilled') {
      scenarioResults.push(r.value);
    }
  });

  const successful = scenarioResults.filter(r => r.success).length;
  const avgDuration = scenarioResults.reduce((sum, r) => sum + r.duration, 0) / scenarioResults.length;
  const maxDuration = Math.max(...scenarioResults.map(r => r.duration));
  const minDuration = Math.min(...scenarioResults.map(r => r.duration));

  results[scenario.name] = {
    total: scenarioResults.length,
    successful,
    failed: scenarioResults.length - successful,
    avgResponseTime: `${avgDuration.toFixed(2)}ms`,
    maxResponseTime: `${maxDuration}ms`,
    minResponseTime: `${minDuration}ms`,
    successRate: `${((successful / scenarioResults.length) * 100).toFixed(1)}%`,
  };

  console.log(`  ✓ ${scenario.name}: ${successful}/${scenarioResults.length} (avg: ${avgDuration.toFixed(0)}ms)`);
}

async function main() {
  console.log('══════════════════════════════════════════════');
  console.log('  SparkLive Load Test Suite');
  console.log(`  Target: ${TARGET}`);
  console.log(`  Concurrency: ${CONCURRENCY} users`);
  console.log(`  Duration: ${DURATION}s`);
  console.log('══════════════════════════════════════════════\n');

  console.log('Running scenarios...\n');

  for (const scenario of scenarios) {
    await runScenario(scenario, CONCURRENCY);
  }

  console.log('\n══════════════════════════════════════════════');
  console.log('  Results Summary');
  console.log('══════════════════════════════════════════════\n');

  let totalTests = 0;
  let totalSuccess = 0;

  for (const [name, data] of Object.entries(results)) {
    totalTests += data.total;
    totalSuccess += data.successful;
    console.log(`  ${name}`);
    console.log(`    Requests: ${data.total} | Passed: ${data.successful} | Failed: ${data.failed}`);
    console.log(`    Response: avg=${data.avgResponseTime} min=${data.minResponseTime} max=${data.maxResponseTime}`);
    console.log(`    Success: ${data.successRate}\n`);
  }

  console.log('══════════════════════════════════════════════');
  console.log(`  Total: ${totalTests} requests | ${totalSuccess} successful`);
  console.log(`  Overall: ${((totalSuccess / totalTests) * 100).toFixed(1)}% pass rate`);
  console.log('══════════════════════════════════════════════');

  if (totalSuccess < totalTests) {
    console.log('\n⚠ Some tests failed. Review individual results above.');
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  }
}

main().catch(console.error);