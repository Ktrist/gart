/**
 * Haptics Utility
 *
 * Provides tactile feedback for user interactions
 * Makes the app feel more responsive and polished
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Only trigger haptics on iOS/Android, not web
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  /**
   * Light tap - for small UI interactions
   * Use for: toggles, selections, navigation
   */
  light: () => {
    if (isNative) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium tap - for standard interactions
   * Use for: buttons, adding to cart, confirming actions
   */
  medium: () => {
    if (isNative) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy tap - for significant actions
   * Use for: deleting, clearing, important confirmations
   */
  heavy: () => {
    if (isNative) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success feedback - for completed actions
   * Use for: successful add to cart, order placed, item saved
   */
  success: () => {
    if (isNative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning feedback - for important notices
   * Use for: low stock warnings, validation errors
   */
  warning: () => {
    if (isNative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error feedback - for failed actions
   * Use for: failed operations, invalid input
   */
  error: () => {
    if (isNative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Selection changed - for picker/selection changes
   * Use for: quantity changes, option selections
   */
  selection: () => {
    if (isNative) {
      Haptics.selectionAsync();
    }
  },
};

export default haptics;
