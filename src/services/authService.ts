/**
 * Auth Service
 *
 * Client for the PHP auth endpoints: email OTP login and the server-side
 * one-time free-trial claim.
 */
import type { User } from 'firebase/auth';
import { API_BASE } from './apiBase';

export interface ApiError extends Error {
  code?: string;
  retryAfter?: number;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON response (e.g. dev server without PHP)
  }
  if (!response.ok || data.error) {
    const err: ApiError = new Error(data.error || 'Something went wrong. Please try again.');
    err.code = data.code;
    err.retryAfter = data.retryAfter;
    throw err;
  }
  return data as T;
}

export const requestEmailOtp = (email: string) =>
  postJson<{ success: boolean; expiresIn: number; cooldown: number }>('otp-request.php', { email });

export const verifyEmailOtp = (email: string, code: string) =>
  postJson<{ success: boolean; token: string; isNewUser: boolean; trialEndDate: string }>(
    'otp-verify.php',
    { email, code }
  );

/**
 * Asks the server for this user's free trial. The server grants it at most once
 * per person and returns the authoritative end date (which may already be past).
 */
export const claimTrial = async (user: User): Promise<{ trialEndDate: Date; isNew: boolean }> => {
  const idToken = await user.getIdToken();
  const res = await postJson<{ trialEndDate: string; isNew: boolean }>('claim-trial.php', { idToken });
  return { trialEndDate: new Date(res.trialEndDate), isNew: res.isNew };
};
