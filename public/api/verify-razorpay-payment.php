<?php
require_once __DIR__ . '/logger.php';
initApiLogging('verify-razorpay-payment.php');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Adjust for production security
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logApiError("Method not allowed. Use POST.", [], 405);
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Load API keys securely from .env file
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $env = parse_ini_file($envPath);
} else {
    $env = [];
}

$razorpayKeyId = $env['RAZORPAY_KEY_ID'] ?? $_SERVER['RAZORPAY_KEY_ID'] ?? $_SERVER['REDIRECT_RAZORPAY_KEY_ID'] ?? (getenv('RAZORPAY_KEY_ID') ?: null);
$razorpayKeySecret = $env['RAZORPAY_KEY_SECRET'] ?? $_SERVER['RAZORPAY_KEY_SECRET'] ?? $_SERVER['REDIRECT_RAZORPAY_KEY_SECRET'] ?? (getenv('RAZORPAY_KEY_SECRET') ?: null);

if (!$razorpayKeyId || !$razorpayKeySecret) {
    logApiError("Razorpay API keys are not configured on the server", [], 500);
    http_response_code(500);
    echo json_encode(["error" => "Razorpay API keys are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .htaccess or .env."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$razorpay_order_id = $input["razorpay_order_id"] ?? null;
$razorpay_payment_id = $input["razorpay_payment_id"] ?? null;
$razorpay_signature = $input["razorpay_signature"] ?? null;
$userId = $input["userId"] ?? null;

if (!$razorpay_order_id || !$razorpay_payment_id || !$razorpay_signature || !$userId) {
    logApiError("Missing payment details or user ID for Razorpay verification.", $input, 400);
    http_response_code(400);
    echo json_encode(["error" => "Missing payment details or user ID."]);
    exit;
}

// Verify the payment signature
$generated_signature = hash_hmac('sha256', $razorpay_order_id . '|' . $razorpay_payment_id, $razorpayKeySecret);

if ($generated_signature === $razorpay_signature) {
    logApiCall("Razorpay payment verified successfully", [
        "razorpay_order_id" => $razorpay_order_id,
        "razorpay_payment_id" => $razorpay_payment_id,
        "userId" => $userId
    ]);

    echo json_encode(["success" => true, "message" => "Payment verified and subscription activated."]);
} else {
    logApiError("Razorpay signature mismatch for order: $razorpay_order_id", [
        "razorpay_order_id" => $razorpay_order_id,
        "razorpay_payment_id" => $razorpay_payment_id,
        "userId" => $userId
    ], 400);
    http_response_code(400);
    echo json_encode(["error" => "Payment verification failed: Signature mismatch."]);
}