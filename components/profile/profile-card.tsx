import { PawPrint } from 'lucide-react';

export function ProfileCard({ name, username, bio }: { name: string; username: string; bio?: string }) {
  return <section className="rounded-2xl border border-[#e0e7dc] bg-white p-5"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8efe3] text-[#547557]"><PawPrint size={22} /></span><div><h2 className="font-semibold text-[#314936]">{name}</h2><p className="text-sm text-[#8a978b]">@{username}</p></div></div><p className="mt-4 text-sm leading-6 text-[#718075]">{bio || 'Este perfil todavía no agregó una presentación.'}</p></section>;
}
