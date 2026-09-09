/**
 * Coloro Email System - Comprehensive Multi-Case Test Suite
 *
 * Runs end-to-end automated tests against Coloro's email endpoints and security guards.
 *
 * Usage:
 *   npx tsx scripts/test-mail.ts                          (Run validation & security tests)
 *   npx tsx scripts/test-mail.ts your-email@example.com   (Run all tests including live mail delivery)
 *   npx tsx scripts/test-mail.ts --dry-run                (Skip live email transmission)
 *   npx tsx scripts/test-mail.ts --case=welcome           (Test welcome email flow only)
 *   npx tsx scripts/test-mail.ts --case=subscription      (Test subscription email flow only)
 *   npx tsx scripts/test-mail.ts --url=http://localhost:3001/api (Test against a custom base URL)
 */

interface TestResult {
  category: string;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  durationMs: number;
  details?: any;
}

// ── ANSI Color Formatting ───────────────────────────────────────────────────
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
};

// ── Parse Command Line Arguments ────────────────────────────────────────────
const args = process.argv.slice(2);
let targetEmail = '';
let isDryRun = false;
let filterCategory: string | null = null;
let apiBaseUrl = 'https://coloro.in/api';

for (const arg of args) {
  if (arg === '--dry-run') {
    isDryRun = true;
  } else if (arg.startsWith('--url=')) {
    apiBaseUrl = arg.replace('--url=', '').replace(/\/$/, '');
  } else if (arg.startsWith('--case=')) {
    filterCategory = arg.replace('--case=', '').toLowerCase();
  } else if (arg.startsWith('--to=')) {
    targetEmail = arg.replace('--to=', '').trim();
  } else if (!arg.startsWith('--') && arg.includes('@')) {
    targetEmail = arg.trim();
  }
}

const results: TestResult[] = [];

async function runTestCase(
  category: string,
  name: string,
  expected: string,
  fn: () => Promise<{ passed: boolean; actual: string; details?: any }>
) {
  if (filterCategory && !category.toLowerCase().includes(filterCategory)) {
    return;
  }

  process.stdout.write(`  ${colors.cyan}▶${colors.reset} [${category}] ${name}... `);
  const start = performance.now();
  try {
    const outcome = await fn();
    const duration = Math.round(performance.now() - start);
    results.push({
      category,
      name,
      expected,
      actual: outcome.actual,
      passed: outcome.passed,
      durationMs: duration,
      details: outcome.details,
    });

    if (outcome.passed) {
      console.log(`${colors.green}✔ PASS${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`);
    } else {
      console.log(`${colors.red}✖ FAIL${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`);
      console.log(`    ${colors.gray}Expected:${colors.reset} ${expected}`);
      console.log(`    ${colors.red}Actual:  ${colors.reset} ${outcome.actual}`);
      if (outcome.details) {
        console.log(`    ${colors.gray}Details: ${colors.reset} ${JSON.stringify(outcome.details)}`);
      }
    }
  } catch (err: any) {
    const duration = Math.round(performance.now() - start);
    results.push({
      category,
      name,
      expected,
      actual: `Error: ${err?.message || err}`,
      passed: false,
      durationMs: duration,
    });
    console.log(`${colors.red}✖ ERROR${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`);
    console.log(`    ${colors.red}${err?.stack || err?.message || err}${colors.reset}`);
  }
}

