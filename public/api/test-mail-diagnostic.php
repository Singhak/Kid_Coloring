<?php
/**
 * Coloro Transactional Email Server Diagnostic & Smoke Test
 *
 * Runs directly on the server to diagnose SMTP transport, socket connectivity,
 * credentials, and template rendering.
 *
 * Usage:
 *   1. CLI (SSH / Terminal on Hostinger):
 *        php test-mail-diagnostic.php [optional_to_email]
 *
 *   2. HTTP Web Browser / Curl:
 *        https://coloro.in/api/test-mail-diagnostic.php?secret=coloro_mail_test_2026&to=your_email@gmail.com
 *        https://coloro.in/api/test-mail-diagnostic.php?secret=coloro_mail_test_2026&dry_run=1
 */

declare(strict_types=1);

require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/mailer-helper.php';

$isCli = (php_sapi_name() === 'cli');
$testSecret = 'coloro_mail_test_2026';

if (!$isCli) {
    header('Content-Type: application/json; charset=UTF-8');
    header('Access-Control-Allow-Origin: *');

    $providedSecret = $_GET['secret'] ?? '';
    if (!hash_equals($testSecret, $providedSecret)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error'   => 'Unauthorized access. Provide valid ?secret=' . $testSecret
        ], JSON_PRETTY_PRINT);
        exit;
    }
}

$env = loadMailerEnv();
$toEmail = $isCli ? ($argv[1] ?? '') : ($_GET['to'] ?? '');
$isDryRun = $isCli ? in_array('--dry-run', $argv) : !empty($_GET['dry_run']);
$templateToTest = $isCli ? ($argv[2] ?? 'welcome-email') : ($_GET['template'] ?? 'welcome-email');

$report = [
    'timestamp'       => date('Y-m-d H:i:s T'),
    'environment'     => [
        'php_version'        => PHP_VERSION,
        'sapi'               => php_sapi_name(),
        'openssl_loaded'     => extension_loaded('openssl'),
        'sockets_available'  => function_exists('stream_socket_client'),
    ],
    'configuration'   => [
        'smtp_host'          => $env['SMTP_HOST'] ?? 'NOT SET',
        'smtp_port'          => $env['SMTP_PORT'] ?? 'NOT SET',
        'smtp_encryption'    => $env['SMTP_ENCRYPTION'] ?? 'NOT SET',
        'smtp_username'      => $env['SMTP_USERNAME'] ?? 'NOT SET',
        'smtp_password_set'  => !empty($env['SMTP_PASSWORD']),
        'mail_from_address'  => $env['MAIL_FROM_ADDRESS'] ?? 'NOT SET',
        'mail_from_name'     => $env['MAIL_FROM_NAME'] ?? 'NOT SET',
        'app_url'            => $env['APP_URL'] ?? 'NOT SET',
        'firebase_project'   => $env['FIREBASE_PROJECT_ID'] ?? 'NOT SET',
    ],
    'templates_check' => [],
    'smtp_socket_test'=> null,
    'mail_dispatch'   => null,
];

// ── 1. Check all Email Templates ───────────────────────────────────────────
$templateDir = __DIR__ . '/email-templates';
$expectedTemplates = [
    'welcome-email.html',
    'subscription-success.html',
    'subscription-expiry-7day.html',
    'subscription-expiry-1day.html',
    'user-inactive-7day.html',
    'weekly-drop-free.html',
    'weekly-drop-vip.html',
];

foreach ($expectedTemplates as $tplName) {
    $tplPath = $templateDir . '/' . $tplName;
    $exists = file_exists($tplPath);
    $size = $exists ? filesize($tplPath) : 0;
    
    $canRender = false;
    if ($exists) {
        try {
            $sampleHtml = renderEmailTemplate($tplPath, [
                '{{NAME}}'               => 'Test User',
                '{{APP_URL}}'            => 'https://coloro.in',
                '{{TRIAL_END_DATE}}'     => date('d M Y', strtotime('+15 days')),
                '{{ORDER_ID}}'           => 'order_diag_123',
                '{{PLAN_NAME}}'          => 'VIP Annual Pass',
                '{{AMOUNT_PAID}}'        => '₹999',
                '{{SUBSCRIPTION_END_DATE}}'=> date('d M Y', strtotime('+1 year')),
            ]);
            $canRender = strlen($sampleHtml) > 100;
        } catch (Throwable $e) {
            $canRender = false;
        }
    }

    $report['templates_check'][$tplName] = [
        'exists'     => $exists,
        'size_bytes' => $size,
        'rendered'   => $canRender,
    ];
}

// ── 2. Test Direct Socket & SMTP Handshake ─────────────────────────────────
$smtpHost   = $env['SMTP_HOST'] ?? 'smtp.hostinger.com';
$smtpPort   = (int)($env['SMTP_PORT'] ?? 465);
$encryption = strtolower($env['SMTP_ENCRYPTION'] ?? 'ssl');
$socketAddr = ($encryption === 'ssl') ? "ssl://{$smtpHost}:{$smtpPort}" : "tcp://{$smtpHost}:{$smtpPort}";

$socketStart = microtime(true);
$sslContext = stream_context_create([
    'ssl' => [
        'verify_peer'       => true,
        'verify_peer_name'  => true,
        'allow_self_signed' => false,
    ]
]);

$errno = 0;
$errstr = '';
$socket = @stream_socket_client($socketAddr, $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $sslContext);

