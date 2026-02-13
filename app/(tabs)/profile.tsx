/**
 * Profile Screen
 *
 * Écran de profil utilisateur avec design premium Gart
 * US-5.5: Consultation du profil
 * US-5.6: Modification du profil
 * US-5.7: Historique des commandes
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  UserCircle,
  Package,
  Clock,
  Zap,
  Heart,
  ClipboardList,
  Pencil,
  LogOut,
  ChevronRight,
  Sprout,
  Mail,
  Phone,
  MapPin,
  User,
  Info,
  Leaf,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useFavoritesStore } from '../../store/favoritesStore';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const ICON_SIZE_SM = 18;
const ICON_SIZE_MD = 20;
const ICON_SIZE_LG = 24;
const STROKE_WIDTH = 1.5;

// Aerial field image
const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const { getFavoritesCount } = useFavoritesStore();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const favoritesCount = getFavoritesCount();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [postalCode, setPostalCode] = useState(profile?.postal_code || '');

  const heroHeight = height * 0.28;
  const contentWidth = width * 0.9;
  // Minimum 20px padding below safe area for premium spacing
  const heroTopPadding = insets.top + 20;

  /**
   * Sauvegarder les modifications du profil
   */
  const handleSave = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        address,
        city,
        postal_code: postalCode,
      });
      setEditing(false);
    } catch (error) {
      // Les erreurs sont gérées dans le contexte
    }
  };

  /**
   * Annuler les modifications
   */
  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setCity(profile?.city || '');
    setPostalCode(profile?.postal_code || '');
    setEditing(false);
  };

  /**
   * Se déconnecter
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Les erreurs sont gérées dans le contexte
    }
  };

  // Si pas connecté, afficher l'écran de connexion premium
  if (!user) {
    return (
      <View style={styles.container}>
        {/* Hero Header */}
        <ImageBackground
          source={AERIAL_FIELD_IMAGE}
          style={[styles.heroBackground, { height: heroHeight }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(20, 50, 33, 0.4)', COLORS.offWhite]}
            locations={[0, 0.6, 1]}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingTop: heroTopPadding }]}>
              <View style={styles.heroSpacer} />
              <View style={styles.heroCenter}>
                <View style={styles.heroLogoCircle}>
                  <Sprout
                    size={40}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.darkGreen}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.notAuthContent, { width: contentWidth }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notAuthIconContainer}>
            <View style={styles.notAuthIconOuter}>
              <View style={styles.notAuthIconInner}>
                <UserCircle
                  size={56}
                  strokeWidth={1}
                  color={COLORS.sage}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
            </View>
          </View>

          <Text style={styles.notAuthTitle}>Créez votre compte</Text>
          <Text style={styles.notAuthText}>
            Connectez-vous pour accéder à votre profil, suivre vos commandes et
            gérer vos informations.
          </Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/auth')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Se connecter / S'inscrire</Text>
          </TouchableOpacity>

          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsLabel}>AVANTAGES DU COMPTE</Text>

            <View style={styles.benefitRow}>
              <View style={styles.benefitIconContainer}>
                <Package
                  size={ICON_SIZE_SM}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.darkGreen}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Suivi en temps réel</Text>
                <Text style={styles.benefitText}>
                  Suivez vos commandes à chaque étape
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.benefitIconContainer}>
                <Clock
                  size={ICON_SIZE_SM}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.darkGreen}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Historique complet</Text>
                <Text style={styles.benefitText}>
                  Accédez à toutes vos commandes passées
                </Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.benefitIconContainer}>
                <Zap
                  size={ICON_SIZE_SM}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.darkGreen}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Paiement rapide</Text>
                <Text style={styles.benefitText}>
                  Vos informations pré-remplies
                </Text>
              </View>
            </View>

            <View style={[styles.benefitRow, { marginBottom: 0 }]}>
              <View style={styles.benefitIconContainer}>
                <Heart
                  size={ICON_SIZE_SM}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.darkGreen}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>Favoris</Text>
                <Text style={styles.benefitText}>
                  Sauvegardez vos produits préférés
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    );
  }

  // Si connecté, afficher le profil premium
  return (
    <View style={styles.container}>
      {/* Hero Header with Avatar */}
      <ImageBackground
        source={AERIAL_FIELD_IMAGE}
        style={[styles.heroBackground, { height: heroHeight }]}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(20, 50, 33, 0.4)', COLORS.offWhite]}
          locations={[0, 0.6, 1]}
          style={styles.heroGradient}
        >
          <View style={[styles.heroContent, { paddingTop: heroTopPadding }]}>
            <View style={styles.heroSpacer} />
            <View style={styles.heroCenter}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
              </View>
              <Text style={styles.userName}>{profile?.full_name || 'Utilisateur'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.profileContent, { width: contentWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <ClipboardList
                size={ICON_SIZE_MD}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.sage}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
            </View>
            {!editing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Pencil
                  size={14}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            // Edit Mode
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet</Text>
                <View style={styles.inputContainer}>
                  <User
                    size={ICON_SIZE_SM}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Votre nom"
                    placeholderTextColor={COLORS.sage}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <View style={styles.inputContainer}>
                  <Phone
                    size={ICON_SIZE_SM}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="06 XX XX XX XX"
                    placeholderTextColor={COLORS.sage}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse</Text>
                <View style={styles.inputContainer}>
                  <MapPin
                    size={ICON_SIZE_SM}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Numéro et nom de rue"
                    placeholderTextColor={COLORS.sage}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.inputLabel}>Ville</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, { paddingLeft: SPACING.md }]}
                      value={city}
                      onChangeText={setCity}
                      placeholder="Ville"
                      placeholderTextColor={COLORS.sage}
                    />
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.md }]}>
                  <Text style={styles.inputLabel}>Code postal</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, { paddingLeft: SPACING.md }]}
                      value={postalCode}
                      onChangeText={setPostalCode}
                      placeholder="89520"
                      placeholderTextColor={COLORS.sage}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelEditButton}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelEditButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.offWhite} />
                  ) : (
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // View Mode
            <View style={styles.infoCard}>
              <InfoRow
                icon={User}
                label="Nom"
                value={profile?.full_name || 'Non renseigné'}
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value={user.email || ''}
              />
              <InfoRow
                icon={Phone}
                label="Téléphone"
                value={profile?.phone || 'Non renseigné'}
              />
              <InfoRow
                icon={MapPin}
                label="Adresse"
                value={profile?.address || 'Non renseigné'}
                isLast={!profile?.city}
              />
              {profile?.city && (
                <InfoRow
                  icon={MapPin}
                  label="Ville"
                  value={`${profile.city}${profile?.postal_code ? ` (${profile.postal_code})` : ''}`}
                  isLast
                />
              )}
            </View>
          )}
        </View>

        {/* Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Package
              size={ICON_SIZE_MD}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.sectionTitle}>MES COMMANDES</Text>
          </View>

          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.push('/orders-history')}
            activeOpacity={0.8}
          >
            <View style={styles.ordersButtonIcon}>
              <Package
                size={ICON_SIZE_LG}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.leaf}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </View>
            <View style={styles.ordersButtonContent}>
              <Text style={styles.ordersButtonTitle}>Historique des commandes</Text>
              <Text style={styles.ordersButtonSubtitle}>
                Consultez toutes vos commandes passées
              </Text>
            </View>
            <ChevronRight
              size={ICON_SIZE_LG}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </TouchableOpacity>
        </View>

        {/* Favorites Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Heart
              size={ICON_SIZE_MD}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.sectionTitle}>MES FAVORIS</Text>
          </View>

          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.push('/favorites')}
            activeOpacity={0.8}
          >
            <View style={styles.ordersButtonIcon}>
              <Heart
                size={ICON_SIZE_LG}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.error}
                fill={favoritesCount > 0 ? COLORS.error : 'transparent'}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </View>
            <View style={styles.ordersButtonContent}>
              <Text style={styles.ordersButtonTitle}>Mes produits favoris</Text>
              <Text style={styles.ordersButtonSubtitle}>
                {favoritesCount > 0
                  ? `${favoritesCount} produit${favoritesCount > 1 ? 's' : ''} sauvegardé${favoritesCount > 1 ? 's' : ''}`
                  : 'Aucun favori pour le moment'}
              </Text>
            </View>
            <ChevronRight
              size={ICON_SIZE_LG}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Info
              size={ICON_SIZE_MD}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.sectionTitle}>À PROPOS</Text>
          </View>

          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.push('/about')}
            activeOpacity={0.8}
          >
            <View style={styles.ordersButtonIcon}>
              <Leaf
                size={ICON_SIZE_LG}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.leaf}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </View>
            <View style={styles.ordersButtonContent}>
              <Text style={styles.ordersButtonTitle}>La ferme Gart</Text>
              <Text style={styles.ordersButtonSubtitle}>
                Découvrez notre histoire et nos valeurs
              </Text>
            </View>
            <ChevronRight
              size={ICON_SIZE_LG}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.leaf}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={loading}
            activeOpacity={0.7}
          >
            <LogOut
              size={ICON_SIZE_MD}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.sage}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.signOutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

/**
 * Info Row Component
 */
function InfoRow({
  icon: Icon,
  label,
  value,
  isLast = false,
}: {
  icon: any;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <View style={styles.infoRowIcon}>
        <Icon
          size={ICON_SIZE_SM}
          strokeWidth={STROKE_WIDTH}
          color={COLORS.sage}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </View>
      <View style={styles.infoRowContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  // Hero Header
  heroBackground: {
    width: '100%',
  },
  heroGradient: {
    flex: 1,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  heroSpacer: {
    flex: 1,
  },
  heroCenter: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  heroLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.offWhite,
    ...SHADOWS.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.sage,
  },
  // Scroll Content
  scrollView: {
    flex: 1,
    marginTop: -SPACING.md,
  },
  notAuthContent: {
    alignSelf: 'center',
    paddingTop: SPACING.xl,
  },
  profileContent: {
    alignSelf: 'center',
    paddingTop: SPACING.lg,
  },
  // Not Authenticated State
  notAuthIconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  notAuthIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  notAuthIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notAuthTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGreen,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  notAuthText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  signInButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  benefitsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  benefitsLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
    marginBottom: SPACING.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGreen,
    marginBottom: 2,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.sage,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  editButtonText: {
    fontSize: 13,
    color: COLORS.leaf,
    fontWeight: '600',
  },
  // Info Card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderCream,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoRowIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  infoRowContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.sage,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.darkGreen,
  },
  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: 15,
    color: COLORS.darkGreen,
  },
  inputRow: {
    flexDirection: 'row',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelEditButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    alignItems: 'center',
  },
  cancelEditButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.sage,
  },
  saveButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.darkGreen,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
  // Orders Button
  ordersButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  ordersButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  ordersButtonContent: {
    flex: 1,
  },
  ordersButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  ordersButtonSubtitle: {
    fontSize: 13,
    color: COLORS.sage,
  },
  // Sign Out
  signOutButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.sage,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
