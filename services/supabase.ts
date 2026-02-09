/**
 * Supabase Client Configuration
 *
 * Ce fichier configure le client Supabase pour l'application Gart.
 * Il utilise AsyncStorage pour persister les sessions d'authentification.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Récupérer les variables d'environnement
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required variables:\n' +
    '  - EXPO_PUBLIC_SUPABASE_URL\n' +
    '  - EXPO_PUBLIC_SUPABASE_ANON_KEY\n\n' +
    'Get these from: https://supabase.com/dashboard/project/_/settings/api'
  );
}

/**
 * Client Supabase configuré pour React Native
 *
 * Features:
 * - Auth avec persistance via AsyncStorage
 * - Auto-refresh des tokens
 * - Gestion des sessions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Types TypeScript pour les tables Supabase
 * Générer automatiquement avec: npx supabase gen types typescript --local
 */
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address?: string | null;
        };
      };
      sales_cycles: {
        Row: {
          id: string;
          name: string;
          opening_date: string;
          closing_date: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      pickup_locations: {
        Row: {
          id: string;
          name: string;
          type: 'farm' | 'depot';
          address: string;
          city: string;
          postal_code: string;
          latitude: number | null;
          longitude: number | null;
          opening_hours: Array<{ day: string; hours: string }>;
          description: string;
          icon: string;
          available_days: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          display_order: number;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          unit: string;
          image_url: string | null;
          stock: number;
          stock_unit: string | null;
          category_id: string | null;
          is_available: boolean;
          sales_cycle_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          total: number;
          status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          pickup_location_id: string;
          sales_cycle_id: string | null;
          stripe_payment_intent_id: string | null;
          pickup_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          product_name: string;
          product_unit: string;
          created_at: string;
        };
      };
    };
  };
};
