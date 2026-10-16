import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Screen } from '../../src/ui';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/auth';

type ModerationReport = {
  id: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reason: string;
  details: string | null;
  created_at: string;
  post_id: string | null;
  reported_profile_id: string | null;
  post_title: string | null;
  post_status: string | null;
  reporter_username: string;
  reported_username: string | null;
  reported_display_name: string | null;
};

const reasonLabels: Record<string, string> = {
  inappropriate_content: 'Contenido inapropiado',
  animal_welfare: 'Maltrato o riesgo para un animal',
  spam_or_fraud: 'Spam o posible fraude',
  personal_information: 'Datos personales expuestos',
  other: 'Otro motivo',
};

export default function AdminDashboardScreen() {
  const { profile, authenticatedRequest } = useAuth();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadReports = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      setError('Iniciá sesión con una cuenta moderadora para revisar reportes.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await authenticatedRequest<{ reports: ModerationReport[] }>('/api/admin/reports');
      setReports(result.reports);
    } catch (reason) {
      const status = reason && typeof reason === 'object' && 'status' in reason ? Number(reason.status) : 0;
      setError(status === 403
        ? 'Esta cuenta no está habilitada para moderar. Configurá MODERATOR_EMAILS en el Worker de Cloudflare con el correo de la cuenta moderadora.'
        : reason instanceof Error ? reason.message : 'No se pudieron cargar las denuncias.');
    } finally {
      setLoading(false);
    }
  }, [profile, authenticatedRequest]);

  useFocusEffect(useCallback(() => { void loadReports(); }, [loadReports]));

  const updateReport = (report: ModerationReport, status: 'reviewing' | 'resolved' | 'dismissed', removePost = false) => {
    const confirm = () => {
      setBusyId(report.id);
      void authenticatedRequest(`/api/admin/reports/${encodeURIComponent(report.id)}`, {
        method: 'PATCH', body: JSON.stringify({ status, removePost }),
      }).then(() => loadReports())
        .catch((reason: unknown) => Alert.alert('No se pudo actualizar', reason instanceof Error ? reason.message : 'Intentá de nuevo.'))
        .finally(() => setBusyId(''));
    };
    if (removePost) {
      Alert.alert('¿Retirar este aviso?', 'Dejará de mostrarse a la comunidad. Esta acción se puede revisar desde la base de datos.', [
        { text: 'Cancelar', style: 'cancel' }, { text: 'Retirar aviso', style: 'destructive', onPress: confirm },
      ]);
    } else confirm();
  };

  return <Screen>
    <PageHeading eyebrow="Moderación" title="Denuncias de la comunidad" detail="Revisá avisos y perfiles denunciados, y tomá una acción de moderación." />
    <Notice>Las denuncias se revisan de forma privada. Solo las cuentas incluidas en MODERATOR_EMAILS pueden acceder a este panel.</Notice>
    {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Cargando denuncias" /> : null}
    {error ? <Notice>{error}</Notice> : null}
    {!loading && !error && reports.length === 0 ? <Notice>No hay denuncias pendientes.</Notice> : null}
    {reports.map((report) => <Card key={report.id}>
      <Text style={styles.title}>{report.post_title ? `Aviso: ${report.post_title}` : `Perfil: ${report.reported_display_name ?? report.reported_username ?? 'cuenta eliminada'}`}</Text>
      <Text style={styles.detail}>Motivo: {reasonLabels[report.reason] ?? report.reason} · Estado: {report.status}</Text>
      <Text style={styles.detail}>Reportado por @{report.reporter_username}{report.reported_username ? ` · Cuenta @${report.reported_username}` : ''}</Text>
      {report.details ? <Text style={styles.detail}>Detalle: {report.details}</Text> : null}
      <Text style={styles.detail}>Recibida: {new Date(report.created_at).toLocaleString()}</Text>
      {report.status === 'open' ? <ActionButton label={busyId === report.id ? 'Actualizando…' : 'Marcar en revisión'} secondary onPress={() => updateReport(report, 'reviewing')} /> : null}
      {report.status !== 'resolved' && report.status !== 'dismissed' ? <>
        {report.post_id && report.post_status !== 'removed' ? <ActionButton label="Retirar aviso y resolver" onPress={() => updateReport(report, 'resolved', true)} /> : null}
        <ActionButton label="Resolver sin retirar" secondary onPress={() => updateReport(report, 'resolved')} />
        <ActionButton label="Descartar denuncia" secondary onPress={() => updateReport(report, 'dismissed')} />
      </> : null}
    </Card>)}
  </Screen>;
}

const styles = StyleSheet.create({ title: { color: colors.green, fontSize: 16, fontWeight: '800' }, detail: { color: colors.muted, fontSize: 13, lineHeight: 19 } });
