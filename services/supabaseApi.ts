/**
 * Supabase API Service
 *
 * Ce service remplace les données mock par des appels réels à Supabase.
 * Il gère les cycles de vente, produits, points de retrait, et commandes.
 */

import { supabase } from './supabase';
import { Product } from './api';
import { DeliveryAddress } from './deliveryService';

export type DeliveryType = 'pickup' | 'chronofresh';

export interface SupabaseProduct {
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
  categories?: {
    name: string;
    slug: string;
  };
}

export interface SalesCycle {
  id: string;
  name: string;
  opening_date: string;
  closing_date: string;
  description: string | null;
  is_active: boolean;
}

export interface PickupLocation {
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
}

/**
 * Service API Supabase
 */
export const supabaseApiService = {
  /**
   * Récupère tous les produits avec leurs catégories
   */
  async fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        unit,
        image_url,
        stock,
        stock_unit,
        is_available,
        weight_grams,
        categories (
          name,
          slug
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // Transformer les données Supabase en format Product
    return (data as any[]).map((product) => ({
      id: parseInt(product.id.split('-')[0], 16), // Convertir UUID en number pour compatibilité
      uuid: product.id, // Garder l'UUID original pour les opérations backend
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      image_url: product.image_url,
      stock: product.stock,
      stock_unit: product.stock_unit,
      available: product.is_available,
      category: product.categories?.name || undefined,
      weight_grams: product.weight_grams || 300, // Default 300g if not set
    }));
  },

  /**
   * Récupère tous les cycles de vente
   */
  async fetchSalesCycles(): Promise<SalesCycle[]> {
    const { data, error } = await supabase
      .from('sales_cycles')
      .select('*')
      .eq('is_active', true)
      .order('opening_date', { ascending: true });

    if (error) {
      console.error('Error fetching sales cycles:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Récupère le cycle de vente actuel ou le prochain
   */
  async getCurrentSalesCycle(): Promise<SalesCycle | null> {
    const now = new Date().toISOString();

    // Chercher un cycle actif (date actuelle entre opening et closing)
    const { data: currentCycle, error: currentError } = await supabase
      .from('sales_cycles')
      .select('*')
      .eq('is_active', true)
      .lte('opening_date', now)
      .gte('closing_date', now)
      .limit(1)
      .single();

    if (!currentError && currentCycle) {
      return currentCycle;
    }

    // Si pas de cycle actif, chercher le prochain
    const { data: nextCycle, error: nextError } = await supabase
      .from('sales_cycles')
      .select('*')
      .eq('is_active', true)
      .gt('opening_date', now)
      .order('opening_date', { ascending: true })
      .limit(1)
      .single();

    if (!nextError && nextCycle) {
      return nextCycle;
    }

    return null;
  },

  /**
   * Récupère tous les points de retrait actifs
   */
  async fetchPickupLocations(): Promise<PickupLocation[]> {
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('is_active', true)
      .order('type', { ascending: true });

    if (error) {
      console.error('Error fetching pickup locations:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Récupère un point de retrait par ID
   */
  async fetchPickupLocationById(id: string): Promise<PickupLocation | null> {
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching pickup location:', error);
      return null;
    }

    return data;
  },

  /**
   * Met à jour le stock d'un produit (après ajout au panier)
   * Note: En production, cela devrait être géré par le backend lors du paiement
   */
  async updateProductStock(productId: string, newStock: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      console.error('Error updating product stock:', error);
      return false;
    }

    return true;
  },

  /**
   * Vérifie le stock disponible pour les produits du panier avant paiement
   * US-4.2: Pre-flight stock verification
   */
  async verifyStock(items: { productId: string; quantity: number }[]): Promise<{
    valid: boolean;
    unavailableItems: { productId: string; productName: string; requested: number; available: number }[];
  }> {
    const unavailableItems: { productId: string; productName: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, stock')
        .eq('id', item.productId)
        .single();

      if (error) {
        console.error('Error checking stock for product:', item.productId, error);
        // Consider product unavailable if we can't verify
        unavailableItems.push({
          productId: item.productId,
          productName: 'Produit inconnu',
          requested: item.quantity,
          available: 0,
        });
        continue;
      }

      if (product.stock < item.quantity) {
        unavailableItems.push({
          productId: item.productId,
          productName: product.name,
          requested: item.quantity,
          available: product.stock,
        });
      }
    }

    return {
      valid: unavailableItems.length === 0,
      unavailableItems,
    };
  },

  /**
   * Crée une nouvelle commande
   * Supports both pickup and Chronofresh delivery orders
   */
  async createOrder(orderData: {
    userId: string;
    total: number;
    pickupLocationId?: string | null;
    salesCycleId: string | null;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      productName: string;
      productUnit: string;
    }>;
    // Delivery fields for Chronofresh
    deliveryType?: DeliveryType;
    deliveryAddress?: DeliveryAddress | null;
    shippingCost?: number;
    totalWeightGrams?: number;
  }): Promise<{ orderId: string; orderNumber: string } | null> {
    // Générer le numéro de commande
    const orderNumber = `GART-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Determine delivery type
    const deliveryType = orderData.deliveryType || 'pickup';

    // Prepare order data
    const orderInsert: Record<string, unknown> = {
      user_id: orderData.userId,
      order_number: orderNumber,
      total: orderData.total,
      status: 'pending',
      sales_cycle_id: orderData.salesCycleId,
      delivery_type: deliveryType,
    };

    // Add pickup location for pickup orders
    if (deliveryType === 'pickup' && orderData.pickupLocationId) {
      orderInsert.pickup_location_id = orderData.pickupLocationId;
    }

    // Add delivery fields for Chronofresh orders
    if (deliveryType === 'chronofresh') {
      if (orderData.deliveryAddress) {
        orderInsert.delivery_address = orderData.deliveryAddress;
      }
      if (orderData.shippingCost !== undefined) {
        orderInsert.shipping_cost = orderData.shippingCost;
      }
      if (orderData.totalWeightGrams !== undefined) {
        orderInsert.total_weight_grams = orderData.totalWeightGrams;
      }
    }

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return null;
    }

    // Créer les items de la commande
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice,
      product_name: item.productName,
      product_unit: item.productUnit,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // TODO: Rollback la commande si échec
      return null;
    }

    return {
      orderId: order.id,
      orderNumber: order.order_number,
    };
  },
};
