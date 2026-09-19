import { Router } from 'express';
import {
  uploadAttachment,
  listAttachments,
  deleteAttachment,
} from '../controllers/attachment.controller';
import { authenticate } from '../middlewares/auth';
import { upload } from '../config/multer';

const router = Router();

router.use(authenticate);

/**
 * Route nested di /api/tasks/:taskId/attachments
 * POST   /api/tasks/:taskId/attachments
 * GET    /api/tasks/:taskId/attachments
 */
export const taskAttachmentRoutes = Router({ mergeParams: true });
taskAttachmentRoutes.post('/', upload.single('file'), uploadAttachment);
taskAttachmentRoutes.get('/', listAttachments);

/**
 * Route /api/attachments/:id
 * DELETE /api/attachments/:id
 */
router.delete('/:id', deleteAttachment);

export default router;