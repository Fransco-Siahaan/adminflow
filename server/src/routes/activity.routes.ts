import { Router } from 'express';
import { listActivities } from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/activities
 * @desc    List semua aktivitas (role-based)
 * @access  Private
 */
router.get('/', listActivities);

export default router;