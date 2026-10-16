import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { Card, PageHeading, Screen } from '../src/ui';
import { colors } from '../src/theme';

const guidelines = [
  ['Priorizar el bienestar animal', 'Compartí información veraz y evitá acciones que pongan en riesgo a un animal o a una persona.'],
  ['Adopción responsable', 'La adopción requiere diálogo, compromiso y condiciones adecuadas para el cuidado a largo plazo.'],
  ['Cuidar los datos personales', 'No publiques direcciones privadas, teléfonos de terceros ni información sensible sin autorización.'],
  ['Denunciar y bloquear', 'Desde un aviso o perfil podés denunciar contenido o bloquear una cuenta. Los reportes se envían a moderación; bloquear oculta sus avisos entre ambas cuentas.'],
  ['Colaboración transparente', 'Los pedidos de ayuda y aportes deberán explicar su propósito y cómo se rendirán.'],
];

export default function LegalScreen() {
  return <Screen><PageHeading eyebrow="Convivencia" title="Cuidemos este espacio" detail="Principios iniciales para una comunidad respetuosa y responsable." />{guidelines.map(([title, copy]) => <Card key={title}><Text style={styles.title}>{title}</Text><Text style={styles.copy}>{copy}</Text></Card>)}<Card><Text style={styles.title}>Privacidad</Text><Text style={styles.copy}>Consultá qué datos trata Animalia y cómo se usan.</Text><Pressable accessibilityRole="link" onPress={() => { void Linking.openURL('https://animalia.rom-cel.workers.dev/legal/privacy.html'); }}><Text style={styles.link}>Leer política de privacidad</Text></Pressable></Card></Screen>;
}

const styles = StyleSheet.create({ title: { color: colors.green, fontSize: 15, fontWeight: '800' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20 }, link: { color: colors.green, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline', paddingVertical: 6 } });
