import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useShopStore } from '../../store/shopStore';

export default function TabsLayout() {
  const cartItemCount = useShopStore((state) => state.getCartItemCount());

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E8E8CD',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Boutique',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🛒</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🛍️</Text>
          ),
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
    </Tabs>
  );
}
