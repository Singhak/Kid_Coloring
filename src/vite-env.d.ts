/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_CASHFREE_APP_ID?: string;
  readonly VITE_CASHFREE_MODE?: 'sandbox' | 'production';
  readonly VITE_DEFAULT_GATEWAY?: 'cashfree' | 'razorpay';
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) => void;
        prompt: () => void;
        cancel: () => void;
      };
    };
  };
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