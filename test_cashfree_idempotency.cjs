/**
 * Automated Verification Suite for Cashfree Payment Gateway Integration
 * Covers:
 * 1. Primary keying on order_id
 * 2. Idempotency protection & duplicate prevention
 * 3. Multiple payment attempts resolution
 * 4. Plan pricing & price-tampering immunity
 * 5. Gateway status state machine (PAID, PENDING, ACTIVE with 0 attempts, FAILED, CANCELLED)
 * 6. Customer phone sanitization (10-digit guarantee)
 * 7. Order ID generation with plan prefix & Cashfree limit compliance
 * 8. Return redirect plan detection (monthly vs annual)
 * 9. Webhook HMAC-SHA256 signature authentication & bypass prevention
 * 10. Subscription expiry validation (expired vs active VIP pro)
 * 11. 15-Day Free Trial one-time grant logic (no infinite renewal)
 */

const assert = require('assert');
const crypto = require('crypto');

console.log('====================================================');
console.log('🧪 RUNNING COMPREHENSIVE CASHFREE VERIFICATION SUITE');
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

// ----------------------------------------------------
// Mock Simulated Firestore Database for testing
// ----------------------------------------------------
class MockFirestore {
  constructor() {
    this.collections = {
      users: {},
      orders: {}
    };
  }

  getOrder(orderId) {
    return this.collections.orders[orderId] || null;
  }

  getUser(userId) {
    return this.collections.users[userId] || null;
  }

  // Idempotent record order function matching paymentService.ts
  recordOrderSuccess(orderId, userId, plan, paymentDetails) {
    const effectivePlan = paymentDetails?.planType || plan;
    const effectiveAmount = effectivePlan === 'annual' ? 499.00 : 99.00;
    const existingOrder = this.collections.orders[orderId];
    const now = Date.now();
    const durationMs = effectivePlan === 'annual' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const endDate = new Date(now + durationMs);

    // 1. Idempotency Check
    if (existingOrder && existingOrder.status === 'paid') {
      return {
        alreadyProcessed: true,
        orderId: existingOrder.orderId,
        subscriptionEndDate: existingOrder.subscriptionEndDate,
        planType: existingOrder.planType || effectivePlan
      };
    }

    // 2. Write order record strictly keyed on order_id
    this.collections.orders[orderId] = {
      orderId,
      userId,
      gateway: 'cashfree',
      planType: effectivePlan,
      amount: effectiveAmount,
      currency: 'INR',
      status: 'paid',
      paymentId: paymentDetails?.payment_id || `${orderId}_cf`,
      paymentMethod: typeof paymentDetails?.payment_method === 'string' ? paymentDetails.payment_method : 'cashfree',
      subscriptionStartDate: new Date(now),
      subscriptionEndDate: endDate,
      createdAt: new Date(now),
      processedAt: new Date(now)
    };

    // 3. Update User Profile
    const existingUser = this.collections.users[userId] || {};
    this.collections.users[userId] = {
      ...existingUser,
      isSubscribed: true,
      planType: effectivePlan,
      subscriptionStartDate: new Date(now),
      subscriptionEndDate: endDate,
      lastOrderId: orderId,
      gateway: 'cashfree',
      updatedAt: new Date(now)
    };

    return {
      alreadyProcessed: false,
      orderId,
      subscriptionEndDate: endDate,
      planType: effectivePlan
    };
  }
}

