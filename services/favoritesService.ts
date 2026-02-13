/**
 * Favorites Service
 *
 * Handles user favorites/wishlist functionality
 * Allows users to save and manage their favorite products
 */

import { supabase } from './supabase';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface FavoriteWithProduct extends Favorite {
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    image_url: string | null;
    stock: number;
    is_available: boolean;
    categories: {
      name: string;
    } | null;
  };
}

/**
 * Favorites Service
 */
export const favoritesService = {
  /**
   * Get all favorites for the current user
   */
  async getFavorites(): Promise<FavoriteWithProduct[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        user_id,
        product_id,
        created_at,
        products (
          id,
          name,
          description,
          price,
          unit,
          image_url,
          stock,
          is_available,
          categories (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }

    return (data as unknown as FavoriteWithProduct[]) || [];
  },

  /**
   * Get favorite product IDs for quick lookup
   */
  async getFavoriteProductIds(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('product_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favorite IDs:', error);
      return [];
    }

    return data?.map((f) => f.product_id) || [];
  },

  /**
   * Check if a product is favorited
   */
  async isFavorite(productId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (not an error for us)
      console.error('Error checking favorite:', error);
    }

    return !!data;
  },

  /**
   * Add a product to favorites
   */
  async addFavorite(productId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        product_id: productId,
      });

    if (error) {
      // Ignore duplicate key error (already favorited)
      if (error.code === '23505') {
        return true;
      }
      console.error('Error adding favorite:', error);
      return false;
    }

    return true;
  },

  /**
   * Remove a product from favorites
   */
  async removeFavorite(productId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }

    return true;
  },

  /**
   * Toggle favorite status for a product
   * Returns the new favorite status (true = favorited, false = not favorited)
   */
  async toggleFavorite(productId: string): Promise<{ success: boolean; isFavorite: boolean }> {
    const isFav = await this.isFavorite(productId);

    if (isFav) {
      const success = await this.removeFavorite(productId);
      return { success, isFavorite: !success };
    } else {
      const success = await this.addFavorite(productId);
      return { success, isFavorite: success };
    }
  },

  /**
   * Get the count of favorites for the current user
   */
  async getFavoritesCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error counting favorites:', error);
      return 0;
    }

    return count || 0;
  },
};

export default favoritesService;
