<?php
/**
 * Coloro Firebase REST API Helper
 *
 * Provides admin-level Firestore read/write from PHP via Google REST API.
 * Uses a Firebase Service Account JSON key (NOT the client web SDK key).
 *
 * Authentication flow:
 *   1. Load service account JSON (private key + client email)
 *   2. Create a signed RS256 JWT
 *   3. Exchange JWT for a short-lived OAuth2 Bearer token (cached ~50 min)
 *   4. Use Bearer token in all Firestore REST API calls
 *
 * Requires: PHP 7.4+, openssl extension, curl extension
 * No external dependencies — pure PHP.
 *
 * Usage:
 *   require_once __DIR__ . '/firebase-helper.php';
 *   $sa    = firebaseLoadServiceAccount($env);           // load service account
 *   $token = firebaseGetAccessToken($sa);               // get/cache OAuth2 token
 *   firestoreSet('project-id', 'orders', $docId, $data, $token);
 *   $doc   = firestoreGet('project-id', 'orders', $docId, $token);
 */

// Guard against direct browser access
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'firebase-helper.php') {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Direct access forbidden']);
    exit;
}

// PHP 8.0 polyfill for array_is_list (available natively in PHP 8.1+)
if (!function_exists('array_is_list')) {
    function array_is_list(array $arr): bool {
        if ($arr === []) return true;
        return array_keys($arr) === range(0, count($arr) - 1);
    }
}

// ─── Constants ─────────────────────────────────────────────────────────────

/** Sentinel: use as a field value to write the current UTC time as a Firestore Timestamp */
const FIRESTORE_NOW = '__FIRESTORE_NOW__';

// ─── Service Account Loader ────────────────────────────────────────────────

/**
 * Load and validate the Firebase Service Account JSON.
 *
 * Search order:
 *   1. $env['FIREBASE_SERVICE_ACCOUNT_JSON'] — path configured in .env
 *   2. getenv('FIREBASE_SERVICE_ACCOUNT_JSON') — server environment variable
 *   3. __DIR__ . '/firebase-service-account.json' — same dir as this file
 *   4. dirname(__DIR__) . '/firebase-service-account.json' — parent of /api
 *
 * @param  array  $env  Parsed .env key-value pairs (may be empty)
 * @return array|null   Parsed service account data, or null if not found/invalid
 */
function firebaseLoadServiceAccount(array $env = []): ?array
{
    $paths = [
        $env['FIREBASE_SERVICE_ACCOUNT_JSON']        ?? null,
        getenv('FIREBASE_SERVICE_ACCOUNT_JSON')       ?: null,
        __DIR__ . '/firebase-service-account.json',
        dirname(__DIR__) . '/firebase-service-account.json',
    ];

    foreach ($paths as $path) {
        if (!$path || !is_readable($path)) continue;

        $sa = json_decode(file_get_contents($path), true);
        if (
            is_array($sa) &&
            !empty($sa['private_key']) &&
            !empty($sa['client_email']) &&
            !empty($sa['project_id'])
        ) {
            return $sa;
        }
    }

    return null;
}

// ─── JWT Utilities ─────────────────────────────────────────────────────────

/**
 * Base64URL-encode bytes (RFC 4648 §5 — URL-safe, no padding)
 */
function _fb_b64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Build and sign an RS256 JWT for Google OAuth2 service-account auth.
 *
 * @param  array  $sa  Parsed service account JSON
 * @return string      Signed JWT string
 * @throws RuntimeException if private key cannot be loaded
 */
function firebaseCreateJWT(array $sa): string
{
    $now     = time();
    $header  = _fb_b64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $payload = _fb_b64url(json_encode([
        'iss'   => $sa['client_email'],
        'scope' => 'https://www.googleapis.com/auth/datastore',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'iat'   => $now,
        'exp'   => $now + 3600,
    ]));

    $input = $header . '.' . $payload;
    $key   = openssl_pkey_get_private($sa['private_key']);

    if ($key === false) {
        throw new RuntimeException(
            'Firebase: Cannot load private key from service account. ' .
            'Ensure the JSON is unmodified and the private key is PEM-encoded.'
        );
    }

    openssl_sign($input, $signature, $key, OPENSSL_ALGO_SHA256);

    return $input . '.' . _fb_b64url($signature);
}

/**
 * Exchange a signed JWT for a Google OAuth2 Bearer access token.
 * Token is cached in sys_get_temp_dir() for ~50 minutes to avoid
 * re-authenticating on every request (each token is valid for 1 hour).
 *
 * @param  array  $sa  Parsed service account JSON
 * @return string      OAuth2 access token
 * @throws RuntimeException on network failure or auth rejection
 */
