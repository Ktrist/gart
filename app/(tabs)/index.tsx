import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useShopStore } from '../../store/shopStore';
import { supabaseSalesCycleService } from '../../services/supabaseSalesCycleService';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  beigeDark: '#E8E8CD',
  white: '#FFFFFF',
  red: '#DC2626',
};

export default function HomeScreen() {
  const router = useRouter();
  const { shopStatus, isLoading, fetchShopStatus } = useShopStore();

  useEffect(() => {
    fetchShopStatus();
  }, []);

  if (isLoading && !shopStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Sales Cycle Status Banner */}
      <View
        style={[
          styles.banner,
          { backgroundColor: shopStatus?.isOpen ? COLORS.primary : COLORS.red },
        ]}
      >
        <Text style={styles.bannerTitle}>
          {shopStatus?.isOpen ? '✅ VENTE OUVERTE' : '🔒 VENTE FERMÉE'}
        </Text>
        <Text style={styles.bannerText}>{shopStatus?.message}</Text>

        {/* Informations supplémentaires sur le cycle */}
        {shopStatus?.isOpen && shopStatus.currentCycle && (
          <View style={styles.cycleInfo}>
            <Text style={styles.cycleInfoText}>
              📅 {shopStatus.currentCycle.name}
            </Text>
            <Text style={styles.cycleInfoText}>
              Du {supabaseSalesCycleService.formatDateShort(shopStatus.currentCycle.openingDate)} au{' '}
              {supabaseSalesCycleService.formatDateShort(shopStatus.currentCycle.closingDate)}
            </Text>
          </View>
        )}

        {/* Informations sur le prochain cycle si fermé */}
        {!shopStatus?.isOpen && shopStatus?.nextCycle && (
          <View style={styles.cycleInfo}>
            <Text style={styles.cycleInfoText}>
              ⏳ Dans {shopStatus.daysUntilNextOpening}{' '}
              {shopStatus.daysUntilNextOpening === 1 ? 'jour' : 'jours'}
            </Text>
            <Text style={styles.cycleInfoText}>
              📅 {shopStatus.nextCycle.name}
            </Text>
          </View>
        )}
      </View>

      {/* Welcome Section */}
      <View style={styles.content}>
        <Text style={styles.title}>🌱 Gart - Le jardin du bon</Text>
        <Text style={styles.description}>
          Bienvenue dans votre AMAP locale ! Découvrez nos légumes frais et de saison, cultivés avec passion et respect de l'environnement.
        </Text>

        {/* Info Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚜 Produits locaux</Text>
            <Text style={styles.cardText}>
              Tous nos légumes sont cultivés à Batilly-en-puisaye, à moins de 5km de votre point de retrait.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌿 Agriculture biologique</Text>
            <Text style={styles.cardText}>
              Sans pesticides ni produits chimiques, pour votre santé et celle de la planète.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 Cycle de vente</Text>
            <Text style={styles.cardText}>
              Les ventes sont ouvertes une fois par semaine. Passez commande pendant la période d'ouverture.
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        {shopStatus?.isOpen && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/shop')}
          >
            <Text style={styles.ctaButtonText}>🛒 Voir les produits disponibles</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.primary,
    fontSize: 16,
  },
  banner: {
    padding: 24,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  bannerText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 16,
  },
  cycleInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  cycleInfoText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 4,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  ctaButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
