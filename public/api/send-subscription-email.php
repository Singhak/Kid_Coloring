<?php
/**
 * Coloro - Subscription Confirmation Email Helper & Endpoint
 *
 * Dispatches a celebratory VIP subscription email with payment receipt and
 * membership details when a user purchases or activates a plan.
 *
 * Can be called:
 * 1. Directly in PHP via sendSubscriptionSuccessEmail(...) from verify or webhook.
 * 2. Via HTTP POST to /api/send-subscription-email.php.
 */

require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/mailer-helper.php';

/**
 * Dispatches the VIP subscription confirmation email.
 *
 * @param string      $orderId
 * @param string      $userId
 * @param string      $planType
 * @param float       $amount
 * @param string      $currency
 * @param string      $customerEmail
 * @param string      $customerName
 * @param string      $subscriptionEndDate
 * @param array|null  $env
 * @return array{success: bool, alreadySent: bool, message?: string, error?: string}
 */
function sendSubscriptionSuccessEmail(
    string $orderId,
    string $userId,
    string $planType,
    float $amount,
    string $currency,
    string $customerEmail,
    string $customerName = '',
    string $subscriptionEndDate = '',
    ?array $env = null
): array {
    if (!$env) {
        $env = loadMailerEnv();
    }

    $cleanEmail = trim($customerEmail);
    if (!filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'alreadySent' => false, 'error' => "Invalid customer email: {$customerEmail}"];
    }

    $projectId = $env['FIREBASE_PROJECT_ID'] ?? 'kidscoloro';

    // ── 1. Idempotency Check in Firestore ──────────────────────────────────
    $sa = null;
    $fbToken = null;
    try {
        require_once __DIR__ . '/firebase-helper.php';
        $sa = firebaseLoadServiceAccount($env);
        if ($sa && $orderId) {
            $fbToken = firebaseGetAccessToken($sa);
            $orderDoc = firestoreGet($projectId, 'orders', $orderId, $fbToken);
            if ($orderDoc['exists'] && !empty($orderDoc['data']['subscriptionEmailSent'])) {
                logApiCall("Subscription email already sent for order (idempotent skip)", [
                    'orderId' => $orderId,
                    'email'   => $cleanEmail,
                ]);
                return [
                    'success'     => true,
                    'alreadySent' => true,
                    'message'     => 'Subscription confirmation email already sent.'
                ];
            }
        }
    } catch (Throwable $e) {
        logApiCall("Subscription email Firestore check warning: " . $e->getMessage(), ['orderId' => $orderId], 'WARN');
    }

    // ── 2. Format Template Variables ───────────────────────────────────────
    $name = trim($customerName) ?: 'VIP Artist';
    $appUrl = rtrim($env['APP_URL'] ?? 'https://coloro.in', '/');
    $planTitle = ($planType === 'monthly') ? 'VIP Monthly Pass' : 'VIP Annual Magic Pass';

    $formattedExpiry = '';
    if (!empty($subscriptionEndDate)) {
        $parsed = strtotime($subscriptionEndDate);
        if ($parsed !== false) {
            $formattedExpiry = date('d M Y', $parsed);
        }
    }
    if (empty($formattedExpiry)) {
        $offset = ($planType === 'monthly') ? '+30 days' : '+365 days';
        $formattedExpiry = date('d M Y', strtotime($offset));
    }

    $formattedAmount = number_format($amount > 0 ? $amount : ($planType === 'monthly' ? 99 : 499), 2);

    $templatePath = __DIR__ . '/email-templates/subscription-success.html';
    $replacements = [
        '{{NAME}}'        => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        '{{PLAN_NAME}}'   => htmlspecialchars($planTitle, ENT_QUOTES, 'UTF-8'),
        '{{ORDER_ID}}'    => htmlspecialchars($orderId, ENT_QUOTES, 'UTF-8'),
        '{{VALID_UNTIL}}' => htmlspecialchars($formattedExpiry, ENT_QUOTES, 'UTF-8'),
        '{{AMOUNT}}'      => htmlspecialchars($formattedAmount, ENT_QUOTES, 'UTF-8'),
        '{{APP_URL}}'     => htmlspecialchars($appUrl, ENT_QUOTES, 'UTF-8'),
    ];

    try {
        $htmlContent = renderEmailTemplate($templatePath, $replacements);
    } catch (Throwable $e) {
        $err = "Failed to render subscription template: " . $e->getMessage();
        logApiError($err, ['orderId' => $orderId]);
        return ['success' => false, 'alreadySent' => false, 'error' => $err];
    }

    // ── 3. Send Email ──────────────────────────────────────────────────────
    $subject = "Welcome to Coloro VIP! 👑 Your Subscription is Active";
    $smtpErr = null;
    $sent = sendColoroMail(
        to: $cleanEmail,
        toName: $name,
        subject: $subject,
        html: $htmlContent,
        env: $env,
        errorOutput: $smtpErr
    );

    if (!$sent) {
        $err = "Failed to dispatch subscription email: " . ($smtpErr ?: 'Unknown error');
        logApiError($err, ['orderId' => $orderId, 'email' => $cleanEmail]);
        return ['success' => false, 'alreadySent' => false, 'error' => $err];
    }

    // ── 4. Record subscriptionEmailSent in Firestore ───────────────────────
    if ($sa && $fbToken && $orderId) {
        try {
            firestoreSet($projectId, 'orders', $orderId, [
                'subscriptionEmailSent'   => true,
                'subscriptionEmailSentAt' => FIRESTORE_NOW,
                'updatedAt'               => FIRESTORE_NOW,
            ], $fbToken, true);

            logApiCall("Firestore marked subscriptionEmailSent for order", ['orderId' => $orderId]);
        } catch (Throwable $fbErr) {
            logApiCall("Failed to update Firestore subscriptionEmailSent flag: " . $fbErr->getMessage(), [
                'orderId' => $orderId
            ], 'WARN');
        }
    }

    logApiCall("Subscription confirmation email sent successfully", [
        'orderId' => $orderId,
        'email'   => $cleanEmail,
        'plan'    => $planType
    ]);

    return [
        'success'     => true,
        'alreadySent' => false,
        'message'     => 'Subscription confirmation email sent successfully.'
    ];
}

