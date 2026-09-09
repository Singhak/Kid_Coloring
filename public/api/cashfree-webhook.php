<?php
require_once __DIR__ . '/logger.php';
initApiLogging('cashfree-webhook.php');

header("Content-Type: application/json");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, x-webhook-signature, x-webhook-timestamp");

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logApiError("Method not allowed. Use POST.", [], 405);
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

// Load API keys securely from .env file
$envPaths = [
    __DIR__ . '/../.env',
    __DIR__ . '/.env',
    dirname(__DIR__) . '/.env'
];
$env = [];
foreach ($envPaths as $path) {
    if (file_exists($path)) {
        // Use INI_SCANNER_RAW to handle '=' inside values; suppress warnings
        $parsed = @parse_ini_file($path, false, INI_SCANNER_RAW);
        if ($parsed === false) {
            // Fallback: manual line-by-line parser for non-standard .env files
            $parsed = [];
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#') continue;
                $eqPos = strpos($line, '=');
                if ($eqPos === false) continue;
                $key = trim(substr($line, 0, $eqPos));
                $val = trim(substr($line, $eqPos + 1));
                if ($val !== '' && $val[0] !== '"' && $val[0] !== "'") {
                    $commentPos = strpos($val, ' #');
                    if ($commentPos !== false) {
                        $val = trim(substr($val, 0, $commentPos));
                    }
                }
                if (strlen($val) >= 2 &&
                    (($val[0] === '"' && $val[-1] === '"') ||
                     ($val[0] === "'" && $val[-1] === "'"))) {
                    $val = substr($val, 1, -1);
                }
                if ($key !== '') {
                    $parsed[$key] = $val;
                }
            }
        }
        if ($parsed) {
            $env = array_merge($env, $parsed);
        }
    }
}
$cashfreeSecret = $env['CASHFREE_SECRET_KEY'] ?? $_SERVER['CASHFREE_SECRET_KEY'] ?? $_SERVER['REDIRECT_CASHFREE_SECRET_KEY'] ?? (getenv('CASHFREE_SECRET_KEY') ?: null);
$rawBody = file_get_contents("php://input");
// Cashfree webhook v2026-01-01 uses 'x-webhook-signature-256'; older versions use 'x-webhook-signature'
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE_256'] ?? $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_WEBHOOK_TIMESTAMP'] ?? '';

function logWebhook($message, $data = null) {
    // Write to centralized API call log and maintain compatibility
    logApiCall("Webhook: " . $message, $data ?: []);
}

// Verify Cashfree webhook signature (if secret is configured)
// NOTE: Returns 200 even on failure to prevent Cashfree retry floods;
// signature issues are logged as warnings for investigation.
$signatureValid = true;
if (!empty($cashfreeSecret) && !empty($timestamp) && !empty($signature)) {
    $expectedSignature = base64_encode(hash_hmac('sha256', $timestamp . $rawBody, $cashfreeSecret, true));
    if (!hash_equals($expectedSignature, $signature)) {
        logApiError("WARNING: Webhook signature mismatch — possible replay or test ping", [
            "timestamp" => $timestamp
        ], 200);
        $signatureValid = false;
    }
} elseif (!empty($cashfreeSecret) && (empty($signature) || empty($timestamp))) {
    // Test ping or request without signature headers — log and continue
    logApiCall("Webhook: No signature headers — treating as test ping or unsigned event", []);
    $signatureValid = false;
}

$payload      = json_decode($rawBody, true);
$type         = $payload['type'] ?? '';
$orderData    = $payload['data']['order']   ?? [];
$paymentData  = $payload['data']['payment'] ?? [];

// Order fields
$orderId       = $orderData['order_id']       ?? null;
$orderAmount   = floatval($orderData['order_amount']   ?? 0);
$orderCurrency = $orderData['order_currency'] ?? 'INR';
$orderTags     = $orderData['order_tags']     ?? [];

// Resolve userId and planType from tags written at order-creation time
// These are set server-side so they are trusted (not user-supplied)
$tagUserId   = $orderTags['user_id']   ?? null;
$tagPlanType = $orderTags['plan_type'] ?? null;

// Payment fields
$paymentId     = $paymentData['cf_payment_id']   ?? null;
$paymentStatus = strtoupper($paymentData['payment_status'] ?? '');
$rawMethod     = $paymentData['payment_method']   ?? 'cashfree';

// Derive plan from tags → orderId prefix → amount (in that priority order)
$planType = $tagPlanType;
if (!$planType) {
    if (stripos((string)$orderId, 'mon') !== false || $orderAmount < 200) {
        $planType = 'monthly';
    } else {
        $planType = 'annual';
    }
}

