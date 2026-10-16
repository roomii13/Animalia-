import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './auth';
import { colors } from './theme';

const reasons = [
  ['inappropriate_content', 'Contenido inapropiado'],
  ['animal_welfare', 'Maltrato o riesgo para un animal'],
  ['spam_or_fraud', 'Spam o posible fraude'],
  ['personal_information', 'Datos personales expuestos'],
  ['other', 'Otro motivo'],
] as const;

type Props = { username: string; postId?: string; onBlocked?: () => void };

export function SafetyActions({ username, postId, onBlocked }: Props) {
  const { profile, authenticatedRequest } = useAuth();
  const [blocked, setBlocked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    if (!profile) {
      setBlocked(false);
      return () => { active = false; };
    }
    void authenticatedRequest<{ blockedProfiles: Array<{ username: string }> }>('/api/blocks')
      .then(({ blockedProfiles }) => { if (active) setBlocked(blockedProfiles.some((item) => item.username === username)); })
      .catch(() => { if (active) setBlocked(false); });
    return () => { active = false; };
  }, [profile?.id, username, authenticatedRequest, profile]);

  if (!username || profile?.username === username) return null;

  const requireAccount = () => {
    if (profile) return true;
    Alert.alert('Iniciá sesión', 'Necesitás una cuenta para denunciar o bloquear.', [
      { text: 'Ahora no', style: 'cancel' },
      { text: 'Iniciar sesión', onPress: () => router.push('/(auth)/login') },
    ]);
    return false;
  };

  const sendReport = async (reason: (typeof reasons)[number][0]) => {
    if (!requireAccount() || submitting) return;
    setSubmitting(true);
    try {
      await authenticatedRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify(postId ? { postId, reason } : { username, reason }),
      });
      setReportOpen(false);
      Alert.alert('Denuncia enviada', 'Quedó registrada en la cola de moderación. Gracias por ayudar a cuidar la comunidad.');
    } catch (error) {
      Alert.alert('No se pudo enviar', error instanceof Error ? error.message : 'Intentá nuevamente más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBlock = () => {
    if (!requireAccount()) return;
    const nextBlocked = !blocked;
    Alert.alert(
      nextBlocked ? '¿Bloquear a esta cuenta?' : '¿Desbloquear a esta cuenta?',
      nextBlocked ? 'Sus avisos dejarán de aparecerte y tampoco verá los tuyos.' : 'Los avisos de esta cuenta podrán volver a aparecer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: nextBlocked ? 'Bloquear' : 'Desbloquear', style: nextBlocked ? 'destructive' : 'default', onPress: () => {
          void authenticatedRequest(`/api/blocks/${encodeURIComponent(username)}`, { method: nextBlocked ? 'POST' : 'DELETE' })
            .then(() => { setBlocked(nextBlocked); if (nextBlocked) onBlocked?.(); })
            .catch((error: unknown) => Alert.alert('No se pudo actualizar', error instanceof Error ? error.message : 'Intentá nuevamente.'));
        } },
      ],
    );
  };

  return <View style={styles.actions}>
    <Pressable accessibilityRole="button" onPress={() => { if (requireAccount()) setReportOpen(true); }} style={styles.action}>
      <Text style={styles.actionText}>{postId ? 'Denunciar aviso' : 'Denunciar perfil'}</Text>
    </Pressable>
    <Pressable accessibilityRole="button" onPress={toggleBlock} style={styles.action}>
      <Text style={[styles.actionText, styles.blockText]}>{blocked ? 'Desbloquear usuario' : 'Bloquear usuario'}</Text>
    </Pressable>
    <Modal visible={reportOpen} transparent animationType="fade" onRequestClose={() => setReportOpen(false)}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text accessibilityRole="header" style={styles.title}>¿Qué querés denunciar?</Text>
          <Text style={styles.copy}>Elegí el motivo que mejor describe el problema.</Text>
          {reasons.map(([value, label]) => <Pressable key={value} accessibilityRole="button" disabled={submitting} onPress={() => { void sendReport(value); }} style={styles.reason}>
            <Text style={styles.reasonText}>{label}</Text>
          </Pressable>)}
          <Pressable accessibilityRole="button" disabled={submitting} onPress={() => setReportOpen(false)} style={[styles.reason, styles.cancel]}>
            <Text style={styles.cancelText}>{submitting ? 'Enviando…' : 'Cancelar'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  actionText: { color: colors.green, fontSize: 12, fontWeight: '800' },
  blockText: { color: '#9b4238' },
  backdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#17231ccc' },
  dialog: { maxHeight: '85%', padding: 20, borderRadius: 22, backgroundColor: colors.paper, gap: 9 },
  title: { color: colors.green, fontSize: 19, fontWeight: '800' },
  copy: { marginBottom: 5, color: colors.muted, fontSize: 13, lineHeight: 19 },
  reason: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: '#fff' },
  reasonText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  cancel: { alignItems: 'center', borderColor: 'transparent', backgroundColor: colors.greenSoft },
  cancelText: { color: colors.green, fontSize: 13, fontWeight: '800' },
});
