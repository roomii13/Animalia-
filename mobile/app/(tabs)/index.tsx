import { useMemo, useState } from 'react';
import { Link, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand, Card, Notice, PageHeading, Pill, Screen } from '../../src/ui';
import { categories } from '../../src/data';
import { colors } from '../../src/theme';
import { useFeed } from '../../src/useFeed';

export default function FeedScreen() {
  const [category, setCategory] = useState('Todo');
  const { posts, loading, error } = useFeed();
  const visible = useMemo(() => category === 'Todo' ? posts : posts.filter((post) => post.category === category), [category]);

  return <Screen>
    <View style={styles.top}><Brand /><Pressable onPress={() => router.push('/post/new')} style={styles.create}><Text style={styles.createText}>＋</Text></Pressable></View>
    <View style={styles.hero}><Text style={styles.heroEyebrow}>BIENESTAR ANIMAL EN COMUNIDAD</Text><Text style={styles.heroTitle}>Cuidar también es encontrarnos.</Text><Text style={styles.heroText}>Adopciones, rescates y personas que se unen para ayudar.</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Apoyar la campaña para comprar el terreno del cementerio de mascotas" onPress={() => router.push({ pathname: '/donate', params: { purpose: 'pet_cemetery_land' } })} style={({ pressed }) => [styles.donateButton, pressed && styles.donatePressed]}><Ionicons name="heart" size={21} color="#fff" /><Text style={styles.donateText}>Campaña: cementerio de mascotas</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></Pressable>
    <PageHeading eyebrow="Comunidad Animalia" title="Lo que está pasando" detail="Elegí un tema para explorar los avisos." />
    {error ? <Notice>{error}</Notice> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>{categories.map((item) => <Pill key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}</ScrollView>
    {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Cargando avisos" /> : null}
    {!loading && !error && visible.length === 0 ? <Card><Text style={styles.postTitle}>Todavía no hay avisos</Text><Text style={styles.postDescription}>Cuando la comunidad publique una adopción, búsqueda o actividad, aparecerá acá.</Text></Card> : null}
    {visible.map((post) => <Link key={post.id} href={{ pathname: '/post/[id]', params: { id: post.id } }} asChild><Pressable><Card><View style={[styles.animal, { backgroundColor: post.tint }]}><Text style={styles.animalEmoji}>{post.emoji}</Text></View><Text style={styles.type}>{post.type.toUpperCase()}</Text><Text style={styles.postTitle}>{post.title}</Text><Text style={styles.postDescription}>{post.description}</Text><Text style={styles.meta}>{post.animal}  ·  {post.location}</Text></Card></Pressable></Link>)}
    <View style={styles.actions}><Text style={styles.sectionTitle}>¿Querés ayudar?</Text><Text style={styles.supportText}>Compartí un rescate, un animal perdido o una iniciativa local.</Text><Pressable onPress={() => router.push('/post/new')} style={styles.secondary}><Text style={styles.secondaryText}>Crear un aviso</Text></Pressable></View>
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  create: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  createText: { color: '#fff', fontSize: 26, lineHeight: 30, fontWeight: '500' },
  hero: { padding: 22, gap: 11, borderRadius: 23, backgroundColor: colors.green },
  heroEyebrow: { color: '#efc98f', fontWeight: '800', fontSize: 10, letterSpacing: 1.1 },
  heroTitle: { color: '#fffaf2', fontSize: 29, fontWeight: '800', lineHeight: 34, letterSpacing: -0.6 },
  heroText: { color: '#e3ecdf', fontSize: 14, lineHeight: 20 },
  donateButton: { minHeight: 54, paddingHorizontal: 18, borderRadius: 16, backgroundColor: colors.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  donatePressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  donateText: { color: '#3b4029', fontSize: 14, fontWeight: '800', flexShrink: 1 },
  pills: { gap: 8, paddingRight: 20 },
  animal: { height: 142, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  animalEmoji: { fontSize: 72 },
  type: { marginTop: 3, color: '#9b6c3d', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  postTitle: { color: colors.green, fontSize: 19, lineHeight: 24, fontWeight: '800' },
  postDescription: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  meta: { color: '#8b735b', fontSize: 11, fontWeight: '600' },
  actions: { padding: 18, borderRadius: 20, backgroundColor: colors.greenSoft, gap: 8 },
  sectionTitle: { color: colors.green, fontSize: 18, fontWeight: '800' },
  supportText: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  secondary: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 11, backgroundColor: '#fff' },
  secondaryText: { color: colors.green, fontSize: 12, fontWeight: '800' },
});