if ($signatureValid && $orderId) {
    logApiCall("Webhook: Event received", [
        "type"           => $type,
        "order_id"       => $orderId,
        "payment_id"     => $paymentId,
        "payment_status" => $paymentStatus,
        "userId"         => $tagUserId,
        "plan"           => $planType,
    ]);

    // ── Firestore: Write PAID order on SUCCESS (secondary/fallback path) ─────
    // The verify endpoint is the PRIMARY write path (called by frontend after checkout).
    // This webhook is the FALLBACK that guarantees the DB is updated even if:
    //   ─ The user closes the browser before the verify call completes
    //   ─ UPI/bank authorisation completes minutes after checkout (async)
    //   ─ The verify endpoint had a transient Firestore error
    //
    // Safety properties:
    //   ─ firestoreRecordPayment() reads before writing — skips if already 'paid'
    //   ─ Both paths write identical data keyed on orderId (merge:true)
    //   ─ No double-charge risk — Cashfree bills once per order regardless
    if ($paymentStatus === 'SUCCESS' && $tagUserId) {
        try {
            require_once __DIR__ . '/firebase-helper.php';
            $sa = firebaseLoadServiceAccount($env);
            if ($sa) {
                $fbProjectId = $env['FIREBASE_PROJECT_ID'] ?? 'kidcoloro';
                $fbToken     = firebaseGetAccessToken($sa);

                $fbResult = firestoreRecordPayment(
                    projectId:     $fbProjectId,
                    orderId:       $orderId,
                    userId:        $tagUserId,
                    planType:      $planType,
                    amount:        $orderAmount,
                    currency:      $orderCurrency,
                    paymentId:     (string)$paymentId,
                    paymentMethod: normalisePaymentMethod($rawMethod),
                    source:        'webhook',   // audit: written by Cashfree webhook
                    token:         $fbToken
                );

                if ($fbResult['alreadyProcessed']) {
                    logApiCall('Firestore: Webhook — order already paid (idempotent skip)', [
                        'order_id' => $orderId,
                    ], 'INFO');
                } else {
                    logApiCall('Firestore: Webhook — paid order + user profile written', [
                        'order_id'            => $orderId,
                        'plan'                => $planType,
                        'subscriptionEndDate' => $fbResult['subscriptionEndDate'],
                    ]);
                }

                // ── Send VIP Subscription Confirmation Email (Webhook fallback) ───
                try {
                    require_once __DIR__ . '/send-subscription-email.php';
                    $custDetails   = $payload['data']['customer_details'] ?? [];
                    $customerEmail = $custDetails['customer_email'] ?? '';
                    $customerName  = $custDetails['customer_name'] ?? '';

                    if (empty($customerEmail) && $tagUserId) {
                        $uDoc = firestoreGet($fbProjectId, 'users', $tagUserId, $fbToken);
                        if ($uDoc['exists']) {
                            $customerEmail = $uDoc['data']['email'] ?? '';
                            if (empty($customerName)) {
                                $customerName = $uDoc['data']['displayName'] ?? '';
                            }
                        }
                    }

                    if (!empty($customerEmail) && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                        sendSubscriptionSuccessEmail(
                            orderId:             $orderId,
                            userId:              $tagUserId,
                            planType:            $planType,
                            amount:              $orderAmount,
                            currency:            $orderCurrency,
                            customerEmail:       $customerEmail,
                            customerName:        $customerName,
                            subscriptionEndDate: $fbResult['subscriptionEndDate'] ?? '',
                            env:                 $env
                        );
                    }
                } catch (Throwable $mailErr) {
                    logApiError('Webhook: Subscription email trigger exception: ' . $mailErr->getMessage(), [
                        'order_id' => $orderId,
                    ]);
                }
            } else {
                logApiCall(
                    'Firestore: Service account not configured — webhook write skipped. ' .
                    'Add FIREBASE_SERVICE_ACCOUNT_JSON to .env',
                    ['order_id' => $orderId],
                    'WARN'
                );
            }
        } catch (Throwable $fbErr) {
            // IMPORTANT: still return HTTP 200 so Cashfree does not flood-retry the webhook.
            // The error is logged for manual investigation if needed.
            logApiError('Firestore: Webhook write failed (non-fatal) — ' . $fbErr->getMessage(), [
                'order_id' => $orderId,
                'userId'   => $tagUserId,
            ]);
        }
    } elseif ($paymentStatus === 'SUCCESS' && !$tagUserId) {
        logApiError('Firestore: Webhook SUCCESS but userId missing from order tags — manual review needed', [
            'order_id'     => $orderId,
            'payment_id'   => $paymentId,
            'payment_status' => $paymentStatus,
        ]);
    }
    // ── End Firestore ───────────────────────────────────────────────

} else {
    logApiCall("Webhook: Received but skipped processing (invalid signature or test ping)", [
        "type"            => $type,
        "signature_valid" => $signatureValid
    ]);
}

// Return 200 OK idempotently
// All state updates in Firestore are keyed on orderId to ensure complete duplicate prevention
http_response_code(200);
echo json_encode([
    "success" => true,
    "received" => true,
    "event_type" => $type,
    "order_id" => $orderId,
    "payment_id" => $paymentId,
    "status" => $paymentStatus,
    "message" => "Webhook acknowledged idempotently."
]);
