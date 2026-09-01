import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  Sliders, 
  Printer, 
  Check, 
  Crown, 
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { convertPhotoToLineArt, LineArtOptions } from '../services/photoToLineArt';
import { printColoringSheet } from '../services/pdfExporter';
import { playClick, playPop, playFanfare, playChime } from '../services/soundEffects';

interface PhotoToLineArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  onSelectPhotoLineArt: (canvasDataUrl: string) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  { name: '🐶 Playful Puppy', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80' },
  { name: '🐱 Fluffy Kitten', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80' },
  { name: '🦄 Magical Pony', url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop&q=80' },
  { name: '🚗 Fun Toy Car', url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80' }
];

const PhotoToLineArtModal: React.FC<PhotoToLineArtModalProps> = ({
  isOpen,
  onClose,
  isPro,
  setShowUpgradeModal,
  onSelectPhotoLineArt
}) => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<LineArtOptions>({
    sensitivity: 55,
    lineDarkness: 75,
    simplify: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      playChime();
      // Load default sample if no image loaded
      if (!originalImage) {
        loadPresetPhoto(SAMPLE_PHOTO_PRESETS[0].url);
      }
    }
  }, [isOpen]);

  const processImage = useCallback((img: HTMLImageElement, currentOptions: LineArtOptions) => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const lineCanvas = convertPhotoToLineArt(img, currentOptions);
        setPreviewDataUrl(lineCanvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Photo conversion failed:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  }, []);

  const loadPresetPhoto = (url: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      processImage(img, options);
    };
    img.onerror = () => {
      setIsProcessing(false);
    };
    img.src = url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playPop();
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        processImage(img, options);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOptionChange = (newOptions: Partial<LineArtOptions>) => {
    const updated = { ...options, ...newOptions };
    setOptions(updated);
    if (originalImage) {
      processImage(originalImage, updated);
    }
  };

  const handleStartColoring = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    if (previewDataUrl) {
      playFanfare();
      onSelectPhotoLineArt(previewDataUrl);
      onClose();
    }
  };

  const handlePrint = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    if (previewDataUrl) {
      const tempImg = new Image();
      tempImg.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tempImg.width;
        tempCanvas.height = tempImg.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempImg, 0, 0);
          printColoringSheet(tempCanvas, 'My Custom Photo Coloring Page');
        }
      };
      tempImg.src = previewDataUrl;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              playClick();
              onClose();
            }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#4D96FF] my-auto z-10 max-h-[95vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#EBF4FF] via-[#F4F9FF] to-[#FFF8E7] p-5 sm:p-6 pb-4 flex items-center justify-between border-b-2 border-[#EBE8DC] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-tr from-[#4D96FF] to-[#6BCB77] text-white rounded-2xl flex items-center justify-center shadow-md rotate-2">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#2D3436] font-display">
                      Photo to Coloring Page
                    </h2>
                    {!isPro && (
                      <span className="flex items-center gap-1 bg-[#FFD93D] text-[#7A4B00] text-xs px-2.5 py-0.5 rounded-full font-black shadow-xs">
                        <Crown className="w-3 h-3 fill-current" /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#636E72]">
                    Turn real photos of kids, pets, or toys into printable coloring art!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="p-2 rounded-full hover:bg-black/5 transition-all text-[#888] cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Upload Controls & Presets */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-bubbly flex-1 py-3 px-4 bg-[#4D96FF] hover:bg-[#3B82F6] text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Any Photo</span>
                </button>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[11px] font-bold text-[#888] shrink-0">Try:</span>
                  {SAMPLE_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        playPop();
                        loadPresetPhoto(preset.url);
                      }}
                      className="px-2.5 py-1.5 bg-[#FAF9F5] hover:bg-[#FFFDF0] border border-[#EBE8DC] hover:border-[#FFD93D] rounded-xl text-xs font-bold text-[#2D3436] shrink-0 transition-all cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Preview Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resulting Line Art Preview */}
                <div className="relative aspect-square bg-[#FAF9F5] rounded-3xl border-3 border-dashed border-[#4D96FF]/50 p-2 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Coloring Page Preview"
                      className="w-full h-full object-contain drop-shadow-xs"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-10 h-10 text-[#A0A0A0] mx-auto mb-2" />
                      <span className="text-xs font-bold text-[#888]">
                        Select or upload a photo to preview line art
                      </span>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#4D96FF] animate-spin" />
                      <span className="text-xs font-black text-[#2D3436]">Creating Line Art...</span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    Coloring Outline
                  </div>
                </div>

                {/* Adjustment Sliders & Fine-Tuning */}
                <div className="flex flex-col justify-between bg-[#FBF9F1] p-4 rounded-3xl border-2 border-[#EBE8DC] space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-[#2D3436]">
                      <Sliders className="w-4 h-4 text-[#4D96FF]" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        Outline Adjustments
                      </span>
                    </div>

                    {/* Sensitivity */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs font-bold text-[#555]">
                        <span>Detail Sensitivity</span>
                        <span>{options.sensitivity}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="85"
                        value={options.sensitivity}
                        onChange={(e) => handleOptionChange({ sensitivity: parseInt(e.target.value, 10) })}
                        className="w-full h-2 bg-[#EBE8DC] rounded-full appearance-none accent-[#4D96FF] cursor-pointer"
                      />
                    </div>

                    {/* Line Darkness */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs font-bold text-[#555]">
                        <span>Line Darkness</span>
                        <span>{options.lineDarkness}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        value={options.lineDarkness}
                        onChange={(e) => handleOptionChange({ lineDarkness: parseInt(e.target.value, 10) })}
                        className="w-full h-2 bg-[#EBE8DC] rounded-full appearance-none accent-[#4D96FF] cursor-pointer"
                      />
                    </div>

                    {/* Smooth Lines Toggle */}
                    <button
                      type="button"
                      onClick={() => handleOptionChange({ simplify: !options.simplify })}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        options.simplify
                          ? 'bg-[#EBF7FF] border-[#B9E0FF] text-[#0984E3]'
                          : 'bg-white border-[#E0E0E0] text-[#777]'
                      }`}
                    >
                      <span>Cartoon Line Smoothing</span>
                      <span className="text-[10px] font-black uppercase">{options.simplify ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>

                  {/* Reset Defaults */}
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      handleOptionChange({ sensitivity: 55, lineDarkness: 75, simplify: true });
                    }}
                    className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#888] hover:text-[#2D3436] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset to Recommended
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-4 sm:p-6 pt-3 bg-white border-t border-[#EBE8DC] shrink-0 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                disabled={!previewDataUrl || isProcessing}
                className="btn-bubbly sm:w-1/3 py-3.5 px-4 bg-[#F7F5EC] hover:bg-[#EFECE0] text-[#2D3436] rounded-2xl font-black text-sm border-2 border-[#E0DCBC] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-[#10B981]" />
                <span>Print PDF Sheet</span>
              </button>

              <button
                type="button"
                onClick={handleStartColoring}
                disabled={!previewDataUrl || isProcessing}
                className="btn-bubbly flex-1 py-3.5 px-6 bg-gradient-to-r from-[#FF6B6B] via-[#FA8231] to-[#FFD93D] text-white rounded-2xl font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:brightness-105 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                <span>Color on Canvas Now</span>
                {!isPro && (
                  <span className="flex items-center gap-1 bg-yellow-300 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs ml-1">
                    <Crown className="w-3 h-3 fill-current" /> VIP
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhotoToLineArtModal;
