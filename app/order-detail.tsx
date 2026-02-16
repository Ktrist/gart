/**
 * Order Detail Screen
 *
 * Affiche les détails complets d'une commande
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Package,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  Check,
  X,
  FileText,
  RefreshCw,
  CreditCard,
  Calendar,
  User,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useShopStore } from '../store/shopStore';
import { supabase } from '../services/supabase';
import { LoadingScreen } from '../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { haptics } from '../utils/haptics';
import { invoiceService, InvoiceOrder } from '../services/invoiceService';

const ICON_SIZE = 20;
const STROKE_WIDTH = 1.5;

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_unit: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  delivery_type: string;
  shipping_cost: number | null;
  delivery_address: Record<string, string> | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  pickup_locations?: { name: string; address: string; city: string } | null;
  user_profiles?: { full_name: string; email: string; phone: string } | null;
  order_items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  pending: { label: 'En attente', color: COLORS.warning, Icon: Clock },
  paid: { label: 'Payée', color: COLORS.leaf, Icon: CreditCard },
  preparing: { label: 'En préparation', color: '#3b82f6', Icon: Package },
  ready: { label: 'Prête', color: COLORS.leaf, Icon: CheckCircle },
  completed: { label: 'Terminée', color: COLORS.sage, Icon: Check },
  cancelled: { label: 'Annulée', color: COLORS.error, Icon: X },
};

const STATUS_STEPS = ['pending', 'paid', 'preparing', 'ready', 'completed'];

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useAuth();
  const { products, addToCart, fetchProducts } = useShopStore();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const contentWidth = Math.min(width * 0.92, 500);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrder();
    if (products.length === 0) fetchProducts();
  }, [orderId]);

  const loadOrder = async () => {
    if (!user || !orderId) {
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
          updated_at,
          delivery_type,
          shipping_cost,
          delivery_address,
          notes,
          stripe_payment_intent_id,
          pickup_locations (name, address, city),
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price,
            product_unit
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOrder(data as any);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrder();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    haptics.light();
    const invoiceOrder: InvoiceOrder = {
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      total: order.total,
      status: order.status,
      pickupLocationName: order.pickup_locations?.name,
      items: order.order_items.map((item) => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        productUnit: item.product_unit,
      })),
      userName: user?.user_metadata?.full_name || user?.email?.split('@')[0],
      userEmail: user?.email,
    };
    await invoiceService.generateAndShare(invoiceOrder);
  };

  const handleReorder = async () => {
    if (!order) return;
    haptics.medium();
    let addedCount = 0;

    for (const item of order.order_items) {
      const product = products.find(
        (p) => p.uuid === item.product_id || p.id.toString() === item.product_id || p.name === item.product_name
      );
      if (!product || !product.available || product.stock === 0) continue;
      const qty = Math.min(item.quantity, product.stock);
      if (qty > 0 && addToCart(product, qty)) addedCount++;
    }

    if (addedCount > 0) {
      haptics.success();
      router.push('/(tabs)/cart');
    } else {
      haptics.warning();
    }
  };

  const getStatusStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  if (loading) {
    return <LoadingScreen message="Chargement de la commande..." />;
  }

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <ChevronLeft size={20} strokeWidth={STROKE_WIDTH} color={COLORS.leaf} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Commande introuvable</Text>
        </View>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.Icon;
  const currentStep = getStatusStepIndex(order.status);
  const subtotal = order.order_items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.content, { width: contentWidth, alignSelf: 'center', paddingTop: insets.top + 16 }]}>
          {/* Header */}
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <ChevronLeft size={20} strokeWidth={STROKE_WIDTH} color={COLORS.leaf} />
            <Text style={styles.backText}>Mes commandes</Text>
          </TouchableOpacity>

          {/* Order Number + Status */}
          <View style={styles.headerCard}>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <StatusIcon size={16} strokeWidth={2} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
            <View style={styles.dateRow}>
              <Calendar size={14} strokeWidth={STROKE_WIDTH} color={COLORS.sage} />
              <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
            </View>
          </View>

          {/* Progress Steps (if not cancelled) */}
          {order.status !== 'cancelled' && (
            <View style={styles.progressCard}>
              <Text style={styles.sectionLabel}>Suivi de commande</Text>
              <View style={styles.progressSteps}>
                {STATUS_STEPS.map((step, index) => {
                  const stepConfig = STATUS_CONFIG[step];
                  const StepIcon = stepConfig.Icon;
                  const isActive = index <= currentStep;
                  const isLast = index === STATUS_STEPS.length - 1;
                  return (
                    <View key={step} style={styles.stepContainer}>
                      <View style={styles.stepRow}>
                        <View style={[
                          styles.stepDot,
                          isActive && { backgroundColor: COLORS.leaf },
                        ]}>
                          <StepIcon
                            size={12}
                            strokeWidth={2}
                            color={isActive ? COLORS.white : COLORS.sage}
                          />
                        </View>
                        <Text style={[
                          styles.stepLabel,
                          isActive && styles.stepLabelActive,
                        ]}>
                          {stepConfig.label}
                        </Text>
                      </View>
                      {!isLast && (
                        <View style={[
                          styles.stepLine,
                          index < currentStep && { backgroundColor: COLORS.leaf },
                        ]} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Products */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Produits ({order.order_items.length})</Text>
            {order.order_items.map((item) => (
              <View key={item.id} style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.product_name}</Text>
                  <Text style={styles.productQty}>
                    {item.quantity} {item.product_unit} x {item.unit_price.toFixed(2)} \u20ac
                  </Text>
                </View>
                <Text style={styles.productTotal}>{item.total_price.toFixed(2)} \u20ac</Text>
              </View>
            ))}

            {/* Totals */}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total</Text>
                <Text style={styles.totalValue}>{subtotal.toFixed(2)} \u20ac</Text>
              </View>
              {order.delivery_type === 'chronofresh' && order.shipping_cost != null && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Livraison Chronofresh</Text>
                  <Text style={styles.totalValue}>{order.shipping_cost.toFixed(2)} \u20ac</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{order.total.toFixed(2)} \u20ac</Text>
              </View>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>
              {order.delivery_type === 'chronofresh' ? 'Livraison' : 'Retrait'}
            </Text>
            {order.delivery_type === 'pickup' && order.pickup_locations ? (
              <View style={styles.deliveryRow}>
                <MapPin size={18} strokeWidth={STROKE_WIDTH} color={COLORS.leaf} />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryName}>{order.pickup_locations.name}</Text>
                  <Text style={styles.deliveryAddress}>
                    {order.pickup_locations.address}, {order.pickup_locations.city}
                  </Text>
                </View>
              </View>
            ) : order.delivery_type === 'chronofresh' && order.delivery_address ? (
              <View style={styles.deliveryRow}>
                <Truck size={18} strokeWidth={STROKE_WIDTH} color={COLORS.leaf} />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryName}>Chronofresh</Text>
                  <Text style={styles.deliveryAddress}>
                    {order.delivery_address.address}
                    {order.delivery_address.city ? `, ${order.delivery_address.city}` : ''}
                    {order.delivery_address.postal_code ? ` ${order.delivery_address.postal_code}` : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.deliveryAddress}>Non renseign\u00e9</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.invoiceButton} onPress={handleDownloadInvoice}>
              <FileText size={16} strokeWidth={STROKE_WIDTH} color={COLORS.darkGreen} />
              <Text style={styles.invoiceButtonText}>Facture PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reorderButton} onPress={handleReorder}>
              <RefreshCw size={16} strokeWidth={STROKE_WIDTH} color={COLORS.offWhite} />
              <Text style={styles.reorderButtonText}>Re-commander</Text>
            </TouchableOpacity>
          </View>

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
  content: {
    paddingBottom: SPACING.xl,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  backText: {
    fontSize: 16,
    color: COLORS.leaf,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.sage,
  },
  // Header Card
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.leaf,
    ...SHADOWS.sm,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.sage,
  },
  // Progress
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  progressSteps: {
    paddingLeft: SPACING.xs,
  },
  stepContainer: {
    marginBottom: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.borderCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 14,
    color: COLORS.sage,
  },
  stepLabelActive: {
    color: COLORS.darkGreen,
    fontWeight: '600',
  },
  stepLine: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.borderCream,
    marginLeft: 13,
  },
  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  // Products
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderCream,
  },
  productInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
    marginBottom: 2,
  },
  productQty: {
    fontSize: 12,
    color: COLORS.sage,
  },
  productTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  // Totals
  totalsSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.sage,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  // Delivery
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGreen,
    marginBottom: 2,
  },
  deliveryAddress: {
    fontSize: 13,
    color: COLORS.sage,
    lineHeight: 20,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
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
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.offWhite,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
