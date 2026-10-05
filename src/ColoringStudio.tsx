/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react'; 
import confetti from 'canvas-confetti';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  signInWithCredential,
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
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { SvgPath, Template } from './types';
import { 
  COLORS, 
  COLORS_LEFT, 
  COLORS_RIGHT, 
  STATIC_TEMPLATES,
  SUBJECTS_BY_CATEGORY 
} from './constants'; 
import { generateDynamicAiColoringImage } from './services/dynamicAiGenerator';
import { generateProceduralPaths, getImageUsingAPI } from './services/imageGenerator';
import { autoNumberFromImage, autoNumberFromPaths, AUTO_NUMBER_ID_PREFIX } from './services/autoNumber';
import { buildNumberTemplateFromAi, NUMBER_AI_SUBJECTS } from './services/numberedFromAi';
import { COLOR_BY_NUMBER_TEMPLATES } from './constants/colorByNumberTemplates';
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
import LegalPolicyPage, { LegalTabType } from './components/LegalPolicyPage';
import HelpFlowModal from './components/HelpFlowModal';
import SpotlightTourOverlay from './components/SpotlightTourOverlay';
import PaymentStatusModal, { PaymentModalStatus } from './components/PaymentStatusModal';
import EducationalArticlesModal from './components/EducationalArticlesModal';
import ColoroChatBotModal from './components/ColoroChatBotModal';
import AnalyticsDashboardModal from './components/AnalyticsDashboardModal';
import PinterestStudioModal from './components/PinterestStudioModal';
import { autoPublishArtworkSilently } from './services/autoPinterestPublisher';
import { tracker } from './services/tracker';
import {
  createCashfreeOrder,
  initiateCashfreeCheckout,
  verifyCashfreePayment,
  pollCashfreePayment,
  recordOrderSuccessInFirestore,
  PlanType,
} from './services/paymentService';
import { sendWelcomeEmail } from './services/emailService';
import { claimTrial } from './services/authService';
import { LoginModal } from './components/LoginModal';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Sparkles, X } from 'lucide-react';

// --- ColoringStudio Component ---

export interface ColoringStudioProps {
  onNavigateHome?: () => void;
}

