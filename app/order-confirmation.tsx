/**
 * Order Confirmation Screen
 *
 * Écran de confirmation après un paiement réussi
 * US-4.2: Affichage de la confirmation de commande
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  CheckCircle,
  ClipboardList,
  Snowflake,
  Check,
  Target,
  MessageCircle,
  Mail,
  Phone,
  Package,
  Home,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const ICON_SIZE = 20;
const STROKE_WIDTH = 1.5;

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
          <View style={styles.successIconContainer}>
            <CheckCircle
              size={64}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </View>
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
          <View style={styles.sectionTitleRow}>
            <ClipboardList
              size={ICON_SIZE}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.summaryTitle}>Récapitulatif</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant payé</Text>
            <Text style={styles.summaryValue}>{params.total} €</Text>
          </View>

          {isDelivery ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode de livraison</Text>
                <View style={styles.deliveryModeValue}>
                  <Snowflake
                    size={16}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.darkGreen}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <Text style={styles.summaryValue}>Chronofresh</Text>
                </View>
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
              <Check
                size={14}
                strokeWidth={2}
                color={COLORS.leaf}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.statusText}>Confirmé</Text>
            </View>
          </View>
        </View>

        {/* Prochaines étapes */}
        <View style={styles.nextStepsCard}>
          <View style={styles.sectionTitleRow}>
            <Target
              size={ICON_SIZE}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.nextStepsTitle}>Prochaines étapes</Text>
          </View>

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
          <View style={styles.contactTitleRow}>
            <MessageCircle
              size={ICON_SIZE}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.darkGreen}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.contactTitle}>Besoin d'aide ?</Text>
          </View>
          <Text style={styles.contactText}>
            Si vous avez des questions sur votre commande, n'hésitez pas à nous
            contacter :
          </Text>
          <View style={styles.contactInfoRow}>
            <Mail
              size={16}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.contactInfo}>contact@gart-batilly.fr</Text>
          </View>
          <View style={styles.contactInfoRow}>
            <Phone
              size={16}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.contactInfo}>06 XX XX XX XX</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Naviguer vers l'onglet profil pour voir l'historique
            router.replace('/(tabs)/profile');
          }}
        >
          <View style={styles.buttonContent}>
            <Package
              size={18}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.offWhite}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.primaryButtonText}>Voir mes commandes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            // Retour à l'accueil
            router.replace('/(tabs)');
          }}
        >
          <View style={styles.buttonContent}>
            <Home
              size={18}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.darkGreen}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.secondaryButtonText}>Retour à l'accueil</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.darkGreen,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.sage,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  orderNumberCard: {
    backgroundColor: COLORS.leaf,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  orderNumberLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.offWhite,
    marginBottom: SPACING.sm,
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.offWhite,
    letterSpacing: 1,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
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
  deliveryModeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.leaf,
  },
  statusText: {
    color: COLORS.leaf,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  nextStepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  nextStepsTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.lg,
    textTransform: 'uppercase',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.darkGreen,
    color: COLORS.offWhite,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  contactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  contactInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.leaf,
  },
  primaryButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.offWhite,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  secondaryButtonText: {
    color: COLORS.darkGreen,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
