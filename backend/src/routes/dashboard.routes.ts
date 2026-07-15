import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/stats', getStats);

export default router;
