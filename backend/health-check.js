/**
 * SparkLive Monitoring & Health Check
 * 
 * Enterprise-grade health monitoring for production readiness.
 * 
 * Usage: node health-check.js
 */

const http = require('http');

const TARGET = process.env.TARGET || 'http://localhost:5000';
const CHECK_INTERVAL = parseInt(process.env.INTERVAL || '30000', 10); // 30s by default

const checks = {
  api: { path: '/health', critical: true },
  version: { path: '/api/version', critical: true },
};

let status = {
  healthy: true,
  lastCheck: null,
  checks: {},
  uptime: 0,
  startTime: Date.now(),
};

function httpGet(path) {
  return new Promise((resolve) => {
    const url = new URL(path, TARGET);
    const start = Date.now();
    
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          duration: Date.now() - start,
          body: data,
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, duration: Date.now() - start, error: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 0, duration: Date.now() - start, error: 'Timeout' });
    });
  });
}

async function runHealthCheck() {
  const results = {};
  let allHealthy = true;

  for (const [name, config] of Object.entries(checks)) {
    const result = await httpGet(config.path);
    const passed = result.status >= 200 && result.status < 400;
    
    results[name] = {
      path: config.path,
      status: result.status,
      duration: `${result.duration}ms`,
      passed,
      critical: config.critical,
    };

    if (!passed && config.critical) {
      allHealthy = false;
    }
  }

  status = {
    healthy: allHealthy,
    lastCheck: new Date().toISOString(),
    uptime: Math.floor((Date.now() - status.startTime) / 1000),
    checks: results,
  };

  return status;
}

function printStatus() {
  const prefix = status.healthy ? '✓' : '✗';
  console.log(`\n[${new Date().toISOString()}] ${prefix} Health Status: ${status.healthy ? 'HEALTHY' : 'DEGRADED'}`);
  console.log(`  Uptime: ${status.uptime}s`);

  for (const [name, check] of Object.entries(status.checks)) {
    const icon = check.passed ? '✓' : '✗';
    console.log(`  ${icon} ${name}: ${check.path} -> ${check.status} (${check.duration})`);
  }
}

// Run once
async function main() {
  console.log('══════════════════════════════════════════════');
  console.log('  SparkLive Health Monitor');
  console.log(`  Target: ${TARGET}`);
  console.log('══════════════════════════════════════════════\n');

  await runHealthCheck();
  printStatus();

  // Continuous monitoring
  setInterval(async () => {
    await runHealthCheck();
    printStatus();
  }, CHECK_INTERVAL);

  // Report final status on exit
  process.on('SIGINT', () => {
    console.log(`\n\nMonitor stopped. Total uptime: ${Math.floor((Date.now() - status.startTime) / 1000)}s`);
    process.exit(status.healthy ? 0 : 1);
  });
}

main().catch(console.error);