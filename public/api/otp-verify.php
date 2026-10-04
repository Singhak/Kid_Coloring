<?php
/**
 * Coloro - Email OTP login, step 2: verify the code.
 *
 * POST { email, code }
 * On success: finds or creates the Firebase Auth user (same uid as a Google
 * login with the same email), claims the one-time trial on the server and
 * returns a Firebase custom token for signInWithCustomToken().
 */
require_once __DIR__ . '/auth-helper.php';

initApiLogging('otp-verify.php');
authApiHeaders();

const OTP_MAX_ATTEMPTS = 5;

$input = authReadJsonBody();
$email = authCleanEmail((string)($input['email'] ?? ''));
$code  = preg_replace('/\D/', '', (string)($input['code'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($code) !== 6) {
    authJsonResponse(['error' => 'Enter the 6-digit code from your email.'], 400);
}
if (authIsDisposableEmail($email)) {
    authJsonResponse(['error' => 'Temporary / disposable email addresses are not allowed.', 'code' => 'disposable_email'], 400);
}

$env = loadMailerEnv();

try {
    $fb  = authLoadFirebase($env);
    $pid = $fb['projectId'];
    $tok = $fb['dbToken'];
    $id  = authDocId($email);
    $now = time();

    $doc = firestoreGet($pid, 'otp_codes', $id, $tok);
    $d   = $doc['data'];
    if (!$doc['exists'] || empty($d['codeHash']) || (int)($d['expiresAt'] ?? 0) < $now) {
        authJsonResponse(['error' => 'This code has expired. Please request a new one.', 'code' => 'expired'], 400);
    }

    $attempts = (int)($d['attempts'] ?? 0);
    if ($attempts >= OTP_MAX_ATTEMPTS) {
        authFirestoreDelete($pid, 'otp_codes', $id, $tok);
        authJsonResponse(['error' => 'Too many wrong attempts. Please request a new code.', 'code' => 'locked'], 429);
    }

    $secret   = $env['OTP_SECRET'] ?? hash('sha256', $fb['sa']['private_key']);
    $expected = hash_hmac('sha256', $id . ':' . $code, $secret);
    if (!hash_equals((string)$d['codeHash'], $expected)) {
        firestoreSet($pid, 'otp_codes', $id, ['attempts' => $attempts + 1], $tok, true);
        authJsonResponse(['error' => 'Incorrect code. Please try again.', 'code' => 'wrong_code'], 400);
    }

    // One-time use
    authFirestoreDelete($pid, 'otp_codes', $id, $tok);

    $user  = authFindOrCreateUser($fb, $email);
    $trial = authClaimTrial($fb, $user['uid'], $email, $user['displayName'], $user['photoUrl'], 'otp');
    $token = authMintCustomToken($fb['sa'], $user['uid']);

    authJsonResponse([
        'success'      => true,
        'token'        => $token,
        'isNewUser'    => $user['isNew'],
        'trialEndDate' => $trial['trialEndDate'],
    ]);
} catch (Throwable $e) {
    logApiError('otp-verify failed: ' . $e->getMessage(), [], 500);
    authJsonResponse(['error' => 'Server error. Please try again.'], 500);
}
