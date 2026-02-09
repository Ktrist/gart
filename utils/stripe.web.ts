/**
 * Mock Stripe pour le Web
 * Stripe React Native ne fonctionne pas sur le web
 */

import React from 'react';

// Mock StripeProvider pour le web
export const StripeProvider = ({ children }: { children: React.ReactNode; publishableKey?: string }) => {
  return children;
};

// Mock useStripe pour le web
export const useStripe = () => {
  return {
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: { code: 'NotSupported', message: 'Stripe is not supported on web' } }),
  };
};
