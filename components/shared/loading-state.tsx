export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return <p role="status" className="rounded-xl bg-white p-5 text-center text-sm text-[#718075]">{label}</p>;
}
