<?php
/**
 * Coloro Weekly Drop Email Dispatcher
 *
 * Runs every Monday at 9:00 AM IST.
 * Dispatches:
 *   - weekly-drop-vip.html  to all active VIP members (Priority Early Access celebration)
 *   - weekly-drop-free.html to all registered free users (Teaser + 15-day free trial activation)
 *
 * Can be triggered via:
 *   1. CLI: php cron-weekly-drop-email.php
 *   2. HTTP: https://coloro.in/api/cron-weekly-drop-email.php?secret=YOUR_CRON_SECRET
 */

declare(strict_types=1);

date_default_timezone_set('Asia/Kolkata');

// ── Security & Environment ───────────────────────────────────────────────────

$envFile = __DIR__ . '/.env';
$env = [];
if (is_readable($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (str_contains($line, '=')) {
            [$k, $v] = explode('=', $line, 2);
            $env[trim($k)] = trim(trim($v), '"\'');
        }
    }
}

$isCli = (php_sapi_name() === 'cli');

if (!$isCli) {
    header('Content-Type: application/json; charset=utf-8');
    $secret = $_GET['secret'] ?? '';
    $expectedSecret = $env['CRON_SECRET'] ?? 'coloro_weekly_drop_secret_2026';

    if (!hash_equals($expectedSecret, $secret)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized access. Valid secret required.']);
        exit;
    }
}

require_once __DIR__ . '/firebase-helper.php';

// ── Configuration & Drop Catalog ─────────────────────────────────────────────

$projectId   = $env['FIREBASE_PROJECT_ID']  ?? 'kidcoloring-52ba7';
$appUrl      = rtrim($env['APP_URL']        ?? 'https://coloro.in', '/');
$fromEmail   = $env['MAIL_FROM_ADDRESS']    ?? 'noreply@coloro.in';
$fromName    = $env['MAIL_FROM_NAME']       ?? 'Coloro Team';
$templateDir = __DIR__ . '/email-templates';
$logFile     = __DIR__ . '/cron_weekly_drops.log';

function logDrop(string $level, string $msg): void {
    global $logFile, $isCli;
    $time = date('Y-m-d H:i:s T');
    $entry = "[{$time}] [{$level}] {$msg}\n";
    file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    if ($isCli) {
        echo $entry;
    }
}

// 6 Curated Drops (cycles 1..52)
$dropsCatalog = [
    [
        'name' => 'Galactic Rocket & Alien Planets',
        'desc' => 'Blast off into outer space! Color a cosmic rocket cruising past smiling alien moons and sparkling stars.'
    ],
    [
        'name' => 'Enchanted Fairy Treehouse',
        'desc' => 'Explore a glowing secret fairy forest! Color a cozy woodland treehouse with flower chimneys and singing birds.'
    ],
    [
        'name' => 'Deep Sea Turtle & Coral Reef',
        'desc' => 'Dive under blue ocean waves! Color a gentle giant sea turtle gliding over colorful coral and swirling fish.'
    ],
    [
        'name' => 'Baby T-Rex Volcano Valley',
        'desc' => 'Travel back in time! Color a playful baby Tyrannosaurus exploring giant ferns near a friendly smoking volcano.'
    ],
    [
        'name' => 'Magical Flying Unicorn',
        'desc' => 'Fly above the clouds! Color an exquisite winged Pegasus unicorn soaring past fluffy rainbow cloud castles.'
    ],
    [
        'name' => 'Supercharged Cyber Racer',
        'desc' => 'Rev up creative engines! Color a futuristic lightning-fast hypercar zooming past victory flags.'
    ]
];

$now = new DateTimeImmutable('now', new DateTimeZone('Asia/Kolkata'));
$weekNumber = (int) $now->format('W');
$dropIndex = ($weekNumber - 1) % count($dropsCatalog);
$activeDrop = $dropsCatalog[$dropIndex];

// Calculate days until free release (30 days minus days elapsed since Monday)
$dayOfWeek = (int) $now->format('N'); // 1 = Mon, 7 = Sun
$daysSinceMon = $dayOfWeek - 1;
$daysUntilFree = max(1, 30 - $daysSinceMon);

logDrop('INFO', "Weekly Drop Cron started. Week #{$weekNumber} — Featured: {$activeDrop['name']}");

// ── Authenticate Firebase ────────────────────────────────────────────────────

