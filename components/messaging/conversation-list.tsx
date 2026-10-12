import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export function ConversationList() {
  return <EmptyState title="Todavía no hay conversaciones" description="Cuando haya mensajes, vas a encontrarlos acá." icon={<MessageCircle size={20} />} />;
}
