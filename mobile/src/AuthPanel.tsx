import { useState } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import { ActionButton, Card, Notice, PageHeading, Pill, Screen } from './ui';
import { colors } from './theme';
import { useAuth } from './auth';

export function AuthPanel({ mode }: { mode: 'login' | 'register' | 'reset' }) {
  const heading = mode === 'login' ? 'Te damos la bienvenida' : mode === 'register' ? 'Sumate a Animalia' : 'Recuperar acceso';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountType, setAccountType] = useState<'person' | 'rescue_organization'>('person');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, register } = useAuth();

  const submit = async () => {
    if (mode === 'reset') {
      Alert.alert('Recuperación pendiente', 'La recuperación por correo estará disponible al configurar el servicio de email.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') await signIn(email.trim(), password);
      else await register(displayName, email.trim(), password, accountType);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('No se pudo continuar', error instanceof Error ? error.message : 'Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return <Screen>
    <PageHeading eyebrow="Comunidad Animalia" title={heading} detail="Una cuenta te ayudará a participar de forma segura en la comunidad." />
    <Notice>{mode === 'reset' ? 'La recuperación de contraseña requiere configurar el envío de correo.' : 'Tu cuenta y tus avisos se guardan de forma segura en Animalia.'}</Notice>
    <Card>
      {mode === 'register' ? <><Text style={field.label}>Nombre</Text><TextInput value={displayName} onChangeText={setDisplayName} autoCapitalize="words" placeholder="Tu nombre o el de la organización" style={field.input} /><Text style={field.label}>Tipo de cuenta</Text><Pill label="Persona" selected={accountType === 'person'} onPress={() => setAccountType('person')} /><Pill label="Organización de rescate" selected={accountType === 'rescue_organization'} onPress={() => setAccountType('rescue_organization')} /></> : null}
      <Text style={field.label}>Correo electrónico</Text><TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="nombre@correo.com" style={field.input} />
      {mode !== 'reset' ? <><Text style={field.label}>Contraseña</Text><TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Al menos 8 caracteres" style={field.input} /></> : null}
      <ActionButton label={submitting ? 'Conectando…' : mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Enviar instrucciones'} onPress={() => { void submit(); }} />
      {mode === 'login' ? <Link href="/(auth)/reset-password" style={field.link}>¿Olvidaste tu contraseña?</Link> : null}
      {mode === 'login' ? <Link href="/(auth)/register" style={field.link}>Crear una cuenta</Link> : <Link href="/(auth)/login" style={field.link}>Volver al inicio de sesión</Link>}
    </Card>
  </Screen>;
}

const field = {
  label: { color: colors.green, fontSize: 13, fontWeight: '800' as const },
  input: { minHeight: 48, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: '#fff', color: colors.ink, fontSize: 14, marginBottom: 4 } as const,
  link: { color: colors.green, fontSize: 13, fontWeight: '800' as const, textAlign: 'center' as const, paddingVertical: 4 },
};
