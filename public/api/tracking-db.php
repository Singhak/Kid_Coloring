<?php
/**
 * Coloro Analytics & Telemetry SQLite Database Helper
 * 
 * Manages SQLite database connection, schema migrations, and helper utilities.
 * Database file: public/api/data/tracking.db
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'tracking-db.php') {
    http_response_code(403);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['error' => 'Direct access forbidden']);
    exit;
}

define('TRACKING_DB_DIR', __DIR__ . '/data');
define('TRACKING_DB_PATH', TRACKING_DB_DIR . '/tracking.db');

/**
 * Returns a configured PDO SQLite database instance with WAL mode and schema initialized.
 */
function getTrackingDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    if (!is_dir(TRACKING_DB_DIR)) {
        @mkdir(TRACKING_DB_DIR, 0755, true);
    }

    // Secure data directory with internal .htaccess if on Apache
    $htaccessFile = TRACKING_DB_DIR . '/.htaccess';
    if (!file_exists($htaccessFile)) {
        @file_put_contents($htaccessFile, "Order deny,allow\nDeny from all\nRequire all denied\n");
    }

    $pdo = new PDO('sqlite:' . TRACKING_DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // High performance and concurrency settings for SQLite
    $pdo->exec('PRAGMA journal_mode = WAL;');
    $pdo->exec('PRAGMA synchronous = NORMAL;');
    $pdo->exec('PRAGMA busy_timeout = 5000;');
    $pdo->exec('PRAGMA foreign_keys = ON;');

    initTrackingSchema($pdo);

    return $pdo;
}

/**
 * Initialize database tables and indexes if they do not exist
 */
