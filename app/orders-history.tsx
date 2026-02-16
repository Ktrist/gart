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
  RefreshControl,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Package,
  Lock,
  Clock,
  CheckCircle,
  Check,
  X,
  ChevronLeft,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  FileText,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useShopStore } from '../store/shopStore';
import { supabase } from '../services/supabase';
import { LoadingScreen, EmptyState } from '../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { haptics } from '../utils/haptics';
import { invoiceService, InvoiceOrder } from '../services/invoiceService';

// Aerial field image for hero
const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

const ICON_SIZE = 20;
const STROKE_WIDTH = 1.5;

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  product_unit: string;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  pickup_location?: {
    name: string;
  };
  order_items: OrderItem[];
}

export default function OrdersHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, addToCart, fetchProducts } = useShopStore();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = height * 0.18;
  const contentWidth = width * 0.9;
  // Minimum 20px padding below safe area for premium spacing
  const heroTopPadding = insets.top + 20;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [reorderResult, setReorderResult] = useState<{
    orderId: string;
    added: number;
    unavailable: string[];
  } | null>(null);

  useEffect(() => {
    loadOrders();
    // Load products for reorder functionality
    if (products.length === 0) {
      fetchProducts();
    }
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
            product_id,
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
   * Re-commander les produits d'une commande précédente
   */
  const handleReorder = async (order: Order) => {
    haptics.medium();
    setReorderingId(order.id);
    setReorderResult(null);

    let addedCount = 0;
    const unavailableItems: string[] = [];

    for (const item of order.order_items) {
      // Find the product in the current product list
      const product = products.find(
        (p) => p.uuid === item.product_id || p.id.toString() === item.product_id || p.name === item.product_name
      );

      if (!product) {
        unavailableItems.push(item.product_name);
        continue;
      }

      if (!product.available || product.stock === 0) {
        unavailableItems.push(`${item.product_name} (rupture)`);
        continue;
      }

      // Determine quantity to add (limited by available stock)
      const quantityToAdd = Math.min(item.quantity, product.stock);

      if (quantityToAdd < item.quantity) {
        unavailableItems.push(`${item.product_name} (stock limité: ${product.stock})`);
      }

      if (quantityToAdd > 0) {
        const success = addToCart(product, quantityToAdd);
        if (success) {
          addedCount++;
        }
      }
    }

    setReorderResult({
      orderId: order.id,
      added: addedCount,
      unavailable: unavailableItems,
    });

    setReorderingId(null);

    // Navigate to cart if items were added
    if (addedCount > 0) {
      haptics.success();
      setTimeout(() => {
        router.push('/(tabs)/cart');
      }, 1500);
    } else if (unavailableItems.length > 0) {
      haptics.warning();
    }
  };

  /**
   * Télécharger la facture PDF
   */
  const handleDownloadInvoice = async (order: Order) => {
    haptics.light();
    const invoiceOrder: InvoiceOrder = {
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      total: order.total,
      status: order.status,
      pickupLocationName: order.pickup_location?.name,
      items: order.order_items.map((item) => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.unit_price * item.quantity,
        productUnit: item.product_unit,
      })),
      userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
      userEmail: user?.email,
    };
    await invoiceService.generateAndShare(invoiceOrder);
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
    const getStatusConfig = (s: string) => {
      switch (s) {
        case 'pending':
          return {
            label: 'En attente',
            color: COLORS.warning,
            Icon: Clock,
          };
        case 'confirmed':
          return {
            label: 'Confirmée',
            color: COLORS.leaf,
            Icon: CheckCircle,
          };
        case 'ready':
          return {
            label: 'Prête',
            color: COLORS.leaf,
            Icon: Package,
          };
        case 'completed':
          return {
            label: 'Récupérée',
            color: COLORS.sage,
            Icon: Check,
          };
        case 'cancelled':
          return {
            label: 'Annulée',
            color: COLORS.error,
            Icon: X,
          };
        default:
          return {
            label: s,
            color: COLORS.sage,
            Icon: Clock,
          };
      }
    };

    const config = getStatusConfig(status);
    const { Icon } = config;

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Icon
          size={14}
          strokeWidth={2}
          color={config.color}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
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
      <View style={[styles.container, { paddingTop: heroTopPadding }]}>
        <EmptyState
          icon={Lock}
          title="Connexion requise"
          description="Connectez-vous pour accéder à votre historique de commandes"
          actionLabel="Se connecter"
          onAction={() => router.push('/auth')}
          secondaryActionLabel="Retour"
          onSecondaryAction={() => router.back()}
        />
      </View>
    );
  }

  // Chargement
  if (loading) {
    return <LoadingScreen message="Chargement des commandes..." />;
  }

  // Aucune commande
  if (orders.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: heroTopPadding }]}>
        <EmptyState
          icon={Package}
          title="Aucune commande"
          description="Vous n'avez pas encore passé de commande. Découvrez nos produits locaux et bio !"
          actionLabel="Voir la boutique"
          onAction={() => router.replace('/(tabs)')}
          secondaryActionLabel="Retour"
          onSecondaryAction={() => router.back()}
        />
      </View>
    );
  }

  // Liste des commandes
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Header */}
        <ImageBackground
          source={AERIAL_FIELD_IMAGE}
          style={[styles.heroContainer, { height: heroHeight }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(20, 50, 33, 0.3)',
              'rgba(45, 90, 60, 0.9)',
            ]}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingTop: heroTopPadding }]}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.heroBackButton}
                onPress={() => router.back()}
              >
                <ChevronLeft
                  size={24}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.offWhite}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </TouchableOpacity>

              {/* Title */}
              <View style={styles.heroTitleContainer}>
                <Package
                  size={24}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.offWhite}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <Text style={styles.heroTitle}>Mes commandes</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                {orders.length} commande{orders.length > 1 ? 's' : ''}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Content */}
        <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
          {/* Orders List */}
          {orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/order-detail', params: { orderId: order.id } })}
          >
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

              {/* Reorder Result Message */}
              {reorderResult?.orderId === order.id && (
                <View style={[
                  styles.reorderResult,
                  reorderResult.unavailable.length > 0 && styles.reorderResultWarning,
                ]}>
                  {reorderResult.added > 0 ? (
                    <View style={styles.reorderResultRow}>
                      <ShoppingBag
                        size={16}
                        strokeWidth={STROKE_WIDTH}
                        color={reorderResult.unavailable.length > 0 ? COLORS.warning : COLORS.leaf}
                      />
                      <Text style={[
                        styles.reorderResultText,
                        { color: reorderResult.unavailable.length > 0 ? COLORS.warning : COLORS.leaf },
                      ]}>
                        {reorderResult.added} produit{reorderResult.added > 1 ? 's' : ''} ajouté{reorderResult.added > 1 ? 's' : ''} au panier
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.reorderResultRow}>
                      <AlertCircle
                        size={16}
                        strokeWidth={STROKE_WIDTH}
                        color={COLORS.error}
                      />
                      <Text style={[styles.reorderResultText, { color: COLORS.error }]}>
                        Aucun produit disponible
                      </Text>
                    </View>
                  )}
                  {reorderResult.unavailable.length > 0 && (
                    <Text style={styles.reorderUnavailableText}>
                      Non disponible: {reorderResult.unavailable.join(', ')}
                    </Text>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {/* Invoice Button */}
                <TouchableOpacity
                  style={styles.invoiceButton}
                  onPress={() => handleDownloadInvoice(order)}
                  activeOpacity={0.8}
                >
                  <FileText
                    size={16}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.darkGreen}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <Text style={styles.invoiceButtonText}>Facture</Text>
                </TouchableOpacity>

                {/* Reorder Button */}
                <TouchableOpacity
                  style={[
                    styles.reorderButton,
                    reorderingId === order.id && styles.reorderButtonLoading,
                  ]}
                  onPress={() => handleReorder(order)}
                  disabled={reorderingId !== null}
                  activeOpacity={0.8}
                >
                  <RefreshCw
                    size={16}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.offWhite}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <Text style={styles.reorderButtonText}>
                    {reorderingId === order.id ? 'Ajout en cours...' : 'Re-commander'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  // Hero Section
  heroContainer: {
    width: '100%',
  },
  heroGradient: {
    flex: 1,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.offWhite,
    opacity: 0.9,
  },
  // Content
  content: {
    marginTop: -SPACING.md,
    paddingTop: SPACING.lg,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderCream,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: 13,
    color: COLORS.sage,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orderItems: {
    marginBottom: SPACING.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.leaf,
  },
  orderFooter: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
  },
  orderInfo: {
    marginBottom: SPACING.md,
  },
  orderInfoLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.sage,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  orderInfoValue: {
    fontSize: 14,
    color: COLORS.darkGreen,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  orderTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.offWhite,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  invoiceButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  // Reorder Button
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  reorderButtonLoading: {
    backgroundColor: COLORS.sage,
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.offWhite,
    letterSpacing: 0.5,
  },
  // Reorder Result
  reorderResult: {
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.leaf,
  },
  reorderResultWarning: {
    borderColor: COLORS.warning,
  },
  reorderResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  reorderResultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reorderUnavailableText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
