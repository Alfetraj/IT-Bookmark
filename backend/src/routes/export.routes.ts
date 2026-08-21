import { Router } from 'express';
import { exportBookmarks } from '../controllers/export.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', exportBookmarks);

export default router;
