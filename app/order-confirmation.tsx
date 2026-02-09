/**
 * Order Confirmation Screen
 *
 * Écran de confirmation après un paiement réussi
 * US-4.2: Affichage de la confirmation de commande
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  white: '#FFFFFF',
  green: '#10B981',
  gray: '#6B7280',
};

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderNumber: string;
    total: string;
    pickupLocation: string;
    deliveryType: string;
    deliveryCity: string;
    shippingCost: string;
    estimatedDays: string;
  }>();

  const isDelivery = params.deliveryType === 'chronofresh';

  useEffect(() => {
    // Empêcher le retour arrière
    // L'utilisateur doit utiliser le bouton "Retour à l'accueil"
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Icône de succès */}
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>

        {/* Titre de confirmation */}
        <Text style={styles.title}>Paiement réussi !</Text>
        <Text style={styles.subtitle}>
          Votre commande a été validée avec succès
        </Text>

        {/* Numéro de commande */}
        <View style={styles.orderNumberCard}>
          <Text style={styles.orderNumberLabel}>Numéro de commande</Text>
          <Text style={styles.orderNumber}>{params.orderNumber}</Text>
        </View>

        {/* Récapitulatif */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Récapitulatif</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant payé</Text>
            <Text style={styles.summaryValue}>{params.total} €</Text>
          </View>

          {isDelivery ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode de livraison</Text>
                <Text style={styles.summaryValue}>❄️ Chronofresh</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Livraison à</Text>
                <Text style={styles.summaryValue}>{params.deliveryCity}</Text>
              </View>
              {params.shippingCost && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frais de port</Text>
                  <Text style={styles.summaryValue}>{params.shippingCost} €</Text>
                </View>
              )}
              {params.estimatedDays && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Délai estimé</Text>
                  <Text style={styles.summaryValue}>{params.estimatedDays} jours ouvrés</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Point de retrait</Text>
              <Text style={styles.summaryValue}>{params.pickupLocation}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Statut</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Confirmé</Text>
            </View>
          </View>
        </View>

        {/* Prochaines étapes */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>🎯 Prochaines étapes</Text>

          <View style={styles.stepRow}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Confirmation par email</Text>
              <Text style={styles.stepDescription}>
                Vous recevrez un email de confirmation avec le récapitulatif de
                votre commande
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Préparation de votre commande</Text>
              <Text style={styles.stepDescription}>
                Nos producteurs vont préparer vos produits frais avec soin
              </Text>
            </View>
          </View>

          {isDelivery ? (
            <>
              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>3</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Expédition Chronofresh</Text>
                  <Text style={styles.stepDescription}>
                    Votre commande sera expédiée en emballage isotherme pour
                    garantir la fraîcheur de vos produits
                  </Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>4</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Livraison à domicile</Text>
                  <Text style={styles.stepDescription}>
                    Le transporteur vous contactera pour la livraison. Vous
                    recevrez un numéro de suivi par email.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>3</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Notification de disponibilité</Text>
                  <Text style={styles.stepDescription}>
                    Nous vous préviendrons dès que votre commande sera prête à être
                    récupérée
                  </Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <Text style={styles.stepNumber}>4</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Retrait de votre commande</Text>
                  <Text style={styles.stepDescription}>
                    Rendez-vous au point de retrait choisi pendant les horaires
                    d'ouverture
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Informations de contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>💬 Besoin d'aide ?</Text>
          <Text style={styles.contactText}>
            Si vous avez des questions sur votre commande, n'hésitez pas à nous
            contacter :
          </Text>
          <Text style={styles.contactInfo}>📧 contact@gart-batilly.fr</Text>
          <Text style={styles.contactInfo}>📱 06 XX XX XX XX</Text>
        </View>

        {/* Boutons d'action */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Naviguer vers l'onglet profil pour voir l'historique
            router.replace('/(tabs)/profile');
          }}
        >
          <Text style={styles.primaryButtonText}>
            📦 Voir mes commandes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            // Retour à l'accueil
            router.replace('/(tabs)');
          }}
        >
          <Text style={styles.secondaryButtonText}>
            🏠 Retour à l'accueil
          </Text>
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
  content: {
    padding: 20,
    paddingTop: 60,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
  },
  orderNumberCard: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 8,
    opacity: 0.9,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    alignItems: 'center',
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
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.green,
    fontWeight: '600',
    fontSize: 14,
  },
  nextStepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 12,
    lineHeight: 20,
  },
  contactInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
