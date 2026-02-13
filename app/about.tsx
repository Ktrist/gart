/**
 * About Screen
 *
 * Information about the farm, mission, and contact details
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Heart,
  Leaf,
  Sun,
  Droplets,
  Users,
  Award,
  Clock,
} from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { haptics } from '../utils/haptics';

// Farm field image
const FARM_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

const STROKE_WIDTH = 1.5;

interface InfoCardProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

function InfoCard({ icon: Icon, title, description }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>
        <Icon
          size={24}
          strokeWidth={STROKE_WIDTH}
          color={COLORS.leaf}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>
    </View>
  );
}

interface ContactButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  onPress: () => void;
}

function ContactButton({ icon: Icon, label, value, onPress }: ContactButtonProps) {
  return (
    <TouchableOpacity
      style={styles.contactButton}
      onPress={() => {
        haptics.light();
        onPress();
      }}
      activeOpacity={0.8}
    >
      <View style={styles.contactIconContainer}>
        <Icon
          size={20}
          strokeWidth={STROKE_WIDTH}
          color={COLORS.offWhite}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <ChevronLeft
        size={16}
        strokeWidth={STROKE_WIDTH}
        color={COLORS.sage}
        style={{ transform: [{ rotate: '180deg' }] }}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </TouchableOpacity>
  );
}

export default function AboutScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = height * 0.28;
  const contentWidth = width * 0.9;
  const heroTopPadding = insets.top + 20;

  const handleCall = () => {
    Linking.openURL('tel:+33386000000');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:contact@gart.fr');
  };

  const handleWebsite = () => {
    Linking.openURL('https://gart.fr');
  };

  const handleMaps = () => {
    Linking.openURL('https://maps.google.com/?q=Batilly-en-Puisaye,France');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <ImageBackground
          source={FARM_IMAGE}
          style={[styles.heroContainer, { height: heroHeight }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(20, 50, 33, 0.4)',
              'rgba(45, 90, 60, 0.95)',
            ]}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingTop: heroTopPadding }]}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  haptics.light();
                  router.back();
                }}
              >
                <ChevronLeft
                  size={24}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.offWhite}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </TouchableOpacity>

              {/* Title */}
              <View style={styles.heroTitleContainer}>
                <Leaf
                  size={28}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.offWhite}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <Text style={styles.heroTitle}>Gart</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                Maraîchage biologique en Puisaye
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Content */}
        <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
          {/* Mission Statement */}
          <View style={styles.missionCard}>
            <View style={styles.missionIconContainer}>
              <Heart
                size={32}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.leaf}
                fill={COLORS.leaf}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </View>
            <Text style={styles.missionTitle}>Notre Mission</Text>
            <Text style={styles.missionText}>
              Cultiver des légumes sains et savoureux dans le respect de la terre
              et des saisons. Nous croyons en une agriculture locale, durable et
              accessible à tous.
            </Text>
          </View>

          {/* Values */}
          <Text style={styles.sectionTitle}>NOS VALEURS</Text>

          <InfoCard
            icon={Sun}
            title="Agriculture Biologique"
            description="Certification AB - Aucun pesticide ni engrais chimique. Nous travaillons avec la nature, pas contre elle."
          />

          <InfoCard
            icon={Droplets}
            title="Respect de l'Environnement"
            description="Irrigation raisonnée, compostage, biodiversité encouragée. Chaque geste compte pour préserver notre terre."
          />

          <InfoCard
            icon={Users}
            title="Circuit Court"
            description="De notre champ à votre assiette sans intermédiaire. Fraîcheur garantie et juste rémunération du producteur."
          />

          <InfoCard
            icon={Award}
            title="Qualité & Goût"
            description="Variétés anciennes et savoureuses, récoltées à maturité. Le vrai goût des légumes comme autrefois."
          />

          {/* Opening Hours */}
          <Text style={styles.sectionTitle}>HORAIRES</Text>

          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Clock
                size={20}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.leaf}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.hoursTitle}>Retrait à la ferme</Text>
            </View>
            <View style={styles.hoursList}>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursDay}>Mercredi</Text>
                <Text style={styles.hoursTime}>16h - 19h</Text>
              </View>
              <View style={styles.hoursItem}>
                <Text style={styles.hoursDay}>Samedi</Text>
                <Text style={styles.hoursTime}>9h - 12h</Text>
              </View>
            </View>
          </View>

          {/* Contact */}
          <Text style={styles.sectionTitle}>CONTACT</Text>

          <ContactButton
            icon={MapPin}
            label="Adresse"
            value="Batilly-en-Puisaye, 45420"
            onPress={handleMaps}
          />

          <ContactButton
            icon={Phone}
            label="Téléphone"
            value="03 86 00 00 00"
            onPress={handleCall}
          />

          <ContactButton
            icon={Mail}
            label="Email"
            value="contact@gart.fr"
            onPress={handleEmail}
          />

          <ContactButton
            icon={Globe}
            label="Site web"
            value="www.gart.fr"
            onPress={handleWebsite}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Merci de soutenir l'agriculture locale !
            </Text>
            <Text style={styles.footerEmoji}>🥕🥬🍅</Text>
            <Text style={styles.versionText}>
              Version {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>

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
  // Hero Section
  heroContainer: {
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.offWhite,
    opacity: 0.9,
  },
  // Content
  content: {
    marginTop: -SPACING.lg,
    paddingTop: SPACING.lg,
  },
  // Mission Card
  missionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.md,
  },
  missionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.sm,
  },
  missionText: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Section Title
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  // Info Card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  infoDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  // Hours Card
  hoursCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  hoursList: {
    gap: SPACING.sm,
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  hoursDay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  // Contact Button
  contactButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.leaf,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: COLORS.sage,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.sage,
    marginBottom: SPACING.sm,
  },
  footerEmoji: {
    fontSize: 24,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.borderCream,
    marginTop: SPACING.lg,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
