import axios from 'axios';

const API_BASE_URL = 'https://coopcircuits.fr/api/v0';

export interface Product {
  id: number;
  uuid?: string; // UUID Supabase (pour les opérations backend)
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url?: string;
  available: boolean;
  category?: string;
  stock: number; // Stock disponible en unités
  stock_unit?: string; // Unité du stock (par défaut = unit)
  weight_grams?: number; // Poids en grammes pour calcul des frais de port
}

export interface ShopStatus {
  isOpen: boolean;
  message: string;
  openingDate?: string;
  closingDate?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async fetchProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(
        `${this.baseURL}/enterprises/gart-batilly-en-puisaye/products`,
        {
          timeout: 5000,
        }
      );

      // Transform API response to our Product interface
      return response.data.map((item: any) => ({
        id: item.id,
        name: item.name || 'Produit sans nom',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        unit: item.unit || 'kg',
        image_url: item.image_url,
        available: item.available !== false,
        category: item.category,
        stock: item.stock || 0,
        stock_unit: item.stock_unit || item.unit,
      }));
    } catch (error) {
      console.error('Error fetching products from API:', error);
      throw error;
    }
  }

  async fetchShopStatus(): Promise<ShopStatus> {
    try {
      const response = await axios.get(
        `${this.baseURL}/enterprises/gart-batilly-en-puisaye/status`,
        {
          timeout: 5000,
        }
      );

      return {
        isOpen: response.data.is_open || false,
        message: response.data.message || '',
        openingDate: response.data.opening_date,
        closingDate: response.data.closing_date,
      };
    } catch (error) {
      console.error('Error fetching shop status from API:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
