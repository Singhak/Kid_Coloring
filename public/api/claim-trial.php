<?php
/**
 * Coloro - Server-side free-trial claim (used for Google logins and legacy users).
 *
 * POST { idToken }   (Firebase ID token of the signed-in user)
 * Returns { trialEndDate, isNew }. A person (normalised email) gets the trial once.
 */
require_once __DIR__ . '/auth-helper.php';

initApiLogging('claim-trial.php');
authApiHeaders();

$input   = authReadJsonBody();
$idToken = (string)($input['idToken'] ?? '');
if ($idToken === '') {
    authJsonResponse(['error' => 'idToken is required.'], 400);
}

$env = loadMailerEnv();

try {
    $account = authVerifyIdToken($env, $idToken);
    if (!$account || $account['email'] === '') {
        authJsonResponse(['error' => 'Invalid or expired session.'], 401);
    }
    $fb    = authLoadFirebase($env);
    $trial = authClaimTrial($fb, $account['uid'], $account['email'], $account['displayName'], $account['photoUrl'], 'google');
    authJsonResponse(['success' => true] + $trial);
} catch (Throwable $e) {
    logApiError('claim-trial failed: ' . $e->getMessage(), [], 500);
    authJsonResponse(['error' => 'Server error.'], 500);
}
