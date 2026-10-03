<?php
/**
 * Coloro Analytics & Telemetry Reporting Endpoint (admin only, same-origin)
 *
 * Aggregates tracking data from SQLite for the analytics dashboard.
 * Ranges: 'today', 'yesterday', '7d', '30d', 'all' or custom ?start=YYYY-MM-DD&end=YYYY-MM-DD.
 * All timestamps are UTC.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

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

    // ---- Date range (UTC) ------------------------------------------------
    $range = $_GET['range'] ?? '7d';
    $rangeStart = null; // 'Y-m-d H:i:s' or null for open-ended
    $rangeEnd = null;

    if (!empty($_GET['start']) && !empty($_GET['end'])) {
        $range = 'custom';
        $rangeStart = gmdate('Y-m-d 00:00:00', strtotime($_GET['start']));
        $rangeEnd = gmdate('Y-m-d 23:59:59', strtotime($_GET['end']));
    } else {
        switch ($range) {
            case 'today':
                $rangeStart = gmdate('Y-m-d 00:00:00');
                break;
            case 'yesterday':
                $rangeStart = gmdate('Y-m-d 00:00:00', strtotime('-1 day'));
                $rangeEnd = gmdate('Y-m-d 23:59:59', strtotime('-1 day'));
                break;
            case '30d':
                $rangeStart = gmdate('Y-m-d 00:00:00', strtotime('-29 days'));
                break;
            case 'all':
                break;
            case '7d':
            default:
                $range = '7d';
                $rangeStart = gmdate('Y-m-d 00:00:00', strtotime('-6 days'));
                break;
        }
    }

    $params = [];
    $dateSql = '1=1';
    if ($rangeStart !== null) {
        $dateSql .= ' AND created_at >= :start';
        $params[':start'] = $rangeStart;
    }
    if ($rangeEnd !== null) {
        $dateSql .= ' AND created_at <= :end';
        $params[':end'] = $rangeEnd;
    }

    $all = function (string $sql, array $extra = []) use ($pdo, $params): array {
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_merge($params, $extra));
        return $stmt->fetchAll();
    };
    $one = function (string $sql, array $extra = []) use ($all) {
        $rows = $all($sql, $extra);
        return $rows ? array_values($rows[0])[0] : 0;
    };

    // ---- 1. Overview -----------------------------------------------------
    $sess = $all("
        SELECT
            COUNT(DISTINCT visitor_id) AS visitors,
            COUNT(*) AS sessions,
            COALESCE(AVG(CASE WHEN duration_seconds > 0 THEN duration_seconds END), 0) AS avg_duration,
            COUNT(DISTINCT CASE WHEN is_pro = 1 THEN visitor_id END) AS pro_visitors,
            COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN visitor_id END) AS signed_in_visitors
        FROM tracking_sessions WHERE $dateSql
    ")[0];

    $pageviews = (int)$one("SELECT COUNT(*) FROM tracking_pageviews WHERE $dateSql");
    $events = (int)$one("SELECT COUNT(*) FROM tracking_events WHERE $dateSql");

    // Sessions where the visitor actually coloured something (activation)
    $activeActions = "('flood_fill','stamp_sticker','region_filled')";
    $activatedSessions = (int)$one("
        SELECT COUNT(DISTINCT session_id) FROM tracking_events
        WHERE $dateSql AND action IN $activeActions
    ");

    // New vs returning visitors (first ever session inside / before the range)
    $returning = 0;
    if ($rangeStart !== null) {
        $returning = (int)$one("
            SELECT COUNT(DISTINCT visitor_id) FROM tracking_sessions
            WHERE $dateSql AND visitor_id IN (
                SELECT visitor_id FROM tracking_sessions GROUP BY visitor_id HAVING MIN(created_at) < :first_before
            )
        ", [':first_before' => $rangeStart]);
    }
    $totalVisitors = (int)$sess['visitors'];
    $totalSessions = (int)$sess['sessions'];

    $activeNow = (int)$pdo->query("
        SELECT COUNT(DISTINCT visitor_id) FROM tracking_sessions
        WHERE last_heartbeat_at >= '" . gmdate('Y-m-d H:i:s', time() - 900) . "'
    ")->fetchColumn();

    // ---- 2. Daily trend (zero-filled) -----------------------------------
    $byDay = [];
    foreach ($all("
        SELECT substr(created_at,1,10) AS d, COUNT(DISTINCT visitor_id) AS visitors, COUNT(*) AS sessions
        FROM tracking_sessions WHERE $dateSql GROUP BY d
    ") as $r) {
        $byDay[$r['d']] = ['visitors' => (int)$r['visitors'], 'sessions' => (int)$r['sessions'], 'actions' => 0];
    }
    foreach ($all("
        SELECT substr(created_at,1,10) AS d, COUNT(*) AS c FROM tracking_events
        WHERE $dateSql AND action IN $activeActions GROUP BY d
    ") as $r) {
        if (!isset($byDay[$r['d']])) $byDay[$r['d']] = ['visitors' => 0, 'sessions' => 0, 'actions' => 0];
        $byDay[$r['d']]['actions'] = (int)$r['c'];
    }
    if ($rangeStart !== null) {
        $cursor = strtotime(substr($rangeStart, 0, 10));
        $last = strtotime($rangeEnd !== null ? substr($rangeEnd, 0, 10) : gmdate('Y-m-d'));
        for ($t = $cursor; $t <= $last && $t - $cursor < 400 * 86400; $t += 86400) {
            $d = gmdate('Y-m-d', $t);
            if (!isset($byDay[$d])) $byDay[$d] = ['visitors' => 0, 'sessions' => 0, 'actions' => 0];
        }
    }
    ksort($byDay);
    $trends = [];
    foreach ($byDay as $d => $v) $trends[] = ['date' => $d] + $v;

    // ---- 3. Acquisition --------------------------------------------------
    $ownHost = strtolower(preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? ''));
    $sources = [];
    foreach ($all("
        SELECT referrer, utm_source, COUNT(*) AS sessions, COUNT(DISTINCT visitor_id) AS visitors
        FROM tracking_sessions WHERE $dateSql GROUP BY referrer, utm_source
    ") as $r) {
        $name = 'Direct / none';
        if (!empty($r['utm_source'])) {
            $name = strtolower($r['utm_source']) . ' (utm)';
        } elseif (!empty($r['referrer'])) {
            $host = strtolower(preg_replace('/^www\./', '', (string)parse_url($r['referrer'], PHP_URL_HOST)));
            if ($host !== '' && $host !== $ownHost) $name = $host;
        }
        if (!isset($sources[$name])) $sources[$name] = ['source' => $name, 'sessions' => 0, 'visitors' => 0];
        $sources[$name]['sessions'] += (int)$r['sessions'];
        $sources[$name]['visitors'] += (int)$r['visitors']; // approx. when a visitor has several sources
    }
    usort($sources, fn($a, $b) => $b['sessions'] <=> $a['sessions']);
    $sources = array_slice($sources, 0, 10);

    $landingPages = $all("
        SELECT landing_page AS page, COUNT(*) AS sessions
        FROM tracking_sessions WHERE $dateSql AND landing_page IS NOT NULL
        GROUP BY landing_page ORDER BY sessions DESC LIMIT 10
    ");

    $pinterestLanding = $all("
        SELECT label AS category, COUNT(*) AS sessions
        FROM tracking_events WHERE $dateSql AND action = 'pinterest_landing' AND label IS NOT NULL
        GROUP BY label ORDER BY sessions DESC LIMIT 8
    ");

    // ---- 4. Product usage funnel (unique visitors) ----------------------
    $uv = function (string $actionList) use ($one, $dateSql) {
        return (int)$one("SELECT COUNT(DISTINCT visitor_id) FROM tracking_events WHERE $dateSql AND action IN $actionList");
    };
    $usageFunnel = [
        ['stage' => 'Visited the app', 'users' => $totalVisitors],
        ['stage' => 'Opened a template / category', 'users' => $uv("('select_template','select_category')")],
        ['stage' => 'Coloured something', 'users' => $uv($activeActions)],
        ['stage' => 'Saved or printed', 'users' => $uv("('download_image','print_sheet')")],
    ];

    // ---- 5. Monetization funnel -----------------------------------------
    $monetization = [
        ['stage' => 'Visited the app', 'users' => $totalVisitors],
        ['stage' => 'Hit a paywall / saw pricing', 'users' => $uv("('open_upgrade_modal','view_pricing')")],
        ['stage' => 'Clicked subscribe', 'users' => $uv("('click_subscribe')")],
        ['stage' => 'Paid', 'users' => $uv("('payment_success')")],
    ];
    $revenue = (float)$one("SELECT COALESCE(SUM(value),0) FROM tracking_events WHERE $dateSql AND action = 'payment_success'");
    $paymentFailures = (int)$one("SELECT COUNT(*) FROM tracking_events WHERE $dateSql AND action = 'payment_failed'");
    $paywallReasons = $all("
        SELECT action, COUNT(*) AS count FROM tracking_events
        WHERE $dateSql AND category = 'monetization' GROUP BY action ORDER BY count DESC
    ");

    // ---- 6. Content: templates & categories -----------------------------
    $topTemplates = $all("
        SELECT label AS name, COUNT(*) AS opens, COUNT(DISTINCT visitor_id) AS artists
        FROM tracking_events
        WHERE $dateSql AND action = 'select_template' AND label IS NOT NULL
        GROUP BY label ORDER BY opens DESC LIMIT 10
    ");
    $topCategories = $all("
        SELECT label AS name, COUNT(*) AS opens, COUNT(DISTINCT visitor_id) AS artists
        FROM tracking_events
        WHERE $dateSql AND action = 'select_category' AND label IS NOT NULL
        GROUP BY label ORDER BY opens DESC LIMIT 10
    ");

    // ---- 7. Colour-by-number --------------------------------------------
    $cbn = $all("
        SELECT action, COUNT(*) AS count, COUNT(DISTINCT visitor_id) AS users
        FROM tracking_events WHERE $dateSql AND category = 'color_by_number'
        GROUP BY action ORDER BY count DESC
    ");

    // ---- 8. Tools, canvas actions, colours ------------------------------
    $tools = $all("
        SELECT label AS name, COUNT(*) AS uses, COUNT(DISTINCT visitor_id) AS users
        FROM tracking_events WHERE $dateSql AND category = 'tools' AND action = 'use_tool' AND label IS NOT NULL
        GROUP BY label ORDER BY uses DESC LIMIT 10
    ");
    $canvasActions = $all("
        SELECT action, COUNT(*) AS count, COUNT(DISTINCT visitor_id) AS users
        FROM tracking_events WHERE $dateSql AND category = 'canvas'
        GROUP BY action ORDER BY count DESC
    ");
    $colors = [];
    foreach ($all("
        SELECT label AS name, action, COUNT(*) AS picks, MAX(metadata) AS sample
        FROM tracking_events
        WHERE $dateSql AND category = 'colors' AND label IS NOT NULL
        GROUP BY label, action ORDER BY picks DESC LIMIT 12
    ") as $r) {
        $meta = json_decode((string)$r['sample'], true);
        $hex = is_array($meta) && isset($meta['hex']) ? (string)$meta['hex'] : null;
        $colors[] = [
            'name' => $r['name'],
            'picks' => (int)$r['picks'],
            'is_pattern' => $r['action'] === 'pick_pattern',
            'hex' => ($hex !== null && preg_match('/^#[0-9a-fA-F]{3,8}$/', $hex)) ? $hex : null,
        ];
    }

    // ---- 9. AI features --------------------------------------------------
    $ai = $all("
        SELECT action, COUNT(*) AS count, COUNT(DISTINCT visitor_id) AS users
        FROM tracking_events WHERE $dateSql AND category = 'ai_generation'
        GROUP BY action ORDER BY count DESC
    ");
    $aiFallbacks = (int)$one("SELECT COUNT(*) FROM tracking_events WHERE $dateSql AND action = 'ai_fallback'");

    // ---- 10. Audience ----------------------------------------------------
    $devices = $all("SELECT device_type AS name, COUNT(*) AS count FROM tracking_sessions WHERE $dateSql GROUP BY device_type ORDER BY count DESC");
    $browsers = $all("SELECT browser AS name, COUNT(*) AS count FROM tracking_sessions WHERE $dateSql AND browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 6");
    $countries = $all("SELECT country AS name, COUNT(*) AS count FROM tracking_sessions WHERE $dateSql AND country IS NOT NULL AND country != '' GROUP BY country ORDER BY count DESC LIMIT 8");
    $hours = array_fill(0, 24, 0);
    foreach ($all("SELECT CAST(substr(created_at,12,2) AS INTEGER) AS h, COUNT(*) AS c FROM tracking_sessions WHERE $dateSql GROUP BY h") as $r) {
        $hours[(int)$r['h']] = (int)$r['c'];
    }

    // ---- 11. Top pages ---------------------------------------------------
    $topPages = $all("
        SELECT page_path AS page, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
        FROM tracking_pageviews WHERE $dateSql GROUP BY page_path ORDER BY views DESC LIMIT 8
    ");

    // ---- 12. Live stream (UTC, ISO 8601) --------------------------------
    $liveStream = [];
    foreach ($pdo->query("
        SELECT e.category, e.action, e.label, e.created_at, s.device_type, s.country
        FROM tracking_events e
        LEFT JOIN tracking_sessions s ON e.session_id = s.session_id
        ORDER BY e.id DESC LIMIT 30
    ")->fetchAll() as $r) {
        $r['created_at'] = str_replace(' ', 'T', $r['created_at']) . 'Z';
        $liveStream[] = $r;
    }

    // ---- 13. Data health -------------------------------------------------
    $cov = $pdo->query("SELECT MIN(created_at) AS first_at, MAX(created_at) AS last_at FROM tracking_events")->fetch() ?: [];
    $dbSize = @filesize(TRACKING_DB_PATH) ?: 0;

    echo json_encode([
        'success' => true,
        'range' => $range,
        'range_start' => $rangeStart,
        'range_end' => $rangeEnd,
        'generated_at' => gmdate('Y-m-d\TH:i:s\Z'),
        'overview' => [
            'visitors' => $totalVisitors,
            'returning_visitors' => $returning,
            'new_visitors' => max(0, $totalVisitors - $returning),
            'sessions' => $totalSessions,
            'pageviews' => $pageviews,
            'events' => $events,
            'active_now' => $activeNow,
            'avg_duration_seconds' => (int)round((float)$sess['avg_duration']),
            'pro_visitors' => (int)$sess['pro_visitors'],
            'signed_in_visitors' => (int)$sess['signed_in_visitors'],
            'activated_sessions' => $activatedSessions,
            'activation_rate' => $totalSessions > 0 ? round($activatedSessions / $totalSessions * 100, 1) : 0,
            'revenue' => $revenue,
            'payment_failures' => $paymentFailures,
        ],
        'trends' => $trends,
        'sources' => array_values($sources),
        'landing_pages' => $landingPages,
        'pinterest_landing' => $pinterestLanding,
        'usage_funnel' => $usageFunnel,
        'monetization_funnel' => $monetization,
        'monetization_events' => $paywallReasons,
        'top_templates' => $topTemplates,
        'top_categories' => $topCategories,
        'color_by_number' => $cbn,
        'tools' => $tools,
        'canvas_actions' => $canvasActions,
        'colors' => $colors,
        'ai' => $ai,
        'ai_fallbacks' => $aiFallbacks,
        'devices' => $devices,
        'browsers' => $browsers,
        'countries' => $countries,
        'sessions_by_hour_utc' => $hours,
        'top_pages' => $topPages,
        'live_stream' => $liveStream,
        'health' => [
            'first_event_at' => $cov['first_at'] ?? null,
            'last_event_at' => $cov['last_at'] ?? null,
            'db_size_bytes' => (int)$dbSize,
        ],
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    error_log('[tracking-stats.php] ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Failed to query tracking stats'
    ]);
}