export default function ColoringStudio({ onNavigateHome }: ColoringStudioProps = {}) {
  const [user, loadingAuth] = useAuthState(auth); // Firebase user object
  const [isPro, setIsPro] = useState(false); // Derived state: true if subscribed or trial active
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null); // User's trial end date
  const [isSubscribed, setIsSubscribed] = useState(false); // User's subscription status
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalPlan, setUpgradeModalPlan] = useState<'annual' | 'monthly'>('annual');
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTabType | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showPinterestStudio, setShowPinterestStudio] = useState(false);
  const [showProColors, setShowProColors] = useState(false);
  const [showMagicPromptModal, setShowMagicPromptModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const [numberTemplate, setNumberTemplate] = useState<Template | null>(null);
  // The Numbers button is "on" while a real numbered picture is open (the old random-badge overlay is retired)
  const isColorByNumber = Boolean(numberTemplate);
  const numberPrintRef = useRef<(() => boolean) | null>(null);
  const [showTrialWelcome, setShowTrialWelcome] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHelpFlow, setShowHelpFlow] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [showChatBotModal, setShowChatBotModal] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);

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
  const [viewBox, setViewBox] = useState("0 0 1000 1000");
  const [fillCount, setFillCount] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [currentTemplateName, setCurrentTemplateName] = useState<string>('Happy House');
  const isAiGeneratedRef = useRef<boolean>(false);

  // Listen for direct URL routing: query params (?category=animals), hash (#category=animals), and paths
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search;
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(search);

      // Check for Pinterest Studio tool trigger
      if (
        hash === '#pinterest-studio' || 
        hash === '#pinterest' || 
        params.get('tool') === 'pinterest-studio' || 
        params.get('pinterest') === 'true'
      ) {
        setShowPinterestStudio(true);
      }

      // Check for category deep-linking (?category=animals, #category=animals, /category/animals)
      let targetCat: string | null = null;
      if (params.get('category')) {
        targetCat = params.get('category');
      } else if (params.get('cat')) {
        targetCat = params.get('cat');
      } else if (hash.startsWith('#category=')) {
        targetCat = hash.replace('#category=', '');
      } else if (hash.startsWith('#cat=')) {
        targetCat = hash.replace('#cat=', '');
      } else if (pathname.startsWith('/category/')) {
        targetCat = pathname.replace('/category/', '').replace(/\/$/, '');
      }

      if (targetCat) {
        const normalized = targetCat.toLowerCase().trim();
        const categoryMap: Record<string, string> = {
          animal: 'animal',
          animals: 'animal',
          alphabet: 'alphabet',
          alphabets: 'alphabet',
          number: 'numbers',
          numbers: 'numbers',
          fruit: 'fruits',
          fruits: 'fruits',
          vegetable: 'vegetables',
          vegetables: 'vegetables',
          nature: 'nature',
          space: 'space',
          vehicle: 'vehicles',
          vehicles: 'vehicles',
          festival: 'festivals',
          festivals: 'festivals',
          holiday: 'festivals',
          holidays: 'festivals',
          weekly: 'weekly',
          object: 'object',
          objects: 'object',
          all: 'random',
          random: 'random',
        };

        const resolvedCat = categoryMap[normalized] || normalized;
        if (resolvedCat) {
          setSelectedCategory(resolvedCat);
          setShowTemplates(true);
          
          // Pre-load the first matching template in canvas state
          const matchingTemplate = STATIC_TEMPLATES.find(t => t.category === resolvedCat) || STATIC_TEMPLATES[0];
          if (matchingTemplate) {
            isAiGeneratedRef.current = false;
            setCurrentTemplateName(matchingTemplate.name || 'Coloring Page');
            setCurrentImageUrl(null);
            const newPaths = (matchingTemplate.paths || []).map(p => ({
              ...p,
              fill: '#FFFFFF',
              stroke: p.stroke || '#1A1A1A',
              strokeWidth: p.strokeWidth || 4
            }));
            setPaths(newPaths);
            setNumberTemplate(matchingTemplate.numberMode ? matchingTemplate : null);
            setViewBox(matchingTemplate.viewBox || "0 0 1000 1000");
          }

          tracker.event('acquisition', 'pinterest_landing', resolvedCat, undefined, {
            url: window.location.href,
            source: 'pinterest_direct_link',
            category: resolvedCat
          });
        }
      } else {
        // Default entry without category deep-link: load a random template onto the canvas
        const randomTemplate = STATIC_TEMPLATES[Math.floor(Math.random() * STATIC_TEMPLATES.length)];
        if (randomTemplate) {
          isAiGeneratedRef.current = false;
          setCurrentTemplateName(randomTemplate.name || 'Coloring Page');
          setCurrentImageUrl(null);
          const newPaths = (randomTemplate.paths || []).map(p => ({
            ...p,
            fill: '#FFFFFF',
            stroke: p.stroke || '#1A1A1A',
            strokeWidth: p.strokeWidth || 4
          }));
          setPaths(newPaths);
          setNumberTemplate(randomTemplate.numberMode ? randomTemplate : null);
          setViewBox(randomTemplate.viewBox || "0 0 1000 1000");
          setSelectedCategory(randomTemplate.category);
          setShowTemplates(false);
        }
      }

      // Legal & Monetization modal routes
      if (hash === '#privacy') {
        setLegalTab('privacy');
        setShowPricingPage(false);
        tracker.pageView('#privacy', 'Privacy Policy');
      } else if (hash === '#terms' || hash === '#terms-and-conditions') {
        setLegalTab('terms');
        setShowPricingPage(false);
        tracker.pageView('#terms', 'Terms and Conditions');
      } else if (hash === '#refund' || hash === '#refund-policy' || hash === '#cancellation') {
        setLegalTab('refund');
        setShowPricingPage(false);
        tracker.pageView('#refund', 'Refund Policy');
      } else if (hash === '#contact' || hash === '#contact-us') {
        setLegalTab('contact');
        setShowPricingPage(false);
        tracker.pageView('#contact', 'Contact Us');
      } else if (hash.startsWith('#upgrade') || hash.startsWith('#subscribe')) {
        const plan = hash.includes('monthly') ? 'monthly' : 'annual';
        setUpgradeModalPlan(plan);
        setShowUpgradeModal(true);
        setShowPricingPage(false);
        setLegalTab(null);
        tracker.trackMonetization('open_upgrade_modal', plan);
        tracker.pageView(hash, 'VIP Upgrade Checkout');
      } else if (hash === '#pricing') {
        setShowPricingPage(true);
        setLegalTab(null);
        tracker.trackMonetization('view_pricing');
        tracker.pageView('#pricing', 'VIP Pricing & Plans');
      } else if (hash === '#admin-telemetry' || hash === '#admin-stats') {
        setShowAnalyticsModal(true);
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, []);

  // Cashfree Payment Modal State
  const [paymentModalState, setPaymentModalState] = useState<{
    isOpen: boolean;
    status: PaymentModalStatus;
    planName?: string;
    orderId?: string;
    errorMessage?: string;
    planType?: PlanType;
  }>({
    isOpen: false,
    status: 'idle',
  });
  
  const activePollCancelRef = useRef<(() => void) | null>(null);

  // Clean up any polling on unmount
  useEffect(() => {
    return () => {
      if (activePollCancelRef.current) {
        activePollCancelRef.current();
        activePollCancelRef.current = null;
      }
    };
  }, []);

  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineArtCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Silent Auto-Publish to Pinterest RSS Feed when user colors an artwork (debounced 3s)
  useEffect(() => {
    if (fillCount < 1) return;
    const timer = setTimeout(() => {
      autoPublishArtworkSilently({
        paintCanvas: paintCanvasRef.current,
        lineArtCanvas: lineArtCanvasRef.current,
        category: selectedCategory,
        templateName: currentTemplateName,
        isAi: isAiGeneratedRef.current,
        fillCount
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [fillCount, selectedCategory, currentTemplateName]);

  // Also auto-publish immediately when user navigates away or switches tabs
  useEffect(() => {
    const handleLeave = () => {
      if (fillCount >= 1) {
        autoPublishArtworkSilently({
          paintCanvas: paintCanvasRef.current,
          lineArtCanvas: lineArtCanvasRef.current,
          category: selectedCategory,
          templateName: currentTemplateName,
          isAi: isAiGeneratedRef.current,
          fillCount
        });
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    };

    window.addEventListener('beforeunload', handleLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fillCount, selectedCategory, currentTemplateName]);

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

    // The trial is granted by the server (once per person). The local value is only
    // a cache of what the server already told this device, so the UI is instant
    // on reload; with no cache the user is not Pro until the server answers.
    let localTrialDate: Date | null = null;
    if (cachedTrialStr) {
      const parsed = new Date(cachedTrialStr);
      if (!isNaN(parsed.getTime())) localTrialDate = parsed;
    }

    const isLocalTrialActive = !!localTrialDate && localTrialDate.getTime() > now.getTime();
    setTrialEndDate(localTrialDate);
    setIsPro(isLocalTrialActive);

    // Show celebration banner once per session ONLY if trial is currently active
    const showTrialCelebration = () => {
      const sessionWelcomeKey = `trial_welcome_shown_${user.uid}`;
      if (sessionStorage.getItem(sessionWelcomeKey)) return;
      sessionStorage.setItem(sessionWelcomeKey, 'true');
      setShowTrialWelcome(true);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.25 },
        colors: ['#FFD93D', '#FF9F43', '#4D96FF', '#6BCB77']
      });
      setTimeout(() => setShowTrialWelcome(false), 6000);
    };
    if (isLocalTrialActive) showTrialCelebration();

    let claiming = false;
    const claimFromServer = async (): Promise<Date | null> => {
      if (claiming) return null;
      claiming = true;
      try {
        const { trialEndDate: serverTrial } = await claimTrial(user);
        localStorage.setItem(storageKey, serverTrial.toISOString());
        if (serverTrial.getTime() > Date.now()) showTrialCelebration();
        return serverTrial;
      } catch (err) {
        console.warn('Trial claim failed:', err);
        return null;
      } finally {
        claiming = false;
      }
    };

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      async (snap) => {
        try {
          const userData = snap.data();
          let currentTrialEndDate: Date | null = localTrialDate;
          let currentIsSubscribed = false;

          if (!userData || !userData.createdAt) {
            // First login: the server creates the profile and grants the one-time trial.
            // The snapshot fires again once the profile exists (welcome email is sent then).
            const serverTrial = await claimFromServer();
            if (serverTrial) currentTrialEndDate = serverTrial;
          } else {
            // Check if user has an active, unexpired subscription
            const subEndDate = userData.subscriptionEndDate?.toDate() || null;
            const isSubValid = Boolean(userData.isSubscribed && subEndDate && subEndDate.getTime() > Date.now());
            currentIsSubscribed = isSubValid;
            const firestoreTrial = userData.trialEndDate?.toDate() || null;

            if (!firestoreTrial) {
              // Profile without a trial: ask the server (it grants at most one per person)
              const serverTrial = await claimFromServer();
              if (serverTrial) currentTrialEndDate = serverTrial;
            } else {
              currentTrialEndDate = firestoreTrial;
              localStorage.setItem(storageKey, firestoreTrial.toISOString());

              // Once per device, make sure the server has a claim on record for this
              // person (covers accounts created before server-side tracking).
              const syncedKey = `kidcolor_trial_synced_${user.uid}`;
              if (!localStorage.getItem(syncedKey)) {
                localStorage.setItem(syncedKey, 'true');
                claimFromServer().catch(() => {});
              }
            }

            // Dispatch welcome email if not previously sent
            if (!userData.welcomeEmailSent && user.email) {
              const welcomeKey = `kidcolor_welcome_sent_${user.uid}`;
              if (!localStorage.getItem(welcomeKey)) {
                localStorage.setItem(welcomeKey, 'true');
                sendWelcomeEmail({
                  userId: user.uid,
                  email: user.email,
                  displayName: user.displayName || userData.displayName || 'Little Artist',
                  trialEndDate: currentTrialEndDate ?? undefined,
                }).catch((err) => console.warn('Welcome email error:', err));

                setDoc(userRef, { welcomeEmailSent: true }, { merge: true }).catch(() => {});
              }
            }
          }

          setTrialEndDate(currentTrialEndDate);
          setIsSubscribed(currentIsSubscribed);

          const isTrialActive = !!currentTrialEndDate && currentTrialEndDate.getTime() > Date.now();
          const effectivePro = currentIsSubscribed || isTrialActive;
          setIsPro(effectivePro);
          tracker.identify(user.uid, { isPro: effectivePro });
        } catch (err) {
          console.warn('Firestore user profile sync warning (using cached trial only):', err);
          setTrialEndDate(localTrialDate);
          setIsPro(isLocalTrialActive);
          tracker.identify(user.uid, { isPro: isLocalTrialActive });
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot error (using cached trial only):', error);
        setTrialEndDate(localTrialDate);
        setIsPro(isLocalTrialActive);
        tracker.identify(user.uid, { isPro: isLocalTrialActive });
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Google sign-in. The free trial is claimed from the server by the profile-sync effect.
  const handleGoogleLogin = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native Google account picker, then hand the ID token to the Firebase web SDK.
        const result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
        if (result.credential?.idToken) {
          await signInWithCredential(auth, GoogleAuthProvider.credential(result.credential.idToken));
        }
      } else {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Every "Sign in" button opens the chooser (Google or email code).
  const handleLogin = () => setShowLoginModal(true);

  // Google One Tap: when signed out, show the browser's Google account chooser popup.
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || loadingAuth || user || Capacitor.isNativePlatform()) return;

    let cancelled = false;
    const init = () => {
      const gsi = window.google?.accounts?.id;
      if (cancelled || !gsi) return;
      gsi.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: async ({ credential }) => {
          try {
            await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
          } catch (error) {
            console.error("One Tap login failed:", error);
          }
        },
      });
      gsi.prompt();
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel();
    };
  }, [user, loadingAuth]);

  const handleLogout = () => {
    signOut(auth);
    setIsPro(false);
    setTrialEndDate(null);
    setIsSubscribed(false);
    tracker.identify(null);
    if (user?.uid) {
      sessionStorage.removeItem(`trial_welcome_shown_${user.uid}`);
    }
  };

  // Cashfree Payment Flow with Idempotency and order_id primary key
  const handleSubscribe = async (plan: PlanType = 'annual') => {
    if (!user) {
      handleLogin();
      return;
    }

    tracker.trackMonetization('click_subscribe', plan);

    // Cancel any previous polling if running
    if (activePollCancelRef.current) {
      activePollCancelRef.current();
      activePollCancelRef.current = null;
    }

    setShowUpgradeModal(false);
    const planTitle = plan === 'monthly' ? 'VIP Monthly Pass (₹99)' : 'VIP Annual Magic Pass (₹499)';

    setPaymentModalState({
      isOpen: true,
      status: 'verifying',
      planName: planTitle,
      planType: plan,
    });

    try {
      // 1. Create order on Cashfree via secure backend
      const order = await createCashfreeOrder({
        userId: user.uid,
        planType: plan,
        customerEmail: user.email || 'parent@coloro.com',
        customerName: user.displayName || 'Coloro Artist',
        customerPhone: '9876543210',
      });

      if (!order || !order.payment_session_id) {
        throw new Error(order?.error || 'Failed to initialize payment order with Cashfree.');
      }

      setPaymentModalState(prev => ({
        ...prev,
        orderId: order.order_id,
      }));

      // 2. Open Cashfree In-App Modal Checkout with matching environment mode
      const checkoutResult = await initiateCashfreeCheckout(order.payment_session_id, order.environment);

      if (!checkoutResult.success) {
        tracker.trackMonetization('payment_failed', plan, undefined, { stage: 'checkout_cancelled', error: checkoutResult.error });
        setPaymentModalState({
          isOpen: true,
          status: 'failed',
          orderId: order.order_id,
          errorMessage: checkoutResult.error || 'Payment was cancelled or closed.',
          planName: planTitle,
          planType: plan,
        });
        return;
      }

      // 3. Verify Payment Status with Backend
      setPaymentModalState(prev => ({
        ...prev,
        status: 'verifying',
      }));

      const verifyRes = await verifyCashfreePayment(
        order.order_id,
        user.uid,
        user.email || undefined,
        user.displayName || undefined
      );
      const verifiedPlan: PlanType = (verifyRes.planType as PlanType) || plan;
      const finalPlanTitle = verifiedPlan === 'monthly' ? 'VIP Monthly Pass (₹99)' : 'VIP Annual Magic Pass (₹499)';

      if (verifyRes.success) {
        tracker.trackMonetization('payment_success', verifiedPlan, verifyRes.amount);
        // 4. Idempotently record order in Firestore strictly keyed by order_id (orders/{order_id})
        await recordOrderSuccessInFirestore(order.order_id, user.uid, verifiedPlan, verifyRes);
        setIsSubscribed(true);
        setIsPro(true);
        setPaymentModalState({
          isOpen: true,
          status: 'success',
          orderId: order.order_id,
          planName: finalPlanTitle,
          planType: verifiedPlan,
        });
      } else if (verifyRes.isPending) {
        // Pending state: waiting for UPI authorization
        setPaymentModalState({
          isOpen: true,
          status: 'pending',
          orderId: order.order_id,
          planName: finalPlanTitle,
          planType: verifiedPlan,
        });

        // Start polling verification
        activePollCancelRef.current = pollCashfreePayment(
          order.order_id,
          user.uid,
          async (pollRes) => {
            if (pollRes.success) {
              const pollPlan: PlanType = (pollRes.planType as PlanType) || verifiedPlan;
              tracker.trackMonetization('payment_success', pollPlan, pollRes.amount);
              await recordOrderSuccessInFirestore(order.order_id, user.uid, pollPlan, pollRes);
              setIsSubscribed(true);
              setIsPro(true);
              setPaymentModalState({
                isOpen: true,
                status: 'success',
                orderId: order.order_id,
                planName: pollPlan === 'monthly' ? 'VIP Monthly Pass (₹99)' : 'VIP Annual Magic Pass (₹499)',
                planType: pollPlan,
              });
            } else if (!pollRes.isPending && pollRes.error) {
              tracker.trackMonetization('payment_failed', verifiedPlan, undefined, { error: pollRes.error });
              setPaymentModalState({
                isOpen: true,
                status: 'failed',
                orderId: order.order_id,
                errorMessage: pollRes.error,
                planName: finalPlanTitle,
                planType: verifiedPlan,
              });
            }
          },
          user.email || undefined,
          user.displayName || undefined
        );
      } else {
        tracker.trackMonetization('payment_failed', verifiedPlan, undefined, { error: verifyRes.error });
        setPaymentModalState({
          isOpen: true,
          status: 'failed',
          orderId: order.order_id,
          errorMessage: verifyRes.error || 'Payment could not be confirmed.',
          planName: finalPlanTitle,
          planType: verifiedPlan,
        });
      }
    } catch (err: any) {
      console.error('Subscription process failed:', err);
      tracker.trackMonetization('payment_failed', plan, undefined, { error: err.message });
      setPaymentModalState({
        isOpen: true,
        status: 'failed',
        errorMessage: err.message || 'Payment initiation failed. Please try again.',
        planName: planTitle,
        planType: plan,
      });
    }
  };

  // Handle redirect return on mobile or UPI full-page callbacks
  const handleVerifyReturnedOrder = useCallback(async (returnedOrderId: string) => {
    if (!user) {
      sessionStorage.setItem('pending_cashfree_order_id', returnedOrderId);
      return;
    }

    // Cancel any previous polling
    if (activePollCancelRef.current) {
      activePollCancelRef.current();
      activePollCancelRef.current = null;
    }

    const initialPlan: PlanType = (returnedOrderId.includes('mon') || returnedOrderId.startsWith('kc_mon_')) ? 'monthly' : 'annual';
    const planTitle = initialPlan === 'monthly' ? 'VIP Monthly Pass (₹99)' : 'VIP Annual Magic Pass (₹499)';

    setPaymentModalState({
      isOpen: true,
      status: 'verifying',
      orderId: returnedOrderId,
      planName: planTitle,
      planType: initialPlan,
    });

    try {
      const verifyRes = await verifyCashfreePayment(returnedOrderId, user.uid);
      const verifiedPlan: PlanType = (verifyRes.planType as PlanType) || initialPlan;
      const finalPlanTitle = verifiedPlan === 'monthly' ? 'VIP Monthly Pass (₹99)' : 'VIP Annual Magic Pass (₹499)';

      if (verifyRes.success) {
        await recordOrderSuccessInFirestore(returnedOrderId, user.uid, verifiedPlan, verifyRes);
        setIsSubscribed(true);
        setIsPro(true);
        setPaymentModalState({
          isOpen: true,
          status: 'success',
          orderId: returnedOrderId,
          planName: finalPlanTitle,
          planType: verifiedPlan,
        });
      } else if (verifyRes.isPending) {
        setPaymentModalState({
          isOpen: true,
          status: 'pending',
          orderId: returnedOrderId,
          planName: finalPlanTitle,
          planType: verifiedPlan,
        });

        activePollCancelRef.current = pollCashfreePayment(returnedOrderId, user.uid, async (pollRes) => {
          if (pollRes.success) {
            const pollPlan: PlanType = (pollRes.planType as PlanType) || verifiedPlan;
            await recordOrderSuccessInFirestore(returnedOrderId, user.uid, pollPlan, pollRes);
            setIsSubscribed(true);
            setIsPro(true);
            setPaymentModalState({
              isOpen: true,
              status: 'success',
              orderId: returnedOrderId,
              planName: pollPlan === 'monthly' ? 'VIP Monthly Pass (₹99)' : 'VIP Annual Magic Pass (₹499)',
              planType: pollPlan,
            });
          } else if (!pollRes.isPending && pollRes.error) {
            setPaymentModalState({
              isOpen: true,
              status: 'failed',
              orderId: returnedOrderId,
              errorMessage: pollRes.error,
              planName: finalPlanTitle,
              planType: verifiedPlan,
            });
          }
        });
      } else {
        setPaymentModalState({
          isOpen: true,
          status: 'failed',
          orderId: returnedOrderId,
          errorMessage: verifyRes.error || 'Payment could not be verified.',
          planName: finalPlanTitle,
          planType: verifiedPlan,
        });
      }
    } catch (e: any) {
      setPaymentModalState({
        isOpen: true,
        status: 'failed',
        orderId: returnedOrderId,
        errorMessage: e.message || 'Payment verification failed.',
        planName: planTitle,
        planType: initialPlan,
      });
    }
  }, [user]);

  // Inspect URL on page load for Cashfree return_url (?order_id=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const orderIdParam = searchParams.get('order_id');

    if (orderIdParam) {
      // Clean query parameters from URL without reloading
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);

      handleVerifyReturnedOrder(orderIdParam);
    } else if (user) {
      // Check if there was an unauthenticated order waiting
      const pendingOrderId = sessionStorage.getItem('pending_cashfree_order_id');
      if (pendingOrderId) {
        sessionStorage.removeItem('pending_cashfree_order_id');
        handleVerifyReturnedOrder(pendingOrderId);
      }
    }
  }, [user, handleVerifyReturnedOrder]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to cancel your subscription? This will revoke access to Pro features at the end of your current billing period.")) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { isSubscribed: false }, { merge: true });
      tracker.trackMonetization('cancel_subscription');
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
      tracker.trackCanvas('undo');
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setRestoredDataUrl(history[prevIndex]);
      setFillCount((prev) => Math.max(0, prev - 1));
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      tracker.trackCanvas('redo');
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setRestoredDataUrl(history[nextIndex]);
      setFillCount((prev) => prev + 1);
    }
  }, [historyIndex, history]);

  const selectTemplate = (template: Template) => {
    // If previous artwork was colored, silently auto-publish to Pinterest RSS feed
    if (fillCount >= 1) {
      autoPublishArtworkSilently({
        paintCanvas: paintCanvasRef.current,
        lineArtCanvas: lineArtCanvasRef.current,
        category: selectedCategory,
        templateName: currentTemplateName,
        isAi: isAiGeneratedRef.current,
        fillCount
      });
    }

    isAiGeneratedRef.current = false;
    setCurrentTemplateName(template.name || 'Coloring Page');
    tracker.trackTemplate(template.name || template.category, template.category, 'select_template');
    setCurrentImageUrl(null);
    const newPaths = (template.paths || []).map(p => ({
      ...p,
      fill: '#FFFFFF',
      stroke: p.stroke || '#1A1A1A',
      strokeWidth: p.strokeWidth || 4
    }));
    setPaths(newPaths);
    setNumberTemplate(template.numberMode ? template : null);
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
    tracker.trackTemplate('Quick Next Shuffle', 'quick_next', 'quick_next');
    const available = STATIC_TEMPLATES.filter(t => t.paths && t.paths.length > 0);
    if (available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      selectTemplate(available[randomIndex]);
    }
  }, [fillCount, selectedCategory, currentTemplateName]);

  // AI generation: Prioritize PHP Backend SVG vector paths with fallback to diffusion line art
  // Color by Number AI: a numbered picture from a typed prompt, or a random simple subject.
  // Category taps use curated subjects (cacheable on the server); typed prompts are the child's own idea.
  const handleGenerateNumberedAi = async (customPrompt?: string) => {
    if (!isPro) {
      tracker.trackMonetization('open_upgrade_modal');
      setShowUpgradeModal(true);
      return;
    }
    if (isGenerating) return;

    const typed = customPrompt?.trim();
    const subject = typed || NUMBER_AI_SUBJECTS[Math.floor(Math.random() * NUMBER_AI_SUBJECTS.length)];
    tracker.trackAI('number_ai', subject, 'colorbynumber');

    const generationId = ++currentGenerationId.current;
    setIsGenerating(true);
    setShowTemplates(false);

    try {
      let template: Template | null = null;
      // The AI is not always usable (broken or too-tiny shapes), so try twice before falling back
      for (let attempt = 0; attempt < 2 && !template; attempt++) {
        try {
          const result = await getImageUsingAPI(subject, 'colorbynumber', true, Boolean(typed));
          template = buildNumberTemplateFromAi(result.paths, result.viewBox, subject);
        } catch (e) {
          console.warn('Numbered AI attempt failed:', e);
        }
        if (generationId !== currentGenerationId.current) return;
      }

      if (template) {
        selectTemplate(template);
        return;
      }

      // Fallback: a ready-made numbered picture, so the child is never left with nothing
      tracker.event('color_by_number', 'ai_fallback', subject);
      const pool = COLOR_BY_NUMBER_TEMPLATES.filter(t => !t.isVip);
      selectTemplate(pool[Math.floor(Math.random() * pool.length)]);
      alert("That one was too tricky to draw this time, so here's a ready-made number picture instead!");
    } finally {
      if (generationId === currentGenerationId.current) {
        setIsGenerating(false);
      }
    }
  };

  // Category taps use a curated subject (varied, never the same twice in a row, cacheable on the server)
  const lastSubjectByCategory = useRef<Record<string, string>>({});
  const pickCategorySubject = (category: string): string => {
    const pool = SUBJECTS_BY_CATEGORY[category];
    if (!pool || pool.length === 0) return category;
    const last = lastSubjectByCategory.current[category];
    const choices = pool.length > 1 ? pool.filter((x) => x !== last) : pool;
    const pick = choices[Math.floor(Math.random() * choices.length)];
    lastSubjectByCategory.current[category] = pick;
    return pick;
  };

  const handleGenerateAiImage = async (customPrompt?: string, options?: { numbered?: boolean; category?: string }) => {
    const category = options?.category ?? selectedCategory;
    if (options?.numbered || category === 'colorbynumber') {
      await handleGenerateNumberedAi(customPrompt);
      return;
    }
    if (!isPro) {
      tracker.trackMonetization('open_upgrade_modal');
      setShowUpgradeModal(true);
      return;
    }

    isAiGeneratedRef.current = true;
    setCurrentTemplateName(customPrompt && customPrompt.trim().length > 0 ? `AI Art: ${customPrompt.trim()}` : 'AI Magical Art');
    tracker.trackAI('magic_prompt', customPrompt, category);

    if (isGenerating) return;

    const generationId = ++currentGenerationId.current;

    try {
      setIsGenerating(true);
      setShowTemplates(false);

      const subject = customPrompt && customPrompt.trim().length > 0
        ? customPrompt.trim()
        : pickCategorySubject(category);

      // 1. Try PHP AI Path Generator first (generates pure SVG closed vector paths)
      let svgResult: { paths: SvgPath[]; viewBox: string } | null = null;
      try {
        svgResult = await getImageUsingAPI(subject, category, false, Boolean(customPrompt && customPrompt.trim()));
      } catch (phpError) {
        console.warn("PHP AI path generation returned error, falling back to dynamic image:", phpError);
      }

      if (generationId !== currentGenerationId.current) return;

      if (svgResult && Array.isArray(svgResult.paths) && svgResult.paths.length > 0) {
        setPaths(svgResult.paths);
        setNumberTemplate(null);
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
      const result = await generateDynamicAiColoringImage(category, customPrompt);

      if (generationId !== currentGenerationId.current) return;

      if (result && result.imageUrl) {
        setCurrentImageUrl(result.imageUrl);
        setPaths([]);
        setNumberTemplate(null);
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
      const procedural = generateProceduralPaths(category);
      if (procedural && procedural.paths && procedural.paths.length > 0) {
        setPaths(procedural.paths);
        setNumberTemplate(null);
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
      tracker.trackMonetization('open_upgrade_modal');
      setShowUpgradeModal(true);
      return;
    }
    tracker.trackAI('instant_realistic', undefined, selectedCategory);
    const result = generateProceduralPaths(selectedCategory);
    setCurrentImageUrl(null);
    setPaths(result.paths);
    setNumberTemplate(null);
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

  // Category AI Artist button: no dialog, generate straight from the current category.
  const handleGenerateFromCategory = () => {
    handleGenerateAiImage(undefined, { category: selectedCategory });
  };

  // Numbers button: number the picture on the canvas, or switch back; from the library it opens Color by Number
  const handleToggleColorByNumber = async () => {
    // Auto-numbered picture -> back to normal coloring of the same picture
    if (numberTemplate?.id?.startsWith(AUTO_NUMBER_ID_PREFIX)) {
      tracker.event('color_by_number', 'auto_off', numberTemplate.name);
      setNumberTemplate(null);
      return;
    }
    const hasPicture = Boolean(currentImageUrl) || paths.length > 0;
    // Library open, a ready-made numbered picture, or nothing on the canvas -> numbered library
    if (showTemplates || numberTemplate || !hasPicture) {
      tracker.event('color_by_number', 'open_library', numberTemplate ? 'from_numbered' : 'from_canvas');
      setSelectedCategory('colorbynumber');
      setShowTemplates(true);
      return;
    }
    if (isGenerating) return;

    tracker.event('color_by_number', 'auto_on', currentTemplateName);
    setIsGenerating(true);
    try {
      const name = currentTemplateName.replace(/^AI Art:\s*/, '') || 'My Picture';
      const template = currentImageUrl
        ? await autoNumberFromImage(currentImageUrl, name)
        : autoNumberFromPaths(paths, viewBox, name);
      if (template) {
        setNumberTemplate(template);
        setResetTrigger((prev) => prev + 1);
      } else {
        alert("This picture is too detailed (or too plain) to number. Try a simpler picture, or open the Color by Number pictures!");
      }
    } catch (e) {
      console.warn('Auto numbering failed:', e);
      alert("Sorry, couldn't add numbers to this picture.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenMagicPrompt = () => {
    if (!isPro) {
      tracker.trackMonetization('open_upgrade_modal');
      setShowUpgradeModal(true);
      return;
    }
    tracker.trackModal('magic_prompt', 'open');
    setShowMagicPromptModal(true);
  };

  const handleSelectPhotoLineArt = (dataUrl: string) => {
    tracker.trackAI('photo_art');
    setCurrentImageUrl(dataUrl);
    setPaths([]);
    setNumberTemplate(null);
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
      tracker.trackMonetization('open_upgrade_modal');
      setShowUpgradeModal(true);
      return;
    }
    tracker.trackCanvas('download_image', { isPro });
    const paintCanvas = paintCanvasRef.current;
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!paintCanvas || !lineArtCanvas) return;

    // Silent background auto-publish on download
    if (fillCount >= 1) {
      autoPublishArtworkSilently({
        paintCanvas,
        lineArtCanvas,
        category: selectedCategory,
        templateName: currentTemplateName,
        isAi: isAiGeneratedRef.current,
        fillCount
      });
    }

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
          path: `coloro-${Date.now()}.png`,
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
        downloadLink.download = `coloro-${Date.now()}.png`;
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
        ctx.fillText("Created with Magic at Coloro - https://coloro.in", 335, 1066);
      } catch (e) {}
      finishExport();
    };

    logoImg.onerror = () => {
      ctx.fillStyle = "#2D3436";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "center";
      ctx.fillText("🎨 Created with Magic at Coloro - https://coloro.in", 500, 1065);
      finishExport();
    };

    logoImg.src = "/logo.svg";
  };

  const handlePrintSheet = () => {
    if (!isPro) {
      tracker.trackMonetization('open_upgrade_modal');
      setShowUpgradeModal(true);
      return;
    }
    tracker.trackCanvas('print_sheet', { isPro });
    if (numberTemplate && numberPrintRef.current) {
      numberPrintRef.current();
      return;
    }
    const lineArtCanvas = lineArtCanvasRef.current;
    if (!lineArtCanvas) return;
    printColoringSheet(lineArtCanvas, 'Coloring Masterpiece');
  };

  const clearCanvas = () => {
    tracker.trackCanvas('clear');
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

  if (legalTab) {
    return (
      <LegalPolicyPage
        initialTab={legalTab}
        onBack={() => {
          setLegalTab(null);
          if (window.location.hash) {
            try {
              history.pushState("", document.title, window.location.pathname + window.location.search);
            } catch (e) {}
          }
        }}
        onOpenPricing={() => {
          setLegalTab(null);
          setShowPricingPage(true);
        }}
      />
    );
  }

  if (showPricingPage) {
    return (
      <FreeVsPaidPage
        onBack={() => {
          setShowPricingPage(false);
          if (window.location.hash) {
            try {
              history.pushState("", document.title, window.location.pathname + window.location.search);
            } catch (e) {}
          }
        }}
        isPro={isPro}
        user={user}
        handleLogin={handleLogin}
        onOpenUpgradeModal={(plan = 'annual') => {
          setUpgradeModalPlan(plan);
          setShowPricingPage(false);
          setShowUpgradeModal(true);
        }}
        onOpenLegalPage={(tab) => setLegalTab(tab)}
      />
    );
  }

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-screen bg-[#FBF9F1] font-sans text-[#2D3436] overflow-hidden flex flex-col"> 
      <AppHeader
        onNavigateHome={onNavigateHome}
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
        onOpenFestivalPacks={() => {
          setSelectedCategory('festivals');
          setShowTemplates(true);
        }}
        isColorByNumber={isColorByNumber}
        onToggleColorByNumber={handleToggleColorByNumber}
        onOpenPricingPage={() => setShowPricingPage(true)}
        onOpenMagicAI={handleOpenMagicPrompt}
        isGenerating={isGenerating}
        onQuickNext={handleQuickNext}
        onOpenHelpFlow={() => setShowHelpFlow(true)}
        clearCanvas={clearCanvas}
        onPrintSheet={handlePrintSheet}
        onOpenChatBot={() => setShowChatBotModal(true)}
        onOpenArticles={() => setShowArticlesModal(true)}
        onOpenLegalPage={(tab) => setLegalTab(tab)}
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
            generateRandomImage={handleGenerateFromCategory}
            selectTemplate={selectTemplate}
            downloadImage={downloadImage}
            clearCanvas={clearCanvas}
            setShowUpgradeModal={setShowUpgradeModal}
            onPrintSheet={handlePrintSheet}
            onOpenPhotoArt={() => setShowPhotoModal(true)}
            selectedSticker={selectedSticker}
            onClearSticker={() => setSelectedSticker(null)}
            isColorByNumber={isColorByNumber}
            onToggleColorByNumber={handleToggleColorByNumber}
            onOpenStickers={() => setShowStickerModal(true)}
            onQuickNext={handleQuickNext}
            fillCount={fillCount}
            onIncrementFillCount={() => setFillCount((prev) => prev + 1)}
            resetTrigger={resetTrigger}
            numberTemplate={numberTemplate}
            numberPrintRef={numberPrintRef}
            onCreateNumberedAi={() => handleGenerateNumberedAi()}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* Bottom Palette Dock (Crayons & Tools) */}
        {!showTemplates && !numberTemplate && (
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
            />
          </div>
        )}
      </main>

      {/* Footer (Library only) */}
      {showTemplates && (
        <AppFooter 
          onOpenPricingPage={() => setShowPricingPage(true)} 
          onOpenArticles={() => setShowArticlesModal(true)}
          onOpenChatBot={() => setShowChatBotModal(true)}
          onOpenLegalPage={(tab) => setLegalTab(tab)}
          onOpenPinterestStudio={() => setShowPinterestStudio(true)}
        />
      )}

      <LoginModal
        isOpen={showLoginModal && !user}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={handleGoogleLogin}
      />

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
        defaultNumbered={selectedCategory === 'colorbynumber'}
        onGeneratePrompt={(prompt, options) => handleGenerateAiImage(prompt, options)}
        onGenerateCategory={(category) => handleGenerateAiImage(undefined, { category })}
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
        onOpenLegalPage={(tab) => setLegalTab(tab)}
        defaultPlan={upgradeModalPlan}
      />

      {/* Cashfree Payment Status Modal */}
      <PaymentStatusModal
        isOpen={paymentModalState.isOpen}
        status={paymentModalState.status}
        planName={paymentModalState.planName}
        orderId={paymentModalState.orderId}
        errorMessage={paymentModalState.errorMessage}
        onClose={() => {
          if (activePollCancelRef.current) {
            activePollCancelRef.current();
            activePollCancelRef.current = null;
          }
          setPaymentModalState(prev => ({ ...prev, isOpen: false, status: 'idle' }));
        }}
        onRetry={() => {
          if (activePollCancelRef.current) {
            activePollCancelRef.current();
            activePollCancelRef.current = null;
          }
          setPaymentModalState(prev => ({ ...prev, isOpen: false, status: 'idle' }));
          handleSubscribe(paymentModalState.planType || 'annual');
        }}
        onCheckStatus={async () => {
          if (paymentModalState.orderId) {
            try {
              await handleVerifyReturnedOrder(paymentModalState.orderId);
            } catch (err: any) {
              setPaymentModalState(prev => ({
                ...prev,
                status: 'failed',
                errorMessage: err.message || 'Status check failed. Please retry.',
              }));
            }
          }
        }}
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
        onToggleNumbers={handleToggleColorByNumber}
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

      {/* Coloro AI Buddy Chatbot Modal */}
      <ColoroChatBotModal
        isOpen={showChatBotModal}
        onClose={() => setShowChatBotModal(false)}
        onGenerateFromChat={(prompt) => {
          setShowTemplates(false);
          handleGenerateAiImage(prompt);
        }}
      />

      {/* Educational & Child Development Articles Modal */}
      <EducationalArticlesModal
        isOpen={showArticlesModal}
        onClose={() => setShowArticlesModal(false)}
        onOpenMagicAI={handleOpenMagicPrompt}
        onPrintSheet={handlePrintSheet}
      />

      {/* Live SQLite Telemetry & Feature Usage Modal */}
      <AnalyticsDashboardModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

      {/* Pinterest Batch Studio & Daily Graphics Exporter */}
      <PinterestStudioModal
        isOpen={showPinterestStudio}
        onClose={() => setShowPinterestStudio(false)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setShowTemplates(true);
        }}
      />
    </div>
  );
}
