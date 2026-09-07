import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export type PlanType = 'annual' | 'monthly';

export interface CashfreeOrderResponse {
  success: boolean;
  order_id: string;
  payment_session_id: string;
  order_status?: string;
  order_amount?: number;
  order_currency?: string;
  planType?: PlanType;
  environment?: 'sandbox' | 'production';
  error?: string;
}

export interface CashfreeVerifyResponse {
  success: boolean;
  isPending?: boolean;
  order_id: string;
  payment_id?: string;
  order_status?: string;
  payment_status?: string;
  amount?: number;
  currency?: string;
  planType?: PlanType;
  payment_method?: string;
  tags?: Record<string, any>;
  error?: string;
  message?: string;
  alreadyProcessed?: boolean;
}

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('storywalla.com')) {
      return '/api';
    }
  }
  // If running in development or capacitor, try local proxy first, with remote fallback
  return '/api';
};

/**
 * Dynamically loads the Cashfree Checkout JS SDK v3 if not already present.
 */
export const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.Cashfree === 'function') {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('cashfree-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'cashfree-checkout-script';
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Cashfree SDK v3');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

/**
 * Creates an order on the Cashfree payment gateway via our secure backend.
 */
export const createCashfreeOrder = async (params: {
  userId: string;
  planType: PlanType;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  amount?: number;
}): Promise<CashfreeOrderResponse> => {
  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/create-cashfree-order.php`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    // Check if the response was rewritten to HTML by hostinger or SPA fallback
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Try fallback to absolute domain if local proxy returned HTML
      if (!url.startsWith('https://kidcolor.storywalla.com')) {
        const fallbackRes = await fetch('https://kidcolor.storywalla.com/api/create-cashfree-order.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        const fallbackData = await fallbackRes.json();
        return fallbackData;
      }
      throw new Error('Server returned non-JSON response. Please ensure backend PHP is deployed.');
    }

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create Cashfree order.');
    }

    return data;
  } catch (error: any) {
    console.error('createCashfreeOrder error:', error);
    throw error;
  }
};

/**
 * Launches Cashfree In-App Modal Checkout.
 */
export const initiateCashfreeCheckout = async (
  paymentSessionId: string,
  environment?: 'sandbox' | 'production'
): Promise<{ success: boolean; paymentDetails?: any; error?: string }> => {
  const loaded = await loadCashfreeScript();
  if (!loaded || !window.Cashfree) {
    throw new Error('Cashfree SDK is not available.');
  }

  // Use environment passed from backend order creation, or Vite env variable, or default to sandbox
  const mode = environment || (import.meta.env.VITE_CASHFREE_MODE as 'sandbox' | 'production') || 'sandbox';
  const cashfree = window.Cashfree({ mode });

  return new Promise((resolve) => {
    cashfree
      .checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      })
      .then((result) => {
        if (result?.error) {
          console.warn('Cashfree checkout modal closed or error:', result.error);
          resolve({
            success: false,
            error: result.error.message || 'Payment cancelled or dismissed.',
          });
        } else if (result?.paymentDetails) {
          resolve({
            success: true,
            paymentDetails: result.paymentDetails,
          });
        } else {
          // Modal was dismissed or closed without payment completion
          resolve({
            success: false,
            error: 'Checkout was cancelled or dismissed without completing payment.',
          });
        }
      })
      .catch((err) => {
        console.error('Cashfree checkout exception:', err);
        resolve({
          success: false,
          error: err?.message || 'Payment gateway encountered an error.',
        });
      });
  });
};

/**
 * Verifies payment status against backend Cashfree verification endpoint.
 */
export const verifyCashfreePayment = async (
  orderId: string,
  userId?: string
): Promise<CashfreeVerifyResponse> => {
  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/verify-cashfree-payment.php`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: orderId, userId }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!url.startsWith('https://kidcolor.storywalla.com')) {
        const fallbackRes = await fetch('https://kidcolor.storywalla.com/api/verify-cashfree-payment.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId, userId }),
        });
        return await fallbackRes.json();
      }
      throw new Error('Verification endpoint returned non-JSON response.');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('verifyCashfreePayment error:', error);
    return {
      success: false,
      isPending: false,
      order_id: orderId,
      error: error.message || 'Payment verification request failed.',
    };
  }
};

