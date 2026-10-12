import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { AnimalPost } from './data';
import { apiRequest } from './api';

type FeedResponse = { posts: AnimalPost[] };

export function useFeed() {
  const [posts, setPosts] = useState<AnimalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    void apiRequest<FeedResponse>('/api/posts')
      .then(({ posts: latest }) => { if (active) setPosts(latest); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los avisos.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return { posts, loading, error };
}