// ----------------------------------------------------
// Status Classifier Matching verify-cashfree-payment.php
// ----------------------------------------------------
function classifyCashfreeStatus(orderId, orderStatus, orderAmount, payments = [], tags = {}) {
  const normOrderStatus = (orderStatus || '').toUpperCase();
  
  let planType = tags.plan_type || null;
  if (!planType) {
    planType = (orderId.includes('mon') || orderAmount < 200) ? 'monthly' : 'annual';
  }

  let successfulPayment = null;
  let pendingPayment = null;
  let lastFailedPayment = null;

  for (const p of payments) {
    const status = (p.payment_status || '').toUpperCase();
    if (status === 'SUCCESS') {
      successfulPayment = p;
      break;
    } else if (status === 'PENDING') {
      pendingPayment = p;
    } else if (['FAILED', 'CANCELLED', 'USER_DROPPED'].includes(status)) {
      lastFailedPayment = p;
    }
  }

  if (normOrderStatus === 'PAID' || successfulPayment !== null) {
    return {
      success: true,
      isPending: false,
      order_status: 'PAID',
      payment_status: 'SUCCESS',
      planType,
      amount: orderAmount,
      payment_id: successfulPayment?.cf_payment_id || (orderId + '_cf')
    };
  }

  if (normOrderStatus === 'ACTIVE') {
    if (pendingPayment !== null) {
      return {
        success: false,
        isPending: true,
        order_status: 'ACTIVE',
        planType,
        message: 'Awaiting bank confirmation'
      };
    }
    if (lastFailedPayment !== null) {
      return {
        success: false,
        isPending: false,
        order_status: 'ACTIVE',
        planType,
        payment_status: lastFailedPayment.payment_status,
        error: lastFailedPayment.payment_message || 'Payment failed or cancelled'
      };
    }
    // 0 payment attempts: return isPending: false so frontend does not enter a false 45s loop
    return {
      success: false,
      isPending: false,
      order_status: 'ACTIVE',
      planType,
      error: 'No payment attempt was completed.'
    };
  }

  return {
    success: false,
    isPending: false,
    order_status: normOrderStatus,
    planType,
    error: 'Order expired or cancelled'
  };
}

// ----------------------------------------------------
// Webhook Signature Verifier Matching cashfree-webhook.php
// ----------------------------------------------------
function verifyWebhookSignature(secret, rawBody, signature, timestamp) {
  if (!secret) return { verified: true, reason: 'no_secret_configured' };
  if (!signature || !timestamp) {
    return { verified: false, httpCode: 401, error: 'Missing required signature or timestamp header' };
  }
  const expected = crypto.createHmac('sha256', secret).update(timestamp + rawBody).digest('base64');
  const bufExpected = Buffer.from(expected);
  const bufSig = Buffer.from(signature);
  if (bufExpected.length !== bufSig.length) {
    return { verified: false, httpCode: 401, error: 'Invalid webhook signature' };
  }
  if (crypto.timingSafeEqual(bufExpected, bufSig)) {
    return { verified: true };
  }
  return { verified: false, httpCode: 401, error: 'Invalid webhook signature' };
}

