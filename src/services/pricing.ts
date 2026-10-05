import { Capacitor } from '@capacitor/core';

export type PlanType = 'annual' | 'monthly';

/** The Android app sells through Google Play Billing; the website sells through Cashfree. */
export const IS_ANDROID_APP = Capacitor.getPlatform() === 'android';

/** INR prices. Android is higher to cover Google Play's service fee. */
const PRICES: Record<'web' | 'android', Record<PlanType, number>> = {
  web: { annual: 499, monthly: 99 },
  android: { annual: 699, monthly: 120 },
};

export const PLAN_PRICES = IS_ANDROID_APP ? PRICES.android : PRICES.web;

export const formatPrice = (plan: PlanType): string => `₹${PLAN_PRICES[plan]}`;

export const planTitle = (plan: PlanType): string =>
  plan === 'monthly'
    ? `VIP Monthly Pass (${formatPrice('monthly')})`
    : `VIP Annual Magic Pass (${formatPrice('annual')})`;

/** Annual discount versus paying monthly for 12 months. */
export const annualSavePercent = (): number =>
  IS_ANDROID_APP ? Math.round((1 - PLAN_PRICES.annual / (PLAN_PRICES.monthly * 12)) * 100) : 60;

export const annualPerMonth = (): number => Math.round(PLAN_PRICES.annual / 12);
