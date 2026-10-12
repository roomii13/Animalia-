import { Card, Notice, PageHeading, Screen } from '../../src/ui';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme';

export default function MessagesScreen() {
  return <Screen>
    <PageHeading eyebrow="Comunidad" title="Mensajes" detail="Conversaciones relacionadas con avisos y actividades." />
    <Card><View style={styles.icon}><Text style={styles.emoji}>✉</Text></View><Text style={styles.title}>Mensajería en preparación</Text><Text style={styles.copy}>Las conversaciones todavía no se sincronizan. Por ahora, no se envían mensajes desde Animalia.</Text></Card>
    <Notice>Los avisos del feed ya se guardan en Neon. El chat se habilitará en una próxima etapa.</Notice>
  </Screen>;
}

const styles = StyleSheet.create({ icon: { width: 54, height: 54, borderRadius: 16, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, emoji: { color: colors.green, fontSize: 27 }, title: { color: colors.green, fontSize: 18, fontWeight: '800' }, copy: { color: colors.muted, fontSize: 13, lineHeight: 20 } });
