import { Router } from 'express';
import {
  getBookmarks,
  getBookmarkById,
  getBookmarkReader,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  rearchiveBookmark,
  getBookmarkArchiveStatus,
  bulkOperation,
} from '../controllers/bookmark.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  validate,
  createBookmarkSchema,
  updateBookmarkSchema,
  bulkOperationSchema,
} from '../validators/bookmark.validator';

const router = Router();

router.use(requireAuth);

// Bulk operations
router.post('/bulk', validate(bulkOperationSchema), bulkOperation);

// Collection of bookmarks
router.get('/', getBookmarks);
router.post('/', validate(createBookmarkSchema), createBookmark);

// Individual bookmark
router.get('/:id', getBookmarkById);
router.put('/:id', validate(updateBookmarkSchema), updateBookmark);
router.patch('/:id', validate(updateBookmarkSchema), updateBookmark);
router.delete('/:id', deleteBookmark);

// Bookmark reader content
router.get('/:id/reader', getBookmarkReader);

// Bookmark archive management
router.post('/:id/archive', rearchiveBookmark);
router.put('/:id/archive', rearchiveBookmark);
router.get('/:id/archive', getBookmarkArchiveStatus);

export default router;
