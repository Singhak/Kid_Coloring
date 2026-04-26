/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */ 
import React, { useState, useEffect, useRef, useCallback } from 'react'; 
import { Zap } from 'lucide-react';
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
import { generateProceduralPaths, getImageUsingAPI } from './services/imageGenerator';
import AppHeader from './components/AppHeader';
import DesktopColorPalette from './components/DesktopColorPalette';
import CategorySelector from './components/CategorySelector';
import CanvasArea from './components/CanvasArea';
import MobileColorPalette from './components/MobileColorPalette';
import AppFooter from './components/AppFooter';
import RateLimitNotification from './components/RateLimitNotification';
import MagicPaletteModal from './components/MagicPaletteModal';
import UpgradeModal from './components/UpgradeModal';
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

    const handleFallback = () => {
      // 50% chance to use cache (if available), 50% chance to use JS generation
      const useCache = Math.random() > 0.5;
      const cached = getFromCache(selectedCategory);
      
      if (useCache && cached) {
        setPaths(cached.paths);
        setViewBox(cached.viewBox);
        setHistory([{ paths: cached.paths }]);
        setHistoryIndex(0);
      } else {
        generateProceduralImage(selectedCategory);
      }
    };

    // Rate limiting check
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    aiGenerationTimestamps.current = aiGenerationTimestamps.current.filter(t => t > oneMinuteAgo);

    if (aiGenerationTimestamps.current.length >= 15) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 4000);
      
      handleFallback();
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
        handleFallback();
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
      
      handleFallback();
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
          ctx.fillText("Created with Magic at KidColor - kidColor.storywalla.com", 430, footerY + 8);
        } catch (e) {
          // Fallback if logo fails
          ctx.fillStyle = "#2D3436";
          ctx.font = "black 40px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Created by KidColor - kidColor.storywalla.com", 500, footerY + 10);
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
      <AppHeader
        user={user}
        isPro={isPro}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        downloadImage={downloadImage}
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        historyLength={history.length}
      />

      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-6 overflow-hidden">
        {/* Left Toolbar: Colors (Desktop) */}
        <DesktopColorPalette
          colors={COLORS_LEFT}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          isPro={isPro}
          setShowUpgradeModal={setShowUpgradeModal}
          showProColors={showProColors}
          setShowProColors={setShowProColors}
          showEraser={true}
        />

        {/* Center: Canvas Area */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Category Selection */}
          <CategorySelector
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setShowTemplates={setShowTemplates}
            setIsGenerating={setIsGenerating}
            currentGenerationId={currentGenerationId}
          />

          <CanvasArea
            isPro={isPro}
            isGenerating={isGenerating}
            showTemplates={showTemplates}
            selectedCategory={selectedCategory}
            paths={paths}
            viewBox={viewBox}
            svgRef={svgRef}
            generateRandomImage={generateRandomImage}
            selectTemplate={selectTemplate}
            downloadImage={downloadImage}
            clearCanvas={clearCanvas}
            handleFill={handleFill}
            setShowUpgradeModal={setShowUpgradeModal}
          />

          {/* Bottom Palette (Mobile) */}
          <MobileColorPalette
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            isPro={isPro}
            setShowUpgradeModal={setShowUpgradeModal}
            showProColors={showProColors}
            setShowProColors={setShowProColors}
          />
        </section>

        {/* Right Toolbar: Colors (Desktop) */}
        <DesktopColorPalette
          colors={COLORS_RIGHT}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          isPro={isPro}
          setShowUpgradeModal={setShowUpgradeModal}
          showProColors={showProColors}
          setShowProColors={setShowProColors}
        />
      </main>

      {/* Footer / Mobile Palette (Optional, already have sidebar) */}
      <AppFooter />

      {/* Rate Limit Notification */}
      <RateLimitNotification isRateLimited={isRateLimited} />

      {/* Magic Palette Modal */}
      <MagicPaletteModal
        showProColors={showProColors}
        setShowProColors={setShowProColors}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        showUpgradeModal={showUpgradeModal}
        setShowUpgradeModal={setShowUpgradeModal}
        handleUpgrade={handleUpgrade}
      />
    </div>
  );
}
