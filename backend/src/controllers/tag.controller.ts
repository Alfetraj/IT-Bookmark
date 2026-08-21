import { Request, Response } from 'express';
import { tagService } from '../services/tag.service';

const getUserId = (req: Request): string | null => {
  return (req as any).user?.userId || (req as any).user?.id || null;
};

const getParamId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tags = await tagService.getUserTags(userId);
    res.status(200).json(tags);
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getTagById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tag = await tagService.getTagById(id, userId);
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.status(200).json(tag);
  } catch (error: any) {
    console.error('Error fetching tag by ID:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tag = await tagService.createTag(userId, req.body);
    res.status(201).json(tag);
  } catch (error: any) {
    console.error('Error creating tag:', error);
    res.status(400).json({ error: error.message || 'Failed to create tag' });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tag = await tagService.updateTag(id, userId, req.body);
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.status(200).json(tag);
  } catch (error: any) {
    console.error('Error updating tag:', error);
    res.status(400).json({ error: error.message || 'Failed to update tag' });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const deleted = await tagService.deleteTag(id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
