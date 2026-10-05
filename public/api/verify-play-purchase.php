<?php
/**
 * Coloro - verify a Google Play subscription purchase made in the Android app.
 *
 * POST { idToken, purchaseToken, productId }
 *   1. idToken is verified with Firebase, so the purchase is credited to the real signed-in user.
 *   2. The purchase is checked with the Google Play Developer API (never trusted from the client).
 *   3. The purchase token is bound to one Firebase user (play_purchases/{sha256(token)}).
 *   4. users/{uid} gets the subscription (end date = Google's expiry) and the purchase is acknowledged.
 *
 * Also called on every app start with the owned purchase, which is how renewals extend VIP.
 *
 * Setup: enable "Google Play Android Developer API" in the Google Cloud project of the service
 * account, then invite the service account's email in Play Console > Users and permissions with
 * "View financial data" and "Manage orders and subscriptions". Optional .env: ANDROID_PACKAGE_NAME.
 */

require_once __DIR__ . '/logger.php';
initApiLogging('verify-play-purchase.php');
require_once __DIR__ . '/env-helper.php';
require_once __DIR__ . '/auth-helper.php';

authApiHeaders('POST, OPTIONS');

const PLAY_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const PLAY_PRODUCTS = [
    'coloro_vip_monthly' => 'monthly',
    'coloro_vip_annual'  => 'annual',
];
// Google subscription states that still give access (CANCELED = turned off renewal, valid until expiry).
const PLAY_ENTITLED_STATES = [
    'SUBSCRIPTION_STATE_ACTIVE',
    'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
    'SUBSCRIPTION_STATE_CANCELED',
];

$env     = coloroLoadEnv();
$input   = authReadJsonBody();
$idToken = trim((string)($input['idToken'] ?? ''));
$token   = trim((string)($input['purchaseToken'] ?? ''));
$product = trim((string)($input['productId'] ?? ''));

if ($idToken === '' || $token === '' || !isset(PLAY_PRODUCTS[$product])) {
    authJsonResponse(['success' => false, 'error' => 'idToken, purchaseToken and a valid productId are required.'], 400);
}