function firebaseGetAccessToken(array $sa): string
{
    // Cache key is derived from client_email + key_id (unique per credential)
    $cacheKey  = substr(md5($sa['client_email'] . ($sa['private_key_id'] ?? '')), 0, 14);
    $cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'coloro_fb_' . $cacheKey . '.json';

    // Return cached token if still valid (60-second buffer before expiry)
    if (is_readable($cacheFile)) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if (
            !empty($cached['access_token']) &&
            isset($cached['expires_at']) &&
            $cached['expires_at'] > time() + 60
        ) {
            return $cached['access_token'];
        }
    }

    // Mint a fresh token via Google OAuth2
    $jwt = firebaseCreateJWT($sa);

    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $raw = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new RuntimeException("Firebase: OAuth2 token request failed (cURL): $err");
    }

    $res = json_decode($raw, true);
    if (empty($res['access_token'])) {
        $desc = $res['error_description'] ?? ($res['error'] ?? 'unknown error');
        throw new RuntimeException("Firebase: OAuth2 token exchange rejected: $desc");
    }

    // Persist token to cache (expires_at = now + expires_in - 5-minute buffer)
    @file_put_contents(
        $cacheFile,
        json_encode([
            'access_token' => $res['access_token'],
            'expires_at'   => time() + ($res['expires_in'] ?? 3600) - 300,
        ]),
        LOCK_EX
    );

    return $res['access_token'];
}

// ─── Firestore Field Value Serialization ──────────────────────────────────

/**
 * Wrap a specific RFC3339 UTC string as a Firestore Timestamp value.
 *
 * Example:
 *   'subscriptionEndDate' => firestoreTimestamp('2027-09-08T10:00:00Z')
 *
 * @param  string $isoUtc  RFC3339 / ISO-8601 date string in UTC (ending with Z)
 * @return array           Opaque marker recognised by phpToFirestoreValue()
 */
function firestoreTimestamp(string $isoUtc): array
{
    return ['__firestoreTimestampValue__' => $isoUtc];
}

/**
 * Convert a single PHP value to a Firestore REST API typed value object.
 *
 * Supported mappings:
 *   null                                → nullValue
 *   FIRESTORE_NOW constant              → timestampValue (current UTC time)
 *   firestoreTimestamp($iso)            → timestampValue (specific time)
 *   bool                                → booleanValue
 *   int                                 → integerValue (as string per Firestore spec)
 *   float                               → doubleValue
 *   string                              → stringValue
 *   sequential array                    → arrayValue
 *   associative array                   → mapValue
 */
function phpToFirestoreValue($value): array
{
    if ($value === null) {
        return ['nullValue' => null];
    }

    if ($value === FIRESTORE_NOW) {
        return ['timestampValue' => gmdate('Y-m-d\TH:i:s\Z')];
    }

    if (is_array($value) && isset($value['__firestoreTimestampValue__'])) {
        return ['timestampValue' => $value['__firestoreTimestampValue__']];
    }

    if (is_bool($value)) {
        return ['booleanValue' => $value];
    }

    if (is_int($value)) {
        // Firestore REST requires integerValue as a string
        return ['integerValue' => (string)$value];
    }

    if (is_float($value)) {
        return ['doubleValue' => $value];
    }

    if (is_string($value)) {
        return ['stringValue' => $value];
    }

    if (is_array($value)) {
        if (array_is_list($value)) {
            return [
                'arrayValue' => [
                    'values' => array_map('phpToFirestoreValue', $value),
                ],
            ];
        }

        // Associative array → mapValue
        $fields = [];
        foreach ($value as $k => $v) {
            $fields[$k] = phpToFirestoreValue($v);
        }
        return ['mapValue' => ['fields' => $fields]];
    }

    // Fallback: coerce to string
    return ['stringValue' => (string)$value];
}

/**
 * Convert a top-level PHP associative array to a Firestore `fields` object.
 *
 * @param  array $data  PHP key-value pairs
 * @return array        Firestore REST `fields` structure
 */
function phpToFirestoreFields(array $data): array
{
    $fields = [];
    foreach ($data as $key => $value) {
        $fields[(string)$key] = phpToFirestoreValue($value);
    }
    return $fields;
}

/**
 * Decode a Firestore REST `fields` object back to a flat PHP array.
 * Timestamps are returned as RFC3339 strings.
 *
 * @param  array $fields  Firestore field map
 * @return array          Decoded PHP key-value pairs
 */
