<?php
/**
 * Coloro - Email OTP login, step 1: send a 6-digit code.
 *
 * POST { email }
 * Stores only an HMAC of the code in Firestore (otp_codes/{sha256(email)}),
 * valid 10 minutes, with resend cooldown and per-email / per-IP rate limits.
 */
require_once __DIR__ . '/auth-helper.php';

initApiLogging('otp-request.php');
authApiHeaders();

const OTP_TTL_SECONDS     = 600;
const OTP_RESEND_COOLDOWN = 45;
const OTP_MAX_PER_HOUR    = 5;
const OTP_MAX_PER_IP_HOUR = 20;

$input = authReadJsonBody();
$email = authCleanEmail((string)($input['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    authJsonResponse(['error' => 'Please enter a valid email address.'], 400);
}
if (authIsDisposableEmail($email)) {
    authJsonResponse(['error' => 'Temporary / disposable email addresses are not allowed. Please use your regular email.', 'code' => 'disposable_email'], 400);
}
if (!authDomainCanReceiveMail($email)) {
    authJsonResponse(['error' => 'That email domain cannot receive mail. Please check the address.', 'code' => 'bad_domain'], 400);
}

$env = loadMailerEnv();

try {
    $fb  = authLoadFirebase($env);
    $pid = $fb['projectId'];
    $tok = $fb['dbToken'];
    $now = time();

    // ── Per-IP limit ───────────────────────────────────────────────────────
    $ipId  = authDocId('ip:' . authClientIp());
    $ipDoc = firestoreGet($pid, 'otp_limits', $ipId, $tok);
    $ipWin = (int)($ipDoc['data']['windowStart'] ?? 0);
    $ipCnt = (int)($ipDoc['data']['count'] ?? 0);
    if ($now - $ipWin > 3600) { $ipWin = $now; $ipCnt = 0; }
    if ($ipCnt >= OTP_MAX_PER_IP_HOUR) {
        authJsonResponse(['error' => 'Too many requests. Please try again later.'], 429);
    }
    firestoreSet($pid, 'otp_limits', $ipId, ['windowStart' => $ipWin, 'count' => $ipCnt + 1], $tok, false);

    // ── Per-email limit + cooldown ────────────────────────────────────────
    $id  = authDocId($email);
    $doc = firestoreGet($pid, 'otp_codes', $id, $tok);
    $d   = $doc['data'];
    $winStart = (int)($d['windowStart'] ?? 0);
    $sent     = (int)($d['sentCount'] ?? 0);
    if ($now - $winStart > 3600) { $winStart = $now; $sent = 0; }

    $lastSent = (int)($d['lastSentAt'] ?? 0);
    if ($now - $lastSent < OTP_RESEND_COOLDOWN) {
        authJsonResponse(['error' => 'Please wait a few seconds before requesting another code.', 'retryAfter' => OTP_RESEND_COOLDOWN - ($now - $lastSent)], 429);
    }
    if ($sent >= OTP_MAX_PER_HOUR) {
        authJsonResponse(['error' => 'Too many codes requested for this email. Please try again in an hour.'], 429);
    }

    // ── Generate + store (hash only) ──────────────────────────────────────
    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $secret = $env['OTP_SECRET'] ?? hash('sha256', $fb['sa']['private_key']);
    firestoreSet($pid, 'otp_codes', $id, [
        'codeHash'    => hash_hmac('sha256', $id . ':' . $code, $secret),
        'expiresAt'   => $now + OTP_TTL_SECONDS,
        'attempts'    => 0,
        'sentCount'   => $sent + 1,
        'windowStart' => $winStart,
        'lastSentAt'  => $now,
    ], $tok, false);

    // ── Mail it ───────────────────────────────────────────────────────────
    $appUrl = rtrim($env['APP_URL'] ?? 'https://coloro.in', '/');
    try {
        $html = renderEmailTemplate(__DIR__ . '/email-templates/otp-code.html', [
            '{{CODE}}'    => $code,
            '{{MINUTES}}' => (string)(OTP_TTL_SECONDS / 60),
            '{{APP_URL}}' => htmlspecialchars($appUrl, ENT_QUOTES, 'UTF-8'),
        ]);
    } catch (Throwable $e) {
        // Branded template missing: fall back to a minimal message so login still works.
        $html = '<p>Your Coloro login code is <strong style="font-size:24px;letter-spacing:6px">' . $code
              . '</strong>. It expires in ' . (OTP_TTL_SECONDS / 60) . ' minutes.</p>';
    }
    $smtpError = null;
    $ok = sendColoroMail(to: $email, toName: '', subject: "$code is your Coloro login code", html: $html, env: $env, errorOutput: $smtpError);
    if (!$ok) {
        logApiError("OTP mail failed: $smtpError", [], 500);
        authJsonResponse(['error' => 'Could not send the code. Please try again.'], 500);
    }

    authJsonResponse(['success' => true, 'expiresIn' => OTP_TTL_SECONDS, 'cooldown' => OTP_RESEND_COOLDOWN]);
} catch (Throwable $e) {
    logApiError('otp-request failed: ' . $e->getMessage(), [], 500);
    authJsonResponse(['error' => 'Server error. Please try again.'], 500);
}
