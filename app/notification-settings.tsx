/**
 * Notification Settings Screen
 *
 * Allows users to manage their push notification preferences.
 * US-6: Notification configuration by category.
 */

import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ShoppingBag,
  Heart,
  Package,
  Tag,
  Lock,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotificationStore } from '../store/notificationStore';
import { EmptyState } from '../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

const STROKE_WIDTH = 1.5;

const PREF_ITEMS = [
  {
    key: 'cycles_enabled' as const,
    icon: ShoppingBag,
    title: 'Cycles de vente',
    description: 'Soyez alert\u00E9 quand la boutique ouvre ou ferme bient\u00F4t',
  },
  {
    key: 'favorites_enabled' as const,
    icon: Heart,
    title: 'Produits favoris',
    description: 'Notifications quand vos favoris sont de retour ou en stock limit\u00E9',
  },
  {
    key: 'orders_enabled' as const,
    icon: Package,
    title: 'Commandes',
    description: 'Suivi de commande : pr\u00EAte, rappel de retrait',
  },
  {
    key: 'promotions_enabled' as const,
    icon: Tag,
    title: 'Promotions',
    description: 'Offres sp\u00E9ciales et nouveaut\u00E9s de la ferme',
  },
];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = height * 0.18;
  const contentWidth = width * 0.9;
  const heroTopPadding = insets.top + 20;

  const {
    preferences,
    isRegistered,
    isLoading,
    register,
    loadPreferences,
    updatePreference,
  } = useNotificationStore();

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: heroTopPadding }]}>
        <EmptyState
          icon={Lock}
          title="Connexion requise"
          description="Connectez-vous pour g\u00E9rer vos notifications"
          actionLabel="Se connecter"
          onAction={() => router.push('/auth')}
          secondaryActionLabel="Retour"
          onSecondaryAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <ImageBackground
          source={AERIAL_FIELD_IMAGE}
          style={[styles.heroContainer, { height: heroHeight }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(20, 50, 33, 0.3)', 'rgba(45, 90, 60, 0.9)']}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingTop: heroTopPadding }]}>
              <TouchableOpacity style={styles.heroBackButton} onPress={() => router.back()}>
                <ChevronLeft size={24} strokeWidth={STROKE_WIDTH} color={COLORS.offWhite} />
              </TouchableOpacity>
              <View style={styles.heroTitleContainer}>
                <Bell size={24} strokeWidth={STROKE_WIDTH} color={COLORS.offWhite} />
                <Text style={styles.heroTitle}>Notifications</Text>
              </View>
              <Text style={styles.heroSubtitle}>G\u00E9rez vos alertes</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
          {/* Enable Notifications Banner */}
          {!isRegistered && (
            <TouchableOpacity style={styles.enableBanner} onPress={register} activeOpacity={0.8}>
              <Bell size={20} strokeWidth={STROKE_WIDTH} color={COLORS.offWhite} />
              <View style={styles.enableBannerText}>
                <Text style={styles.enableTitle}>Activer les notifications</Text>
                <Text style={styles.enableDesc}>
                  Recevez des alertes pour vos commandes et produits favoris
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Preferences */}
          <View style={styles.prefsCard}>
            <Text style={styles.sectionTitle}>CAT\u00C9GORIES</Text>
            {PREF_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <View
                  key={item.key}
                  style={[
                    styles.prefRow,
                    index < PREF_ITEMS.length - 1 && styles.prefRowBorder,
                  ]}
                >
                  <View style={styles.prefIcon}>
                    <Icon size={20} strokeWidth={STROKE_WIDTH} color={COLORS.leaf} />
                  </View>
                  <View style={styles.prefInfo}>
                    <Text style={styles.prefTitle}>{item.title}</Text>
                    <Text style={styles.prefDesc}>{item.description}</Text>
                  </View>
                  <Switch
                    value={preferences[item.key]}
                    onValueChange={(value) => updatePreference(item.key, value)}
                    trackColor={{ false: COLORS.borderCream, true: COLORS.leaf }}
                    thumbColor={COLORS.white}
                    disabled={isLoading}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  scrollView: { flex: 1 },
  heroContainer: { width: '100%' },
  heroGradient: { flex: 1 },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  heroTitle: { fontSize: 26, fontWeight: '700', color: COLORS.offWhite },
  heroSubtitle: { fontSize: 14, color: COLORS.offWhite, opacity: 0.9 },
  content: { marginTop: -SPACING.md, paddingTop: SPACING.lg },
  // Enable Banner
  enableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGreen,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  enableBannerText: { flex: 1 },
  enableTitle: { fontSize: 16, fontWeight: '700', color: COLORS.offWhite, marginBottom: 4 },
  enableDesc: { fontSize: 13, color: COLORS.offWhite, opacity: 0.85 },
  // Preferences Card
  prefsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.lg,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  prefRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderCream,
  },
  prefIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  prefInfo: { flex: 1, marginRight: SPACING.md },
  prefTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkGreen, marginBottom: 2 },
  prefDesc: { fontSize: 12, color: COLORS.sage, lineHeight: 16 },
  bottomSpacer: { height: SPACING.xxl },
});
