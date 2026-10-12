import Link from 'next/link';
import type { ReactNode } from 'react';

export function EmptyState({ title, description, action, href, icon }: { title: string; description: string; action?: string; href?: string; icon?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-dashed border-[#cfdacb] bg-white/70 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8efe3] text-[#547557]">{icon}</div>
      <h2 className="mt-4 font-serif text-2xl font-semibold text-[#2e4a36]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718075]">{description}</p>
      {action && href ? <Link href={href} className="mt-5 inline-flex rounded-xl bg-[#3f613f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#315333]">{action}</Link> : null}
    </section>
  );
}
