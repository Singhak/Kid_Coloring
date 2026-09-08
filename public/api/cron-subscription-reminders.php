<?php
/**
 * Coloro Email Cron Job
 *
 * Runs daily via cron. Handles three reminder types:
 *   1. Subscription expiry 7-day warning  (sent when 7 days remain)
 *   2. Subscription expiry 1-day warning  (sent when 1 day remains)
 *   3. Inactive user "We Miss You"        (sent after 7 days of no login)
 *
 * Cron schedule (run daily at 9:00 AM IST = 3:30 AM UTC):
 *   30 3 * * * php /home/user/public_html/api/cron-subscription-reminders.php >> /home/user/cron.log 2>&1
 *
 * Required .env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_SERVICE_ACCOUNT_JSON (path to service account JSON)
 *   MAIL_FROM_ADDRESS   (e.g. noreply@coloro.in)
 *   MAIL_FROM_NAME      (e.g. Coloro Team)
 *   APP_URL             (e.g. https://coloro.in)
 *
 * Email delivery: Uses PHP mail() by default.
 * For production, swap sendReminderEmail() to use SMTP (PHPMailer/SendGrid/etc.)
 */

// ── Bootstrap ────────────────────────────────────────────────────────────────

// Prevent direct browser access
if (php_sapi_name() !== 'cli' && !isset($_GET['cron_secret'])) {
    http_response_code(403);
    exit('Forbidden');
}

// CLI secret check (optional) — set CRON_SECRET in .env for HTTP-triggered cron
if (php_sapi_name() !== 'cli') {
    $envPath = __DIR__ . '/.env';
    $env = @parse_ini_file($envPath, false, INI_SCANNER_RAW) ?: [];
    $expectedSecret = $env['CRON_SECRET'] ?? '';
    if ($expectedSecret && ($_GET['cron_secret'] ?? '') !== $expectedSecret) {
        http_response_code(403);
        exit('Forbidden');
    }
}

require_once __DIR__ . '/firebase-helper.php';

// Load .env
$envPaths = [__DIR__ . '/.env', __DIR__ . '/../.env', dirname(__DIR__) . '/.env'];
$env = [];
foreach ($envPaths as $path) {
    if (file_exists($path)) {
        $parsed = @parse_ini_file($path, false, INI_SCANNER_RAW);
        if ($parsed) { $env = array_merge($env, $parsed); break; }
    }
}

$projectId   = $env['FIREBASE_PROJECT_ID'] ?? 'kidscoloro';
$fromEmail   = $env['MAIL_FROM_ADDRESS']   ?? 'noreply@coloro.in';
$fromName    = $env['MAIL_FROM_NAME']      ?? 'Coloro Team';
$appUrl      = rtrim($env['APP_URL']       ?? 'https://coloro.in', '/');
$templateDir = __DIR__ . '/email-templates';

// ── Auth ─────────────────────────────────────────────────────────────────────

$sa = firebaseLoadServiceAccount($env);
if (!$sa) {
    logCron('ERROR', 'Service account not found — aborting.');
    exit(1);
}

$token = firebaseGetAccessToken($sa);
logCron('INFO', "Cron started — project: {$projectId}");

// ── Fetch users with active subscriptions ────────────────────────────────────

$users = firestoreQueryActiveSubscriptions($projectId, $token);
logCron('INFO', "Found " . count($users) . " active VIP users.");

$now          = new DateTimeImmutable('now', new DateTimeZone('Asia/Kolkata'));
$sent7day     = 0;
$sent1day     = 0;
$sentMissYou  = 0;
$errors       = 0;

