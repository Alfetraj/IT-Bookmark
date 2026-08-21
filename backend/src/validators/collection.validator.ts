import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').nullable().optional(),
  isPublic: z.boolean().optional(),
  parentId: z.string().uuid('Invalid parent ID format').nullable().optional(),
  color: z.string().optional(),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name is too long').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').nullable().optional(),
  isPublic: z.boolean().optional(),
  parentId: z.string().uuid('Invalid parent ID format').nullable().optional(),
  color: z.string().optional(),
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
