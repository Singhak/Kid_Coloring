import { useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import { API_BASE } from './apiBase';

export type PlanType = 'annual' | 'monthly';

/** The Android app sells through Google Play Billing; the website sells through Cashfree. */
export const IS_ANDROID_APP = Capacitor.getPlatform() === 'android';

/**
 * Website prices use purchasing-power-parity tiers decided on the server (public/api/pricing-helper.php):
 * India pays INR, other countries pay USD at a tier matching local purchasing power. The quote is fetched
 * from geo-pricing.php; until it arrives (or if it fails) INR is shown. The server
 * always recomputes the real amount when the order is created, so the client value is display only.
 * Android shows Google Play's localized price (set per country in Play Console); the INR values below
 * are only the fallback until Play reports it, and are higher to cover Google Play's service fee.
 */
const ANDROID_FALLBACK_PRICES: Record<PlanType, number> = { annual: 699, monthly: 120 };

interface WebQuote { currency: string; annual: number; monthly: number }
const INR_QUOTE: WebQuote = { currency: 'INR', annual: 499, monthly: 99 };

// INR until the server reports otherwise (it only returns USD tiers once international payments are enabled).
const defaultWebQuote = (): WebQuote => INR_QUOTE;

let webQuote: WebQuote = defaultWebQuote();

export interface LocalizedPrice {
  text: string;      // formatted by Google Play, e.g. "$1.99" or "€1.99"
  micros: number;    // price * 1,000,000
  currency: string;  // ISO 4217
}

/** Called once the server reports the visitor's PPP price tier. */
const setWebQuote = (q: WebQuote): void => {
  webQuote = q;
  version++;
  listeners.forEach(l => l());
};

let playPrices: Partial<Record<PlanType, LocalizedPrice>> = {};
const listeners = new Set<() => void>();
let version = 0;

/** Called by the Google Play billing service once localized prices are known. */
export const setPlayPrices = (prices: Partial<Record<PlanType, LocalizedPrice>>): void => {
  playPrices = { ...playPrices, ...prices };
  version++;
  listeners.forEach(l => l());
};

/** Re-renders the calling component when localized prices arrive from Google Play. */
export const usePricing = (): number =>
  useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => version
  );

const formatMoney = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

/** Numeric price and ISO currency for a plan (used for analytics). */
export const planAmount = (plan: PlanType): { amount: number; currency: string } => {
  if (IS_ANDROID_APP) {
    const p = playPrices[plan];
    if (p) return { amount: p.micros / 1_000_000, currency: p.currency };
    return { amount: ANDROID_FALLBACK_PRICES[plan], currency: 'INR' };
  }
  return { amount: webQuote[plan], currency: webQuote.currency };
};

export const formatPrice = (plan: PlanType): string => {
  if (IS_ANDROID_APP && playPrices[plan]) return playPrices[plan]!.text;
  const { amount, currency } = planAmount(plan);
  return formatMoney(amount, currency);
};

export const planTitle = (plan: PlanType): string =>
  plan === 'monthly'
    ? `VIP Monthly Pass (${formatPrice('monthly')})`
    : `VIP Annual Magic Pass (${formatPrice('annual')})`;

/** Annual discount versus paying monthly for 12 months. */
export const annualSavePercent = (): number => {
  const annual = planAmount('annual').amount;
  const monthly = planAmount('monthly').amount;
  return Math.round((1 - annual / (monthly * 12)) * 100);
};

/** Formatted effective monthly cost of the annual plan, e.g. "₹42" or "$0.50". */
export const annualPerMonth = (): string => {
  const { amount, currency } = planAmount('annual');
  const perMonth = amount / 12;
  return formatMoney(currency === 'INR' ? Math.round(perMonth) : Math.round(perMonth * 100) / 100, currency);
};

if (!IS_ANDROID_APP && typeof window !== 'undefined') {
  fetch(`${API_BASE}/geo-pricing.php`)
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then(q => {
      if (q && typeof q.annual === 'number' && typeof q.monthly === 'number' && typeof q.currency === 'string') {
        setWebQuote({ currency: q.currency, annual: q.annual, monthly: q.monthly });
      }
    })
    .catch(() => { /* keep the INR default */ });
}
