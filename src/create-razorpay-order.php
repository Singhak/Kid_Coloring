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

$razorpayKeyId = $env['RAZORPAY_KEY_ID'] ?? getenv('RAZORPAY_KEY_ID');
$razorpayKeySecret = $env['RAZORPAY_KEY_SECRET'] ?? getenv('RAZORPAY_KEY_SECRET');

if (!$razorpayKeyId || !$razorpayKeySecret) {
    http_response_code(500);
    echo json_encode(["error" => "Razorpay API keys are not configured on the server."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$userId = $input["userId"] ?? null;
$amount = $input["amount"] ?? null; // Amount in smallest currency unit (e.g., 999 for INR 9.99)
$currency = $input["currency"] ?? 'INR';
$receipt = $input["receipt"] ?? "receipt_" . uniqid();

if (!$userId || !$amount) {
    http_response_code(400);
    echo json_encode(["error" => "User ID and amount are required."]);
    exit;
}

// Razorpay API endpoint for creating orders
$url = "https://api.razorpay.com/v1/orders";

$data = [
    "amount" => $amount,
    "currency" => $currency,
    "receipt" => $receipt,
    "notes" => [
        "user_id" => $userId,
        "subscription_type" => "monthly_pro"
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