import { z } from 'zod';

export const collectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  isPublic: z.boolean(),
  parentId: z.string().nullable().optional(),
  color: z.string().optional(),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;