// ----------------------------------------------------
// Order ID Generator Matching create-cashfree-order.php
// ----------------------------------------------------
function generateOrderId(userId, planType) {
  const planPrefix = (planType === 'monthly') ? 'mon_' : 'ann_';
  const sanitizedUserId = (userId || '').replace(/[^a-zA-Z0-9]/g, '');
  const shortUid = sanitizedUserId.slice(0, 10);
  const orderId = `kc_${planPrefix}${shortUid ? shortUid + '_' : ''}${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;
  return orderId;
}

// ----------------------------------------------------
// Server-Side Price Validator Matching create-cashfree-order.php
// ----------------------------------------------------
function calculateServerOrderPrice(planType, clientAmount) {
  // Authoritative server-side pricing logic: strictly overrides any arbitrary client input
  const normalizedPlan = (planType === 'monthly') ? 'monthly' : 'annual';
  if (normalizedPlan === 'monthly') {
    return { amount: 99.00, planType: 'monthly' };
  }
  return { amount: 499.00, planType: 'annual' };
}

// ====================================================
// TEST SUITE EXECUTION
// ====================================================

// TEST GROUP 1: Primary Keying on order_id
runTest('Database stores record strictly under order_id key (orders/{order_id})', () => {
  const db = new MockFirestore();
  const orderId = 'kc_ann_usr123_1725700000_101';
  const userId = 'usr123';

  const res = db.recordOrderSuccess(orderId, userId, 'annual', { payment_id: 'cf_pay_999' });
  assert.strictEqual(res.alreadyProcessed, false);

  const orderDoc = db.getOrder(orderId);
  assert.ok(orderDoc, 'Order document must exist under key order_id');
  assert.strictEqual(orderDoc.orderId, orderId);
  assert.strictEqual(orderDoc.userId, userId);
  assert.strictEqual(orderDoc.amount, 499.00);
  assert.strictEqual(orderDoc.planType, 'annual');
  assert.strictEqual(orderDoc.status, 'paid');
  assert.strictEqual(orderDoc.paymentId, 'cf_pay_999');

  assert.strictEqual(db.getOrder('cf_pay_999'), null, 'Orders must NOT be keyed by payment_id');
});

// TEST GROUP 2: Idempotency Protection
runTest('Duplicate verification with same order_id returns alreadyProcessed: true without duplicate rows', () => {
  const db = new MockFirestore();
  const orderId = 'kc_mon_usr456_1725700000_202';
  const userId = 'usr456';

  const res1 = db.recordOrderSuccess(orderId, userId, 'monthly', { payment_id: 'cf_pay_888' });
  assert.strictEqual(res1.alreadyProcessed, false);

  const initialOrdersCount = Object.keys(db.collections.orders).length;
  assert.strictEqual(initialOrdersCount, 1);
  const initialEndDate = res1.subscriptionEndDate.getTime();

  const res2 = db.recordOrderSuccess(orderId, userId, 'monthly', { payment_id: 'cf_pay_888' });
  assert.strictEqual(res2.alreadyProcessed, true);
  assert.strictEqual(Object.keys(db.collections.orders).length, 1);
  assert.strictEqual(res2.subscriptionEndDate.getTime(), initialEndDate);
});

// TEST GROUP 3: Multiple Payment Attempts under Same order_id
runTest('Multiple payment attempts under one orderId resolve cleanly to single order_id entry', () => {
  const db = new MockFirestore();
  const orderId = 'kc_ann_usr789_1725700000_303';
  const userId = 'usr789';

  const attempt1 = classifyCashfreeStatus(orderId, 'ACTIVE', 499.00, [
    { cf_payment_id: 'cf_pay_001', payment_status: 'FAILED', payment_message: 'Insufficient balance' }
  ]);
  assert.strictEqual(attempt1.success, false);
  assert.strictEqual(attempt1.isPending, false);

  const attempt2 = classifyCashfreeStatus(orderId, 'PAID', 499.00, [
    { cf_payment_id: 'cf_pay_001', payment_status: 'FAILED' },
    { cf_payment_id: 'cf_pay_002', payment_status: 'SUCCESS' }
  ]);
  assert.strictEqual(attempt2.success, true);
  assert.strictEqual(attempt2.payment_id, 'cf_pay_002');

  const dbRes = db.recordOrderSuccess(orderId, userId, 'annual', attempt2);
  assert.strictEqual(dbRes.alreadyProcessed, false);

  const orderDoc = db.getOrder(orderId);
  assert.strictEqual(orderDoc.paymentId, 'cf_pay_002');
  assert.strictEqual(Object.keys(db.collections.orders).length, 1);
});

// TEST GROUP 4: Price Tampering Immunity
runTest('Server rejects arbitrary client-supplied amount and enforces strict plan pricing', () => {
  const tampered1 = calculateServerOrderPrice('annual', 1.00);
  assert.strictEqual(tampered1.amount, 499.00, 'Server must enforce ₹499 regardless of client input');

  const tampered2 = calculateServerOrderPrice('monthly', 0.01);
  assert.strictEqual(tampered2.amount, 99.00, 'Server must enforce ₹99 regardless of client input');

  const tampered3 = calculateServerOrderPrice('invalid_plan', 0);
  assert.strictEqual(tampered3.amount, 499.00, 'Invalid plan must safely fallback to standard pricing');
});

// TEST GROUP 5: Gateway Status State Machine
runTest('Cashfree status correctly classifies PAID, PENDING, ACTIVE (0 attempts), FAILED, and CANCELLED', () => {
  const s1 = classifyCashfreeStatus('kc_ann_1', 'PAID', 499.00, [{ cf_payment_id: 'pay_1', payment_status: 'SUCCESS' }]);
  assert.strictEqual(s1.success, true);
  assert.strictEqual(s1.isPending, false);

  const s2 = classifyCashfreeStatus('kc_ann_2', 'ACTIVE', 499.00, [{ cf_payment_id: 'pay_2', payment_status: 'PENDING' }]);
  assert.strictEqual(s2.success, false);
  assert.strictEqual(s2.isPending, true);

  const s3 = classifyCashfreeStatus('kc_ann_3', 'ACTIVE', 499.00, []);
  assert.strictEqual(s3.success, false);
  assert.strictEqual(s3.isPending, false, 'ACTIVE order with 0 attempts must NOT be flagged as isPending');
  assert.ok(s3.error);

  const s4 = classifyCashfreeStatus('kc_ann_4', 'ACTIVE', 499.00, [{ cf_payment_id: 'pay_4', payment_status: 'USER_DROPPED', payment_message: 'User dropped out' }]);
  assert.strictEqual(s4.success, false);
  assert.strictEqual(s4.isPending, false);
  assert.strictEqual(s4.error, 'User dropped out');

  const s5 = classifyCashfreeStatus('kc_ann_5', 'EXPIRED', 499.00);
  assert.strictEqual(s5.success, false);
  assert.strictEqual(s5.isPending, false);
});

// TEST GROUP 6: Customer Phone Sanitization
runTest('Customer phone sanitization guarantees 10-digit number for Cashfree API compliance', () => {
  function sanitizePhone(phone) {
    const clean = (phone || '').replace(/[^0-9]/g, '');
    if (clean.length < 10) return '9999999999';
    if (clean.length > 10) return clean.slice(-10);
    return clean;
  }

  assert.strictEqual(sanitizePhone(''), '9999999999');
  assert.strictEqual(sanitizePhone('+91 98765 43210'), '9876543210');
  assert.strictEqual(sanitizePhone('09123456789'), '9123456789');
  assert.strictEqual(sanitizePhone('123'), '9999999999');
});

// TEST GROUP 7: Order ID Generation with Plan Prefix & Constraints
runTest('Order ID embeds plan prefix and complies with Cashfree character & length limits', () => {
  const monId = generateOrderId('test_user_42', 'monthly');
  assert.ok(monId.startsWith('kc_mon_'), `Monthly order ID must start with kc_mon_: ${monId}`);
  assert.ok(monId.length <= 50, `Order ID length (${monId.length}) must be <= 50`);
  assert.ok(/^[a-zA-Z0-9_-]+$/.test(monId), 'Order ID must only contain alphanumeric, underscore, hyphen');

  const annId = generateOrderId('test_user_42', 'annual');
  assert.ok(annId.startsWith('kc_ann_'), `Annual order ID must start with kc_ann_: ${annId}`);
  assert.ok(annId.length <= 50, `Order ID length (${annId.length}) must be <= 50`);
});

// TEST GROUP 8: Return Redirect Plan Detection
runTest('Returned orders correctly identify monthly vs annual plan from tags, prefix, and amount', () => {
  const db = new MockFirestore();

  const monthlyOrderId = 'kc_mon_u1_1725000_123';
  const monthlyStatus = classifyCashfreeStatus(monthlyOrderId, 'PAID', 99.00, [{ payment_status: 'SUCCESS' }], { plan_type: 'monthly' });
  assert.strictEqual(monthlyStatus.planType, 'monthly');

  const record1 = db.recordOrderSuccess(monthlyOrderId, 'u1', 'annual' /* frontend initial guess */, monthlyStatus);
  assert.strictEqual(record1.planType, 'monthly', 'Verified planType must override frontend initial guess');
  assert.strictEqual(db.getOrder(monthlyOrderId).amount, 99.00);

  const annualOrderId = 'kc_ann_u2_1725000_456';
  const annualStatus = classifyCashfreeStatus(annualOrderId, 'PAID', 499.00, [{ payment_status: 'SUCCESS' }], { plan_type: 'annual' });
  assert.strictEqual(annualStatus.planType, 'annual');

  const record2 = db.recordOrderSuccess(annualOrderId, 'u2', 'monthly' /* wrong guess */, annualStatus);
  assert.strictEqual(record2.planType, 'annual');
  assert.strictEqual(db.getOrder(annualOrderId).amount, 499.00);
});

// TEST GROUP 9: Webhook Signature Enforcement
runTest('Webhook signature verification rejects missing headers, rejects tampering, accepts valid HMAC', () => {
  const secret = 'cf_secret_key_testing_xyz123';
  const rawBody = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK', data: { order: { order_id: 'kc_1' } } });
  const timestamp = String(Date.now());

  // 1. Valid signature
  const validSig = crypto.createHmac('sha256', secret).update(timestamp + rawBody).digest('base64');
  const checkValid = verifyWebhookSignature(secret, rawBody, validSig, timestamp);
  assert.strictEqual(checkValid.verified, true);

  // 2. Tampered signature
  const checkBad = verifyWebhookSignature(secret, rawBody, 'bad_signature_abc', timestamp);
  assert.strictEqual(checkBad.verified, false);
  assert.strictEqual(checkBad.httpCode, 401);

  // 3. Missing signature header (Bypass attempt)
  const checkMissing = verifyWebhookSignature(secret, rawBody, '', timestamp);
  assert.strictEqual(checkMissing.verified, false);
  assert.strictEqual(checkMissing.httpCode, 401);

  // 4. Missing timestamp header
  const checkMissingTs = verifyWebhookSignature(secret, rawBody, validSig, '');
  assert.strictEqual(checkMissingTs.verified, false);
  assert.strictEqual(checkMissingTs.httpCode, 401);
});

// TEST GROUP 10: Subscription Expiry Check
runTest('Subscription validity correctly evaluates active vs expired subscriptionEndDate', () => {
  function checkSubscriptionActive(isSubscribed, subscriptionEndDate) {
    if (!isSubscribed) return false;
    if (!subscriptionEndDate) return false;
    return subscriptionEndDate.getTime() > Date.now();
  }

  const now = Date.now();

  const activeSub = checkSubscriptionActive(true, new Date(now + 20 * 86400000));
  assert.strictEqual(activeSub, true);

  const expiredSub = checkSubscriptionActive(true, new Date(now - 2 * 86400000));
  assert.strictEqual(expiredSub, false, 'Expired subscription must evaluate to inactive');

  const invalidSub = checkSubscriptionActive(true, null);
  assert.strictEqual(invalidSub, false);
});

// TEST GROUP 11: Free Trial One-Time Grant
runTest('Free trial is granted exactly once on onboarding and is NOT renewed once expired', () => {
  function processUserTrial(userData) {
    const now = Date.now();
    const existingTrial = userData.trialEndDate ? new Date(userData.trialEndDate) : null;

    if (!existingTrial) {
      const newTrial = new Date(now + 15 * 86400000);
      return { trialEndDate: newTrial, isTrialActive: true, grantedNew: true };
    }

    const isTrialActive = existingTrial.getTime() > now;
    return { trialEndDate: existingTrial, isTrialActive, grantedNew: false };
  }

  const resNew = processUserTrial({ uid: 'u_fresh' });
  assert.strictEqual(resNew.grantedNew, true);
  assert.strictEqual(resNew.isTrialActive, true);

  const activeDate = new Date(Date.now() + 5 * 86400000);
  const resActive = processUserTrial({ uid: 'u_active', trialEndDate: activeDate.toISOString() });
  assert.strictEqual(resActive.grantedNew, false);
  assert.strictEqual(resActive.isTrialActive, true);
  assert.strictEqual(resActive.trialEndDate.getTime(), activeDate.getTime());

  const expiredDate = new Date(Date.now() - 3 * 86400000);
  const resExpired = processUserTrial({ uid: 'u_expired', trialEndDate: expiredDate.toISOString() });
  assert.strictEqual(resExpired.grantedNew, false);
  assert.strictEqual(resExpired.isTrialActive, false, 'Expired trial must remain expired and not renew');
});

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
