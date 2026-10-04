<?php
/**
 * Coloro - Shared helpers for email OTP login and server-side trial tracking.
 *
 * Used by otp-request.php, otp-verify.php and claim-trial.php.
 * Not callable directly from the browser.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'auth-helper.php') {
    http_response_code(403);
    exit;
}

require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/mailer-helper.php';
require_once __DIR__ . '/firebase-helper.php';

const AUTH_TRIAL_DAYS         = 15;
const AUTH_IDENTITY_SCOPE     = 'https://www.googleapis.com/auth/identitytoolkit';
const AUTH_CUSTOM_TOKEN_AUD   = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';

function authJsonResponse(array $body, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function authApiHeaders(string $methods = 'POST, OPTIONS'): void
{
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: $methods");
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
    header('Cache-Control: no-store');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        authJsonResponse(['error' => 'Method not allowed. Use POST.'], 405);
    }
}

function authReadJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

// ─── Email validation / normalisation ──────────────────────────────────────

function authCleanEmail(string $email): string
{
    return strtolower(trim($email));
}

/**
 * Canonical identity of an inbox, used as the trial-claim key.
 * Collapses the tricks people use to get many "different" addresses:
 *   - plus tags:           me+1@x.com           -> me@x.com
 *   - gmail dots:          m.e@gmail.com        -> me@gmail.com
 *   - googlemail.com alias                      -> gmail.com
 */
function authNormalizeEmailKey(string $email): string
{
    $email = authCleanEmail($email);
    $at = strrpos($email, '@');
    if ($at === false) return $email;
    $local  = substr($email, 0, $at);
    $domain = substr($email, $at + 1);

    $plus = strpos($local, '+');
    if ($plus !== false) $local = substr($local, 0, $plus);

    if ($domain === 'googlemail.com') $domain = 'gmail.com';
    if ($domain === 'gmail.com') $local = str_replace('.', '', $local);

    return $local . '@' . $domain;
}

function authDocId(string $value): string
{
    return hash('sha256', $value);
}

/**
 * True for throw-away inbox providers (10minutemail, mailinator, ...).
 * Matches the domain and every parent domain against data/disposable.txt
 * (the community "disposable-email-domains" blocklist) plus data/disposable-extra.txt
 * for domains you add yourself.
 */
function authIsDisposableEmail(string $email): bool
{
    $domain = substr(strrchr(authCleanEmail($email), '@') ?: '', 1);
    if ($domain === '') return true;

    static $list = null;
    if ($list === null) {
        $list = [];
        foreach (['disposable.txt', 'disposable-extra.txt'] as $file) {
            $path = __DIR__ . '/data/' . $file;
            if (!is_readable($path)) continue;
            foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = strtolower(trim($line));
                if ($line !== '' && $line[0] !== '#') $list[$line] = true;
            }
        }
    }

    $parts = explode('.', $domain);
    for ($i = 0; $i < count($parts) - 1; $i++) {
        if (isset($list[implode('.', array_slice($parts, $i))])) return true;
    }
    return false;
}

/** The domain must be able to receive mail at all. */
function authDomainCanReceiveMail(string $email): bool
{
    $domain = substr(strrchr($email, '@') ?: '', 1);
    if ($domain === '' || !function_exists('checkdnsrr')) return $domain !== '';
    return checkdnsrr($domain, 'MX') || checkdnsrr($domain, 'A');
}

function authClientIp(): string
{
    return function_exists('getLoggerClientIp') ? (string)getLoggerClientIp() : ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

// ─── Firebase wiring ───────────────────────────────────────────────────────

function authLoadFirebase(array $env): array
{
    $sa = firebaseLoadServiceAccount($env);
    if (!$sa) {
        throw new RuntimeException('Firebase service account not found on server.');
    }
    return [
        'sa'        => $sa,
        'projectId' => $env['FIREBASE_PROJECT_ID'] ?? $sa['project_id'],
        'dbToken'   => firebaseGetAccessToken($sa),
        'authToken' => firebaseGetAccessToken($sa, AUTH_IDENTITY_SCOPE),
    ];
}

function authHttpJson(string $method, string $url, ?array $body, array $headers = []): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }
    $raw  = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    if ($err) throw new RuntimeException("HTTP $method $url failed: $err");
    return ['status' => $http, 'body' => json_decode($raw ?: '', true) ?: []];
}

