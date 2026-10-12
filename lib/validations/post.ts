import { z } from 'zod';

export const postSchema = z.object({
  kind: z.enum(['adoption', 'lost', 'rescue', 'help', 'event']),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(3000),
  locality: z.string().trim().max(120).optional(),
});
