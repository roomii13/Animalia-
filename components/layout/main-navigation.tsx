import Link from 'next/link';
import { Compass, Home, MessageCircle, Plus, UserRound } from 'lucide-react';

const links = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/explore', label: 'Explorar', icon: Compass },
  { href: '/post/new', label: 'Publicar', icon: Plus },
  { href: '/messages', label: 'Mensajes', icon: MessageCircle },
  { href: '/profile/edit', label: 'Perfil', icon: UserRound },
];

export function MainNavigation() {
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dce4d8] bg-[#fbfaf7]/95 px-2 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] backdrop-blur-xl lg:sticky lg:top-[73px] lg:bottom-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <div className="mx-auto flex max-w-md items-end justify-between lg:max-w-none lg:justify-start lg:gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition hover:bg-[#edf1e8] hover:text-[#3f613f] lg:flex-row lg:gap-2 lg:px-3 lg:py-2.5 lg:text-sm ${label === 'Publicar' ? 'bg-[#3f613f] text-white shadow-[0_4px_12px_rgba(63,97,63,0.2)] lg:bg-transparent lg:text-[#708174] lg:shadow-none' : 'text-[#708174]'}`}
          >
            <Icon size={label === 'Publicar' ? 21 : 19} strokeWidth={2.2} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
