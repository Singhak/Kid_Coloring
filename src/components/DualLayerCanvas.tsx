/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { SvgPath } from '../types';
import { performFloodFill } from '../services/floodFill';
import { StickerItem } from './StickerStampsModal';
import ColorByNumberOverlay, { NumberTarget } from './ColorByNumberOverlay';
import { playPop, playFanfare, playChime } from '../services/soundEffects';
import { COLORS } from '../constants';

interface DualLayerCanvasProps {
  paths: SvgPath[];
  viewBox: string;
  imageUrl?: string | null;
  selectedColor: string;
  paintCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  lineArtCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onHistoryPush: (dataUrl: string) => void;
  restoredDataUrl: string | null;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  selectedSticker?: StickerItem | null;
  onClearSticker?: () => void;
  isColorByNumber?: boolean;
  onToggleColorByNumber?: (active: boolean) => void;
}

const INTERNAL_WIDTH = 1000;
const INTERNAL_HEIGHT = 1000;

const DualLayerCanvas: React.FC<DualLayerCanvasProps> = ({
  paths,
  viewBox,
  imageUrl,
  selectedColor,
  paintCanvasRef,
  lineArtCanvasRef,
  onHistoryPush,
  restoredDataUrl,
  scale,
  setScale,
  pan,
  setPan,
  selectedSticker,
  onClearSticker,
  isColorByNumber = false,
  onToggleColorByNumber
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchDistanceStartRef = useRef<number | null>(null);
  const touchScaleStartRef = useRef<number>(1);
  const [fillCount, setFillCount] = useState(0);

  // Number targets for Color by Number mode
  const [numberTargets, setNumberTargets] = useState<NumberTarget[]>([]);

  // Generate targets when template changes or mode toggles
  useEffect(() => {
    if (isColorByNumber) {
      const generatedTargets: NumberTarget[] = [
        { id: 't1', number: 1, xPercent: 28, yPercent: 28, isCompleted: false, expectedColor: COLORS[0] },
        { id: 't2', number: 2, xPercent: 72, yPercent: 28, isCompleted: false, expectedColor: COLORS[1] },
        { id: 't3', number: 3, xPercent: 50, yPercent: 48, isCompleted: false, expectedColor: COLORS[2] },
        { id: 't4', number: 4, xPercent: 30, yPercent: 72, isCompleted: false, expectedColor: COLORS[3] },
        { id: 't5', number: 5, xPercent: 70, yPercent: 72, isCompleted: false, expectedColor: COLORS[4] },
        { id: 't6', number: 6, xPercent: 50, yPercent: 88, isCompleted: false, expectedColor: COLORS[5] },
      ];
      setNumberTargets(generatedTargets);
    }
  }, [paths, imageUrl, isColorByNumber]);

  // Render Line Art from Image URL or SVG paths onto Line Art Canvas
  const renderLineArt = useCallback(() => {
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!lineArtCanvas) return;

    const ctx = lineArtCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // If an AI / Photo image URL is provided, draw and clean the line art
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

        try {
          // Binarize / clean line art to guarantee solid flood fill boundaries
          const imgData = ctx.getImageData(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance < 135) {
              // Dark outline line
              data[i] = 20;
              data[i + 1] = 20;
              data[i + 2] = 20;
              data[i + 3] = 255;
            } else {
              // White fillable background
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {
          console.warn('Canvas pixel processing skipped (CORS/tainted):', e);
        }
      };
      img.src = imageUrl;
      return;
    }

    // Otherwise render SVG paths as vector lines
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const vb = viewBox.split(' ').map(Number);
    const vbWidth = vb[2] || 500;
    const vbHeight = vb[3] || 500;
    const scaleX = INTERNAL_WIDTH / vbWidth;
    const scaleY = INTERNAL_HEIGHT / vbHeight;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    paths.forEach((p) => {
      try {
        const path2d = new Path2D(p.d);
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = (p.strokeWidth || 4) * 1.2;
        ctx.stroke(path2d);
      } catch (err) {
        console.warn('Could not parse path for canvas render:', p.d, err);
      }
    });

    ctx.restore();
  }, [imageUrl, paths, viewBox, lineArtCanvasRef]);

  // Initialize or restore Paint Canvas
  const initPaintCanvas = useCallback((dataUrl?: string | null) => {
    const paintCanvas = paintCanvasRef.current;
    if (!paintCanvas) return;

    const ctx = paintCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (dataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        ctx.drawImage(img, 0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      };
      img.src = dataUrl;
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      onHistoryPush(paintCanvas.toDataURL());
    }
  }, [paintCanvasRef, onHistoryPush]);

  // On template / image change: re-render line art and reset paint canvas
  useEffect(() => {
    renderLineArt();
    initPaintCanvas(restoredDataUrl);
  }, [paths, viewBox, imageUrl, renderLineArt, initPaintCanvas]);

  // When restoredDataUrl changes due to Undo/Redo
  useEffect(() => {
    if (restoredDataUrl) {
      const paintCanvas = paintCanvasRef.current;
      if (!paintCanvas) return;
      const ctx = paintCanvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        ctx.drawImage(img, 0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
      };
      img.src = restoredDataUrl;
    }
  }, [restoredDataUrl, paintCanvasRef]);

  // Convert client viewport coordinates to Canvas coordinate space
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const normalizedX = (clickX - pan.x) / scale;
    const normalizedY = (clickY - pan.y) / scale;

    const canvasX = (normalizedX / rect.width) * INTERNAL_WIDTH;
    const canvasY = (normalizedY / rect.height) * INTERNAL_HEIGHT;

    return { x: canvasX, y: canvasY, normX: normalizedX / rect.width, normY: normalizedY / rect.height };
  }, [pan, scale]);

  // Handle Tap to Stamp or Fill
  const handleCanvasInteraction = useCallback((clientX: number, clientY: number) => {
    const coords = getCanvasCoordinates(clientX, clientY);
    if (!coords) return;

    const paintCanvas = paintCanvasRef.current;
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!paintCanvas || !lineArtCanvas) return;

    const paintCtx = paintCanvas.getContext('2d', { willReadFrequently: true });
    const lineArtCtx = lineArtCanvas.getContext('2d', { willReadFrequently: true });
    if (!paintCtx || !lineArtCtx) return;

    // 1. If a sticker stamp is selected: Place sticker stamp!
    if (selectedSticker) {
      paintCtx.save();
      paintCtx.font = '72px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      paintCtx.textAlign = 'center';
      paintCtx.textBaseline = 'middle';
      paintCtx.fillText(selectedSticker.emoji, coords.x, coords.y);
      paintCtx.restore();

      playPop(500);
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { x: clientX / window.innerWidth, y: clientY / window.innerHeight }
        });
      } catch (e) {}

      const dataUrl = paintCanvas.toDataURL();
      onHistoryPush(dataUrl);
      return;
    }

    // 2. Otherwise: Perform Flood Fill
    const success = performFloodFill(
      paintCtx,
      lineArtCtx,
      coords.x,
      coords.y,
      selectedColor,
      35
    );

    if (success) {
      const dataUrl = paintCanvas.toDataURL();
      onHistoryPush(dataUrl);

      // Check if this matched any Color-by-Number target
      if (isColorByNumber) {
        setNumberTargets((prev) =>
          prev.map((t) => {
            const dist = Math.hypot(t.xPercent - coords.normX * 100, t.yPercent - coords.normY * 100);
            if (dist < 22 && !t.isCompleted && selectedColor === t.expectedColor) {
              playFanfare();
              try {
                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { x: clientX / window.innerWidth, y: clientY / window.innerHeight }
                });
              } catch (e) {}
              return { ...t, isCompleted: true };
            }
            return t;
          })
        );
      }

      setFillCount((prev) => {
        const next = prev + 1;
        if (next % 8 === 0) {
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#FF6B6B', '#FFD93D', '#4D96FF', '#6BCB77']
            });
          } catch (e) {}
        }
        return next;
      });
    }
  }, [getCanvasCoordinates, paintCanvasRef, lineArtCanvasRef, selectedColor, selectedSticker, isColorByNumber, onHistoryPush]);

  // Click on a specific Color by Number badge directly
  const handleTargetBadgeClick = (target: NumberTarget) => {
    if (target.isCompleted) return;
    const paintCanvas = paintCanvasRef.current;
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!paintCanvas || !lineArtCanvas) return;

    const paintCtx = paintCanvas.getContext('2d', { willReadFrequently: true });
    const lineArtCtx = lineArtCanvas.getContext('2d', { willReadFrequently: true });
    if (!paintCtx || !lineArtCtx) return;

    const targetX = (target.xPercent / 100) * INTERNAL_WIDTH;
    const targetY = (target.yPercent / 100) * INTERNAL_HEIGHT;

    // Fill region with target's expected color
    const success = performFloodFill(
      paintCtx,
      lineArtCtx,
      targetX,
      targetY,
      target.expectedColor,
      35
    );

    if (success) {
      playFanfare();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.5, y: 0.5 }
        });
      } catch (e) {}
      const dataUrl = paintCanvas.toDataURL();
      onHistoryPush(dataUrl);
      setNumberTargets((prev) =>
        prev.map((t) => (t.id === target.id ? { ...t, isCompleted: true } : t))
      );
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      isDraggingRef.current = false;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || e.buttons === 4) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (Math.hypot(dx, dy) > 5) {
        isDraggingRef.current = true;
        setPan({
          x: panStartRef.current.x + dx,
          y: panStartRef.current.y + dy
        });
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current && e.button === 0) {
      handleCanvasInteraction(e.clientX, e.clientY);
    }
    isDraggingRef.current = false;
  };

  // Touch Handlers for Mobile Pinch Zoom & Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = false;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      isDraggingRef.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      touchDistanceStartRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchScaleStartRef.current = scale;
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1.05) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > 8) {
        isDraggingRef.current = true;
        setPan({
          x: panStartRef.current.x + dx,
          y: panStartRef.current.y + dy
        });
      }
    } else if (e.touches.length === 2 && touchDistanceStartRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = currentDist / touchDistanceStartRef.current;
      const newScale = Math.min(5.0, Math.max(1.0, touchScaleStartRef.current * ratio));
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      if (!isDraggingRef.current && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        handleCanvasInteraction(touch.clientX, touch.clientY);
      }
      isDraggingRef.current = false;
      touchDistanceStartRef.current = null;
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2;
    setScale((prevScale) => Math.min(5.0, Math.max(1.0, prevScale + zoomDelta)));
  };

  const cursorStyle = selectedSticker 
    ? 'copy' 
    : selectedColor === '#FFFFFF' 
      ? 'cell' 
      : 'crosshair';

  const completedTargets = numberTargets.filter((t) => t.isCompleted).length;

  return (
    <motion.div
      ref={containerRef}
      key="dual-layer-canvas-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden sketchbook-paper select-none touch-none border-2 sm:border-3 border-[#EDE6D4] shrink-0"
      style={{
        aspectRatio: '1 / 1',
        maxHeight: '100%',
        maxWidth: '100%',
        height: '100%',
        width: 'auto',
        cursor: cursorStyle,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Playful Washi Tape Paper Corner Accents */}
      <div className="absolute top-1.5 -left-3 w-10 h-3.5 -rotate-45 bg-[#FFD93D]/70 border border-dashed border-amber-300/80 shadow-2xs pointer-events-none z-20" />
      <div className="absolute top-1.5 -right-3 w-10 h-3.5 rotate-45 bg-[#4D96FF]/45 border border-dashed border-blue-300/80 shadow-2xs pointer-events-none z-20" />

      {/* Sketchbook Top Spiral Binder: Punched Holes & Metallic Coils */}
      <div className="absolute top-1 left-0 right-0 z-20 flex justify-evenly items-center px-5 sm:px-8 pointer-events-none">
        {[...Array(11)].map((_, i) => (
          <div key={i} className="relative flex flex-col items-center">
            {/* Punched Paper Hole */}
            <div className="w-2 sm:w-2.5 h-3 rounded-full bg-[#E5DFCF] shadow-inner ring-1 ring-black/10" />
            {/* Metallic Spiral Coil Loop */}
            <div className="absolute -top-1 w-2 sm:w-2.5 h-4.5 rounded-full border border-[#BDB7A6] bg-gradient-to-r from-[#DDD7C9] via-white to-[#BFB9A8] shadow-xs" />
          </div>
        ))}
      </div>

      {/* Floating Coloring Progress / Encouragement Badge */}
      <div className="absolute top-4 left-3 z-20 pointer-events-none">
        {isColorByNumber ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-[#FFD93D] shadow-xs text-[11px] font-black text-[#7A4B00]">
            <span>🔢</span>
            <span>{completedTargets} / {numberTargets.length} Completed</span>
          </div>
        ) : fillCount > 0 ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-sm border border-[#EBE8DC] shadow-xs text-[10px] sm:text-[11px] font-black text-[#2D3436]">
            <span>⭐</span>
            <span>{fillCount} filled</span>
          </div>
        ) : null}
      </div>

      {/* Zoomable & Pannable Viewport Group */}
      <div
        className="w-full h-full relative origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
        }}
      >
        {/* Layer 1: Paint Canvas (User colors, patterns, and sticker stamps) */}
        <canvas
          ref={paintCanvasRef}
          width={INTERNAL_WIDTH}
          height={INTERNAL_HEIGHT}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Layer 2: Line Art Canvas (Crisp outlines rendered on top with multiply blend) */}
        <canvas
          ref={lineArtCanvasRef}
          width={INTERNAL_WIDTH}
          height={INTERNAL_HEIGHT}
          className="absolute inset-0 w-full h-full block pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      {/* Color By Number Interactive Overlay */}
      {isColorByNumber && onToggleColorByNumber && (
        <ColorByNumberOverlay
          isActive={isColorByNumber}
          onToggle={onToggleColorByNumber}
          targets={numberTargets}
          onTargetClick={handleTargetBadgeClick}
          selectedColor={selectedColor}
        />
      )}
    </motion.div>
  );
};

export default DualLayerCanvas;
