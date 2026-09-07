/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_CASHFREE_APP_ID?: string;
  readonly VITE_CASHFREE_MODE?: 'sandbox' | 'production';
  readonly VITE_DEFAULT_GATEWAY?: 'cashfree' | 'razorpay';
}

interface Window {
  Cashfree?: (config: { mode: 'sandbox' | 'production' }) => {
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget?: '_modal' | '_self' | '_top';
    }) => Promise<{
      error?: { message?: string; code?: string };
      paymentDetails?: any;
    }>;
  };
  Razorpay?: any;
}