import { Request, Response } from 'express';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // In the future, this will aggregate actual database counts
    // using Prisma based on req.user.id
    res.status(200).json({
      totalBookmarks: 0,
      totalCollections: 0,
      totalTags: 0,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
