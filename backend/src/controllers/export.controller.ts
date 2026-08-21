import { Request, Response } from 'express';
import { exportService } from '../services/export.service';
import { logger } from '../utils/logger';

const getUserId = (req: Request): string | null => {
  return (req as any).user?.userId || (req as any).user?.id || null;
};

export const exportBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const format = req.query.format as string;
    if (format !== 'html' && format !== 'json') {
      res.status(400).json({ error: 'Invalid format. Use html or json' });
      return;
    }

    const data = await exportService.getExportData(userId);

    if (format === 'json') {
      // Strip bookmark_tags join data from JSON export (already resolved to tagNames)
      const jsonData = {
        ...data,
        bookmarks: data.bookmarks.map((b) => {
          const { bookmark_tags, ...rest } = b as any;
          return rest;
        }),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="bookmarks_export.json"');
      res.status(200).send(JSON.stringify(jsonData, null, 2));
      return;
    }

    if (format === 'html') {
      const html = exportService.generateNetscapeHtml(data);
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.setHeader('Content-Disposition', 'attachment; filename="bookmarks_export.html"');
      res.status(200).send(html);
      return;
    }
  } catch (error: any) {
    logger.error('Error exporting bookmarks:', error);
    res.status(500).json({ error: error.message || 'Failed to export bookmarks' });
  }
};
