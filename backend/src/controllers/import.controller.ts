import { Request, Response } from 'express';
import { importService } from '../services/import.service';
import { logger } from '../utils/logger';

const getUserId = (req: Request): string | null => {
  return (req as any).user?.userId || (req as any).user?.id || null;
};

export const importBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const htmlContent = req.file.buffer.toString('utf-8');

    const result = await importService.importHtml(userId, htmlContent);

    res.status(200).json({
      message: `Import complete: ${result.bookmarksCreated} bookmarks created, ${result.bookmarksSkipped} skipped, ${result.collectionsCreated} collections created.`,
      data: result,
    });
  } catch (error: any) {
    // Handle multer file size limit error
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Import file exceeds the 10MB size limit.' });
      return;
    }

    logger.error('Error importing bookmarks:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