foreach ($users as $userData) {
    $userId   = $userData['uid']               ?? '';
    $email    = $userData['email']             ?? '';
    $name     = $userData['displayName']       ?? 'Parent';
    $planType = $userData['planType']          ?? 'annual';
    $subEnd   = $userData['subscriptionEndDate'] ?? null; // RFC3339 string

    if (!$email || !$subEnd || !$userId) continue;

    try {
        $endDate  = new DateTimeImmutable($subEnd, new DateTimeZone('UTC'));
        $endDateIST = $endDate->setTimezone(new DateTimeZone('Asia/Kolkata'));

        // Calculate days until expiry (floor so we hit exactly 7 and 1)
        $diffSeconds = $endDate->getTimestamp() - $now->getTimestamp();
        $diffDays    = (int) floor($diffSeconds / 86400);

        $planLabel   = ($planType === 'monthly') ? 'Monthly' : 'Annual';
        $expiryStr   = $endDateIST->format('d M Y'); // e.g. "15 Sep 2026"
        $renewUrl    = $appUrl . '/#upgrade';
        $unsubUrl    = $appUrl . '/api/unsubscribe-reminders.php?uid=' . urlencode($userId);

        if ($diffDays === 7) {
            // ── 7-day reminder ─────────────────────────────────────────────
            $alreadySent = reminderAlreadySent($projectId, $userId, '7day', $token);
            if (!$alreadySent) {
                $html = buildEmail($templateDir . '/subscription-expiry-7day.html', [
                    '{{PARENT_NAME}}' => htmlspecialchars($name),
                    '{{EXPIRY_DATE}}' => $expiryStr,
                    '{{PLAN_TYPE}}'   => $planLabel,
                    '{{RENEW_URL}}'   => $renewUrl,
                    '{{UNSUBSCRIBE_URL}}' => $unsubUrl,
                ]);

                $ok = sendReminderEmail(
                    to: $email,
                    toName: $name,
                    subject: "⏳ Your Coloro VIP expires in 7 days — renew to keep the magic!",
                    html: $html,
                    fromEmail: $fromEmail,
                    fromName: $fromName
                );

                if ($ok) {
                    markReminderSent($projectId, $userId, '7day', $token);
                    $sent7day++;
                    logCron('INFO', "7-day reminder sent to {$email}");
                } else {
                    $errors++;
                    logCron('ERROR', "Failed to send 7-day reminder to {$email}");
                }
            } else {
                logCron('DEBUG', "7-day reminder already sent to {$email} — skipping");
            }

        } elseif ($diffDays === 1) {
            // ── 1-day reminder ─────────────────────────────────────────────
            $alreadySent = reminderAlreadySent($projectId, $userId, '1day', $token);
            if (!$alreadySent) {
                $html = buildEmail($templateDir . '/subscription-expiry-1day.html', [
                    '{{PARENT_NAME}}' => htmlspecialchars($name),
                    '{{EXPIRY_DATE}}' => $expiryStr,
                    '{{PLAN_TYPE}}'   => $planLabel,
                    '{{RENEW_URL}}'   => $renewUrl,
                    '{{UNSUBSCRIBE_URL}}' => $unsubUrl,
                ]);

                $ok = sendReminderEmail(
                    to: $email,
                    toName: $name,
                    subject: "🚨 LAST CHANCE! Your Coloro VIP expires TOMORROW — renew now!",
                    html: $html,
                    fromEmail: $fromEmail,
                    fromName: $fromName
                );

                if ($ok) {
                    markReminderSent($projectId, $userId, '1day', $token);
                    $sent1day++;
                    logCron('INFO', "1-day URGENT reminder sent to {$email}");
                } else {
                    $errors++;
                    logCron('ERROR', "Failed to send 1-day reminder to {$email}");
                }
            } else {
                logCron('DEBUG', "1-day reminder already sent to {$email} — skipping");
            }
        }

    } catch (Throwable $e) {
        $errors++;
        logCron('ERROR', "Exception for user {$userId}: " . $e->getMessage());
    }
}

logCron('INFO', "Subscription reminders done — 7-day: {$sent7day}, 1-day: {$sent1day}, errors: {$errors}");

// ── Fetch ALL users for inactive check ───────────────────────────────────────

$allUsers = firestoreQueryAllUsers($projectId, $token);
logCron('INFO', "Found " . count($allUsers) . " total users to check for inactivity.");

