import { useCallback, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Screen } from '../../src/ui';
import { colors } from '../../src/theme';
import type { AnimalPost } from '../../src/data';
import { apiRequest } from '../../src/api';
import { useAuth } from '../../src/auth';
import { SafetyActions } from '../../src/SafetyActions';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<AnimalPost | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { profile, loading: authLoading, authenticatedRequest } = useAuth();

  useFocusEffect(useCallback(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    setLoading(true);
    setError('');
    void apiRequest<{ post: AnimalPost }>(`/api/posts/${encodeURIComponent(id ?? '')}`)
      .then(async ({ post: loadedPost }) => {
        if (!active) return;
        setPost(loadedPost);
        if (profile) {
          const result = await authenticatedRequest<{ saved: boolean }>(`/api/posts/${encodeURIComponent(id ?? '')}/save`);
          if (active) setSaved(result.saved);
        } else {
          setSaved(false);
        }
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el aviso.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, profile, authLoading, authenticatedRequest]));

  const toggleSaved = async () => {
    if (!profile) {
      Alert.alert('Iniciá sesión', 'Guardá avisos en tu cuenta para volver a encontrarlos.', [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    const nextSaved = !saved;
    try {
      const result = await authenticatedRequest<{ saved: boolean }>(`/api/posts/${encodeURIComponent(id ?? '')}/save`, { method: nextSaved ? 'POST' : 'DELETE' });
      setSaved(result.saved);
    } catch (reason) {
      Alert.alert('No se pudo guardar', reason instanceof Error ? reason.message : 'Intentá nuevamente.');
    }
  };

  return <Screen>
    {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Cargando aviso" /> : null}
    {error ? <Notice>{error}</Notice> : null}
    {post ? <><View style={[styles.cover, { backgroundColor: post.tint }]}><Text style={styles.emoji}>{post.emoji}</Text></View>
      <PageHeading eyebrow={post.type} title={post.title} detail={`${post.animal}  ·  ${post.location}`} />
      <Card><Text style={styles.label}>Sobre este aviso</Text><Text style={styles.description}>{post.description}</Text><Text style={styles.author}>Publicado por {post.author}</Text></Card>
      {post.username ? <SafetyActions username={post.username} postId={post.id} onBlocked={() => { setPost(null); setError('Bloqueaste esta cuenta. Sus avisos ya no aparecerán en tu comunidad.'); }} /> : null}
      <Notice>Antes de coordinar, confirmá los datos, cuidá tu información personal y priorizá la seguridad del animal.</Notice>
      <ActionButton label={saved ? 'Quitar de guardados' : 'Guardar aviso'} secondary={saved} onPress={() => { void toggleSaved(); }} />
      <Notice>La mensajería dentro de Animalia se habilitará en una próxima etapa.</Notice></> : null}
  </Screen>;
}

const styles = StyleSheet.create({ cover: { height: 210, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, emoji: { fontSize: 100 }, label: { color: colors.green, fontSize: 14, fontWeight: '800' }, description: { color: colors.muted, fontSize: 14, lineHeight: 21 }, author: { color: '#8b735b', fontSize: 12, fontWeight: '700' } });
