import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Download, Calendar, ExternalLink, Copy, Check, Filter, 
  Sparkles, FileSpreadsheet, Archive, RefreshCw, Eye, Share2
} from 'lucide-react';
import JSZip from 'jszip';
import { STATIC_TEMPLATES, CATEGORIES } from '../constants';
import { 
  batchGeneratePins, 
  exportPinsToPinterestCsv, 
  getCategoryMeta, 
  GeneratedPinData 
} from '../services/pinterestPinGenerator';
import { playPop, playChime } from '../services/soundEffects';

interface PinterestStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: string) => void;
}

const PinterestStudioModal: React.FC<PinterestStudioModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [urlFormat, setUrlFormat] = useState<'query' | 'hash' | 'path'>('query');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewPin, setPreviewPin] = useState<GeneratedPinData | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Generate pins based on current options
  const allPins = useMemo(() => {
    return batchGeneratePins(STATIC_TEMPLATES, { urlFormat });
  }, [urlFormat]);

  // Unique dates in the batch
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(allPins.map(p => p.scheduledDate)));
  }, [allPins]);

  // Filtered pins
  const filteredPins = useMemo(() => {
    return allPins.filter(pin => {
      const matchCat = selectedCategoryFilter === 'all' || 
        pin.category === selectedCategoryFilter || 
        (selectedCategoryFilter === 'animal' && (pin.category === 'animal' || pin.category === 'animals'));
      const matchDate = selectedDateFilter === 'all' || pin.scheduledDate === selectedDateFilter;
      return matchCat && matchDate;
    });
  }, [allPins, selectedCategoryFilter, selectedDateFilter]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    playPop();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download individual SVG
  const downloadPinSvg = (pin: GeneratedPinData) => {
    playPop();
    const blob = new Blob([pin.svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pin.id}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download individual PNG (rasterized at 1000x1500)
  const downloadPinPng = (pin: GeneratedPinData) => {
    playChime();
    const img = new Image();
    const svgBlob = new Blob([pin.svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1000, 1500);
        ctx.drawImage(img, 0, 0, 1000, 1500);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${pin.id}.png`;
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Download Pinterest Bulk Schedule CSV
  const downloadCsv = () => {
    playChime();
    const csvContent = exportPinsToPinterestCsv(filteredPins.length > 0 ? filteredPins : allPins);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pinterest_bulk_schedule_${urlFormat}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1-Click ZIP Download for batch pins + CSV
  const downloadZipBatch = async () => {
    playChime();
    setIsZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const pinsFolder = zip.folder('pins');
      const pinsToExport = filteredPins.length > 0 ? filteredPins : allPins;

      // Add CSV
      const csvContent = exportPinsToPinterestCsv(pinsToExport);
      zip.file('pinterest_bulk_schedule.csv', csvContent);

      // Add each pin SVG
      pinsToExport.forEach((pin, idx) => {
        pinsFolder?.file(`${pin.id}.svg`, pin.svgContent);
        setZipProgress(Math.round(((idx + 1) / pinsToExport.length) * 80));
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(80 + Math.round(metadata.percent * 0.2));
      });

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coloro_pinterest_batch_${pinsToExport.length}_pins.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ZIP:', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#0F172A] text-white w-full max-w-6xl max-h-[92vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E60023] flex items-center justify-center text-white font-black text-xl shadow-md">
                📌
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black font-display flex items-center gap-2">
                  <span>Pinterest Batch Studio</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-[#E60023]/20 text-[#FF5252] border border-[#E60023]/30 rounded-full">
                    5–8 Daily Graphics
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Side-by-side blank vs. colored coloring sheets with direct category links
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="p-3 sm:p-4 bg-slate-900/40 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Category Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => { playPop(); setSelectedCategoryFilter('all'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({allPins.length})
              </button>

              {CATEGORIES.filter(c => c.id !== 'random').map(cat => {
                const isSelected = selectedCategoryFilter === cat.id;
                const count = allPins.filter(p => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { playPop(); setSelectedCategoryFilter(cat.id); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.emoji || '🎨'}</span>
                    <span>{cat.label}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* URL Format & Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {/* URL Format selector */}
              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-semibold">
                <span className="text-slate-400 px-2 text-[11px]">URL:</span>
                <button
                  onClick={() => setUrlFormat('query')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    urlFormat === 'query' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Universal query param e.g. https://coloro.in/?category=animals"
                >
                  ?category=
                </button>
                <button
                  onClick={() => setUrlFormat('hash')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    urlFormat === 'hash' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Hash anchor e.g. https://coloro.in/#category=animals"
                >
                  #category=
                </button>
                <button
                  onClick={() => setUrlFormat('path')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    urlFormat === 'path' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Clean path e.g. https://coloro.in/category/animals"
                >
                  /category/
                </button>
              </div>

              {/* CSV Export Button */}
              <button
                onClick={downloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                title="Download CSV for Pinterest Bulk Uploader"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pinterest CSV</span>
              </button>

              {/* 1-Click ZIP Batch Button */}
              <button
                onClick={downloadZipBatch}
                disabled={isZipping}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-black text-white shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Zipping {zipProgress}%...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Download ZIP Batch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Schedule Date Filter Ribbon */}
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Schedule:</span>
            </span>

            <button
              onClick={() => setSelectedDateFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                selectedDateFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Days ({allPins.length})
            </button>

            {uniqueDates.slice(0, 10).map((date, idx) => {
              const isSelected = selectedDateFilter === date;
              const count = allPins.filter(p => p.scheduledDate === date).length;
              const label = idx === 0 ? `Today (${date})` : idx === 1 ? `Tomorrow (${date})` : date;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDateFilter(date)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label} <span className="text-[10px] text-indigo-300">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Main Grid View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
            {filteredPins.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-lg font-bold">No pins match the selected filters.</p>
                <button
                  onClick={() => { setSelectedCategoryFilter('all'); setSelectedDateFilter('all'); }}
                  className="mt-3 px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPins.map((pin) => {
                  const isCopied = copiedId === pin.id;
                  return (
                    <div
                      key={pin.id}
                      className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all group"
                    >
                      {/* Pin Preview Container (2:3 aspect ratio) */}
                      <div className="relative w-full aspect-[2/3] bg-black overflow-hidden group/preview">
                        <img
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(pin.svgContent)}`}
                          alt={pin.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                          <button
                            onClick={() => downloadPinPng(pin)}
                            className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PNG (1000x1500)</span>
                          </button>

                          <button
                            onClick={() => downloadPinSvg(pin)}
                            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download SVG</span>
                          </button>

                          <button
                            onClick={() => {
                              copyToClipboard(pin.description, pin.id);
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Description Copied!' : 'Copy Pin Text'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Meta & Info */}
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-indigo-400 font-black mb-1">
                            <span>{pin.categoryEmoji} {pin.categoryLabel}</span>
                            <span className="text-slate-400 font-medium">📅 {pin.scheduledDate} {pin.scheduledTime}</span>
                          </div>

                          <h3 className="text-xs font-bold text-white line-clamp-1">
                            {pin.templateName}
                          </h3>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {pin.description}
                          </p>
                        </div>

                        {/* Direct Link Footer */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                          <a
                            href={pin.destinationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-400 hover:text-indigo-400 truncate font-mono max-w-[170px]"
                            title={pin.destinationUrl}
                          >
                            {pin.destinationUrl.replace('https://coloro.in', '')}
                          </a>

                          <button
                            onClick={() => copyToClipboard(pin.destinationUrl, `url-${pin.id}`)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Copy link"
                          >
                            {copiedId === `url-${pin.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Share2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer Summary */}
          <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">
                Displaying {filteredPins.length} of {allPins.length} pins
              </span>
              <span>•</span>
              <span>5–8 pins scheduled daily</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">1000x1500 (2:3 Pinterest Ratio)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadCsv}
                className="hover:text-white font-bold underline cursor-pointer"
              >
                Export CSV ({urlFormat})
              </button>
              <button
                onClick={downloadZipBatch}
                className="hover:text-white font-bold underline cursor-pointer"
              >
                Download All ({allPins.length} SVGs)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PinterestStudioModal;