foreach ($allUsers as $userData) {
    $userId      = $userData['uid']         ?? '';
    $email       = $userData['email']       ?? '';
    $name        = $userData['displayName'] ?? 'Parent';
    $lastLoginAt = $userData['lastLoginAt'] ?? null; // RFC3339 string

    if (!$email || !$lastLoginAt || !$userId) continue;

    try {
        $lastLogin   = new DateTimeImmutable($lastLoginAt, new DateTimeZone('UTC'));
        $daysSinceLogin = (int) floor(($now->getTimestamp() - $lastLogin->getTimestamp()) / 86400);

        // Send only when user has been inactive for exactly 7 days
        if ($daysSinceLogin >= 7 && $daysSinceLogin < 8) {
            $lastSeenStr = $lastLogin->setTimezone(new DateTimeZone('Asia/Kolkata'))->format('d M Y');
            $unsubUrl    = $appUrl . '/api/unsubscribe-reminders.php?uid=' . urlencode($userId);

            $alreadySent = reminderAlreadySent($projectId, $userId, 'missyou', $token);
            if (!$alreadySent) {
                $html = buildEmail($templateDir . '/user-inactive-7day.html', [
                    '{{PARENT_NAME}}'    => htmlspecialchars($name),
                    '{{CHILD_NAME}}'     => htmlspecialchars($name), // personalise if child name stored separately
                    '{{LAST_SEEN_DATE}}' => $lastSeenStr,
                    '{{APP_URL}}'        => $appUrl,
                    '{{UNSUBSCRIBE_URL}}' => $unsubUrl,
                ]);

                $ok = sendReminderEmail(
                    to: $email,
                    toName: $name,
                    subject: "🎨 We miss your little artist at Coloro! Come back and create!",
                    html: $html,
                    fromEmail: $fromEmail,
                    fromName: $fromName
                );

                if ($ok) {
                    markReminderSent($projectId, $userId, 'missyou', $token);
                    $sentMissYou++;
                    logCron('INFO', "We-miss-you sent to {$email} (inactive {$daysSinceLogin} days)");
                } else {
                    $errors++;
                    logCron('ERROR', "Failed to send we-miss-you to {$email}");
                }
            } else {
                logCron('DEBUG', "We-miss-you already sent to {$email} — skipping");
            }
        }

    } catch (Throwable $e) {
        $errors++;
        logCron('ERROR', "Inactive check exception for {$userId}: " . $e->getMessage());
    }
}

logCron('INFO', "Cron complete — 7-day: {$sent7day}, 1-day: {$sent1day}, we-miss-you: {$sentMissYou}, errors: {$errors}");
exit(0);


// ═══════════════════════════════════════════════════════════════════════════
// ── Helper Functions ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query Firestore for ALL users (no filter) — used for inactivity check.
 *
 * @param  string $projectId
 * @param  string $token       OAuth2 Bearer token
 * @return array               Array of user data arrays
 */
function firestoreQueryAllUsers(string $projectId, string $token): array
{
    $url = sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents:runQuery',
        rawurlencode($projectId)
    );

    $query = [
        'structuredQuery' => [
            'from'  => [['collectionId' => 'users']],
            'limit' => 2000, // adjust if you have more users
        ]
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($query),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $raw  = curl_exec($ch);
    $err  = curl_error($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err || $http !== 200) {
        logCron('ERROR', "All-users query failed HTTP {$http}: " . substr($raw ?? '', 0, 200));
        return [];
    }

    $results = json_decode($raw, true) ?? [];
    $users   = [];

    foreach ($results as $item) {
        if (empty($item['document']['fields'])) continue;
        $data      = firestoreFieldsToPhp($item['document']['fields']);
        $nameParts = explode('/', $item['document']['name'] ?? '');
        $docId     = end($nameParts);
        if (empty($data['uid'])) $data['uid'] = $docId;
        $users[] = $data;
    }

    return $users;
}

/**
 * Query Firestore for all users where isSubscribed == true.
 * Uses the Firestore REST runQuery endpoint.
 *
 * @param  string $projectId
 * @param  string $token       OAuth2 Bearer token
 * @return array               Array of user data arrays
 */
function firestoreQueryActiveSubscriptions(string $projectId, string $token): array
{
    $url = sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents:runQuery',
        rawurlencode($projectId)
    );

    $query = [
        'structuredQuery' => [
            'from'  => [['collectionId' => 'users']],
            'where' => [
                'fieldFilter' => [
                    'field'  => ['fieldPath' => 'isSubscribed'],
                    'op'     => 'EQUAL',
                    'value'  => ['booleanValue' => true],
                ]
            ],
            'limit' => 1000,
        ]
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($query),
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $raw  = curl_exec($ch);
    $err  = curl_error($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err || $http !== 200) {
        logCron('ERROR', "Firestore query failed HTTP {$http}: " . substr($raw ?? '', 0, 200));
        return [];
    }

    $results = json_decode($raw, true) ?? [];
    $users   = [];

    foreach ($results as $item) {
        if (empty($item['document']['fields'])) continue;
        $data = firestoreFieldsToPhp($item['document']['fields']);

        // Extract document ID (uid) from the name path
        $nameParts = explode('/', $item['document']['name'] ?? '');
        $docId     = end($nameParts);
        if (empty($data['uid'])) $data['uid'] = $docId;

        // subscriptionEndDate is returned as RFC3339 timestamp string
        $users[] = $data;
    }

    return $users;
}

