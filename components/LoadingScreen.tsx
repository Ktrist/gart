/**
 * Branded Loading Screen Component
 *
 * Premium loading state with Gart brand identity
 */

import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const STROKE_WIDTH = 1.5;

export default function LoadingScreen({
  message = 'Chargement...',
  showLogo = true,
}: LoadingScreenProps) {
  const { height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Sprout
                size={40}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.darkGreen}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </View>
          </View>
        )}

        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.leaf} />
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.decorativeBar}>
          <View style={[styles.decorativeSegment, { backgroundColor: COLORS.darkGreen }]} />
          <View style={[styles.decorativeSegment, { backgroundColor: COLORS.leaf }]} />
          <View style={[styles.decorativeSegment, { backgroundColor: COLORS.sage }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderContainer: {
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: 16,
    color: COLORS.sage,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: SPACING.xl,
  },
  decorativeBar: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  decorativeSegment: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
});
