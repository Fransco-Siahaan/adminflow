import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import commentRoutes from './comment.routes';
import attachmentRoutes from './attachment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/attachments', attachmentRoutes);

export default router;