export function MessageBubble({ body, sent = false, time }: { body: string; sent?: boolean; time?: string }) {
  return <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${sent ? 'ml-auto rounded-br-sm bg-[#3f613f] text-white' : 'rounded-bl-sm bg-white text-[#526957] shadow-sm'}`}><p>{body}</p>{time ? <time className={`mt-1 block text-right text-[10px] ${sent ? 'text-white/70' : 'text-[#9ba79d]'}`}>{time}</time> : null}</div>;
}
