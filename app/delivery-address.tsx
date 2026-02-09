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
import { useRouter } from 'expo-router';
import { useShopStore } from '../store/shopStore';
import {
  DeliveryAddress,
  validateDeliveryAddress,
  isValidFrenchPostalCode,
  calculateShippingRate,
} from '../services/deliveryService';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  beigeDark: '#E8E8CD',
  white: '#FFFFFF',
  red: '#DC2626',
  gray: '#6B7280',
  green: '#10B981',
};

export default function DeliveryAddressScreen() {
  const router = useRouter();
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
        <Text style={styles.title}>📍 Adresse de livraison</Text>
        <Text style={styles.subtitle}>
          Livraison en chaîne du froid avec Chronofresh
        </Text>

        {/* Shipping Info Card */}
        <View style={styles.shippingInfoCard}>
          <Text style={styles.shippingInfoTitle}>🚚 Informations livraison</Text>
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
            <Text style={styles.shippingRateTitle}>📦 Frais de port</Text>

            {isCalculating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Calcul en cours...</Text>
              </View>
            ) : localShippingError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ {localShippingError}</Text>
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
          <Text style={styles.coldChainTitle}>❄️ Livraison en chaîne du froid</Text>
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
    backgroundColor: COLORS.beige,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
  },
  shippingInfoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  shippingInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  shippingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shippingInfoLabel: {
    fontSize: 14,
    color: COLORS.primaryDark,
  },
  shippingInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.beige,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  postalCodeInput: {
    flex: 1,
  },
  cityInput: {
    flex: 2,
  },
  shippingRateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  shippingRateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.gray,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.red,
    textAlign: 'center',
  },
  shippingRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shippingRateLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  shippingRateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  shippingRateTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.beigeDark,
    paddingTop: 12,
    marginTop: 4,
  },
  shippingRateTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  shippingRateTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  grandTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  enterPostalCodeText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  coldChainCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
  },
  coldChainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  coldChainText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.beige,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  submitButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
