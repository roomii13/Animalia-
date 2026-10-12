import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Pill, Screen } from '../../src/ui';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/auth';

const types = ['Adopción', 'Animal perdido', 'Rescate', 'Pedido de ayuda', 'Actividad'];
const kindByType: Record<string, string> = { 'Adopción': 'adoption', 'Animal perdido': 'lost', 'Rescate': 'rescue', 'Pedido de ayuda': 'help', 'Actividad': 'event' };

export default function NewPostScreen() {
  const [type, setType] = useState(types[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [animalSpecies, setAnimalSpecies] = useState('');
  const [locality, setLocality] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { profile, loading, authenticatedRequest } = useAuth();

  const submit = async () => {
    if (loading || submitting) return;
    if (!profile) {
      Alert.alert('Iniciá sesión', 'Para publicar un aviso necesitamos asociarlo a una cuenta.', [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    if (!title.trim() || !description.trim()) {
      Alert.alert('Faltan datos', 'Completá el título y la descripción del aviso.');
      return;
    }
    setSubmitting(true);
    try {
      await authenticatedRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ kind: kindByType[type], title, description, animalName, animalSpecies, locality }),
      });
      Alert.alert('Aviso publicado', 'Ya está disponible para la comunidad.', [{ text: 'Listo', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('No se pudo publicar', error instanceof Error ? error.message : 'Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };
  return <Screen>
    <PageHeading eyebrow="Compartir con cuidado" title="Crear un aviso" detail="Completá los datos con información confirmada y respetuosa." />
    <Notice>Los avisos se guardan en la base de datos y aparecen en el feed de la comunidad.</Notice>
    <Card><Text style={styles.label}>Tipo de aviso</Text><View style={styles.types}>{types.map((item) => <Pill key={item} label={item} selected={type === item} onPress={() => setType(item)} />)}</View>
      <Text style={styles.label}>Título</Text><TextInput value={title} onChangeText={setTitle} placeholder="Ej.: Buscamos un hogar responsable" placeholderTextColor="#9aa69d" style={styles.input} maxLength={120} />
      <Text style={styles.label}>Descripción</Text><TextInput value={description} onChangeText={setDescription} multiline placeholder="Contá lo necesario para ayudar..." placeholderTextColor="#9aa69d" style={[styles.input, styles.multiline]} textAlignVertical="top" maxLength={3000} />
      <Text style={styles.label}>Nombre del animal (opcional)</Text><TextInput value={animalName} onChangeText={setAnimalName} placeholder="Ej.: Luna" placeholderTextColor="#9aa69d" style={styles.input} maxLength={100} />
      <Text style={styles.label}>Especie (opcional)</Text><TextInput value={animalSpecies} onChangeText={setAnimalSpecies} placeholder="Perro, gato…" placeholderTextColor="#9aa69d" style={styles.input} maxLength={40} />
      <Text style={styles.label}>Localidad (opcional)</Text><TextInput value={locality} onChangeText={setLocality} placeholder="Tu ciudad o barrio" placeholderTextColor="#9aa69d" style={styles.input} maxLength={120} />
      <Text style={styles.uploadText}>Las fotos se habilitarán al conectar el almacenamiento de imágenes.</Text>
    </Card>
    <ActionButton label={submitting ? 'Publicando…' : 'Publicar aviso'} onPress={() => { void submit(); }} />
  </Screen>;
}

const styles = StyleSheet.create({ types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, label: { color: colors.green, fontSize: 13, fontWeight: '800' }, input: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: '#fff', color: colors.ink, fontSize: 14 }, multiline: { minHeight: 115 }, uploadText: { color: colors.muted, fontSize: 11, lineHeight: 16 } });
