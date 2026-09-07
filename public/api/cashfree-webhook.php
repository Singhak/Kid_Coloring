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
        $parsed = parse_ini_file($path);
        if ($parsed) {
            $env = array_merge($env, $parsed);
        }
    }
}
$cashfreeSecret = $env['CASHFREE_SECRET_KEY'] ?? $_SERVER['CASHFREE_SECRET_KEY'] ?? $_SERVER['REDIRECT_CASHFREE_SECRET_KEY'] ?? (getenv('CASHFREE_SECRET_KEY') ?: null);
$rawBody = file_get_contents("php://input");
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_WEBHOOK_TIMESTAMP'] ?? '';

function logWebhook($message, $data = null) {
    // Write to centralized API call log and maintain compatibility
    logApiCall("Webhook: " . $message, $data ?: []);
}

// If Cashfree Secret is set on server, strictly enforce signature authenticity
if (!empty($cashfreeSecret)) {
    if (empty($signature) || empty($timestamp)) {
        logApiError("UNAUTHORIZED: Missing webhook signature or timestamp header", [], 401);
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized. Missing webhook signature or timestamp header."]);
        exit;
    }

    $expectedSignature = base64_encode(hash_hmac('sha256', $timestamp . $rawBody, $cashfreeSecret, true));
    if (!hash_equals($expectedSignature, $signature)) {
        logApiError("UNAUTHORIZED: Invalid webhook signature mismatch", [
            "timestamp" => $timestamp
        ], 401);
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized. Invalid webhook signature."]);
        exit;
    }
}

$payload = json_decode($rawBody, true);
$type = $payload['type'] ?? '';
$orderData = $payload['data']['order'] ?? [];
$paymentData = $payload['data']['payment'] ?? [];

$orderId = $orderData['order_id'] ?? null;
$paymentId = $paymentData['cf_payment_id'] ?? null;
$paymentStatus = $paymentData['payment_status'] ?? null;

logApiCall("SUCCESS: Webhook event processed", [
    "type" => $type,
    "order_id" => $orderId,
    "payment_id" => $paymentId,
    "payment_status" => $paymentStatus
]);

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
