/**
 * Cart Persistence Service
 *
 * Persists cart data locally via AsyncStorage and syncs to Supabase
 * for logged-in users. Handles cart merge on login.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const CART_STORAGE_KEY = '@gart_cart';

export interface PersistedCartItem {
  productId: string;
  numericId: number;
  quantity: number;
  unitPrice: number;
  name: string;
  unit: string;
}

export interface PersistedCart {
  items: PersistedCartItem[];
  deliveryType: 'pickup' | 'chronofresh';
  pickupLocationId?: string;
  deliveryAddress?: Record<string, unknown>;
  updatedAt: string;
}

const emptyCart: PersistedCart = {
  items: [],
  deliveryType: 'pickup',
  updatedAt: new Date().toISOString(),
};

export const cartPersistenceService = {
  /**
   * Save cart to AsyncStorage (always, for offline support)
   */
  async saveLocal(cart: PersistedCart): Promise<void> {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart locally:', error);
    }
  },

  /**
   * Load cart from AsyncStorage
   */
  async loadLocal(): Promise<PersistedCart> {
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
    }
    return emptyCart;
  },

  /**
   * Clear local cart
   */
  async clearLocal(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing local cart:', error);
    }
  },

  /**
   * Save cart to Supabase for logged-in users
   */
  async saveRemote(cart: PersistedCart): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('saved_carts')
        .upsert({
          user_id: user.id,
          items: cart.items,
          delivery_type: cart.deliveryType,
          pickup_location_id: cart.pickupLocationId || null,
          delivery_address: cart.deliveryAddress || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
    } catch (error) {
      console.error('Error saving cart to Supabase:', error);
    }
  },

  /**
   * Load cart from Supabase
   */
  async loadRemote(): Promise<PersistedCart | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('saved_carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        items: (data.items as PersistedCartItem[]) || [],
        deliveryType: data.delivery_type || 'pickup',
        pickupLocationId: data.pickup_location_id || undefined,
        deliveryAddress: data.delivery_address as Record<string, unknown> | undefined,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error loading remote cart:', error);
      return null;
    }
  },

  /**
   * Clear remote cart (after checkout or logout)
   */
  async clearRemote(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('saved_carts')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error clearing remote cart:', error);
    }
  },

  /**
   * Save cart to both local and remote
   */
  async save(cart: PersistedCart): Promise<void> {
    await this.saveLocal(cart);
    // Remote save runs in background, don't await to keep UI fast
    this.saveRemote(cart).catch(() => {});
  },

  /**
   * Load cart: prefer remote (newer) over local, merge if needed
   */
  async load(): Promise<PersistedCart> {
    const local = await this.loadLocal();
    const remote = await this.loadRemote();

    if (!remote) return local;
    if (local.items.length === 0) return remote;
    if (remote.items.length === 0) return local;

    // Both have items — use the most recently updated one
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();

    return remoteTime >= localTime ? remote : local;
  },

  /**
   * Clear all cart data
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearLocal(),
      this.clearRemote(),
    ]);
  },
};
