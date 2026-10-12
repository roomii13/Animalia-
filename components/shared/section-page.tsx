import type { ReactNode } from 'react';

export function SectionPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <main className="min-h-[calc(100vh-150px)] px-4 py-7 sm:px-8 sm:py-10 lg:px-0"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a06b41]">{eyebrow}</p><h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em] text-[#2e4a36] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#718075]">{description}</p><div className="mt-6">{children}</div></div></main>;
}
