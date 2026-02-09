/**
 * Profile Screen
 *
 * Écran de profil utilisateur avec authentification
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile, loading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [postalCode, setPostalCode] = useState(profile?.postal_code || '');

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

  // Si pas connecté, afficher l'écran de connexion
  if (!user) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.notAuthenticatedContainer}>
            <Text style={styles.notAuthenticatedIcon}>👤</Text>
            <Text style={styles.notAuthenticatedTitle}>
              Créez votre compte
            </Text>
            <Text style={styles.notAuthenticatedText}>
              Connectez-vous pour accéder à votre profil, suivre vos commandes
              et gérer vos informations.
            </Text>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.signInButtonText}>
                Se connecter / S'inscrire
              </Text>
            </TouchableOpacity>

            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>
                Avantages du compte :
              </Text>
              <View style={styles.benefitRow}>
                <Text style={styles.benefitIcon}>📦</Text>
                <Text style={styles.benefitText}>
                  Suivi de vos commandes en temps réel
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Text style={styles.benefitIcon}>📜</Text>
                <Text style={styles.benefitText}>
                  Accès à l'historique complet
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Text style={styles.benefitIcon}>⚡</Text>
                <Text style={styles.benefitText}>
                  Paiement plus rapide
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Text style={styles.benefitIcon}>❤️</Text>
                <Text style={styles.benefitText}>
                  Produits favoris (bientôt)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Si connecté, afficher le profil
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.full_name || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Informations personnelles</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editButton}>✏️ Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            // Edit Mode
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Votre nom"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="06 XX XX XX XX"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adresse</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Numéro et nom de rue"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.label}>Ville</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Ville"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.label}>Code postal</Text>
                  <TextInput
                    style={styles.input}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="89520"
                    keyboardType="number-pad"
                  />
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
                  style={[
                    styles.saveButton,
                    loading && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // View Mode
            <View style={styles.infoCard}>
              <InfoRow label="Nom" value={profile?.full_name || 'Non renseigné'} />
              <InfoRow label="Email" value={user.email || ''} />
              <InfoRow label="Téléphone" value={profile?.phone || 'Non renseigné'} />
              <InfoRow label="Adresse" value={profile?.address || 'Non renseigné'} />
              <InfoRow
                label="Ville"
                value={
                  profile?.city && profile?.postal_code
                    ? `${profile.city} (${profile.postal_code})`
                    : 'Non renseigné'
                }
              />
            </View>
          )}
        </View>

        {/* Orders History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Mes commandes</Text>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => router.push('/orders-history')}
          >
            <View>
              <Text style={styles.ordersButtonTitle}>Historique des commandes</Text>
              <Text style={styles.ordersButtonSubtitle}>
                Consultez toutes vos commandes passées
              </Text>
            </View>
            <Text style={styles.ordersButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={loading}
          >
            <Text style={styles.signOutButtonText}>🚪 Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Composant pour afficher une ligne d'information
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.gray,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  editButton: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
  },
  inputGroup: {
    marginBottom: 16,
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
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelEditButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  cancelEditButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  ordersButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ordersButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  ordersButtonSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  ordersButtonArrow: {
    fontSize: 24,
    color: COLORS.primary,
  },
  signOutButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  // Not authenticated styles
  notAuthenticatedContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  notAuthenticatedIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  notAuthenticatedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  signInButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});
