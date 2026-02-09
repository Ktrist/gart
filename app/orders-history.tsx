/**
 * Orders History Screen
 *
 * Affiche l'historique des commandes de l'utilisateur
 * US-5.7: Historique des commandes
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const COLORS = {
  primary: '#2E7D32',
  beige: '#F5F5DC',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#DC2626',
};

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  pickup_location?: {
    name: string;
  };
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    product_unit: string;
  }>;
}

export default function OrdersHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Charger les commandes de l'utilisateur
   */
  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total,
          status,
          created_at,
          pickup_locations (name),
          order_items (
            product_name,
            quantity,
            unit_price,
            product_unit
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data as any[] || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Rafraîchir la liste
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  /**
   * Obtenir le badge de statut
   */
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: '⏳ En attente', color: COLORS.orange },
      confirmed: { label: '✅ Confirmée', color: COLORS.green },
      ready: { label: '📦 Prête', color: COLORS.green },
      completed: { label: '✓ Récupérée', color: COLORS.gray },
      cancelled: { label: '✕ Annulée', color: COLORS.red },
    };

    const badge = badges[status] || { label: status, color: COLORS.gray };

    return (
      <View style={[styles.statusBadge, { backgroundColor: badge.color + '20' }]}>
        <Text style={[styles.statusText, { color: badge.color }]}>
          {badge.label}
        </Text>
      </View>
    );
  };

  /**
   * Formater la date
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Si pas connecté
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Connexion requise</Text>
          <Text style={styles.emptyText}>
            Connectez-vous pour accéder à votre historique de commandes
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.actionButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  // Aucune commande
  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Aucune commande</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore passé de commande.{'\n'}
            Découvrez nos produits locaux et bio !
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.actionButtonText}>Voir la boutique</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Liste des commandes
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📦 Mes commandes</Text>
          <Text style={styles.subtitle}>
            {orders.length} commande{orders.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Orders List */}
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>{order.order_number}</Text>
                <Text style={styles.orderDate}>
                  {formatDate(order.created_at)}
                </Text>
              </View>
              {getStatusBadge(order.status)}
            </View>

            {/* Order Items */}
            <View style={styles.orderItems}>
              {order.order_items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.itemName}>
                    {item.product_name} × {item.quantity} {item.product_unit}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {(item.unit_price * item.quantity).toFixed(2)} €
                  </Text>
                </View>
              ))}
            </View>

            {/* Order Footer */}
            <View style={styles.orderFooter}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderInfoLabel}>Point de retrait</Text>
                <Text style={styles.orderInfoValue}>
                  {order.pickup_location?.name || 'Non défini'}
                </Text>
              </View>
              <View style={styles.orderTotal}>
                <Text style={styles.orderTotalLabel}>Total</Text>
                <Text style={styles.orderTotalValue}>{order.total.toFixed(2)} €</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  orderFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderInfoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#374151',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
