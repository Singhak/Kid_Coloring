<?php
require_once __DIR__ . '/logger.php';
initApiLogging('create-cashfree-order.php');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-version");

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logApiError("Method not allowed. Received: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'), [], 405);
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
                // Skip comments
                if ($line === '' || $line[0] === '#') continue;
                // Split on first '=' only
                $eqPos = strpos($line, '=');
                if ($eqPos === false) continue;
                $key = trim(substr($line, 0, $eqPos));
                $val = trim(substr($line, $eqPos + 1));
                // Strip inline comments (not inside quotes)
                if ($val !== '' && $val[0] !== '"' && $val[0] !== "'") {
                    $commentPos = strpos($val, ' #');
                    if ($commentPos !== false) {
                        $val = trim(substr($val, 0, $commentPos));
                    }
                }
                // Remove surrounding quotes
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
$userId = $input["userId"] ?? null;
$rawPlan = strtolower(trim($input["planType"] ?? 'annual'));
$planType = ($rawPlan === 'monthly') ? 'monthly' : 'annual';
$customerEmail = $input["customerEmail"] ?? 'parent@coloro.com';
$customerName = $input["customerName"] ?? 'Coloro Parent';
$customerPhone = $input["customerPhone"] ?? '9876543210';

if (!$userId) {
    logApiError("User ID is required to create a payment order.", $input, 400);
    http_response_code(400);
    echo json_encode(["error" => "User ID is required to create a payment order."]);
    exit;
}

// Authoritative server-side pricing logic: Annual = ₹499, Monthly = ₹99
// Client-supplied amount is strictly ignored to eliminate price-tampering vulnerabilities
if ($planType === 'monthly') {
    $amount = 99.00;
    $orderNote = "Coloro VIP Magic Pass - Monthly (1 Month)";
    $planPrefix = "mon_";
} else {
    $amount = 499.00;
    $orderNote = "Coloro VIP Magic Pass - Annual (1 Year + 15 Day Trial)";
    $planPrefix = "ann_";
}

// Generate unique, deterministic orderId keyed with plan prefix, userId and timestamp
$sanitizedUserId = preg_replace('/[^a-zA-Z0-9]/', '', $userId);
$shortUid = substr($sanitizedUserId, 0, 10);
$orderId = "kc_" . $planPrefix . ($shortUid ? $shortUid . "_" : "") . time() . "_" . mt_rand(100, 999);

// Sanitize customerId (max 50 alphanumeric, underscores, hyphens)
$customerId = substr(preg_replace('/[^a-zA-Z0-9_-]/', '', $userId), 0, 45) ?: ('guest_' . time());

// Ensure valid 10-digit phone number
$cleanPhone = preg_replace('/[^0-9]/', '', $customerPhone);
if (strlen($cleanPhone) < 10) {
    $cleanPhone = "9999999999";
} else if (strlen($cleanPhone) > 10) {
    $cleanPhone = substr($cleanPhone, -10);
}

// Return URL configuration: handles redirect return on mobile / UPI apps with concrete orderId
$origin = !empty($_SERVER['HTTP_ORIGIN']) ? rtrim($_SERVER['HTTP_ORIGIN'], '/') : 'https://coloro.in';
$returnUrl = $origin . '/?order_id=' . $orderId;

// Notify URL configuration: Always point to a public HTTPS endpoint so Cashfree API does not reject localhost
$host = !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$isLocal = in_array(strtolower(explode(':', $host)[0]), ['localhost', '127.0.0.1', '::1', '']);
$notifyUrl = (!$isLocal && $host)
    ? 'https://' . $host . '/api/cashfree-webhook.php'
    : 'https://coloro.in/api/cashfree-webhook.php';

$orderPayload = [
    "order_id" => $orderId,
    "order_amount" => $amount,
    "order_currency" => "INR",
    "customer_details" => [
        "customer_id" => $customerId,
        "customer_email" => filter_var($customerEmail, FILTER_VALIDATE_EMAIL) ? $customerEmail : "parent@coloro.com",
        "customer_phone" => $cleanPhone,
        "customer_name" => substr(trim($customerName), 0, 60) ?: "Coloro Parent"
    ],
    "order_meta" => [
        "return_url" => $returnUrl,
        "notify_url" => $notifyUrl
    ],
    "order_note" => $orderNote,
    "order_tags" => [
        "user_id" => substr($userId, 0, 40),
        "plan_type" => $planType,
        "app" => "Coloro"
    ]
];

$ch = curl_init($baseUrl . "/orders");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-version: 2023-08-01",
    "x-client-id: " . $cashfreeAppId,
    "x-client-secret: " . $cashfreeSecret
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderPayload));
curl_setopt($ch, CURLOPT_TIMEOUT, 25);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    logApiError("Curl request to Cashfree failed: " . $curlError, [
        "order_id" => $orderId,
        "userId" => $userId
    ], 500);
    http_response_code(500);
    echo json_encode(["error" => "Curl request failed: " . $curlError]);
    exit;
}

$result = json_decode($response, true);

if ($httpCode >= 400 || empty($result['payment_session_id'])) {
    $errMsg = $result["message"] ?? $result["error"] ?? "Failed to create Cashfree order.";
    logApiError("Cashfree order creation rejected (HTTP $httpCode): " . $errMsg, [
        "order_id" => $orderId,
        "userId" => $userId,
        "details" => $result
    ], $httpCode ?: 500);
    http_response_code($httpCode ?: 500);
    echo json_encode([
        "error" => $errMsg,
        "details" => $result
    ]);
    exit;
}

logApiCall("Cashfree order created successfully", [
    "order_id" => $result["order_id"],
    "plan" => $planType,
    "amount" => $amount,
    "userId" => $userId
]);

echo json_encode([
    "success" => true,
    "order_id" => $result["order_id"],
    "payment_session_id" => $result["payment_session_id"],
    "order_status" => $result["order_status"] ?? "ACTIVE",
    "order_amount" => $result["order_amount"] ?? $amount,
    "order_currency" => $result["order_currency"] ?? "INR",
    "planType" => $planType,
    "environment" => $cashfreeEnv
]);
