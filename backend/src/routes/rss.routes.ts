import { Router } from 'express';
import { createSubscription, listSubscriptions, deleteSubscription } from '../controllers/rss.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', createSubscription);
router.get('/', listSubscriptions);
router.delete('/:id', deleteSubscription);

export default router;
