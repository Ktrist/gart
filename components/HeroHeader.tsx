/**
 * Branded Hero Header Component
 *
 * Reusable header with aerial field background for premium screens
 */

import { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  height?: number; // Percentage of screen height (0-1)
  children?: ReactNode;
  gradientColors?: string[];
  overlayOpacity?: number;
}

const STROKE_WIDTH = 1.5;

// Aerial field image - replace with local asset for production
const AERIAL_FIELD_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
};

export default function HeroHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  height = 0.3,
  children,
  gradientColors,
  overlayOpacity = 0.3,
}: HeroHeaderProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerHeight = screenHeight * height;
  // Minimum 20px padding below safe area for premium spacing
  const topPadding = insets.top + 20;

  const defaultGradient = [
    'transparent',
    `rgba(20, 50, 33, ${overlayOpacity})`,
    COLORS.offWhite,
  ];

  return (
    <ImageBackground
      source={AERIAL_FIELD_IMAGE}
      style={[styles.container, { height: headerHeight }]}
      resizeMode="cover"
    >
      <LinearGradient
        colors={gradientColors || defaultGradient}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <View style={[styles.content, { paddingTop: topPadding }]}>
          {/* Top Row - Back Button */}
          {showBackButton && (
            <View style={styles.topRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackPress}
                activeOpacity={0.7}
              >
                <ChevronLeft
                  size={24}
                  strokeWidth={STROKE_WIDTH}
                  color={COLORS.offWhite}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Center Content */}
          <View style={styles.centerContent}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {children}
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: SPACING.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.darkGreen,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.sage,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