try {
    $account = authVerifyIdToken($env, $idToken);
    if (!$account) {
        authJsonResponse(['success' => false, 'error' => 'Please sign in again.'], 401);
    }
    $uid = $account['uid'];

    $fb = authLoadFirebase($env);
    $pid = $fb['projectId'];
    $db  = $fb['dbToken'];
    $playToken = firebaseGetAccessToken($fb['sa'], PLAY_SCOPE);
    $package   = $env['ANDROID_PACKAGE_NAME'] ?? 'in.coloro';
    $auth      = ['Authorization: Bearer ' . $playToken];

    // 1. Ask Google about this purchase
    $base = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' . rawurlencode($package);
    $res  = authHttpJson('GET', "$base/purchases/subscriptionsv2/tokens/" . rawurlencode($token), null, $auth);
    if ($res['status'] !== 200) {
        logApiError('Play subscriptionsv2.get failed', ['http' => $res['status'], 'body' => $res['body'], 'uid' => $uid], 502);
        authJsonResponse(['success' => false, 'error' => 'Google Play could not confirm this purchase.'], 502);
    }
    $sub = $res['body'];

    $line = null;
    foreach (($sub['lineItems'] ?? []) as $item) {
        if (($item['productId'] ?? '') === $product) { $line = $item; break; }
    }
    $state = $sub['subscriptionState'] ?? '';
    $expiryTs = $line ? strtotime($line['expiryTime'] ?? '') : false;

    if (!$line || !in_array($state, PLAY_ENTITLED_STATES, true) || !$expiryTs || $expiryTs <= time()) {
        logApiCall('Play purchase not entitled', ['uid' => $uid, 'state' => $state, 'product' => $product], 'WARN');
        authJsonResponse(['success' => false, 'error' => 'This subscription is not active.'], 402);
    }

    // The purchase must have been made by this very user.
    $buyer = $sub['externalAccountIdentifiers']['obfuscatedExternalAccountId'] ?? '';
    if ($buyer !== '' && $buyer !== $uid) {
        logApiError('Play purchase belongs to a different account', ['uid' => $uid], 403);
        authJsonResponse(['success' => false, 'error' => 'This purchase belongs to another account.'], 403);
    }

    // 2. One purchase token <-> one Firebase user (stops sharing a subscription across accounts)
    $tokenId = hash('sha256', $token);
    $bound = firestoreGet($pid, 'play_purchases', $tokenId, $db);
    if ($bound['exists'] && ($bound['data']['userId'] ?? $uid) !== $uid) {
        logApiError('Play token already linked to another user', ['uid' => $uid], 409);
        authJsonResponse(['success' => false, 'error' => 'This purchase is already linked to another account.'], 409);
    }

    $planType = PLAY_PRODUCTS[$product];
    $expiryIso = gmdate('Y-m-d\TH:i:s\Z', $expiryTs);
    $orderId   = $sub['latestOrderId'] ?? ('play_' . substr($tokenId, 0, 20));

    firestoreSet($pid, 'play_purchases', $tokenId, [
        'userId'        => $uid,
        'productId'     => $product,
        'planType'      => $planType,
        'state'         => $state,
        'latestOrderId' => $orderId,
        'expiryTime'    => firestoreTimestamp($expiryIso),
        'updatedAt'     => FIRESTORE_NOW,
    ], $db, true);

    // 3. Grant VIP. Never shorten an access period the user already has (e.g. paid on the web).
    $user = firestoreGet($pid, 'users', $uid, $db);
    $currentEnd = $user['exists'] && !empty($user['data']['subscriptionEndDate'])
        ? strtotime((string)$user['data']['subscriptionEndDate']) : 0;
    $endTs = max($expiryTs, $currentEnd ?: 0);

    firestoreSet($pid, 'orders', $orderId, [
        'orderId'             => $orderId,
        'userId'              => $uid,
        'gateway'             => 'google_play',
        'planType'            => $planType,
        'currency'            => 'INR',
        'status'              => 'paid',
        'subscriptionEndDate' => firestoreTimestamp($expiryIso),
        'paidAt'              => FIRESTORE_NOW,
        'updatedAt'           => FIRESTORE_NOW,
        'processedBy'         => 'server',
        'source'              => 'play-verify',
    ], $db, true);

    $profile = [
        'isSubscribed'        => true,
        'subscriptionEndDate' => firestoreTimestamp(gmdate('Y-m-d\TH:i:s\Z', $endTs)),
        'lastOrderId'         => $orderId,
        'updatedAt'           => FIRESTORE_NOW,
    ];
    if ($endTs === $expiryTs) {
        $profile['planType'] = $planType;
        $profile['gateway']  = 'google_play';
    }
    if (!$bound['exists']) {
        $profile['subscriptionStartDate'] = FIRESTORE_NOW;
    }
    firestoreSet($pid, 'users', $uid, $profile, $db, true);

    // 4. Acknowledge (Google refunds unacknowledged purchases after 3 days)
    if (($sub['acknowledgementState'] ?? '') === 'ACKNOWLEDGEMENT_STATE_PENDING') {
        $ack = authHttpJson(
            'POST',
            "$base/purchases/subscriptions/" . rawurlencode($product) . '/tokens/' . rawurlencode($token) . ':acknowledge',
            ['developerPayload' => 'coloro'],
            $auth
        );
        if ($ack['status'] >= 300) {
            logApiError('Play acknowledge failed', ['http' => $ack['status'], 'body' => $ack['body']], 502);
        }
    }

    logApiCall('Play purchase verified', ['uid' => $uid, 'product' => $product, 'order' => $orderId, 'expiry' => $expiryIso]);
    authJsonResponse([
        'success'             => true,
        'planType'            => $planType,
        'subscriptionEndDate' => gmdate('Y-m-d\TH:i:s\Z', $endTs),
    ]);
} catch (Throwable $e) {
    logApiError('verify-play-purchase exception: ' . $e->getMessage(), [], 500);
    authJsonResponse(['success' => false, 'error' => 'Could not verify the purchase right now. Please try again.'], 500);
}
