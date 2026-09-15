<?php
/**
 * Coloro Analytics & Telemetry Reporting Endpoint
 * 
 * Aggregates granular tracking data from SQLite for analytics dashboards.
 * Supports date range filtering: 'today', 'yesterday', '7d', '30d', 'all' or custom dates.
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Key');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/tracking-db.php';

// Strictly restrict access to admin only
if (!isTelemetryAuthorized()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Unauthorized: Admin authentication required to access telemetry statistics.'
    ]);
    exit;
}

try {
    $pdo = getTrackingDb();

    // Determine Date Filter
    $range = $_GET['range'] ?? '7d';
    $customStart = $_GET['start'] ?? null;
    $customEnd = $_GET['end'] ?? null;

    $whereSession = "1=1";
    $wherePv = "1=1";
    $whereEv = "1=1";
    $params = [];

    if ($customStart && $customEnd) {
        $whereSession = "created_at >= :start AND created_at <= :end";
        $wherePv = "created_at >= :start AND created_at <= :end";
        $whereEv = "created_at >= :start AND created_at <= :end";
        $params[':start'] = date('Y-m-d 00:00:00', strtotime($customStart));
        $params[':end'] = date('Y-m-d 23:59:59', strtotime($customEnd));
    } else {
        switch ($range) {
            case 'today':
                $start = date('Y-m-d 00:00:00');
                $whereSession = "created_at >= :start";
                $wherePv = "created_at >= :start";
                $whereEv = "created_at >= :start";
                $params[':start'] = $start;
                break;
            case 'yesterday':
                $start = date('Y-m-d 00:00:00', strtotime('-1 day'));
                $end = date('Y-m-d 23:59:59', strtotime('-1 day'));
                $whereSession = "created_at >= :start AND created_at <= :end";
                $wherePv = "created_at >= :start AND created_at <= :end";
                $whereEv = "created_at >= :start AND created_at <= :end";
                $params[':start'] = $start;
                $params[':end'] = $end;
                break;
            case '30d':
                $start = date('Y-m-d 00:00:00', strtotime('-30 days'));
                $whereSession = "created_at >= :start";
                $wherePv = "created_at >= :start";
                $whereEv = "created_at >= :start";
                $params[':start'] = $start;
                break;
            case 'all':
                // No date constraint
                break;
            case '7d':
            default:
                $start = date('Y-m-d 00:00:00', strtotime('-7 days'));
                $whereSession = "created_at >= :start";
                $wherePv = "created_at >= :start";
                $whereEv = "created_at >= :start";
                $params[':start'] = $start;
                break;
        }
    }

    // 1. High-Level Summary Metrics
    $stmtOverview = $pdo->prepare("
        SELECT 
            COUNT(DISTINCT visitor_id) AS total_visitors,
            COUNT(DISTINCT session_id) AS total_sessions,
            COALESCE(SUM(duration_seconds), 0) AS total_duration,
            COALESCE(AVG(duration_seconds), 0) AS avg_duration_seconds,
            COUNT(DISTINCT CASE WHEN is_pro = 1 THEN visitor_id END) AS pro_visitors
        FROM tracking_sessions
        WHERE $whereSession
    ");
    $stmtOverview->execute($params);
    $overview = $stmtOverview->fetch() ?: [
        'total_visitors' => 0,
        'total_sessions' => 0,
        'total_duration' => 0,
        'avg_duration_seconds' => 0,
        'pro_visitors' => 0
    ];

    // Pageviews count
    $stmtPvCount = $pdo->prepare("SELECT COUNT(*) AS total_pageviews FROM tracking_pageviews WHERE $wherePv");
    $stmtPvCount->execute($params);
    $pvCount = (int)($stmtPvCount->fetchColumn() ?: 0);

    // Events count
    $stmtEvCount = $pdo->prepare("SELECT COUNT(*) AS total_events FROM tracking_events WHERE $whereEv");
    $stmtEvCount->execute($params);
    $evCount = (int)($stmtEvCount->fetchColumn() ?: 0);

    // Real-time active visitors (last 15 minutes)
    $stmtRealtime = $pdo->query("
        SELECT COUNT(DISTINCT session_id) 
        FROM tracking_sessions 
        WHERE last_heartbeat_at >= datetime('now', '-15 minutes')
    ");
    $activeVisitorsNow = (int)($stmtRealtime->fetchColumn() ?: 0);

    // 2. Daily Trends
    $stmtTrends = $pdo->prepare("
        SELECT 
            substr(created_at, 1, 10) AS date,
            COUNT(DISTINCT visitor_id) AS visitors,
            COUNT(DISTINCT session_id) AS sessions,
            SUM(duration_seconds) AS duration
        FROM tracking_sessions
        WHERE $whereSession
        GROUP BY substr(created_at, 1, 10)
        ORDER BY date ASC
    ");
    $stmtTrends->execute($params);
    $trends = $stmtTrends->fetchAll();

    // 3. Top Feature Categories
    $stmtCategories = $pdo->prepare("
        SELECT 
            category,
            COUNT(*) AS event_count,
            COUNT(DISTINCT visitor_id) AS unique_users
        FROM tracking_events
        WHERE $whereEv
        GROUP BY category
        ORDER BY event_count DESC
    ");
    $stmtCategories->execute($params);
    $categories = $stmtCategories->fetchAll();

    // 4. Granular Template Usage (Top coloring pages)
    $stmtTemplates = $pdo->prepare("
        SELECT 
            label AS template_name,
            COUNT(*) AS selects_count,
            COUNT(DISTINCT visitor_id) AS unique_artists
        FROM tracking_events
        WHERE $whereEv AND (category = 'template' OR action = 'select_template') AND label IS NOT NULL
        GROUP BY label
        ORDER BY selects_count DESC
        LIMIT 15
    ");
    $stmtTemplates->execute($params);
    $topTemplates = $stmtTemplates->fetchAll();

    // 5. Tool Usage (Brush, Fill, Eraser, Stamps, etc.)
    $stmtTools = $pdo->prepare("
        SELECT 
            action AS tool_action,
            label AS tool_name,
            COUNT(*) AS count
        FROM tracking_events
        WHERE $whereEv AND category IN ('tool', 'tools', 'brush', 'canvas')
        GROUP BY action, label
        ORDER BY count DESC
        LIMIT 15
    ");
    $stmtTools->execute($params);
    $topTools = $stmtTools->fetchAll();

    // 6. Color & Pattern Choices
    $stmtColors = $pdo->prepare("
        SELECT 
            label AS color_or_pattern,
            COUNT(*) AS pick_count
        FROM tracking_events
        WHERE $whereEv AND category = 'colors' AND label IS NOT NULL
        GROUP BY label
        ORDER BY pick_count DESC
        LIMIT 15
    ");
    $stmtColors->execute($params);
    $topColors = $stmtColors->fetchAll();

    // 7. AI & Creative Features
    $stmtAi = $pdo->prepare("
        SELECT 
            action,
            COUNT(*) AS count,
            COUNT(DISTINCT visitor_id) AS unique_users
        FROM tracking_events
        WHERE $whereEv AND category IN ('ai_generation', 'photo_art', 'color_by_number', 'stickers')
        GROUP BY action
        ORDER BY count DESC
    ");
    $stmtAi->execute($params);
    $creativeFeatures = $stmtAi->fetchAll();

    // 8. Canvas Exports (Downloads & Prints)
    $stmtExports = $pdo->prepare("
        SELECT 
            action,
            COUNT(*) AS total_count
        FROM tracking_events
        WHERE $whereEv AND action IN ('download_image', 'print_sheet', 'clear_canvas', 'undo', 'redo')
        GROUP BY action
        ORDER BY total_count DESC
    ");
    $stmtExports->execute($params);
    $canvasExports = $stmtExports->fetchAll();

    // 9. Monetization Funnel
    $stmtFunnel = $pdo->prepare("
        SELECT 
            SUM(CASE WHEN action IN ('pageview', 'session_start') THEN 1 ELSE 0 END) AS total_visits,
            COUNT(DISTINCT CASE WHEN action IN ('view_pricing', 'open_upgrade_modal') THEN visitor_id END) AS viewed_pricing,
            COUNT(DISTINCT CASE WHEN action IN ('click_subscribe', 'start_checkout') THEN visitor_id END) AS started_checkout,
            COUNT(DISTINCT CASE WHEN action = 'payment_success' THEN visitor_id END) AS completed_payment
        FROM (
            SELECT action, visitor_id FROM tracking_events WHERE $whereEv
            UNION ALL
            SELECT 'pageview' AS action, visitor_id FROM tracking_pageviews WHERE $wherePv
        )
    ");
    $stmtFunnel->execute(array_merge($params, $params));
    $funnel = $stmtFunnel->fetch() ?: [
        'total_visits' => $overview['total_visitors'],
        'viewed_pricing' => 0,
        'started_checkout' => 0,
        'completed_payment' => 0
    ];

    // 10. Devices, Browsers & OS
    $stmtDevices = $pdo->prepare("
        SELECT device_type, COUNT(*) AS count
        FROM tracking_sessions
        WHERE $whereSession
        GROUP BY device_type
        ORDER BY count DESC
    ");
    $stmtDevices->execute($params);
    $devices = $stmtDevices->fetchAll();

    $stmtBrowsers = $pdo->prepare("
        SELECT browser, COUNT(*) AS count
        FROM tracking_sessions
        WHERE $whereSession AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 6
    ");
    $stmtBrowsers->execute($params);
    $browsers = $stmtBrowsers->fetchAll();

    // 11. Top Page Paths
    $stmtPages = $pdo->prepare("
        SELECT page_path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
        FROM tracking_pageviews
        WHERE $wherePv
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 10
    ");
    $stmtPages->execute($params);
    $topPages = $stmtPages->fetchAll();

    // 12. Recent Live Activity Stream (last 30 events)
    $stmtLiveStream = $pdo->query("
        SELECT 
            e.category,
            e.action,
            e.label,
            e.value,
            e.created_at,
            s.device_type,
            s.browser,
            s.country,
            e.session_id
        FROM tracking_events e
        LEFT JOIN tracking_sessions s ON e.session_id = s.session_id
        ORDER BY e.created_at DESC
        LIMIT 30
    ");
    $liveStream = $stmtLiveStream->fetchAll();

    echo json_encode([
        'success' => true,
        'range' => $range,
        'generated_at' => date('Y-m-d H:i:s'),
        'overview' => [
            'total_visitors' => (int)$overview['total_visitors'],
            'total_sessions' => (int)$overview['total_sessions'],
            'total_pageviews' => $pvCount,
            'total_events' => $evCount,
            'active_visitors_now' => $activeVisitorsNow,
            'avg_duration_seconds' => round((float)$overview['avg_duration_seconds']),
            'pro_visitors' => (int)$overview['pro_visitors'],
        ],
        'trends' => $trends,
        'categories' => $categories,
        'top_templates' => $topTemplates,
        'top_tools' => $topTools,
        'top_colors' => $topColors,
        'creative_features' => $creativeFeatures,
        'canvas_exports' => $canvasExports,
        'funnel' => $funnel,
        'devices' => $devices,
        'browsers' => $browsers,
        'top_pages' => $topPages,
        'live_stream' => $liveStream
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to query tracking stats: ' . $e->getMessage()
    ]);
}
