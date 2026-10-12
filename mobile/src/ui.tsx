import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={styles.content}>{children}</View>}
    </SafeAreaView>
  );
}

export function Brand({ subtitle = 'Comunidad que cuida' }: { subtitle?: string }) {
  return (
    <View style={styles.brand}>
      <Image source={require('../assets/animalia-icon.png')} style={styles.logo} accessibilityLabel="Logo de Animalia" />
      <View><Text style={styles.brandName}>Animalia</Text><Text style={styles.brandSubtitle}>{subtitle}</Text></View>
    </View>
  );
}

export function PageHeading({ eyebrow, title, detail }: { eyebrow?: string; title: string; detail?: string }) {
  return <View style={styles.heading}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}<Text style={styles.title}>{title}</Text>{detail ? <Text style={styles.detail}>{detail}</Text> : null}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ActionButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, pressed && styles.pressed]}><Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text></Pressable>;
}

export function Pill({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole={onPress ? 'button' : undefined} style={[styles.pill, selected && styles.pillSelected]}><Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text></Pressable>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <View style={styles.notice}><Text style={styles.noticeText}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', resizeMode: 'contain' },
  brandName: { color: colors.green, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  brandSubtitle: { color: '#9b6c3d', fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  heading: { gap: 6, marginTop: 4 },
  eyebrow: { color: '#9b6c3d', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.green, fontSize: 29, fontWeight: '800', lineHeight: 35, letterSpacing: -0.8 },
  detail: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  card: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.card, gap: 9 },
  button: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, backgroundColor: colors.green },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  buttonSecondary: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  buttonSecondaryText: { color: colors.green },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  pill: { borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 9 },
  pillSelected: { borderColor: colors.green, backgroundColor: colors.green },
  pillText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  pillTextSelected: { color: '#fff' },
  notice: { padding: 13, borderWidth: 1, borderColor: '#efd9b4', borderRadius: 14, backgroundColor: colors.sand },
  noticeText: { color: '#735b3d', fontSize: 12, lineHeight: 18 },
});
