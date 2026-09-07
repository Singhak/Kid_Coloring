/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'; 
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
  setDoc, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { SvgPath, Template } from './types';
import { 
  COLORS, 
  COLORS_LEFT, 
  COLORS_RIGHT, 
  STATIC_TEMPLATES 
} from './constants'; 
import { generateDynamicAiColoringImage } from './services/dynamicAiGenerator';
import { generateProceduralPaths, getImageUsingAPI } from './services/imageGenerator';
import { printColoringSheet } from './services/pdfExporter';
import { playSwish } from './services/soundEffects';
import AppHeader from './components/AppHeader';
import ColorPaletteDock from './components/ColorPaletteDock';
import CategorySelector from './components/CategorySelector';
import CanvasArea from './components/CanvasArea';
import AppFooter from './components/AppFooter';
import RateLimitNotification from './components/RateLimitNotification';
import MagicPaletteModal from './components/MagicPaletteModal';
import MagicPromptModal from './components/MagicPromptModal';
import UpgradeModal from './components/UpgradeModal';
import PhotoToLineArtModal from './components/PhotoToLineArtModal';
import StickerStampsModal, { StickerItem } from './components/StickerStampsModal';
import FreeVsPaidPage from './components/FreeVsPaidPage';
import HelpFlowModal from './components/HelpFlowModal';
import SpotlightTourOverlay from './components/SpotlightTourOverlay';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, X } from 'lucide-react';

// Declare Razorpay global object
declare global {
  interface Window {
    Razorpay: any;
  }
}

// --- App Component ---

