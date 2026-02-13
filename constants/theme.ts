/**
 * Gart Brand Theme
 *
 * Premium organic aesthetic inspired by aerial field patchwork
 */

export const COLORS = {
  // Brand Palette
  darkGreen: '#143221',
  leaf: '#2D5A3C',
  sage: '#768D5D',
  borderCream: '#D9D7C8',
  offWhite: '#FDFDFB',

  // Semantic Colors
  primary: '#143221',
  primaryLight: '#2D5A3C',
  secondary: '#768D5D',
  background: '#FDFDFB',
  border: '#D9D7C8',

  // Utility Colors
  white: '#FFFFFF',
  error: '#B91C1C',
  errorLight: '#FEE2E2',
  success: '#15803D',
  successLight: '#DCFCE7',
  warning: '#A16207',
  warningLight: '#FEF3C7',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  text: '#1F2937',
  textLight: '#6B7280',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  // Section labels - uppercase with letter spacing
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.sage,
  },
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: COLORS.darkGreen,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.darkGreen,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.darkGreen,
  },
  // Body text
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  bodySmall: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  caption: {
    fontSize: 12,
    color: COLORS.gray,
  },
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Common component styles
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.md,
  },
  secondary: {
    backgroundColor: COLORS.offWhite,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  primaryText: {
    color: COLORS.offWhite,
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  secondaryText: {
    color: COLORS.darkGreen,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
};

export const CARD_STYLES = {
  base: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  elevated: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
};

export const INPUT_STYLES = {
  base: {
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.borderCream,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  focused: {
    borderColor: COLORS.leaf,
  },
  error: {
    borderColor: COLORS.error,
  },
};

export const DIVIDER = {
  height: 1,
  backgroundColor: COLORS.borderCream,
  marginVertical: SPACING.md,
};
