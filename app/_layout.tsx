import { Stack } from 'expo-router';
import { StripeProvider } from '../utils/stripe';
import { AuthProvider } from '../contexts/AuthContext';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="checkout" options={{ presentation: 'modal', title: 'Paiement' }} />
          <Stack.Screen name="order-confirmation" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ presentation: 'modal', title: 'Connexion' }} />
          <Stack.Screen name="orders-history" options={{ headerShown: false }} />
          <Stack.Screen name="delivery-address" options={{ presentation: 'modal', title: 'Adresse de livraison' }} />
        </Stack>
      </StripeProvider>
    </AuthProvider>
  );
}
