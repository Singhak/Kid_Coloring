<?php
/**
 * Coloro Transactional Email & SMTP Helper
 *
 * Provides shared, native SMTP email dispatching via Hostinger SMTP or any standard
 * SMTP server without requiring external Composer packages.
 *
 * Capabilities:
 * - Native socket connection with SSL (port 465) or STARTTLS (port 587)
 * - AUTH LOGIN authentication
 * - RFC 2822 compliant MIME multipart/alternative messages (HTML + plain text fallback)
 * - Safe environment variable discovery (.env + server env)
 * - Clean HTML template rendering with variable interpolation
 * - Integration with Coloro centralized logger
 */

// Guard against direct browser access
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'mailer-helper.php') {
    http_response_code(403);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['error' => 'Direct access forbidden']);
    exit;
}

if (!function_exists('loadMailerEnv')) {
    /**
     * Load environment variables safely from .env files or server environment.
     *
     * @return array
     */
    function loadMailerEnv(): array
    {
        $envPaths = [
            __DIR__ . '/../.env',
            __DIR__ . '/.env',
            dirname(__DIR__) . '/.env'
        ];

        $env = [];
        foreach ($envPaths as $path) {
            if (file_exists($path)) {
                $parsed = @parse_ini_file($path, false, INI_SCANNER_RAW);
                if ($parsed === false) {
                    $parsed = [];
                    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                    if ($lines) {
                        foreach ($lines as $line) {
                            $line = trim($line);
                            if ($line === '' || $line[0] === '#') continue;
                            $eqPos = strpos($line, '=');
                            if ($eqPos === false) continue;
                            $key = trim(substr($line, 0, $eqPos));
                            $val = trim(substr($line, $eqPos + 1));
                            if ($val !== '' && $val[0] !== '"' && $val[0] !== "'") {
                                $commentPos = strpos($val, ' #');
                                if ($commentPos !== false) {
                                    $val = trim(substr($val, 0, $commentPos));
                                }
                            }
                            if (strlen($val) >= 2 &&
                                (($val[0] === '"' && $val[-1] === '"') ||
                                 ($val[0] === "'" && $val[-1] === "'"))) {
                                $val = substr($val, 1, -1);
                            }
                            if ($key !== '') {
                                $parsed[$key] = $val;
                            }
                        }
                    }
                }
                if ($parsed) {
                    $env = array_merge($env, $parsed);
                }
            }
        }

        // Overlay with $_SERVER / getenv() if present
        $knownKeys = [
            'SMTP_HOST', 'SMTP_PORT', 'SMTP_ENCRYPTION', 'SMTP_USERNAME', 'SMTP_PASSWORD',
            'MAIL_FROM_ADDRESS', 'MAIL_FROM_NAME', 'APP_URL', 'FIREBASE_PROJECT_ID',
            'FIREBASE_SERVICE_ACCOUNT_JSON'
        ];

        foreach ($knownKeys as $k) {
            if (!empty($_SERVER[$k])) {
                $env[$k] = $_SERVER[$k];
            } elseif (!empty($_SERVER['REDIRECT_' . $k])) {
                $env[$k] = $_SERVER['REDIRECT_' . $k];
            } elseif (($v = getenv($k)) !== false && $v !== '') {
                $env[$k] = $v;
            }
        }

        return $env;
    }
}

if (!function_exists('renderEmailTemplate')) {
    /**
     * Load an HTML email template and substitute placeholder tokens.
     *
     * @param  string $templatePath Absolute path to template HTML file
     * @param  array  $replacements Key-value map (e.g. ['{{NAME}}' => 'John'])
     * @return string               Interpolated HTML content
     */
    function renderEmailTemplate(string $templatePath, array $replacements): string
    {
        if (!file_exists($templatePath) || !is_readable($templatePath)) {
            throw new RuntimeException("Email template not found or not readable: " . basename($templatePath));
        }

        $html = file_get_contents($templatePath);
        if ($html === false) {
            throw new RuntimeException("Failed to read email template: " . basename($templatePath));
        }

        return str_replace(array_keys($replacements), array_values($replacements), $html);
    }
}

