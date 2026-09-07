<?php
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
    http_response_code(500);
    echo json_encode(["error" => "Razorpay API keys are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .htaccess or .env."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];
$userId = $input["userId"] ?? null;
$rawPlan = strtolower(trim($input["planType"] ?? 'annual'));
$planType = ($rawPlan === 'monthly') ? 'monthly' : 'annual';

if (!$userId) {
    http_response_code(400);
    echo json_encode(["error" => "User ID is required."]);
    exit;
}

// Authoritative server-side pricing in paise (INR smallest currency unit):
// Monthly = ₹99 (9900 paise), Annual = ₹499 (49900 paise)
// Client-supplied amount is strictly ignored to eliminate price-tampering vulnerabilities
$amount = ($planType === 'monthly') ? 9900 : 49900;
$currency = 'INR';
$receipt = "kc_rzp_" . ($planType === 'monthly' ? 'mon_' : 'ann_') . time() . "_" . mt_rand(100, 999);

// Razorpay API endpoint for creating orders
$url = "https://api.razorpay.com/v1/orders";

$data = [
    "amount" => $amount,
    "currency" => $currency,
    "receipt" => $receipt,
    "notes" => [
        "user_id" => $userId,
        "plan_type" => $planType,
        "app" => "Coloro"
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_USERPWD, $razorpayKeyId . ":" . $razorpayKeySecret); // Basic Auth
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(["error" => $result["error"]["description"] ?? "Failed to create Razorpay order."]);
    exit;
}

echo json_encode($result);