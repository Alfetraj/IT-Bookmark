import { Router } from 'express';
import { getPublicCollection } from '../controllers/public.controller';

const router = Router();

// Unauthenticated public route
router.get('/collection/:token', getPublicCollection);

export default router;
