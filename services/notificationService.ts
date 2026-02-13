/**
 * Notification Service
 *
 * Handles push notification registration, permission requests,
 * and token management with Supabase sync.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowInForeground: true,
  }),
});

export interface NotificationPreferences {
  cycles_enabled: boolean;
  favorites_enabled: boolean;
  orders_enabled: boolean;
  promotions_enabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  cycles_enabled: true,
  favorites_enabled: true,
  orders_enabled: true,
  promotions_enabled: false,
};

export const notificationService = {
  /**
   * Register for push notifications and get the Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'GART',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2d5a3c',
      });
    }

    // Get the push token
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  /**
   * Save push token to Supabase for the current user
   */
  async savePushToken(token: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          push_token: token,
          ...DEFAULT_PREFERENCES,
        }, {
          onConflict: 'user_id',
        });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  },

  /**
   * Get notification preferences for the current user
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_PREFERENCES;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('cycles_enabled, favorites_enabled, orders_enabled, promotions_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) return DEFAULT_PREFERENCES;

      return {
        cycles_enabled: data.cycles_enabled ?? true,
        favorites_enabled: data.favorites_enabled ?? true,
        orders_enabled: data.orders_enabled ?? true,
        promotions_enabled: data.promotions_enabled ?? false,
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
        }, {
          onConflict: 'user_id',
        });

      return !error;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  },

  /**
   * Schedule a local notification (for cycle reminders, etc.)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    triggerSeconds?: number,
    data?: Record<string, unknown>,
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: triggerSeconds
          ? { seconds: triggerSeconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL }
          : null,
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduled(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get the current badge count
   */
  async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  },

  /**
   * Set the badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Add listeners for notification events
   */
  addNotificationReceivedListener(
    handler: (notification: Notifications.Notification) => void,
  ) {
    return Notifications.addNotificationReceivedListener(handler);
  },

  addNotificationResponseListener(
    handler: (response: Notifications.NotificationResponse) => void,
  ) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },
};
