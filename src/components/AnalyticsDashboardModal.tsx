import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  RefreshCw, 
  BarChart3, 
  Users, 
  Activity, 
  Clock, 
  Sparkles, 
  Download, 
  Crown, 
  ExternalLink,
  Layers,
  Palette,
  Eye
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    total_visitors: number;
    total_sessions: number;
    total_pageviews: number;
    total_events: number;
    active_visitors_now: number;
    avg_duration_seconds: number;
    pro_visitors: number;
  };
  top_templates: Array<{ template_name: string; selects_count: number; unique_artists: number }>;
  top_tools: Array<{ tool_action: string; tool_name: string; count: number }>;
  top_colors: Array<{ color_or_pattern: string; pick_count: number }>;
  canvas_exports: Array<{ action: string; total_count: number }>;
  creative_features: Array<{ action: string; count: number }>;
  funnel: {
    total_visits: number;
    viewed_pricing: number;
    started_checkout: number;
    completed_payment: number;
  };
  devices: Array<{ device_type: string; count: number }>;
  live_stream: Array<{
    category: string;
    action: string;
    label: string | null;
    created_at: string;
    device_type: string;
  }>;
}

interface AnalyticsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsDashboardModal: React.FC<AnalyticsDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [range, setRange] = useState<'today' | 'yesterday' | '7d' | '30d' | 'all'>('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tracking-stats.php?range=${range}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load telemetry stats');
      }
    } catch (err: any) {
      setError(err.message || 'Could not connect to tracking backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, range]);

  if (!isOpen) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  const o = data?.overview;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-[#0F172A] text-[#F8FAFC] rounded-3xl border border-[#334155] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155] bg-[#1E293B]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#38BDF8] to-[#818CF8] flex items-center justify-center text-[#0F172A] shadow-md">
                <BarChart3 className="w-5 h-5 font-black" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                  <span>Coloro Live Telemetry</span>
                  <span className="text-[10px] uppercase font-bold bg-[#38BDF8]/20 text-[#38BDF8] px-2 py-0.5 rounded-full border border-[#38BDF8]/30">
                    SQLite Granular
                  </span>
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Granular feature usage, template engagement & visitor analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/analytics-dashboard.php"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#38BDF8] hover:text-white px-2.5 py-1.5 rounded-xl border border-[#38BDF8]/30 hover:bg-[#38BDF8]/10 transition-colors"
                title="Open standalone web dashboard"
              >
                <span>Full Web View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={fetchStats}
                disabled={isLoading}
                className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Refresh stats"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date Filter Bar */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#334155]/60 bg-[#1E293B]/30 overflow-x-auto">
            <span className="text-xs font-bold text-[#94A3B8] mr-1 shrink-0">Timeframe:</span>
            {(['today', 'yesterday', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  range === r
                    ? 'bg-[#38BDF8] text-[#0F172A]'
                    : 'bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155]'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'yesterday' ? 'Yesterday' : r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#34D399] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping inline-block" />
                  Live Now
                </div>
                <div className="text-2xl font-black mt-1 text-white">
                  {o?.active_visitors_now || 0}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Last 15 minutes</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <div className="text-[11px] font-bold text-[#38BDF8] uppercase flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Visitors
                </div>
                <div className="text-2xl font-black mt-1 text-white">
                  {o?.total_visitors || 0}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">{o?.total_sessions || 0} sessions</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <div className="text-[11px] font-bold text-[#C084FC] uppercase flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Features
                </div>
                <div className="text-2xl font-black mt-1 text-white">
                  {o?.total_events || 0}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Granular events</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <div className="text-[11px] font-bold text-[#FBBF24] uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Avg Duration
                </div>
                <div className="text-2xl font-black mt-1 text-white">
                  {formatDuration(o?.avg_duration_seconds)}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Time on canvas</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1E293B] border border-[#334155] col-span-2 sm:col-span-1">
                <div className="text-[11px] font-bold text-[#F472B6] uppercase flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  VIP Trial
                </div>
                <div className="text-2xl font-black mt-1 text-white">
                  {o?.pro_visitors || 0}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">Active VIP users</div>
              </div>
            </div>

            {/* Granular Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Templates Colored */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#38BDF8]" />
                  <span>Top Coloring Pages Colored</span>
                </h3>
                <div className="space-y-2">
                  {(!data?.top_templates || data.top_templates.length === 0) ? (
                    <p className="text-xs text-[#94A3B8] py-4 text-center">No template selections recorded yet</p>
                  ) : (
                    data.top_templates.slice(0, 7).map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#334155]/40">
                        <span className="font-semibold text-white truncate max-w-[200px]">{t.template_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#38BDF8] font-bold">{t.selects_count} starts</span>
                          <span className="text-[10px] text-[#94A3B8]">({t.unique_artists} kids)</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Granular Tool & Canvas Usage */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C084FC]" />
                  <span>Tool & Feature Engagement</span>
                </h3>
                <div className="space-y-2">
                  {(!data?.top_tools || data.top_tools.length === 0) ? (
                    <p className="text-xs text-[#94A3B8] py-4 text-center">No tool events recorded</p>
                  ) : (
                    data.top_tools.slice(0, 7).map((tool, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#334155]/40">
                        <span className="font-semibold text-white capitalize">{tool.tool_name || tool.tool_action}</span>
                        <span className="text-[#C084FC] font-bold">{tool.count} times</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Most Popular Colors */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#F472B6]" />
                  <span>Popular Crayons & Glitter Patterns</span>
                </h3>
                <div className="space-y-2">
                  {(!data?.top_colors || data.top_colors.length === 0) ? (
                    <p className="text-xs text-[#94A3B8] py-4 text-center">No color picks recorded</p>
                  ) : (
                    data.top_colors.slice(0, 6).map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#334155]/40">
                        <span className="font-semibold text-white flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full inline-block border border-white/20"
                            style={{ background: c.color_or_pattern.startsWith('#') ? c.color_or_pattern : '#38BDF8' }}
                          />
                          {c.color_or_pattern}
                        </span>
                        <span className="text-[#F472B6] font-bold">{c.pick_count} picks</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Canvas Downloads & Exports */}
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155]">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#34D399]" />
                  <span>Canvas Exports & Prints</span>
                </h3>
                <div className="space-y-2">
                  {(!data?.canvas_exports || data.canvas_exports.length === 0) ? (
                    <p className="text-xs text-[#94A3B8] py-4 text-center">No exports yet</p>
                  ) : (
                    data.canvas_exports.map((exp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#334155]/40">
                        <span className="font-semibold text-white capitalize">{exp.action.replace('_', ' ')}</span>
                        <span className="text-[#34D399] font-bold">{exp.total_count} files</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Live Real-time Stream */}
            <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#334155]">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#38BDF8]" />
                <span>Live Event Stream (Latest 15)</span>
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {(!data?.live_stream || data.live_stream.length === 0) ? (
                  <p className="text-xs text-[#94A3B8] py-2 text-center">No live events</p>
                ) : (
                  data.live_stream.slice(0, 15).map((ev, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b border-[#334155]/30">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-[#0F172A] text-[#38BDF8] font-bold uppercase text-[9px]">
                          {ev.category}
                        </span>
                        <span className="font-semibold text-white">{ev.action}</span>
                        {ev.label && <span className="text-[#94A3B8]">({ev.label})</span>}
                      </div>
                      <span className="text-[10px] text-[#94A3B8] shrink-0">
                        {ev.device_type} • {ev.created_at.substring(11, 19)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyticsDashboardModal;
