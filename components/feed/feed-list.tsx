import { PostCard } from '@/components/posts/post-card';
import type { FeedPost } from '@/lib/types/feed';

export function FeedList({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) return <p className="rounded-2xl border border-dashed border-[#cfdacb] bg-white p-6 text-sm text-[#718075]">No hay ejemplos en esta categoría todavía.</p>;
  return <div className="grid gap-5 xl:grid-cols-2">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>;
}
