import Image from 'next/image';
import Link from 'next/link';

export function AppHeader() {
  return <header className="sticky top-0 z-40 border-b border-[#dce4d8] bg-[#fbfaf7]/95 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12"><Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Animalia, inicio"><Image src="/icons/animalia-logo.png" alt="" width={44} height={44} priority className="rounded-xl bg-white object-contain p-1" /><span><span className="block font-serif text-[25px] font-semibold leading-none tracking-[-0.04em] text-[#2e4a36]">Animalia</span><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9b6c3d]">comunidad que cuida</span></span></Link><Link href="/login" className="rounded-xl border border-[#dce4d8] bg-white px-3.5 py-2 text-sm font-semibold text-[#3f613f] hover:bg-[#edf1e8]">Ingresar</Link></div></header>;
}
