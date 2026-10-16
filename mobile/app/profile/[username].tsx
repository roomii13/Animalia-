import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Card, Notice, PageHeading, Screen } from '../../src/ui';
import { colors } from '../../src/theme';
import { apiRequest } from '../../src/api';
import type { AuthProfile } from '../../src/auth';
import { useAuth } from '../../src/auth';
import { SafetyActions } from '../../src/SafetyActions';

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { profile: currentProfile } = useAuth();

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    void apiRequest<{ profile: AuthProfile }>(`/api/profiles/${encodeURIComponent(username ?? '')}`)
      .then((result) => { if (active) setProfile(result.profile); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el perfil.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username]));

  return <Screen>
    <PageHeading eyebrow="Perfil público" title={profile?.displayName ?? (loading ? 'Cargando perfil…' : 'Perfil')} detail={profile ? `@${profile.username} · ${profile.accountType === 'rescue_organization' ? 'Organización de rescate' : 'Persona'}` : 'Información compartida por la comunidad.'} />
    {error ? <Notice>{error}</Notice> : null}
    {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Cargando perfil" /> : null}
    {profile ? <><Card><View style={styles.avatar}><Text style={styles.emoji}>🐾</Text></View><Text style={styles.name}>{profile.displayName}</Text><Text style={styles.copy}>{profile.bio || 'Todavía no agregó una presentación.'}</Text>{profile.locality ? <Text style={styles.copy}>⌖  {profile.locality}</Text> : null}</Card>{currentProfile?.username !== profile.username ? <SafetyActions username={profile.username} /> : null}</> : null}
  </Screen>;
}

const styles = StyleSheet.create({ avatar: { width: 76, height: 76, borderRadius: 24, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, emoji: { fontSize: 40 }, name: { color: colors.green, fontSize: 19, fontWeight: '800' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20 } });
