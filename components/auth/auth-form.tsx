import { RoleSelector } from '@/components/auth/role-selector';

type AuthMode = 'login' | 'register' | 'reset-password';

const copy: Record<AuthMode, { title: string; description: string; fields: string[]; button: string }> = {
  login: { title: 'Qué bueno verte', description: 'Ingresá para continuar en la comunidad.', fields: ['Correo electrónico', 'Contraseña'], button: 'Ingresar' },
  register: { title: 'Sumate a Animalia', description: 'Creá una cuenta para compartir y acompañar.', fields: ['Nombre', 'Correo electrónico', 'Contraseña'], button: 'Crear cuenta' },
  'reset-password': { title: 'Recuperar acceso', description: 'Ingresá tu correo para iniciar la recuperación.', fields: ['Correo electrónico'], button: 'Enviar instrucciones' },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const content = copy[mode];
  return (
    <section className="w-full max-w-md rounded-3xl border border-[#e0e7dc] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a06b41]">Comunidad Animalia</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-[#2e4a36]">{content.title}</h1>
      <p className="mt-2 text-sm leading-6 text-[#718075]">{content.description}</p>
      <form className="mt-6 space-y-4">
        {content.fields.map((field) => <label key={field} className="block text-sm font-semibold text-[#526957]">{field}<input required type={field === 'Contraseña' ? 'password' : field === 'Correo electrónico' ? 'email' : 'text'} autoComplete={field === 'Contraseña' ? mode === 'login' ? 'current-password' : 'new-password' : field === 'Correo electrónico' ? 'email' : 'name'} className="mt-1.5 w-full rounded-xl border border-[#dce4d8] bg-[#fffefa] px-3.5 py-3 font-normal outline-none focus:border-[#7f9d79] focus:ring-2 focus:ring-[#7f9d79]/20" /></label>)}
        {mode === 'register' ? <RoleSelector /> : null}
        <button disabled type="button" className="w-full cursor-not-allowed rounded-xl bg-[#a9b8a3] px-4 py-3 text-sm font-bold text-white">{content.button} · en preparación</button>
      </form>
      <p className="mt-4 text-xs leading-5 text-[#8a978b]">El acceso se habilitará al conectar la base de datos y el servicio de autenticación.</p>
    </section>
  );
}
