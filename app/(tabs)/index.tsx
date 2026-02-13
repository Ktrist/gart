/**
 * Home Screen
 *
 * Écran d'accueil avec design premium Gart
 * Affiche le statut de la boutique et les engagements
 */

import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Leaf,
  CalendarDays,
  ShoppingBag,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react-native';
import { useShopStore } from '../../store/shopStore';
import { supabaseSalesCycleService } from '../../services/supabaseSalesCycleService';
import { LoadingScreen } from '../../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const ICON_SIZE = 24;
const ICON_SIZE_SM = 20;
const STROKE_WIDTH = 1.5;

// Aerial field image for banner
const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

export default function HomeScreen() {
  const router = useRouter();
  const { shopStatus, isLoading, fetchShopStatus } = useShopStore();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const bannerHeight = height * 0.38;
  const contentWidth = width * 0.9;
  // Minimum 20px padding below safe area for premium spacing
  const heroTopPadding = insets.top + 20;

  useEffect(() => {
    fetchShopStatus();
  }, []);

  if (isLoading && !shopStatus) {
    return <LoadingScreen message="Chargement de la boutique..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Banner with Aerial Field Background */}
        <ImageBackground
          source={AERIAL_FIELD_IMAGE}
          style={[styles.heroBanner, { height: bannerHeight }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(20, 50, 33, 0.1)',
              shopStatus?.isOpen
                ? 'rgba(45, 90, 60, 0.85)'
                : 'rgba(118, 141, 93, 0.85)',
              shopStatus?.isOpen
                ? 'rgba(45, 90, 60, 0.95)'
                : 'rgba(118, 141, 93, 0.95)',
            ]}
            locations={[0, 0.5, 1]}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingTop: heroTopPadding }]}>
              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: shopStatus?.isOpen ? '#4ADE80' : COLORS.borderCream },
                  ]}
                />
                <Text style={styles.statusBadgeText}>
                  {shopStatus?.isOpen ? 'BOUTIQUE OUVERTE' : 'BOUTIQUE FERMÉE'}
                </Text>
              </View>

              {/* Main Title */}
              <Text style={styles.heroTitle}>
                {shopStatus?.isOpen ? 'Bienvenue !' : 'À bientôt !'}
              </Text>
              <Text style={styles.heroSubtitle}>{shopStatus?.message}</Text>

              {/* Cycle Info */}
              {shopStatus?.isOpen && shopStatus.currentCycle && (
                <View style={styles.cycleInfo}>
                  <View style={styles.cycleInfoRow}>
                    <CalendarDays
                      size={16}
                      strokeWidth={STROKE_WIDTH}
                      color={COLORS.offWhite}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <Text style={styles.cycleInfoText}>
                      {shopStatus.currentCycle.name}
                    </Text>
                  </View>
                  <Text style={styles.cycleInfoDates}>
                    Du{' '}
                    {supabaseSalesCycleService.formatDateShort(
                      shopStatus.currentCycle.openingDate
                    )}{' '}
                    au{' '}
                    {supabaseSalesCycleService.formatDateShort(
                      shopStatus.currentCycle.closingDate
                    )}
                  </Text>
                </View>
              )}

              {!shopStatus?.isOpen && shopStatus?.nextCycle && (
                <View style={styles.cycleInfo}>
                  <View style={styles.cycleInfoRow}>
                    <Clock
                      size={16}
                      strokeWidth={STROKE_WIDTH}
                      color={COLORS.offWhite}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <Text style={styles.cycleInfoText}>
                      Prochaine ouverture dans {shopStatus.daysUntilNextOpening}{' '}
                      {shopStatus.daysUntilNextOpening === 1 ? 'jour' : 'jours'}
                    </Text>
                  </View>
                  <Text style={styles.cycleInfoDates}>
                    {shopStatus.nextCycle.name}
                  </Text>
                </View>
              )}

              {/* CTA Button */}
              {shopStatus?.isOpen && (
                <TouchableOpacity
                  style={styles.heroCta}
                  onPress={() => router.push('/shop')}
                  activeOpacity={0.9}
                >
                  <ShoppingBag
                    size={ICON_SIZE_SM}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.darkGreen}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <Text style={styles.heroCtaText}>DÉCOUVRIR NOS PRODUITS</Text>
                  <ArrowRight
                    size={ICON_SIZE_SM}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.darkGreen}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Content Section */}
        <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.sectionLabel}>LE JARDIN DU BON</Text>
            <Text style={styles.welcomeTitle}>Gart</Text>
            <Text style={styles.welcomeDescription}>
              Découvrez nos légumes frais et de saison, cultivés avec passion et
              respect de l'environnement à Batilly-en-Puisaye.
            </Text>
          </View>

          {/* Commitments Section */}
          <View style={styles.commitmentsSection}>
            <Text style={styles.sectionLabel}>NOS ENGAGEMENTS</Text>

            <View style={styles.commitmentCard}>
              <View style={styles.commitmentIconContainer}>
                <MapPin
                  size={ICON_SIZE}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.commitmentContent}>
                <Text style={styles.commitmentTitle}>Produits 100% locaux</Text>
                <Text style={styles.commitmentText}>
                  Cultivés à Batilly-en-Puisaye, à moins de 5km de votre point de
                  retrait. Circuit ultra-court garanti.
                </Text>
              </View>
            </View>

            <View style={styles.commitmentCard}>
              <View style={styles.commitmentIconContainer}>
                <Leaf
                  size={ICON_SIZE}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.commitmentContent}>
                <Text style={styles.commitmentTitle}>Agriculture biologique</Text>
                <Text style={styles.commitmentText}>
                  Sans pesticides ni produits chimiques. Des légumes sains cultivés
                  dans le respect de la terre.
                </Text>
              </View>
            </View>

            <View style={styles.commitmentCard}>
              <View style={styles.commitmentIconContainer}>
                <CalendarDays
                  size={ICON_SIZE}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.commitmentContent}>
                <Text style={styles.commitmentTitle}>Vente hebdomadaire</Text>
                <Text style={styles.commitmentText}>
                  Boutique ouverte une fois par semaine pour garantir la fraîcheur
                  optimale de vos produits.
                </Text>
              </View>
            </View>
          </View>

          {/* About Link */}
          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => router.push('/about')}
            activeOpacity={0.8}
          >
            <View style={styles.aboutButtonContent}>
              <Info
                size={ICON_SIZE_SM}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.sage}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.aboutButtonText}>En savoir plus sur la ferme</Text>
            </View>
            <ArrowRight
              size={ICON_SIZE_SM}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </TouchableOpacity>

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
  // Hero Banner
  heroBanner: {
    width: '100%',
  },
  heroGradient: {
    flex: 1,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.offWhite,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.offWhite,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.offWhite,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  cycleInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(253, 253, 251, 0.2)',
  },
  cycleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  cycleInfoText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.offWhite,
  },
  cycleInfoDates: {
    fontSize: 13,
    color: COLORS.offWhite,
    opacity: 0.8,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkGreen,
    letterSpacing: 1,
  },
  // Content
  content: {
    marginTop: -SPACING.lg,
    paddingTop: SPACING.xl,
  },
  // Welcome Section
  welcomeSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.sm,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  welcomeDescription: {
    fontSize: 16,
    color: COLORS.gray,
    lineHeight: 26,
  },
  // Commitments Section
  commitmentsSection: {
    marginBottom: SPACING.lg,
  },
  commitmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  commitmentIconContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  commitmentContent: {
    flex: 1,
  },
  commitmentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  commitmentText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
  // About Button
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  aboutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  aboutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.sage,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
