export function ErrorState({ message = 'No se pudo cargar esta información. Probá de nuevo más tarde.' }: { message?: string }) {
  return <p role="alert" className="rounded-xl border border-[#edd1c4] bg-[#fff8f4] p-5 text-sm text-[#94533c]">{message}</p>;
}
