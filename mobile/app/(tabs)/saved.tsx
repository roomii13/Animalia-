import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect, router } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Screen } from '../../src/ui';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/auth';
import type { AnimalPost } from '../../src/data';

export default function SavedScreen() {
  const { profile, loading: authLoading, authenticatedRequest } = useAuth();
  const [posts, setPosts] = useState<AnimalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    if (!profile) {
      setPosts([]);
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    void authenticatedRequest<{ posts: AnimalPost[] }>('/api/saved')
      .then((result) => { if (active) setPosts(result.posts); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar tus avisos guardados.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile, authLoading, authenticatedRequest]));

  return <Screen>
    <PageHeading eyebrow="Tu espacio" title="Avisos guardados" detail="Tené a mano las publicaciones que querés volver a consultar." />
    {authLoading || loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Cargando guardados" /> : null}
    {!authLoading && !profile ? <Card><View style={styles.icon}><Text style={styles.emoji}>♡</Text></View><Text style={styles.cardTitle}>Iniciá sesión para guardar avisos</Text><Text style={styles.copy}>Tus publicaciones guardadas se sincronizan con tu cuenta.</Text><ActionButton label="Iniciar sesión" onPress={() => router.push('/(auth)/login')} /></Card> : null}
    {error ? <Notice>{error}</Notice> : null}
    {!loading && profile && posts.length === 0 && !error ? <Card><View style={styles.icon}><Text style={styles.emoji}>♡</Text></View><Text style={styles.cardTitle}>Todavía no guardaste avisos</Text><Text style={styles.copy}>Guardá una publicación para encontrarla fácilmente después.</Text><Link href="/explore" style={styles.link}>Explorar avisos  ›</Link></Card> : null}
    {posts.map((post) => <Link key={post.id} href={{ pathname: '/post/[id]', params: { id: post.id } }} asChild><Pressable><Card><View style={[styles.icon, { backgroundColor: post.tint }]}><Text style={styles.emoji}>{post.emoji}</Text></View><Text style={styles.cardTitle}>{post.title}</Text><Text style={styles.copy}>{post.type} · {post.location}</Text><Text style={styles.link}>Ver aviso  ›</Text></Card></Pressable></Link>)}
    {profile && !loading && !error ? <Notice>Estos avisos se guardan en tu cuenta.</Notice> : null}
  </Screen>;
}

const styles = StyleSheet.create({ icon: { width: 54, height: 54, borderRadius: 16, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, emoji: { color: colors.green, fontSize: 31 }, cardTitle: { color: colors.green, fontSize: 18, fontWeight: '800' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20 }, link: { color: colors.green, fontSize: 13, fontWeight: '800', marginTop: 5 } });
