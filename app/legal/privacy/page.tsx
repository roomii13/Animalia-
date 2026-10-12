import { SectionPage } from '@/components/shared/section-page';

export default function PrivacyPage() {
  return <SectionPage eyebrow="Aviso preliminar" title="Privacidad" description="La página informativa no solicita datos personales. En las pruebas de la app, el servicio puede recibir nombre visible, correo, tipo de cuenta y contenido de los avisos; las contraseñas se guardan como hash y las sesiones se guardan mediante tokens protegidos. Los datos se alojan en Neon Postgres para probar cuentas y publicaciones. Animalia publicará una política completa y canales de contacto antes de distribuir la app al público." />;
}