/** Find the Firebase Auth user for an email, or create it (email already proven by OTP). */
function authFindOrCreateUser(array $fb, string $email): array
{
    $base = 'https://identitytoolkit.googleapis.com/v1/projects/' . rawurlencode($fb['projectId']);
    $auth = ['Authorization: Bearer ' . $fb['authToken']];

    $res = authHttpJson('POST', "$base/accounts:lookup", ['email' => [$email]], $auth);
    if ($res['status'] === 200 && !empty($res['body']['users'][0]['localId'])) {
        $u = $res['body']['users'][0];
        return ['uid' => $u['localId'], 'isNew' => false, 'displayName' => $u['displayName'] ?? '', 'photoUrl' => $u['photoUrl'] ?? ''];
    }

    $res = authHttpJson('POST', "$base/accounts", ['email' => $email, 'emailVerified' => true], $auth);
    if ($res['status'] !== 200 || empty($res['body']['localId'])) {
        throw new RuntimeException('Could not create auth user: HTTP ' . $res['status'] . ' ' . json_encode($res['body']));
    }
    return ['uid' => $res['body']['localId'], 'isNew' => true, 'displayName' => '', 'photoUrl' => ''];
}

/** Sign a Firebase custom token (RS256) that the client exchanges via signInWithCustomToken. */
function authMintCustomToken(array $sa, string $uid): string
{
    $now = time();
    $header  = _fb_b64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $payload = _fb_b64url(json_encode([
        'iss' => $sa['client_email'],
        'sub' => $sa['client_email'],
        'aud' => AUTH_CUSTOM_TOKEN_AUD,
        'iat' => $now,
        'exp' => $now + 3600,
        'uid' => $uid,
    ]));
    $key = openssl_pkey_get_private($sa['private_key']);
    if ($key === false) throw new RuntimeException('Cannot load service account private key.');
    openssl_sign("$header.$payload", $signature, $key, OPENSSL_ALGO_SHA256);
    return "$header.$payload." . _fb_b64url($signature);
}

