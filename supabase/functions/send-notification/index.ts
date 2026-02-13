/**
 * Supabase Edge Function: Send Push Notification
 *
 * Sends Expo push notifications to users.
 * Called by database triggers or admin actions.
 *
 * Usage:
 *   POST /functions/v1/send-notification
 *   Body: { type: 'order_ready' | 'cycle_open' | 'cycle_closing' | 'favorite_available', data: {...} }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
}

async function sendExpoPush(messages: PushMessage[]) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(messages),
  });

  return response.json();
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { type, data } = await req.json();

    let messages: PushMessage[] = [];

    switch (type) {
      case 'order_ready': {
        // Notify a specific user that their order is ready
        const { userId, orderNumber, pickupLocation } = data;
        const { data: prefs } = await supabase
          .from('user_notification_preferences')
          .select('push_token, orders_enabled')
          .eq('user_id', userId)
          .single();

        if (prefs?.push_token && prefs?.orders_enabled) {
          messages.push({
            to: prefs.push_token,
            title: 'Commande pr\u00EAte !',
            body: `Votre commande ${orderNumber} est pr\u00EAte. Retrait \u00E0 ${pickupLocation}.`,
            data: { screen: 'orders-history', orderId: data.orderId },
            sound: 'default',
          });
        }
        break;
      }

      case 'cycle_open': {
        // Notify all users with cycle notifications enabled
        const { cycleName } = data;
        const { data: users } = await supabase
          .from('user_notification_preferences')
          .select('push_token')
          .eq('cycles_enabled', true)
          .not('push_token', 'is', null);

        if (users) {
          messages = users.map((u: { push_token: string }) => ({
            to: u.push_token,
            title: 'Boutique ouverte !',
            body: `${cycleName} : d\u00E9couvrez les produits frais de la semaine.`,
            data: { screen: 'shop' },
            sound: 'default',
          }));
        }
        break;
      }

      case 'cycle_closing': {
        // Notify all users that a cycle is closing soon
        const { cycleName: closingName, hoursLeft } = data;
        const { data: closingUsers } = await supabase
          .from('user_notification_preferences')
          .select('push_token')
          .eq('cycles_enabled', true)
          .not('push_token', 'is', null);

        if (closingUsers) {
          messages = closingUsers.map((u: { push_token: string }) => ({
            to: u.push_token,
            title: 'Derni\u00E8re chance !',
            body: `Plus que ${hoursLeft}h pour commander (${closingName}).`,
            data: { screen: 'shop' },
            sound: 'default',
          }));
        }
        break;
      }

      case 'favorite_available': {
        // Notify a user that a favorite product is back in stock
        const { userId: favUserId, productName } = data;
        const { data: favPrefs } = await supabase
          .from('user_notification_preferences')
          .select('push_token, favorites_enabled')
          .eq('user_id', favUserId)
          .single();

        if (favPrefs?.push_token && favPrefs?.favorites_enabled) {
          messages.push({
            to: favPrefs.push_token,
            title: 'Produit favori disponible !',
            body: `${productName} est de retour en stock.`,
            data: { screen: 'shop' },
            sound: 'default',
          });
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown notification type: ${type}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
    }

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No eligible recipients' }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Send in batches of 100 (Expo limit)
    const results = [];
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      const result = await sendExpoPush(batch);
      results.push(result);
    }

    return new Response(
      JSON.stringify({ success: true, sent: messages.length, results }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
