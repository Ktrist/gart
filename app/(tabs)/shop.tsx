import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useShopStore } from '../../store/shopStore';
import { Product } from '../../services/api';

const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  beige: '#F5F5DC',
  beigeDark: '#E8E8CD',
  white: '#FFFFFF',
  red: '#DC2626',
  gray: '#6B7280',
  orange: '#F59E0B',
};

function ProductCard({ product }: { product: Product }) {
  const addToCart = useShopStore((state) => state.addToCart);
  const getAvailableStock = useShopStore((state) => state.getAvailableStock);
  const [quantity, setQuantity] = useState(1);

  // Calculer le stock disponible (stock total - quantité déjà dans le panier)
  const availableStock = getAvailableStock(product.id);
  const isStockLimited = availableStock > 0 && availableStock <= 5;
  const isOutOfStock = availableStock === 0;

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);

    if (success) {
      Alert.alert(
        '✅ Ajouté au panier',
        `${quantity} ${product.unit} de ${product.name} ajouté(s) au panier`,
        [{ text: 'OK' }]
      );
      setQuantity(1);
    } else {
      Alert.alert(
        '⚠️ Stock insuffisant',
        `Il ne reste que ${availableStock} ${product.unit} de ${product.name} en stock.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Limiter la quantité au stock disponible
  const handleIncrease = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert(
        'Stock limité',
        `Stock maximum atteint: ${availableStock} ${product.unit}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View
      style={[
        styles.productCard,
        (!product.available || isOutOfStock) && styles.productCardUnavailable,
      ]}
    >
      {/* Product Image/Icon */}
      <View style={styles.productIcon}>
        <Text style={{ fontSize: 48 }}>{product.image_url || '🥗'}</Text>
      </View>

      {/* Product Name */}
      <Text style={styles.productName}>{product.name}</Text>

      {/* Product Description */}
      <Text style={styles.productDescription} numberOfLines={2}>
        {product.description}
      </Text>

      {/* Price */}
      <Text style={styles.productPrice}>
        {product.price.toFixed(2)} € / {product.unit}
      </Text>

      {/* Stock Display - US-2.1 */}
      <View style={styles.stockContainer}>
        {!product.available || isOutOfStock ? (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>❌ Rupture de stock</Text>
          </View>
        ) : isStockLimited ? (
          <View style={styles.limitedStockBadge}>
            <Text style={styles.limitedStockText}>
              ⚠️ Plus que {availableStock} {product.unit} !
            </Text>
          </View>
        ) : (
          <Text style={styles.stockText}>
            📦 En stock: {availableStock} {product.unit}
          </Text>
        )}
      </View>

      {/* Add to Cart Section - US-2.2 */}
      {product.available && !isOutOfStock && (
        <View>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>
              {quantity} {product.unit}
            </Text>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= availableStock && styles.quantityButtonDisabled,
              ]}
              onPress={handleIncrease}
              disabled={quantity >= availableStock}
            >
              <Text
                style={[
                  styles.quantityButtonText,
                  quantity >= availableStock && styles.quantityButtonTextDisabled,
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              quantity > availableStock && styles.addButtonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={quantity > availableStock}
          >
            <Text style={styles.addButtonText}>Ajouter au panier</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ShopScreen() {
  const { products, shopStatus, isLoading, fetchProducts, fetchShopStatus } =
    useShopStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
    fetchShopStatus();
  }, []);

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

  // US-2.3 : Filtres par catégories
  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const availableProducts = filteredProducts.filter((p) => p.available && p.stock > 0);
  const unavailableProducts = filteredProducts.filter((p) => !p.available || p.stock === 0);

  return (
    <ScrollView style={styles.container}>
      {/* Shop Status Banner */}
      {shopStatus && (
        <View
          style={[
            styles.banner,
            { backgroundColor: shopStatus.isOpen ? COLORS.primary : COLORS.red },
          ]}
        >
          <Text style={styles.bannerText}>
            {shopStatus.isOpen ? '✅ Vente ouverte' : '🔒 Vente fermée'}
          </Text>
        </View>
      )}

      {/* Products Section */}
      <View style={styles.content}>
        <Text style={styles.title}>🥬 Nos produits</Text>

        {/* Category Filters - US-2.3 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
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

        {/* Available Products */}
        {availableProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Disponibles ({availableProducts.length})
            </Text>
            <View style={styles.grid}>
              {availableProducts.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Unavailable Products */}
        {unavailableProducts.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: COLORS.gray }]}>
              Rupture de stock ({unavailableProducts.length})
            </Text>
            <View style={styles.grid}>
              {unavailableProducts.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aucun produit dans cette catégorie
            </Text>
          </View>
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
  },
  banner: {
    padding: 16,
  },
  bannerText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  // Category Filters
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: COLORS.beigeDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardUnavailable: {
    opacity: 0.6,
    borderColor: '#D1D5DB',
  },
  productIcon: {
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  // Stock Display
  stockContainer: {
    marginBottom: 12,
  },
  stockText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  unavailableBadge: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 4,
  },
  unavailableText: {
    color: COLORS.red,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  limitedStockBadge: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 4,
  },
  limitedStockText: {
    color: COLORS.orange,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  // Quantity Control
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.beige,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  quantityButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  quantityButtonTextDisabled: {
    color: '#D1D5DB',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
  addButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: 'center',
    fontSize: 18,
  },
});