if (!function_exists('sendColoroMail')) {
    /**
     * Send an email using native PHP socket SMTP (SSL/TLS).
     *
     * @param string      $to          Recipient email address
     * @param string      $toName      Recipient display name (optional)
     * @param string      $subject     Email subject line
     * @param string      $html        HTML content body
     * @param array|null  $env         Optional preloaded environment config
     * @param string|null $errorOutput Reference to capture error message on failure
     * @return bool                    True on successful SMTP delivery, false otherwise
     */
    function sendColoroMail(
        string $to,
        string $toName,
        string $subject,
        string $html,
        ?array $env = null,
        ?string &$errorOutput = null
    ): bool {
        if (!$env) {
            $env = loadMailerEnv();
        }

        $cleanTo = trim($to);
        if (!filter_var($cleanTo, FILTER_VALIDATE_EMAIL)) {
            $errorOutput = "Invalid recipient email address: {$to}";
            if (function_exists('logApiError')) {
                logApiError($errorOutput, ['to' => $to]);
            }
            return false;
        }

        $smtpHost       = $env['SMTP_HOST']       ?? 'smtp.hostinger.com';
        $smtpPort       = (int)($env['SMTP_PORT'] ?? 465);
        $smtpEncryption = strtolower($env['SMTP_ENCRYPTION'] ?? 'ssl');
        $fromEmail      = $env['MAIL_FROM_ADDRESS'] ?? ($env['SMTP_USERNAME'] ?? 'noreply@coloro.in');
        $fromName       = $env['MAIL_FROM_NAME']    ?? 'Coloro Team';
        $smtpUser       = $env['SMTP_USERNAME']     ?? $fromEmail;
        $smtpPass       = $env['SMTP_PASSWORD']     ?? '';

        if (empty($smtpPass)) {
            $errorOutput = 'SMTP_PASSWORD is not configured in environment.';
            if (function_exists('logApiError')) {
                logApiError($errorOutput);
            }
            return false;
        }

        // Clean recipient and sender headers
        $cleanToName = preg_replace('/[\r\n]+/', '', trim($toName));
        $cleanFromName = preg_replace('/[\r\n]+/', '', trim($fromName));
        $toHeader = $cleanToName ? "=?UTF-8?B?" . base64_encode($cleanToName) . "?= <{$cleanTo}>" : $cleanTo;
        $fromHeader = $cleanFromName ? "=?UTF-8?B?" . base64_encode($cleanFromName) . "?= <{$fromEmail}>" : $fromEmail;

        // Create plain text alternative
        $plain = strip_tags(preg_replace('/<style[^>]*>.*?<\/style>/si', '', $html));
        $plain = wordwrap(trim(preg_replace('/\s+/', ' ', $plain)), 76, "\r\n", false);

        $boundary = '=_coloro_' . md5(uniqid((string)mt_rand(), true));
        $dateStr = date('r');

        // Assemble RFC 2822 MIME message
        $headers = [
            "Date: {$dateStr}",
            "To: {$toHeader}",
            "From: {$fromHeader}",
            "Reply-To: {$fromEmail}",
            "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
            "MIME-Version: 1.0",
            "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
            "X-Mailer: Coloro-Mailer/1.0",
        ];

        $bodyLines = [
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
            ""
        ];

        $fullMessage = implode("\r\n", $headers) . "\r\n\r\n" . implode("\r\n", $bodyLines);

        // Connect via socket
        $socketAddress = ($smtpEncryption === 'ssl') ? "ssl://{$smtpHost}:{$smtpPort}" : "tcp://{$smtpHost}:{$smtpPort}";
        $sslContext = stream_context_create([
            'ssl' => [
                'verify_peer'       => true,
                'verify_peer_name'  => true,
                'allow_self_signed' => false,
            ]
        ]);

        $socket = @stream_socket_client($socketAddress, $errNo, $errStr, 15, STREAM_CLIENT_CONNECT, $sslContext);
        if (!$socket) {
            $errorOutput = "SMTP connect failed ({$socketAddress}): {$errStr} [{$errNo}]";
            if (function_exists('logApiError')) {
                logApiError($errorOutput);
            }
            return false;
        }

        stream_set_timeout($socket, 15);

        $sendCommand = function (string $cmd) use ($socket): string {
            fwrite($socket, $cmd . "\r\n");
            $response = '';
            while ($line = fgets($socket, 512)) {
                $response .= $line;
                if (strlen($line) >= 4 && $line[3] === ' ') break;
            }
            return $response;
        };

        try {
            $greeting = fgets($socket, 512);
            if (!str_starts_with(trim((string)$greeting), '220')) {
                throw new RuntimeException("Unexpected SMTP greeting: " . trim((string)$greeting));
            }

            $clientHost = gethostname() ?: 'coloro.in';
            $ehlo = $sendCommand("EHLO {$clientHost}");
            if (!str_starts_with($ehlo, '250')) {
                throw new RuntimeException("SMTP EHLO rejected: " . trim($ehlo));
            }

            if ($smtpEncryption === 'tls') {
                $startTls = $sendCommand("STARTTLS");
                if (!str_starts_with($startTls, '220')) {
                    throw new RuntimeException("SMTP STARTTLS rejected: " . trim($startTls));
                }
                stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                $sendCommand("EHLO {$clientHost}");
            }

            // AUTH LOGIN
            $authInit = $sendCommand("AUTH LOGIN");
            if (!str_starts_with($authInit, '334')) {
                throw new RuntimeException("SMTP AUTH LOGIN failed: " . trim($authInit));
            }

            $userResp = $sendCommand(base64_encode($smtpUser));
            if (!str_starts_with($userResp, '334')) {
                throw new RuntimeException("SMTP Username rejected: " . trim($userResp));
            }

            $passResp = $sendCommand(base64_encode($smtpPass));
            if (!str_starts_with($passResp, '235')) {
                throw new RuntimeException("SMTP Authentication failed: " . trim($passResp));
            }

            // Envelope
            $mailFrom = $sendCommand("MAIL FROM:<{$fromEmail}>");
            if (!str_starts_with($mailFrom, '250')) {
                throw new RuntimeException("SMTP MAIL FROM rejected: " . trim($mailFrom));
            }

            $rcptTo = $sendCommand("RCPT TO:<{$cleanTo}>");
            if (!str_starts_with($rcptTo, '250')) {
                throw new RuntimeException("SMTP RCPT TO rejected: " . trim($rcptTo));
            }

            // DATA
            $dataCmd = $sendCommand("DATA");
            if (!str_starts_with($dataCmd, '354')) {
                throw new RuntimeException("SMTP DATA command rejected: " . trim($dataCmd));
            }

            fwrite($socket, $fullMessage . "\r\n.\r\n");
            $dataResp = '';
            while ($line = fgets($socket, 512)) {
                $dataResp .= $line;
                if (strlen($line) >= 4 && $line[3] === ' ') break;
            }

            if (!str_starts_with($dataResp, '250')) {
                throw new RuntimeException("SMTP Data rejected: " . trim($dataResp));
            }

            $sendCommand("QUIT");
            @fclose($socket);

            if (function_exists('logApiCall')) {
                logApiCall("Mail dispatched successfully", [
                    'to'      => $cleanTo,
                    'subject' => $subject,
                ]);
            }

            return true;
        } catch (Throwable $e) {
            $errorOutput = $e->getMessage();
            if (function_exists('logApiError')) {
                logApiError("SMTP Dispatch Exception: {$errorOutput}", [
                    'to'      => $cleanTo,
                    'subject' => $subject,
                ]);
            }
            if (isset($socket) && is_resource($socket)) {
                @fclose($socket);
            }
            return false;
        }
    }
}
