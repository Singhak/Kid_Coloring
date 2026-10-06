import { auth } from '../firebase';
import { API_BASE } from './apiBase';
import { IS_ANDROID_APP, PlanType, setPlayPrices, LocalizedPrice } from './pricing';

/**
 * Google Play Billing for the Android app (cordova-plugin-purchase).
 *
 * Play Console must have two auto-renewing subscriptions, each with one base plan:
 *   coloro_vip_monthly  (INR 120 / month)
 *   coloro_vip_annual   (INR 699 / year)
 * Add every country you sell in under each base plan; the app shows Google Play's localized price.
 *
 * A purchase is only trusted after /api/verify-play-purchase.php has checked it
 * with the Google Play Developer API and updated the user's Firestore profile.
 */

export const PLAY_PRODUCT_IDS: Record<PlanType, string> = {
  monthly: 'coloro_vip_monthly',
  annual: 'coloro_vip_annual',
};

export interface PlayVerifyResult {
  success: boolean;
  planType?: PlanType;
  subscriptionEndDate?: string;
  error?: string;
}

export type PlayPurchaseOutcome =
  | { status: 'success'; result: PlayVerifyResult }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

// The plugin is injected as a global by Cordova/Capacitor, so it is not imported (keeps it out of the web bundle).
const getCdv = (): any => (typeof window !== 'undefined' ? (window as any).CdvPurchase : undefined);

let initPromise: Promise<boolean> | null = null;
let initializedFor: string | null = null;
let pending: { productId: string; resolve: (o: PlayPurchaseOutcome) => void } | null = null;
let onEntitlementChanged: ((result: PlayVerifyResult) => void) | null = null;

const waitForPlugin = async (timeoutMs = 8000): Promise<any> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const cdv = getCdv();
    if (cdv?.store) return cdv;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
};

const tokenOf = (transaction: any): string | undefined => transaction?.nativePurchase?.purchaseToken;
const productOf = (transaction: any): string | undefined =>
  transaction?.nativePurchase?.productIds?.[0] ?? transaction?.products?.[0]?.id;

/** Reads Google Play's localized recurring price for each of our products and shares it with the UI. */
const publishLocalizedPrices = (cdv: any): void => {
  const found: Partial<Record<PlanType, LocalizedPrice>> = {};
  (Object.entries(PLAY_PRODUCT_IDS) as [PlanType, string][]).forEach(([plan, id]) => {
    const phases: any[] = cdv.store.get(id, cdv.Platform.GOOGLE_PLAY)?.getOffer?.()?.pricingPhases ?? [];
    // Last phase is the regular price (earlier phases may be a free trial / intro price)
    const phase = phases[phases.length - 1];
    if (phase?.price && phase.priceMicros > 0 && phase.currency) {
      found[plan] = { text: phase.price, micros: phase.priceMicros, currency: phase.currency };
    }
  });
  if (Object.keys(found).length) setPlayPrices(found);
};

const isOurProduct = (id?: string): boolean => !!id && Object.values(PLAY_PRODUCT_IDS).includes(id);

