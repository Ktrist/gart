/**
 * Authentication Screen
 *
 * Écran de connexion et d'inscription avec design premium Gart
 * US-5.1: Inscription
 * US-5.2: Connexion
 * US-5.4: Récupération de mot de passe
 */

import { useState } from 'react';
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
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sprout, ChevronLeft, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const ICON_SIZE = 20;
const STROKE_WIDTH = 1.5;

// Placeholder aerial field image - replace with actual asset
const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, resetPassword, loading } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Minimum 20px padding below safe area for premium spacing
  const heroTopPadding = insets.top + 20;

  // Calculate header height (35% of screen)
  const headerHeight = height * 0.35;

  /**
   * Valider les champs du formulaire
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email
    if (!email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }

    // Mode reset : seulement email requis
    if (mode === 'reset') {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Mot de passe
    if (!password) {
      newErrors.password = 'Mot de passe requis';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    // Mode signup : validation supplémentaire
    if (mode === 'signup') {
      if (!fullName) {
        newErrors.fullName = 'Nom requis';
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Gérer la soumission du formulaire
   */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.back();
      } else if (mode === 'signup') {
        await signUp(email, password, fullName);
        // Après signup, rester sur l'écran pour que l'utilisateur confirme son email
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMode('login');
      }
    } catch (error) {
      // Les erreurs sont gérées dans le contexte Auth
    }
  };

  /**
   * Changer de mode (login/signup/reset)
   */
  const switchMode = (newMode: 'login' | 'signup' | 'reset') => {
    setMode(newMode);
    setErrors({});
  };

  return (
    <View style={styles.container}>
      {/* Hero Header with Aerial Field Background */}
      <ImageBackground
        source={AERIAL_FIELD_IMAGE}
        style={[styles.heroBackground, { height: headerHeight }]}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(20, 50, 33, 0.3)', COLORS.offWhite]}
          locations={[0, 0.6, 1]}
          style={styles.heroGradient}
        >
          <View style={[styles.heroContent, { paddingTop: heroTopPadding }]}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.heroBackButton}
              onPress={() => router.back()}
            >
              <ChevronLeft
                size={24}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.offWhite}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </TouchableOpacity>

            {/* Centered Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Sprout
                  size={48}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.darkGreen}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </View>
              <Text style={styles.logoTitle}>Gart</Text>
              <Text style={styles.logoSubtitle}>Le jardin du bon</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { width: width * 0.9, alignSelf: 'center' },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tabs Card */}
          {mode !== 'reset' && (
            <View style={styles.tabsCard}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, mode === 'login' && styles.tabActive]}
                  onPress={() => switchMode('login')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === 'login' && styles.tabTextActive,
                    ]}
                  >
                    Connexion
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, mode === 'signup' && styles.tabActive]}
                  onPress={() => switchMode('signup')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === 'signup' && styles.tabTextActive,
                    ]}
                  >
                    Inscription
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mode Reset Password Header */}
          {mode === 'reset' && (
            <View style={styles.resetHeader}>
              <TouchableOpacity
                style={styles.resetBackButton}
                onPress={() => switchMode('login')}
              >
                <ChevronLeft
                  size={20}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.leaf}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <Text style={styles.resetBackText}>Retour</Text>
              </TouchableOpacity>
              <Text style={styles.resetTitle}>Mot de passe oublié</Text>
              <Text style={styles.resetDescription}>
                Entrez votre email pour recevoir un lien de réinitialisation
              </Text>
            </View>
          )}

          {/* Google Sign In Button */}
          {mode !== 'reset' && (
            <View style={styles.socialSection}>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={async () => {
                  try {
                    await signInWithGoogle();
                    router.back();
                  } catch (error) {
                    // Error handled in context
                  }
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>
                  Continuer avec Google
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom complet</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.fullName && styles.inputContainerError,
                  ]}
                >
                  <User
                    size={ICON_SIZE}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Jean Dupont"
                    placeholderTextColor={COLORS.sage}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email && styles.inputContainerError,
                ]}
              >
                <Mail
                  size={ICON_SIZE}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.sage}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor={COLORS.sage}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password (not in reset mode) */}
            {mode !== 'reset' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.password && styles.inputContainerError,
                  ]}
                >
                  <Lock
                    size={ICON_SIZE}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.sage}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
            )}

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.confirmPassword && styles.inputContainerError,
                  ]}
                >
                  <Lock
                    size={ICON_SIZE}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.sage}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}

            {/* Forgot Password Link (login only) */}
            {mode === 'login' && (
              <TouchableOpacity
                onPress={() => switchMode('reset')}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.offWhite} />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login'
                  ? 'Se connecter'
                  : mode === 'signup'
                  ? 'Créer mon compte'
                  : 'Envoyer le lien'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  // Hero Header Styles
  heroBackground: {
    width: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  heroBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  logoContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.darkGreen,
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.sage,
    marginTop: SPACING.xs,
  },
  // Keyboard & Scroll
  keyboardView: {
    flex: 1,
    marginTop: -SPACING.xl,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  // Tabs Card
  tabsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xl,
  },
  tabActive: {
    backgroundColor: COLORS.darkGreen,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.sage,
  },
  tabTextActive: {
    color: COLORS.offWhite,
  },
  // Reset Header
  resetHeader: {
    marginBottom: SPACING.lg,
  },
  resetBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resetBackText: {
    fontSize: 16,
    color: COLORS.leaf,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  resetTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.sm,
  },
  resetDescription: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },
  // Social Section
  socialSection: {
    marginBottom: SPACING.sm,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    borderRadius: 25,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.sm,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderCream,
  },
  dividerText: {
    marginHorizontal: SPACING.lg,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.sage,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 12,
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
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: 16,
    color: COLORS.darkGreen,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.sm,
  },
  forgotPassword: {
    color: COLORS.leaf,
    fontSize: 14,
    fontWeight: '600',
  },
  // Submit Button
  submitButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.lg + 2,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.sage,
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Cancel Button
  cancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.sage,
    fontSize: 15,
    fontWeight: '600',
  },
  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
