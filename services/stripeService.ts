/**
 * Stripe Service
 *
 * Gère la création des Payment Intents via la Supabase Edge Function
 */

import { supabase } from './supabase';

const STRIPE_FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL;

if (!STRIPE_FUNCTION_URL) {
  console.error('EXPO_PUBLIC_SUPABASE_FUNCTION_URL is not defined in .env');
}

export interface CreatePaymentIntentParams {
  amount: number; // Montant en euros (ex: 25.50)
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const stripeService = {
  /**
   * Crée un Payment Intent via la Supabase Edge Function
   */
  async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<PaymentIntentResponse> {
    if (!STRIPE_FUNCTION_URL) {
      throw new Error('Stripe function URL not configured');
    }

    try {
      // Récupérer le token de session Supabase pour l'authentification
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Get the anon key for authorization
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || anonKey}`,
      };

      // Appeler la Edge Function
      const response = await fetch(STRIPE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency || 'eur',
          description: params.description || 'Commande Gart',
          metadata: params.metadata || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Vérifie le statut d'un paiement via la Edge Function
   */
  async checkPaymentStatus(paymentIntentId: string): Promise<boolean> {
    if (!STRIPE_FUNCTION_URL) return true;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      // Derive the verify URL from the create-payment-intent URL
      const baseUrl = STRIPE_FUNCTION_URL.replace(/\/create-payment-intent\/?$/, '');
      const verifyUrl = `${baseUrl}/verify-payment`;

      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || anonKey}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.status === 'succeeded';
    } catch (error) {
      console.error('Error verifying payment:', error);
      // If verification fails, trust the Payment Sheet result as fallback
      return true;
    }
  },
};

export default stripeService;