$sa = firebaseLoadServiceAccount($env);
if (!$sa) {
    logDrop('ERROR', 'Service account could not be loaded.');
    if (!$isCli) echo json_encode(['success' => false, 'error' => 'Service account missing']);
    exit(1);
}

$token = firebaseGetAccessToken($sa);

// ── Query All Users from Firestore ───────────────────────────────────────────

function fetchAllColoroUsers(string $projectId, string $token): array {
    $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/users?pageSize=300";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer {$token}",
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status !== 200 || !$resp) {
        return [];
    }

    $data = json_decode($resp, true);
    if (!isset($data['documents'])) {
        return [];
    }

    $users = [];
    foreach ($data['documents'] as $doc) {
        $fields = $doc['fields'] ?? [];
        $email = $fields['email']['stringValue'] ?? '';
        if (!$email) continue;

        $uid = $fields['uid']['stringValue'] ?? basename($doc['name']);
        $displayName = $fields['displayName']['stringValue'] ?? 'Parent';
        $isPro = (bool)($fields['isPro']['booleanValue'] ?? false);
        $unsub = (bool)($fields['unsubscribedFromWeeklyDrops']['booleanValue'] ?? false);

        $users[] = [
            'uid' => $uid,
            'email' => $email,
            'displayName' => $displayName,
            'isPro' => $isPro,
            'unsubscribed' => $unsub,
        ];
    }

    return $users;
}

$allUsers = fetchAllColoroUsers($projectId, $token);
logDrop('INFO', "Total users retrieved: " . count($allUsers));

$sentVip = 0;
$sentFree = 0;
$skipped = 0;
$failed = 0;

$vipTemplatePath  = $templateDir . '/weekly-drop-vip.html';
$freeTemplatePath = $templateDir . '/weekly-drop-free.html';

$vipTemplateHtml  = is_readable($vipTemplatePath)  ? file_get_contents($vipTemplatePath)  : '';
$freeTemplateHtml = is_readable($freeTemplatePath) ? file_get_contents($freeTemplatePath) : '';

foreach ($allUsers as $u) {
    if ($u['unsubscribed']) {
        $skipped++;
        continue;
    }

    $email = $u['email'];
    $name = !empty($u['displayName']) ? $u['displayName'] : 'Parent';
    $unsubUrl = $appUrl . '/api/unsubscribe-reminders.php?uid=' . urlencode($u['uid']) . '&type=weekly';

    if ($u['isPro']) {
        // ── Send VIP Celebration ─────────────────────────────────────────────
        $subject = "🎨 New VIP Drawing Dropped: {$activeDrop['name']}!";
        $html = str_replace(
            ['{{NAME}}', '{{WEEK_NUMBER}}', '{{DRAWING_NAME}}', '{{DRAWING_DESC}}', '{{APP_URL}}', '{{UNSUBSCRIBE_URL}}'],
            [htmlspecialchars($name), $weekNumber, htmlspecialchars($activeDrop['name']), htmlspecialchars($activeDrop['desc']), $appUrl, $unsubUrl],
            $vipTemplateHtml
        );

        $ok = sendSmtpEmail($email, $name, $subject, $html, $fromEmail, $fromName, $env);
        if ($ok) {
            $sentVip++;
            logDrop('INFO', "Sent VIP Weekly Drop to {$email}");
        } else {
            $failed++;
            logDrop('ERROR', "Failed to send VIP Weekly Drop to {$email}");
        }
    } else {
        // ── Send Free Teaser & Trial Invite ──────────────────────────────────
        $subject = "🌟 New Weekly Coloring Page: {$activeDrop['name']} Just Landed!";
        $trialUrl = $appUrl . '/#upgrade';
        $html = str_replace(
            ['{{NAME}}', '{{WEEK_NUMBER}}', '{{DRAWING_NAME}}', '{{DRAWING_DESC}}', '{{DAYS_UNTIL_FREE}}', '{{TRIAL_URL}}', '{{APP_URL}}', '{{UNSUBSCRIBE_URL}}'],
            [htmlspecialchars($name), $weekNumber, htmlspecialchars($activeDrop['name']), htmlspecialchars($activeDrop['desc']), $daysUntilFree, $trialUrl, $appUrl, $unsubUrl],
            $freeTemplateHtml
        );

        $ok = sendSmtpEmail($email, $name, $subject, $html, $fromEmail, $fromName, $env);
        if ($ok) {
            $sentFree++;
            logDrop('INFO', "Sent Free Teaser Drop to {$email}");
        } else {
            $failed++;
            logDrop('ERROR', "Failed to send Free Teaser Drop to {$email}");
        }
    }

    // Rate limiting (200ms sleep = max 5 emails/sec to respect SMTP limits)
    usleep(200000);
}

