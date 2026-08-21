import { Router } from 'express';
import {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  generateShareLink,
  revokeShareLink,
  getMembers,
  addMember,
  removeMember,
  updateMemberRole
} from '../controllers/collection.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getCollections);
router.post('/', createCollection);

router.get('/:id', getCollectionById);
router.patch('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Sharing
router.post('/:id/share', generateShareLink);
router.delete('/:id/share', revokeShareLink);

// Collaboration
router.get('/:id/members', getMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:targetUserId', removeMember);
router.patch('/:id/members/:targetUserId', updateMemberRole);

export default router;
