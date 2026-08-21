import { Router } from 'express';
import multer from 'multer';
import { importBookmarks } from '../controllers/import.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// P0-SEC-001: Enforce 10MB file size limit to prevent memory exhaustion
const IMPORT_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMPORT_FILE_SIZE_LIMIT,
  },
});

router.use(requireAuth);

router.post('/', upload.single('file'), importBookmarks);

export default router;
