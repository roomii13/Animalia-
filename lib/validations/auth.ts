import { z } from 'zod';

export const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  accountType: z.enum(['person', 'rescue_organization']).default('person'),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});
