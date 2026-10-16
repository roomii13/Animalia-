import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Screen } from '../src/ui';
import { useAuth } from '../src/auth';
import { colors } from '../src/theme';

type Contribution = {
  id: string;
  amount: string;
  purpose: 'general' | 'pet_cemetery_land';
  currency: 'ARS';
  status: 'pending' | 'approved' | 'cancelled' | 'refunded' | 'review';
  createdAt: string;
};

const STATUS_LABELS: Record<Contribution['status'], string> = {
  pending: 'Pendiente de confirmación',
  approved: 'Acreditado',
  cancelled: 'Cancelado',
  refunded: 'Reintegrado',
  review: 'En revisión',
};

function newIdempotencyKey(): string {
  const randomPart = Array.from({ length: 4 }, () => Math.floor(Math.random() * 0x1_0000_0000).toString(16).padStart(8, '0')).join('');
  return `${Date.now()}-${randomPart}`;
}

export default function DonateScreen() {
  const { purpose: routePurpose } = useLocalSearchParams<{ purpose?: string }>();
  const { profile, loading: authLoading, authenticatedRequest } = useAuth();
  const [purpose, setPurpose] = useState<'general' | 'pet_cemetery_land'>(routePurpose === 'pet_cemetery_land' ? 'pet_cemetery_land' : 'general');
  const [amount, setAmount] = useState('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    setPurpose(routePurpose === 'pet_cemetery_land' ? 'pet_cemetery_land' : 'general');
    idempotencyKey.current = null;
  }, [routePurpose]);

  const normalizedAmount = amount.trim().replace(',', '.');
  const amountIsValid = /^\d+(?:\.\d{1,2})?$/.test(normalizedAmount)
    && !/^0+(?:\.0+)?$/.test(normalizedAmount);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setRefreshIndex((current) => current + 1);
    });
    return () => subscription.remove();
  }, []);

  useFocusEffect(useCallback(() => {
    if (!profile) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    void authenticatedRequest<{ contributions: Contribution[] }>('/api/payments')
      .then((result) => { if (active) setContributions(result.contributions); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo consultar el historial.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile, authenticatedRequest, refreshIndex]));

  const startContribution = async () => {
    if (submitting) return;
    if (!amountIsValid) {
      setError('Ingresá el importe que quieras aportar en pesos, con hasta dos decimales.');
      return;
    }
    idempotencyKey.current ??= newIdempotencyKey();
    setSubmitting(true);
    setError('');
    try {
      const result = await authenticatedRequest<{ contribution: Contribution; checkoutUrl: string }>('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body: JSON.stringify({ amount: normalizedAmount, purpose }),
      });
      idempotencyKey.current = null;
      setContributions((current) => [result.contribution, ...current.filter((item) => item.id !== result.contribution.id)]);
      await Linking.openURL(result.checkoutUrl);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar el aporte. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return <Screen>
    <PageHeading eyebrow="Aportes solidarios" title="Elegí qué iniciativa apoyar" detail="Elegí libremente el importe. El pago se procesa en Mercado Pago y queda asociado al destino que selecciones." />
    <View style={styles.options}>
      <Pressable accessibilityRole="radio" accessibilityState={{ checked: purpose === 'general' }} onPress={() => { setPurpose('general'); idempotencyKey.current = null; }} style={[styles.option, purpose === 'general' && styles.optionSelected]}>
        <Text style={styles.optionTitle}>Aportes generales a Animalia</Text>
        <Text style={styles.copy}>Para sostener las iniciativas comunitarias de bienestar y protección animal.</Text>
      </Pressable>
      <Pressable accessibilityRole="radio" accessibilityState={{ checked: purpose === 'pet_cemetery_land' }} onPress={() => { setPurpose('pet_cemetery_land'); idempotencyKey.current = null; }} style={[styles.option, purpose === 'pet_cemetery_land' && styles.optionSelected]}>
        <Text style={styles.optionTitle}>Terreno para el cementerio de mascotas</Text>
        <Text style={styles.copy}>Campaña para reunir fondos para comprar el terreno donde Animalia pueda construir un cementerio de mascotas.</Text>
      </Pressable>
    </View>
    {!profile && !authLoading ? <Card><Text style={styles.copy}>Iniciá sesión para realizar un aporte y consultar su estado.</Text><ActionButton label="Iniciar sesión" onPress={() => router.push('/(auth)/login')} /></Card> : null}
    {profile ? <>
      <Card>
        <Text style={styles.label}>Importe en pesos argentinos</Text>
        <View style={styles.amountField}><Text style={styles.currency}>$</Text><TextInput
          accessibilityLabel="Importe libre del aporte en pesos argentinos"
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="Escribí el importe que quieras"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
        /></View>
        <Text style={styles.copy}>{purpose === 'pet_cemetery_land' ? 'Tu aporte quedará identificado para la campaña de compra del terreno del cementerio de mascotas.' : 'Es un aporte general a Animalia, no destinado a una publicación o refugio en particular.'} Mercado Pago puede aplicar sus propias condiciones de pago.</Text>
        {error ? <Notice>{error}</Notice> : null}
        <ActionButton label={submitting ? 'Abriendo Mercado Pago…' : 'Continuar con Mercado Pago'} onPress={() => { void startContribution(); }} />
        {!amountIsValid && amount.length > 0 ? <Text style={styles.validation}>Ingresá un importe positivo con hasta dos decimales.</Text> : null}
      </Card>
      <Card>
        <View style={styles.historyHeading}><Text style={styles.sectionTitle}>Mis aportes</Text>{loading ? <ActivityIndicator color={colors.green} /> : null}</View>
        <ActionButton label="Actualizar estados" secondary onPress={() => setRefreshIndex((current) => current + 1)} />
        {!loading && contributions.length === 0 ? <Text style={styles.copy}>Todavía no hay aportes en tu cuenta.</Text> : null}
        {contributions.map((contribution) => <View key={contribution.id} style={styles.contribution}>
          <Text style={styles.copy}>{contribution.purpose === 'pet_cemetery_land' ? 'Campaña del cementerio de mascotas' : 'Aporte general a Animalia'}</Text>
          <Text style={styles.contributionAmount}>ARS {contribution.amount}</Text>
          <Text style={styles.copy}>{STATUS_LABELS[contribution.status] ?? 'Estado en actualización'}</Text>
        </View>)}
      </Card>
    </> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  options: { gap: 10 },
  option: { padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.card, gap: 6 },
  optionSelected: { borderColor: colors.green, borderWidth: 2 },
  optionTitle: { color: colors.green, fontSize: 15, fontWeight: '800' },
  label: { color: colors.green, fontSize: 14, fontWeight: '800' },
  amountField: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: colors.paper },
  currency: { color: colors.green, fontSize: 20, fontWeight: '800' },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 9, color: colors.ink, fontSize: 16 },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  validation: { color: '#a33f2e', fontSize: 12 },
  historyHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.green, fontSize: 16, fontWeight: '800' },
  contribution: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 11, gap: 3 },
  contributionAmount: { color: colors.ink, fontSize: 14, fontWeight: '800' },
});
