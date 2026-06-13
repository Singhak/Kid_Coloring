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
$razorpay_order_id = $input["razorpay_order_id"] ?? null;
$razorpay_payment_id = $input["razorpay_payment_id"] ?? null;
$razorpay_signature = $input["razorpay_signature"] ?? null;
$userId = $input["userId"] ?? null;

if (!$razorpay_order_id || !$razorpay_payment_id || !$razorpay_signature || !$userId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing payment details or user ID."]);
    exit;
}

// Verify the payment signature
$generated_signature = hash_hmac('sha256', $razorpay_order_id . '|' . $razorpay_payment_id, $razorpayKeySecret);

if ($generated_signature === $razorpay_signature) {
    // Payment is successful and verified
    // In a real application, you would now update the user's subscription status in your database.
    // For this example, we'll return success and assume the frontend's Firestore listener will handle the state update.
    //
    // IMPORTANT: For production, it is HIGHLY RECOMMENDED to use Firebase Cloud Functions
    // with the Firebase Admin SDK to securely update Firestore, rather than attempting
    // direct Firestore updates from PHP with a service account key exposed on a web server.
    //
    // Example (conceptual, requires Firebase Admin SDK for PHP setup):
    // require __DIR__ . '/vendor/autoload.php';
    // use Google\Cloud\Firestore\FirestoreClient;
    // $firestore = new FirestoreClient([
    //     'projectId' => 'your-firebase-project-id',
    //     'keyFilePath' => '/path/to/your/serviceAccountKey.json'
    // ]);
    // $userRef = $firestore->collection('users')->document($userId);
    // $userRef->update([
    //     ['path' => 'isSubscribed', 'value' => true],
    //     ['path' => 'subscriptionStartDate', 'value' => new \Google\Cloud\Core\Timestamp(new \DateTime())]
    // ]);

    echo json_encode(["success" => true, "message" => "Payment verified and subscription activated."]);

} else {
    http_response_code(400);
    echo json_encode(["error" => "Payment verification failed: Signature mismatch."]);
}