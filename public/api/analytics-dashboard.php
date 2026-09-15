<?php
require_once __DIR__ . '/tracking-db.php';

if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    @session_start();
}

$expectedKey = getTelemetryAdminKey();
$loginError = null;

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION['coloro_telemetry_authorized'] = false;
    unset($_SESSION['coloro_telemetry_authorized']);
    @setcookie('coloro_admin_key', '', time() - 3600, '/');
    header('Location: analytics-dashboard.php');
    exit;
}

// Handle Login Form POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $submittedKey = trim($_POST['passcode'] ?? '');
    if ($submittedKey !== '' && hash_equals($expectedKey, $submittedKey)) {
        $_SESSION['coloro_telemetry_authorized'] = true;
        @setcookie('coloro_admin_key', $submittedKey, time() + (86400 * 30), '/'); // 30 days
        header('Location: analytics-dashboard.php');
        exit;
    } else {
        $loginError = 'Invalid admin passcode. Access denied.';
    }
}

$isAuthorized = isTelemetryAuthorized();

if (!$isAuthorized):
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coloro Analytics - Restricted Area</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0F172A;
      --card-bg: #1E293B;
      --card-border: #334155;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --accent: #38BDF8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .auth-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 36px 32px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .lock-icon {
      width: 60px;
      height: 60px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }
    p {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 18px;
    }
    input[type="password"] {
      width: 100%;
      background: #0F172A;
      border: 1.5px solid var(--card-border);
      border-radius: 14px;
      padding: 14px 16px;
      color: #FFF;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      outline: none;
      transition: all 0.2s;
      text-align: center;
      letter-spacing: 2px;
    }
    input[type="password"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
    }
    button {
      width: 100%;
      background: var(--accent);
      color: #0F172A;
      border: none;
      border-radius: 14px;
      padding: 14px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover {
      background: #7DD3FC;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="auth-card">
    <div class="lock-icon">🔒</div>
    <h1>Coloro Admin Telemetry</h1>
    <p>This portal is restricted to system administrators only. Please authenticate to view visitor & feature tracking.</p>

    <?php if ($loginError): ?>
      <div class="error-msg">⚠️ <?= htmlspecialchars($loginError) ?></div>
    <?php endif; ?>

    <form method="POST">
      <input type="hidden" name="action" value="login">
      <input 
        type="password" 
        name="passcode" 
        placeholder="••••••••••••" 
        autocomplete="current-password" 
        required 
        autofocus
      >
      <button type="submit">Unlock Dashboard</button>
    </form>
  </div>
</body>
</html>
<?php
exit;
endif;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coloro Analytics & Feature Usage Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0F172A;
      --card-bg: #1E293B;
      --card-border: #334155;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --accent: #38BDF8;
      --accent-glow: rgba(56, 189, 248, 0.15);
      --success: #34D399;
      --warning: #FBBF24;
      --pink: #F472B6;
      --purple: #C084FC;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
    }
    .header-title h1 {
      font-size: 24px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-title h1 span.badge {
      font-size: 12px;
      font-weight: 700;
      background: rgba(56, 189, 248, 0.2);
      color: var(--accent);
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .header-title p {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .filter-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover {
      background: #273549;
      color: var(--text-main);
    }
    .filter-btn.active {
      background: var(--accent);
      color: #0F172A;
      border-color: var(--accent);
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: var(--accent);
    }
    .kpi-card.green::before { background: var(--success); }
    .kpi-card.pink::before { background: var(--pink); }
    .kpi-card.yellow::before { background: var(--warning); }
    .kpi-card.purple::before { background: var(--purple); }
    .kpi-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .kpi-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
      animation: pulse 1.6s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
      100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px;
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-badge {
      font-size: 11px;
      font-weight: 600;
      background: #0F172A;
      padding: 3px 8px;
      border-radius: 6px;
      color: var(--text-muted);
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      text-align: left;
      padding: 8px 12px;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .bar-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: #0F172A;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 3px;
    }
    .stream-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(51, 65, 85, 0.4);
      font-size: 12px;
    }
    .stream-item:last-child { border-bottom: none; }
    .stream-tag {
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      background: #0F172A;
      color: var(--accent);
    }
    .refresh-btn {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .refresh-btn:hover { color: var(--text-main); border-color: var(--text-muted); }
    .logout-btn {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      text-decoration: none;
      font-weight: 700;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.25);
      color: #FFF;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-title">
      <h1>
        🎨 Coloro Telemetry & Analytics
        <span class="badge">SQLite Protected</span>
      </h1>
      <p>Real-time granular visitor tracking, template engagement & feature adoption</p>
    </div>
    <div class="controls">
      <button class="filter-btn" data-range="today" onclick="setRange('today')">Today</button>
      <button class="filter-btn" data-range="yesterday" onclick="setRange('yesterday')">Yesterday</button>
      <button class="filter-btn active" data-range="7d" onclick="setRange('7d')">Last 7 Days</button>
      <button class="filter-btn" data-range="30d" onclick="setRange('30d')">Last 30 Days</button>
      <button class="filter-btn" data-range="all" onclick="setRange('all')">All Time</button>
      <button class="refresh-btn" onclick="fetchStats()">🔄 Refresh</button>
      <a href="analytics-dashboard.php?action=logout" class="logout-btn">🔒 Logout</a>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card green">
      <div class="kpi-label">Active Users Right Now</div>
      <div class="kpi-value" id="kpi-realtime">
        <span class="pulse-dot"></span>
        <span>0</span>
      </div>
      <div class="kpi-sub">Active in last 15 minutes</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Unique Visitors</div>
      <div class="kpi-value" id="kpi-visitors">0</div>
      <div class="kpi-sub" id="kpi-visitors-sub">In selected period</div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-label">Total Sessions</div>
      <div class="kpi-value" id="kpi-sessions">0</div>
      <div class="kpi-sub" id="kpi-sessions-sub">Avg duration: 0m 0s</div>
    </div>
    <div class="kpi-card pink">
      <div class="kpi-label">Granular Feature Events</div>
      <div class="kpi-value" id="kpi-events">0</div>
      <div class="kpi-sub">Fills, tools, colors & exports</div>
    </div>
    <div class="kpi-card yellow">
      <div class="kpi-label">VIP Trial / Pro Visitors</div>
      <div class="kpi-value" id="kpi-pro">0</div>
      <div class="kpi-sub">Active VIP / Subscribed</div>
    </div>
  </div>

  <!-- Row 1: Top Templates & Top Tools -->
  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <div class="card-title">📖 Top Coloring Templates Colored</div>
        <span class="card-badge" id="badge-templates">Top 10</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Template</th>
              <th>Selections</th>
              <th>Popularity</th>
            </tr>
          </thead>
          <tbody id="table-templates">
            <tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Loading data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">🛠️ Granular Tool & Canvas Usage</div>
        <span class="card-badge" id="badge-tools">Actions</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Tool / Action</th>
              <th>Uses</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody id="table-tools">
            <tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Loading data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Row 2: Colors/Patterns & Creative AI/Exports -->
  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <div class="card-title">🖍️ Popular Crayons & Special Patterns</div>
        <span class="card-badge">Picks</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Color / Pattern</th>
              <th>Picks</th>
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody id="table-colors">
            <tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Loading data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">🪄 AI Magic & Canvas Exports</div>
        <span class="card-badge">Generations</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Count</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody id="table-exports">
            <tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Loading data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Row 3: Funnel & Live Real-Time Stream -->
  <div class="grid-2">
    <div class="card">
      <div class="card-header">
        <div class="card-title">💎 VIP Upgrade & Monetization Funnel</div>
        <span class="card-badge">Conversion</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Unique Users</th>
              <th>Conversion Rate</th>
            </tr>
          </thead>
          <tbody id="table-funnel">
            <tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Loading data...</td></tr>
          </tbody>
        </table>
      </div>
      <div style="margin-top: 16px; font-size: 11px; color: var(--text-muted);">
        Devices: <span id="device-summary">Loading...</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">⚡ Live Activity Stream</div>
        <span class="card-badge">Last 30 Events</span>
      </div>
      <div id="live-stream-list" style="max-height: 280px; overflow-y: auto;">
        <div style="text-align: center; color: var(--text-muted); padding: 20px;">Loading live stream...</div>
      </div>
    </div>
  </div>

  <script>
    let currentRange = '7d';

    function setRange(range) {
      currentRange = range;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-range') === range);
      });
      fetchStats();
    }

    function formatDuration(seconds) {
      if (!seconds) return '0s';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}m ${s}s`;
    }

    async function fetchStats() {
      try {
        const res = await fetch(`tracking-stats.php?range=${currentRange}`, {
          headers: { 'X-Admin-Key': '<?= htmlspecialchars($expectedKey) ?>' }
        });
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch stats');

        renderDashboard(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    }

    function renderDashboard(data) {
      const o = data.overview || {};
      document.getElementById('kpi-realtime').innerHTML = `<span class="pulse-dot"></span> <span>${o.active_visitors_now || 0}</span>`;
      document.getElementById('kpi-visitors').textContent = (o.total_visitors || 0).toLocaleString();
      document.getElementById('kpi-sessions').textContent = (o.total_sessions || 0).toLocaleString();
      document.getElementById('kpi-sessions-sub').textContent = `Avg duration: ${formatDuration(o.avg_duration_seconds)}`;
      document.getElementById('kpi-events').textContent = (o.total_events || 0).toLocaleString();
      document.getElementById('kpi-pro').textContent = (o.pro_visitors || 0).toLocaleString();

      // Top Templates
      const tmplTbody = document.getElementById('table-templates');
      if (!data.top_templates || data.top_templates.length === 0) {
        tmplTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No templates colored yet in this timeframe</td></tr>';
      } else {
        const max = data.top_templates[0].selects_count || 1;
        tmplTbody.innerHTML = data.top_templates.map(t => `
          <tr>
            <td style="font-weight: 600;">${escapeHtml(t.template_name)}</td>
            <td>${t.selects_count}</td>
            <td style="width: 140px;">
              <div class="bar-wrapper">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${(t.selects_count / max) * 100}%;"></div>
                </div>
                <span style="font-size: 11px; color: var(--text-muted);">${t.unique_artists} kids</span>
              </div>
            </td>
          </tr>
        `).join('');
      }

      // Top Tools
      const toolsTbody = document.getElementById('table-tools');
      if (!data.top_tools || data.top_tools.length === 0) {
        toolsTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No tool interactions recorded</td></tr>';
      } else {
        const max = data.top_tools[0].count || 1;
        toolsTbody.innerHTML = data.top_tools.map(tool => `
          <tr>
            <td style="font-weight: 600;">${escapeHtml(tool.tool_name || tool.tool_action)}</td>
            <td>${tool.count}</td>
            <td style="width: 120px;">
              <div class="progress-bar">
                <div class="progress-fill" style="background: var(--purple); width: ${(tool.count / max) * 100}%;"></div>
              </div>
            </td>
          </tr>
        `).join('');
      }

      // Top Colors
      const colorsTbody = document.getElementById('table-colors');
      if (!data.top_colors || data.top_colors.length === 0) {
        colorsTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No color picks recorded</td></tr>';
      } else {
        const max = data.top_colors[0].pick_count || 1;
        colorsTbody.innerHTML = data.top_colors.map(c => `
          <tr>
            <td style="font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${c.color_or_pattern.startsWith('#') ? c.color_or_pattern : 'var(--accent)'}; border: 1px solid rgba(255,255,255,0.2);"></span>
              ${escapeHtml(c.color_or_pattern)}
            </td>
            <td>${c.pick_count}</td>
            <td style="width: 120px;">
              <div class="progress-bar">
                <div class="progress-fill" style="background: var(--pink); width: ${(c.pick_count / max) * 100}%;"></div>
              </div>
            </td>
          </tr>
        `).join('');
      }

      // Exports & AI
      const exportsTbody = document.getElementById('table-exports');
      const allCreative = [...(data.canvas_exports || []), ...(data.creative_features || [])];
      if (allCreative.length === 0) {
        exportsTbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No actions recorded</td></tr>';
      } else {
        exportsTbody.innerHTML = allCreative.map(item => `
          <tr>
            <td style="font-weight: 600;">${escapeHtml(item.action)}</td>
            <td>${item.total_count || item.count}</td>
            <td><span class="stream-tag">${item.action.includes('download') || item.action.includes('print') ? 'Canvas Export' : 'Creative'}</span></td>
          </tr>
        `).join('');
      }

      // Funnel
      const f = data.funnel || {};
      const visits = o.total_visitors || 1;
      const pricing = f.viewed_pricing || 0;
      const checkout = f.started_checkout || 0;
      const paid = f.completed_payment || 0;

      document.getElementById('table-funnel').innerHTML = `
        <tr><td>1. Total Visitors</td><td>${visits}</td><td>100%</td></tr>
        <tr><td>2. Viewed Pricing / Upgrade</td><td>${pricing}</td><td>${((pricing / visits) * 100).toFixed(1)}%</td></tr>
        <tr><td>3. Initiated Checkout</td><td>${checkout}</td><td>${pricing > 0 ? ((checkout / pricing) * 100).toFixed(1) : 0}%</td></tr>
        <tr><td>4. Successful Payment</td><td style="color: var(--success); font-weight: 700;">${paid}</td><td style="color: var(--success); font-weight: 700;">${checkout > 0 ? ((paid / checkout) * 100).toFixed(1) : 0}%</td></tr>
      `;

      // Device summary
      if (data.devices) {
        document.getElementById('device-summary').textContent = data.devices.map(d => `${d.device_type}: ${d.count}`).join(' | ');
      }

      // Live Stream
      const streamDiv = document.getElementById('live-stream-list');
      if (!data.live_stream || data.live_stream.length === 0) {
        streamDiv.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No recent events</div>';
      } else {
        streamDiv.innerHTML = data.live_stream.map(ev => `
          <div class="stream-item">
            <div>
              <span class="stream-tag">${escapeHtml(ev.category)}</span>
              <strong style="margin-left: 6px;">${escapeHtml(ev.action)}</strong>
              ${ev.label ? `<span style="color: var(--text-muted);">(${escapeHtml(ev.label)})</span>` : ''}
            </div>
            <div style="color: var(--text-muted); font-size: 11px;">
              ${ev.device_type || 'web'} • ${formatTimeAgo(ev.created_at)}
            </div>
          </div>
        `).join('');
      }
    }

    function formatTimeAgo(timeStr) {
      if (!timeStr) return '';
      const past = new Date(timeStr.replace(' ', 'T') + 'Z').getTime();
      const now = Date.now();
      const diffSec = Math.floor((now - past) / 1000);
      if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      return `${Math.floor(diffSec / 3600)}h ago`;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Auto-fetch on load and poll every 20 seconds
    fetchStats();
    setInterval(fetchStats, 20000);
  </script>
</body>
</html>
