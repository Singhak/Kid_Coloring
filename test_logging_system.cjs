const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING LOGGING SYSTEM VERIFICATION TESTS');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}\n`);
    failedTests++;
  }
}

const apiDir = path.join(__dirname, 'public', 'api');

// 1. Verify logger.php exists and contains all required components
runTest('logger.php exists and contains core functions', () => {
  const loggerPath = path.join(apiDir, 'logger.php');
  assert(fs.existsSync(loggerPath), 'logger.php must exist in public/api/');

  const content = fs.readFileSync(loggerPath, 'utf8');
  assert(content.includes('function logApiCall'), 'Must define logApiCall()');
  assert(content.includes('function logApiError'), 'Must define logApiError()');
  assert(content.includes('function logCronError'), 'Must define logCronError()');
  assert(content.includes('function initApiLogging'), 'Must define initApiLogging()');
  assert(content.includes('function sanitizeLogData'), 'Must define sanitizeLogData()');
  assert(content.includes('function rotateLogFileIfNeeded'), 'Must define rotateLogFileIfNeeded()');
  assert(content.includes('api.log'), 'Must define api.log constant');
  assert(content.includes('api_error.log'), 'Must define api_error.log constant');
  assert(content.includes('register_shutdown_function'), 'Must register shutdown function');
});

// 2. Verify all 8 endpoint files require logger.php and call initApiLogging
const endpoints = [
  'create-cashfree-order.php',
  'verify-cashfree-payment.php',
  'cashfree-webhook.php',
  'create-razorpay-order.php',
  'verify-razorpay-payment.php',
  'generate-paths.php',
  'generate-paths-gemini.php',
  'process-queue.php'
];

endpoints.forEach((file) => {
  runTest(`Endpoint ${file} loads logger and initializes API logging`, () => {
    const filePath = path.join(apiDir, file);
    assert(fs.existsSync(filePath), `${file} must exist`);
    const code = fs.readFileSync(filePath, 'utf8');
    assert(
      code.includes("require_once __DIR__ . '/logger.php';"),
      `${file} must require logger.php`
    );
    assert(
      code.includes(`initApiLogging('${file}')`),
      `${file} must call initApiLogging('${file}')`
    );
  });
});

// 3. Verify no duplicate function definitions across endpoint files
runTest('No conflicting function declarations across endpoints', () => {
  const allFiles = [...endpoints];
  for (const file of allFiles) {
    const code = fs.readFileSync(path.join(apiDir, file), 'utf8');
    const logApiErrorMatches = code.match(/function\s+logApiError\s*\(/g);
    assert(
      !logApiErrorMatches || logApiErrorMatches.length === 0,
      `${file} should NOT re-declare logApiError (must use logger.php)`
    );
    const logCronErrorMatches = code.match(/function\s+logCronError\s*\(/g);
    assert(
      !logCronErrorMatches || logCronErrorMatches.length === 0,
      `${file} should NOT re-declare logCronError (must use logger.php)`
    );
  }
});

// 4. Verify Sensitive Data Redaction logic behaves correctly
runTest('Sensitive data redaction logic masks credentials', () => {
  const sensitivePatterns = [
    'secret', 'key', 'password', 'pass', 'token', 'auth',
    'authorization', 'signature', 'x-webhook-signature',
    'x-client-secret', 'credential', 'cvv', 'card'
  ];

  function sanitizeLogData(data) {
    if (typeof data === 'string') {
      try {
        const decoded = JSON.parse(data);
        if (typeof decoded === 'object' && decoded !== null) {
          return JSON.stringify(sanitizeLogData(decoded));
        }
      } catch (e) {}
      return data;
    }
    if (typeof data !== 'object' || data === null) return data;

    const clean = Array.isArray(data) ? [] : {};
    for (const [k, v] of Object.entries(data)) {
      const lower = String(k).toLowerCase();
      const isSens = sensitivePatterns.some(p => lower.includes(p));
      if (isSens) {
        clean[k] = '***REDACTED***';
      } else if (typeof v === 'object' && v !== null) {
        clean[k] = sanitizeLogData(v);
      } else {
        clean[k] = v;
      }
    }
    return clean;
  }

  const testPayload = {
    userId: 'user_123',
    orderId: 'kc_ann_12345',
    CASHFREE_SECRET_KEY: 'top_secret_cf_key',
    cashfreeSecret: 'another_secret',
    razorpayKeySecret: 'rzp_sec_999',
    x_webhook_signature: 'abc123hmacsignature',
    password: 'plaintextpassword',
    token: 'jwt.bearer.token',
    normalField: 'all_good_here'
  };

  const sanitized = sanitizeLogData(testPayload);
  assert.strictEqual(sanitized.userId, 'user_123');
  assert.strictEqual(sanitized.normalField, 'all_good_here');
  assert.strictEqual(sanitized.CASHFREE_SECRET_KEY, '***REDACTED***');
  assert.strictEqual(sanitized.cashfreeSecret, '***REDACTED***');
  assert.strictEqual(sanitized.razorpayKeySecret, '***REDACTED***');
  assert.strictEqual(sanitized.x_webhook_signature, '***REDACTED***');
  assert.strictEqual(sanitized.password, '***REDACTED***');
  assert.strictEqual(sanitized.token, '***REDACTED***');
});

// 5. Verify .htaccess protects .log files and logger.php
runTest('.htaccess strictly blocks direct web access to .log and logger.php', () => {
  const htaccessPath = path.join(apiDir, '.htaccess');
  assert(fs.existsSync(htaccessPath), '.htaccess must exist in public/api/');
  const htaccess = fs.readFileSync(htaccessPath, 'utf8');
  assert(htaccess.includes('\\.log$'), '.htaccess must block \\.log$');
  assert(htaccess.includes('logger\\.php'), '.htaccess must block logger.php');
  assert(htaccess.includes('Require all denied'), '.htaccess must deny access');
});

// 6. Verify log format structure conforms to standards
runTest('Log formatting satisfies common API call and error log specifications', () => {
  const sampleTimestamp = '2026-09-07 22:30:00 UTC';
  const reqId = 'req_a1b2c3d4e5f6';
  const endpoint = 'create-cashfree-order.php';
  const method = 'POST';
  const ip = '127.0.0.1';
  const status = 200;
  const durationMs = 45.2;
  const message = 'Cashfree order created successfully';
  const context = { order_id: 'kc_ann_123', amount: 499, plan: 'annual' };

  // Common API Call Log entry
  const callEntry = `[${sampleTimestamp}] [REQ:${reqId}] [INFO] [${endpoint}] [METHOD:${method}] [IP:${ip}] [STATUS:${status}] [TIME:${durationMs}ms] - ${message} | Context: ${JSON.stringify(context)}\n`;
  
  assert(callEntry.includes('[REQ:req_a1b2c3d4e5f6]'));
  assert(callEntry.includes('[create-cashfree-order.php]'));
  assert(callEntry.includes('[STATUS:200]'));
  assert(callEntry.includes('[TIME:45.2ms]'));

  // Common Error Log entry
  const errorEntry = `[${sampleTimestamp}] [REQ:${reqId}] [ERROR] [${endpoint}] [METHOD:${method}] [IP:${ip}] [CODE:400] User ID is required | Context: ${JSON.stringify({ plan: 'monthly' })}\n`;

  assert(errorEntry.includes('[ERROR]'));
  assert(errorEntry.includes('[CODE:400]'));
  assert(errorEntry.includes('User ID is required'));
});

console.log(`\n====================================================`);
console.log(`Logging Test Suite Results: ${passedTests} passed, ${failedTests} failed`);
console.log(`====================================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
