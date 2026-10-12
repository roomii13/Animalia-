import { useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Notice, PageHeading, Pill, Screen } from '../../src/ui';
import { categories } from '../../src/data';
import { colors } from '../../src/theme';
import { useFeed } from '../../src/useFeed';

export default function ExploreScreen() {
  const [filter, setFilter] = useState('Todo');
  const { posts, loading, error } = useFeed();
  const results = useMemo(() => filter === 'Todo' ? posts : posts.filter((item) => item.category === filter), [filter]);
  return <Screen>
    <PageHeading eyebrow="Descubrir" title="Explorar avisos" detail="Filtrá por tipo y conocé las iniciativas de la comunidad." />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{categories.map((item) => <Pill key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />)}</ScrollView>
    <View style={styles.summary}><Text style={styles.summaryText}>{results.length} {results.length === 1 ? 'aviso' : 'avisos'}</Text><Text style={styles.summaryMark}>ⓘ</Text></View>
    {error ? <Notice>{error}</Notice> : null}
    {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Cargando avisos" /> : null}
    {!loading && !error && results.length === 0 ? <Card><Text style={styles.title}>No hay avisos para mostrar</Text><Text style={styles.description}>Probá con otro filtro o volvé más tarde.</Text></Card> : null}
    {results.map((post) => <Link key={post.id} href={{ pathname: '/post/[id]', params: { id: post.id } }} asChild><Pressable><Card><View style={[styles.icon, { backgroundColor: post.tint }]}><Text style={styles.emoji}>{post.emoji}</Text></View><Text style={styles.type}>{post.type}</Text><Text style={styles.title}>{post.title}</Text><Text style={styles.description}>{post.description}</Text><Text style={styles.location}>⌖  {post.location}</Text></Card></Pressable></Link>)}
  </Screen>;
}

const styles = StyleSheet.create({ filters: { gap: 8, paddingRight: 20 }, summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, summaryText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, summaryMark: { color: colors.green, fontSize: 18 }, icon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, emoji: { fontSize: 27 }, type: { color: '#9b6c3d', fontSize: 11, fontWeight: '800' }, title: { color: colors.green, fontSize: 17, fontWeight: '800' }, description: { color: colors.muted, fontSize: 13, lineHeight: 19 }, location: { color: colors.muted, fontSize: 11, fontWeight: '600' } });
