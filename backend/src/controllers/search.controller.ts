import { Request, Response } from 'express';
import { searchService } from '../services/search.service';

const getUserId = (req: Request): string | null => {
  return (req as any).user?.userId || (req as any).user?.id || null;
};

export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query parameter "q" is required' });
      return;
    }

    const results = await searchService.globalSearch(userId, q);
    res.status(200).json(results);
  } catch (error: any) {
    console.error('Error during global search:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
