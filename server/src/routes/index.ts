import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import commentRoutes from './comment.routes';
import attachmentRoutes from './attachment.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';
import activityRoutes from './activity.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/activities', activityRoutes);

export default router;