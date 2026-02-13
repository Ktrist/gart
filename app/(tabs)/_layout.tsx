import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, Store, ShoppingBasket, UserCircle } from 'lucide-react-native';
import { useShopStore } from '../../store/shopStore';
import { COLORS } from '../../constants/theme';

const ICON_SIZE = 24;
const STROKE_WIDTH = 1.5;

interface TabIconProps {
  focused: boolean;
  Icon: React.ComponentType<any>;
}

function TabIcon({ focused, Icon }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon
        size={ICON_SIZE}
        strokeWidth={STROKE_WIDTH}
        color={focused ? COLORS.darkGreen : COLORS.sage}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </View>
  );
}

export default function TabsLayout() {
  const cartItemCount = useShopStore((state) => state.getCartItemCount());

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.darkGreen,
        },
        headerTintColor: COLORS.offWhite,
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        tabBarActiveTintColor: COLORS.darkGreen,
        tabBarInactiveTintColor: COLORS.sage,
        tabBarStyle: {
          backgroundColor: COLORS.offWhite,
          borderTopColor: COLORS.borderCream,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
          letterSpacing: 0.3,
        },
      }}
    >
      {/* Screens with custom hero ImageBackground - hide header */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Home} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Boutique',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Store} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={ShoppingBasket} />,
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.leaf,
            color: COLORS.offWhite,
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={UserCircle} />,
        }}
      />
    </Tabs>
  );
}