/**
 * Check if a reminder of this type was already sent to prevent duplicates.
 * Reads users/{uid}/remindersSent/{type} flag from Firestore.
 */
function reminderAlreadySent(string $projectId, string $userId, string $type, string $token): bool
{
    $url = sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/users/%s',
        rawurlencode($projectId),
        rawurlencode($userId)
    );

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPGET        => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $raw  = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http !== 200) return false;

    $doc  = json_decode($raw, true);
    $data = firestoreFieldsToPhp($doc['fields'] ?? []);
    $sent = $data['remindersSent'] ?? [];

    // Key: reminder_{type}_{cycle} where cycle is subscriptionEndDate (prevents re-send next cycle)
    $endDate = $data['subscriptionEndDate'] ?? '';
    $key     = 'reminder_' . $type . '_' . substr($endDate, 0, 10); // e.g. reminder_7day_2026-09-15

    return !empty($sent[$key]);
}

/**
 * Mark reminder as sent in Firestore so we don't double-send.
 */
function markReminderSent(string $projectId, string $userId, string $type, string $token): void
{
    // We need to know the subscriptionEndDate to key the flag
    $url = sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/users/%s',
        rawurlencode($projectId),
        rawurlencode($userId)
    );

    // Read current doc to get subscriptionEndDate
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPGET        => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $raw  = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http !== 200) return;

    $doc     = json_decode($raw, true);
    $data    = firestoreFieldsToPhp($doc['fields'] ?? []);
    $endDate = $data['subscriptionEndDate'] ?? gmdate('Y-m-d');
    $key     = 'reminder_' . $type . '_' . substr($endDate, 0, 10);

    // Merge the flag into remindersSent map
    firestoreSet($projectId, 'users', $userId, [
        'remindersSent' => array_merge($data['remindersSent'] ?? [], [$key => true]),
    ], $token, true);
}

/**
 * Load HTML email template and replace {{VARIABLE}} placeholders.
 */
function buildEmail(string $templatePath, array $vars): string
{
    if (!file_exists($templatePath)) {
        logCron('ERROR', "Template not found: {$templatePath}");
        return '<p>Reminder email content unavailable.</p>';
    }
    $html = file_get_contents($templatePath);
    return str_replace(array_keys($vars), array_values($vars), $html);
}

/**
 * Send HTML email via PHP mail().
 * For production, replace with PHPMailer + SMTP or an API like SendGrid/Mailgun.
 *
 * @return bool true on success
 */
function sendReminderEmail(
    string $to,
    string $toName,
    string $subject,
    string $html,
    string $fromEmail,
    string $fromName
): bool {
    $boundary = md5(uniqid('coloro_', true));
    $plain    = strip_tags(preg_replace('/<style[^>]*>.*?<\/style>/si', '', $html));
    $plain    = wordwrap(trim(preg_replace('/\s+/', ' ', $plain)), 76, "\r\n", false);

    $headers  = implode("\r\n", [
        "MIME-Version: 1.0",
        "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
        "From: {$fromName} <{$fromEmail}>",
        "Reply-To: {$fromEmail}",
        "X-Mailer: Coloro-PHP-Mailer/1.0",
        "X-Priority: 1 (Highest)",
        "X-MSMail-Priority: High",
    ]);

    $body = implode("\r\n", [
        "--{$boundary}",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: quoted-printable",
        "",
        quoted_printable_encode($plain),
        "",
        "--{$boundary}",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: quoted-printable",
        "",
        quoted_printable_encode($html),
        "",
        "--{$boundary}--",
    ]);

    $toHeader = $toName ? "{$toName} <{$to}>" : $to;

    return mail($toHeader, $subject, $body, $headers);
}

/**
 * Simple cron logger — outputs to stdout (which cron redirects to log file).
 */
function logCron(string $level, string $message): void
{
    $ts = date('Y-m-d H:i:s');
    echo "[{$ts}] [{$level}] {$message}\n";
}
