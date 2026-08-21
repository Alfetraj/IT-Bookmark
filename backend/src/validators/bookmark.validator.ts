import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createBookmarkSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  title: z.string().max(300, 'Title is too long').optional(),
  name: z.string().max(300, 'Name is too long').optional(),
  description: z.string().max(2000, 'Description is too long').nullable().optional(),
  notes: z.string().max(10000, 'Notes are too long').nullable().optional(),
  collectionId: z.string().uuid('Invalid collection ID').nullable().optional(),
  collection: z.object({
    id: z.string().uuid('Invalid collection ID').optional(),
    name: z.string().min(1).optional(),
  }).nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID')).optional(),
  tags: z.array(
    z.union([
      z.string().min(1),
      z.object({
        name: z.string().min(1),
        color: z.string().nullable().optional(),
      }),
    ])
  ).optional(),
  isFavorite: z.boolean().optional(),
  pinned: z.boolean().optional(),
  readLater: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const updateBookmarkSchema = z.object({
  url: z.string().min(1, 'URL is required').optional(),
  title: z.string().max(300, 'Title is too long').optional(),
  name: z.string().max(300, 'Name is too long').optional(),
  description: z.string().max(2000, 'Description is too long').nullable().optional(),
  notes: z.string().max(10000, 'Notes are too long').nullable().optional(),
  collectionId: z.string().uuid('Invalid collection ID').nullable().optional(),
  collection: z.object({
    id: z.string().uuid('Invalid collection ID').optional(),
    name: z.string().min(1).optional(),
  }).nullable().optional(),
  tagIds: z.array(z.string().uuid('Invalid tag ID')).optional(),
  tags: z.array(
    z.union([
      z.string().min(1),
      z.object({
        name: z.string().min(1),
        color: z.string().nullable().optional(),
      }),
    ])
  ).optional(),
  removePreviousTags: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  pinned: z.boolean().optional(),
  readLater: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const bulkOperationSchema = z.object({
  bookmarkIds: z.array(z.string().uuid('Invalid bookmark ID')).min(1, 'At least one bookmark ID is required'),
  action: z.enum([
    'delete',
    'favorite',
    'unfavorite',
    'read_later',
    'unread_later',
    'archive',
    'unarchive',
    'rearchive',
    'retry_archive',
    'move_collection',
    'add_tags',
    'remove_tags',
    'set_tags',
  ]),
  payload: z.object({
    tagIds: z.array(z.string().uuid('Invalid tag ID')).optional(),
    tags: z.array(
      z.union([
        z.string().min(1),
        z.object({
          name: z.string().min(1),
          color: z.string().nullable().optional(),
        }),
      ])
    ).optional(),
    collectionId: z.string().uuid('Invalid collection ID').nullable().optional(),
  }).optional(),
});

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
