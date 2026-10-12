'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bookmark, MapPin, MessageCircle, MoreHorizontal, PawPrint } from 'lucide-react';
import type { FeedPost } from '@/lib/types/feed';

export function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return <article className="overflow-hidden rounded-[22px] border border-[#e0e7dc] bg-white shadow-[0_10px_30px_rgba(57,76,59,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(57,76,59,0.08)]">
    <Link href={`/post/${post.id}`} className="group relative block aspect-[1.55] overflow-hidden bg-[#edf1e8]" aria-label={`Ver publicación: ${post.title}`}>
      <img src={post.image} alt={post.imageAlt} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#3f613f] shadow-sm">{post.category}</span>
      <span className="absolute right-4 top-4 rounded-full bg-white/85 p-2 text-[#5e6e61] backdrop-blur-sm"><MoreHorizontal size={18} /></span>
    </Link>
    <div className="p-5">
      <div className="flex items-center gap-2.5"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${post.accent}`}>{post.author.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-xs font-bold text-[#314936]">{post.author} <span className="font-normal text-[#9ba79d]">· {post.role}</span></p><p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-[#8a978b]"><MapPin size={11} /> {post.location} <span className="px-0.5">·</span> {post.time}</p></div></div>
      <h2 className="mt-4 font-serif text-[23px] font-semibold leading-tight tracking-[-0.025em] text-[#2e4a36]">{post.title}</h2>
      <p className="mt-2 text-[13px] leading-6 text-[#718075]">{post.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-[#edf0eb] pt-3.5"><div className="flex items-center gap-1"><button type="button" aria-pressed={liked} onClick={() => setLiked(!liked)} className={`rounded-lg p-2 transition ${liked ? 'bg-[#f9e3d5] text-[#b65f36]' : 'text-[#869389] hover:bg-[#faf0e9] hover:text-[#b65f36]'}`} aria-label={liked ? 'Quitar reacción' : 'Reaccionar con huella'}><PawPrint size={16} fill={liked ? 'currentColor' : 'none'} /></button><button type="button" className="rounded-lg p-2 text-[#869389] transition hover:bg-[#f4f6f2] hover:text-[#3f613f]" aria-label="Ver comentarios"><MessageCircle size={16} /></button></div><button type="button" aria-pressed={saved} onClick={() => setSaved(!saved)} className={`rounded-lg p-2 transition ${saved ? 'text-[#b27733]' : 'text-[#9aa59b] hover:bg-[#f8f3e8] hover:text-[#b27733]'}`} aria-label={saved ? 'Quitar de guardados' : 'Guardar publicación'}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'} /></button></div>
    </div>
  </article>;
}
