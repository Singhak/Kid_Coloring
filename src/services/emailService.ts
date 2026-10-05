/**
 * Email Service
 *
 * Handles client-triggered transactional emails (such as first-time login welcome email).
 */

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('coloro.in') || hostname.includes('storywalla.com')) {
      return '/api';
    }
  }
  return '/api';
};

export interface SendWelcomeEmailParams {
  userId: string;
  email: string;
  displayName?: string;
  trialEndDate?: Date | string;
}

export interface SendEmailResponse {
  success: boolean;
  alreadySent?: boolean;
  message?: string;
  error?: string;
}

/**
 * Dispatches a personalized welcome email on user's first-time login.
 */
export const sendWelcomeEmail = async (
  params: SendWelcomeEmailParams
): Promise<SendEmailResponse> => {
  if (!params.userId || !params.email) {
    return { success: false, error: 'userId and email are required' };
  }

  const apiBase = getApiBaseUrl();
  const url = `${apiBase}/send-welcome-email.php`;

  // Format date if Date object passed
  let trialDateStr = '';
  if (params.trialEndDate instanceof Date) {
    trialDateStr = params.trialEndDate.toISOString();
  } else if (typeof params.trialEndDate === 'string') {
    trialDateStr = params.trialEndDate;
  }

  const payload = {
    userId: params.userId,
    email: params.email,
    displayName: params.displayName || 'Little Artist',
    trialEndDate: trialDateStr,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // In development / local proxy fallback
      if (!url.startsWith('https://coloro.in') && !url.startsWith('https://kidcolor.storywalla.com')) {
        try {
          const fallbackRes = await fetch('https://coloro.in/api/send-welcome-email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          return await fallbackRes.json();
        } catch {
          // Ignore fallback network errors in offline/dev
        }
      }
      return { success: false, error: 'Non-JSON server response' };
    }

    const data: SendEmailResponse = await response.json();
    return data;
  } catch (err: any) {
    console.warn('Welcome email request error (non-fatal):', err?.message || err);
    return { success: false, error: err?.message || 'Network error' };
  }
};
