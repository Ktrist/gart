/**
 * Favorites Store
 *
 * Zustand store for managing user favorites state
 */

import { create } from 'zustand';
import { favoritesService, FavoriteWithProduct } from '../services/favoritesService';

interface FavoritesStore {
  // State
  favorites: FavoriteWithProduct[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  // Initial state
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  error: null,

  // Fetch all favorites from Supabase
  fetchFavorites: async () => {
    set({ isLoading: true, error: null });

    try {
      const favorites = await favoritesService.getFavorites();
      const favoriteIds = new Set(favorites.map((f) => f.product_id));

      set({
        favorites,
        favoriteIds,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      set({
        favorites: [],
        favoriteIds: new Set(),
        isLoading: false,
        error: 'Erreur lors du chargement des favoris',
      });
    }
  },

  // Toggle favorite status (optimistic update)
  toggleFavorite: async (productId: string) => {
    const { favoriteIds, favorites } = get();
    const isCurrentlyFavorite = favoriteIds.has(productId);

    // Optimistic update
    const newFavoriteIds = new Set(favoriteIds);
    if (isCurrentlyFavorite) {
      newFavoriteIds.delete(productId);
      set({
        favoriteIds: newFavoriteIds,
        favorites: favorites.filter((f) => f.product_id !== productId),
      });
    } else {
      newFavoriteIds.add(productId);
      set({ favoriteIds: newFavoriteIds });
    }

    // Perform actual API call
    const result = await favoritesService.toggleFavorite(productId);

    if (!result.success) {
      // Revert on failure
      set({ favoriteIds, favorites });
      return false;
    }

    // If we added a favorite, refetch to get full product data
    if (result.isFavorite) {
      // Fetch updated list to get full product details
      const updatedFavorites = await favoritesService.getFavorites();
      set({
        favorites: updatedFavorites,
        favoriteIds: new Set(updatedFavorites.map((f) => f.product_id)),
      });
    }

    return true;
  },

  // Check if a product is favorited (sync check from local state)
  isFavorite: (productId: string) => {
    return get().favoriteIds.has(productId);
  },

  // Clear favorites (on logout)
  clearFavorites: () => {
    set({
      favorites: [],
      favoriteIds: new Set(),
      isLoading: false,
      error: null,
    });
  },

  // Get favorites count
  getFavoritesCount: () => {
    return get().favoriteIds.size;
  },
}));
