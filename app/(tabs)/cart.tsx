import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShopStore } from '../../store/shopStore';
import { supabasePickupService, PickupLocation } from '../../services/supabasePickupService';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  beigeDark: '#E8E8CD',
  white: '#FFFFFF',
  red: '#DC2626',
  gray: '#6B7280',
};

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

                <Text style={styles.locationAddress}>
                  📍 {location.address}
                </Text>
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

  return (
    <View style={styles.cartItem}>
      <View style={styles.cartItemHeader}>
        {/* Product Icon */}
        <Text style={styles.cartItemIcon}>{item.product.image_url || '🥗'}</Text>

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
          onPress={() => {
            Alert.alert(
              'Retirer du panier',
              `Voulez-vous retirer ${item.product.name} du panier ?`,
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Retirer',
                  style: 'destructive',
                  onPress: () => removeFromCart(item.product.id),
                },
              ]
            );
          }}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantityRow}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateCartQuantity(item.product.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
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
                updateCartQuantity(item.product.id, item.quantity + 1);
              } else {
                Alert.alert(
                  'Stock maximum atteint',
                  `Stock disponible: ${item.product.stock} ${item.product.unit}`,
                  [{ text: 'OK' }]
                );
              }
            }}
            disabled={item.quantity >= item.product.stock}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>
          {(item.product.price * item.quantity).toFixed(2)} €
        </Text>
      </View>

      {/* Stock Warning */}
      {availableStock <= 5 && availableStock > 0 && (
        <Text style={styles.stockWarning}>
          ⚠️ Plus que {availableStock} {item.product.unit} disponible(s)
        </Text>
      )}
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    getCartTotal,
    clearCart,
    selectedPickupLocation,
    setPickupLocation,
    canCheckout,
  } = useShopStore();
  const total = getCartTotal();
  const [showPickupModal, setShowPickupModal] = useState(false);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛍️</Text>
        <Text style={styles.emptyTitle}>Votre panier est vide</Text>
        <Text style={styles.emptyText}>
          Découvrez nos délicieux légumes frais et commencez vos achats !
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/shop')}
        >
          <Text style={styles.shopButtonText}>🛒 Voir les produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle checkout with validation
  const handleCheckout = () => {
    const validation = canCheckout();

    if (!validation.valid) {
      Alert.alert(
        'Commande incomplète',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to Stripe checkout
    router.push('/checkout');
  };

  return (
    <View style={styles.container}>
      {/* Pickup Location Modal */}
      <PickupLocationModal
        visible={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onSelect={setPickupLocation}
      />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>
          🛍️ Mon panier ({cart.length} {cart.length > 1 ? 'articles' : 'article'}
          )
        </Text>

        {/* Cart Items - US-3.1 */}
        {cart.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}

        {/* Pickup Location Selection - US-3.2 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📍 Point de retrait</Text>

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

              <Text style={styles.selectedLocationAddress}>
                📍 {selectedPickupLocation.address}, {selectedPickupLocation.postalCode} {selectedPickupLocation.city}
              </Text>

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
              <Text style={styles.selectLocationButtonText}>
                ➕ Choisir un point de retrait
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary - US-3.1 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📋 Récapitulatif</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{total.toFixed(2)} €</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de service</Text>
              <Text style={styles.summaryValue}>0.00 €</Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>{total.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* Clear Cart Button */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              'Vider le panier',
              'Voulez-vous vraiment vider votre panier ?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Vider',
                  style: 'destructive',
                  onPress: clearCart,
                },
              ]
            );
          }}
        >
          <Text style={styles.clearButtonText}>🗑️ Vider le panier</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{total.toFixed(2)} €</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !canCheckout().valid && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            {selectedPickupLocation
              ? '✅ Valider la commande'
              : '⚠️ Choisir un point de retrait'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
  },
  shopButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  cartItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  cartItemPrice: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: COLORS.red,
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
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
    backgroundColor: COLORS.beige,
    borderRadius: 4,
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 16,
  },
  quantityButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  quantityButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  clearButton: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearButtonText: {
    color: COLORS.red,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockWarning: {
    marginTop: 8,
    fontSize: 12,
    color: '#F59E0B',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  locationList: {
    maxHeight: 400,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 16,
    padding: 20,
  },
  locationCard: {
    backgroundColor: COLORS.beige,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.beigeDark,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  locationType: {
    fontSize: 14,
    color: COLORS.gray,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 8,
  },
  openingHoursContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  openingHoursTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  openingHoursText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  modalCloseButton: {
    backgroundColor: COLORS.beigeDark,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  modalCloseButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  // Pickup Location Selection Section
  sectionContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  selectLocationButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  selectLocationButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLocationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedLocationIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  selectedLocationType: {
    fontSize: 14,
    color: COLORS.gray,
  },
  selectedLocationAddress: {
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  changeLocationButton: {
    backgroundColor: COLORS.beige,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
  },
  changeLocationButtonText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Order Summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#374151',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  summaryRowTotal: {
    borderTopWidth: 2,
    borderTopColor: COLORS.beigeDark,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  summaryLabelTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryValueTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
