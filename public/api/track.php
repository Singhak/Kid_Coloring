<?php
/**
 * Coloro Analytics & Telemetry Ingestion Endpoint
 * 
 * Ingests sessions, pageviews, heartbeats, and granular feature events into SQLite.
 * Handles single events and high-throughput batched payloads.
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Only POST is supported.']);
    exit;
}

require_once __DIR__ . '/tracking-db.php';

// Read raw POST body (supports application/json and navigator.sendBeacon text/plain)
$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true);

if (!is_array($payload)) {
    // If not JSON, check $_POST
    $payload = $_POST;
}

if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty or invalid JSON payload']);
    exit;
}

try {
    $pdo = getTrackingDb();
    $now = date('Y-m-d H:i:s');
    $clientIp = getTrackingClientIp();
    $ipHash = hashClientIp($clientIp);
    $country = $_SERVER['HTTP_CF_IPCOUNTRY'] ?? $_SERVER['GEOIP_COUNTRY_CODE'] ?? null;
    $city = $_SERVER['HTTP_CF_IPCITY'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $uaInfo = parseTrackingUserAgent($userAgent);

    // Normalize into a batch of events
    $items = [];
    if (isset($payload['batch']) && is_array($payload['batch'])) {
        $items = $payload['batch'];
    } elseif (isset($payload[0]) && is_array($payload[0])) {
        $items = $payload;
    } else {
        $items = [$payload];
    }

    $processedCount = 0;

    // Prepared statements for high performance
    $stmtInsertSession = $pdo->prepare("
        INSERT INTO tracking_sessions (
            session_id, visitor_id, user_id, ip_hash, country, city, user_agent,
            device_type, browser, os, screen_res, referrer, utm_source, utm_medium,
            utm_campaign, landing_page, created_at, last_heartbeat_at, duration_seconds,
            pageviews_count, events_count, is_pro
        ) VALUES (
            :session_id, :visitor_id, :user_id, :ip_hash, :country, :city, :user_agent,
            :device_type, :browser, :os, :screen_res, :referrer, :utm_source, :utm_medium,
            :utm_campaign, :landing_page, :created_at, :last_heartbeat_at, 0, 1, 0, :is_pro
        )
        ON CONFLICT(session_id) DO UPDATE SET
            last_heartbeat_at = :last_heartbeat_at,
            user_id = COALESCE(:user_id, tracking_sessions.user_id),
            is_pro = COALESCE(:is_pro, tracking_sessions.is_pro)
    ");

    $stmtHeartbeat = $pdo->prepare("
        UPDATE tracking_sessions
        SET last_heartbeat_at = :now,
            duration_seconds = duration_seconds + :delta_seconds
        WHERE session_id = :session_id
    ");

    $stmtInsertPageview = $pdo->prepare("
        INSERT INTO tracking_pageviews (
            session_id, visitor_id, user_id, page_path, page_title, referrer,
            duration_seconds, created_at
        ) VALUES (
            :session_id, :visitor_id, :user_id, :page_path, :page_title, :referrer,
            :duration_seconds, :created_at
        )
    ");

    $stmtIncPageviews = $pdo->prepare("
        UPDATE tracking_sessions
        SET pageviews_count = pageviews_count + 1,
            last_heartbeat_at = :now
        WHERE session_id = :session_id
    ");

    $stmtInsertEvent = $pdo->prepare("
        INSERT INTO tracking_events (
            session_id, visitor_id, user_id, category, action, label,
            value, metadata, created_at
        ) VALUES (
            :session_id, :visitor_id, :user_id, :category, :action, :label,
            :value, :metadata, :created_at
        )
    ");

    $stmtIncEvents = $pdo->prepare("
        UPDATE tracking_sessions
        SET events_count = events_count + 1,
            last_heartbeat_at = :now
        WHERE session_id = :session_id
    ");

    // Execute in a single SQLite transaction for speed and durability
    $pdo->beginTransaction();

    foreach ($items as $item) {
        if (!is_array($item)) continue;

        $type = $item['type'] ?? 'event';
        $sessionId = (string)($item['session_id'] ?? $item['sessionId'] ?? '');
        $visitorId = (string)($item['visitor_id'] ?? $item['visitorId'] ?? '');
        $userId = isset($item['user_id']) ? (string)$item['user_id'] : (isset($item['userId']) ? (string)$item['userId'] : null);
        $itemTime = isset($item['timestamp']) ? date('Y-m-d H:i:s', strtotime($item['timestamp'])) : $now;

        if (empty($sessionId) || empty($visitorId)) {
            continue; // Must have session and visitor ID
        }

        switch ($type) {
            case 'session_start':
                $deviceType = $item['device_type'] ?? $uaInfo['device'];
                $browser = $item['browser'] ?? $uaInfo['browser'];
                $os = $item['os'] ?? $uaInfo['os'];
                $screenRes = $item['screen_res'] ?? null;
                $referrer = $item['referrer'] ?? '';
                $utmSource = $item['utm_source'] ?? null;
                $utmMedium = $item['utm_medium'] ?? null;
                $utmCampaign = $item['utm_campaign'] ?? null;
                $landingPage = $item['landing_page'] ?? '/';
                $isPro = !empty($item['is_pro']) ? 1 : 0;

                $stmtInsertSession->execute([
                    ':session_id' => $sessionId,
                    ':visitor_id' => $visitorId,
                    ':user_id' => $userId,
                    ':ip_hash' => $ipHash,
                    ':country' => $country,
                    ':city' => $city,
                    ':user_agent' => $userAgent,
                    ':device_type' => $deviceType,
                    ':browser' => $browser,
                    ':os' => $os,
                    ':screen_res' => $screenRes,
                    ':referrer' => $referrer,
                    ':utm_source' => $utmSource,
                    ':utm_medium' => $utmMedium,
                    ':utm_campaign' => $utmCampaign,
                    ':landing_page' => $landingPage,
                    ':created_at' => $itemTime,
                    ':last_heartbeat_at' => $itemTime,
                    ':is_pro' => $isPro
                ]);
                $processedCount++;
                break;

            case 'heartbeat':
                $deltaSeconds = isset($item['delta_seconds']) ? (int)$item['delta_seconds'] : 30;
                if ($deltaSeconds < 0 || $deltaSeconds > 600) $deltaSeconds = 30; // Clamp sensible limits

                $stmtHeartbeat->execute([
                    ':now' => $itemTime,
                    ':delta_seconds' => $deltaSeconds,
                    ':session_id' => $sessionId
                ]);
                $processedCount++;
                break;

            case 'pageview':
                $pagePath = (string)($item['page_path'] ?? $item['path'] ?? '/');
                $pageTitle = (string)($item['page_title'] ?? $item['title'] ?? '');
                $ref = (string)($item['referrer'] ?? '');
                $duration = isset($item['duration_seconds']) ? (int)$item['duration_seconds'] : 0;

                $stmtInsertPageview->execute([
                    ':session_id' => $sessionId,
                    ':visitor_id' => $visitorId,
                    ':user_id' => $userId,
                    ':page_path' => $pagePath,
                    ':page_title' => $pageTitle,
                    ':referrer' => $ref,
                    ':duration_seconds' => $duration,
                    ':created_at' => $itemTime
                ]);

                $stmtIncPageviews->execute([
                    ':now' => $itemTime,
                    ':session_id' => $sessionId
                ]);
                $processedCount++;
                break;

            case 'event':
            default:
                $category = (string)($item['category'] ?? 'general');
                $action = (string)($item['action'] ?? 'action');
                $label = isset($item['label']) ? (string)$item['label'] : null;
                $value = isset($item['value']) ? (float)$item['value'] : null;
                
                $metadata = null;
                if (isset($item['metadata'])) {
                    $metadata = is_string($item['metadata']) ? $item['metadata'] : json_encode($item['metadata']);
                }

                $stmtInsertEvent->execute([
                    ':session_id' => $sessionId,
                    ':visitor_id' => $visitorId,
                    ':user_id' => $userId,
                    ':category' => $category,
                    ':action' => $action,
                    ':label' => $label,
                    ':value' => $value,
                    ':metadata' => $metadata,
                    ':created_at' => $itemTime
                ]);

                $stmtIncEvents->execute([
                    ':now' => $itemTime,
                    ':session_id' => $sessionId
                ]);
                $processedCount++;
                break;
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'processed' => $processedCount,
        'timestamp' => $now
    ]);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to record tracking telemetry: ' . $e->getMessage()
    ]);
}