function firestoreFieldsToPhp(array $fields): array
{
    $result = [];
    foreach ($fields as $key => $valueObj) {
        $result[$key] = _fb_valueToPhp($valueObj);
    }
    return $result;
}

/** @internal */
function _fb_valueToPhp(array $v)
{
    if (array_key_exists('nullValue', $v))      return null;
    if (array_key_exists('booleanValue', $v))   return (bool)$v['booleanValue'];
    if (array_key_exists('integerValue', $v))   return (int)$v['integerValue'];
    if (array_key_exists('doubleValue', $v))    return (float)$v['doubleValue'];
    if (array_key_exists('stringValue', $v))    return $v['stringValue'];
    if (array_key_exists('timestampValue', $v)) return $v['timestampValue'];
    if (array_key_exists('arrayValue', $v)) {
        return array_map('_fb_valueToPhp', $v['arrayValue']['values'] ?? []);
    }
    if (array_key_exists('mapValue', $v)) {
        return firestoreFieldsToPhp($v['mapValue']['fields'] ?? []);
    }
    return null;
}

// ─── Firestore REST API Operations ────────────────────────────────────────

/**
 * Build the Firestore document REST URL.
 * Always targets the (default) database.
 *
 * @param  string $projectId   Firebase project ID (e.g. 'kidcoloro')
 * @param  string $collection  Collection path (e.g. 'orders')
 * @param  string $docId       Document ID
 * @return string              Full REST URL
 */
function _fb_docUrl(string $projectId, string $collection, string $docId): string
{
    return sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s/%s',
        rawurlencode($projectId),
        $collection,
        rawurlencode($docId)
    );
}

/**
 * Read a Firestore document.
 *
 * @param  string $projectId   Firebase project ID
 * @param  string $collection  Collection name
 * @param  string $docId       Document ID
 * @param  string $token       OAuth2 Bearer access token
 *
 * @return array {
 *   exists: bool,
 *   data:   array  (decoded PHP fields, empty array if doc not found)
 * }
 *
 * @throws RuntimeException on unexpected HTTP errors
 */
function firestoreGet(
    string $projectId,
    string $collection,
    string $docId,
    string $token
): array {
    $url = _fb_docUrl($projectId, $collection, $docId);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPGET        => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $raw  = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new RuntimeException("firestoreGet ($collection/$docId) cURL error: $err");
    }

    if ($http === 404) {
        return ['exists' => false, 'data' => []];
    }

    if ($http !== 200) {
        throw new RuntimeException(
            "firestoreGet ($collection/$docId) HTTP $http: " . substr($raw ?? '', 0, 250)
        );
    }

    $doc = json_decode($raw, true);
    if (empty($doc['fields'])) {
        return ['exists' => true, 'data' => []];
    }

    return [
        'exists' => true,
        'data'   => firestoreFieldsToPhp($doc['fields']),
    ];
}

/**
 * Write a Firestore document using the REST PATCH endpoint.
 *
 * @param  string $projectId   Firebase project ID
 * @param  string $collection  Collection name (e.g. 'orders')
 * @param  string $docId       Document ID
 * @param  array  $data        PHP key-value pairs to write (values auto-serialized)
 * @param  string $token       OAuth2 Bearer access token
 * @param  bool   $merge       true = merge/update only listed fields (safe for partial update)
 *                             false = full document replace
 *
 * @return bool  true on success
 * @throws RuntimeException on cURL or Firestore API errors
 */
function firestoreSet(
    string $projectId,
    string $collection,
    string $docId,
    array $data,
    string $token,
    bool $merge = true
): bool {
    $url = _fb_docUrl($projectId, $collection, $docId);

    // Merge mode: add updateMask for each top-level field so Firestore
    // only touches those fields and leaves others untouched
    if ($merge && !empty($data)) {
        $maskParams = implode('&', array_map(
            fn($k) => 'updateMask.fieldPaths=' . rawurlencode((string)$k),
            array_keys($data)
        ));
        $url .= '?' . $maskParams;
    }

    $body = json_encode(['fields' => phpToFirestoreFields($data)], JSON_UNESCAPED_UNICODE);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => 'PATCH',
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $raw  = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new RuntimeException("firestoreSet ($collection/$docId) cURL error: $err");
    }

    if ($http < 200 || $http >= 300) {
        throw new RuntimeException(
            "firestoreSet ($collection/$docId) HTTP $http: " . substr($raw ?? '', 0, 300)
        );
    }

    return true;
}

