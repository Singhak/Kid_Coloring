<?php
require_once __DIR__ . '/logger.php';
initApiLogging('verify-cashfree-payment.php');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-version");

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

$cashfreeAppId = $env['CASHFREE_APP_ID'] ?? $_SERVER['CASHFREE_APP_ID'] ?? $_SERVER['REDIRECT_CASHFREE_APP_ID'] ?? (getenv('CASHFREE_APP_ID') ?: null);
$cashfreeSecret = $env['CASHFREE_SECRET_KEY'] ?? $_SERVER['CASHFREE_SECRET_KEY'] ?? $_SERVER['REDIRECT_CASHFREE_SECRET_KEY'] ?? (getenv('CASHFREE_SECRET_KEY') ?: null);
$cashfreeEnv = strtolower($env['CASHFREE_ENV'] ?? $_SERVER['CASHFREE_ENV'] ?? $_SERVER['REDIRECT_CASHFREE_ENV'] ?? (getenv('CASHFREE_ENV') ?: 'sandbox'));

if (!$cashfreeAppId || !$cashfreeSecret) {
    logApiError("Cashfree API credentials are not configured on the server", [], 500);
    http_response_code(500);
    echo json_encode([
        "error" => "Cashfree API credentials are not configured on the server. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .htaccess or .env."
    ]);
    exit;
}

$baseUrl = ($cashfreeEnv === 'production' || $cashfreeEnv === 'prod')
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

$input = json_decode(file_get_contents("php://input"), true) ?: [];
$orderId = trim($input["order_id"] ?? $_GET["order_id"] ?? '');
$userId = trim($input["userId"] ?? $_GET["userId"] ?? '');

if (!$orderId) {
    logApiError("order_id is required for verification.", $input, 400);
    http_response_code(400);
    echo json_encode(["error" => "order_id is required for verification."]);
    exit;
}

// Helper to make authenticated GET requests to Cashfree PG API with robust error handling
function callCashfreeGet($url, $appId, $secret) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "x-api-version: 2023-08-01",
        "x-client-id: " . $appId,
        "x-client-secret: " . $secret
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    $res = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        return ['httpCode' => 504, 'data' => ['message' => 'Gateway request timed out or failed: ' . $err]];
    }

    return ['httpCode' => $http, 'data' => json_decode($res, true) ?: []];
}

// 1. Fetch Order Status
$orderRes = callCashfreeGet($baseUrl . "/orders/" . urlencode($orderId), $cashfreeAppId, $cashfreeSecret);

if ($orderRes['httpCode'] !== 200 || empty($orderRes['data'])) {
    $err = $orderRes['data']['message'] ?? "Order not found on Cashfree.";
    logApiError("Cashfree order verification fetch failed for $orderId: " . $err, [
        "order_id" => $orderId,
        "http_code" => $orderRes['httpCode']
    ], $orderRes['httpCode'] >= 400 ? $orderRes['httpCode'] : 404);
    http_response_code($orderRes['httpCode'] >= 400 ? $orderRes['httpCode'] : 404);
    echo json_encode([
        "error" => $err,
        "order_id" => $orderId
    ]);
    exit;
}

$orderData = $orderRes['data'];
$orderStatus = strtoupper($orderData['order_status'] ?? '');
$orderAmount = floatval($orderData['order_amount'] ?? 0);
$orderCurrency = $orderData['order_currency'] ?? 'INR';
$orderTags = $orderData['order_tags'] ?? [];

// Determine authoritative plan type from tags, order ID prefix, or amount
$planType = $orderTags['plan_type'] ?? null;
if (!$planType) {
    if (stripos($orderId, 'mon') !== false || $orderAmount < 200) {
        $planType = 'monthly';
    } else {
        $planType = 'annual';
    }
}

// Optional security check: if userId was provided, ensure it matches order tags if present
if (!empty($userId) && !empty($orderTags['user_id'])) {
    if ($userId !== $orderTags['user_id']) {
        http_response_code(403);
        echo json_encode([
            "error" => "User ID does not match order ownership.",
            "order_id" => $orderId
        ]);
        exit;
    }
}

