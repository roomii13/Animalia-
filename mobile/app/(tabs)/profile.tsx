import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Card, Notice, PageHeading, Screen } from '../../src/ui';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/auth';

export default function ProfileScreen() {
  const { profile, loading, signOut } = useAuth();
  return <Screen>
    <PageHeading eyebrow="Tu cuenta" title="Perfil" detail="Tu identidad y tus acciones dentro de la comunidad." />
    {profile ? <Card><View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>🐾</Text></View><View style={styles.names}><Text style={styles.name}>{profile.displayName}</Text><Text style={styles.handle}>@{profile.username}</Text></View></View><Text style={styles.bio}>{profile.bio || (profile.accountType === 'rescue_organization' ? 'Organización de rescate Animalia.' : 'Sumate a la comunidad de bienestar animal.')}</Text>{profile.locality ? <Text style={styles.handle}>⌖  {profile.locality}</Text> : null}<ActionButton label="Editar perfil" onPress={() => router.push('/profile/edit')} /><ActionButton label="Cerrar sesión" secondary onPress={() => { void signOut(); }} /></Card> : <Card><View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>🐾</Text></View><View style={styles.names}><Text style={styles.name}>{loading ? 'Cargando cuenta…' : 'Participá en Animalia'}</Text><Text style={styles.handle}>Cuenta personal o de organización</Text></View></View><ActionButton label="Iniciar sesión" onPress={() => router.push('/(auth)/login')} /><ActionButton label="Crear cuenta" secondary onPress={() => router.push('/(auth)/register')} /></Card>}
    <Card><Text style={styles.menuTitle}>Tu comunidad</Text><Link href="/saved" style={styles.menu}>Avisos guardados  ›</Link><Link href="/messages" style={styles.menu}>Mensajes  ›</Link>{profile ? <Link href={{ pathname: '/profile/[username]', params: { username: profile.username } }} style={styles.menu}>Ver perfil público  ›</Link> : null}<Link href="/legal" style={styles.menu}>Normas de cuidado  ›</Link><Link href="/admin/dashboard" style={styles.menu}>Acceso de administración  ›</Link></Card>
    {!profile && !loading ? <Notice>Registrate para crear avisos y guardarlos en tu cuenta.</Notice> : null}
  </Screen>;
}

const styles = StyleSheet.create({ profile: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 58, height: 58, borderRadius: 19, backgroundColor: '#f7eadb', alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 30 }, names: { gap: 3 }, name: { color: colors.green, fontSize: 17, fontWeight: '800' }, handle: { color: colors.muted, fontSize: 12 }, bio: { color: colors.muted, fontSize: 13, lineHeight: 19 }, menuTitle: { color: colors.green, fontSize: 16, fontWeight: '800', marginBottom: 5 }, menu: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 13, color: colors.ink, fontSize: 13, fontWeight: '600' } });
