import { StyleSheet, Text } from 'react-native';
import { Card, Notice, PageHeading, Screen } from '../../src/ui';
import { colors } from '../../src/theme';

export default function AdminDashboardScreen() {
  return <Screen>
    <PageHeading eyebrow="Administración" title="Panel de comunidad" detail="Herramientas previstas para moderación, cuidado y transparencia." />
    <Notice>Panel de muestra: no hay cuentas, datos ni acciones administrativas conectadas.</Notice>
    {[['Revisión de avisos', 'La moderación se definirá antes de abrir la comunidad.'], ['Reportes de seguridad', 'Los reportes deberán tener seguimiento y criterios claros.'], ['Aportes solidarios', 'No hay pagos activos ni movimientos registrados.']].map(([title, detail]) => <Card key={title}><Text style={styles.title}>{title}</Text><Text style={styles.detail}>{detail}</Text></Card>)}
  </Screen>;
}

const styles = StyleSheet.create({ title: { color: colors.green, fontSize: 16, fontWeight: '800' }, detail: { color: colors.muted, fontSize: 13, lineHeight: 19 } });
