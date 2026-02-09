/**
 * Stripe wrapper - version native (iOS/Android)
 * Exporte les composants et hooks Stripe réels
 *
 * Note: Dans Expo Go, Stripe React Native ne fonctionne pas car il nécessite
 * des modules natifs. On utilise un mock pour permettre le développement.
 * Pour tester les paiements réels, utilisez un development build (EAS Build).
 */

import Constants from 'expo-constants';
import React from 'react';

// Détecte si on est dans Expo Go (pas de support des modules natifs)
const isExpoGo = Constants.appOwnership === 'expo';

// Mock pour Expo Go
const MockStripeProvider = ({ children }: { children: React.ReactNode; publishableKey?: string }) => {
  return children;
};

const mockUseStripe = () => ({
  initPaymentSheet: async (_options: any) => ({ error: null }),
  presentPaymentSheet: async () => ({
    error: {
      code: 'ExpoGo',
      message: 'Stripe n\'est pas disponible dans Expo Go. Utilisez un development build pour tester les paiements.',
    },
  }),
});

// Export conditionnel selon l'environnement
let StripeProvider: any;
let useStripe: any;

if (isExpoGo) {
  // Expo Go: utiliser les mocks
  StripeProvider = MockStripeProvider;
  useStripe = mockUseStripe;
} else {
  // Development build: utiliser Stripe réel
  const stripe = require('@stripe/stripe-react-native');
  StripeProvider = stripe.StripeProvider;
  useStripe = stripe.useStripe;
}

export { StripeProvider, useStripe };
