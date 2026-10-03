import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Template, ColorScheme } from '../types';
import { buildNumberPalette, pickScheme, basicColorName } from '../constants/colorByNumberTemplates';
import { playPop, playFanfare } from '../services/soundEffects';
import { tracker } from '../services/tracker';
import { printNumberSheet } from '../services/pdfExporter';

interface NumberColoringPlayerProps {
  template: Template;
  resetTrigger?: number;
  onBackToLibrary?: () => void;
  /** The player registers its print action here so the app's Print button can call it. */
  printRef?: React.MutableRefObject<(() => boolean) | null>;
}

interface LabelSpot {
  x: number;
  y: number;
  r: number; // radius of the largest circle that fits inside the visible part of the region
}

const GRID = 36;
const MAX_BADGE_R = 34;
const MIN_BADGE_R = 12;

/** Readable text color for a badge drawn on a given background hex. */
const inkFor = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#2D3436' : '#FFFFFF';
};

/**
 * Finds, for every path, the point deepest inside its *visible* area (not covered by paths painted
 * after it) so the number badge always sits inside the region the child will actually tap.
 */
function computeLabelSpots(svg: SVGSVGElement, ids: string[]): Record<string, LabelSpot> {
  const els = ids.map(id => svg.querySelector<SVGGeometryElement>(`[data-region="${id}"]`));
  const spots: Record<string, LabelSpot> = {};

  ids.forEach((id, idx) => {
    const el = els[idx];
    if (!el) return;
    const box = el.getBBox();
    const stepX = box.width / GRID;
    const stepY = box.height / GRID;
    const above = els.slice(idx + 1).filter(Boolean) as SVGGeometryElement[];

    const inside: { x: number; y: number }[] = [];
    const outside: { x: number; y: number }[] = [];
    const pt = svg.createSVGPoint();
    for (let i = -1; i <= GRID; i++) {
      for (let j = -1; j <= GRID; j++) {
        pt.x = box.x + (i + 0.5) * stepX;
        pt.y = box.y + (j + 0.5) * stepY;
        const visible = el.isPointInFill(pt) && !above.some(a => a.isPointInFill(pt));
        (visible ? inside : outside).push({ x: pt.x, y: pt.y });
      }
    }
    if (inside.length === 0) return;

    let best = inside[0];
    let bestD = -1;
    for (const p of inside) {
      let d = Infinity;
      for (const o of outside) {
        const dd = (p.x - o.x) ** 2 + (p.y - o.y) ** 2;
        if (dd < d) d = dd;
      }
      if (d > bestD) {
        bestD = d;
        best = p;
      }
    }
    spots[id] = { x: best.x, y: best.y, r: Math.sqrt(bestD) };
  });
  return spots;
}