logDrop('INFO', "Weekly Drop Completed. VIP Sent: {$sentVip}, Free Sent: {$sentFree}, Skipped: {$skipped}, Failed: {$failed}");

if (!$isCli) {
    echo json_encode([
        'success' => true,
        'week' => $weekNumber,
        'drop' => $activeDrop['name'],
        'sentVip' => $sentVip,
        'sentFree' => $sentFree,
        'skipped' => $skipped,
        'failed' => $failed,
    ]);
}

// ── Native SMTP Sender ───────────────────────────────────────────────────────

function sendSmtpEmail(
    string $to,
    string $toName,
    string $subject,
    string $html,
    string $fromEmail,
    string $fromName,
    array $env
): bool {
    $smtpHost       = $env['SMTP_HOST']       ?? 'smtp.hostinger.com';
    $smtpPort       = (int)($env['SMTP_PORT'] ?? 465);
    $smtpEncryption = strtolower($env['SMTP_ENCRYPTION'] ?? 'ssl');
    $smtpUser       = $env['SMTP_USERNAME']   ?? $fromEmail;
    $smtpPass       = $env['SMTP_PASSWORD']   ?? '';

    if (empty($smtpPass)) {
        // If SMTP pass is not configured, avoid erroring out
        return false;
    }

    $boundary = md5(uniqid('coloro_drop_', true));
    $plain    = strip_tags(preg_replace('/<style[^>]*>.*?<\/style>/si', '', $html));
    $plain    = wordwrap(trim(preg_replace('/\s+/', ' ', $plain)), 76, "\r\n", false);

    $toHeader   = $toName ? "{$toName} <{$to}>" : $to;
    $fromHeader = $fromName ? "{$fromName} <{$fromEmail}>" : $fromEmail;
    $date       = date('r');

    $message = implode("\r\n", [
        "Date: {$date}",
        "To: {$toHeader}",
        "From: {$fromHeader}",
        "Reply-To: {$fromEmail}",
        "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
        "MIME-Version: 1.0",
        "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
        "X-Mailer: Coloro-Weekly-Drop/1.0",
        "",
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

    try {
        $socketAddress = ($smtpEncryption === 'ssl') ? "ssl://{$smtpHost}:{$smtpPort}" : "tcp://{$smtpHost}:{$smtpPort}";
        $ctx = stream_context_create([
            'ssl' => [
                'verify_peer'       => true,
                'verify_peer_name'  => true,
                'allow_self_signed' => false,
            ],
        ]);

        $socket = @stream_socket_client($socketAddress, $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
        if (!$socket) return false;

        stream_set_timeout($socket, 10);
        $read = fgets($socket, 512);

        $clientHost = gethostname() ?: 'coloro.in';
        fputs($socket, "EHLO {$clientHost}\r\n");
        while ($line = fgets($socket, 512)) {
            if (substr($line, 3, 1) === ' ') break;
        }

        fputs($socket, "AUTH LOGIN\r\n");
        fgets($socket, 512);
        fputs($socket, base64_encode($smtpUser) . "\r\n");
        fgets($socket, 512);
        fputs($socket, base64_encode($smtpPass) . "\r\n");
        $authResp = fgets($socket, 512);
        if (!str_starts_with((string)$authResp, '235')) {
            fclose($socket);
            return false;
        }

        fputs($socket, "MAIL FROM:<{$fromEmail}>\r\n");
        fgets($socket, 512);
        fputs($socket, "RCPT TO:<{$to}>\r\n");
        fgets($socket, 512);
        fputs($socket, "DATA\r\n");
        fgets($socket, 512);

        fputs($socket, $message . "\r\n.\r\n");
        $dataResp = fgets($socket, 512);

        fputs($socket, "QUIT\r\n");
        fclose($socket);

        return str_starts_with((string)$dataResp, '250');
    } catch (\Throwable $t) {
        return false;
    }
}
