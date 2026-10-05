<?php
/**
 * Coloro Centralized API & Error Logger
 * 
 * Provides unified logging across all backend API endpoints:
 * 1. api.log       - Common access log of which API was called, parameters, execution time & status.
 * 2. api_error.log - Common error log for validation issues, gateway failures, and exceptions.
 *
 * Security:
 * - Direct HTTP browser access to this file is forbidden.
 * - Sensitive credentials (keys, secrets, signatures, auth tokens) are masked.
 * - Automatic log rotation at 5MB to preserve server disk space.
 */

// Prevent direct execution via browser URL
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'logger.php') {
    http_response_code(403);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['error' => 'Direct access forbidden']);
    exit;
}

if (!defined('COLORO_LOGGER_INITIALIZED')) {
    define('COLORO_LOGGER_INITIALIZED', true);
    define('API_LOG_FILE', __DIR__ . '/api.log');
    define('API_ERROR_LOG_FILE', __DIR__ . '/api_error.log');
    define('API_LOG_MAX_BYTES', 5 * 1024 * 1024); // 5 MB rotation limit

    // Global tracking variables
    $GLOBALS['__api_req_id'] = 'req_' . substr(md5(uniqid((string)mt_rand(), true)), 0, 12);
    $GLOBALS['__api_start_time'] = microtime(true);
    $GLOBALS['__api_endpoint'] = basename($_SERVER['SCRIPT_NAME'] ?? 'unknown_api');
    $GLOBALS['__api_call_logged'] = false;
    $GLOBALS['__api_error_logged'] = false;
}

/**
 * Get accurate, sanitized client IP address
 */
function getLoggerClientIp()
{
    $headers = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_CLIENT_IP',
        'REMOTE_ADDR'
    ];

    foreach ($headers as $h) {
        if (!empty($_SERVER[$h])) {
            $raw = (string)$_SERVER[$h];
            $parts = explode(',', $raw);
            $clean = trim($parts[0]);
            if (filter_var($clean, FILTER_VALIDATE_IP)) {
                return $clean;
            }
        }
    }

    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Recursively sanitize and mask sensitive data in log context
 */
function sanitizeLogData($data)
{
    if (is_string($data)) {
        $decoded = json_decode($data, true);
        if (is_array($decoded)) {
            return json_encode(sanitizeLogData($decoded), JSON_UNESCAPED_SLASHES);
        }
        return $data;
    }

    if (!is_array($data)) {
        return $data;
    }

    $sensitivePatterns = [
        'secret',
        'key',
        'password',
        'pass',
        'token',
        'auth',
        'authorization',
        'signature',
        'x-webhook-signature',
        'x-client-secret',
        'credential',
        'cvv',
        'card'
    ];

    $clean = [];
    foreach ($data as $k => $v) {
        $lowerKey = strtolower((string)$k);
        $isSensitive = false;

        foreach ($sensitivePatterns as $pattern) {
            if (strpos($lowerKey, $pattern) !== false) {
                $isSensitive = true;
                break;
            }
        }

        if ($isSensitive) {
            $clean[$k] = '***REDACTED***';
        } elseif (is_array($v)) {
            $clean[$k] = sanitizeLogData($v);
        } else {
            $clean[$k] = $v;
        }
    }

    return $clean;
}

/**
 * Rotate log file if it exceeds maximum allowed size (5MB)
 */
function rotateLogFileIfNeeded($filePath, $maxBytes = API_LOG_MAX_BYTES)
{
    if (file_exists($filePath) && @filesize($filePath) >= $maxBytes) {
        $backupFile = $filePath . '.1';
        if (file_exists($backupFile)) {
            @unlink($backupFile);
        }
        @rename($filePath, $backupFile);
    }
}

/**
 * Append entry safely with file locking and rotation check
 */
function writeLogEntry($filePath, $entry)
{
    rotateLogFileIfNeeded($filePath);
    @file_put_contents($filePath, $entry, FILE_APPEND | LOCK_EX);
}

/**
 * Format timestamp in standardized UTC/IST readable format
 */
function getLoggerTimestamp()
{
    return date('Y-m-d H:i:s T');
}

/**
 * Log API Call to common api.log
 *
 * @param string $message High-level description of what occurred
 * @param array|mixed $context Additional parameters/context to include
 * @param string $level Log level (INFO, NOTICE, WARN, ERROR)
 */
function logApiCall($message = '', $context = [], $level = 'INFO')
{
    $reqId = $GLOBALS['__api_req_id'] ?? 'req_unknown';
    $endpoint = $GLOBALS['__api_endpoint'] ?? 'unknown';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
    $ip = getLoggerClientIp();
    $status = http_response_code() ?: 200;
    
    $startTime = $GLOBALS['__api_start_time'] ?? microtime(true);
    $durationMs = round((microtime(true) - $startTime) * 1000, 1);

    $timestamp = getLoggerTimestamp();

    if (empty($message)) {
        $message = "API request completed";
    }

    $sanitizedContext = !empty($context) ? sanitizeLogData($context) : null;
    $contextStr = $sanitizedContext ? " | Context: " . json_encode($sanitizedContext, JSON_UNESCAPED_SLASHES) : "";

    $entry = sprintf(
        "[%s] [REQ:%s] [%s] [%s] [METHOD:%s] [IP:%s] [STATUS:%d] [TIME:%sms] - %s%s%s",
        $timestamp,
        $reqId,
        $level,
        $endpoint,
        $method,
        $ip,
        $status,
        $durationMs,
        $message,
        $contextStr,
        PHP_EOL
    );

    writeLogEntry(API_LOG_FILE, $entry);
    $GLOBALS['__api_call_logged'] = true;
}

