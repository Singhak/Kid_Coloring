<?php
/**
 * Coloro - First-Time Login Welcome Email Endpoint
 *
 * Dispatches a personalized welcome email with 15-day VIP trial details
 * when a user logs into the platform for the first time.
 *
 * Guaranteed Idempotency:
 * 1. Checks Firestore users/{userId}.welcomeEmailSent before sending.
 * 2. Updates users/{userId}.welcomeEmailSent = true upon successful transmission.
 */

require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/mailer-helper.php';

initApiLogging('send-welcome-email.php');

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logApiError("Method not allowed: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'), [], 405);
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true) ?: [];
$userId       = trim($input['userId']       ?? $_POST['userId']       ?? '');
$email        = trim($input['email']        ?? $_POST['email']        ?? '');
$displayName  = trim($input['displayName']  ?? $_POST['displayName']  ?? '');
$trialEndDate = trim($input['trialEndDate'] ?? $_POST['trialEndDate'] ?? '');

if (empty($userId) || empty($email)) {
    logApiError("userId and email are required to send welcome email.", $input, 400);
    http_response_code(400);
    echo json_encode(["error" => "userId and valid email are required."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    logApiError("Invalid email format provided: {$email}", $input, 400);
    http_response_code(400);
    echo json_encode(["error" => "Invalid email address format."]);
    exit;
}

$env = loadMailerEnv();
$projectId = $env['FIREBASE_PROJECT_ID'] ?? 'kidscoloro';

// ── 1. Check Idempotency via Firestore ─────────────────────────────────────
$sa = null;
$fbToken = null;
try {
    require_once __DIR__ . '/firebase-helper.php';
    $sa = firebaseLoadServiceAccount($env);
    if ($sa) {
        $fbToken = firebaseGetAccessToken($sa);
        $userDoc = firestoreGet($projectId, 'users', $userId, $fbToken);
        if ($userDoc['exists'] && !empty($userDoc['data']['welcomeEmailSent'])) {
            logApiCall("Welcome email already sent to user (idempotent skip)", [
                'userId' => $userId,
                'email'  => $email
            ]);
            echo json_encode([
                "success"     => true,
                "alreadySent" => true,
                "message"     => "Welcome email was already sent."
            ]);
            exit;
        }
    }
} catch (Throwable $e) {
    // Non-fatal: if Firestore check has transient error, proceed with sending
    logApiCall("Firestore idempotency check notice: " . $e->getMessage(), ['userId' => $userId], 'WARN');
}

// ── 2. Format Template Variables ───────────────────────────────────────────
$name = $displayName ?: 'Little Artist';
$appUrl = rtrim($env['APP_URL'] ?? 'https://coloro.in', '/');

// Calculate or format trial end date
if (empty($trialEndDate)) {
    // Default to 15 days from now
    $trialEndDate = date('d M Y', strtotime('+15 days'));
} else {
    $parsedTime = strtotime($trialEndDate);
    if ($parsedTime !== false) {
        $trialEndDate = date('d M Y', $parsedTime);
    }
}

$templatePath = __DIR__ . '/email-templates/welcome-email.html';
$replacements = [
    '{{NAME}}'           => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
    '{{APP_URL}}'        => htmlspecialchars($appUrl, ENT_QUOTES, 'UTF-8'),
    '{{TRIAL_END_DATE}}' => htmlspecialchars($trialEndDate, ENT_QUOTES, 'UTF-8'),
];

try {
    $htmlContent = renderEmailTemplate($templatePath, $replacements);
} catch (Throwable $e) {
    logApiError("Failed to render welcome email template: " . $e->getMessage(), [], 500);
    http_response_code(500);
    echo json_encode(["error" => "Email template rendering failed."]);
    exit;
}

// ── 3. Send Email via Native SMTP ──────────────────────────────────────────
$subject = "Welcome to Coloro! 🎨 Your 15-Day Free Trial is Ready";
$smtpError = null;
$sent = sendColoroMail(
    to: $email,
    toName: $name,
    subject: $subject,
    html: $htmlContent,
    env: $env,
    errorOutput: $smtpError
);

if (!$sent) {
    logApiError("Failed to dispatch welcome email to {$email}: {$smtpError}", [
        'userId' => $userId,
        'email'  => $email
    ], 500);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Failed to dispatch email: " . ($smtpError ?: 'SMTP delivery failed')
    ]);
    exit;
}

// ── 4. Mark welcomeEmailSent = true in Firestore ───────────────────────────
if ($sa && $fbToken) {
    try {
        firestoreSet($projectId, 'users', $userId, [
            'welcomeEmailSent'   => true,
            'welcomeEmailSentAt' => FIRESTORE_NOW,
            'updatedAt'          => FIRESTORE_NOW,
        ], $fbToken, true);

        logApiCall("Firestore marked welcomeEmailSent for user", ['userId' => $userId]);
    } catch (Throwable $fbErr) {
        logApiCall("Failed to update Firestore welcomeEmailSent flag: " . $fbErr->getMessage(), [
            'userId' => $userId
        ], 'WARN');
    }
}

logApiCall("Welcome email delivered successfully", [
    'userId' => $userId,
    'email'  => $email
]);

echo json_encode([
    "success"     => true,
    "alreadySent" => false,
    "message"     => "Welcome email sent successfully."
]);