/** Verify a Firebase ID token and return the account it belongs to. */
function authVerifyIdToken(array $env, string $idToken): ?array
{
    $apiKey = $env['FIREBASE_WEB_API_KEY'] ?? getenv('FIREBASE_WEB_API_KEY') ?: null;
    if (!$apiKey) {
        foreach ([__DIR__ . '/../../firebase-applet-config.json', __DIR__ . '/firebase-applet-config.json'] as $p) {
            if (is_readable($p)) {
                $cfg = json_decode(file_get_contents($p), true);
                if (!empty($cfg['apiKey'])) { $apiKey = $cfg['apiKey']; break; }
            }
        }
    }
    if (!$apiKey) throw new RuntimeException('FIREBASE_WEB_API_KEY is not configured.');

    $res = authHttpJson('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . rawurlencode($apiKey), ['idToken' => $idToken]);
    if ($res['status'] !== 200 || empty($res['body']['users'][0]['localId'])) return null;
    $u = $res['body']['users'][0];
    return [
        'uid'         => $u['localId'],
        'email'       => authCleanEmail($u['email'] ?? ''),
        'displayName' => $u['displayName'] ?? '',
        'photoUrl'    => $u['photoUrl'] ?? '',
    ];
}

// ─── Firestore: atomic create-if-absent ────────────────────────────────────

/** @return bool true if this call created the document, false if it already existed */
function authFirestoreCreate(string $projectId, string $collection, string $docId, array $data, string $token): bool
{
    $url = _fb_docUrl($projectId, $collection, $docId) . '?currentDocument.exists=false';
    $res = authHttpJson('PATCH', $url, ['fields' => phpToFirestoreFields($data)], ['Authorization: Bearer ' . $token]);
    if ($res['status'] >= 200 && $res['status'] < 300) return true;
    if (in_array($res['status'], [400, 409], true)) {
        $status = $res['body']['error']['status'] ?? '';
        if ($status === 'ALREADY_EXISTS' || $status === 'FAILED_PRECONDITION') return false;
    }
    throw new RuntimeException("Firestore create $collection/$docId failed: HTTP {$res['status']}");
}

function authFirestoreDelete(string $projectId, string $collection, string $docId, string $token): void
{
    authHttpJson('DELETE', _fb_docUrl($projectId, $collection, $docId), null, ['Authorization: Bearer ' . $token]);
}

// ─── Trial: one per person, decided on the server ──────────────────────────

/**
 * Grants the free trial at most once per normalised email, ever.
 *
 * trial_claims/{sha256(normalisedEmail)} is created atomically, so concurrent
 * logins, a second Firebase uid (deleted+re-created account) or a gmail
 * dot/plus alias cannot obtain a second trial - they receive the original
 * (possibly expired) trialEndDate instead.
 *
 * Also creates/updates users/{uid}. Never touches subscription fields or
 * welcomeEmailSent (the client sends the welcome mail once).
 *
 * @return array{trialEndDate:string, isNew:bool}  trialEndDate is RFC3339 UTC
 */
function authClaimTrial(array $fb, string $uid, string $email, string $displayName = '', string $photoUrl = '', string $provider = 'google'): array
{
    $pid   = $fb['projectId'];
    $token = $fb['dbToken'];

    $userDoc = firestoreGet($pid, 'users', $uid, $token);
    $existingTrial = $userDoc['exists'] ? ($userDoc['data']['trialEndDate'] ?? null) : null;

    // Legacy accounts keep the trial they already have; it seeds their claim.
    $candidate = $existingTrial
        ? (is_string($existingTrial) ? $existingTrial : gmdate('Y-m-d\TH:i:s\Z', strtotime((string)$existingTrial)))
        : gmdate('Y-m-d\TH:i:s\Z', time() + AUTH_TRIAL_DAYS * 86400);

    $claimId = authDocId(authNormalizeEmailKey($email));
    $created = authFirestoreCreate($pid, 'trial_claims', $claimId, [
        'uid'           => $uid,
        'email'         => $email,
        'trialEndDate'  => firestoreTimestamp($candidate),
        'createdAt'     => FIRESTORE_NOW,
    ], $token);

    $trialEnd = $candidate;
    if (!$created) {
        $claim = firestoreGet($pid, 'trial_claims', $claimId, $token);
        $stored = $claim['data']['trialEndDate'] ?? null;
        if ($stored) $trialEnd = is_string($stored) ? $stored : gmdate('Y-m-d\TH:i:s\Z', strtotime((string)$stored));
    }

    $profile = [
        'uid'          => $uid,
        'email'        => $email,
        'trialEndDate' => firestoreTimestamp($trialEnd),
        'lastLoginAt'  => FIRESTORE_NOW,
    ];
    if (!$userDoc['exists'] || empty($userDoc['data']['createdAt'])) {
        $profile['createdAt']    = FIRESTORE_NOW;
        $profile['isSubscribed'] = false;
        $profile['provider']     = $provider;
    }
    if ($displayName !== '' && empty($userDoc['data']['displayName'])) $profile['displayName'] = $displayName;
    if ($photoUrl !== ''    && empty($userDoc['data']['photoURL']))    $profile['photoURL']    = $photoUrl;
    firestoreSet($pid, 'users', $uid, $profile, $token, true);

    return ['trialEndDate' => $trialEnd, 'isNew' => $created];
}
