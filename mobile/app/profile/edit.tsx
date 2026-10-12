import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Screen } from '../../src/ui';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/auth';

export default function EditProfileScreen() {
  const { profile, updateProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [locality, setLocality] = useState(profile?.locality ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setLocality(profile.locality ?? '');
    setBio(profile.bio ?? '');
  }, [profile]);

  const save = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await updateProfile({ displayName, locality: locality || null, bio: bio || null });
      Alert.alert('Perfil actualizado', 'Los cambios ya están guardados.', [{ text: 'Listo', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return <Screen>
    <PageHeading eyebrow="Tu cuenta" title="Editar perfil" detail="Compartí solo la información necesaria para participar." />
    {!profile && !loading ? <Notice>Iniciá sesión para editar tu perfil.</Notice> : null}
    {profile ? <Card><Text style={styles.label}>Nombre visible</Text><TextInput value={displayName} onChangeText={setDisplayName} maxLength={80} style={styles.input} /><Text style={styles.label}>Localidad</Text><TextInput value={locality} onChangeText={setLocality} maxLength={120} placeholder="Tu localidad" style={styles.input} /><Text style={styles.label}>Presentación</Text><TextInput value={bio} onChangeText={setBio} maxLength={1000} multiline placeholder="Contá brevemente cómo colaborás..." style={[styles.input, styles.bio]} /><ActionButton label={submitting ? 'Guardando…' : 'Guardar cambios'} onPress={() => { void save(); }} /></Card> : null}
    {!profile && !loading ? <ActionButton label="Iniciar sesión" onPress={() => router.push('/(auth)/login')} /> : null}
  </Screen>;
}

const styles = StyleSheet.create({ label: { color: colors.green, fontSize: 13, fontWeight: '800' }, input: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: '#fff', color: colors.ink }, bio: { minHeight: 110, textAlignVertical: 'top' } });
