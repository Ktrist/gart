/**
 * Notification Store
 *
 * Zustand store for managing notification state and preferences.
 */

import { create } from 'zustand';
import { notificationService, NotificationPreferences } from '../services/notificationService';

interface NotificationStore {
  // State
  pushToken: string | null;
  preferences: NotificationPreferences;
  isRegistered: boolean;
  isLoading: boolean;

  // Actions
  register: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  pushToken: null,
  preferences: {
    cycles_enabled: true,
    favorites_enabled: true,
    orders_enabled: true,
    promotions_enabled: false,
  },
  isRegistered: false,
  isLoading: false,

  register: async () => {
    set({ isLoading: true });
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        await notificationService.savePushToken(token);
        set({ pushToken: token, isRegistered: true });
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadPreferences: async () => {
    set({ isLoading: true });
    try {
      const prefs = await notificationService.getPreferences();
      set({ preferences: prefs });
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreference: async (key, value) => {
    const { preferences } = get();
    const updated = { ...preferences, [key]: value };

    // Optimistic update
    set({ preferences: updated });

    const success = await notificationService.updatePreferences({ [key]: value });
    if (!success) {
      // Revert on failure
      set({ preferences });
    }
  },

  reset: () => {
    set({
      pushToken: null,
      preferences: {
        cycles_enabled: true,
        favorites_enabled: true,
        orders_enabled: true,
        promotions_enabled: false,
      },
      isRegistered: false,
      isLoading: false,
    });
  },
}));
