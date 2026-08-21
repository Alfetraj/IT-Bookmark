import { Request, Response } from 'express';
import { collectionService } from '../services/collection.service';

const getUserId = (req: Request): string | null => {
  return (req as any).user?.userId || (req as any).user?.id || null;
};

const getParamId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const collections = await collectionService.getUserCollections(userId);
    res.status(200).json(collections);
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const collection = await collectionService.getCollectionById(id, userId);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found or access denied' });
      return;
    }

    res.status(200).json(collection);
  } catch (error: any) {
    console.error('Error fetching collection by ID:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const collection = await collectionService.createCollection(userId, req.body);
    res.status(201).json(collection);
  } catch (error: any) {
    console.error('Error creating collection:', error);
    res.status(400).json({ error: error.message || 'Failed to create collection' });
  }
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const collection = await collectionService.updateCollection(id, userId, req.body);
    if (!collection) {
      res.status(404).json({ error: 'Collection not found or access denied' });
      return;
    }

    res.status(200).json(collection);
  } catch (error: any) {
    console.error('Error updating collection:', error);
    res.status(400).json({ error: error.message || 'Failed to update collection' });
  }
};

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const deleted = await collectionService.deleteCollection(id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Collection not found or access denied' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Sharing & Collaboration Endpoints
export const generateShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const token = await collectionService.generateShareLink(id, userId);
    res.status(200).json({ shareToken: token });
  } catch (error: any) {
    res.status(error.message === 'Forbidden' ? 403 : 500).json({ error: error.message });
  }
};

export const revokeShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    await collectionService.revokeShareLink(id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.message === 'Forbidden' ? 403 : 500).json({ error: error.message });
  }
};

export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const members = await collectionService.getMembers(id, userId);
    res.status(200).json(members);
  } catch (error: any) {
    res.status(error.message === 'Not found' ? 404 : 500).json({ error: error.message });
  }
};

export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const { targetUserId, role } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    await collectionService.addMember(id, userId, targetUserId, role || 'viewer');
    res.status(201).send();
  } catch (error: any) {
    res.status(error.message.startsWith('Forbidden') ? 403 : 500).json({ error: error.message });
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const targetUserId = Array.isArray(req.params.targetUserId) ? req.params.targetUserId[0] : req.params.targetUserId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    await collectionService.removeMember(id, userId, targetUserId);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.message === 'Forbidden' ? 403 : 500).json({ error: error.message });
  }
};

export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);
    const targetUserId = Array.isArray(req.params.targetUserId) ? req.params.targetUserId[0] : req.params.targetUserId;
    const { role } = req.body;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    await collectionService.updateMemberRole(id, userId, targetUserId, role);
    res.status(200).send();
  } catch (error: any) {
    res.status(error.message === 'Forbidden' ? 403 : 500).json({ error: error.message });
  }
};
