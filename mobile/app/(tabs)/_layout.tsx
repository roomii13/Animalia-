import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';

export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border, height: 62, paddingTop: 7, paddingBottom: 7 } }}>
    <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
    <Tabs.Screen name="explore" options={{ title: 'Explorar' }} />
    <Tabs.Screen name="saved" options={{ title: 'Guardados' }} />
    <Tabs.Screen name="messages" options={{ title: 'Mensajes' }} />
    <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
  </Tabs>;
}
