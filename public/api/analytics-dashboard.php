<?php
require_once __DIR__ . '/tracking-db.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    @session_start();
}

$expectedKey = getTelemetryAdminKey();
$notConfigured = ($expectedKey === '');
$loginError = null;

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    unset($_SESSION['coloro_telemetry_authorized']);
    telemetryClearAuthCookie();
    header('Location: analytics-dashboard.php');
    exit;
}

// Handle Login Form POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $submittedKey = trim($_POST['passcode'] ?? '');
    if ($notConfigured) {
        $loginError = 'Telemetry admin key is not configured on the server.';
    } elseif (telemetryLoginLocked()) {
        $loginError = 'Too many failed attempts. Try again in 15 minutes.';
    } elseif ($submittedKey !== '' && hash_equals($expectedKey, $submittedKey)) {
        session_regenerate_id(true);
        $_SESSION['coloro_telemetry_authorized'] = true;
        telemetrySetAuthCookie();
        header('Location: analytics-dashboard.php');
        exit;
    } else {
        telemetryRecordLoginFailure();
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
  <meta name="robots" content="noindex,nofollow">
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
    <?php if ($notConfigured): ?>
      <div class="error-msg">⚠️ No TELEMETRY_ADMIN_KEY is configured on the server, so login is disabled. Add it to api/.env.</div>
    <?php endif; ?>

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
  <meta name="robots" content="noindex,nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coloro Analytics Dashboard</title>
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
  
    .alert { border-radius: 12px; padding: 12px 16px; font-size: 13px; margin-bottom: 16px; font-weight: 600; }
    .alert.warn { background: rgba(251,191,36,.12); border: 1px solid rgba(251,191,36,.35); color: #FCD34D; }
    .alert.danger { background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.35); color: #FCA5A5; }
    .insights { background: linear-gradient(135deg, rgba(56,189,248,.10), rgba(192,132,252,.10)); border: 1px solid var(--card-border); border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; }
    .insights h2 { font-size: 15px; margin-bottom: 10px; }
    .insights ul { list-style: none; display: grid; gap: 8px; }
    .insights li { font-size: 13px; line-height: 1.45; padding-left: 24px; position: relative; }
    .insights li::before { content: attr(data-icon); position: absolute; left: 0; }
    .health { font-size: 11px; color: var(--text-muted); margin-top: 6px; }
    .row { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr) 54px; gap: 10px; align-items: center; padding: 7px 0; font-size: 13px; border-bottom: 1px solid rgba(51,65,85,.35); }
    .row:last-child { border-bottom: none; }
    .row .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    .row .val { text-align: right; font-variant-numeric: tabular-nums; font-weight: 700; }
    .empty { text-align: center; color: var(--text-muted); font-size: 13px; padding: 18px 0; }
    .funnel-step { padding: 8px 0; border-bottom: 1px solid rgba(51,65,85,.35); }
    .funnel-step:last-child { border-bottom: none; }
    .funnel-top { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 5px; }
    .funnel-meta { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
    .chart { display: flex; align-items: flex-end; gap: 3px; height: 150px; padding-top: 8px; }
    .chart .col { flex: 1; min-width: 3px; background: var(--accent); border-radius: 3px 3px 0 0; min-height: 2px; opacity: .85; }
    .chart .col:hover { opacity: 1; }
    .chart-axis { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 6px; }
    .full { margin-bottom: 24px; }
    .card-note { font-size: 11px; color: var(--text-muted); margin-top: 10px; line-height: 1.4; }
    @media (max-width: 480px) { .grid-2 { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">
      <h1>🎨 Coloro Analytics <span class="badge">UTC</span></h1>
      <p>Who visits, what they colour, and where they drop off.</p>
      <div class="health" id="health">Loading…</div>
    </div>
    <div class="controls">
      <button class="filter-btn" data-range="today" onclick="setRange('today')">Today</button>
      <button class="filter-btn" data-range="yesterday" onclick="setRange('yesterday')">Yesterday</button>
      <button class="filter-btn active" data-range="7d" onclick="setRange('7d')">7 days</button>
      <button class="filter-btn" data-range="30d" onclick="setRange('30d')">30 days</button>
      <button class="filter-btn" data-range="all" onclick="setRange('all')">All time</button>
      <button class="refresh-btn" onclick="fetchStats()">🔄 Refresh</button>
      <a href="analytics-dashboard.php?action=logout" class="logout-btn">🔒 Logout</a>
    </div>
  </div>

  <div id="alerts"></div>

  <div class="insights" id="insights" style="display:none">
    <h2>💡 What the data says</h2>
    <ul id="insight-list"></ul>
  </div>

  <div class="kpi-grid" id="kpis"></div>

  <div class="card full">
    <div class="card-header">
      <div class="card-title">📈 Visitors per day</div>
      <span class="card-badge" id="trend-badge"></span>
    </div>
    <div class="chart" id="trend-chart"></div>
    <div class="chart-axis" id="trend-axis"></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">🧭 Product funnel</div><span class="card-badge">unique visitors</span></div>
      <div id="usage-funnel"></div>
      <div class="card-note">Where visitors stop between landing and saving their artwork.</div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">💎 Upgrade funnel</div><span class="card-badge">unique visitors</span></div>
      <div id="money-funnel"></div>
      <div class="card-note">A paywall hit is any tap on a VIP-only feature (AI, export, stickers, patterns) or the pricing page.</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">🚪 Where visitors come from</div><span class="card-badge">sessions</span></div>
      <div id="sources"></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📍 Landing pages</div><span class="card-badge">sessions</span></div>
      <div id="landing"></div>
      <div id="pinterest-wrap" style="margin-top:14px; display:none">
        <div class="kpi-label" style="margin-bottom:8px">Pinterest pin landings by category</div>
        <div id="pinterest"></div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">📖 Most opened templates</div><span class="card-badge">opens</span></div>
      <div id="templates"></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🗂️ Most opened categories</div><span class="card-badge">opens</span></div>
      <div id="categories"></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">🔢 Colour by Number</div><span class="card-badge">events</span></div>
      <div id="cbn"></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🪄 AI features</div><span class="card-badge">uses</span></div>
      <div id="ai"></div>
      <div class="card-note" id="ai-note"></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">🛠️ Tools &amp; canvas actions</div><span class="card-badge">uses</span></div>
      <div id="tools"></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🖍️ Favourite colours &amp; patterns</div><span class="card-badge">picks</span></div>
      <div id="colors"></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-header"><div class="card-title">📱 Audience</div></div>
      <div class="kpi-label">Devices</div><div id="devices" style="margin-bottom:12px"></div>
      <div class="kpi-label">Browsers</div><div id="browsers" style="margin-bottom:12px"></div>
      <div class="kpi-label">Countries</div><div id="countries"></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">🕐 Sessions by hour (UTC)</div><span class="card-badge">best time to post</span></div>
      <div class="chart" id="hour-chart"></div>
      <div class="chart-axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
      <div class="kpi-label" style="margin-top:18px">Top pages</div>
      <div id="pages"></div>
    </div>
  </div>

  <div class="card full">
    <div class="card-header"><div class="card-title">⚡ Live activity</div><span class="card-badge">last 30 events</span></div>
    <div id="live" style="max-height:300px; overflow-y:auto"></div>
  </div>

  <script>
    let currentRange = '7d';
    let timer = null;

    const esc = (v) => String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const n = (v) => Number(v || 0);
    const fmt = (v) => n(v).toLocaleString();
    const pct = (a, b) => (b > 0 ? (a / b) * 100 : 0);
    const pretty = (s) => { const t = String(s || '').replace(/_/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); };
    const dur = (sec) => { sec = n(sec); if (!sec) return '–'; const m = Math.floor(sec / 60); return m ? `${m}m ${sec % 60}s` : `${sec}s`; };
    const money = (v) => '₹' + n(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
    const utc = (s) => Date.parse(String(s).replace(' ', 'T') + (/Z$/.test(s) ? '' : 'Z'));

    function setRange(range) {
      currentRange = range;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-range') === range));
      fetchStats();
    }

    function ago(iso) {
      const t = utc(iso);
      if (!t) return '';
      const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
      if (s < 60) return s + 's ago';
      if (s < 3600) return Math.floor(s / 60) + 'm ago';
      if (s < 86400) return Math.floor(s / 3600) + 'h ago';
      return Math.floor(s / 86400) + 'd ago';
    }

    function setHtml(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

    // Label + bar + value list. rows: [{label, value, title?, swatch?}]. Every dynamic value goes through esc().
    function barList(id, rows, color, emptyText) {
      if (!rows.length) { setHtml(id, `<div class="empty">${esc(emptyText || 'No data in this period')}</div>`); return; }
      const max = Math.max(...rows.map(r => r.value), 1);
      setHtml(id, rows.map(r => `
        <div class="row" title="${esc(r.title || r.label)}">
          <div class="name">${r.swatch ? `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:1px solid rgba(255,255,255,.25);background:${esc(r.swatch)}"></span>` : ''}${esc(r.label)}</div>
          <div class="progress-bar"><div class="progress-fill" style="background:${color};width:${(r.value / max) * 100}%"></div></div>
          <div class="val">${fmt(r.value)}</div>
        </div>`).join(''));
    }

    function funnel(id, steps, color) {
      const top = steps[0] ? n(steps[0].users) : 0;
      setHtml(id, steps.map((s, i) => {
        const u = n(s.users);
        const prev = i > 0 ? n(steps[i - 1].users) : u;
        const dropped = i > 0 && prev > 0 ? 100 - pct(u, prev) : 0;
        return `<div class="funnel-step">
          <div class="funnel-top"><span>${i + 1}. ${esc(s.stage)}</span><span>${fmt(u)}</span></div>
          <div class="progress-bar"><div class="progress-fill" style="background:${color};width:${pct(u, top)}%"></div></div>
          <div class="funnel-meta">${i === 0 ? 'All visitors' : `${pct(u, top).toFixed(1)}% of visitors · ${pct(u, prev).toFixed(1)}% of previous step${dropped > 50 ? ' · ⚠️ ' + dropped.toFixed(0) + '% drop' : ''}`}</div>
        </div>`;
      }).join(''));
    }

    function columns(id, values, labelFn) {
      const max = Math.max(...values, 1);
      setHtml(id, values.map((v, i) => `<div class="col" style="height:${(v / max) * 100}%" title="${esc(labelFn(i, v))}"></div>`).join(''));
    }

    function buildInsights(d) {
      const o = d.overview, out = [];
      if (o.visitors === 0) return out;
      out.push(['👥', `<b>${fmt(o.visitors)}</b> visitors (${fmt(o.new_visitors)} new, ${fmt(o.returning_visitors)} returning) made <b>${fmt(o.sessions)}</b> sessions.`]);
      out.push(['🎨', `<b>${o.activation_rate}%</b> of sessions actually coloured something (${fmt(o.activated_sessions)} of ${fmt(o.sessions)}).` + (o.activation_rate < 40 ? ' Low activation: the first screen may not invite a first tap.' : '')]);
      const f = d.usage_funnel;
      let worst = null;
      for (let i = 1; i < f.length; i++) {
        const loss = 100 - pct(n(f[i].users), n(f[i - 1].users));
        if (n(f[i - 1].users) >= 5 && (!worst || loss > worst.loss)) worst = { loss, from: f[i - 1].stage, to: f[i].stage };
      }
      if (worst) out.push(['🕳️', `Biggest drop-off: <b>${esc(worst.from)}</b> → <b>${esc(worst.to)}</b> loses ${worst.loss.toFixed(0)}% of visitors.`]);
      if (d.sources.length) { const s = d.sources[0]; out.push(['🚪', `Top source: <b>${esc(s.source)}</b> with ${fmt(s.sessions)} sessions (${pct(s.sessions, o.sessions).toFixed(0)}%).`]); }
      if (d.top_templates.length) out.push(['📖', `Most opened template: <b>${esc(d.top_templates[0].name)}</b> (${fmt(d.top_templates[0].opens)} opens).`]);
      const hours = d.sessions_by_hour_utc, peak = Math.max(...hours);
      if (peak > 0) {
        const h = hours.indexOf(peak);
        const ist = new Date(Date.UTC(2000, 0, 1, h, 0) + 5.5 * 3600 * 1000);
        out.push(['🕐', `Busiest hour is <b>${String(h).padStart(2, '0')}:00 UTC</b> (${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')} IST). Schedule pins just before it.`]);
      }
      const m = d.monetization_funnel;
      if (n(m[1].users) > 0) out.push(['💎', `${fmt(m[1].users)} visitors hit a paywall; ${fmt(m[2].users)} clicked subscribe; ${fmt(m[3].users)} paid` + (o.revenue ? ` (${money(o.revenue)})` : '') + '.']);
      if (o.payment_failures > 0) out.push(['⚠️', `<b>${o.payment_failures}</b> payment failure${o.payment_failures > 1 ? 's' : ''} recorded. Check checkout errors.`]);
      return out;
    }

    function render(d) {
      const o = d.overview;

      const kpi = (cls, label, value, sub) => `<div class="kpi-card ${cls}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-sub">${sub}</div></div>`;
      setHtml('kpis', [
        kpi('green', 'Active now', `<span class="pulse-dot"></span><span>${fmt(o.active_now)}</span>`, 'Visitors in the last 15 min'),
        kpi('', 'Visitors', fmt(o.visitors), `${fmt(o.new_visitors)} new · ${fmt(o.returning_visitors)} returning`),
        kpi('purple', 'Sessions', fmt(o.sessions), `Avg time ${dur(o.avg_duration_seconds)} · ${fmt(o.pageviews)} pageviews`),
        kpi('pink', 'Activation', o.activation_rate + '%', `${fmt(o.activated_sessions)} sessions coloured something`),
        kpi('', 'Signed in', fmt(o.signed_in_visitors), `${o.visitors ? pct(o.signed_in_visitors, o.visitors).toFixed(0) : 0}% of visitors`),
        kpi('yellow', 'Pro / trial', fmt(o.pro_visitors), 'Visitors with an active plan'),
        kpi('green', 'Revenue', money(o.revenue), `${fmt(o.payment_failures)} failed payments`),
      ].join(''));

      const ins = buildInsights(d);
      document.getElementById('insights').style.display = ins.length ? '' : 'none';
      setHtml('insight-list', ins.map(([i, t]) => `<li data-icon="${i}">${t}</li>`).join(''));

      const alerts = [];
      if (!d.health.first_event_at) {
        alerts.push('<div class="alert warn">No events recorded yet. Open the app in another tab and use it, then refresh.</div>');
      } else if (Date.now() - utc(d.health.last_event_at) > 6 * 3600 * 1000) {
        alerts.push(`<div class="alert warn">Last event was ${esc(ago(d.health.last_event_at))}. If the site is getting traffic, tracking may be broken (blocked endpoint or tracker not deployed).</div>`);
      }
      setHtml('alerts', alerts.join(''));
      setHtml('health', `Data since ${esc(d.health.first_event_at || '–')} UTC · DB ${(d.health.db_size_bytes / 1048576).toFixed(2)} MB · updated ${new Date(d.generated_at).toLocaleTimeString()}`);

      const t = d.trends;
      columns('trend-chart', t.map(x => x.visitors), (i, v) => `${t[i].date}: ${v} visitors, ${t[i].sessions} sessions, ${t[i].actions} colouring actions`);
      setHtml('trend-axis', t.length ? `<span>${esc(t[0].date)}</span><span>${esc(t[t.length - 1].date)}</span>` : '');
      setHtml('trend-badge', `${t.length} day${t.length === 1 ? '' : 's'}`);

      funnel('usage-funnel', d.usage_funnel, 'var(--accent)');
      funnel('money-funnel', d.monetization_funnel, 'var(--success)');

      barList('sources', d.sources.map(s => ({ label: s.source, value: n(s.sessions) })), 'var(--accent)');
      barList('landing', d.landing_pages.map(s => ({ label: s.page || '/', value: n(s.sessions) })), 'var(--purple)');
      document.getElementById('pinterest-wrap').style.display = d.pinterest_landing.length ? '' : 'none';
      barList('pinterest', d.pinterest_landing.map(s => ({ label: s.category, value: n(s.sessions) })), 'var(--pink)');

      barList('templates', d.top_templates.map(x => ({ label: x.name, value: n(x.opens), title: `${x.name} · ${x.artists} kids` })), 'var(--accent)', 'No templates opened in this period');
      barList('categories', d.top_categories.map(x => ({ label: x.name, value: n(x.opens), title: `${x.name} · ${x.artists} kids` })), 'var(--warning)', 'No categories opened in this period');

      barList('cbn', d.color_by_number.map(x => ({ label: pretty(x.action), value: n(x.count), title: `${x.users} users` })), 'var(--purple)', 'No Colour-by-Number activity');
      barList('ai', d.ai.map(x => ({ label: pretty(x.action), value: n(x.count), title: `${x.users} users` })), 'var(--pink)', 'No AI generations');
      setHtml('ai-note', d.ai_fallbacks ? `${fmt(d.ai_fallbacks)} Colour-by-Number AI requests fell back to the default picture.` : '');

      const toolRows = [
        ...d.tools.map(x => ({ label: pretty(x.name), value: n(x.uses), title: `${x.users} users` })),
        ...d.canvas_actions.map(x => ({ label: pretty(x.action), value: n(x.count), title: `${x.users} users` })),
      ].sort((a, b) => b.value - a.value).slice(0, 12);
      barList('tools', toolRows, 'var(--purple)', 'No tool usage recorded');

      barList('colors', d.colors.map(c => ({ label: c.name + (c.is_pattern ? ' (pattern)' : ''), value: c.picks, swatch: c.hex || (c.is_pattern ? 'linear-gradient(135deg,#F472B6,#38BDF8)' : null) })), 'var(--pink)', 'No colour picks recorded');

      barList('devices', d.devices.map(x => ({ label: pretty(x.name), value: n(x.count) })), 'var(--accent)');
      barList('browsers', d.browsers.map(x => ({ label: x.name, value: n(x.count) })), 'var(--purple)');
      barList('countries', d.countries.map(x => ({ label: x.name, value: n(x.count) })), 'var(--success)', 'No country data (needs Cloudflare or GeoIP headers)');

      columns('hour-chart', d.sessions_by_hour_utc, (i, v) => `${String(i).padStart(2, '0')}:00 UTC: ${v} sessions`);
      barList('pages', d.top_pages.map(x => ({ label: x.page, value: n(x.views), title: `${x.visitors} visitors` })), 'var(--accent)');

      setHtml('live', d.live_stream.length ? d.live_stream.map(ev => `
        <div class="stream-item">
          <div><span class="stream-tag">${esc(ev.category)}</span>
            <strong style="margin-left:6px">${esc(pretty(ev.action))}</strong>
            ${ev.label ? `<span style="color:var(--text-muted)"> (${esc(ev.label)})</span>` : ''}</div>
          <div style="color:var(--text-muted);font-size:11px">${esc(ev.device_type || 'web')}${ev.country ? ' · ' + esc(ev.country) : ''} · ${esc(ago(ev.created_at))}</div>
        </div>`).join('') : '<div class="empty">No recent events</div>');
    }

    // The SQLite file must never be downloadable. HTML responses are just the SPA fallback page, so ignore those.
    async function checkDbExposure() {
      try {
        const res = await fetch('data/tracking.db', { method: 'HEAD', cache: 'no-store' });
        const ct = res.headers.get('content-type') || '';
        if (res.ok && !/text\/html/i.test(ct)) {
          document.getElementById('alerts').insertAdjacentHTML('afterbegin',
            '<div class="alert danger">🚨 The tracking database is publicly downloadable at /api/data/tracking.db. Block /api/data/ in your web server config (nginx: <code>location /api/data/ { deny all; }</code>) or move the database outside the web root.</div>');
        }
      } catch (e) { /* unreachable = fine */ }
    }

    async function fetchStats() {
      try {
        const res = await fetch('tracking-stats.php?range=' + encodeURIComponent(currentRange), { credentials: 'same-origin', cache: 'no-store' });
        if (res.status === 401) { window.location.reload(); return; }
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
        render(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setHtml('alerts', `<div class="alert danger">Could not load stats: ${esc(err.message)}</div>`);
      }
    }

    fetchStats().then(checkDbExposure);
    timer = setInterval(() => { if (!document.hidden) fetchStats(); }, 30000);
  </script>
</body>
</html>
