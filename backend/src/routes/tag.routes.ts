import { Router } from 'express';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tag.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate, createTagSchema, updateTagSchema } from '../validators/tag.validator';

const router = Router();

router.use(requireAuth);

router.get('/', getTags);
router.get('/:id', getTagById);
router.post('/', validate(createTagSchema), createTag);
router.put('/:id', validate(updateTagSchema), updateTag);
router.patch('/:id', validate(updateTagSchema), updateTag);
router.delete('/:id', deleteTag);

export default router;
