import { Router } from 'express';
import { listAllAttachments } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/attachments
 * @desc    List semua attachment (role-based)
 * @access  Private
 */
router.get('/', listAllAttachments);

export default router;