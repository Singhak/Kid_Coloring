/**
 * Coloro Analytics & Telemetry Client
 * 
 * Provides granular tracking for:
 * - Visitor counts & unique sessions
 * - Heartbeats & active time on site
 * - Coloring templates viewed & started
 * - Tool usage (bucket fill, chunky eraser, brush, stickers)
 * - Color selections & special glitter/rainbow patterns
 * - Canvas exports (PNG downloads, print sheets)
 * - AI generation prompts & photo conversions
 * - Monetization funnel (upgrade modal, pricing views, subscriptions)
 */

interface QueuedTelemetryItem {
  type: 'session_start' | 'heartbeat' | 'pageview' | 'event';
  session_id: string;
  visitor_id: string;
  user_id?: string | null;
  timestamp: string;
  category?: string;
  action?: string;
  label?: string | null;
  value?: number | null;
  metadata?: Record<string, any> | string;
  page_path?: string;
  page_title?: string;
  referrer?: string;
  duration_seconds?: number;
  delta_seconds?: number;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_res?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  landing_page?: string;
  is_pro?: number;
}

class TelemetryTracker {
  private visitorId: string = '';
  private sessionId: string = '';
  private userId: string | null = null;
  private isPro: boolean = false;
  private queue: QueuedTelemetryItem[] = [];
  private flushTimer: any = null;
  private heartbeatTimer: any = null;
  private lastActivityTime: number = Date.now();
  private sessionTimeoutMs: number = 30 * 60 * 1000; // 30 minutes idle timeout
  private isInitialized: boolean = false;

  constructor() {
    // Lazy initialize on first browser run
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();

    // Start session
    this.trackSessionStart();

    // Track initial pageview
    this.pageView(window.location.pathname + window.location.hash, document.title);

    // Setup periodic flush every 3.5 seconds
    this.flushTimer = setInterval(() => this.flush(), 3500);

    // Heartbeat every 45 seconds while user is active
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), 45000);

    // Activity listeners to maintain session liveness
    const onUserActivity = () => {
      this.lastActivityTime = Date.now();
    };
    window.addEventListener('pointerdown', onUserActivity, { passive: true });
    window.addEventListener('keydown', onUserActivity, { passive: true });
    window.addEventListener('scroll', onUserActivity, { passive: true });

    // Flush on page unload or tab switch
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });
    window.addEventListener('pagehide', () => this.flush(true));
    window.addEventListener('beforeunload', () => this.flush(true));

    this.isInitialized = true;
  }

  private getApiEndpoint(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('coloro.in') || hostname.includes('storywalla.com')) {
        return '/api/track.php';
      }
    }
    return '/api/track.php';
  }

  private generateId(prefix: string): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
    }
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getOrCreateVisitorId(): string {
    const key = 'coloro_vid';
    let vid = localStorage.getItem(key);
    if (!vid) {
      vid = this.generateId('vis');
      localStorage.setItem(key, vid);
    }
    return vid;
  }

  private getOrCreateSessionId(): string {
    const key = 'coloro_sid';
    const timeKey = 'coloro_sid_time';
    const now = Date.now();
    let sid = sessionStorage.getItem(key);
    const lastTime = parseInt(sessionStorage.getItem(timeKey) || '0', 10);

    if (!sid || (now - lastTime > this.sessionTimeoutMs)) {
      sid = this.generateId('sess');
      sessionStorage.setItem(key, sid);
    }
    sessionStorage.setItem(timeKey, now.toString());
    return sid;
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getUtmParams(): { source: string | null; medium: string | null; campaign: string | null } {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        source: params.get('utm_source'),
        medium: params.get('utm_medium'),
        campaign: params.get('utm_campaign')
      };
    } catch {
      return { source: null, medium: null, campaign: null };
    }
  }

  private trackSessionStart(): void {
    const utm = this.getUtmParams();
    this.enqueue({
      type: 'session_start',
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
      device_type: this.getDeviceType(),
      screen_res: `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`,
      referrer: document.referrer || '',
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      landing_page: window.location.pathname + window.location.search,
      is_pro: this.isPro ? 1 : 0
    });
  }

  private sendHeartbeat(): void {
    // Only send heartbeat if user was active in the last 2 minutes
    const now = Date.now();
    if (now - this.lastActivityTime < 120000) {
      this.enqueue({
        type: 'heartbeat',
        session_id: this.sessionId,
        visitor_id: this.visitorId,
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        delta_seconds: 45
      });
    }
  }

  public identify(userId: string | null, properties?: { isPro?: boolean }): void {
    this.userId = userId;
    if (properties && typeof properties.isPro === 'boolean') {
      this.isPro = properties.isPro;
    }
    this.event('auth', userId ? 'user_login' : 'user_logout', userId || undefined, undefined, {
      isPro: this.isPro
    });
  }

  public pageView(path?: string, title?: string): void {
    const p = path || (typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/');
    const t = title || (typeof document !== 'undefined' ? document.title : '');
    this.enqueue({
      type: 'pageview',
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
      page_path: p,
      page_title: t,
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    });
  }

  public event(
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    this.enqueue({
      type: 'event',
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
      category,
      action,
      label: label || null,
      value: typeof value === 'number' ? value : null,
      metadata
    });
  }

  // --- Convenience Tracking Helpers ---

  public trackTemplate(templateTitle: string, category: string, action: 'select_template' | 'quick_next' = 'select_template'): void {
    this.event('template', action, templateTitle, undefined, { category });
  }

  public trackTool(toolName: string, metadata?: Record<string, any>): void {
    this.event('tools', 'use_tool', toolName, undefined, metadata);
  }

  public trackColor(colorHex: string, colorName?: string, isPattern?: boolean): void {
    this.event('colors', isPattern ? 'pick_pattern' : 'pick_color', colorName || colorHex, undefined, {
      hex: colorHex,
      isPattern: Boolean(isPattern)
    });
  }

  public trackCanvas(
    action: 'flood_fill' | 'undo' | 'redo' | 'clear' | 'zoom_in' | 'zoom_out' | 'download_image' | 'print_sheet' | 'stamp_sticker',
    details?: Record<string, any>
  ): void {
    this.event('canvas', action, details?.target || undefined, details?.count || undefined, details);
  }

  public trackAI(action: 'magic_prompt' | 'instant_realistic' | 'photo_art', prompt?: string, category?: string): void {
    this.event('ai_generation', action, prompt ? prompt.substring(0, 100) : category, undefined, {
      fullPrompt: prompt,
      category
    });
  }

  public trackMonetization(
    action: 'view_pricing' | 'open_upgrade_modal' | 'click_subscribe' | 'payment_success' | 'payment_failed' | 'cancel_subscription',
    plan?: string,
    amount?: number,
    details?: Record<string, any>
  ): void {
    this.event('monetization', action, plan, amount, details);
  }

  public trackModal(modalName: string, action: 'open' | 'close'): void {
    this.event('modals', `${action}_${modalName}`, modalName);
  }

  private enqueue(item: QueuedTelemetryItem): void {
    this.queue.push(item);
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  public flush(isBeacon: boolean = false): void {
    if (this.queue.length === 0) return;

    const payload = [...this.queue];
    this.queue = [];

    const endpoint = this.getApiEndpoint();
    const bodyStr = JSON.stringify({ batch: payload });

    if (isBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([bodyStr], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
        return;
      } catch {
        // Fallback to fetch
      }
    }

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: bodyStr,
      keepalive: true
    }).catch(() => {
      // In case of network error, silently ignore to avoid interrupting the user's coloring flow
    });
  }
}

export const tracker = new TelemetryTracker();
