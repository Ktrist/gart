import { create } from 'zustand';
import { Product } from '../services/api';
import { supabaseApiService } from '../services/supabaseApi';
import { supabaseSalesCycleService, SalesCycleStatus } from '../services/supabaseSalesCycleService';
import { PickupLocation } from '../services/supabasePickupService';
import { DeliveryAddress, ShippingRate, calculateShippingRate } from '../services/deliveryService';

export type DeliveryType = 'pickup' | 'chronofresh';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopStore {
  // Products & Shop Status
  products: Product[];
  shopStatus: SalesCycleStatus | null;
  isLoading: boolean;
  error: string | null;

  // Cart
  cart: CartItem[];

  // Pickup Location - US-3.2
  selectedPickupLocation: PickupLocation | null;

  // Delivery - Chronofresh Integration
  deliveryType: DeliveryType;
  deliveryAddress: DeliveryAddress | null;
  shippingRate: ShippingRate | null;
  shippingLoading: boolean;
  shippingError: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchShopStatus: () => Promise<void>;
  addToCart: (product: Product, quantity: number) => boolean;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  // Pickup Location Actions
  setPickupLocation: (location: PickupLocation) => void;
  clearPickupLocation: () => void;

  // Delivery Actions
  setDeliveryType: (type: DeliveryType) => void;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
  calculateShipping: () => Promise<void>;
  clearShipping: () => void;

  // Computed
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getAvailableStock: (productId: number) => number;
  getCartWeight: () => number;
  getTotalWithShipping: () => number;

  // Validation
  canCheckout: () => { valid: boolean; errors: string[] };
}

export const useShopStore = create<ShopStore>((set, get) => ({
  // Initial state
  products: [],
  shopStatus: null,
  isLoading: false,
  error: null,
  cart: [],
  selectedPickupLocation: null,

  // Delivery state
  deliveryType: 'pickup',
  deliveryAddress: null,
  shippingRate: null,
  shippingLoading: false,
  shippingError: null,

  // Fetch products from Supabase
  fetchProducts: async () => {
    set({ isLoading: true, error: null });

    try {
      const products = await supabaseApiService.fetchProducts();
      set({ products, isLoading: false });
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
      set({
        products: [],
        isLoading: false,
        error: 'Erreur de chargement des produits'
      });
    }
  },

  // Fetch shop status from Supabase
  fetchShopStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const status = await supabaseSalesCycleService.getCurrentStatus();
      set({
        shopStatus: status,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching sales cycle status:', error);
      set({
        shopStatus: {
          isOpen: false,
          message: 'Erreur lors de la récupération du statut',
        },
        isLoading: false,
        error: 'Erreur de chargement'
      });
    }
  },

  // Cart actions
  addToCart: (product, quantity) => {
    const { cart } = get();
    const existingItem = cart.find((item) => item.product.id === product.id);

    // Vérifier le stock disponible
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantityInCart + quantity;

    if (newTotalQuantity > product.stock) {
      // Stock insuffisant
      console.warn(`Stock insuffisant pour ${product.name}. Stock: ${product.stock}, Demandé: ${newTotalQuantity}`);
      return false; // Retourner false pour indiquer l'échec
    }

    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { product, quantity }] });
    }

    return true; // Retourner true pour indiquer le succès
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({
      cart: [],
      selectedPickupLocation: null,
      deliveryType: 'pickup',
      deliveryAddress: null,
      shippingRate: null,
      shippingError: null,
    });
  },

  // Pickup Location Actions - US-3.2
  setPickupLocation: (location) => {
    set({ selectedPickupLocation: location });
  },

  clearPickupLocation: () => {
    set({ selectedPickupLocation: null });
  },

  // Delivery Actions - Chronofresh Integration
  setDeliveryType: (type) => {
    set({
      deliveryType: type,
      // Clear the other option when switching
      ...(type === 'pickup'
        ? { deliveryAddress: null, shippingRate: null, shippingError: null }
        : { selectedPickupLocation: null }),
    });
  },

  setDeliveryAddress: (address) => {
    set({
      deliveryAddress: address,
      // Clear shipping rate when address changes
      shippingRate: null,
      shippingError: null,
    });
  },

  calculateShipping: async () => {
    const { deliveryAddress, cart } = get();

    if (!deliveryAddress) {
      set({ shippingError: 'Adresse de livraison non définie' });
      return;
    }

    // Calculate total weight
    const totalWeight = cart.reduce((sum, item) => {
      const weight = item.product.weight_grams || 300; // Default 300g per item
      return sum + (weight * item.quantity);
    }, 0);

    set({ shippingLoading: true, shippingError: null });

    try {
      const result = await calculateShippingRate(deliveryAddress.postalCode, totalWeight);

      if (result.success && result.rate) {
        set({
          shippingRate: result.rate,
          shippingLoading: false,
          shippingError: null,
        });
      } else {
        set({
          shippingRate: null,
          shippingLoading: false,
          shippingError: result.error || 'Erreur de calcul',
        });
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      set({
        shippingRate: null,
        shippingLoading: false,
        shippingError: 'Erreur lors du calcul des frais de port',
      });
    }
  },

  clearShipping: () => {
    set({
      shippingRate: null,
      shippingError: null,
      shippingLoading: false,
    });
  },

  // Computed values
  getCartTotal: () => {
    return get().cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getCartItemCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  // Calcule le stock disponible pour un produit (stock total - quantité dans le panier)
  getAvailableStock: (productId) => {
    const { cart, products } = get();
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;

    const cartItem = cart.find((item) => item.product.id === productId);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    return Math.max(0, product.stock - quantityInCart);
  },

  // Calculate total cart weight in grams
  getCartWeight: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => {
      const weight = item.product.weight_grams || 300; // Default 300g per item
      return sum + (weight * item.quantity);
    }, 0);
  },

  // Get total including shipping cost
  getTotalWithShipping: () => {
    const { deliveryType, shippingRate } = get();
    const cartTotal = get().getCartTotal();

    if (deliveryType === 'chronofresh' && shippingRate) {
      return cartTotal + shippingRate.price;
    }

    return cartTotal;
  },

  // Validation avant checkout
  canCheckout: () => {
    const { cart, selectedPickupLocation, deliveryType, deliveryAddress, shippingRate } = get();
    const errors: string[] = [];

    if (cart.length === 0) {
      errors.push('Votre panier est vide');
    }

    if (deliveryType === 'pickup') {
      if (!selectedPickupLocation) {
        errors.push('Veuillez sélectionner un point de retrait');
      }
    } else if (deliveryType === 'chronofresh') {
      if (!deliveryAddress) {
        errors.push('Veuillez entrer une adresse de livraison');
      }
      if (!shippingRate) {
        errors.push('Les frais de port n\'ont pas pu être calculés');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
}));
