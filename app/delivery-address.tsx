/**
 * Delivery Address Screen
 *
 * Form for collecting delivery address for Chronofresh shipping
 * Calculates and displays shipping rate based on postal code
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Truck, Package, Snowflake, AlertCircle, ChevronLeft } from 'lucide-react-native';
import { useShopStore } from '../store/shopStore';
import {
  DeliveryAddress,
  validateDeliveryAddress,
  isValidFrenchPostalCode,
  calculateShippingRate,
} from '../services/deliveryService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const ICON_SIZE = 20;
const STROKE_WIDTH = 1.5;

export default function DeliveryAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 20;

  const {
    deliveryAddress,
    setDeliveryAddress,
    shippingRate,
    shippingLoading,
    shippingError,
    getCartWeight,
    getCartTotal,
    calculateShipping,
  } = useShopStore();

  // Form state
  const [name, setName] = useState(deliveryAddress?.name || '');
  const [street, setStreet] = useState(deliveryAddress?.street || '');
  const [postalCode, setPostalCode] = useState(deliveryAddress?.postalCode || '');
  const [city, setCity] = useState(deliveryAddress?.city || '');
  const [phone, setPhone] = useState(deliveryAddress?.phone || '');
  const [instructions, setInstructions] = useState(deliveryAddress?.instructions || '');

  // Local shipping calculation state
  const [localShippingRate, setLocalShippingRate] = useState<{
    price: number;
    zone: string;
    estimatedDaysMin: number;
    estimatedDaysMax: number;
  } | null>(null);
  const [localShippingError, setLocalShippingError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const cartWeight = getCartWeight();
  const cartTotal = getCartTotal();

  // Calculate shipping when postal code changes
  useEffect(() => {
    if (isValidFrenchPostalCode(postalCode)) {
      calculateLocalShipping();
    } else {
      setLocalShippingRate(null);
      setLocalShippingError(null);
    }
  }, [postalCode]);

  const calculateLocalShipping = async () => {
    if (!isValidFrenchPostalCode(postalCode)) return;

    setIsCalculating(true);
    setLocalShippingError(null);

    try {
      const result = await calculateShippingRate(postalCode, cartWeight);

      if (result.success && result.rate) {
        setLocalShippingRate({
          price: result.rate.price,
          zone: result.rate.zone,
          estimatedDaysMin: result.rate.estimatedDaysMin,
          estimatedDaysMax: result.rate.estimatedDaysMax,
        });
        setLocalShippingError(null);
      } else {
        setLocalShippingRate(null);
        setLocalShippingError(result.error || 'Erreur de calcul');
      }
    } catch (error) {
      setLocalShippingRate(null);
      setLocalShippingError('Erreur lors du calcul des frais de port');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = () => {
    const address: DeliveryAddress = {
      name: name.trim(),
      street: street.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      phone: phone.trim(),
      instructions: instructions.trim() || undefined,
    };

    const validation = validateDeliveryAddress(address);

    if (!validation.valid) {
      Alert.alert('Formulaire incomplet', validation.errors.join('\n'));
      return;
    }

    if (!localShippingRate) {
      Alert.alert('Erreur', 'Les frais de port n\'ont pas pu être calculés.');
      return;
    }

    // Save address to store
    setDeliveryAddress(address);

    // Calculate shipping in store (will use the saved address)
    calculateShipping();

    // Navigate back to cart
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header with back button */}
        <View style={[styles.header, { paddingTop: topPadding }]}>
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
          <MapPin
            size={28}
            strokeWidth={STROKE_WIDTH}
            color={COLORS.darkGreen}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Text style={styles.title}>Adresse de livraison</Text>
        </View>
        <Text style={styles.subtitle}>
          Livraison en chaîne du froid avec Chronofresh
        </Text>

        {/* Shipping Info Card */}
        <View style={styles.shippingInfoCard}>
          <View style={styles.sectionTitleRow}>
            <Truck
              size={ICON_SIZE}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.shippingInfoTitle}>Informations livraison</Text>
          </View>
          <View style={styles.shippingInfoRow}>
            <Text style={styles.shippingInfoLabel}>Poids total</Text>
            <Text style={styles.shippingInfoValue}>
              {(cartWeight / 1000).toFixed(2)} kg
            </Text>
          </View>
          <View style={styles.shippingInfoRow}>
            <Text style={styles.shippingInfoLabel}>Sous-total produits</Text>
            <Text style={styles.shippingInfoValue}>{cartTotal.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Coordonnées</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Jean Dupont"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="06 12 34 56 78"
              keyboardType="phone-pad"
            />
            <Text style={styles.inputHint}>
              Le transporteur vous contactera pour la livraison
            </Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Adresse</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse *</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="123 rue des Légumes"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.postalCodeInput]}>
              <Text style={styles.inputLabel}>Code postal *</Text>
              <TextInput
                style={styles.input}
                value={postalCode}
                onChangeText={(text) => setPostalCode(text.replace(/\D/g, '').slice(0, 5))}
                placeholder="75001"
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputGroup, styles.cityInput]}>
              <Text style={styles.inputLabel}>Ville *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Paris"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instructions de livraison</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Interphone, étage, code d'accès..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Shipping Rate Display */}
        {postalCode.length === 5 && (
          <View style={styles.shippingRateCard}>
            <View style={styles.sectionTitleRow}>
              <Package
                size={ICON_SIZE}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.leaf}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.shippingRateTitle}>Frais de port</Text>
            </View>

            {isCalculating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Calcul en cours...</Text>
              </View>
            ) : localShippingError ? (
              <View style={styles.errorContainer}>
                <View style={styles.errorContent}>
                  <AlertCircle
                    size={18}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.error}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <Text style={styles.errorText}>{localShippingError}</Text>
                </View>
              </View>
            ) : localShippingRate ? (
              <>
                <View style={styles.shippingRateRow}>
                  <Text style={styles.shippingRateLabel}>Zone</Text>
                  <Text style={styles.shippingRateValue}>{localShippingRate.zone}</Text>
                </View>
                <View style={styles.shippingRateRow}>
                  <Text style={styles.shippingRateLabel}>Délai estimé</Text>
                  <Text style={styles.shippingRateValue}>
                    {localShippingRate.estimatedDaysMin}-{localShippingRate.estimatedDaysMax} jours ouvrés
                  </Text>
                </View>
                <View style={[styles.shippingRateRow, styles.shippingRateTotal]}>
                  <Text style={styles.shippingRateTotalLabel}>Frais de port</Text>
                  <Text style={styles.shippingRateTotalValue}>
                    {localShippingRate.price.toFixed(2)} €
                  </Text>
                </View>
                <View style={styles.shippingRateRow}>
                  <Text style={styles.shippingRateTotalLabel}>Total commande</Text>
                  <Text style={styles.grandTotal}>
                    {(cartTotal + localShippingRate.price).toFixed(2)} €
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.enterPostalCodeText}>
                Entrez un code postal pour calculer les frais
              </Text>
            )}
          </View>
        )}

        {/* Cold Chain Info */}
        <View style={styles.coldChainCard}>
          <View style={styles.coldChainTitleRow}>
            <Snowflake
              size={ICON_SIZE}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.darkGreen}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.coldChainTitle}>Livraison en chaîne du froid</Text>
          </View>
          <Text style={styles.coldChainText}>
            Vos produits frais sont livrés dans un emballage isotherme avec packs
            de gel réfrigérant pour garantir leur fraîcheur jusqu'à votre porte.
          </Text>
        </View>
      </ScrollView>

      {/* Footer with Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!localShippingRate || isCalculating) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!localShippingRate || isCalculating}
        >
          <Text style={styles.submitButtonText}>
            Valider l'adresse
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.sage,
    marginBottom: SPACING.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  shippingInfoCard: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.leaf,
  },
  shippingInfoTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.leaf,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  shippingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  shippingInfoLabel: {
    fontSize: 14,
    color: COLORS.darkGreen,
  },
  shippingInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.leaf,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.darkGreen,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.sage,
    marginTop: SPACING.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  postalCodeInput: {
    flex: 1,
  },
  cityInput: {
    flex: 2,
  },
  shippingRateCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.leaf,
    ...SHADOWS.sm,
  },
  shippingRateTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.leaf,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    color: COLORS.sage,
  },
  errorContainer: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
  },
  shippingRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  shippingRateLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  shippingRateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  shippingRateTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
  },
  shippingRateTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  shippingRateTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  grandTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  enterPostalCodeText: {
    textAlign: 'center',
    color: COLORS.sage,
    fontStyle: 'italic',
  },
  coldChainCard: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  coldChainTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  coldChainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  coldChainText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.sage,
  },
  submitButton: {
    flex: 2,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.darkGreen,
    ...SHADOWS.sm,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.sage,
    opacity: 0.6,
  },
  submitButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.offWhite,
    letterSpacing: 0.5,
  },
});