if (!$socket) {
    $report['smtp_socket_test'] = [
        'success'      => false,
        'socket_addr'  => $socketAddr,
        'error_number' => $errno,
        'error_string' => $errstr,
    ];
} else {
    stream_set_timeout($socket, 10);
    $greeting = fgets($socket, 512);

    $sendCmd = function (string $cmd) use ($socket): string {
        fwrite($socket, $cmd . "\r\n");
        $res = '';
        while ($line = fgets($socket, 512)) {
            $res .= $line;
            if (strlen($line) >= 4 && $line[3] === ' ') break;
        }
        return $res;
    };

    $ehlo = $sendCmd("EHLO " . (gethostname() ?: 'coloro.in'));
    
    // Auth login check
    $authResp = $sendCmd("AUTH LOGIN");
    $userResp = $sendCmd(base64_encode($env['SMTP_USERNAME'] ?? ''));
    $passResp = $sendCmd(base64_encode($env['SMTP_PASSWORD'] ?? ''));

    $authenticated = str_starts_with($passResp, '235');
    $sendCmd("QUIT");
    @fclose($socket);

    $durationMs = round((microtime(true) - $socketStart) * 1000, 2);

    $report['smtp_socket_test'] = [
        'success'        => $authenticated,
        'socket_addr'    => $socketAddr,
        'latency_ms'     => $durationMs,
        'server_greeting'=> trim((string)$greeting),
        'authenticated'  => $authenticated,
        'auth_response'  => trim($passResp),
    ];
}

// ── 3. Optional Live Email Dispatch Test ───────────────────────────────────
if (!empty($toEmail) && !$isDryRun) {
    $smtpErr = null;
    $tplFile = str_ends_with($templateToTest, '.html') ? $templateToTest : ($templateToTest . '.html');
    $fullTplPath = $templateDir . '/' . $tplFile;

    if (!file_exists($fullTplPath)) {
        $fullTplPath = $templateDir . '/welcome-email.html';
    }

    $sampleHtml = renderEmailTemplate($fullTplPath, [
        '{{NAME}}'               => 'Diagnostic Inspector',
        '{{APP_URL}}'            => $env['APP_URL'] ?? 'https://coloro.in',
        '{{TRIAL_END_DATE}}'     => date('d M Y', strtotime('+15 days')),
        '{{ORDER_ID}}'           => 'order_test_diag_' . time(),
        '{{PLAN_NAME}}'          => 'VIP Annual Magic Pass',
        '{{AMOUNT_PAID}}'        => '₹999',
        '{{SUBSCRIPTION_END_DATE}}'=> date('d M Y', strtotime('+1 year')),
    ]);

    $dispatched = sendColoroMail(
        to: $toEmail,
        toName: 'Diagnostic Inspector',
        subject: "🎨 Coloro System Smoke Test [" . date('H:i:s') . "]",
        html: $sampleHtml,
        env: $env,
        errorOutput: $smtpErr
    );

    $report['mail_dispatch'] = [
        'attempted'  => true,
        'to'         => $toEmail,
        'template'   => basename($fullTplPath),
        'success'    => $dispatched,
        'error'      => $smtpErr,
    ];
} else {
    $report['mail_dispatch'] = [
        'attempted' => false,
        'reason'    => empty($toEmail) ? 'No recipient email provided (dry run mode)' : 'Dry run requested'
    ];
}

$overallSuccess = ($report['smtp_socket_test']['success'] ?? false) &&
    (!isset($report['mail_dispatch']['attempted']) || !$report['mail_dispatch']['attempted'] || ($report['mail_dispatch']['success'] ?? false));

$report['overall_status'] = $overallSuccess ? 'HEALTHY' : 'ATTENTION_REQUIRED';

if ($isCli) {
    echo "\n=== COLORO EMAIL DIAGNOSTIC REPORT ===\n";
    echo "Status        : " . ($overallSuccess ? "✅ HEALTHY" : "❌ ATTENTION_REQUIRED") . "\n";
    echo "SMTP Host     : " . $report['configuration']['smtp_host'] . ":" . $report['configuration']['smtp_port'] . " (" . $report['configuration']['smtp_encryption'] . ")\n";
    echo "SMTP User     : " . $report['configuration']['smtp_username'] . "\n";
    echo "Password Set  : " . ($report['configuration']['smtp_password_set'] ? "Yes" : "No") . "\n";
    echo "Socket Test   : " . (($report['smtp_socket_test']['success'] ?? false) ? "✅ Connected & Authenticated" : "❌ Failed") . "\n";
    if (!empty($report['smtp_socket_test']['latency_ms'])) {
        echo "Latency       : " . $report['smtp_socket_test']['latency_ms'] . " ms\n";
    }
    echo "\nTemplates Verified:\n";
    foreach ($report['templates_check'] as $name => $info) {
        echo "  - {$name}: " . ($info['exists'] && $info['rendered'] ? "✅ OK ({$info['size_bytes']} bytes)" : "❌ Missing or corrupt") . "\n";
    }
    if ($report['mail_dispatch']['attempted']) {
        echo "\nLive Dispatch:\n";
        echo "  - To: " . $report['mail_dispatch']['to'] . "\n";
        echo "  - Status: " . ($report['mail_dispatch']['success'] ? "✅ Dispatched Successfully" : "❌ Error: " . $report['mail_dispatch']['error']) . "\n";
    }
    echo "\n======================================\n";
} else {
    echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
