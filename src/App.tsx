/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Palette, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Sparkles, 
  Eraser, 
  Undo2, 
  Redo2,
  Image as ImageIcon,
  Type as TextIcon,
  MousePointer2,
  Trash2,
  LogIn,
  LogOut,
  Crown,
  X,
  Zap,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { SvgPath, HistoryState } from './types';
import { 
  COLORS, 
  COLORS_LEFT, 
  COLORS_RIGHT, 
  PRO_COLORS, 
  CATEGORIES, 
  STATIC_TEMPLATES,
  ALL_SUBJECTS,
  SUBJECTS_BY_CATEGORY
} from './constants';
import { generateAiPaths, generateProceduralPaths, getImageUsingAPI } from './services/imageGenerator';
import { saveToCache, getFromCache } from './services/cacheService';

// --- App Component ---

// --- App Component ---

export default function App() {
  const [user] = useAuthState(auth);
  const isPro = !!user;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProColors, setShowProColors] = useState(false);
  const [paths, setPaths] = useState<SvgPath[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState('random');
  const [showTemplates, setShowTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const aiGenerationTimestamps = useRef<number[]>([]);
  const currentGenerationId = useRef<number>(0);
  const [viewBox, setViewBox] = useState("0 0 500 500");
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize with a random template
  useEffect(() => {
    const randomTemplate = STATIC_TEMPLATES[Math.floor(Math.random() * STATIC_TEMPLATES.length)];
    selectTemplate(randomTemplate);
  }, []);

  // Sync user profile
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const checkUser = async () => {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp()
        });
      }
    };
    checkUser();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleUpgrade = () => {
    if (!user) {
      handleLogin();
    }
    setShowUpgradeModal(false);
  };

  const saveToHistory = useCallback((newPaths: SvgPath[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ paths: [...newPaths] });
    // Limit history size
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setPaths(history[prevIndex].paths);
      setHistoryIndex(prevIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setPaths(history[nextIndex].paths);
      setHistoryIndex(nextIndex);
    }
  };

  const handleFill = (pathId: string) => {
    const newPaths = paths.map(p => 
      p.id === pathId ? { ...p, fill: selectedColor } : p
    );
    setPaths(newPaths);
    saveToHistory(newPaths);
  };

  const selectTemplate = (template: typeof STATIC_TEMPLATES[0]) => {
    const newPaths = template.paths.map(p => ({
      ...p,
      fill: '#FFFFFF',
      stroke: p.stroke || '#000000',
      strokeWidth: p.strokeWidth || 3
    }));
    setPaths(newPaths);
    setViewBox(template.viewBox);
    setHistory([{ paths: newPaths }]);
    setHistoryIndex(0);
    setShowTemplates(false);
    setSelectedCategory(template.category);
  };

  const generateProceduralImage = (category: string) => {
    const result = generateProceduralPaths(category);
    const newPaths = result.paths;
    setPaths(newPaths);
    setViewBox(result.viewBox || "0 0 500 500");
    setHistory([{ paths: newPaths }]);
    setHistoryIndex(0);
    setShowTemplates(false);
    
    try {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#FFD93D', '#4D96FF', '#FFFFFF']
      });
    } catch (e) {}
  };

  const generateRandomImage = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    if (isGenerating) return;

    // Rate limiting check
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    aiGenerationTimestamps.current = aiGenerationTimestamps.current.filter(t => t > oneMinuteAgo);

    if (aiGenerationTimestamps.current.length >= 15) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 4000);
      
      // Try cache first
      const cached = getFromCache(selectedCategory);
      if (cached) {
        setPaths(cached.paths);
        setViewBox(cached.viewBox);
        setHistory([{ paths: cached.paths }]);
        setHistoryIndex(0);
        return;
      }
      
      generateProceduralImage(selectedCategory);
      return;
    }

    aiGenerationTimestamps.current.push(now);
    const generationId = ++currentGenerationId.current;
    
    let subject = '';
    if (selectedCategory === 'random') {
      subject = ALL_SUBJECTS[Math.floor(Math.random() * ALL_SUBJECTS.length)];
    } else {
      const subjects = SUBJECTS_BY_CATEGORY[selectedCategory] || ALL_SUBJECTS;
      subject = subjects[Math.floor(Math.random() * subjects.length)];
    }
    
    try {
      setIsGenerating(true);
      const result = await getImageUsingAPI(subject, selectedCategory);
      // const result = await generateAiPaths(subject);
      
      // Check if this generation is still relevant
      if (generationId !== currentGenerationId.current) return;

      if (result) {
        const newPaths = result.paths.map((p: any) => ({
          ...p,
          fill: '#FFFFFF',
          stroke: p.stroke || '#000000',
          strokeWidth: p.strokeWidth || 3
        }));

        setPaths(newPaths);
        setViewBox(result.viewBox || "0 0 500 500");
        setHistory([{ paths: newPaths }]);
        setHistoryIndex(0);
        
        // Save to cache
        saveToCache(selectedCategory, subject, newPaths, result.viewBox || "0 0 500 500");

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: COLORS
          });
        } catch (confettiError) {
          console.warn("Confetti failed to launch:", confettiError);
        }
      } else {
        // Fallback to cache or procedural
        const cached = getFromCache(selectedCategory);
        if (cached) {
          setPaths(cached.paths);
          setViewBox(cached.viewBox);
          setHistory([{ paths: cached.paths }]);
          setHistoryIndex(0);
        } else {
          generateProceduralImage(selectedCategory);
        }
      }
    } catch (error: any) {
      const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaError) {
        console.warn("AI Quota reached, using cached image fallback.");
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 5000);
      } else {
        console.error("AI Generation failed:", error);
      }

      if (generationId !== currentGenerationId.current) return;
      
      const cached = getFromCache(selectedCategory);
      if (cached) {
        setPaths(cached.paths);
        setViewBox(cached.viewBox);
        setHistory([{ paths: cached.paths }]);
        setHistoryIndex(0);
      } else {
        generateProceduralImage(selectedCategory);
      }
    } finally {
      if (generationId === currentGenerationId.current) {
        setIsGenerating(false);
      }
    }
  };

  const downloadImage = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    const mainImg = new Image();
    const logoImg = new Image();
    
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const mainUrl = URL.createObjectURL(svgBlob);
    
    const loadMain = new Promise((resolve) => {
      mainImg.onload = resolve;
      mainImg.src = mainUrl;
    });
    
    const loadLogo = new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; // Fallback to text if logo fails
      logoImg.src = "/logo.svg";
    });

    Promise.all([loadMain, loadLogo]).then(() => {
      tempCanvas.width = 1000;
      tempCanvas.height = 1120; // Extra space for footer
      
      if (ctx) {
        // Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Main drawing
        ctx.drawImage(mainImg, 0, 0, 1000, 1000);
        
        // Footer Area
        ctx.fillStyle = "#FDFCF0";
        ctx.fillRect(0, 1000, 1000, 120);
        
        ctx.strokeStyle = "#E6E6E6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 1000);
        ctx.lineTo(1000, 1000);
        ctx.stroke();

        // Logo and Text
        const footerY = 1060;
        
        try {
          // Draw Logo
          const logoSize = 60;
          ctx.drawImage(logoImg, 320, footerY - 30, 100, 60);
          
          ctx.fillStyle = "#A0A0A0";
          ctx.font = "bold 20px Arial";
          ctx.textAlign = "left";
          ctx.fillText("Created with Magic at", 430, footerY + 8);
        } catch (e) {
          // Fallback if logo fails
          ctx.fillStyle = "#2D3436";
          ctx.font = "black 40px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Created by KidColor", 500, footerY + 10);
        }

        const pngUrl = tempCanvas.toDataURL("image/png");
        
        if (Capacitor.isNativePlatform()) {
          const base64Data = pngUrl.split(',')[1];
          Filesystem.writeFile({
            path: `kidcolor-${Date.now()}.png`,
            data: base64Data,
            directory: Directory.Documents
          }).then(() => {
            alert("Masterpiece saved to your Documents folder!");
          }).catch(err => {
            console.error("Save failed:", err);
            alert("Could not save image.");
          });
        } else {
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `kidcolor-${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      }
      URL.revokeObjectURL(mainUrl);
    });
  };

  const clearCanvas = () => {
    const clearedPaths = paths.map(p => ({ ...p, fill: '#FFFFFF' }));
    setPaths(clearedPaths);
    saveToHistory(clearedPaths);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans text-[#4A4A4A] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-3 md:p-6 flex items-center justify-between bg-white border-b-2 border-[#E6E6E6] shadow-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Palette className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[#2D3436]">
            Kid<span className="text-[#FF6B6B]">Color</span>
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 mr-1 sm:mr-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-[#2D3436]">{user.displayName}</span>
                <span className="text-[10px] font-black text-[#FFD93D] flex items-center gap-1 uppercase tracking-wider">
                  <Crown className="w-3 h-3" /> Magic Explorer
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-full hover:bg-[#FFF5F5] text-[#FF6B6B] transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#4D96FF] text-white font-bold rounded-full shadow-md hover:bg-[#3E54AC] transition-all active:scale-95 mr-1 sm:mr-4 text-xs sm:text-base"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F5] disabled:opacity-30 transition-all active:scale-95"
            title="Undo"
          >
            <Undo2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F5] disabled:opacity-30 transition-all active:scale-95"
            title="Redo"
          >
            <Redo2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="w-px h-5 sm:h-6 bg-[#E6E6E6] mx-1 sm:mx-2" />
          <button 
            onClick={downloadImage}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-white font-bold rounded-full shadow-md transition-all active:scale-95 text-xs sm:text-base ${isPro ? 'bg-[#6BCB77] hover:bg-[#5BB366]' : 'bg-[#A0A0A0] hover:bg-[#808080]'}`}
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Save</span>
            {!isPro && <Crown className="w-3 h-3 ml-0.5 sm:ml-1" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-6 overflow-hidden">
        {/* Left Toolbar: Colors (Desktop) */}
        <aside className="hidden lg:flex flex-col justify-center gap-3 p-4 bg-white rounded-3xl border-2 border-[#E6E6E6] shadow-sm overflow-y-auto no-scrollbar w-24 shrink-0">
          {COLORS_LEFT.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`
                w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm
                ${selectedColor === color ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border border-black/5'}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            onClick={() => setSelectedColor('#FFFFFF')}
            className={`
              w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-white border-2
              ${selectedColor === '#FFFFFF' ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border-[#E6E6E6]'}
            `}
          >
            <Eraser className="w-6 h-6 text-[#A0A0A0]" />
          </button>

          <div className="relative">
            <button
              onClick={() => {
                if (!isPro) {
                  setShowUpgradeModal(true);
                  return;
                }
                setShowProColors(true);
              }}
              className={`
                w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-gradient-to-br from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] text-white relative
                ${showProColors ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : ''}
              `}
            >
              <Palette className="w-6 h-6" />
              {!isPro && (
                <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-0.5 rounded-md shadow-sm border border-white">
                  <Crown className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Center: Canvas Area */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Category Selection */}
          <div className="flex gap-2 p-2 bg-white rounded-2xl border-2 border-[#E6E6E6] overflow-x-auto no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowTemplates(true);
                  setIsGenerating(false);
                  currentGenerationId.current++;
                }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap active:scale-95
                  ${selectedCategory === cat.id 
                    ? 'text-white shadow-md' 
                    : 'bg-[#F5F5F5] text-[#A0A0A0] hover:bg-[#EEEEEE]'}
                `}
                style={{ backgroundColor: selectedCategory === cat.id ? cat.color : undefined }}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1 relative bg-white rounded-[2rem] border-4 border-[#E6E6E6] shadow-inner flex items-center justify-center overflow-hidden group">
            <AnimatePresence mode="wait">
              {showTemplates ? (
                <motion.div
                  key="template-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full h-full p-6 overflow-y-auto"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Magic Generate Button for this category */}
                    <button
                      onClick={() => {
                        if (!isPro) {
                          setShowUpgradeModal(true);
                          return;
                        }
                        if (isGenerating) return;
                        setShowTemplates(false);
                        generateRandomImage();
                      }}
                      disabled={isGenerating}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border-4 border-dashed transition-all group/gen relative overflow-hidden ${isGenerating ? 'opacity-50 cursor-not-allowed' : isPro ? 'border-[#FFD93D] bg-[#FFFDF0] hover:bg-[#FFF9E0]' : 'border-[#E6E6E6] bg-[#F5F5F5] hover:bg-[#EEEEEE]'}`}
                    >
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-10 pointer-events-none"
                      >
                        <Sparkles className="w-full h-full text-[#FFD93D]" />
                      </motion.div>
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg group-hover/gen:scale-110 transition-transform relative z-10 ${isPro ? 'bg-[#FFD93D]' : 'bg-[#A0A0A0]'}`}>
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-center relative z-10">
                        <span className="block font-black text-[#2D3436] text-lg">Magic Generate</span>
                        <span className="text-xs font-bold text-[#A0A0A0]">
                          {isPro ? 'AI or Code Magic!' : 'Upgrade to Unlock'}
                        </span>
                      </div>
                      {!isPro && (
                        <div className="absolute top-3 right-3 bg-[#FFD93D] text-white p-1 rounded-lg shadow-sm">
                          <Crown className="w-4 h-4" />
                        </div>
                      )}
                    </button>

                    {STATIC_TEMPLATES
                      .filter(t => selectedCategory === 'random' || t.category === selectedCategory)
                      .map((template) => (
                        <button
                          key={template.name}
                          onClick={() => selectTemplate(template)}
                          className="flex flex-col items-center gap-3 p-4 rounded-3xl border-2 border-[#E6E6E6] hover:border-[#FFD93D] hover:bg-[#FFFDF0] transition-all group/card"
                        >
                          <div className="w-full aspect-square bg-white rounded-2xl border border-[#F0F0F0] p-2 flex items-center justify-center overflow-hidden">
                            <svg viewBox={template.viewBox} className="w-full h-full">
                              {template.paths.map((p) => (
                                <path
                                  key={p.id}
                                  d={p.d}
                                  fill="none"
                                  stroke="#4A4A4A"
                                  strokeWidth={8}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              ))}
                            </svg>
                          </div>
                          <span className="font-black text-[#4A4A4A] group-hover/card:text-[#FF6B6B]">{template.name}</span>
                        </button>
                      ))}
                  </div>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 border-4 border-[#FFD93D] border-t-[#FF6B6B] rounded-full animate-spin" />
                  <p className="font-bold text-[#A0A0A0] animate-pulse">Magic is happening...</p>
                </motion.div>
              ) : (
                <motion.svg
                  key="svg-canvas"
                  ref={svgRef}
                  viewBox={viewBox}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full h-full max-w-[800px] max-h-[800px] cursor-pointer"
                  style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))' }}
                >
                  {paths.map((path) => (
                    <path
                      key={path.id}
                      d={path.d}
                      fill={path.fill}
                      stroke={path.stroke}
                      strokeWidth={path.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFill(path.id)}
                      className="transition-colors duration-300 hover:opacity-80"
                    />
                  ))}
                </motion.svg>
              )}
            </AnimatePresence>

            {/* Floating Action Buttons */}
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              <button
                onClick={downloadImage}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-90 group/save relative ${isPro ? 'bg-[#6BCB77] text-white hover:bg-[#5BB366]' : 'bg-[#A0A0A0] text-white hover:bg-[#808080]'}`}
                title="Save Masterpiece"
              >
                <Download className="w-6 h-6 sm:w-7 sm:h-7 group-hover/save:scale-110 transition-transform" />
                {!isPro && (
                  <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-1 rounded-lg shadow-md border-2 border-white">
                    <Crown className="w-3 h-3" />
                  </div>
                )}
              </button>
            </div>

            <div className="absolute bottom-6 right-6 flex flex-col gap-3">
              <button
                onClick={generateRandomImage}
                disabled={isGenerating}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 group/btn relative ${isPro ? 'bg-[#FFD93D] text-[#2D3436] hover:bg-[#F9CA24]' : 'bg-[#A0A0A0] text-white hover:bg-[#808080]'}`}
                title="New Magic Picture"
              >
                <Sparkles className={`w-6 h-6 sm:w-7 sm:h-7 ${isGenerating ? 'animate-spin' : 'group-hover/btn:rotate-12'}`} />
                {!isPro && (
                  <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-1 rounded-lg shadow-md border-2 border-white">
                    <Crown className="w-3 h-3" />
                  </div>
                )}
              </button>
              <button
                onClick={clearCanvas}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-white text-[#FF6B6B] border-2 border-[#FF6B6B] rounded-2xl shadow-lg flex items-center justify-center hover:bg-[#FFF5F5] transition-all active:scale-90"
                title="Clear All"
              >
                <Trash2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>
          </div>

          {/* Bottom Palette (Mobile) */}
          <div className="lg:hidden flex gap-3 p-4 bg-white rounded-3xl border-2 border-[#E6E6E6] shadow-sm overflow-x-auto no-scrollbar shrink-0">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`
                  w-10 h-10 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm
                  ${selectedColor === color ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border border-black/5'}
                `}
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              onClick={() => setSelectedColor('#FFFFFF')}
              className={`
                w-10 h-10 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-white border-2
                ${selectedColor === '#FFFFFF' ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border-[#E6E6E6]'}
              `}
            >
              <Eraser className="w-6 h-6 text-[#A0A0A0]" />
            </button>

            {/* Pro Colors Mobile */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isPro) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setShowProColors(true);
                }}
                className={`
                  w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm flex items-center justify-center bg-gradient-to-br from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] text-white relative
                  ${showProColors ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : ''}
                `}
              >
                <Palette className="w-6 h-6" />
                {!isPro && (
                  <div className="absolute -top-1 -right-1 bg-[#FFD93D] text-white p-0.5 rounded-md shadow-sm border border-white">
                    <Crown className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Toolbar: Colors (Desktop) */}
        <aside className="hidden lg:flex flex-col justify-center gap-3 p-4 bg-white rounded-3xl border-2 border-[#E6E6E6] shadow-sm overflow-y-auto no-scrollbar w-24 shrink-0">
          {COLORS_RIGHT.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`
                w-12 h-12 rounded-2xl shrink-0 transition-all transform hover:scale-110 active:scale-90 shadow-sm
                ${selectedColor === color ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border border-black/5'}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </aside>
      </main>

      {/* Footer / Mobile Palette (Optional, already have sidebar) */}
      <footer className="p-4 text-center text-xs font-bold text-[#A0A0A0] bg-white border-t border-[#E6E6E6]">
        Made with ❤️ for little artists
      </footer>

      {/* Rate Limit Notification */}
      <AnimatePresence>
        {isRateLimited && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-amber-100 border-2 border-amber-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Fast Mode: Using Local Magic! (Limit Reached)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Magic Palette Modal */}
      <AnimatePresence>
        {showProColors && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProColors(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] to-[#4D96FF] rounded-xl flex items-center justify-center shadow-md">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-[#2D3436]">Magic Palette</h2>
                </div>
                <button 
                  onClick={() => setShowProColors(false)}
                  className="p-2 rounded-full hover:bg-[#F5F5F5] transition-all"
                >
                  <X className="w-6 h-6 text-[#A0A0A0]" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {PRO_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowProColors(false);
                    }}
                    className={`
                      aspect-square rounded-2xl transition-all transform hover:scale-110 active:scale-90 shadow-sm
                      ${selectedColor === color ? 'ring-4 ring-[#4D96FF] ring-offset-2 scale-110' : 'border border-black/5'}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="mt-8 p-4 bg-[#FDFCF0] rounded-2xl border-2 border-[#FFD93D]/30 text-center">
                <p className="text-xs font-bold text-[#5A5A5A]">
                  Pick a magic color to start your masterpiece!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F5F5F5] transition-all"
              >
                <X className="w-6 h-6 text-[#A0A0A0]" />
              </button>

              <div className="p-8 pt-12 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#FFD93D] to-[#FF9248] rounded-3xl flex items-center justify-center shadow-xl mb-6 transform -rotate-6">
                  <Crown className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-3xl font-black text-[#2D3436] mb-2">
                  Unlock Magic!
                </h2>
                <p className="text-[#5A5A5A] font-medium mb-8">
                  Login to unlock AI magic, extra colors, and save your masterpieces!
                </p>

                <div className="w-full space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-[#FDFCF0] rounded-2xl border-2 border-[#FFD93D]/30">
                    <div className="w-10 h-10 bg-[#FFD93D] rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-sm text-[#2D3436]">Unlimited Magic</span>
                      <span className="text-xs text-[#A0A0A0]">AI creates unique drawings for you</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#FDFCF0] rounded-2xl border-2 border-[#6BCB77]/30">
                    <div className="w-10 h-10 bg-[#6BCB77] rounded-xl flex items-center justify-center shrink-0">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black text-sm text-[#2D3436]">Save Masterpieces</span>
                      <span className="text-xs text-[#A0A0A0]">Download your art as high-quality PNG</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleUpgrade}
                  className="w-full py-5 bg-[#FF6B6B] text-white font-black text-xl rounded-2xl shadow-lg hover:bg-[#FF5252] transition-all active:scale-95 mb-4"
                >
                  Login with Google
                </button>
                <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">
                  Completely free for logged-in users!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
