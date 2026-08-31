/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { SvgPath } from '../types';
import { performFloodFill } from '../services/floodFill';

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
  setPan
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchDistanceStartRef = useRef<number | null>(null);
  const touchScaleStartRef = useRef<number>(1);
  const [fillCount, setFillCount] = useState(0);

  // Render Line Art from Image URL or SVG paths onto Line Art Canvas
  const renderLineArt = useCallback(() => {
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!lineArtCanvas) return;

    const ctx = lineArtCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // If an AI image URL is provided, draw and clean the line art
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

    return { x: canvasX, y: canvasY };
  }, [pan, scale]);

  // Handle Tap to Fill
  const handleTapToFill = useCallback((clientX: number, clientY: number) => {
    const coords = getCanvasCoordinates(clientX, clientY);
    if (!coords) return;

    const paintCanvas = paintCanvasRef.current;
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!paintCanvas || !lineArtCanvas) return;

    const paintCtx = paintCanvas.getContext('2d', { willReadFrequently: true });
    const lineArtCtx = lineArtCanvas.getContext('2d', { willReadFrequently: true });
    if (!paintCtx || !lineArtCtx) return;

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
  }, [getCanvasCoordinates, paintCanvasRef, lineArtCanvasRef, selectedColor, onHistoryPush]);

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
      handleTapToFill(e.clientX, e.clientY);
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
        handleTapToFill(touch.clientX, touch.clientY);
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

  return (
    <motion.div
      ref={containerRef}
      key="dual-layer-canvas-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white select-none cursor-crosshair touch-none border-2 border-[#EBE8DC] shrink-0"
      style={{
        aspectRatio: '1 / 1',
        maxHeight: '100%',
        maxWidth: '100%',
        height: '100%',
        width: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Zoomable & Pannable Viewport Group */}
      <div
        className="w-full h-full relative origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
        }}
      >
        {/* Layer 1: Paint Canvas (User colors & fills) */}
        <canvas
          ref={paintCanvasRef}
          width={INTERNAL_WIDTH}
          height={INTERNAL_HEIGHT}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Layer 2: Line Art Canvas (Crisp black outlines rendered on top with multiply blend) */}
        <canvas
          ref={lineArtCanvasRef}
          width={INTERNAL_WIDTH}
          height={INTERNAL_HEIGHT}
          className="absolute inset-0 w-full h-full block pointer-events-none"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>
    </motion.div>
  );
};

export default DualLayerCanvas;