function initTrackingSchema(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tracking_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            visitor_id TEXT NOT NULL,
            user_id TEXT,
            ip_hash TEXT,
            country TEXT,
            city TEXT,
            user_agent TEXT,
            device_type TEXT DEFAULT 'desktop',
            browser TEXT,
            os TEXT,
            screen_res TEXT,
            referrer TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            landing_page TEXT,
            created_at TEXT NOT NULL,
            last_heartbeat_at TEXT NOT NULL,
            duration_seconds INTEGER DEFAULT 0,
            pageviews_count INTEGER DEFAULT 1,
            events_count INTEGER DEFAULT 0,
            is_pro INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS tracking_pageviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            visitor_id TEXT NOT NULL,
            user_id TEXT,
            page_path TEXT NOT NULL,
            page_title TEXT,
            referrer TEXT,
            duration_seconds INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tracking_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            visitor_id TEXT NOT NULL,
            user_id TEXT,
            category TEXT NOT NULL,
            action TEXT NOT NULL,
            label TEXT,
            value REAL,
            metadata TEXT,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON tracking_sessions(session_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON tracking_sessions(visitor_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON tracking_sessions(created_at);
        CREATE INDEX IF NOT EXISTS idx_sessions_last_heartbeat ON tracking_sessions(last_heartbeat_at);

        CREATE INDEX IF NOT EXISTS idx_pageviews_session ON tracking_pageviews(session_id);
        CREATE INDEX IF NOT EXISTS idx_pageviews_visitor ON tracking_pageviews(visitor_id);
        CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON tracking_pageviews(created_at);
        CREATE INDEX IF NOT EXISTS idx_pageviews_path ON tracking_pageviews(page_path);

        CREATE INDEX IF NOT EXISTS idx_events_session ON tracking_events(session_id);
        CREATE INDEX IF NOT EXISTS idx_events_visitor ON tracking_events(visitor_id);
        CREATE INDEX IF NOT EXISTS idx_events_cat_act ON tracking_events(category, action);
        CREATE INDEX IF NOT EXISTS idx_events_created_at ON tracking_events(created_at);
    ");
}

/**
 * Anonymize or hash IP address for privacy compliance
 */
function hashClientIp(?string $ip): string {
    if (!$ip) return 'unknown';
    // One-way hash with server-side static salt
    return substr(hash('sha256', 'coloro_track_' . $ip), 0, 16);
}

/**
 * Extract sanitized client IP address
 */
function getTrackingClientIp(): string {
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
 * Simple user-agent parser for device, browser, and OS
 */
function parseTrackingUserAgent(string $userAgent): array {
    $device = 'desktop';
    $browser = 'Other';
    $os = 'Other';

    $ua = strtolower($userAgent);

    // Device
    if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i', $userAgent)) {
        $device = 'tablet';
    } elseif (preg_match('/(mobile|iphone|ipod|blackberry|opera mini|iemobile|kindle)/i', $userAgent)) {
        $device = 'mobile';
    }

    // OS
    if (strpos($ua, 'windows') !== false) {
        $os = 'Windows';
    } elseif (strpos($ua, 'macintosh') !== false || strpos($ua, 'mac os') !== false) {
        $os = 'macOS';
    } elseif (strpos($ua, 'iphone') !== false || strpos($ua, 'ipad') !== false) {
        $os = 'iOS';
    } elseif (strpos($ua, 'android') !== false) {
        $os = 'Android';
    } elseif (strpos($ua, 'linux') !== false) {
        $os = 'Linux';
    }

    // Browser
    if (strpos($ua, 'edg') !== false) {
        $browser = 'Edge';
    } elseif (strpos($ua, 'chrome') !== false && strpos($ua, 'opr') === false) {
        $browser = 'Chrome';
    } elseif (strpos($ua, 'safari') !== false && strpos($ua, 'chrome') === false) {
        $browser = 'Safari';
    } elseif (strpos($ua, 'firefox') !== false) {
        $browser = 'Firefox';
    } elseif (strpos($ua, 'opr') !== false || strpos($ua, 'opera') !== false) {
        $browser = 'Opera';
    }

    return [
        'device' => $device,
        'browser' => $browser,
        'os' => $os
    ];
}

/**
 * Discover configured Telemetry Admin Key from .env or server environment
 */
function getTelemetryAdminKey(): string {
    static $adminKey = null;
    if ($adminKey !== null) return $adminKey;

    if (!empty($_ENV['TELEMETRY_ADMIN_KEY'])) return $adminKey = (string)$_ENV['TELEMETRY_ADMIN_KEY'];
    if (!empty($_SERVER['TELEMETRY_ADMIN_KEY'])) return $adminKey = (string)$_SERVER['TELEMETRY_ADMIN_KEY'];
    $envVal = getenv('TELEMETRY_ADMIN_KEY');
    if ($envVal !== false && $envVal !== '') return $adminKey = (string)$envVal;

    // Search .env files
    $envFiles = [__DIR__ . '/.env', __DIR__ . '/../.env', dirname(__DIR__) . '/.env'];
    foreach ($envFiles as $file) {
        if (file_exists($file)) {
            $parsed = @parse_ini_file($file, false, INI_SCANNER_RAW);
            if (!empty($parsed['TELEMETRY_ADMIN_KEY'])) {
                return $adminKey = (string)$parsed['TELEMETRY_ADMIN_KEY'];
            }
        }
    }

    return $adminKey = 'coloro_admin_2026';
}

/**
 * Validates whether the incoming request is authorized to view analytics
 */
function isTelemetryAuthorized(): bool {
    $expected = getTelemetryAdminKey();

    // 1. Check HTTP header X-Admin-Key
    $headerKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
    if ($headerKey !== '' && hash_equals($expected, $headerKey)) {
        return true;
    }

    // 2. Check query string ?key=... or POST param key
    $paramKey = $_GET['key'] ?? ($_POST['key'] ?? '');
    if ($paramKey !== '' && hash_equals($expected, $paramKey)) {
        return true;
    }

    // 3. Check session authentication
    if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
        @session_start();
    }
    if (!empty($_SESSION['coloro_telemetry_authorized']) && $_SESSION['coloro_telemetry_authorized'] === true) {
        return true;
    }

    // 4. Check cookie
    if (!empty($_COOKIE['coloro_admin_key']) && hash_equals($expected, $_COOKIE['coloro_admin_key'])) {
        return true;
    }

    return false;
}