// ─── Domain Helpers ───────────────────────────────────────────────────────

/**
 * Calculate subscription end date as a Firestore Timestamp value.
 * Annual plan = 365 days, Monthly plan = 30 days from now (UTC).
 *
 * @param  string $planType  'annual' or 'monthly'
 * @return array             firestoreTimestamp() value ready for phpToFirestoreValue()
 */
function subscriptionEndTimestamp(string $planType): array
{
    $durationSeconds = ($planType === 'monthly') ? 30 * 86400 : 365 * 86400;
    return firestoreTimestamp(gmdate('Y-m-d\TH:i:s\Z', time() + $durationSeconds));
}

/**
 * Normalise a payment_method value (may be a string or a Cashfree map object)
 * to a plain readable string like 'upi', 'card', 'netbanking', 'cashfree'.
 *
 * @param  mixed $rawMethod  Raw payment_method from Cashfree response
 * @return string
 */
function normalisePaymentMethod($rawMethod): string
{
    if (is_string($rawMethod) && $rawMethod !== '') return strtolower($rawMethod);
    if (is_array($rawMethod)  && !empty($rawMethod)) return strtolower((string)key($rawMethod));
    return 'cashfree';
}

/**
 * Idempotently write a PAID order document and update the user's subscription profile.
 *
 * - Checks if the order is already marked 'paid' → returns early (safe to call repeatedly).
 * - Writes orders/{orderId} with full payment details.
 * - Writes/merges users/{userId} with subscription fields.
 *
 * @param string $projectId     Firebase project ID
 * @param string $orderId       Cashfree order ID (document key)
 * @param string $userId        Firebase Auth UID of the payer
 * @param string $planType      'annual' or 'monthly'
 * @param float  $amount        Verified amount (INR)
 * @param string $currency      Currency code (default 'INR')
 * @param string $paymentId     Cashfree payment ID
 * @param string $paymentMethod Normalised payment method string
 * @param string $source        'verify' | 'webhook' (for audit trail)
 * @param string $token         OAuth2 Bearer access token
 *
 * @return array { alreadyProcessed: bool, subscriptionEndDate: string }
 * @throws RuntimeException on Firestore errors
 */
function firestoreRecordPayment(
    string $projectId,
    string $orderId,
    string $userId,
    string $planType,
    float  $amount,
    string $currency,
    string $paymentId,
    string $paymentMethod,
    string $source,
    string $token
): array {
    // ── 1. Idempotency check ─────────────────────────────────────────────
    $existing = firestoreGet($projectId, 'orders', $orderId, $token);
    if ($existing['exists'] && ($existing['data']['status'] ?? '') === 'paid') {
        return [
            'alreadyProcessed'    => true,
            'subscriptionEndDate' => $existing['data']['subscriptionEndDate'] ?? '',
        ];
    }

    $endTimestamp  = subscriptionEndTimestamp($planType);
    $endDateString = $endTimestamp['__firestoreTimestampValue__'];

    // ── 2. Write orders/{orderId} ─────────────────────────────────────────
    firestoreSet($projectId, 'orders', $orderId, [
        'orderId'               => $orderId,
        'userId'                => $userId,
        'gateway'               => 'cashfree',
        'planType'              => $planType,
        'amount'                => $amount,
        'currency'              => $currency,
        'status'                => 'paid',
        'paymentId'             => $paymentId,
        'paymentMethod'         => $paymentMethod,
        'subscriptionStartDate' => FIRESTORE_NOW,
        'subscriptionEndDate'   => $endTimestamp,
        'paidAt'                => FIRESTORE_NOW,
        'updatedAt'             => FIRESTORE_NOW,
        'processedBy'           => 'server',
        'source'                => $source,    // 'verify' or 'webhook'
    ], $token, true); // merge — preserves createdAt set at order creation

    // ── 3. Update users/{userId} subscription profile ─────────────────────
    if ($userId) {
        firestoreSet($projectId, 'users', $userId, [
            'isSubscribed'          => true,
            'planType'              => $planType,
            'subscriptionStartDate' => FIRESTORE_NOW,
            'subscriptionEndDate'   => $endTimestamp,
            'lastOrderId'           => $orderId,
            'gateway'               => 'cashfree',
            'updatedAt'             => FIRESTORE_NOW,
        ], $token, true);
    }

    return [
        'alreadyProcessed'    => false,
        'subscriptionEndDate' => $endDateString,
    ];
}