const verifyWithServer = async (purchaseToken: string, productId: string): Promise<PlayVerifyResult> => {
  const user = auth.currentUser;
  if (!user) return { success: false, error: 'Please sign in first.' };
  const idToken = await user.getIdToken();
  const res = await fetch(`${API_BASE}/verify-play-purchase.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, purchaseToken, productId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    return { success: false, error: data.error || 'Could not verify the purchase.' };
  }
  return data as PlayVerifyResult;
};

/** Handles a purchase (new or restored) reported by Google Play. */
const handleTransaction = async (transaction: any): Promise<void> => {
  const productId = productOf(transaction);
  const token = tokenOf(transaction);
  if (!isOurProduct(productId) || !token) return;

  let result: PlayVerifyResult;
  try {
    result = await verifyWithServer(token, productId!);
  } catch (e: any) {
    result = { success: false, error: e?.message || 'Network error while verifying the purchase.' };
  }

  if (result.success) {
    // Acknowledge only after the server has granted access (otherwise Google refunds after 3 days).
    try { await transaction.finish(); } catch { /* the server also acknowledges */ }
    onEntitlementChanged?.(result);
  }

  if (pending && pending.productId === productId) {
    const p = pending;
    pending = null;
    p.resolve(result.success ? { status: 'success', result } : { status: 'error', message: result.error || 'Verification failed.' });
  }
};

/**
 * Prepares Google Play Billing for the signed-in user. Safe to call repeatedly.
 * Also re-checks owned subscriptions with the server so renewals extend VIP.
 */
export const initPlayBilling = (
  uid: string,
  onEntitlement?: (result: PlayVerifyResult) => void
): Promise<boolean> => {
  if (!IS_ANDROID_APP) return Promise.resolve(false);
  onEntitlementChanged = onEntitlement ?? null;
  if (initPromise && initializedFor === uid) return initPromise;
  initializedFor = uid;

  initPromise = (async () => {
    const cdv = await waitForPlugin();
    if (!cdv) {
      console.warn('Google Play Billing plugin is not available.');
      return false;
    }
    const { store, Platform, ProductType } = cdv;

    store.obfuscator = 'disabled';
    store.applicationUsername = () => auth.currentUser?.uid;

    store.register(
      (Object.values(PLAY_PRODUCT_IDS) as string[]).map((id) => ({
        id,
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY,
      }))
    );

    store.when()
      .productUpdated(() => publishLocalizedPrices(cdv))
      .approved((transaction: any) => { void handleTransaction(transaction); })
      .receiptsReady(() => {
        // Owned (already acknowledged) subscriptions: refresh expiry on the server.
        for (const tx of store.localTransactions as any[]) {
          if (tx.state === cdv.TransactionState?.OWNED || tx.state === 'owned') void handleTransaction(tx);
        }
      });

    store.error((err: any) => console.warn('Play Billing error:', err?.code, err?.message));

    const errors = await store.initialize([Platform.GOOGLE_PLAY]);
    if (errors?.length) {
      console.warn('Play Billing initialisation errors:', errors);
      return false;
    }
    publishLocalizedPrices(cdv);
    return true;
  })();

  return initPromise;
};

/** Opens the Google Play purchase sheet. Resolves once the server has verified the purchase. */
export const purchasePlan = async (plan: PlanType): Promise<PlayPurchaseOutcome> => {
  const user = auth.currentUser;
  if (!user) return { status: 'error', message: 'Please sign in first.' };

  const ready = await initPlayBilling(user.uid, onEntitlementChanged ?? undefined);
  const cdv = getCdv();
  if (!ready || !cdv) return { status: 'error', message: 'Google Play Billing is not available on this device.' };

  const productId = PLAY_PRODUCT_IDS[plan];
  const product = cdv.store.get(productId, cdv.Platform.GOOGLE_PLAY);
  const offer = product?.getOffer?.();
  if (!offer) {
    return { status: 'error', message: 'This plan is not available on Google Play yet. Please try again later.' };
  }

  return new Promise<PlayPurchaseOutcome>(async (resolve) => {
    pending = { productId, resolve };
    const err = await cdv.store.order(offer);
    if (err) {
      pending = null;
      // ErrorCode.PAYMENT_CANCELLED
      if (err.code === cdv.ErrorCode?.PAYMENT_CANCELLED) resolve({ status: 'cancelled' });
      else resolve({ status: 'error', message: err.message || 'The purchase could not be completed.' });
    }
    // On success the 'approved' event fires and handleTransaction() resolves the promise.
  });
};

/** Opens the Play Store subscription settings so the user can cancel or change the plan. */
export const manageSubscription = async (): Promise<void> => {
  const cdv = getCdv();
  if (cdv?.store) await cdv.store.manageSubscriptions(cdv.Platform.GOOGLE_PLAY);
};
