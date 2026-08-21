import { z } from 'zod';

export const bookmarkSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  title: z.string().max(200, 'Title is too long').optional(),
  description: z.string().max(1000, 'Description is too long').nullable().optional(),
  notes: z.string().max(5000, 'Notes are too long').nullable().optional(),
  collectionId: z.string().uuid('Invalid collection').nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  isFavorite: z.boolean().optional(),
  readLater: z.boolean().optional(),
});

export type BookmarkFormValues = z.infer<typeof bookmarkSchema>;
