/**
 * Favorites Screen
 *
 * Shows the user's saved favorite products
 * Quick add-to-cart functionality
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Heart,
  ShoppingBag,
  ChevronLeft,
  Trash2,
  Lock,
  Salad,
  Carrot,
  Apple,
  Leaf,
  Flower2,
  Cherry,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useFavoritesStore } from '../store/favoritesStore';
import { useShopStore } from '../store/shopStore';
import { LoadingScreen, EmptyState } from '../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { haptics } from '../utils/haptics';

// Aerial field image for hero
const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

const ICON_SIZE = 24;
const STROKE_WIDTH = 1.5;

// Map categories to icons
const getCategoryIcon = (category: string | undefined) => {
  const categoryLower = category?.toLowerCase() || '';

  if (categoryLower.includes('racine') || categoryLower.includes('carotte') || categoryLower.includes('navet')) {
    return Carrot;
  }
  if (categoryLower.includes('fruit')) {
    return Apple;
  }
  if (categoryLower.includes('salade') || categoryLower.includes('feuille')) {
    return Salad;
  }
  if (categoryLower.includes('aromate') || categoryLower.includes('herbe')) {
    return Leaf;
  }
  if (categoryLower.includes('fleur') || categoryLower.includes('courge')) {
    return Flower2;
  }
  if (categoryLower.includes('tomate') || categoryLower.includes('baie')) {
    return Cherry;
  }

  return Salad; // Default icon
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = height * 0.18;
  const contentWidth = width * 0.9;
  const heroTopPadding = insets.top + 20;

  const {
    favorites,
    isLoading,
    fetchFavorites,
    toggleFavorite,
  } = useFavoritesStore();
  const { addToCart, products } = useShopStore();

  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (productId: string) => {
    haptics.light();
    await toggleFavorite(productId);
  };

  const handleAddToCart = (favorite: typeof favorites[0]) => {
    // Find the product in the shop store
    const product = products.find(
      (p) => p.uuid === favorite.product_id || p.id.toString() === favorite.product_id
    );

    if (product) {
      const success = addToCart(product, 1);
      if (success) {
        haptics.success();
        setAddingToCart(favorite.product_id);
        setTimeout(() => setAddingToCart(null), 1500);
      }
    }
  };

  // Not logged in
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: heroTopPadding }]}>
        <EmptyState
          icon={Lock}
          title="Connexion requise"
          description="Connectez-vous pour accéder à vos produits favoris"
          actionLabel="Se connecter"
          onAction={() => router.push('/auth')}
          secondaryActionLabel="Retour"
          onSecondaryAction={() => router.back()}
        />
      </View>
    );
  }

  // Loading
  if (isLoading && favorites.length === 0) {
    return <LoadingScreen message="Chargement des favoris..." />;
  }

  // Empty favorites
  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: heroTopPadding }]}>
        <EmptyState
          icon={Heart}
          title="Aucun favori"
          description="Vous n'avez pas encore de produits favoris. Parcourez la boutique et appuyez sur le coeur pour sauvegarder vos produits préférés !"
          actionLabel="Voir la boutique"
          onAction={() => router.replace('/(tabs)/shop')}
          secondaryActionLabel="Retour"
          onSecondaryAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Header */}
        <ImageBackground
          source={AERIAL_FIELD_IMAGE}
          style={[styles.heroContainer, { height: heroHeight }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(20, 50, 33, 0.3)',
              'rgba(45, 90, 60, 0.9)',
            ]}
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

              {/* Title */}
              <View style={styles.heroTitleContainer}>
                <Heart
                  size={24}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.offWhite}
                  fill={COLORS.offWhite}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <Text style={styles.heroTitle}>Mes favoris</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                {favorites.length} produit{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Content */}
        <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
          {/* Favorites List */}
          {favorites.map((favorite) => {
            const product = favorite.products;
            if (!product) return null;

            const Icon = getCategoryIcon(product.categories?.name);
            const isAdding = addingToCart === favorite.product_id;
            const isAvailable = product.is_available && product.stock > 0;

            return (
              <View key={favorite.id} style={styles.favoriteCard}>
                {/* Product Icon */}
                <View style={styles.productIconContainer}>
                  <View style={styles.productIconBg}>
                    {product.image_url ? (
                      <Text style={styles.productEmoji}>{product.image_url}</Text>
                    ) : (
                      <Icon
                        size={32}
                        strokeWidth={STROKE_WIDTH}
                        color={COLORS.leaf}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    )}
                  </View>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  {product.categories?.name && (
                    <Text style={styles.productCategory}>
                      {product.categories.name}
                    </Text>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>
                      {product.price.toFixed(2)} €
                    </Text>
                    <Text style={styles.productUnit}>/ {product.unit}</Text>
                  </View>

                  {/* Stock Status */}
                  {!isAvailable ? (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>RUPTURE</Text>
                    </View>
                  ) : product.stock <= 5 ? (
                    <View style={styles.limitedStockBadge}>
                      <Text style={styles.limitedStockText}>
                        Plus que {product.stock} !
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                  {/* Add to Cart Button */}
                  {isAvailable && (
                    <TouchableOpacity
                      style={[
                        styles.addToCartButton,
                        isAdding && styles.addToCartButtonSuccess,
                      ]}
                      onPress={() => handleAddToCart(favorite)}
                      activeOpacity={0.8}
                    >
                      <ShoppingBag
                        size={16}
                        strokeWidth={STROKE_WIDTH}
                        color={COLORS.offWhite}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <Text style={styles.addToCartText}>
                        {isAdding ? 'Ajouté !' : 'Ajouter'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Remove Button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFavorite(favorite.product_id)}
                    activeOpacity={0.7}
                  >
                    <Trash2
                      size={18}
                      strokeWidth={STROKE_WIDTH}
                      color={COLORS.sage}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

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
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.offWhite,
    opacity: 0.9,
  },
  // Content
  content: {
    marginTop: -SPACING.md,
    paddingTop: SPACING.lg,
  },
  // Favorite Card
  favoriteCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  productIconContainer: {
    marginRight: SPACING.md,
  },
  productIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: {
    fontSize: 28,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.sage,
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  productUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.sage,
    marginLeft: 2,
  },
  unavailableBadge: {
    backgroundColor: COLORS.errorLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  unavailableText: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  limitedStockBadge: {
    backgroundColor: COLORS.warningLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  limitedStockText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: '600',
  },
  // Actions
  actionsContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addToCartButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  addToCartButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  addToCartText: {
    color: COLORS.offWhite,
    fontWeight: '700',
    fontSize: 12,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
