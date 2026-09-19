import { Router } from 'express';
import {
  createComment,
  listComments,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { createCommentSchema } from '../validators/comment.validator';

const router = Router();

// Semua butuh login
router.use(authenticate);

/**
 * Route nested di /api/tasks/:taskId/comments (mount di task.routes)
 * POST   /api/tasks/:taskId/comments
 * GET    /api/tasks/:taskId/comments
 */
export const taskCommentRoutes = Router({ mergeParams: true });
taskCommentRoutes.post('/', validateBody(createCommentSchema), createComment);
taskCommentRoutes.get('/', listComments);

/**
 * Route /api/comments/:id
 * DELETE /api/comments/:id
 */
router.delete('/:id', deleteComment);

export default router;