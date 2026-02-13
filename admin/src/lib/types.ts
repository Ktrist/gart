export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total: number;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  delivery_type: 'pickup' | 'chronofresh';
  shipping_cost: number | null;
  delivery_address: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  pickup_locations?: { name: string } | null;
  user_profiles?: { full_name: string; email: string; phone: string } | null;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_unit: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string | null;
  stock: number;
  is_available: boolean;
  weight_grams: number | null;
  categories?: { name: string } | null;
  created_at: string;
}

export interface SalesCycle {
  id: string;
  name: string;
  opening_date: string;
  closing_date: string;
  is_active: boolean;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  avgOrderValue: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}
