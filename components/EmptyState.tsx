/**
 * Branded Empty State Component
 *
 * Premium empty state with Gart brand identity
 */

import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const STROKE_WIDTH = 1.5;

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={[styles.content, { width: width * 0.85 }]}>
        {/* Decorative Background Pattern */}
        <View style={styles.patternContainer}>
          <View style={[styles.patternCircle, styles.patternCircle1]} />
          <View style={[styles.patternCircle, styles.patternCircle2]} />
          <View style={[styles.patternCircle, styles.patternCircle3]} />
        </View>

        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={styles.iconOuterRing}>
            <View style={styles.iconInnerRing}>
              <Icon
                size={48}
                strokeWidth={STROKE_WIDTH}
                color={COLORS.sage}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {/* Action Buttons */}
        {actionLabel && onAction && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSecondaryAction}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
          </TouchableOpacity>
        )}
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
    padding: SPACING.xl,
  },
  content: {
    alignItems: 'center',
  },
  patternContainer: {
    position: 'absolute',
    top: -40,
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.borderCream,
    opacity: 0.3,
  },
  patternCircle1: {
    width: 120,
    height: 120,
    top: 20,
    left: -20,
  },
  patternCircle2: {
    width: 80,
    height: 80,
    top: 60,
    right: 20,
  },
  patternCircle3: {
    width: 60,
    height: 60,
    top: 10,
    right: -10,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
    zIndex: 1,
  },
  iconOuterRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    ...SHADOWS.sm,
  },
  iconInnerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 25,
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  primaryButtonText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  secondaryButtonText: {
    color: COLORS.leaf,
    fontSize: 15,
    fontWeight: '600',
  },
});
