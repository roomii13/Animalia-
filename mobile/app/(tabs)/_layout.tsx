import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.green,
    tabBarInactiveTintColor: colors.muted,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '700' as const },
    tabBarStyle: {
      backgroundColor: '#fff',
      borderTopColor: colors.border,
      height: 64 + insets.bottom,
      paddingTop: 8,
      paddingBottom: Math.max(insets.bottom, 8),
    },
    tabBarIconStyle: { marginTop: 1 },
  };

  return <Tabs screenOptions={screenOptions}>
    <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color }) => <FontAwesome6 name="house" solid size={24} color={color} /> }} />
    <Tabs.Screen name="explore" options={{ title: 'Explorar', tabBarIcon: ({ color }) => <FontAwesome6 name="compass" solid size={24} color={color} /> }} />
    <Tabs.Screen name="saved" options={{ title: 'Guardados', tabBarIcon: ({ color }) => <FontAwesome6 name="bookmark" solid size={24} color={color} /> }} />
    <Tabs.Screen name="messages" options={{ title: 'Mensajes', tabBarIcon: ({ color }) => <FontAwesome6 name="comment-dots" solid size={24} color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color }) => <FontAwesome6 name="user" solid size={24} color={color} /> }} />
  </Tabs>;
}
