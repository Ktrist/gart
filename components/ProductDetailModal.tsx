/**
 * Product Detail Modal
 *
 * Shows full product details in a modal overlay
 * Includes add to cart functionality
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  useWindowDimensions,
  Share,
  Platform,
} from 'react-native';
import {
  X,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Salad,
  Carrot,
  Apple,
  Leaf,
  Flower2,
  Cherry,
  Check,
  Share2,
} from 'lucide-react-native';
import { Product } from '../services/api';
import { useShopStore } from '../store/shopStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { haptics } from '../utils/haptics';

const STROKE_WIDTH = 1.5;

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

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

  return Salad;
};

export default function ProductDetailModal({
  product,
  visible,
  onClose,
}: ProductDetailModalProps) {
  const { height } = useWindowDimensions();
  const { user } = useAuth();
  const addToCart = useShopStore((state) => state.addToCart);
  const getAvailableStock = useShopStore((state) => state.getAvailableStock);
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const productUuid = product.uuid || product.id.toString();
  const isFav = isFavorite(productUuid);
  const availableStock = getAvailableStock(product.id);
  const isOutOfStock = !product.available || availableStock === 0;
  const isStockLimited = availableStock > 0 && availableStock <= 5;

  const Icon = getCategoryIcon(product.category);

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) {
      haptics.success();
      setIsAdding(true);
      setTimeout(() => {
        setIsAdding(false);
        setQuantity(1);
        onClose();
      }, 1000);
    }
  };

  const handleToggleFavorite = () => {
    if (!user) return;
    haptics.light();
    toggleFavorite(productUuid);
  };

  const handleClose = () => {
    setQuantity(1);
    setIsAdding(false);
    onClose();
  };

  const handleQuantityChange = (newQuantity: number) => {
    haptics.selection();
    setQuantity(newQuantity);
  };

  const handleShare = async () => {
    haptics.light();
    try {
      const message = `${product.name} - ${product.price.toFixed(2)} €/${product.unit}\n\n${product.description || 'Découvrez ce produit frais de la ferme Gart !'}\n\n🥬 Commandez sur l'app Gart`;

      await Share.share({
        message,
        title: product.name,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { maxHeight: height * 0.85 }]}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <X
                    size={24}
                    strokeWidth={STROKE_WIDTH}
                    color={COLORS.sage}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                  {/* Share Button */}
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleShare}
                  >
                    <Share2
                      size={22}
                      strokeWidth={STROKE_WIDTH}
                      color={COLORS.sage}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </TouchableOpacity>

                  {/* Favorite Button - Only for logged in users */}
                  {user && (
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={handleToggleFavorite}
                    >
                      <Heart
                        size={22}
                        strokeWidth={STROKE_WIDTH}
                        color={isFav ? COLORS.error : COLORS.sage}
                        fill={isFav ? COLORS.error : 'transparent'}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Product Icon */}
                <View style={styles.iconContainer}>
                  <View style={styles.iconBg}>
                    {product.image_url ? (
                      <Text style={styles.productEmoji}>{product.image_url}</Text>
                    ) : (
                      <Icon
                        size={64}
                        strokeWidth={STROKE_WIDTH}
                        color={COLORS.leaf}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    )}
                  </View>
                </View>

                {/* Category Badge */}
                {product.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{product.category}</Text>
                  </View>
                )}

                {/* Product Name */}
                <Text style={styles.productName}>{product.name}</Text>

                {/* Price */}
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{product.price.toFixed(2)} €</Text>
                  <Text style={styles.unit}>/ {product.unit}</Text>
                </View>

                {/* Stock Status */}
                <View style={styles.stockContainer}>
                  {isOutOfStock ? (
                    <View style={styles.stockBadgeUnavailable}>
                      <Text style={styles.stockTextUnavailable}>RUPTURE DE STOCK</Text>
                    </View>
                  ) : isStockLimited ? (
                    <View style={styles.stockBadgeLimited}>
                      <Text style={styles.stockTextLimited}>
                        Plus que {availableStock} en stock !
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.stockBadgeAvailable}>
                      <Check
                        size={14}
                        strokeWidth={2}
                        color={COLORS.leaf}
                      />
                      <Text style={styles.stockTextAvailable}>
                        {availableStock} en stock
                      </Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                {product.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>DESCRIPTION</Text>
                    <Text style={styles.description}>{product.description}</Text>
                  </View>
                )}

                {/* Weight Info */}
                {product.weight_grams && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Poids</Text>
                    <Text style={styles.infoValue}>
                      {product.weight_grams >= 1000
                        ? `${(product.weight_grams / 1000).toFixed(1)} kg`
                        : `${product.weight_grams} g`}
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Footer - Add to Cart */}
              {!isOutOfStock && (
                <View style={styles.footer}>
                  {/* Quantity Selector */}
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantity <= 1 && styles.quantityButtonDisabled,
                      ]}
                      onPress={() => handleQuantityChange(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus
                        size={18}
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
                      onPress={() => handleQuantityChange(Math.min(availableStock, quantity + 1))}
                      disabled={quantity >= availableStock}
                    >
                      <Plus
                        size={18}
                        strokeWidth={2}
                        color={quantity >= availableStock ? COLORS.sage : COLORS.offWhite}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Add to Cart Button */}
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      isAdding && styles.addButtonSuccess,
                    ]}
                    onPress={handleAddToCart}
                    activeOpacity={0.8}
                    disabled={isAdding}
                  >
                    <ShoppingBag
                      size={20}
                      strokeWidth={STROKE_WIDTH}
                      color={COLORS.offWhite}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <Text style={styles.addButtonText}>
                      {isAdding
                        ? 'Ajouté !'
                        : `Ajouter • ${(product.price * quantity).toFixed(2)} €`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.offWhite,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.md,
  },
  productEmoji: {
    fontSize: 56,
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.leaf + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.leaf,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkGreen,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.leaf,
  },
  unit: {
    fontSize: 16,
    color: COLORS.sage,
    marginLeft: SPACING.xs,
  },
  stockContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stockBadgeAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.leaf + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  stockTextAvailable: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.leaf,
  },
  stockBadgeLimited: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  stockTextLimited: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  stockBadgeUnavailable: {
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  stockTextUnavailable: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.sage,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.sage,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGreen,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderCream,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xs,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.leaf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.borderCream,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGreen,
    minWidth: 44,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  addButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.offWhite,
  },
});