/**
 * Automatically polls pending payments (e.g. UPI authorization) every 3s up to 15 times (45s).
 */
export const pollCashfreePayment = (
  orderId: string,
  userId: string,
  onUpdate: (res: CashfreeVerifyResponse) => void,
  maxAttempts: number = 15,
  intervalMs: number = 3000
): (() => void) => {
  let attempts = 0;
  let cancelled = false;

  const timer = setInterval(async () => {
    if (cancelled) return;
    attempts++;

    try {
      const res = await verifyCashfreePayment(orderId, userId);
      if (cancelled) return;

      onUpdate(res);

      // Stop if payment succeeded or definitely failed
      if (res.success || (!res.isPending && res.error)) {
        clearInterval(timer);
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
        onUpdate({
          success: false,
          isPending: false,
          order_id: orderId,
          error: 'Payment verification timed out. If money was deducted, your VIP access will activate shortly.',
        });
      }
    } catch (e: any) {
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        onUpdate({
          success: false,
          isPending: false,
          order_id: orderId,
          error: e.message || 'Verification polling failed.',
        });
      }
    }
  }, intervalMs);

  return () => {
    cancelled = true;
    clearInterval(timer);
  };
};

/**
 * Idempotently records order in Firestore strictly keyed on `order_id` (orders/{order_id})
 * to eliminate duplicate entries, and updates the user's subscription profile.
 */
export const recordOrderSuccessInFirestore = async (
  orderId: string,
  userId: string,
  plan: PlanType,
  paymentDetails?: any
): Promise<{ alreadyProcessed: boolean; subscriptionEndDate: Date; planType: PlanType }> => {
  if (!orderId || !userId) {
    throw new Error('orderId and userId are required to record order.');
  }

  // Determine effective plan strictly from backend verification tags/details if present
  const effectivePlan: PlanType = (paymentDetails?.planType as PlanType) || plan;
  const effectiveAmount = effectivePlan === 'annual' ? 499.00 : 99.00;

  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  // Calculate subscription duration
  const now = new Date();
  const durationMs = effectivePlan === 'annual' 
    ? 365 * 24 * 60 * 60 * 1000 
    : 30 * 24 * 60 * 60 * 1000;
  const endDate = new Date(now.getTime() + durationMs);

  // 1. Idempotency Check: if this orderId is already processed, do NOT duplicate
  if (orderSnap.exists() && orderSnap.data()?.status === 'paid') {
    const existingData = orderSnap.data();
    const existingEndDate = existingData.subscriptionEndDate?.toDate() || endDate;
    return {
      alreadyProcessed: true,
      subscriptionEndDate: existingEndDate,
      planType: existingData.planType || effectivePlan,
    };
  }

  // 2. Atomically write order document keyed strictly on order_id
  await setDoc(
    orderRef,
    {
      orderId,
      userId,
      gateway: 'cashfree',
      planType: effectivePlan,
      amount: effectiveAmount,
      currency: 'INR',
      status: 'paid',
      paymentId: paymentDetails?.payment_id || `${orderId}_cf`,
      paymentMethod: (typeof paymentDetails?.payment_method === 'string' ? paymentDetails.payment_method : 'cashfree'),
      subscriptionStartDate: serverTimestamp(),
      subscriptionEndDate: Timestamp.fromDate(endDate),
      createdAt: serverTimestamp(),
      processedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 3. Update User Profile with VIP Subscription
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      isSubscribed: true,
      planType: effectivePlan,
      subscriptionStartDate: serverTimestamp(),
      subscriptionEndDate: Timestamp.fromDate(endDate),
      lastOrderId: orderId,
      gateway: 'cashfree',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    alreadyProcessed: false,
    subscriptionEndDate: endDate,
    planType: effectivePlan,
  };
};
