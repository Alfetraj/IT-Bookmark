import { z } from 'zod';

export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name cannot exceed 50 characters'),
  color: z.string().optional().nullable(),
});

export type TagFormValues = z.infer<typeof tagSchema>;
