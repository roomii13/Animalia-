import { useCallback, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Screen } from '../src/ui';
import { colors } from '../src/theme';
import { useAuth } from '../src/auth';

type BlockedProfile = { username: string; displayName: string; blockedAt: string };

export default function BlockedScreen() {
  const { profile, loading: authLoading, authenticatedRequest } = useAuth();
  const [profiles, setProfiles] = useState<BlockedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    if (!profile) {
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    void authenticatedRequest<{ blockedProfiles: BlockedProfile[] }>('/api/blocks')
      .then(({ blockedProfiles }) => { if (active) setProfiles(blockedProfiles); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar la lista.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, profile, authenticatedRequest]));

  const unblock = (blockedProfile: BlockedProfile) => {
    Alert.alert('¿Desbloquear usuario?', `Los avisos de ${blockedProfile.displayName} podrán volver a aparecer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desbloquear', onPress: () => {
        void authenticatedRequest(`/api/blocks/${encodeURIComponent(blockedProfile.username)}`, { method: 'DELETE' })
          .then(() => setProfiles((current) => current.filter((item) => item.username !== blockedProfile.username)))
          .catch((reason: unknown) => Alert.alert('No se pudo desbloquear', reason instanceof Error ? reason.message : 'Intentá nuevamente.'));
      } },
    ]);
  };

  return <Screen>
    <PageHeading eyebrow="Privacidad y cuidado" title="Usuarios bloqueados" detail="Las cuentas bloqueadas dejan de aparecer en tus avisos y tampoco ven los tuyos." />
    {!profile && !authLoading ? <Card><Text style={styles.copy}>Iniciá sesión para administrar tus bloqueos.</Text><ActionButton label="Iniciar sesión" onPress={() => router.push('/(auth)/login')} /></Card> : null}
    {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Cargando usuarios bloqueados" /> : null}
    {error ? <Notice>{error}</Notice> : null}
    {profile && !loading && !error && profiles.length === 0 ? <Notice>No bloqueaste a ninguna cuenta.</Notice> : null}
    {profiles.map((item) => <Card key={item.username}>
      <Text style={styles.name}>{item.displayName}</Text>
      <Text style={styles.copy}>@{item.username}</Text>
      <ActionButton label="Desbloquear" secondary onPress={() => unblock(item)} />
    </Card>)}
  </Screen>;
}

const styles = StyleSheet.create({ name: { color: colors.green, fontSize: 16, fontWeight: '800' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 19 } });
