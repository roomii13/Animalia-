import { SectionPage } from '@/components/shared/section-page';

const sections = [
  ['Qué información tratamos', 'Cuenta: nombre visible, correo, tipo de cuenta y nombre de usuario generado. Perfil: biografía y localidad si se agregan. Avisos: categoría, título, descripción y datos opcionales del animal y localidad. También tratamos avisos guardados, cuentas bloqueadas, denuncias (motivo y contenido o perfil denunciado), sesión e historial de aportes (importe, destino, estado e identificadores técnicos). Las contraseñas se guardan como hash; no se reciben fotos, ubicación GPS ni hay mensajería operativa en la versión actual.'],
  ['Para qué la usamos', 'Usamos esta información para crear y proteger cuentas, mostrar perfiles y avisos públicos, guardar avisos, gestionar bloqueos y denuncias, iniciar aportes voluntarios y conciliar su estado. No vendemos datos ni usamos publicidad personalizada.'],
  ['Pagos', 'Al iniciar un aporte, Animalia comparte con Mercado Pago la información necesaria para crear y vincular la operación, como importe, destino y correo de la cuenta. El pago ocurre en el entorno de Mercado Pago. Animalia no solicita ni almacena números de tarjeta, códigos de seguridad ni claves bancarias.'],
  ['Proveedores', 'Cloudflare presta alojamiento y servicios de red; Neon Postgres aloja cuentas, perfiles, avisos y operaciones; Mercado Pago interviene al pagar. Los proveedores pueden procesar información fuera de Argentina conforme a sus políticas.'],
  ['Visibilidad y conservación', 'Avisos publicados y datos de perfil mostrados junto a ellos son públicos. Guardados, credenciales y el historial de aportes no se muestran en el feed. Conservamos los datos mientras la cuenta esté activa y sean necesarios para los fines informados. La función de eliminación de cuenta aún debe implementarse dentro de la app y desde una página externa antes de publicar.'],
  ['Derechos y contacto', 'Se podrán solicitar acceso, corrección o supresión de datos. El correo público para privacidad todavía debe definirse y agregarse antes de publicar esta política. Responsable del proyecto: Romina Celis · Animalia · La Pampa, Argentina.'],
];

export default function PrivacyPage() {
  return <SectionPage eyebrow="Borrador para revisión" title="Política de privacidad" description="Última actualización: 16 de octubre de 2026. Antes de publicar en Google Play, se debe completar un correo de contacto y habilitar solicitudes de eliminación de cuenta dentro de la app y desde un recurso externo.">
    <div className="space-y-5 rounded-2xl border border-[#dce4d8] bg-white p-5 text-sm leading-6 text-[#47574b] sm:p-8">
      <p>Animalia es una aplicación móvil comunitaria para publicar y consultar avisos de adopción responsable, animales perdidos, rescates, pedidos de ayuda y actividades de bienestar animal.</p>
      {sections.map(([title, copy]) => <section key={title}><h2 className="mb-1 font-semibold text-[#31563a]">{title}</h2><p>{copy}</p></section>)}
      <p><strong>Contacto de privacidad:</strong> [PENDIENTE: agregar un correo público de contacto].</p>
      <p>Esta política se actualizará si cambian las funciones, proveedores o prácticas de datos. Ningún sistema conectado a Internet puede garantizar seguridad absoluta.</p>
    </div>
  </SectionPage>;
}