// ── Main Test Runner ────────────────────────────────────────────────────────
async function main() {
  console.log('\n' + colors.bold + colors.magenta + '===========================================================' + colors.reset);
  console.log(colors.bold + '   COLORO TRANSACTIONAL EMAIL & API TEST RUNNER');
  console.log(colors.magenta + '===========================================================' + colors.reset);
  console.log(`Target API Base : ${colors.yellow}${apiBaseUrl}${colors.reset}`);
  console.log(`Live Delivery   : ${targetEmail ? colors.green + targetEmail : colors.yellow + 'DRY-RUN (Pass email to test live delivery)'}${colors.reset}`);
  console.log(`Timestamp       : ${new Date().toISOString()}`);
  console.log('-----------------------------------------------------------\n');

  // =========================================================================
  // 1. WELCOME EMAIL TESTS (/api/send-welcome-email.php)
  // =========================================================================
  console.log(colors.bold + `\n📁 Category: Welcome Email (/api/send-welcome-email.php)` + colors.reset);

  // Case 1: Method Guard
  await runTestCase(
    'Welcome',
    'Case 1: HTTP Method Guard (GET request rejected)',
    'HTTP 405 Method Not Allowed with JSON error',
    async () => {
      const res = await fetch(`${apiBaseUrl}/send-welcome-email.php`, { method: 'GET' });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 405 && body.error?.includes('Method not allowed');
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
        details: body,
      };
    }
  );

  // Case 2: Missing Parameters (Empty Body)
  await runTestCase(
    'Welcome',
    'Case 2: Missing Parameters (Empty body returns 400)',
    'HTTP 400 with "userId and valid email are required"',
    async () => {
      const res = await fetch(`${apiBaseUrl}/send-welcome-email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 400 && body.error?.includes('required');
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
        details: body,
      };
    }
  );

  // Case 3: Missing Email Parameter
  await runTestCase(
    'Welcome',
    'Case 3: Missing Email (Only userId provided returns 400)',
    'HTTP 400 Bad Request',
    async () => {
      const res = await fetch(`${apiBaseUrl}/send-welcome-email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'test_user_no_email' }),
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 400;
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
      };
    }
  );

  // Case 4: Invalid Email Format
  await runTestCase(
    'Welcome',
    'Case 4: Invalid Email Syntax (Validation rejects malformed email)',
    'HTTP 400 with "Invalid email address format"',
    async () => {
      const res = await fetch(`${apiBaseUrl}/send-welcome-email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test_user_bad_email',
          email: 'not-a-valid-email-address',
          displayName: 'Test Artist',
        }),
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 400 && body.error?.toLowerCase().includes('email');
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
      };
    }
  );

  // Case 5 & 6: Live Welcome Dispatch & Idempotency Check
  const testWelcomeUserId = `test_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const welcomeRecipient = targetEmail || (isDryRun ? '' : '');

  if (welcomeRecipient && !isDryRun) {
    await runTestCase(
      'Welcome',
      `Case 5: Live Welcome Email Dispatch (To: ${welcomeRecipient})`,
      'HTTP 200 with success: true and alreadySent: false',
      async () => {
        const res = await fetch(`${apiBaseUrl}/send-welcome-email.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: testWelcomeUserId,
            email: welcomeRecipient,
            displayName: 'Coloro Explorer',
            trialEndDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          }),
        });
        const body = await res.json().catch(() => ({}));
        const passed = res.status === 200 && body.success === true && body.alreadySent === false;
        return {
          passed,
          actual: `HTTP ${res.status} - success: ${body.success}, alreadySent: ${body.alreadySent}`,
          details: body,
        };
      }
    );

    // Case 6: Welcome Idempotency Guard (Replay same userId)
    await runTestCase(
      'Welcome',
      'Case 6: Idempotency Protection (Duplicate welcome blocked)',
      'HTTP 200 with success: true and alreadySent: true',
      async () => {
        const res = await fetch(`${apiBaseUrl}/send-welcome-email.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: testWelcomeUserId,
            email: welcomeRecipient,
            displayName: 'Coloro Explorer',
          }),
        });
        const body = await res.json().catch(() => ({}));
        const passed = res.status === 200 && body.success === true && body.alreadySent === true;
        return {
          passed,
          actual: `HTTP ${res.status} - success: ${body.success}, alreadySent: ${body.alreadySent}, msg: ${body.message}`,
          details: body,
        };
      }
    );
  } else {
    console.log(`  ${colors.gray}ℹ Skipping Case 5 & 6 (Live welcome dispatch). Provide an email to test: npm run test:mail your-email@example.com${colors.reset}`);
  }

  // =========================================================================
  // 2. SUBSCRIPTION CONFIRMATION TESTS (/api/send-subscription-email.php)
  // =========================================================================
  console.log(colors.bold + `\n📁 Category: Subscription Confirmation (/api/send-subscription-email.php)` + colors.reset);

  // Case 7: Method Guard
  await runTestCase(
    'Subscription',
    'Case 7: HTTP Method Guard (GET request rejected)',
    'HTTP 405 Method Not Allowed',
    async () => {
      const res = await fetch(`${apiBaseUrl}/send-subscription-email.php`, { method: 'GET' });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 405 && body.error?.includes('Method not allowed');
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
      };
    }
  );

  // Case 8: Missing Required Parameters
  await runTestCase(
    'Subscription',
    'Case 8: Missing Parameters (Empty body returns 400)',
    'HTTP 400 with "orderId and valid customerEmail are required"',
    async () => {
      const res = await fetch(`${apiBaseUrl}/send-subscription-email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 400 && body.error?.includes('required');
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
      };
    }
  );

  // Case 9: Invalid Customer Email Format
  await runTestCase(
    'Subscription',
    'Case 9: Invalid Email Syntax (Rejects malformed customer email)',
    'Validation failure / HTTP 400 or error returned',
    async () => {
      const res = await fetch(`${apiBaseUrl}/send-subscription-email.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_test_val_999',
          customerEmail: 'not_an_email@@invalid',
        }),
      });
      const body = await res.json().catch(() => ({}));
      const passed = res.status >= 400 || body.success === false;
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
      };
    }
  );

  // Case 10 & 11: Live Subscription Confirmation & Idempotency Check
  const testOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const subRecipient = targetEmail || (isDryRun ? '' : '');

  if (subRecipient && !isDryRun) {
    await runTestCase(
      'Subscription',
      `Case 10: Live VIP Subscription Confirmation Dispatch (To: ${subRecipient})`,
      'HTTP 200 with success: true and alreadySent: false',
      async () => {
        const res = await fetch(`${apiBaseUrl}/send-subscription-email.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: testOrderId,
            userId: `user_vip_${Date.now()}`,
            planType: 'annual',
            amount: 999,
            currency: 'INR',
            customerEmail: subRecipient,
            customerName: 'Coloro VIP Champion',
            subscriptionEndDate: new Date(Date.now() + 365 * 86400000).toISOString(),
          }),
        });
        const body = await res.json().catch(() => ({}));
        const passed = res.status === 200 && body.success === true && body.alreadySent === false;
        return {
          passed,
          actual: `HTTP ${res.status} - success: ${body.success}, alreadySent: ${body.alreadySent}`,
          details: body,
        };
      }
    );

    // Case 11: Subscription Idempotency Guard (Replay same orderId)
    await runTestCase(
      'Subscription',
      'Case 11: Idempotency Protection (Duplicate subscription receipt blocked)',
      'HTTP 200 with success: true and alreadySent: true',
      async () => {
        const res = await fetch(`${apiBaseUrl}/send-subscription-email.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: testOrderId,
            customerEmail: subRecipient,
            planType: 'annual',
          }),
        });
        const body = await res.json().catch(() => ({}));
        const passed = res.status === 200 && body.success === true && body.alreadySent === true;
        return {
          passed,
          actual: `HTTP ${res.status} - success: ${body.success}, alreadySent: ${body.alreadySent}, msg: ${body.message}`,
          details: body,
        };
      }
    );
  } else {
    console.log(`  ${colors.gray}ℹ Skipping Case 10 & 11 (Live subscription dispatch). Provide an email to test: npm run test:mail your-email@example.com${colors.reset}`);
  }

  // =========================================================================
  // 3. CRON & SECURITY GUARDS
  // =========================================================================
  console.log(colors.bold + `\n📁 Category: Cron Security & Endpoint Access Guards` + colors.reset);

  // Case 12: Unauthorized Access to cron-subscription-reminders.php
  await runTestCase(
    'Cron Guard',
    'Case 12: Expiry Reminder Cron - Unauthorized Access Blocked',
    'HTTP 403 Forbidden without cron_secret',
    async () => {
      const res = await fetch(`${apiBaseUrl}/cron-subscription-reminders.php`, { method: 'GET' });
      const passed = res.status === 403;
      return {
        passed,
        actual: `HTTP ${res.status}`,
      };
    }
  );

  // Case 13: Authorized Access to cron-subscription-reminders.php
  await runTestCase(
    'Cron Guard',
    'Case 13: Expiry Reminder Cron - Authorized Execution',
    'HTTP 200 OK with valid ?cron_secret=reminder',
    async () => {
      const res = await fetch(`${apiBaseUrl}/cron-subscription-reminders.php?cron_secret=reminder`, { method: 'GET' });
      const text = await res.text();
      const passed = res.status === 200 && text.includes('Cron started');
      return {
        passed,
        actual: `HTTP ${res.status} - ${text.substring(0, 70).replace(/[\r\n]+/g, ' ')}...`,
      };
    }
  );

  // Case 14: Unauthorized Access to cron-weekly-drop-email.php
  await runTestCase(
    'Cron Guard',
    'Case 14: Weekly Drop Cron - Unauthorized Access Blocked',
    'HTTP 403 Forbidden without secret',
    async () => {
      const res = await fetch(`${apiBaseUrl}/cron-weekly-drop-email.php`, { method: 'GET' });
      const body = await res.json().catch(() => ({}));
      const passed = res.status === 403 && body.error?.includes('Unauthorized');
      return {
        passed,
        actual: `HTTP ${res.status} - ${JSON.stringify(body)}`,
      };
    }
  );

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n-----------------------------------------------------------');
  console.log(colors.bold + 'TEST SUITE EXECUTION SUMMARY' + colors.reset);
  console.log('-----------------------------------------------------------');
  console.log(`Total Cases Run : ${colors.bold}${total}${colors.reset}`);
  console.log(`Passed          : ${colors.green}${colors.bold}${passed}${colors.reset}`);
  console.log(`Failed          : ${failed > 0 ? colors.red + colors.bold + failed : colors.gray + '0'}${colors.reset}`);
  console.log('-----------------------------------------------------------');

  if (failed === 0) {
    console.log(`${colors.bgGreen} ALL ${total} TEST CASES PASSED SUCCESSFULLY! ${colors.reset}\n`);
  } else {
    console.log(`${colors.bgRed} ${failed} TEST CASE(S) FAILED! PLEASE REVIEW LOGS ABOVE. ${colors.reset}\n`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('\nFatal test runner error:', err);
  process.exit(1);
});
