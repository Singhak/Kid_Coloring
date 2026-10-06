<?php
/**
 * Coloro - Google Play Real-time Developer Notifications (RTDN) receiver.
 *
 * Google Play -> Pub/Sub topic -> push subscription -> POST this file. Keeps VIP in sync when the
 * app is not open: renewals, cancellations, expiry, grace period, refunds/revocations.
 *
 * The push subscription URL must carry a shared secret:
 *   https://YOUR-DOMAIN/api/play-rtdn.php?secret=<PLAY_RTDN_SECRET>
 * Add PLAY_RTDN_SECRET=<long random string> to public/api/.env.
 *
 * Only purchases already linked to a user by verify-play-purchase.php (play_purchases/{sha256(token)})
 * are processed; anything else is acknowledged and ignored.
 * Responds 2xx for handled/ignorable messages and 5xx for transient errors so Pub/Sub retries.
 */

require_once __DIR__ . '/logger.php';
initApiLogging('play-rtdn.php');
require_once __DIR__ . '/env-helper.php';
require_once __DIR__ . '/auth-helper.php';

const RTDN_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const RTDN_PRODUCTS = [
    'coloro_vip_monthly' => 'monthly',
    'coloro_vip_annual'  => 'annual',
];
const RTDN_ENTITLED_STATES = [
    'SUBSCRIPTION_STATE_ACTIVE',
    'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
    'SUBSCRIPTION_STATE_CANCELED',
];

function rtdnReply(int $status, array $body = []): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($body ?: ['ok' => $status < 300]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    rtdnReply(405, ['error' => 'Use POST.']);
}

$env    = coloroLoadEnv();
$secret = (string)($env['PLAY_RTDN_SECRET'] ?? '');
$given  = (string)($_GET['secret'] ?? '');
if ($secret === '' || !hash_equals($secret, $given)) {
    logApiError('RTDN rejected: bad or missing secret', [], 403);
    rtdnReply(403, ['error' => 'Forbidden']);
}

$envelope = json_decode(file_get_contents('php://input') ?: '', true);
$encoded  = $envelope['message']['data'] ?? '';
$message  = $encoded !== '' ? json_decode((string)base64_decode($encoded, true), true) : null;
if (!is_array($message)) {
    rtdnReply(200, ['ignored' => 'unreadable message']); // retrying a malformed message never helps
}

$package = $env['ANDROID_PACKAGE_NAME'] ?? 'in.coloro';
if (($message['packageName'] ?? $package) !== $package) {
    rtdnReply(200, ['ignored' => 'other package']);
}

// Subscription events and voided purchases (refunds / chargebacks) both carry a purchase token.
$token = (string)($message['subscriptionNotification']['purchaseToken']
    ?? $message['voidedPurchaseNotification']['purchaseToken'] ?? '');
if ($token === '') {
    rtdnReply(200, ['ignored' => 'no purchase token (test or one-time product event)']);
}

try {
    $fb  = authLoadFirebase($env);
    $pid = $fb['projectId'];
    $db  = $fb['dbToken'];

    $tokenId = hash('sha256', $token);
    $bound   = firestoreGet($pid, 'play_purchases', $tokenId, $db);
    if (!$bound['exists'] || empty($bound['data']['userId'])) {
        logApiCall('RTDN for unknown purchase, ignored', ['token' => substr($tokenId, 0, 12)], 'WARN');
        rtdnReply(200, ['ignored' => 'unknown purchase']);
    }
    $uid = (string)$bound['data']['userId'];

    // Ask Google for the current truth rather than trusting the notification type.
    $playToken = firebaseGetAccessToken($fb['sa'], RTDN_SCOPE);
    $url = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' . rawurlencode($package)
         . '/purchases/subscriptionsv2/tokens/' . rawurlencode($token);
    $res = authHttpJson('GET', $url, null, ['Authorization: Bearer ' . $playToken]);
    if ($res['status'] !== 200) {
        logApiError('RTDN subscriptionsv2.get failed', ['http' => $res['status'], 'body' => $res['body']], 502);
        rtdnReply(502, ['error' => 'Google lookup failed']); // let Pub/Sub retry
    }
    $sub   = $res['body'];
    $state = (string)($sub['subscriptionState'] ?? '');

    $line = null;
    foreach (($sub['lineItems'] ?? []) as $item) {
        if (isset(RTDN_PRODUCTS[$item['productId'] ?? ''])) { $line = $item; break; }
    }
    $expiryTs  = $line ? strtotime($line['expiryTime'] ?? '') : false;
    $entitled  = $line && $expiryTs && $expiryTs > time() && in_array($state, RTDN_ENTITLED_STATES, true);
    $expiryIso = $expiryTs ? gmdate('Y-m-d\TH:i:s\Z', $expiryTs) : gmdate('Y-m-d\TH:i:s\Z');

    firestoreSet($pid, 'play_purchases', $tokenId, [
        'state'      => $state,
        'updatedAt'  => FIRESTORE_NOW,
        'expiryTime' => firestoreTimestamp($expiryIso),
    ], $db, true);

    // Only touch the profile if Play is what currently provides this user's access, so a web
    // purchase or a newer Play purchase is never overwritten by an old token's event.
    $user = firestoreGet($pid, 'users', $uid, $db);
    $data = $user['exists'] ? $user['data'] : [];
    if (($data['gateway'] ?? '') !== 'google_play') {
        rtdnReply(200, ['ignored' => 'user not on google_play']);
    }
    $orderId = $sub['latestOrderId'] ?? ($data['lastOrderId'] ?? '');

    if ($entitled) {
        $profile = [
            'isSubscribed'        => true,
            'subscriptionEndDate' => firestoreTimestamp($expiryIso),
            'planType'            => RTDN_PRODUCTS[$line['productId']],
            'updatedAt'           => FIRESTORE_NOW,
        ];
        if ($orderId !== '') $profile['lastOrderId'] = $orderId;
    } else {
        // Expired, on hold, paused, revoked or refunded: end access now.
        $profile = [
            'isSubscribed'        => false,
            'subscriptionEndDate' => firestoreTimestamp(gmdate('Y-m-d\TH:i:s\Z', min($expiryTs ?: time(), time()))),
            'updatedAt'           => FIRESTORE_NOW,
        ];
    }
    firestoreSet($pid, 'users', $uid, $profile, $db, true);

    logApiCall('RTDN processed', ['uid' => $uid, 'state' => $state, 'entitled' => (bool)$entitled, 'expiry' => $expiryIso]);
    rtdnReply(200, ['ok' => true, 'entitled' => (bool)$entitled]);
} catch (Throwable $e) {
    logApiError('play-rtdn exception: ' . $e->getMessage(), [], 500);
    rtdnReply(500, ['error' => 'Temporary failure']);
}
