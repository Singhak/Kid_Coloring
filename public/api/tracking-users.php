<?php
/**
 * Coloro Analytics - resolve signed-in user ids to a name / email for the admin dashboard.
 *
 * Telemetry only stores the Firebase uid. Names and emails are looked up from
 * Firestore users/{uid} on the server (so they cannot be spoofed by a client) and
 * cached in SQLite (tracking_users) so the dashboard stays fast.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'tracking-users.php') {
    http_response_code(403);
    exit;
}

const TRACKING_USER_TTL_FOUND     = 7 * 86400; // refresh known profiles weekly
const TRACKING_USER_TTL_MISSING   = 3600;      // retry unknown profiles hourly
const TRACKING_USER_MAX_LOOKUPS   = 25;        // Firestore reads per dashboard request

/**
 * @param  string[] $userIds Firebase uids
 * @return array<string, array{name: ?string, email: ?string}>
 */
function trackingResolveUsers(PDO $pdo, array $userIds): array
{
    $result = [];
    if (!$userIds) return $result;

    $now  = time();
    $stale = [];
    $stmt = $pdo->prepare('SELECT user_id, name, email, found, fetched_at FROM tracking_users WHERE user_id = ?');
    foreach ($userIds as $uid) {
        $stmt->execute([$uid]);
        $row = $stmt->fetch();
        if ($row) {
            $result[$uid] = ['name' => $row['name'], 'email' => $row['email']];
            $ttl = $row['found'] ? TRACKING_USER_TTL_FOUND : TRACKING_USER_TTL_MISSING;
            if ($now - (int)$row['fetched_at'] < $ttl) continue;
        }
        $stale[] = $uid;
    }
    if (!$stale) return $result;

    try {
        require_once __DIR__ . '/mailer-helper.php';
        require_once __DIR__ . '/firebase-helper.php';
        $env = loadMailerEnv();
        $sa  = firebaseLoadServiceAccount($env);
        if (!$sa) return $result;
        $projectId = $env['FIREBASE_PROJECT_ID'] ?? $sa['project_id'];
        $token     = firebaseGetAccessToken($sa);
    } catch (Throwable $e) {
        error_log('[tracking-users] firebase setup failed: ' . $e->getMessage());
        return $result;
    }

    $upsert = $pdo->prepare('
        INSERT INTO tracking_users (user_id, name, email, found, fetched_at) VALUES (:id, :name, :email, :found, :now)
        ON CONFLICT(user_id) DO UPDATE SET name = :name, email = :email, found = :found, fetched_at = :now
    ');
    foreach (array_slice($stale, 0, TRACKING_USER_MAX_LOOKUPS) as $uid) {
        try {
            $doc  = firestoreGet($projectId, 'users', $uid, $token);
            $data = $doc['data'];
            $name  = $doc['exists'] ? (($data['displayName'] ?? '') ?: null) : null;
            $email = $doc['exists'] ? (($data['email'] ?? '') ?: null) : null;
            $upsert->execute([':id' => $uid, ':name' => $name, ':email' => $email, ':found' => $doc['exists'] ? 1 : 0, ':now' => $now]);
            $result[$uid] = ['name' => $name, 'email' => $email];
        } catch (Throwable $e) {
            error_log('[tracking-users] lookup failed for ' . $uid . ': ' . $e->getMessage());
        }
    }
    return $result;
}
