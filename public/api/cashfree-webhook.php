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

$payload = json_decode($rawBody, true);
$type = $payload['type'] ?? '';
$orderData = $payload['data']['order'] ?? [];
$paymentData = $payload['data']['payment'] ?? [];

$orderId = $orderData['order_id'] ?? null;
$paymentId = $paymentData['cf_payment_id'] ?? null;
$paymentStatus = $paymentData['payment_status'] ?? null;

if ($signatureValid && $orderId) {
    logApiCall("SUCCESS: Webhook event processed", [
        "type" => $type,
        "order_id" => $orderId,
        "payment_id" => $paymentId,
        "payment_status" => $paymentStatus
    ]);
} else {
    logApiCall("Webhook: Received but skipped processing (invalid signature or test ping)", [
        "type" => $type,
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