/**
 * Log API Error to common api_error.log
 * Compatible with existing logApiError($message, $subject) signatures.
 *
 * @param string|array $message Error message or payload
 * @param mixed $context Context array or string subject (for backward compatibility)
 * @param int|null $code HTTP or error code
 * @param string|null $file Optional file where error occurred
 * @param int|null $line Optional line number
 */
function logApiError($message, $context = [], $code = null, $file = null, $line = null)
{
    $reqId = $GLOBALS['__api_req_id'] ?? 'req_unknown';
    $endpoint = $GLOBALS['__api_endpoint'] ?? 'unknown';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
    $ip = getLoggerClientIp();
    $status = $code ?: (http_response_code() ?: 500);
    $timestamp = getLoggerTimestamp();

    // Backward compatibility: If context is a string, wrap it as subject
    if (is_string($context)) {
        $context = ['subject' => $context];
    } elseif (!is_array($context)) {
        $context = $context ? ['details' => $context] : [];
    }

    $msgStr = is_string($message) ? $message : json_encode(sanitizeLogData($message), JSON_UNESCAPED_SLASHES);
    $sanitizedContext = !empty($context) ? sanitizeLogData($context) : null;
    $contextStr = $sanitizedContext ? " | Context: " . json_encode($sanitizedContext, JSON_UNESCAPED_SLASHES) : "";
    $locationStr = ($file && $line) ? sprintf(" [at %s:%d]", basename($file), $line) : "";

    $entry = sprintf(
        "[%s] [REQ:%s] [ERROR] [%s] [METHOD:%s] [IP:%s] [CODE:%d]%s %s%s%s",
        $timestamp,
        $reqId,
        $endpoint,
        $method,
        $ip,
        $status,
        $locationStr,
        $msgStr,
        $contextStr,
        PHP_EOL
    );

    writeLogEntry(API_ERROR_LOG_FILE, $entry);
    $GLOBALS['__api_error_logged'] = true;
}

/**
 * Alias for background cron tasks to keep process-queue.php clean
 */
function logCronError($message, $subject = 'unknown')
{
    logApiError($message, ['subject' => $subject, 'source' => 'CRON']);
}

/**
 * Initialize logging for an endpoint
 *
 * @param string|null $endpoint Explicit endpoint name (e.g. 'create-cashfree-order.php')
 * @param array|null $initialContext Optional initial request context to remember
 */
function initApiLogging($endpoint = null, $initialContext = null)
{
    if ($endpoint) {
        $GLOBALS['__api_endpoint'] = $endpoint;
    }

    if ($initialContext) {
        $GLOBALS['__api_initial_context'] = sanitizeLogData($initialContext);
    }

    // Set error handler for non-fatal runtime notices / warnings
    set_error_handler(function ($errno, $errstr, $errfile, $errline) {
        // Obey error_reporting settings
        if (!(error_reporting() & $errno)) {
            return false;
        }

        $severity = 'PHP_NOTICE';
        if ($errno === E_USER_ERROR || $errno === E_RECOVERABLE_ERROR) {
            $severity = 'PHP_ERROR';
        } elseif ($errno === E_WARNING || $errno === E_USER_WARNING) {
            $severity = 'PHP_WARNING';
        }

        logApiError(
            "[$severity] $errstr",
            ['errno' => $errno],
            500,
            $errfile,
            $errline
        );

        return false; // Allow standard handling if needed
    });

    // Set uncaught exception handler
    set_exception_handler(function ($exception) {
        logApiError(
            "Uncaught Exception: " . $exception->getMessage(),
            ['trace' => substr($exception->getTraceAsString(), 0, 500)],
            500,
            $exception->getFile(),
            $exception->getLine()
        );

        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=UTF-8');
            echo json_encode([
                'error' => 'Internal Server Error',
                'request_id' => $GLOBALS['__api_req_id'] ?? null
            ]);
        }
    });

    // Register shutdown function to guarantee every request is recorded in api.log
    register_shutdown_function(function () {
        // Check for fatal PHP errors
        $lastError = error_get_last();
        if ($lastError && in_array($lastError['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            logApiError(
                "Fatal Error: " . $lastError['message'],
                ['type' => $lastError['type']],
                500,
                $lastError['file'],
                $lastError['line']
            );
        }

        $currentStatus = http_response_code() ?: 200;

        // If response is an error status (4xx/5xx) and no error was logged explicitly, record in api_error.log
        if ($currentStatus >= 400 && empty($GLOBALS['__api_error_logged'])) {
            $ctx = $GLOBALS['__api_initial_context'] ?? [];
            logApiError("Request terminated with HTTP $currentStatus", $ctx, $currentStatus);
        }

        // Guarantee an entry in api.log if not manually written
        if (empty($GLOBALS['__api_call_logged'])) {
            $ctx = $GLOBALS['__api_initial_context'] ?? [];
            $summary = ($currentStatus >= 400) ? "Request failed with HTTP $currentStatus" : "Request handled successfully";
            $level = ($currentStatus >= 500) ? "ERROR" : (($currentStatus >= 400) ? "WARN" : "INFO");
            logApiCall($summary, $ctx, $level);
        }
    });
}
