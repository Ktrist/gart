/**
 * Checkout Screen
 *
 * Écran de paiement avec Stripe Payment Sheet
 * US-4.1: Initialisation du paiement sécurisé
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard, Shield, Smartphone, Salad, ChevronLeft } from 'lucide-react-native';
import { useStripe } from '../utils/stripe';
import { useShopStore } from '../store/shopStore';
import { stripeService } from '../services/stripeService';
import { supabaseApiService } from '../services/supabaseApi';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const ICON_SIZE = 24;
const STROKE_WIDTH = 1.5;

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    cart,
    getCartTotal,
    getTotalWithShipping,
    getCartWeight,
    selectedPickupLocation,
    clearCart,
    // Delivery state
    deliveryType,
    deliveryAddress,
    shippingRate,
  } = useShopStore();

  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const subtotal = getCartTotal();
  const total = getTotalWithShipping();
  const shippingCost = shippingRate?.price || 0;
  const totalWeight = getCartWeight();

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  /**
   * Initialise le Payment Sheet Stripe
   */
  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      // US-4.2: Vérifier le stock avant de créer le payment intent
      const stockCheck = await supabaseApiService.verifyStock(
        cart.map((item) => ({
          productId: item.product.uuid || item.product.id.toString(),
          quantity: item.quantity,
        }))
      );

      if (!stockCheck.valid) {
        Alert.alert(
          'Stock insuffisant',
          `Certains produits ne sont plus disponibles en quantité suffisante:\n\n${stockCheck.unavailableItems
            .map(
              (i) =>
                `• ${i.productName}: ${i.available} restant(s) (demandé: ${i.requested})`
            )
            .join('\n')}`,
          [{ text: 'Retour au panier', onPress: () => router.back() }]
        );
        setLoading(false);
        return;
      }

      // Créer le Payment Intent via notre Edge Function
      const { clientSecret, paymentIntentId } =
        await stripeService.createPaymentIntent({
          amount: total,
          description: `Commande Gart - ${cart.length} article(s)${deliveryType === 'chronofresh' ? ' (Livraison Chronofresh)' : ''}`,
          metadata: {
            cart_items: JSON.stringify(
              cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
              }))
            ),
            pickup_location_id: selectedPickupLocation?.id || '',
            delivery_type: deliveryType,
            shipping_cost: shippingCost.toString(),
          },
        });

      // Initialiser le Payment Sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Gart - Le jardin du bon',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          name: '',
        },
        returnURL: 'gart://order-confirmation',
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        Alert.alert('Erreur', 'Impossible d\'initialiser le paiement');
        return;
      }

      setPaymentReady(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer le paiement. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Présente le Payment Sheet et traite le paiement
   */
  const handlePayment = async () => {
    // Vérifier que l'utilisateur est connecté
    if (!user) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour passer commande.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Se connecter',
            onPress: () => router.push('/auth'),
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          // Utilisateur a annulé
          Alert.alert('Paiement annulé', 'Vous avez annulé le paiement.');
        } else {
          // Erreur de paiement
          Alert.alert('Erreur de paiement', error.message);
        }
        setLoading(false);
        return;
      }

      // Paiement réussi ! 🎉
      await handleSuccessfulPayment();
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du paiement');
      setLoading(false);
    }
  };

  /**
   * Gère le succès du paiement: créer la commande et mettre à jour le stock
   */
  const handleSuccessfulPayment = async () => {
    try {
      // Vérifier que l'utilisateur est connecté
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Récupérer le cycle de vente actuel
      const currentCycle = await supabaseApiService.getCurrentSalesCycle();

      // Préparer les items de la commande
      const orderItems = cart.map((item) => ({
        productId: item.product.uuid || item.product.id.toString(),
        quantity: item.quantity,
        unitPrice: item.product.price,
        productName: item.product.name,
        productUnit: item.product.unit,
      }));

      // Créer la commande dans Supabase
      const result = await supabaseApiService.createOrder({
        userId: user.id,
        total: total,
        pickupLocationId: deliveryType === 'pickup' ? selectedPickupLocation?.id : null,
        salesCycleId: currentCycle?.id || null,
        items: orderItems,
        // Delivery fields
        deliveryType,
        deliveryAddress: deliveryType === 'chronofresh' ? deliveryAddress : null,
        shippingCost: deliveryType === 'chronofresh' ? shippingCost : 0,
        totalWeightGrams: deliveryType === 'chronofresh' ? totalWeight : undefined,
      });

      if (!result) {
        throw new Error('Failed to create order in database');
      }

      // Mettre à jour le stock de chaque produit
      for (const item of cart) {
        const newStock = item.product.stock - item.quantity;
        const productId = item.product.uuid || item.product.id.toString();
        await supabaseApiService.updateProductStock(productId, newStock);
      }

      // Vider le panier
      clearCart();

      // Rediriger vers la confirmation
      router.replace({
        pathname: '/order-confirmation',
        params: {
          orderNumber: result.orderNumber,
          total: total.toFixed(2),
          pickupLocation: selectedPickupLocation?.name || '',
          deliveryType,
          deliveryCity: deliveryAddress?.city || '',
          shippingCost: shippingCost.toFixed(2),
          estimatedDays: shippingRate
            ? `${shippingRate.estimatedDaysMin}-${shippingRate.estimatedDaysMax}`
            : '',
        },
      });
    } catch (error) {
      console.error('Error handling successful payment:', error);
      Alert.alert(
        'Attention',
        'Le paiement a réussi mais une erreur est survenue. Contactez le support.'
      );
    }
  };

  // Sur le web, afficher un message d'information
  if (Platform.OS === 'web') {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.webTitleRow}>
          <Smartphone
            size={ICON_SIZE}
            strokeWidth={STROKE_WIDTH}
            color={COLORS.darkGreen}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Text style={styles.webTitle}>Application Mobile Requise</Text>
        </View>
        <Text style={styles.webText}>
          Le paiement Stripe n'est disponible que sur l'application mobile iOS ou Android.
        </Text>
        <Text style={styles.webText}>
          Veuillez utiliser l'application mobile pour finaliser votre commande.
        </Text>
        <TouchableOpacity style={styles.payButton} onPress={() => router.back()}>
          <Text style={styles.payButtonText}>← Retour au panier</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !paymentReady) {
    return <LoadingScreen message="Préparation du paiement..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft
                size={20}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.leaf}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleRow}>
            <CreditCard
              size={ICON_SIZE}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.darkGreen}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.title}>Paiement sécurisé</Text>
          </View>

        {/* Résumé de la commande */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Articles</Text>
            <Text style={styles.summaryValue}>{cart.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
          </View>

          {deliveryType === 'pickup' ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Point de retrait</Text>
              <Text style={styles.summaryValue}>
                {selectedPickupLocation?.name || 'Non défini'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Livraison Chronofresh</Text>
                <Text style={styles.summaryValue}>{shippingCost.toFixed(2)} €</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Livraison à</Text>
                <Text style={styles.summaryValue}>
                  {deliveryAddress?.city || 'Non défini'}
                </Text>
              </View>
            </>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Produits */}
        <View style={styles.productsCard}>
          <Text style={styles.productsTitle}>Vos produits</Text>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.productRow}>
              <View style={styles.productIconContainer}>
                {item.product.image_url ? (
                  <Text style={styles.productIcon}>{item.product.image_url}</Text>
                ) : (
                  <Salad
                    size={24}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.leaf}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productQuantity}>
                  {item.quantity} {item.product.unit}
                </Text>
              </View>
              <Text style={styles.productPrice}>
                {(item.product.price * item.quantity).toFixed(2)} €
              </Text>
            </View>
          ))}
        </View>

        {/* Informations de sécurité */}
        <View style={styles.securityCard}>
          <View style={styles.securityTitleRow}>
            <Shield
              size={20}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.darkGreen}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.securityTitle}>Paiement sécurisé</Text>
          </View>
          <Text style={styles.securityText}>
            Vos informations bancaires sont protégées par Stripe, leader mondial
            du paiement en ligne. Nous ne stockons aucune donnée de carte bancaire.
          </Text>
        </View>

        {/* Bouton de paiement */}
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading || !paymentReady}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.payButtonText}>
              Payer {total.toFixed(2)} € avec Stripe
            </Text>
          )}
        </TouchableOpacity>

        {/* Bouton annuler */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

          {/* Bottom spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  webTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  webText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.xxl,
    lineHeight: 24,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.leaf,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.leaf,
    ...SHADOWS.sm,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  productsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  productsTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  productIcon: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  productQuantity: {
    fontSize: 12,
    color: COLORS.sage,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  securityCard: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  securityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.sage,
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.lg,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.sage,
    opacity: 0.6,
  },
  payButtonText: {
    color: COLORS.offWhite,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cancelButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.sage,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