export default function App() {
  const [user] = useAuthState(auth); // Firebase user object
  const [isPro, setIsPro] = useState(false); // Derived state: true if subscribed or trial active
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null); // User's trial end date
  const [isSubscribed, setIsSubscribed] = useState(false); // User's subscription status
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [showProColors, setShowProColors] = useState(false);
  const [showMagicPromptModal, setShowMagicPromptModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const [isColorByNumber, setIsColorByNumber] = useState(false);
  const [showTrialWelcome, setShowTrialWelcome] = useState(false);
  const [showHelpFlow, setShowHelpFlow] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  const [paths, setPaths] = useState<SvgPath[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [restoredDataUrl, setRestoredDataUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState('random');
  const [showTemplates, setShowTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const currentGenerationId = useRef<number>(0);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [viewBox, setViewBox] = useState("0 0 1000 1000");
  const [fillCount, setFillCount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineArtCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize with a random template
  useEffect(() => {
    const randomTemplate = STATIC_TEMPLATES[Math.floor(Math.random() * STATIC_TEMPLATES.length)];
    selectTemplate(randomTemplate);
  }, []);

  // Sync user profile & grant 15-day free trial on login
  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setTrialEndDate(null);
      setIsSubscribed(false);
      return;
    }

    const storageKey = `kidcolor_trial_${user.uid}`;
    const cachedTrialStr = localStorage.getItem(storageKey);
    const now = new Date();
    let localTrialDate: Date;

    // Grant 15 days free trial on login if no cached trial or if trial expired
    if (cachedTrialStr) {
      const parsed = new Date(cachedTrialStr);
      if (!isNaN(parsed.getTime()) && parsed.getTime() > now.getTime()) {
        localTrialDate = parsed;
      } else {
        localTrialDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        localStorage.setItem(storageKey, localTrialDate.toISOString());
      }
    } else {
      localTrialDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      localStorage.setItem(storageKey, localTrialDate.toISOString());
    }

    // Instantly grant active VIP trial access so there is zero lock delay
    setTrialEndDate(localTrialDate);
    setIsPro(true);

    // Show celebration banner once per session on login
    const sessionWelcomeKey = `trial_welcome_shown_${user.uid}`;
    if (!sessionStorage.getItem(sessionWelcomeKey)) {
      sessionStorage.setItem(sessionWelcomeKey, 'true');
      setShowTrialWelcome(true);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.25 },
        colors: ['#FFD93D', '#FF9F43', '#4D96FF', '#6BCB77']
      });
      setTimeout(() => setShowTrialWelcome(false), 6000);
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      async (snap) => {
        try {
          const userData = snap.data();
          let currentTrialEndDate: Date = localTrialDate;
          let currentIsSubscribed = false;

          if (!userData || !userData.createdAt) {
            const trialEndTimestamp = Timestamp.fromDate(localTrialDate);
            await setDoc(
              userRef,
              {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Little Artist',
                photoURL: user.photoURL || '',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                trialEndDate: trialEndTimestamp,
                isSubscribed: false,
              },
              { merge: true }
            );
          } else {
            currentIsSubscribed = userData.isSubscribed || false;
            const firestoreTrial = userData.trialEndDate?.toDate() || null;

            // If user is not subscribed and trial is missing or expired, grant 15-day free trial on login!
            if (!currentIsSubscribed && (!firestoreTrial || firestoreTrial.getTime() <= Date.now())) {
              const freshTrial = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
              await setDoc(
                userRef,
                {
                  trialEndDate: Timestamp.fromDate(freshTrial),
                  lastLoginAt: serverTimestamp(),
                },
                { merge: true }
              );
              currentTrialEndDate = freshTrial;
              localStorage.setItem(storageKey, freshTrial.toISOString());
            } else if (firestoreTrial && firestoreTrial.getTime() > Date.now()) {
              currentTrialEndDate = firestoreTrial;
              localStorage.setItem(storageKey, firestoreTrial.toISOString());
            }
          }

          setTrialEndDate(currentTrialEndDate);
          setIsSubscribed(currentIsSubscribed);

          const isTrialActive = currentTrialEndDate && currentTrialEndDate.getTime() > Date.now();
          setIsPro(currentIsSubscribed || isTrialActive);
        } catch (err) {
          console.warn('Firestore user profile sync warning (retaining 15-day local trial):', err);
          setTrialEndDate(localTrialDate);
          setIsPro(true);
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot error (retaining 15-day local trial):', error);
        setTrialEndDate(localTrialDate);
        setIsPro(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        if (result?.user) {
          // Immediately grant 15-day trial locally
          const initialTrial = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
          localStorage.setItem(`kidcolor_trial_${result.user.uid}`, initialTrial.toISOString());
          setTrialEndDate(initialTrial);
          setIsPro(true);
          setShowTrialWelcome(true);
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.25 },
            colors: ['#FFD93D', '#4D96FF', '#6BCB77', '#FF6B6B']
          });
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsPro(false);
    setTrialEndDate(null);
    setIsSubscribed(false);
    if (user?.uid) {
      sessionStorage.removeItem(`trial_welcome_shown_${user.uid}`);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-script')) {
        setRazorpayLoaded(true);
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setRazorpayLoaded(true);
        resolve(true);
      };
      script.onerror = () => { console.error("Failed to load Razorpay SDK."); resolve(false); };
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    if (!user) {
      handleLogin();
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load payment gateway. Please try again.");
      return;
    }

    try {
      const orderResponse = await fetch('/api/create-razorpay-order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          amount: 49900,
          currency: 'INR',
          receipt: `receipt_${user.uid}_${Date.now()}`,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to create Razorpay order.');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'KidColor VIP Subscription',
        description: 'Magic Pass for All Superpowers',
        image: '/logo.svg',
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/verify-razorpay-payment.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || verifyData.error) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }

            setShowUpgradeModal(false);
            alert("Subscription successful! Welcome to KidColor VIP!");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FFD93D', '#4D96FF', '#6BCB77'] });

          } catch (error: any) {
            console.error("Payment verification error:", error);
            alert(`Payment verification failed: ${error.message}`);
          }
        },
        prefill: { name: user.displayName || '', email: user.email || '' },
        theme: { color: '#FF6B6B' },
        modal: { ondismiss: function() { alert('Payment cancelled by user.'); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Subscription process failed:", error);
      alert(`Subscription failed: ${error.message}`);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to cancel your subscription? This will revoke access to Pro features at the end of your current billing period.")) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { isSubscribed: false }, { merge: true });
      alert("Subscription cancelled. You will lose access to Pro features at the end of your current billing cycle.");
      setShowUpgradeModal(false);
    }
  };

  const handleHistoryPush = useCallback((dataUrl: string) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(dataUrl);
      if (newHistory.length > 40) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 39));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setRestoredDataUrl(history[prevIndex]);
      setFillCount((prev) => Math.max(0, prev - 1));
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setRestoredDataUrl(history[nextIndex]);
      setFillCount((prev) => prev + 1);
    }
  }, [historyIndex, history]);

  const selectTemplate = (template: Template) => {
    setCurrentImageUrl(null);
    const newPaths = (template.paths || []).map(p => ({
      ...p,
      fill: '#FFFFFF',
      stroke: p.stroke || '#1A1A1A',
      strokeWidth: p.strokeWidth || 4
    }));
    setPaths(newPaths);
    setViewBox(template.viewBox || "0 0 1000 1000");
    setHistory([]);
    setHistoryIndex(-1);
    setRestoredDataUrl(null);
    setShowTemplates(false);
    setSelectedCategory(template.category);
    setFillCount(0);
    setResetTrigger((prev) => prev + 1);
  };

  const handleQuickNext = useCallback(() => {
    playSwish();
    const available = STATIC_TEMPLATES.filter(t => t.paths && t.paths.length > 0);
    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      selectTemplate(available[randomIndex]);
    }
  }, []);

  // AI generation: Prioritize PHP Backend SVG vector paths with fallback to diffusion line art
  const handleGenerateAiImage = async (customPrompt?: string) => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    if (isGenerating) return;

    const generationId = ++currentGenerationId.current;

    try {
      setIsGenerating(true);
      setShowTemplates(false);

      const subject = customPrompt && customPrompt.trim().length > 0
        ? customPrompt.trim()
        : selectedCategory;

      // 1. Try PHP AI Path Generator first (generates pure SVG closed vector paths)
      let svgResult: { paths: SvgPath[]; viewBox: string } | null = null;
      try {
        svgResult = await getImageUsingAPI(subject, selectedCategory);
      } catch (phpError) {
        console.warn("PHP AI path generation returned error, falling back to dynamic image:", phpError);
      }

      if (generationId !== currentGenerationId.current) return;

      if (svgResult && Array.isArray(svgResult.paths) && svgResult.paths.length > 0) {
        setPaths(svgResult.paths);
        setViewBox(svgResult.viewBox || "0 0 500 500");
        setCurrentImageUrl(null);
        setHistory([]);
        setHistoryIndex(-1);
        setRestoredDataUrl(null);
        setFillCount(0);
        setResetTrigger((prev) => prev + 1);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: COLORS
          });
        } catch (e) {}
        return;
      }

      // 2. Secondary Fallback: Dynamic AI coloring image diffusion
      const result = await generateDynamicAiColoringImage(selectedCategory, customPrompt);

      if (generationId !== currentGenerationId.current) return;

      if (result && result.imageUrl) {
        setCurrentImageUrl(result.imageUrl);
        setPaths([]);
        setViewBox("0 0 1000 1000");
        setHistory([]);
        setHistoryIndex(-1);
        setRestoredDataUrl(null);
        setFillCount(0);
        setResetTrigger((prev) => prev + 1);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: COLORS
          });
        } catch (e) {}
        return;
      }

      // 3. Tertiary Fallback: Procedural drawing scene
      const procedural = generateProceduralPaths(selectedCategory);
      if (procedural && procedural.paths && procedural.paths.length > 0) {
        setPaths(procedural.paths);
        setViewBox(procedural.viewBox || "0 0 500 500");
        setCurrentImageUrl(null);
        setHistory([]);
        setHistoryIndex(-1);
        setRestoredDataUrl(null);
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Could not generate image. Please try another prompt.");
    } finally {
      if (generationId === currentGenerationId.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleGenerateProceduralRealistic = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    const result = generateProceduralPaths(selectedCategory);
    setCurrentImageUrl(null);
    setPaths(result.paths);
    setViewBox(result.viewBox || "0 0 1000 1000");
    setHistory([]);
    setHistoryIndex(-1);
    setRestoredDataUrl(null);
    setShowTemplates(false);
    setFillCount(0);
    setResetTrigger((prev) => prev + 1);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: COLORS
      });
    } catch (e) {}
  };

  const handleOpenMagicPrompt = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    setShowMagicPromptModal(true);
  };

  const handleSelectPhotoLineArt = (dataUrl: string) => {
    setCurrentImageUrl(dataUrl);
    setPaths([]);
    setViewBox("0 0 1000 1000");
    setHistory([]);
    setHistoryIndex(-1);
    setRestoredDataUrl(null);
    setShowTemplates(false);
    setFillCount(0);
    setResetTrigger((prev) => prev + 1);
  };

  const downloadImage = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    const paintCanvas = paintCanvasRef.current;
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!paintCanvas || !lineArtCanvas) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1000;
    tempCanvas.height = 1120; // Extra space for footer watermark
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    // 1. Fill base white
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 2. Draw paint layer (including colors, patterns, and stickers)
    ctx.drawImage(paintCanvas, 0, 0, 1000, 1000);

    // 3. Composite line art layer with multiply
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(lineArtCanvas, 0, 0, 1000, 1000);
    ctx.restore();

    // 4. Footer branding
    ctx.fillStyle = "#FDFCF0";
    ctx.fillRect(0, 1000, 1000, 120);

    ctx.strokeStyle = "#E6E6E6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 1000);
    ctx.lineTo(1000, 1000);
    ctx.stroke();

    const logoImg = new Image();
    const finishExport = () => {
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
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: COLORS });
      } catch (e) {}
    };

    logoImg.onload = () => {
      try {
        ctx.drawImage(logoImg, 260, 1030, 60, 60);
        ctx.fillStyle = "#2D3436";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Created with Magic at KidColor - kidcolor.storywalla.com", 335, 1066);
      } catch (e) {}
      finishExport();
    };

    logoImg.onerror = () => {
      ctx.fillStyle = "#2D3436";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.fillText("🎨 Created with Magic at KidColor - kidcolor.storywalla.com", 500, 1065);
      finishExport();
    };

    logoImg.src = "/logo.svg";
  };

  const handlePrintSheet = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!lineArtCanvas) return;
    printColoringSheet(lineArtCanvas, 'Coloring Masterpiece');
  };

  const clearCanvas = () => {
    const paintCanvas = paintCanvasRef.current;
    if (!paintCanvas) return;
    const ctx = paintCanvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    const blankDataUrl = paintCanvas.toDataURL();
    handleHistoryPush(blankDataUrl);
    setRestoredDataUrl(blankDataUrl);
    setFillCount(0);
    setResetTrigger((prev) => prev + 1);
  };

  if (showPricingPage) {
    return (
      <FreeVsPaidPage
        onBack={() => setShowPricingPage(false)}
        isPro={isPro}
        user={user}
        handleLogin={handleLogin}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
      />
    );
  }

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-screen bg-[#FBF9F1] font-sans text-[#2D3436] overflow-hidden flex flex-col"> 
      <AppHeader
        user={user}
        isPro={isPro}
        isSubscribed={isSubscribed}
        trialEndDate={trialEndDate}
        showTemplates={showTemplates}
        setShowTemplates={setShowTemplates}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        downloadImage={downloadImage}
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        historyLength={history.length}
        setShowUpgradeModal={setShowUpgradeModal}
        handleCancelSubscription={handleCancelSubscription}
        onOpenPhotoArt={() => setShowPhotoModal(true)}
        isColorByNumber={isColorByNumber}
        onToggleColorByNumber={() => setIsColorByNumber(prev => !prev)}
        onOpenPricingPage={() => setShowPricingPage(true)}
        onOpenMagicAI={handleOpenMagicPrompt}
        isGenerating={isGenerating}
        onQuickNext={handleQuickNext}
        onOpenHelpFlow={() => setShowHelpFlow(true)}
        clearCanvas={clearCanvas}
        onPrintSheet={handlePrintSheet}
      />

      <main className="flex-1 flex flex-col px-1.5 sm:px-5 pt-0.5 sm:pt-1 pb-1 gap-1 sm:gap-1.5 overflow-hidden min-h-0">
        {/* Category Selection Bar (Shown when browsing Library) */}
        {showTemplates && (
          <CategorySelector
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setShowTemplates={setShowTemplates}
            setIsGenerating={setIsGenerating}
            currentGenerationId={currentGenerationId}
          />
        )}

        {/* Center: Canvas Area / Template Library */}
        <div id="tour-canvas-area" className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <CanvasArea
            isPro={isPro}
            isGenerating={isGenerating}
            showTemplates={showTemplates}
            setShowTemplates={setShowTemplates}
            selectedCategory={selectedCategory}
            paths={paths}
            viewBox={viewBox}
            imageUrl={currentImageUrl}
            selectedColor={selectedColor}
            paintCanvasRef={paintCanvasRef}
            lineArtCanvasRef={lineArtCanvasRef}
            onHistoryPush={handleHistoryPush}
            restoredDataUrl={restoredDataUrl}
            generateRandomImage={handleOpenMagicPrompt}
            selectTemplate={selectTemplate}
            downloadImage={downloadImage}
            clearCanvas={clearCanvas}
            setShowUpgradeModal={setShowUpgradeModal}
            onPrintSheet={handlePrintSheet}
            onOpenPhotoArt={() => setShowPhotoModal(true)}
            selectedSticker={selectedSticker}
            onClearSticker={() => setSelectedSticker(null)}
            isColorByNumber={isColorByNumber}
            onToggleColorByNumber={() => setIsColorByNumber(prev => !prev)}
            onOpenStickers={() => setShowStickerModal(true)}
            onQuickNext={handleQuickNext}
            fillCount={fillCount}
            onIncrementFillCount={() => setFillCount((prev) => prev + 1)}
            resetTrigger={resetTrigger}
          />
        </div>

        {/* Bottom Palette Dock (Crayons & Tools) */}
        {!showTemplates && (
          <div id="tour-palette-dock" className="w-full shrink-0">
            <ColorPaletteDock
              selectedColor={selectedColor}
              setSelectedColor={(c) => {
                setSelectedSticker(null);
                setSelectedColor(c);
              }}
              isPro={isPro}
              setShowUpgradeModal={setShowUpgradeModal}
              showProColors={showProColors}
              setShowProColors={setShowProColors}
              selectedSticker={selectedSticker}
              onOpenStickers={() => setShowStickerModal(true)}
              isColorByNumber={isColorByNumber}
            />
          </div>
        )}
      </main>

      {/* Footer (Library only) */}
      {showTemplates && <AppFooter onOpenPricingPage={() => setShowPricingPage(true)} />}

      {/* Rate Limit Notification */}
      <RateLimitNotification isRateLimited={isRateLimited} />

      {/* 15-Day Free Trial Welcome Banner */}
      <AnimatePresence>
        {showTrialWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[#FFF9E6] via-[#FFF3C4] to-[#FFEAA7] border-2 border-[#FFD93D] px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 max-w-[92vw] sm:max-w-md"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF9F43] to-[#FFD93D] flex items-center justify-center text-white shadow-sm shrink-0">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black text-[#2D3436] flex items-center gap-1">
                <span>🎉 15-Day Free VIP Trial Active!</span>
              </p>
              <p className="text-[11px] font-bold text-[#8C5B00] truncate">
                All Magic AI, Photo Art & Pro colors unlocked!
              </p>
            </div>
            <button
              onClick={() => setShowTrialWelcome(false)}
              className="p-1 text-[#8C5B00] hover:text-[#2D3436] font-black rounded-lg hover:bg-black/5 text-xs transition-colors shrink-0 cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Magic Palette Modal */}
      <MagicPaletteModal
        showProColors={showProColors}
        setShowProColors={setShowProColors}
        selectedColor={selectedColor}
        setSelectedColor={(c) => {
          setSelectedSticker(null);
          setSelectedColor(c);
        }}
      />

      {/* Magic Prompt Modal */}
      <MagicPromptModal
        isOpen={showMagicPromptModal}
        onClose={() => setShowMagicPromptModal(false)}
        onGeneratePrompt={(prompt) => handleGenerateAiImage(prompt)}
        onInstantRealistic={handleGenerateProceduralRealistic}
        isGenerating={isGenerating}
      />

      {/* Photo to Line Art Modal */}
      <PhotoToLineArtModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        isPro={isPro}
        setShowUpgradeModal={setShowUpgradeModal}
        onSelectPhotoLineArt={handleSelectPhotoLineArt}
      />

      {/* Sticker Stamps Modal */}
      <StickerStampsModal
        isOpen={showStickerModal}
        onClose={() => setShowStickerModal(false)}
        isPro={isPro}
        selectedSticker={selectedSticker}
        onSelectSticker={(stk) => setSelectedSticker(stk)}
        setShowUpgradeModal={setShowUpgradeModal}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        showUpgradeModal={showUpgradeModal}
        setShowUpgradeModal={setShowUpgradeModal}
        user={user}
        isPro={isPro}
        trialEndDate={trialEndDate}
        isSubscribed={isSubscribed}
        handleLogin={handleLogin}
        handleSubscribe={handleSubscribe}
        onOpenPricingPage={() => setShowPricingPage(true)}
      />

      {/* Help Flow Guided Modal */}
      <HelpFlowModal
        isOpen={showHelpFlow}
        onClose={() => setShowHelpFlow(false)}
        onStartLiveTour={() => {
          setShowHelpFlow(false);
          if (showTemplates) {
            setShowTemplates(false);
          }
          setIsTourActive(true);
        }}
        onOpenLibrary={() => {
          setShowTemplates(true);
        }}
        onOpenMagicAI={handleOpenMagicPrompt}
        onOpenPhotoArt={() => setShowPhotoModal(true)}
        onToggleNumbers={() => {
          setShowTemplates(false);
          setIsColorByNumber(prev => !prev);
        }}
        onOpenStickers={() => {
          setShowTemplates(false);
          setShowStickerModal(true);
        }}
        onPrintSheet={handlePrintSheet}
        onOpenPricingPage={() => setShowPricingPage(true)}
        onQuickNext={handleQuickNext}
        isPro={isPro}
      />

      {/* Live Spotlight On-Screen Tour */}
      <SpotlightTourOverlay
        isActive={isTourActive}
        onClose={() => setIsTourActive(false)}
      />
    </div>
  );
}
