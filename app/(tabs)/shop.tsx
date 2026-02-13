/**
 * Shop Screen
 *
 * Boutique avec design premium Gart
 * Affiche les produits disponibles avec cartes améliorées
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  useWindowDimensions,
  StyleSheet,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Salad,
  Carrot,
  Apple,
  Leaf,
  Flower2,
  Cherry,
  Minus,
  Plus,
  ShoppingBag,
  Package,
  Heart,
  Search,
  X,
  ArrowUpDown,
} from 'lucide-react-native';
import { useShopStore } from '../../store/shopStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../services/api';
import { LoadingScreen, EmptyState, ProductDetailModal } from '../../components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { haptics } from '../../utils/haptics';

const STROKE_WIDTH = 1.5;
const ICON_SIZE = 32;

// Aerial field image for hero
const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

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

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

function ProductCard({ product, onPress }: ProductCardProps) {
  const { user } = useAuth();
  const addToCart = useShopStore((state) => state.addToCart);
  const getAvailableStock = useShopStore((state) => state.getAvailableStock);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const productUuid = product.uuid || product.id.toString();
  const isFav = isFavorite(productUuid);
  const availableStock = getAvailableStock(product.id);
  const isStockLimited = availableStock > 0 && availableStock <= 5;
  const isOutOfStock = availableStock === 0;

  const Icon = getCategoryIcon(product.category);

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);

    if (success) {
      haptics.success();
      setIsAdding(true);
      setQuantity(1);
      setTimeout(() => setIsAdding(false), 1500);
    }
  };

  const handleIncrease = () => {
    if (quantity < availableStock) {
      haptics.selection();
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      haptics.selection();
      setQuantity(quantity - 1);
    }
  };

  const handleToggleFavorite = () => {
    if (!user) return;
    haptics.light();
    toggleFavorite(productUuid);
  };

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        (!product.available || isOutOfStock) && styles.productCardUnavailable,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Favorite Button - Only show for logged-in users */}
      {user && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
          activeOpacity={0.7}
        >
          <Heart
            size={18}
            strokeWidth={2}
            color={isFav ? COLORS.error : COLORS.sage}
            fill={isFav ? COLORS.error : 'transparent'}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </TouchableOpacity>
      )}

      {/* Product Icon Container */}
      <View style={styles.productIconContainer}>
        <View style={styles.productIconBg}>
          {product.image_url ? (
            <Text style={styles.productEmoji}>{product.image_url}</Text>
          ) : (
            <Icon
              size={ICON_SIZE}
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
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>

        {product.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {product.price.toFixed(2)} €
          </Text>
          <Text style={styles.productUnit}>/ {product.unit}</Text>
        </View>

        {/* Stock Status */}
        <View style={styles.stockContainer}>
          {!product.available || isOutOfStock ? (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>RUPTURE</Text>
            </View>
          ) : isStockLimited ? (
            <View style={styles.limitedStockBadge}>
              <Text style={styles.limitedStockText}>
                Plus que {availableStock} !
              </Text>
            </View>
          ) : (
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>
                {availableStock} en stock
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Add to Cart Section */}
      {product.available && !isOutOfStock && (
        <View style={styles.cartSection}>
          {/* Quantity Selector */}
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={handleDecrease}
              disabled={quantity <= 1}
            >
              <Minus
                size={16}
                strokeWidth={2}
                color={quantity <= 1 ? COLORS.sage : COLORS.offWhite}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= availableStock && styles.quantityButtonDisabled,
              ]}
              onPress={handleIncrease}
              disabled={quantity >= availableStock}
            >
              <Plus
                size={16}
                strokeWidth={2}
                color={quantity >= availableStock ? COLORS.sage : COLORS.offWhite}
              />
            </TouchableOpacity>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={[
              styles.addButton,
              isAdding && styles.addButtonSuccess,
            ]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <ShoppingBag
              size={14}
              strokeWidth={STROKE_WIDTH}
              color={COLORS.offWhite}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Text style={styles.addButtonText}>
              {isAdding ? 'AJOUTÉ !' : 'AJOUTER'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const { products, shopStatus, isLoading, fetchProducts, fetchShopStatus } =
    useShopStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name'>('default');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchShopStatus()]);
    setRefreshing(false);
  };
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroHeight = height * 0.22;
  const contentWidth = width * 0.95;
  // Minimum 20px padding below safe area for premium spacing
  const heroTopPadding = insets.top + 20;

  useEffect(() => {
    fetchProducts();
    fetchShopStatus();
  }, []);

  if (isLoading && products.length === 0) {
    return <LoadingScreen message="Chargement des produits..." />;
  }

  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filter by category
  const categoryFiltered =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Filter by search query
  const searchFiltered = searchQuery.trim()
    ? categoryFiltered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryFiltered;

  // Sort products
  const sortProducts = (products: Product[]) => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const filteredProducts = sortProducts(searchFiltered);
  const availableProducts = filteredProducts.filter((p) => p.available && p.stock > 0);
  const unavailableProducts = filteredProducts.filter((p) => !p.available || p.stock === 0);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.leaf}
            colors={[COLORS.leaf]}
          />
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
              shopStatus?.isOpen
                ? 'rgba(45, 90, 60, 0.9)'
                : 'rgba(118, 141, 93, 0.9)',
            ]}
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

              {/* Title */}
              <Text style={styles.heroTitle}>Notre Sélection</Text>
              <Text style={styles.heroSubtitle}>
                Légumes frais de saison
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Content Section */}
        <View style={[styles.content, { width: contentWidth, alignSelf: 'center' }]}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search
                size={18}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.sage}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un produit..."
                placeholderTextColor={COLORS.sage}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.searchClearButton}
                >
                  <X
                    size={16}
                    strokeWidth={2}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category || 'all'}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedCategory(category || 'all')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === category && styles.filterButtonTextActive,
                  ]}
                >
                  {category === 'all' ? 'Tous' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <View style={styles.sortLabelRow}>
              <ArrowUpDown
                size={14}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.sage}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Text style={styles.sortLabel}>Trier</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortOptions}
            >
              {[
                { key: 'default', label: 'Par défaut' },
                { key: 'price_asc', label: 'Prix ↑' },
                { key: 'price_desc', label: 'Prix ↓' },
                { key: 'name', label: 'A → Z' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortButton,
                    sortBy === option.key && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(option.key as typeof sortBy)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortBy === option.key && styles.sortButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results Count - show when filtering/searching */}
          {(searchQuery || selectedCategory !== 'all') && filteredProducts.length > 0 && (
            <View style={styles.resultsCountContainer}>
              <Text style={styles.resultsCountText}>
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                {searchQuery && <Text style={styles.resultsCountQuery}> pour "{searchQuery}"</Text>}
              </Text>
              {(searchQuery || selectedCategory !== 'all') && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSortBy('default');
                  }}
                  style={styles.clearFiltersButton}
                >
                  <X size={12} strokeWidth={2} color={COLORS.sage} />
                  <Text style={styles.clearFiltersText}>Effacer</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && !isLoading && (
            <EmptyState
              icon={searchQuery ? Search : Package}
              title={searchQuery ? 'Aucun résultat' : 'Aucun produit'}
              description={
                searchQuery
                  ? `Aucun produit ne correspond à "${searchQuery}"`
                  : 'Aucun produit disponible dans cette catégorie pour le moment.'
              }
              actionLabel={searchQuery ? 'Effacer la recherche' : 'Voir tous les produits'}
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            />
          )}

          {/* Available Products */}
          {availableProducts.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>DISPONIBLES</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{availableProducts.length}</Text>
                </View>
              </View>
              <View style={styles.grid}>
                {availableProducts.map((product) => (
                  <View key={product.id} style={styles.gridItem}>
                    <ProductCard
                      product={product}
                      onPress={() => setSelectedProduct(product)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Unavailable Products */}
          {unavailableProducts.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionLabel, styles.sectionLabelMuted]}>
                  RUPTURE DE STOCK
                </Text>
                <View style={[styles.countBadge, styles.countBadgeMuted]}>
                  <Text style={[styles.countText, styles.countTextMuted]}>
                    {unavailableProducts.length}
                  </Text>
                </View>
              </View>
              <View style={styles.grid}>
                {unavailableProducts.map((product) => (
                  <View key={product.id} style={styles.gridItem}>
                    <ProductCard
                      product={product}
                      onPress={() => setSelectedProduct(product)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
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
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.offWhite,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.offWhite,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.offWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
  // Content Section
  content: {
    marginTop: -SPACING.md,
    paddingTop: SPACING.lg,
  },
  // Search Bar
  searchContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGreen,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  searchClearButton: {
    padding: SPACING.xs,
  },
  // Category Filters
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.darkGreen,
    borderColor: COLORS.darkGreen,
  },
  filterButtonText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.offWhite,
  },
  // Sort Options
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  sortLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginRight: SPACING.md,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.sage,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  sortButton: {
    backgroundColor: COLORS.offWhite,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  sortButtonActive: {
    backgroundColor: COLORS.leaf,
    borderColor: COLORS.leaf,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  sortButtonTextActive: {
    color: COLORS.offWhite,
  },
  // Results Count
  resultsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  resultsCountText: {
    fontSize: 13,
    color: COLORS.sage,
  },
  resultsCountQuery: {
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.full,
  },
  clearFiltersText: {
    fontSize: 12,
    color: COLORS.sage,
    fontWeight: '600',
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.leaf,
  },
  sectionLabelMuted: {
    color: COLORS.gray,
  },
  countBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.leaf,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  countBadgeMuted: {
    backgroundColor: COLORS.borderCream,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
  countTextMuted: {
    color: COLORS.gray,
  },
  // Product Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: SPACING.xs,
  },
  // Product Card
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  productCardUnavailable: {
    opacity: 0.55,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  productIconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    fontSize: 32,
  },
  productInfo: {
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
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
  // Stock Status
  stockContainer: {
    marginBottom: SPACING.xs,
  },
  availableBadge: {
    alignSelf: 'flex-start',
  },
  availableText: {
    fontSize: 11,
    color: COLORS.sage,
    fontWeight: '600',
  },
  unavailableBadge: {
    backgroundColor: COLORS.errorLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
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
  },
  limitedStockText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: '600',
  },
  // Cart Section
  cartSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: 25,
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  quantityButton: {
    backgroundColor: COLORS.leaf,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.borderCream,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkGreen,
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  addButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  addButtonText: {
    color: COLORS.offWhite,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  // Bottom Spacer
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
