/**
 * Authentication Screen
 *
 * Écran de connexion et d'inscription
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  error: '#DC2626',
};

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, resetPassword, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.title}>Gart</Text>
          <Text style={styles.subtitle}>Le jardin du bon</Text>
        </View>

        {/* Tabs */}
        {mode !== 'reset' && (
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => switchMode('login')}
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
        )}

        {/* Mode Reset Password */}
        {mode === 'reset' && (
          <View style={styles.resetHeader}>
            <TouchableOpacity onPress={() => switchMode('login')}>
              <Text style={styles.backButton}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.resetTitle}>Mot de passe oublié</Text>
            <Text style={styles.resetDescription}>
              Entrez votre email pour recevoir un lien de réinitialisation
            </Text>
          </View>
        )}

        {/* Google Sign In Button */}
        {mode !== 'reset' && (
          <View style={styles.socialButtons}>
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
            >
              <Text style={styles.googleIcon}>G</Text>
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

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name (signup only) */}
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Jean Dupont"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password (not in reset mode) */}
          {mode !== 'reset' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>
          )}

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
          )}

          {/* Forgot Password Link (login only) */}
          {mode === 'login' && (
            <TouchableOpacity onPress={() => switchMode('reset')}>
              <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
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
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  resetHeader: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 16,
  },
  resetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  resetDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#374151',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    color: COLORS.primary,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 24,
  },
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  submitButtonText: {
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
  // Social login styles
  socialButtons: {
    marginBottom: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.gray,
  },
});