// 2. Fetch Payment Attempts for Order
$paymentsRes = callCashfreeGet($baseUrl . "/orders/" . urlencode($orderId) . "/payments", $cashfreeAppId, $cashfreeSecret);
$payments = is_array($paymentsRes['data']) ? $paymentsRes['data'] : [];

$successfulPayment = null;
$pendingPayment = null;
$lastFailedPayment = null;

foreach ($payments as $payment) {
    $status = strtoupper($payment['payment_status'] ?? '');
    if ($status === 'SUCCESS') {
        $successfulPayment = $payment;
        break;
    } elseif ($status === 'PENDING') {
        $pendingPayment = $payment;
    } elseif (in_array($status, ['FAILED', 'CANCELLED', 'USER_DROPPED'])) {
        $lastFailedPayment = $payment;
    }
}

// Helper to normalize payment method (which may be a string or map object)
function extractMethodString($rawMethod) {
    if (is_string($rawMethod) && !empty($rawMethod)) return $rawMethod;
    if (is_array($rawMethod) && !empty($rawMethod)) return key($rawMethod);
    return 'cashfree';
}

// 3. Classify State Idempotently
if ($orderStatus === 'PAID' || $successfulPayment !== null) {
    $paymentId = $successfulPayment['cf_payment_id'] ?? ($orderId . "_cf");
    $rawMethod = $successfulPayment['payment_method'] ?? 'cashfree';
    $methodStr = extractMethodString($rawMethod);

    // Resolve userId: prefer explicitly-passed userId, fall back to order tags
    // (tags are set server-side at order creation so they're trusted)
    $effectiveUserId = $userId ?: ($orderTags['user_id'] ?? '');

    logApiCall("Cashfree payment verified (PAID)", [
        "order_id"   => $orderId,
        "payment_id" => (string)$paymentId,
        "amount"     => $orderAmount,
        "plan"       => $planType,
        "method"     => $methodStr,
        "userId"     => $effectiveUserId,
    ]);

    // ── Firestore: Idempotently write PAID order + user profile ──────────────
    // This is the PRIMARY write path (called by frontend after checkout).
    // The webhook in cashfree-webhook.php acts as a secondary fallback.
    // Both use firestoreRecordPayment() which:
    //   ─ reads the order first
    //   ─ skips the write if status is already 'paid' (idempotency)
    //   ─ writes merge:true so concurrent webhook + verify writes are safe
    $firestoreResult = null;
    try {
        require_once __DIR__ . '/firebase-helper.php';
        $sa = firebaseLoadServiceAccount($env);
        if ($sa && $effectiveUserId) {
            $fbProjectId = $env['FIREBASE_PROJECT_ID'] ?? 'kidcoloro';
            $fbToken     = firebaseGetAccessToken($sa);

            $firestoreResult = firestoreRecordPayment(
                projectId:     $fbProjectId,
                orderId:       $orderId,
                userId:        $effectiveUserId,
                planType:      $planType,
                amount:        $orderAmount,
                currency:      $orderCurrency,
                paymentId:     (string)$paymentId,
                paymentMethod: normalisePaymentMethod($rawMethod),
                source:        'verify',          // audit: written by verify endpoint
                token:         $fbToken
            );

            if ($firestoreResult['alreadyProcessed']) {
                logApiCall('Firestore: Order already paid (idempotent skip)', [
                    'order_id' => $orderId,
                ], 'INFO');
            } else {
                logApiCall('Firestore: Paid order + user profile written', [
                    'order_id'            => $orderId,
                    'plan'                => $planType,
                    'subscriptionEndDate' => $firestoreResult['subscriptionEndDate'],
                ]);
            }

            // ── Send VIP Subscription Confirmation Email ──────────────────────────
            try {
                require_once __DIR__ . '/send-subscription-email.php';
                $customerEmail = $input['customerEmail'] ?? $input['email'] ?? ($orderData['customer_details']['customer_email'] ?? '');
                $customerName  = $input['customerName']  ?? $input['displayName'] ?? ($orderData['customer_details']['customer_name'] ?? '');

                // If email missing from order payload, fallback to user document in Firestore
                if (empty($customerEmail) && $effectiveUserId) {
                    $uDoc = firestoreGet($fbProjectId, 'users', $effectiveUserId, $fbToken);
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
                        userId:              $effectiveUserId,
                        planType:            $planType,
                        amount:              $orderAmount,
                        currency:            $orderCurrency,
                        customerEmail:       $customerEmail,
                        customerName:        $customerName,
                        subscriptionEndDate: $firestoreResult['subscriptionEndDate'] ?? '',
                        env:                 $env
                    );
                }
            } catch (Throwable $mailErr) {
                logApiError('Subscription email trigger exception: ' . $mailErr->getMessage(), [
                    'order_id' => $orderId,
                ]);
            }
        } elseif (!$effectiveUserId) {
            logApiError('Firestore: Cannot write paid order — userId missing from request and order tags', [
                'order_id' => $orderId,
            ]);
        } else {
            logApiCall(
                'Firestore: Service account not configured — paid order NOT written to DB. ' .
                'Add FIREBASE_SERVICE_ACCOUNT_JSON to .env',
                ['order_id' => $orderId],
                'WARN'
            );
        }
    } catch (Throwable $fbErr) {
        // Log Firestore errors but always return payment success to the user.
        // The webhook fallback will retry the DB write independently.
        logApiError('Firestore: Failed to write paid order — ' . $fbErr->getMessage(), [
            'order_id' => $orderId,
            'userId'   => $effectiveUserId,
        ]);
    }
    // ── End Firestore ─────────────────────────────────────────────────

    echo json_encode([
        "success"          => true,
        "isPending"        => false,
        "order_id"         => $orderId,
        "payment_id"       => (string)$paymentId,
        "order_status"     => "PAID",
        "payment_status"   => "SUCCESS",
        "amount"           => $orderAmount,
        "currency"         => $orderCurrency,
        "planType"         => $planType,
        "payment_method"   => $methodStr,
        "tags"             => $orderTags,
        // alreadyProcessed: true means DB write was skipped (duplicate call), subscription is active
        "alreadyProcessed" => $firestoreResult['alreadyProcessed'] ?? false,
        "message"          => "Payment verified successfully."
    ]);
    exit;
}

