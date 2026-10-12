import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { AuthProvider } from '../src/auth';

export default function RootLayout() {
  return <AuthProvider><SafeAreaProvider>
    <StatusBar style="dark" backgroundColor={colors.paper} />
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.green, headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: colors.paper }, headerBackTitle: 'Volver' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="post/new" options={{ title: 'Nueva publicación', presentation: 'modal' }} />
      <Stack.Screen name="post/[id]" options={{ title: 'Aviso' }} />
      <Stack.Screen name="messages/[conversationId]" options={{ title: 'Conversación' }} />
      <Stack.Screen name="profile/[username]" options={{ title: 'Perfil' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Editar perfil' }} />
      <Stack.Screen name="admin/dashboard" options={{ title: 'Administración' }} />
      <Stack.Screen name="legal" options={{ title: 'Cuidado de la comunidad' }} />
      <Stack.Screen name="donate" options={{ title: 'Aporte solidario' }} />
    </Stack>
  </SafeAreaProvider></AuthProvider>;
}
