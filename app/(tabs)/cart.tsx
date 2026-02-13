import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShoppingBag,
  MapPin,
  Snowflake,
  Truck,
  MessageSquare,
  Trash2,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  X,
  Phone,
  Salad,
  AlertTriangle,
} from 'lucide-react-native';
import { useShopStore, DeliveryType } from '../../store/shopStore';
import { supabasePickupService, PickupLocation } from '../../services/supabasePickupService';
import { EmptyState } from '../../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { haptics } from '../../utils/haptics';

const ICON_SIZE_SM = 16;
const ICON_SIZE_MD = 20;
const ICON_SIZE_LG = 24;
const STROKE_WIDTH = 1.5;

// Pickup Location Selection Modal - US-3.2
function PickupLocationModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: PickupLocation) => void;
}) {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadLocations();
    }
  }, [visible]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await supabasePickupService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading pickup locations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choisissez votre point de retrait</Text>

          <ScrollView style={styles.locationList}>
            {loading ? (
              <Text style={styles.loadingText}>Chargement...</Text>
            ) : (
              locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.locationCard}
                onPress={() => {
                  onSelect(location);
                  onClose();
                }}
              >
                <View style={styles.locationHeader}>
                  <Text style={styles.locationIcon}>{location.icon}</Text>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationType}>
                      {location.type === 'farm' ? 'À la ferme' : 'Dépôt'}
                    </Text>
                  </View>
                </View>

                <View style={styles.locationAddressRow}>
                  <MapPin
                    size={ICON_SIZE_SM}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.darkGreen}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <Text style={styles.locationAddress}>
                    {location.address}
                  </Text>
                </View>
                <Text style={styles.locationAddress}>
                  {location.postalCode} {location.city}
                </Text>

                <Text style={styles.locationDescription}>
                  {location.description}
                </Text>

                <View style={styles.openingHoursContainer}>
                  <Text style={styles.openingHoursTitle}>Horaires:</Text>
                  {location.openingHours.map((schedule, idx) => (
                    <Text key={idx} style={styles.openingHoursText}>
                      • {schedule.day}: {schedule.hours}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CartItem({ item }: { item: any }) {
  const { updateCartQuantity, removeFromCart, getAvailableStock } = useShopStore();
  const availableStock = getAvailableStock(item.product.id);

  const handleQuantityChange = (newQuantity: number) => {
    haptics.selection();
    updateCartQuantity(item.product.id, newQuantity);
  };

  const handleRemove = () => {
    haptics.warning();
    Alert.alert(
      'Retirer du panier',
      `Voulez-vous retirer ${item.product.name} du panier ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            haptics.heavy();
            removeFromCart(item.product.id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.cartItem}>
      <View style={styles.cartItemHeader}>
        {/* Product Icon */}
        <View style={styles.cartItemIconContainer}>
          {item.product.image_url ? (
            <Text style={styles.cartItemIcon}>{item.product.image_url}</Text>
          ) : (
            <Salad
              size={28}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </View>

        {/* Product Details */}
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemName}>{item.product.name}</Text>
          <Text style={styles.cartItemPrice}>
            {item.product.price.toFixed(2)} € / {item.product.unit}
          </Text>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
        >
          <X
            size={16}
            strokeWidth={2}
            color={COLORS.offWhite}
          />
        </TouchableOpacity>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantityRow}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              item.quantity <= 1 && styles.quantityButtonDisabled,
            ]}
            onPress={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus
              size={16}
              strokeWidth={2}
              color={item.quantity <= 1 ? COLORS.sage : COLORS.offWhite}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>
            {item.quantity} {item.product.unit}
          </Text>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              item.quantity >= item.product.stock && styles.quantityButtonDisabled,
            ]}
            onPress={() => {
              if (item.quantity < item.product.stock) {
                handleQuantityChange(item.quantity + 1);
              } else {
                haptics.warning();
                Alert.alert(
                  'Stock maximum atteint',
                  `Stock disponible: ${item.product.stock} ${item.product.unit}`,
                  [{ text: 'OK' }]
                );
              }
            }}
            disabled={item.quantity >= item.product.stock}
          >
            <Plus
              size={16}
              strokeWidth={2}
              color={item.quantity >= item.product.stock ? COLORS.sage : COLORS.offWhite}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>
          {(item.product.price * item.quantity).toFixed(2)} €
        </Text>
      </View>

      {/* Stock Warning */}
      {availableStock <= 5 && availableStock > 0 && (
        <View style={styles.stockWarningRow}>
          <AlertTriangle
            size={ICON_SIZE_SM}
            strokeWidth={STROKE_WIDTH}
            color={COLORS.warning}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Text style={styles.stockWarning}>
            Plus que {availableStock} {item.product.unit} disponible(s)
          </Text>
        </View>
      )}
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cart,
    getCartTotal,
    clearCart,
    selectedPickupLocation,
    setPickupLocation,
    canCheckout,
    // Delivery state
    deliveryType,
    deliveryAddress,
    shippingRate,
    shippingLoading,
    shippingError,
    setDeliveryType,
    getTotalWithShipping,
    getCartWeight,
  } = useShopStore();
  const total = getCartTotal();
  const totalWithShipping = getTotalWithShipping();
  const cartWeight = getCartWeight();
  const [showPickupModal, setShowPickupModal] = useState(false);

  // Minimum 20px padding below safe area for premium spacing
  const topPadding = insets.top + 20;

  if (cart.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: topPadding }]}>
        <EmptyState
          icon={ShoppingBag}
          title="Votre panier est vide"
          description="Découvrez nos délicieux légumes frais et commencez vos achats !"
          actionLabel="Voir les produits"
          onAction={() => router.push('/shop')}
        />
      </View>
    );
  }

  // Handle checkout with validation
  const handleCheckout = () => {
    const validation = canCheckout();

    if (!validation.valid) {
      haptics.error();
      Alert.alert(
        'Commande incomplète',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    haptics.medium();
    router.push('/checkout');
  };

  const handleClearCart = () => {
    haptics.warning();
    Alert.alert(
      'Vider le panier',
      'Voulez-vous vraiment vider votre panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: () => {
            haptics.heavy();
            clearCart();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Pickup Location Modal */}
      <PickupLocationModal
        visible={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onSelect={setPickupLocation}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <ShoppingBag
            size={ICON_SIZE_LG}
            strokeWidth={STROKE_WIDTH}
            color={COLORS.darkGreen}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Text style={styles.title}>
            Mon panier ({cart.length} {cart.length > 1 ? 'articles' : 'article'})
          </Text>
        </View>

        {/* Cart Items - US-3.1 */}
        {cart.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}

        {/* Delivery Method Selection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <Truck
              size={ICON_SIZE_MD}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.sectionTitle}>MODE DE LIVRAISON</Text>
          </View>

          <View style={styles.deliveryToggle}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryType === 'pickup' && styles.deliveryOptionActive,
              ]}
              onPress={() => setDeliveryType('pickup')}
            >
              <View style={styles.deliveryOptionIconContainer}>
                <MapPin
                  size={ICON_SIZE_MD}
                  strokeWidth={STROKE_WIDTH}
                  color={deliveryType === 'pickup' ? COLORS.leaf : COLORS.sage}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.deliveryOptionInfo}>
                <Text
                  style={[
                    styles.deliveryOptionTitle,
                    deliveryType === 'pickup' && styles.deliveryOptionTitleActive,
                  ]}
                >
                  Retrait
                </Text>
                <Text style={styles.deliveryOptionSubtitle}>Gratuit</Text>
              </View>
              {deliveryType === 'pickup' && (
                <CheckCircle
                  size={ICON_SIZE_MD}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryType === 'chronofresh' && styles.deliveryOptionActive,
              ]}
              onPress={() => setDeliveryType('chronofresh')}
            >
              <View style={styles.deliveryOptionIconContainer}>
                <Snowflake
                  size={ICON_SIZE_MD}
                  strokeWidth={STROKE_WIDTH}
                  color={deliveryType === 'chronofresh' ? COLORS.leaf : COLORS.sage}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.deliveryOptionInfo}>
                <Text
                  style={[
                    styles.deliveryOptionTitle,
                    deliveryType === 'chronofresh' && styles.deliveryOptionTitleActive,
                  ]}
                >
                  Chronofresh
                </Text>
                <Text style={styles.deliveryOptionSubtitle}>
                  {shippingRate ? `${shippingRate.price.toFixed(2)} €` : 'À calculer'}
                </Text>
              </View>
              {deliveryType === 'chronofresh' && (
                <CheckCircle
                  size={ICON_SIZE_MD}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Pickup Location Selection - US-3.2 */}
        {deliveryType === 'pickup' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <MapPin
                size={ICON_SIZE_MD}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.sage}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.sectionTitle}>POINT DE RETRAIT</Text>
            </View>

            {selectedPickupLocation ? (
              <View style={styles.selectedLocationCard}>
                <View style={styles.selectedLocationHeader}>
                  <Text style={styles.selectedLocationIcon}>
                    {selectedPickupLocation.icon}
                  </Text>
                  <View style={styles.selectedLocationInfo}>
                    <Text style={styles.selectedLocationName}>
                      {selectedPickupLocation.name}
                    </Text>
                    <Text style={styles.selectedLocationType}>
                      {selectedPickupLocation.type === 'farm'
                        ? 'À la ferme'
                        : 'Dépôt'}
                    </Text>
                  </View>
                </View>

                <View style={styles.selectedLocationAddressRow}>
                  <MapPin
                    size={ICON_SIZE_SM}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <Text style={styles.selectedLocationAddress}>
                    {selectedPickupLocation.address}, {selectedPickupLocation.postalCode} {selectedPickupLocation.city}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.changeLocationButton}
                  onPress={() => setShowPickupModal(true)}
                >
                  <Text style={styles.changeLocationButtonText}>
                    Changer de point de retrait
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectLocationButton}
                onPress={() => setShowPickupModal(true)}
              >
                <Plus
                  size={ICON_SIZE_MD}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <Text style={styles.selectLocationButtonText}>
                  Choisir un point de retrait
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Delivery Address Section - Chronofresh */}
        {deliveryType === 'chronofresh' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <MapPin
                size={ICON_SIZE_MD}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.sage}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.sectionTitle}>ADRESSE DE LIVRAISON</Text>
            </View>

            {deliveryAddress ? (
              <View style={styles.selectedLocationCard}>
                <View style={styles.deliveryAddressContent}>
                  <Text style={styles.deliveryAddressName}>{deliveryAddress.name}</Text>
                  <Text style={styles.deliveryAddressText}>{deliveryAddress.street}</Text>
                  <Text style={styles.deliveryAddressText}>
                    {deliveryAddress.postalCode} {deliveryAddress.city}
                  </Text>
                  <View style={styles.deliveryAddressPhoneRow}>
                    <Phone
                      size={ICON_SIZE_SM}
                      strokeWidth={STROKE_WIDTH}
                      color={COLORS.sage}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <Text style={styles.deliveryAddressPhone}>{deliveryAddress.phone}</Text>
                  </View>
                  {deliveryAddress.instructions && (
                    <View style={styles.deliveryAddressInstructionsRow}>
                      <MessageSquare
                        size={ICON_SIZE_SM}
                        strokeWidth={STROKE_WIDTH}
                        color={COLORS.sage}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <Text style={styles.deliveryAddressInstructions}>
                        {deliveryAddress.instructions}
                      </Text>
                    </View>
                  )}
                </View>

                {shippingLoading ? (
                  <View style={styles.shippingLoadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.leaf} />
                    <Text style={styles.shippingLoadingText}>Calcul des frais...</Text>
                  </View>
                ) : shippingError ? (
                  <View style={styles.shippingErrorContainer}>
                    <Text style={styles.shippingErrorText}>❌ {shippingError}</Text>
                  </View>
                ) : shippingRate && (
                  <View style={styles.shippingRateContainer}>
                    <View style={styles.shippingRateRow}>
                      <Text style={styles.shippingRateLabel}>Zone: {shippingRate.zone}</Text>
                      <Text style={styles.shippingRateValue}>{shippingRate.price.toFixed(2)} €</Text>
                    </View>
                    <View style={styles.shippingRateDeliveryRow}>
                      <Truck
                        size={ICON_SIZE_SM}
                        strokeWidth={STROKE_WIDTH}
                        color={COLORS.sage}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <Text style={styles.shippingRateDelivery}>
                        Livraison en {shippingRate.estimatedDaysMin}-{shippingRate.estimatedDaysMax} jours ouvrés
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.changeLocationButton}
                  onPress={() => router.push('/delivery-address')}
                >
                  <Text style={styles.changeLocationButtonText}>
                    Modifier l'adresse
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectLocationButton}
                onPress={() => router.push('/delivery-address')}
              >
                <Plus
                  size={ICON_SIZE_MD}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <Text style={styles.selectLocationButtonText}>
                  Entrer une adresse de livraison
                </Text>
              </TouchableOpacity>
            )}

            {/* Cold Chain Info */}
            <View style={styles.coldChainInfo}>
              <Snowflake
                size={ICON_SIZE_MD}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.darkGreen}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.coldChainInfoText}>
                Livraison en chaîne du froid garantie
              </Text>
            </View>
          </View>
        )}

        {/* Order Summary - US-3.1 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleRow}>
            <ClipboardList
              size={ICON_SIZE_MD}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.sectionTitle}>RECAPITULATIF</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total produits</Text>
              <Text style={styles.summaryValue}>{total.toFixed(2)} €</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {deliveryType === 'pickup' ? 'Retrait (gratuit)' : 'Livraison Chronofresh'}
              </Text>
              <Text style={styles.summaryValue}>
                {deliveryType === 'pickup'
                  ? '0.00 €'
                  : shippingRate
                    ? `${shippingRate.price.toFixed(2)} €`
                    : '-'}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>{totalWithShipping.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* Clear Cart Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCart}
        >
          <View style={styles.clearButtonContent}>
            <Trash2
              size={ICON_SIZE_SM}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.error}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.clearButtonText}>Vider le panier</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{totalWithShipping.toFixed(2)} €</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !canCheckout().valid && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
        >
          <View style={styles.checkoutButtonContent}>
            {canCheckout().valid ? (
              <CheckCircle
                size={ICON_SIZE_MD}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.offWhite}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : (
              <AlertCircle
                size={ICON_SIZE_MD}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.offWhite}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            <Text style={styles.checkoutButtonText}>
              {canCheckout().valid
                ? 'Valider la commande'
                : deliveryType === 'pickup'
                  ? 'Choisir un point de retrait'
                  : 'Entrer une adresse de livraison'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
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
    padding: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  cartItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cartItemIcon: {
    fontSize: 28,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  cartItemPrice: {
    color: COLORS.leaf,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: COLORS.error,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: COLORS.offWhite,
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    flex: 1,
    justifyContent: 'space-between',
    marginRight: SPACING.md,
  },
  quantityButton: {
    backgroundColor: COLORS.leaf,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.borderCream,
  },
  quantityButtonText: {
    color: COLORS.offWhite,
    fontWeight: '700',
    fontSize: 18,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  clearButton: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  clearButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  clearButtonText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  checkoutButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.lg,
    borderRadius: 25,
    ...SHADOWS.lg,
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.sage,
    opacity: 0.7,
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  checkoutButtonText: {
    color: COLORS.offWhite,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stockWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  stockWarning: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
  },
  // Pickup Location Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  locationList: {
    maxHeight: 400,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.sage,
    fontSize: 14,
    padding: SPACING.lg,
  },
  locationCard: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  locationIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  locationType: {
    fontSize: 13,
    color: COLORS.sage,
  },
  locationAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.darkGreen,
    flex: 1,
  },
  locationDescription: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  openingHoursContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  openingHoursTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.darkGreen,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  openingHoursText: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 2,
  },
  modalCloseButton: {
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  modalCloseButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.sage,
  },
  // Pickup Location Selection Section
  sectionContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    textTransform: 'uppercase',
  },
  selectLocationButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.leaf,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  selectLocationButtonText: {
    color: COLORS.leaf,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLocationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.leaf,
    ...SHADOWS.sm,
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedLocationIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  selectedLocationType: {
    fontSize: 13,
    color: COLORS.sage,
  },
  selectedLocationAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  selectedLocationAddress: {
    fontSize: 14,
    color: COLORS.darkGreen,
    flex: 1,
  },
  changeLocationButton: {
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  changeLocationButtonText: {
    textAlign: 'center',
    color: COLORS.leaf,
    fontWeight: '600',
  },
  // Order Summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: 0,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  summaryValueTotal: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  // Delivery Method Toggle
  deliveryToggle: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderCream,
  },
  deliveryOptionActive: {
    borderColor: COLORS.leaf,
    backgroundColor: COLORS.offWhite,
  },
  deliveryOptionIconContainer: {
    marginRight: SPACING.md,
  },
  deliveryOptionInfo: {
    flex: 1,
  },
  deliveryOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  deliveryOptionTitleActive: {
    color: COLORS.leaf,
  },
  deliveryOptionSubtitle: {
    fontSize: 13,
    color: COLORS.sage,
    marginTop: 2,
  },
  deliveryOptionCheck: {
    fontSize: 18,
    color: COLORS.leaf,
    fontWeight: 'bold',
  },
  // Delivery Address
  deliveryAddressContent: {
    marginBottom: SPACING.md,
  },
  deliveryAddressName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  deliveryAddressText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  deliveryAddressPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  deliveryAddressPhone: {
    fontSize: 14,
    color: COLORS.sage,
  },
  deliveryAddressInstructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  deliveryAddressInstructions: {
    fontSize: 13,
    color: COLORS.sage,
    fontStyle: 'italic',
    flex: 1,
  },
  // Shipping Rate Display
  shippingLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  shippingLoadingText: {
    marginLeft: SPACING.sm,
    color: COLORS.sage,
  },
  shippingErrorContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.errorLight,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  shippingErrorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  shippingRateContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.leaf,
  },
  shippingRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingRateLabel: {
    fontSize: 14,
    color: COLORS.darkGreen,
  },
  shippingRateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  shippingRateDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  shippingRateDelivery: {
    fontSize: 13,
    color: COLORS.sage,
  },
  coldChainInfo: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  coldChainInfoText: {
    fontSize: 14,
    color: COLORS.darkGreen,
    fontWeight: '600',
  },
});
