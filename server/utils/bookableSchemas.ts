import { z } from 'zod';

export const bookableSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(''),
});
