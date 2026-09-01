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
import { generateProceduralPaths } from './services/imageGenerator';
import { printColoringSheet } from './services/pdfExporter';
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
  
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineArtCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize with a random template
  useEffect(() => {
    const randomTemplate = STATIC_TEMPLATES[Math.floor(Math.random() * STATIC_TEMPLATES.length)];
    selectTemplate(randomTemplate);
  }, []);

  // Sync user profile
  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setTrialEndDate(null);
      setIsSubscribed(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, async (snap) => {
      const userData = snap.data();
      let currentTrialEndDate: Date | null = null;
      let currentIsSubscribed = false;

      if (!userData || !userData.createdAt) {
        const now = new Date();
        const trialEndTimestamp = Timestamp.fromMillis(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          trialEndDate: trialEndTimestamp,
          isSubscribed: false,
        }, { merge: true });

        currentTrialEndDate = trialEndTimestamp.toDate();
        currentIsSubscribed = false;
      } else {
        currentTrialEndDate = userData.trialEndDate?.toDate() || null;
        currentIsSubscribed = userData.isSubscribed || false;

        if (!userData.trialEndDate && userData.createdAt) {
          const createdDate = userData.createdAt.toDate();
          const trialEndTimestamp = Timestamp.fromMillis(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000);
          await setDoc(userRef, { trialEndDate: trialEndTimestamp }, { merge: true });
          currentTrialEndDate = trialEndTimestamp.toDate();
        }
      }

      setTrialEndDate(currentTrialEndDate);
      setIsSubscribed(currentIsSubscribed);

      const now = new Date();
      const isTrialActive = currentTrialEndDate && currentTrialEndDate.getTime() > now.getTime();
      setIsPro(currentIsSubscribed || isTrialActive);
    });

    return () => unsubscribe();
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
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setRestoredDataUrl(history[nextIndex]);
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
  };

  // Dynamic AI generation using high-quality Diffusion line art
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

      const result = await generateDynamicAiColoringImage(selectedCategory, customPrompt);

      if (generationId !== currentGenerationId.current) return;

      if (result && result.imageUrl) {
        setCurrentImageUrl(result.imageUrl);
        setPaths([]);
        setViewBox("0 0 1000 1000");
        setHistory([]);
        setHistoryIndex(-1);
        setRestoredDataUrl(null);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: COLORS
          });
        } catch (e) {}
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
    <div className="h-screen w-screen bg-[#FBF9F1] font-sans text-[#2D3436] overflow-hidden flex flex-col"> 
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
      />

      <main className="flex-1 flex flex-col px-2 sm:px-5 pt-1.5 pb-1 gap-1.5 sm:gap-2 overflow-hidden min-h-0">
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
        />

        {/* Bottom Palette Dock (Crayons & Tools) */}
        {!showTemplates && (
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
        )}
      </main>

      {/* Footer (Library only) */}
      {showTemplates && <AppFooter onOpenPricingPage={() => setShowPricingPage(true)} />}

      {/* Rate Limit Notification */}
      <RateLimitNotification isRateLimited={isRateLimited} />

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
    </div>
  );
}
