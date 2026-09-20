import { Router } from 'express';
import {
  uploadAttachment,
  listAttachments,
  deleteAttachment,
} from '../controllers/attachment.controller';
import { listAllAttachments } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth';
import { upload } from '../config/multer';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/attachments
 * @desc    List semua attachment (role-based)
 */
router.get('/', listAllAttachments);

/**
 * @route   DELETE /api/attachments/:id
 * @desc    Hapus attachment
 */
router.delete('/:id', deleteAttachment);

/**
 * Nested routes (dipasang di task.routes)
 * POST   /api/tasks/:taskId/attachments
 * GET    /api/tasks/:taskId/attachments
 */
export const taskAttachmentRoutes = Router({ mergeParams: true });
taskAttachmentRoutes.post('/', upload.single('file'), uploadAttachment);
taskAttachmentRoutes.get('/', listAttachments);

export default router;