if ($orderStatus === 'ACTIVE') {
    // True pending: bank authorization is in-flight (UPI collect, etc.)
    if ($pendingPayment !== null) {
        echo json_encode([
            "success" => false,
            "isPending" => true,
            "order_id" => $orderId,
            "order_status" => "ACTIVE",
            "planType" => $planType,
            "message" => "Payment is pending authorization in your UPI / Bank app."
        ]);
        exit;
    }

    // Explicitly failed payment attempt
    if ($lastFailedPayment !== null) {
        $msg = $lastFailedPayment['payment_message'] ?? "Payment was declined or cancelled by user.";
        echo json_encode([
            "success" => false,
            "isPending" => false,
            "order_id" => $orderId,
            "order_status" => "ACTIVE",
            "planType" => $planType,
            "payment_status" => $lastFailedPayment['payment_status'] ?? 'FAILED',
            "error" => $msg
        ]);
        exit;
    }

    // Order created but no payment attempt registered yet (e.g. checkout modal closed without paying)
    // Return isPending: false so frontend does NOT trigger a false 45-second polling loop!
    echo json_encode([
        "success" => false,
        "isPending" => false,
        "order_id" => $orderId,
        "order_status" => "ACTIVE",
        "planType" => $planType,
        "error" => "No payment attempt was completed."
    ]);
    exit;
}

// Expired or other terminal status
$reason = $orderData['order_status'] ?? 'CANCELLED';
echo json_encode([
    "success" => false,
    "isPending" => false,
    "order_id" => $orderId,
    "order_status" => $reason,
    "planType" => $planType,
    "error" => "Order is in terminal status: " . $reason
]);
