import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
