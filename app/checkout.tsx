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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStripe } from '../utils/stripe';
import { useShopStore } from '../store/shopStore';
import { stripeService } from '../services/stripeService';
import { supabaseApiService } from '../services/supabaseApi';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  white: '#FFFFFF',
  red: '#DC2626',
  gray: '#6B7280',
};

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
        <Text style={styles.webTitle}>📱 Application Mobile Requise</Text>
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Préparation du paiement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>💳 Paiement sécurisé</Text>

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
              <Text style={styles.productIcon}>{item.product.image_url}</Text>
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
          <Text style={styles.securityTitle}>🔒 Paiement sécurisé</Text>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.beige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.primary,
    fontSize: 16,
  },
  webTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  webText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.beige,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  productQuantity: {
    fontSize: 12,
    color: COLORS.gray,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  securityCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '600',
  },
});