const NumberColoringPlayer: React.FC<NumberColoringPlayerProps> = ({ template, resetTrigger, onBackToLibrary, printRef }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scheme, setScheme] = useState<ColorScheme | undefined>(() => pickScheme(template));
  const [filled, setFilled] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [spots, setSpots] = useState<Record<string, LabelSpot>>({});
  const [message, setMessage] = useState<string>('Pick a number, then tap its spots!');

  const palette = useMemo(() => (scheme ? buildNumberPalette(template, scheme) : []), [template, scheme]);
  const numberByPath = useMemo(() => {
    const m: Record<string, number> = {};
    palette.forEach(e => e.pathIds.forEach(id => (m[id] = e.number)));
    return m;
  }, [palette]);
  const colorByNumber = useMemo(() => Object.fromEntries(palette.map(e => [e.number, e.color])), [palette]);

  const restart = useCallback((nextScheme: ColorScheme | undefined) => {
    setScheme(nextScheme);
    setFilled(new Set());
    setSelected(null);
    setWrongId(null);
    setMessage('Pick a number, then tap its spots!');
  }, []);

  // New template -> new random scheme
  useEffect(() => {
    restart(pickScheme(template));
  }, [template, restart]);

  // "Clear" from the toolbar -> start over with the same colors
  useEffect(() => {
    if (resetTrigger !== undefined) restart(scheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  // Place badges once the paths are in the DOM
  useLayoutEffect(() => {
    if (svgRef.current) setSpots(computeLabelSpots(svgRef.current, template.paths.map(p => p.id)));
  }, [template]);

  // Print action: blank numbered page with a number -> color name key
  useEffect(() => {
    if (!printRef || !scheme) return;
    printRef.current = () =>
      printNumberSheet(
        template,
        palette,
        (Object.entries(spots) as [string, LabelSpot][]).map(([pathId, s]) => ({
          pathId,
          x: s.x,
          y: s.y,
          r: Math.max(MIN_BADGE_R, Math.min(MAX_BADGE_R, s.r * 0.75)),
        })),
        scheme.name
      );
    return () => {
      printRef.current = null;
    };
  }, [printRef, template, scheme, palette, spots]);

  const total = template.paths.filter(p => numberByPath[p.id]).length;
  const isDone = total > 0 && filled.size === total;

  const handleRegionTap = (id: string, event: React.PointerEvent) => {
    if (filled.has(id) || isDone) return;
    const want = numberByPath[id];
    if (selected === null) {
      setSelected(want);
      setMessage(`Use number ${want}!`);
      playPop(440);
      return;
    }
    if (selected === want) {
      const next = new Set(filled).add(id);
      setFilled(next);
      playPop(660);
      tracker.event('color_by_number', 'region_filled', template.name, undefined, { number: want });
      const left = palette.find(e => e.number === want)!.pathIds.filter(p => !next.has(p)).length;
      setMessage(left > 0 ? `Great! ${left} more for number ${want}` : `Number ${want} is done! Pick the next one.`);
      if (left === 0) setSelected(null);
      if (next.size === total) {
        playFanfare();
        tracker.event('color_by_number', 'completed', template.name, undefined, { scheme: scheme?.id });
        try {
          confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
        } catch {
          /* confetti is decorative */
        }
      } else {
        try {
          confetti({
            particleCount: 18,
            spread: 40,
            origin: { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight },
          });
        } catch {
          /* ignore */
        }
      }
    } else {
      setWrongId(id);
      setMessage(`That spot is number ${want}. Try number ${want}!`);
      window.setTimeout(() => setWrongId(null), 450);
    }
  };

  if (!scheme) return null;

  return (
    <div className="w-full h-full flex flex-col items-center gap-2 min-h-0">
      <div className="text-xs sm:text-sm font-black text-[#2D3436] bg-white/90 border-2 border-[#EBE8DC] rounded-full px-3 py-1 shadow-xs text-center">
        {message}
      </div>

      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox={template.viewBox}
          className="max-h-full max-w-full aspect-square bg-white rounded-2xl shadow-md touch-manipulation select-none"
          style={{ height: '100%' }}
        >
          {template.paths.map(p => {
            const num = numberByPath[p.id];
            const isFilled = filled.has(p.id);
            const isHint = selected !== null && num === selected && !isFilled;
            return (
              <path
                key={p.id}
                data-region={p.id}
                d={p.d}
                fill={isFilled ? colorByNumber[num] : isHint ? '#FFF3BF' : '#FFFFFF'}
                stroke="#1A1A1A"
                strokeWidth={p.strokeWidth ?? 6}
                strokeLinejoin="round"
                className={`cursor-pointer transition-[fill] duration-300 ${wrongId === p.id ? 'cbn-shake' : ''}`}
                onPointerDown={e => handleRegionTap(p.id, e)}
              />
            );
          })}

          {/* Number badges: centered in each region's visible area, hidden once filled */}
          {template.paths.map(p => {
            const spot = spots[p.id];
            const num = numberByPath[p.id];
            if (!spot || !num || filled.has(p.id)) return null;
            const r = Math.max(MIN_BADGE_R, Math.min(MAX_BADGE_R, spot.r * 0.75));
            const isCurrent = selected === num;
            return (
              <g key={`badge-${p.id}`} pointerEvents="none">
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={r}
                  fill={isCurrent ? '#FFD93D' : '#FFFFFF'}
                  stroke="#2D3436"
                  strokeWidth={3}
                />
                <text
                  x={spot.x}
                  y={spot.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={r * 1.15}
                  fontWeight={900}
                  fill="#2D3436"
                  fontFamily="inherit"
                >
                  {num}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Numbered palette: only the colors this picture needs */}
      <div className="shrink-0 flex flex-wrap items-center justify-center gap-2 p-2 bg-white/90 border-2 border-[#EBE8DC] rounded-2xl shadow-sm">
        {palette.map(e => {
          const remaining = e.pathIds.filter(id => !filled.has(id)).length;
          const done = remaining === 0;
          const isSel = selected === e.number;
          return (
            <div key={e.number} className="flex flex-col items-center gap-0.5">
            <button
              onClick={() => {
                if (done) return;
                playPop(520);
                setSelected(e.number);
                setMessage(`Tap every spot marked ${e.number}!`);
              }}
              aria-label={`Color number ${e.number}`}
              className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full border-4 font-black text-base sm:text-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                isSel ? 'border-[#2D3436] scale-110 shadow-lg' : 'border-white shadow-md'
              } ${done ? 'opacity-40' : ''}`}
              style={{ backgroundColor: e.color, color: inkFor(e.color) }}
            >
              {done ? '✓' : e.number}
            </button>
            <span className="text-[10px] sm:text-xs font-black text-[#636E72]">{basicColorName(e.color).name}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-24 mx-auto w-fit z-30 bg-white border-4 border-[#FFD93D] rounded-3xl shadow-xl px-5 py-3 text-center"
          >
            <div className="text-lg font-black text-[#2D3436]">🎉 Amazing! {scheme.name} is done!</div>
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={() => restart(pickScheme(template, scheme.id))}
                className="px-4 py-1.5 rounded-full bg-[#EC4899] text-white font-black text-sm cursor-pointer active:scale-95"
              >
                🎨 New colors
              </button>
              {onBackToLibrary && (
                <button
                  onClick={onBackToLibrary}
                  className="px-4 py-1.5 rounded-full bg-[#F7F5EC] text-[#2D3436] font-black text-sm border-2 border-[#EBE8DC] cursor-pointer active:scale-95"
                >
                  More pictures
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes cbn-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        .cbn-shake { animation: cbn-shake 0.4s ease; }
      `}</style>
    </div>
  );
};

export default NumberColoringPlayer;