// ── If invoked directly via HTTP POST ───────────────────────────────────────
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'send-subscription-email.php') {
    initApiLogging('send-subscription-email.php');

    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed. Use POST."]);
        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true) ?: [];
    $orderId             = trim($input['order_id'] ?? $input['orderId'] ?? $_POST['order_id'] ?? '');
    $userId              = trim($input['userId'] ?? $_POST['userId'] ?? '');
    $planType            = trim($input['planType'] ?? $_POST['planType'] ?? 'annual');
    $amount              = floatval($input['amount'] ?? $_POST['amount'] ?? 0);
    $currency            = trim($input['currency'] ?? $_POST['currency'] ?? 'INR');
    $customerEmail       = trim($input['customerEmail'] ?? $input['email'] ?? $_POST['customerEmail'] ?? '');
    $customerName        = trim($input['customerName'] ?? $input['displayName'] ?? $_POST['customerName'] ?? '');
    $subscriptionEndDate = trim($input['subscriptionEndDate'] ?? $_POST['subscriptionEndDate'] ?? '');

    if (empty($orderId) || empty($customerEmail)) {
        logApiError("orderId and customerEmail are required.", $input, 400);
        http_response_code(400);
        echo json_encode(["error" => "orderId and valid customerEmail are required."]);
        exit;
    }

    if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        logApiError("Invalid email format provided: {$customerEmail}", $input, 400);
        http_response_code(400);
        echo json_encode(["error" => "Invalid customer email address format."]);
        exit;
    }

    $res = sendSubscriptionSuccessEmail(
        orderId: $orderId,
        userId: $userId,
        planType: $planType,
        amount: $amount,
        currency: $currency,
        customerEmail: $customerEmail,
        customerName: $customerName,
        subscriptionEndDate: $subscriptionEndDate
    );

    if (!$res['success']) {
        http_response_code(500);
    }
    echo json_encode($res);
    exit;
}
