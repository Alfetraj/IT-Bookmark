import { Request, Response } from 'express';
import { bookmarkService, DuplicateUrlError } from '../services/bookmark.service';

const getUserId = (req: Request): string | null => {
  return (req as any).user?.userId || (req as any).user?.id || null;
};

const getParamId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      collection_id,
      collectionId,
      tag_id,
      tagId,
      tag,
      is_favorite,
      isFavorite,
      pinnedOnly,
      read_later,
      readLater,
      is_archived,
      isArchived,
      archive_status,
      archiveStatus,
      q,
      searchQuery,
      searchQueryString,
      sort,
      page,
      limit,
      cursor,
    } = req.query;

    const rawCollectionId = collectionId !== undefined ? collectionId : collection_id;
    const rawTagId = tagId !== undefined ? tagId : tag_id;
    const rawIsFavorite = isFavorite !== undefined ? isFavorite : (pinnedOnly !== undefined ? pinnedOnly : is_favorite);
    const rawReadLater = readLater !== undefined ? readLater : read_later;
    const rawIsArchived = isArchived !== undefined ? isArchived : is_archived;
    const rawArchiveStatus = archiveStatus !== undefined ? archiveStatus : archive_status;
    const rawSearchQuery = searchQuery !== undefined ? searchQuery : (searchQueryString !== undefined ? searchQueryString : q);

    const filters = {
      collectionId: rawCollectionId !== undefined ? (String(rawCollectionId) === '' ? null : String(rawCollectionId)) : undefined,
      tagId: rawTagId !== undefined ? String(rawTagId) : undefined,
      tag: tag !== undefined ? String(tag) : undefined,
      isFavorite: rawIsFavorite !== undefined ? String(rawIsFavorite) === 'true' : undefined,
      readLater: rawReadLater !== undefined ? String(rawReadLater) === 'true' : undefined,
      isArchived: rawIsArchived !== undefined ? String(rawIsArchived) === 'true' : undefined,
      archiveStatus: rawArchiveStatus ? (String(rawArchiveStatus) as 'pending' | 'success' | 'failed') : undefined,
      searchQuery: rawSearchQuery ? String(rawSearchQuery) : undefined,
      sort: sort !== undefined ? String(sort) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      cursor: cursor ? String(cursor) : undefined,
    };

    const result = await bookmarkService.getUserBookmarks(userId, filters);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getBookmarkById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookmark = await bookmarkService.getBookmarkById(id, userId);
    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found or access denied' });
      return;
    }

    res.status(200).json(bookmark);
  } catch (error: any) {
    console.error('Error fetching bookmark by ID:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getBookmarkReader = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookmark = await bookmarkService.getBookmarkById(id, userId);
    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    if (bookmark.archiveStatus === 'pending') {
      res.status(202).json({ error: 'Archive is still pending' });
      return;
    }

    if (bookmark.archiveStatus === 'failed') {
      res.status(422).json({ error: 'Archive processing failed' });
      return;
    }

    const reader = await bookmarkService.getBookmarkReader(id, userId);
    if (!reader || !reader.content) {
      res.status(404).json({ error: 'Readable content unavailable for this bookmark' });
      return;
    }

    res.status(200).json(reader);
  } catch (error: any) {
    console.error('Error fetching bookmark reader content:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookmark = await bookmarkService.createBookmark(userId, req.body);
    res.status(201).json(bookmark);
  } catch (error: any) {
    if (error instanceof DuplicateUrlError || error.name === 'DuplicateUrlError') {
      res.status(409).json({
        error: error.message,
        existingBookmarkId: error.existingBookmarkId,
      });
      return;
    }
    console.error('Error creating bookmark:', error);
    res.status(400).json({ error: error.message || 'Failed to create bookmark' });
  }
};

export const updateBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookmark = await bookmarkService.updateBookmark(id, userId, req.body);
    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found or access denied' });
      return;
    }

    res.status(200).json(bookmark);
  } catch (error: any) {
    if (error instanceof DuplicateUrlError || error.name === 'DuplicateUrlError') {
      res.status(409).json({
        error: error.message,
        existingBookmarkId: error.existingBookmarkId,
      });
      return;
    }
    if (error.message?.startsWith('Forbidden')) {
      res.status(403).json({ error: error.message });
      return;
    }
    console.error('Error updating bookmark:', error);
    res.status(400).json({ error: error.message || 'Failed to update bookmark' });
  }
};

export const deleteBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const deleted = await bookmarkService.deleteBookmark(id, userId);
    if (!deleted) {
      res.status(404).json({ error: 'Bookmark not found or access denied' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    if (error.message?.startsWith('Forbidden')) {
      res.status(403).json({ error: error.message });
      return;
    }
    console.error('Error deleting bookmark:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const rearchiveBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await bookmarkService.rearchiveBookmark(id, userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error re-archiving bookmark:', error);
    res.status(error.message === 'Bookmark not found' ? 404 : 500).json({
      error: error.message || 'Failed to re-archive bookmark',
    });
  }
};

export const getBookmarkArchiveStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const id = getParamId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const bookmark = await bookmarkService.getBookmarkById(id, userId);
    if (!bookmark) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    res.status(200).json({
      bookmarkId: bookmark.id,
      archiveStatus: bookmark.archiveStatus,
      screenshotPath: bookmark.screenshotPath,
      pdfPath: bookmark.pdfPath,
      hasReadability: !!bookmark.readabilityContent,
      updatedAt: bookmark.updatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching bookmark archive status:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const bulkOperation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { bookmarkIds, action, payload } = req.body;
    const result = await bookmarkService.bulkUpdate(userId, bookmarkIds, action, payload);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in bulk operation:', error);
    res.status(400).json({ error: error.message || 'Failed to perform bulk operation' });
  }
};
